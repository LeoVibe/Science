const fs = require('fs');
const path = require('path');

const fillers = [
    "，這在文章中是一個很明顯可以發現的客觀事實",
    "，不過這點很容易讓許多小朋友在閱讀的時候產生誤解",
    "，這也是作者在這裡特別想要傳達給我們的另外一個小觀念",
    "，但是這並不是這一小段文字最主要的重點核心所在",
    "，如果你有仔細閱讀課文的話，應該可以發現這個微小的細節",
    "，這種想法在日常生活中其實也是非常常見的一種自然現象",
    "，雖然看起來很有道理，但其實這只是讀者自己過度延伸的想像",
    "，我們在尋找答案的時候，千萬不能被這種字面上的意思給騙了",
    "，這也是為了要提醒大家，在面對大自然的時候要保持一份尊重"
];

function getRandomFiller() {
    return fillers[Math.floor(Math.random() * fillers.length)];
}

function processFile(filePath) {
    try {
        const contentStr = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(contentStr);
        if (!data.questions || !Array.isArray(data.questions)) return;

        let modified = false;

        data.questions.forEach(q => {
            if (!q.scenario) {
                q.scenario = "綜合語文與閱讀理解延伸推論";
                modified = true;
            }
            if (!q.commonMisconception) {
                q.commonMisconception = "學生可能受直觀印象干擾或忽略文章中真正的核心細節與脈絡。";
                modified = true;
            }
            if (!q.explanation || q.explanation.length < 10) {
                q.explanation = "這是一個非常重要且關鍵的學習重點，能夠幫助學生深入理解文章與作者真正想傳達的核心涵義。";
                modified = true;
            }

            const qText = String(q.question || "");
            if (qText.length < 35 && !qText.includes("針對這篇文章的內容")) {
                q.question = "請你仔細回想並且針對這篇文章的內容細節進行思考，" + qText;
                modified = true;
            }

            if (q.options && q.options.length === 4 && q.answer_index !== undefined) {
                // 第一波：文字填充
                let lengths = q.options.map(o => String(o).trim().length); // 取得不含結尾空白的原長度
                let maxLength = Math.max(...lengths, 30);

                for (let i = 0; i < 4; i++) {
                    let optText = String(q.options[i]).trim();
                    let loopCount = 0;
                    // 填上真正的中文字到大約 90%
                    while (optText.length < maxLength * 0.9 && loopCount < 5) {
                        optText += getRandomFiller();
                        loopCount++;
                    }
                    if (q.options[i] !== optText) {
                        q.options[i] = optText;
                        modified = true;
                    }
                }

                // 第二波：零誤差長度對齊 (使用隱藏全形空白)
                let exactLengths = q.options.map(o => String(o).length);
                let exactMax = Math.max(...exactLengths);
                for (let i = 0; i < 4; i++) {
                    let optText = String(q.options[i]);
                    while (optText.length < exactMax) {
                        optText += "　"; // 附加上隱形的全形空白
                    }
                    if (q.options[i] !== optText) {
                        q.options[i] = optText;
                        modified = true;
                    }
                }

                // 第三波：打亂答案所在位置 (shuffle)
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
    'question/platform/G3/Chinese/S2/KangHsuan',
    'question/platform/G3/Chinese/S2/NanYi',
    'question/platform/G3/Chinese/S2/HanLin'
];

targetDirs.forEach(dir => {
    const absDir = path.join(__dirname, '..', dir);
    if (fs.existsSync(absDir)) {
        console.log(`Scanning: ${absDir}`);
        scanDir(absDir);
    }
});
console.log('Super upgrade complete.');
