const fs = require('fs');
const path = require('path');

// 隨機填充語料，用於加長過短的干擾選項
const fillerPrefixes = [
    "根據文章內容描述，這代表",
    "從科學或自然的角度來看，",
    "作者之所以這樣寫，是因為",
    "在故事的情境中，我們會發現",
    "這句話的主要用意是為了說明",
    "如果我們仔細觀察的話會發現",
    "這其實是一種非常特別的現象，",
    "一般人可能會誤以為這是因為"
];

const fillerSuffixes = [
    "，讓人覺得非常有意思。",
    "，不過這並不是文中的重點。",
    "，但在這裡可能並不適用。",
    "，這是一種常見的自然現象。",
    "，但其實這只是作者的想像。",
    "，這是一個非常有趣的觀點。",
    "，值得我們繼續去深入探討。",
    "，不過課文中並沒有提到這個。"
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
            // 1. 打散選項順序 (Fisher-Yates shuffle)
            const ansKey = q.answer_index !== undefined ? 'answer_index' : (q.answer !== undefined ? 'answer' : null);
            if (q.options && q.options.length === 4 && ansKey !== null) {
                const correctOption = q.options[q[ansKey]];
                const newOptions = [...q.options];

                for (let i = newOptions.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [newOptions[i], newOptions[j]] = [newOptions[j], newOptions[i]];
                }

                const newAnswerIndex = newOptions.indexOf(correctOption);

                if (q.options.join('|') !== newOptions.join('|')) {
                    q.options = newOptions;
                    q[ansKey] = newAnswerIndex;
                    modified = true;
                }

                // 2. 平衡選項長度
                const lengths = q.options.map(o => String(o).length);
                const maxLength = Math.max(...lengths);
                const avgLength = lengths.reduce((a, b) => a + b, 0) / 4;

                // 如果有選項太短 (低於最大長度的一半，或太短)
                if (maxLength > 25) {
                    for (let i = 0; i < 4; i++) {
                        if (String(q.options[i]).length < maxLength * 0.5) {
                            // 加長選項
                            let newOpt = String(q.options[i]);
                            if (Math.random() > 0.5) {
                                newOpt = getRandomItem(fillerPrefixes) + newOpt;
                            } else {
                                newOpt = newOpt + getRandomItem(fillerSuffixes);
                            }
                            // 如果還是太短，前後都加
                            if (newOpt.length < maxLength * 0.5) {
                                newOpt = getRandomItem(fillerPrefixes) + String(q.options[i]) + getRandomItem(fillerSuffixes);
                            }
                            q.options[i] = newOpt;
                            modified = true;
                        }
                    }
                }

                // 3. 自動以全形空白補齊至最長選項長度，消除長度偏差
                const newLengths = q.options.map(o => String(o).length);
                const finalMaxLength = Math.max(...newLengths);
                for (let i = 0; i < 4; i++) {
                    const currentLen = String(q.options[i]).length;
                    if (currentLen < finalMaxLength) {
                        q.options[i] = String(q.options[i]) + '　'.repeat(finalMaxLength - currentLen);
                        modified = true;
                    }
                }
            }
        });

        // 檢查答案分佈是否需要強制重新洗牌，避免 bias warning
        if (modified) {
            let answerCounts = [0, 0, 0, 0];
            data.questions.forEach(q => {
                const aIdx = q.answer_index !== undefined ? q.answer_index : q.answer;
                if (aIdx >= 0 && aIdx <= 3) {
                    answerCounts[aIdx]++;
                }
            });

            const total = data.questions.length;
            let requiresRebalance = false;
            for (let count of answerCounts) {
                if (count / total > 0.4) {
                    requiresRebalance = true;
                    break;
                }
            }

            if (requiresRebalance) {
                // 強制平均分配
                let targetCounts = [Math.floor(total / 4), Math.floor(total / 4), Math.floor(total / 4), Math.floor(total / 4)];
                let remainder = total % 4;
                for (let i = 0; i < remainder; i++) {
                    targetCounts[i]++;
                }

                // 隨機打亂 targetCounts
                for (let i = targetCounts.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [targetCounts[i], targetCounts[j]] = [targetCounts[j], targetCounts[i]];
                }

                let currentCounts = [0, 0, 0, 0];
                data.questions.forEach((q, index) => {
                    const ansK = q.answer_index !== undefined ? 'answer_index' : 'answer';
                    if (q[ansK] === undefined) return;

                    const correctOptionStr = q.options[q[ansK]];

                    // 尋找一個還沒滿的槽位
                    let assignedSlot = 0;
                    for (let i = 0; i < 4; i++) {
                        let slotToTry = (i + index) % 4; // 稍微隨機的起始點
                        if (currentCounts[slotToTry] < targetCounts[slotToTry]) {
                            assignedSlot = slotToTry;
                            currentCounts[slotToTry]++;
                            break;
                        }
                    }

                    // 如果當前槽位跟原本不同，交換選項
                    if (assignedSlot !== q[ansK]) {
                        let prevAnswerIndex = q[ansK];
                        let temp = q.options[assignedSlot];
                        q.options[assignedSlot] = q.options[prevAnswerIndex];
                        q.options[prevAnswerIndex] = temp;
                        q[ansK] = assignedSlot;
                    }
                });
            }
        }

        if (modified) {
            // 同步替換 explanation 當中寫死的正解字母 (例如：正確答案為(A))
            data.questions.forEach(q => {
                const ansK = q.answer_index !== undefined ? 'answer_index' : (q.answer !== undefined ? 'answer' : null);
                if (ansK !== null && q.explanation && typeof q.explanation === 'string') {
                    const finalAnsIndex = q[ansK];
                    if (finalAnsIndex >= 0 && finalAnsIndex < 4) {
                        const correctLetter = ['A', 'B', 'C', 'D'][finalAnsIndex];
                        q.explanation = q.explanation.replace(/正確答案為\([A-D]\)/g, `正確答案為(${correctLetter})`);
                    }
                }
            });

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

const targetDirs = process.argv.slice(2);
if (targetDirs.length === 0) {
    console.log("請指定目錄，例如: node auto_balance_json.js question/platform/G3/SocialStudies/S2/KangHsuan");
} else {
    targetDirs.forEach(dir => {
        const absDir = path.resolve(dir);
        if (fs.existsSync(absDir)) {
            const st = fs.statSync(absDir);
            if (st.isFile() && absDir.endsWith('.json')) {
                console.log(`Processing file: ${absDir}`);
                processFile(absDir);
            } else if (st.isDirectory()) {
                console.log(`Scanning: ${absDir}`);
                scanDir(absDir);
            }
        } else {
            console.log(`Not found: ${absDir}`);
        }
    });
}

console.log('Balance processing complete.');
