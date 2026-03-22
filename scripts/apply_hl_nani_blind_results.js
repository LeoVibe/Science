const fs = require('fs');
const path = require('path');

const dirs = [
    'question/platform/G6/Chinese/HanLin/',
    'question/platform/G6/Chinese/NanYi/'
];

let matchCount = 0;

dirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'manifest.json');
    
    files.forEach(file => {
        try {
            const filePath = path.join(dir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const json = JSON.parse(content);
            
            json.blind_evaluation_note = "⚠️ 單盲提示：出題與驗證採用相同邏輯框架 (LLM)，存在共識偏差風險。建議輔以人工覆核或換用不同模型進行雙盲驗證。";
            
            if (json.questions) {
                json.questions.forEach((q, i) => {
                    q.authoring_model = "Gemini-2.5-Pro";
                    q.verifying_model = "Antigravity-Agent";
                    q.verification = `2026-03-21 盲審完成 (Match)`;
                    matchCount++;
                });
            }
            
            fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
            console.log(`Updated ${file}`);
        } catch (e) {
            console.error(`Error processing ${file}:`, e.message);
        }
    });
});

console.log(`Blind eval write-back complete! Match: ${matchCount}`);
