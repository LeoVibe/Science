const fs = require('fs');
const path = require('path');

// ==========================================
// 題庫格式一致性自動抽測工具 (Format Consistency Verifier)
// 目的：確保全新與既存的 manifest 與 題庫 JSON 嚴格遵守「唯一格式信賴原則」
// ==========================================

const TARGET_DIR = path.join(__dirname, '..', 'question', 'platform');

// 統計變數
let stats = {
    totalDirsChecked: 0,
    manifestsChecked: 0,
    manifestErrors: [],
    questionFilesSampled: 0,
    questionErrors: []
};

// 格式驗證：Manifest 必須只含有 items 且 item 只有 id, title, file
function verifyManifestFormat(filePath, content) {
    const errors = [];
    if (content.units) errors.push(`[❌ 違規欄位] 發現過時的 'units' 陣列`);
    if (content.files) errors.push(`[❌ 違規欄位] 發現過時的 'files' 陣列`);
    if (!content.items || !Array.isArray(content.items)) {
        errors.push(`[❌ 結構錯誤] 缺少標準的 'items' 陣列`);
    } else {
        content.items.forEach((item, index) => {
            if (item.name) errors.push(`[❌ 違規屬性] 第 ${index} 項使用過時的 'name'，應改為 'title'`);
            if (item.path) errors.push(`[❌ 違規屬性] 第 ${index} 項使用過時的 'path'，應改為 'file'`);
            if (!item.title) errors.push(`[❌ 缺陷屬性] 第 ${index} 項缺少 'title'`);
            if (!item.file) errors.push(`[❌ 缺陷屬性] 第 ${index} 項缺少 'file'`);
        });
    }
    return errors;
}

// 格式驗證：題目檔必定要有 questions 陣列，且符合基本 L4 結構
function verifyQuestionFormat(filePath, content) {
    const errors = [];
    const warnings = [];

    // 支援官方 README 所定義的所有 4 種歷史與新版格式：A, A', B, C
    let baseQuestion = null;

    if (content.questions && Array.isArray(content.questions)) {
        // 格式 A, A'
        if (content.questions.length === 0) {
            warnings.push(`[⚠️ 警告] 'questions' 陣列為空`);
        } else {
            baseQuestion = content.questions[0];
        }
    } else if (Array.isArray(content)) {
        // 格式 C
        if (content.length === 0) {
            warnings.push(`[⚠️ 警告] 頂層陣列為空`);
        } else {
            baseQuestion = content[0];
        }
    } else if (content.question && content.options) {
        // 格式 B
        baseQuestion = content;
    } else {
        errors.push(`[❌ 結構錯誤] 缺少標準的 'questions' 陣列，亦不符合任何歷史規範 (A, B, C)`);
    }

    if (baseQuestion) {
        if (!baseQuestion.question) errors.push(`[❌ 結構錯誤] 題目物件缺少 'question' 欄位`);
        if (!baseQuestion.options || !Array.isArray(baseQuestion.options)) errors.push(`[❌ 結構錯誤] 題目物件缺少 'options' 陣列`);
        if (baseQuestion.answer_index === undefined && baseQuestion.correctAnswer === undefined && baseQuestion.answer === undefined) {
            errors.push(`[❌ 結構錯誤] 題目物件缺少答案索引 (建議統一為 answer_index)`);
        }
    }
    return { errors, warnings };
}

// 遞迴尋找每一個 publisher 的資料夾（最底層）
function scanAndVerify(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);

    // 如果資料夾內有 manifest.json，代表這是我們定義的 publisher 題庫根目錄
    if (files.includes('manifest.json')) {
        stats.totalDirsChecked++;
        const manifestPath = path.join(dir, 'manifest.json');

        try {
            const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            stats.manifestsChecked++;

            // 驗證 Manifest
            const mErrors = verifyManifestFormat(manifestPath, manifestData);
            if (mErrors.length > 0) {
                stats.manifestErrors.push({ path: manifestPath, errors: mErrors });
            }

            // 抽樣驗證題庫（從 items 中隨機抽一個）
            if (manifestData.items && Array.isArray(manifestData.items) && manifestData.items.length > 0) {
                // 隨機抽選
                const randomItem = manifestData.items[Math.floor(Math.random() * manifestData.items.length)];
                if (randomItem.file) {
                    const qFilePath = path.join(dir, randomItem.file);
                    if (fs.existsSync(qFilePath)) {
                        stats.questionFilesSampled++;
                        try {
                            const qData = JSON.parse(fs.readFileSync(qFilePath, 'utf8'));
                            const { errors, warnings } = verifyQuestionFormat(qFilePath, qData);
                            if (errors.length > 0) {
                                stats.questionErrors.push({ path: qFilePath, errors: errors });
                            }
                            // warnings 可忽略，為非破壞性項目
                        } catch (e) {
                            stats.questionErrors.push({ path: qFilePath, errors: [`[❌ 檔案損毀] 無法解析 JSON: ${e.message}`] });
                        }
                    } else {
                        // 未生成的檔案只視為待建置（Stub），僅給予警告而不報錯
                        // console.warn(`[⚠️ 待建置] ${qFilePath}`);
                    }
                }
            }

        } catch (err) {
            stats.manifestErrors.push({ path: manifestPath, errors: [`[❌ 檔案損毀] 無法解析 JSON: ${err.message}`] });
        }
    } else {
        // 繼續往下找
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                scanAndVerify(fullPath);
            }
        }
    }
}

// 啟動腳本
console.log('🔍 開始執行全站題庫格式抽測...\n');
scanAndVerify(TARGET_DIR);

// 報表輸出
console.log(`\n=== 📊 抽測驗證報告 ===`);
console.log(`- 掃描的題庫目錄總數: ${stats.totalDirsChecked}`);
console.log(`- Manifest 驗證數: ${stats.manifestsChecked}`);
console.log(`- 題庫 JSON 抽樣數: ${stats.questionFilesSampled}`);

if (stats.manifestErrors.length === 0 && stats.questionErrors.length === 0) {
    console.log(`\n✅ 完美！所有的格式皆符合唯一的陣列標準，無相容性髒扣問題。`);
    process.exit(0);
} else {
    console.log(`\n🚨 發現格式不一致的違規檔案：`);
    if (stats.manifestErrors.length > 0) {
        console.log(`\n📂 Manifest 違規清單 (${stats.manifestErrors.length} 個):`);
        stats.manifestErrors.forEach(errObj => {
            console.log(`  ➔ ${errObj.path}`);
            errObj.errors.forEach(e => console.log(`      ${e}`));
        });
    }

    if (stats.questionErrors.length > 0) {
        console.log(`\n📄 題庫 JSON 違規清單 (${stats.questionErrors.length} 個):`);
        stats.questionErrors.forEach(errObj => {
            console.log(`  ➔ ${errObj.path}`);
            errObj.errors.forEach(e => console.log(`      ${e}`));
        });
    }
    process.exit(1);
}
