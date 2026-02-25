const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    try {
        const contentStr = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(contentStr);
        if (!data.questions || !Array.isArray(data.questions)) return;

        let modified = false;

        // 洗牌每個問題內部的選項
        data.questions.forEach(q => {
            if (q.options && q.options.length === 4 && q.answer_index !== undefined) {
                const correctOption = q.options[q.answer_index];
                const newOptions = [...q.options];
                for (let i = newOptions.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [newOptions[i], newOptions[j]] = [newOptions[j], newOptions[i]];
                }
                const newAnswerIndex = newOptions.indexOf(correctOption);
                if (q.options.join('|') !== newOptions.join('|')) {
                    q.options = newOptions;
                    q.answer_index = newAnswerIndex;
                    modified = true;
                }
            }
        });

        // 檢查整體答案分佈，強制重新分配
        if (modified) {
            const total = data.questions.length;
            let requiresRebalance = true;

            if (requiresRebalance) {
                let targetCounts = [Math.floor(total / 4), Math.floor(total / 4), Math.floor(total / 4), Math.floor(total / 4)];
                let remainder = total % 4;
                for (let i = 0; i < remainder; i++) {
                    targetCounts[i]++;
                }
                let pool = [];
                for (let i = 0; i < 4; i++) {
                    for (let c = 0; c < targetCounts[i]; c++) {
                        pool.push(i);
                    }
                }
                for (let i = pool.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [pool[i], pool[j]] = [pool[j], pool[i]];
                }

                data.questions.forEach((q, index) => {
                    let assignedSlot = pool[index];
                    if (assignedSlot !== q.answer_index) {
                        let prevAnswerIndex = q.answer_index;
                        let temp = q.options[assignedSlot];
                        q.options[assignedSlot] = q.options[prevAnswerIndex];
                        q.options[prevAnswerIndex] = temp;
                        q.answer_index = assignedSlot;
                    }
                });
            }
        }

        if (modified) {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
            console.log(`Updated: ${filePath}`);
        }

    } catch (err) {
        console.error(`Error processing ${filePath}:`, err.message);
    }
}

function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            scanDir(fullPath);
        } else if (file.endsWith('.json') && !file.includes('manifest') && !file.includes('libraryStats')) {
            processFile(fullPath);
        }
    }
}

const targetDirs = [
    'question/platform/G3/Math/S2/KangHsuan',
    'question/platform/G3/Math/S2/NanYi',
    'question/platform/G3/Math/S2/HanLin'
];

targetDirs.forEach(dir => {
    const absDir = path.join(__dirname, '..', dir);
    if (fs.existsSync(absDir)) {
        console.log(`Scanning: ${absDir}`);
        scanDir(absDir);
    }
});
console.log('Shuffle complete.');
