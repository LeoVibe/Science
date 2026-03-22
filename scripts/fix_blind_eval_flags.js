const fs = require('fs');
const path = require('path');

const BASE_DIR = 'question/platform';
let fixedCount = 0;
let fileCount = 0;

function fixFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(content);
        if (!json.questions) return;

        let modified = false;

        json.questions.forEach(q => {
            // 如果 blind_evaluation 是 true，但是 verifying_model 卻不是 Gemini-2.5-Flash
            // 代表這是舊版的「模擬思考檢驗」被遷移腳本誤判出來的
            if (q.blind_evaluation === true && q.verifying_model !== "Gemini-2.5-Flash") {
                q.blind_evaluation = false;
                modified = true;
                fixedCount++;
            }
        });

        if (modified) {
            fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
            fileCount++;
            console.log(`🔧 修復檔案: ${path.basename(filePath)}`);
        }
    } catch (e) {
        console.error(`❌ ${filePath}: ${e.message}`);
    }
}

function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            scanDir(fullPath);
        } else if (entry.name.endsWith('.json') && !entry.name.includes('manifest')) {
            fixFile(fullPath);
        }
    }
}

console.log('==========================================');
console.log('🧹 修復錯誤的 blind_evaluation 標籤');
console.log('==========================================');

scanDir(BASE_DIR);

console.log(`\n🎉 修復完成！`);
console.log(`   - 修正的檔案數：${fileCount}`);
console.log(`   - 修正的題目數：${fixedCount}`);
