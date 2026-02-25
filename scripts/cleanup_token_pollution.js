/**
 * 題庫填充文字清理腳本
 * 用途：掃描 question/platform 下所有 JSON 題庫檔案，
 *       偵測並移除 AI 生成時產生的 token 填充汙染（大量無意義重複文字）。
 * 
 * 日期：2026-02-24
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PLATFORM_DIR = path.join(__dirname, '..', 'question', 'platform');

// 常見的填充文字片段（以中文為主）
const POLLUTION_FRAGMENTS = [
    '標記', '標註', '標誌', '標示', '標籤',
    '內容', '說明', '描述', '文字', '記錄', '紀錄',
    '資料', '背景', '敘述', '呈現', '展示', '分析',
    '數據', '展現', '摘要', '資訊', '成果', '結果',
    '記述', '展現力',
];

// 建立正規表示式：連續出現 3 個以上填充片段就視為汙染
const fragmentGroup = POLLUTION_FRAGMENTS.join('|');
const POLLUTION_REGEX = new RegExp(`(${fragmentGroup}){3,}[^"]*`, 'g');

// 也偵測連續重複的「標」字系列
const REPEAT_REGEX = new RegExp(`(標標[標註記誌示籤]{2,})+`, 'g');

let totalFilesScanned = 0;
let totalFilesCleaned = 0;
let totalOptionsCleaned = 0;
let cleanedFiles = [];

function cleanOption(text) {
    if (typeof text !== 'string') return { text, cleaned: false };

    let cleaned = text;
    let wasCleaned = false;

    // 移除填充文字
    const match = cleaned.match(POLLUTION_REGEX);
    if (match) {
        cleaned = cleaned.replace(POLLUTION_REGEX, '').trim();
        wasCleaned = true;
    }

    // 移除重複「標」字
    const repeatMatch = cleaned.match(REPEAT_REGEX);
    if (repeatMatch) {
        cleaned = cleaned.replace(REPEAT_REGEX, '').trim();
        wasCleaned = true;
    }

    // 清除尾部可能殘留的標點或空白
    cleaned = cleaned.replace(/[，。、；：\s]+$/, '').trim();

    // 如果清理後文字變得太短（< 2 字），可能過度清理了，標記警告
    if (wasCleaned && cleaned.length < 2) {
        console.warn(`  ⚠️  選項被清理後只剩 "${cleaned}"，可能需要人工檢查`);
    }

    return { text: cleaned, cleaned: wasCleaned };
}

function processFile(filePath) {
    totalFilesScanned++;

    try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        let data;
        try {
            data = JSON.parse(raw);
        } catch (e) {
            console.warn(`  ⚠️  無法解析 JSON: ${filePath}`);
            return;
        }

        // 支援兩種格式：陣列格式 [...] 與物件格式 { questions: [...] }
        let questions;
        let isArrayFormat = false;
        if (Array.isArray(data)) {
            questions = data;
            isArrayFormat = true;
        } else if (data.questions && Array.isArray(data.questions)) {
            questions = data.questions;
        } else {
            return; // 不是題庫檔案格式
        }

        let fileCleaned = false;
        let fileOptionsCleaned = 0;

        questions.forEach((q, qIdx) => {
            if (!q.options || !Array.isArray(q.options)) return;

            q.options.forEach((opt, optIdx) => {
                const result = cleanOption(opt);
                if (result.cleaned) {
                    q.options[optIdx] = result.text;
                    fileCleaned = true;
                    fileOptionsCleaned++;
                }
            });

            // 也檢查 question 本身
            if (q.question) {
                const qResult = cleanOption(q.question);
                if (qResult.cleaned) {
                    q.question = qResult.text;
                    fileCleaned = true;
                    fileOptionsCleaned++;
                }
            }

            // 檢查 explanation
            if (q.explanation) {
                const eResult = cleanOption(q.explanation);
                if (eResult.cleaned) {
                    q.explanation = eResult.text;
                    fileCleaned = true;
                    fileOptionsCleaned++;
                }
            }
        });

        if (fileCleaned) {
            const output = isArrayFormat ? data : data;
            fs.writeFileSync(filePath, JSON.stringify(output, null, 4) + '\n', 'utf-8');
            totalFilesCleaned++;
            totalOptionsCleaned += fileOptionsCleaned;
            const relPath = path.relative(PLATFORM_DIR, filePath);
            cleanedFiles.push({ path: relPath, count: fileOptionsCleaned });
            console.log(`  ✅ 已清理 ${relPath} (${fileOptionsCleaned} 處)`);
        }
    } catch (err) {
        console.error(`  ❌ 處理失敗: ${filePath} - ${err.message}`);
    }
}

function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walkDir(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.json') && !entry.name.includes('manifest')) {
            processFile(fullPath);
        }
    }
}

console.log('🧹 開始掃描題庫檔案...');
console.log(`   目錄: ${PLATFORM_DIR}\n`);

walkDir(PLATFORM_DIR);

console.log('\n' + '='.repeat(50));
console.log('📊 掃描結果統計');
console.log('='.repeat(50));
console.log(`   總掃描檔案數: ${totalFilesScanned}`);
console.log(`   受汙染檔案數: ${totalFilesCleaned}`);
console.log(`   清理欄位總數: ${totalOptionsCleaned}`);

if (cleanedFiles.length > 0) {
    console.log('\n📝 已清理檔案清單:');
    cleanedFiles.forEach(f => {
        console.log(`   - ${f.path} (${f.count} 處)`);
    });
}

console.log('\n✅ 清理完成！');
