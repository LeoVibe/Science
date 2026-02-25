/**
 * shuffle_existing_json.js
 * 
 * 讀取現有題庫 JSON，對選項進行隨機洗牌並同步更新 answer_index。
 * 用於解決原始數據答案分佈不均的問題。
 */

const fs = require('fs');
const path = require('path');

/**
 * Fisher-Yates 洗牌算法
 */
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function processFile(filePath) {
    if (!fs.existsSync(filePath)) return;

    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!content.questions || !Array.isArray(content.questions)) return;

    let changed = false;
    content.questions.forEach(q => {
        // 放寬條件：只要有 options 且長度大於 0 就進行隨機化
        if (q.options && Array.isArray(q.options) && q.options.length > 0 && typeof q.answer_index === 'number') {
            const originalOptions = [...q.options];
            const correctOption = originalOptions[q.answer_index];

            // 建立包含原始索引的對象陣列
            const items = q.options.map((v, i) => ({ v, i }));
            shuffle(items);

            q.options = items.map(item => item.v);
            q.answer_index = items.findIndex(item => item.v === correctOption);
            changed = true;
        }
    });

    if (changed) {
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
        console.log(`  Processed & Shuffled: ${path.basename(filePath)}`);
    }
}

function scanDir(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanDir(fullPath);
        } else if (file.endsWith('.json') && file !== 'manifest.json') {
            processFile(fullPath);
        }
    });
}

// 取得命令列參數：指定的目錄路徑
const targetPath = process.argv[2];
if (!targetPath) {
    console.error("Usage: node scripts/shuffle_existing_json.js <directory_path>");
    process.exit(1);
}

const absolutePath = path.resolve(targetPath);
console.log(`🚀 Starting shuffle in: ${absolutePath}`);
scanDir(absolutePath);
console.log("✅ Shuffle complete.");
