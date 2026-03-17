import fs from 'fs';
import path from 'path';

const srcDir = 'question/platform';
const destDir = 'apps/v3_eidos/public/history/v2_currisite/question/platform';

const publisherMap = {
    'HanLin': 'han_lin',
    'KangHsuan': 'kang_hsuan',
    'NanYi': 'nan_yi',
    'Nan_Yi': 'nan_yi',
    'Kang_Hsuan': 'kang_hsuan',
    'Han_Lin': 'han_lin'
};

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function processDirectory(currentSrc, currentDest) {
    const items = fs.readdirSync(currentSrc);

    items.forEach(item => {
        const srcPath = path.join(currentSrc, item);
        const destPath = path.join(currentDest, item);
        const stat = fs.statSync(srcPath);

        if (stat.isDirectory()) {
            ensureDir(destPath);
            processDirectory(srcPath, destPath);
        } else if (item.endsWith('.json')) {
            const data = JSON.parse(fs.readFileSync(srcPath, 'utf8'));

            // 如果已經是舊格式（有 meta），直接複製
            if (data.meta && data.questions) {
                fs.writeFileSync(destPath, JSON.stringify(data, null, 2));
                return;
            }

            // 如果是 manifest.json，直接複製
            if (item === 'manifest.json') {
                fs.writeFileSync(destPath, JSON.stringify(data, null, 2));
                return;
            }

            // 轉換為 v2 格式
            if (data.questions) {
                const gradeMatch = data.grade?.match(/\d/);
                const semesterMatch = data.semester?.match(/\d/);

                const v2Data = {
                    meta: {
                        grade: gradeMatch ? `grade_${gradeMatch[0]}` : 'grade_3',
                        semester: semesterMatch ? `semester_${semesterMatch[0]}` : 'semester_1',
                        subject: data.subject || 'Chinese',
                        publisher: publisherMap[data.publisher] || data.publisher?.toLowerCase() || 'kang_hsuan',
                        title: data.lesson_title || data.title || item.replace('.json', ''),
                        lesson: data.lesson_id || data.lesson || item.replace('.json', ''),
                        order: parseInt(data.lesson_id?.replace(/\D/g, '') || '1')
                    },
                    questions: data.questions
                };
                fs.writeFileSync(destPath, JSON.stringify(v2Data, null, 2));
                console.log(`Converted: ${destPath}`);
            }
        }
    });
}

ensureDir(destDir);
processDirectory(srcDir, destDir);
console.log('✅ v2 數據快照生成完畢！');
