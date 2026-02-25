/**
 * V3 題庫批次狀態賦予腳本 (batch_update_manifests.js)
 * 
 * 用途：
 * 自動掃描 question/platform 下的所有 manifest.json，並依據其所屬的科目與年級，
 * 載入預設的品質分數與對應狀態 (如: 國語全部標 active, 數學及其他為 disabled)。
 */

const fs = require('fs');
const path = require('path');

// 依據 content_quality_assessment.md 定義的分數
const QUALITY_METRICS = {
    "chi": { status: "active", depth: 9.0, accuracy: 9.5, isVerified: true },
    "math": { status: "disabled", depth: 3.5, accuracy: 8.0, isVerified: false },
    "sci": { status: "disabled", depth: 6.5, accuracy: 8.0, isVerified: false },
    "soc": { status: "disabled", depth: 6.0, accuracy: 8.0, isVerified: false },
    "eng": { status: "disabled", depth: 0, accuracy: 0, isVerified: false }
};

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            callback(path.join(dir, f));
        }
    });
}

function processAllManifests(platformPath) {
    if (!fs.existsSync(platformPath)) {
        console.error(`❌ [錯誤] 找不到題庫目錄: ${platformPath}`);
        return;
    }

    let updatedCount = 0;

    walkDir(platformPath, (filePath) => {
        if (path.basename(filePath) === 'manifest.json') {
            // 解析路徑來判斷科目。例如: G3/chi/s1/knsh/manifest.json 或 G3/國語/S1/康軒/manifest.json
            // 由於前階段匯出的題綱可能是中文資料夾，我們使用簡單 mapping
            const pathParts = filePath.split(path.sep);

            let subjectStr = "";
            let metrics = QUALITY_METRICS["eng"]; // 預設

            if (filePath.includes('/chi/') || filePath.includes('/國語/')) metrics = QUALITY_METRICS["chi"];
            else if (filePath.includes('/math/') || filePath.includes('/數學/')) metrics = QUALITY_METRICS["math"];
            else if (filePath.includes('/sci/') || filePath.includes('/自然/')) metrics = QUALITY_METRICS["sci"];
            else if (filePath.includes('/soc/') || filePath.includes('/社會/')) metrics = QUALITY_METRICS["soc"];

            try {
                const manifest = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                if (!manifest.moduleMetaData) manifest.moduleMetaData = {};

                manifest.moduleMetaData.status = metrics.status;
                manifest.moduleMetaData.quality = {
                    depthScore: metrics.depth,
                    accuracyScore: metrics.accuracy,
                    isVerified: metrics.isVerified
                };

                fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2), 'utf8');
                updatedCount++;
            } catch (err) {
                console.error(`❌ [錯誤] 無法處理 ${filePath}: ${err.message}`);
            }
        }
    });

    console.log(`✅ [完成] 共更新了 ${updatedCount} 個 manifest.json。`);
    console.log(`🔸 國語: active (Depth:9.0, Acc:9.5)`);
    console.log(`🔸 其他科目: disabled`);
}

// 執行
const targetDir = process.argv[2] || "/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject/question/platform";
console.log(`開始處理目錄: ${targetDir}`);
processAllManifests(targetDir);
