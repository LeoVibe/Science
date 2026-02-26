import fs from 'fs';
import path from 'path';

const PLATFORM_DIR = path.join(process.cwd(), 'question', 'platform');

const publisherMap = {
    '康軒': 'KangHsuan',
    'kang_hsuan': 'KangHsuan',
    'KangHsuan': 'KangHsuan',
    '翰林': 'HanLin',
    'han_lin': 'HanLin',
    'HanLin': 'HanLin',
    '南一': 'NanYi',
    'nan_yi': 'NanYi',
    'NanYi': 'NanYi'
};

let updatedCount = 0;

function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanDir(fullPath);
        } else if (file.endsWith('.json')) {
            normalizeFile(fullPath);
        }
    }
}

function normalizeFile(filePath) {
    try {
        const contentStr = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(contentStr);
        let modified = false;

        // Check root publisher (if it exists directly, usually in manifest)
        if (data.publisher && publisherMap[data.publisher] && data.publisher !== publisherMap[data.publisher]) {
            data.publisher = publisherMap[data.publisher];
            modified = true;
        }

        // Check meta.publisher
        if (data.meta && data.meta.publisher && publisherMap[data.meta.publisher] && data.meta.publisher !== publisherMap[data.meta.publisher]) {
            data.meta.publisher = publisherMap[data.meta.publisher];
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
            updatedCount++;
        }
    } catch (err) {
        // Some CSV-converted JSONs or badly formatted files might throw errors
        console.error(`Error parsing ${filePath}:`, err.message);
    }
}

console.log('Starting normalization...');
scanDir(PLATFORM_DIR);
console.log(`Normalization complete. Updated ${updatedCount} files.`);
