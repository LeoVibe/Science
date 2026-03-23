const fs = require('fs');
const path = require('path');

const shortFillers = [
    "，對後世影響極其深遠",
    "，這是一項重要的認知",
    "，相關細節值得深思",
    "，展現了高度的智慧",
    "，符合當時的社經背景",
    "，是值得關注的重點",
    "，有助於提升公民素養",
    "，這在課本中有詳細說明",
    "，我們可以從中獲得啟發",
    "，這對於永續發展至關重要"
];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function processFile(filePath) {
    try {
        const contentStr = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(contentStr);
        if (!data.questions || !Array.isArray(data.questions)) return;

        let modified = false;

        data.questions.forEach(q => {
            const options = q.options;
            if (!options || options.length !== 4) return;

            const ansIndex = q.answer_index !== undefined ? q.answer_index : q.answer;
            if (ansIndex === undefined) return;

            // 1. 強力消除長度偏見 (G4.2: 強制非答案選項長於或等於答案)
            let currentCorrectLen = options[ansIndex].trim().length;
            let others = [0, 1, 2, 3].filter(i => i !== ansIndex);

            others.forEach(idx => {
                let optText = options[idx].trim();
                let loopCount = 0;
                // 強制讓干擾項追上或超越正確答案，或是達到一定長度
                while ((optText.length < currentCorrectLen || optText.length < 30) && loopCount < 8) {
                    optText += getRandomItem(shortFillers);
                    loopCount++;
                    modified = true;
                }
                options[idx] = optText;
            });

            // 2. 更新解釋內容 (修正字母偏見)
            const correctLetter = ['A', 'B', 'C', 'D'][ansIndex];
            if (q.explanation && typeof q.explanation === 'string') {
                const newExplanation = q.explanation.replace(/選項 [A-D]/g, `選項 ${correctLetter}`);
                if (q.explanation !== newExplanation) {
                    q.explanation = newExplanation;
                    modified = true;
                }
            }
        });

        if (modified) {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
            console.log(`[V4.2] 已強力平衡社會科題目: ${path.basename(filePath)}`);
        }
    } catch (err) {
        console.error(`Error: ${err.message}`);
    }
}

const targetFiles = process.argv.slice(2);
targetFiles.forEach(file => {
    const absPath = path.resolve(file);
    if (fs.existsSync(absPath)) {
        processFile(absPath);
    }
});
