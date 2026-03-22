/**
 * migrate_json_fields.js
 * 
 * 遷移腳本：統一題庫 JSON 的驗證欄位格式
 * 
 * 舊格式 → 新格式對照：
 *   verification: "2026-03-21 盲審完成 (Match)" → verifying_date: "2026-03-21"
 *   blind_evaluation_note: "⚠️ 雙盲提示..." → blind_evaluation: true
 *   authoring_model: 保留不動
 *   verifying_model: 保留不動
 *   新增 authoring_date (若缺少則補 null)
 * 
 * 最後更新：2026-03-22 01:30
 * 更新者：Antigravity
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = 'question/platform';

let totalFiles = 0;
let modifiedFiles = 0;
let totalQuestions = 0;
let modifiedQuestions = 0;

function migrateFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(content);
        if (!json.questions || json.questions.length === 0) return;

        totalFiles++;
        let fileModified = false;

        // 頂層：移除 blind_evaluation_note
        if (json.blind_evaluation_note !== undefined) {
            delete json.blind_evaluation_note;
            fileModified = true;
        }

        json.questions.forEach(q => {
            totalQuestions++;
            let qModified = false;

            // 1. verification → verifying_date (提取日期)
            if (q.verification !== undefined) {
                const dateMatch = String(q.verification).match(/(\d{4}-\d{2}-\d{2})/);
                q.verifying_date = dateMatch ? dateMatch[1] : null;
                delete q.verification;
                qModified = true;
            }

            // 2. blind_evaluation_note → blind_evaluation: true
            if (q.blind_evaluation_note !== undefined) {
                q.blind_evaluation = true;
                delete q.blind_evaluation_note;
                qModified = true;
            }

            // 3. 確保 blind_evaluation 欄位存在
            if (q.blind_evaluation === undefined && q.verifying_date) {
                q.blind_evaluation = true;
            }

            // 4. 補 authoring_date (若缺少)
            if (q.authoring_date === undefined && q.authoring_model) {
                q.authoring_date = null;
            }

            if (qModified) modifiedQuestions++;
            if (qModified) fileModified = true;
        });

        if (fileModified) {
            fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
            modifiedFiles++;
            console.log(`✅ ${path.relative(BASE_DIR, filePath)}`);
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
            migrateFile(fullPath);
        }
    }
}

console.log('==========================================');
console.log('🔄 JSON 欄位格式統一遷移工具');
console.log('==========================================');

scanDir(BASE_DIR);

console.log(`\n📊 遷移結果：`);
console.log(`   掃描檔案: ${totalFiles}`);
console.log(`   修改檔案: ${modifiedFiles}`);
console.log(`   掃描題目: ${totalQuestions}`);
console.log(`   修改題目: ${modifiedQuestions}`);
