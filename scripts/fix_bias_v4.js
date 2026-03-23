const fs = require('fs');
const path = require('path');

const longFillers = [
    "，這反映了當時社會背景下多樣化的價值觀與發展趨勢",
    "，在探討這類全球性議題時，我們必須具備更宏觀的視野與關懷",
    "，雖然這看起來像是一個簡單的現象，背後卻隱藏著複雜的歷史脈絡",
    "，這也是現代公民在面對未來挑戰時，需要具備的核心素養之一"
];

const shortFillers = [
    "，對後世影響極其深遠",
    "，這是一項重要的認知",
    "，相關細節值得深思",
    "，展現了高度的智慧",
    "，符合當時的社經背景",
    "，是值得關注的重點"
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

            // 1. 徹底打亂位置 (首先消除位置偏見)
            const correctOptionStr = options[ansIndex];
            const originalOptions = [...options];
            for (let i = options.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [options[i], options[j]] = [options[j], options[i]];
            }
            const newAnswerIndex = options.indexOf(correctOptionStr);
            if (ansIndex !== newAnswerIndex) {
                if (q.answer_index !== undefined) q.answer_index = newAnswerIndex;
                else q.answer = newAnswerIndex;
                modified = true;
            }

            // 2. 實用字數加長 (解決長度偏見)
            let lengths = options.map(o => String(o).trim().length);
            let maxLength = Math.max(...lengths);

            for (let i = 0; i < 4; i++) {
                let optText = options[i].trim();
                let loopCount = 0;
                // 如果落後最大長度超過 5 個字，就加料
                while (optText.length < maxLength - 3 && loopCount < 5) {
                    const diff = maxLength - optText.length;
                    let filler = "";
                    if (diff > 15) {
                        filler = getRandomItem(longFillers);
                    } else {
                        filler = getRandomItem(shortFillers);
                    }
                    optText += filler;
                    loopCount++;
                    // 加完後若是全場最長，就更新 maxLength 讓其他人也跟上
                    if (optText.length > maxLength) maxLength = optText.length;
                    modified = true;
                }
                options[i] = optText;
            }

            // 3. 確保結尾無多餘空白，由 evaluate 工具決定後續
            options.forEach((opt, idx) => {
                options[idx] = opt.trim();
            });
        });

        if (modified) {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
            console.log(`[V4.1] 已優化社會科題目內容平衡: ${path.basename(filePath)}`);
        }
    } catch (err) {
        console.error(`Error: ${err.message}`);
    }
}

const targetDirs = process.argv.slice(2);
targetDirs.forEach(dir => {
    const absDir = path.resolve(dir);
    if (fs.existsSync(absDir)) {
        fs.readdirSync(absDir).forEach(file => {
            if (file.endsWith('.json') && !file.includes('manifest')) {
                processFile(path.join(absDir, file));
            }
        });
    }
});
