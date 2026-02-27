import fs from 'fs';
import path from 'path';

const rootDir = '/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject';
const platformDir = path.join(rootDir, 'question/platform');
const sourceOldDir = path.join(rootDir, 'apps/v2_currisite/public/questions/platform');

const subjectMap = {
    'Chinese': '國語',
    'Math': '數學',
    'English': '英文',
    'Science': '自然',
    'SocialStudies': '社會',
    'Life': '生活'
};

const publisherMap = {
    'KangHsuan': '康軒',
    'NanYi': '南一',
    'HanLin': '翰林'
};

let syncCount = 0;
let skipCount = 0;

function sync(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);

    if (files.includes('manifest.json')) {
        const relativePath = dir.replace(platformDir, '');
        const parts = relativePath.split(path.sep).filter(Boolean); // G3, Chinese, S1, NanYi

        if (parts.length === 4) {
            const [grade, subject, semester, publisher] = parts;
            const manifestPath = path.join(dir, 'manifest.json');
            let items = [];
            try {
                const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                items = manifest.items || manifest.units || manifest.manifest || [];
            } catch (e) {
                console.error(`[Error] Failed to parse manifest in ${relativePath}`);
                return;
            }

            const oldSubject = subjectMap[subject] || subject;
            const oldPublisher = publisherMap[publisher] || publisher;
            const oldDir = path.join(sourceOldDir, grade, oldSubject, semester, oldPublisher);

            if (fs.existsSync(oldDir)) {
                items.forEach(item => {
                    if (item.file) {
                        const targetPath = path.join(dir, item.file);
                        const sourcePath = path.join(oldDir, item.file);

                        if (!fs.existsSync(targetPath)) {
                            if (fs.existsSync(sourcePath)) {
                                fs.copyFileSync(sourcePath, targetPath);
                                console.log(`[Sync] Copied ${item.file} to ${relativePath}`);
                                syncCount++;
                            } else {
                                console.warn(`[Warn] Missing source file: ${sourcePath}`);
                            }
                        } else {
                            skipCount++;
                        }
                    }
                });
            } else {
                console.warn(`[Warn] Old directory not found: ${oldDir}`);
            }
        }
    }

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            sync(fullPath);
        }
    });
}

console.log('Starting synchronization...');
sync(platformDir);
console.log('--- Sync Summary ---');
console.log(`Files synchronized: ${syncCount}`);
console.log(`Files skipped (already exist): ${skipCount}`);
console.log('Synchronization complete.');
