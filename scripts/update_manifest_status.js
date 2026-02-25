/**
 * V3 題庫狀態管理腳本 (update_manifest_status.js)
 * 
 * 用途：
 * 為指定的 manifest.json 加入或更新 moduleMetaData (包含開關狀態與品質分數)。
 * 這將能讓前台 (v3_eidos) 讀取並判斷是否要攔截測驗或顯示優化中提示。
 * 
 * 執行範例：
 * node scripts/update_manifest_status.js --path "question/platform/G3/chi/s1/knsh/manifest.json" --status "active" --depth 9.0 --accuracy 9.5
 * node scripts/update_manifest_status.js --path "question/platform/G5/math/s1/knsh/manifest.json" --status "disabled" --depth 3.5 --accuracy 8.0
 */

const fs = require('fs');
const path = require('path');

function printUsage() {
    console.log(`
Usage:
  node update_manifest_status.js --path <manifest_path> --status <active|disabled> [--depth <1-10>] [--accuracy <1-10>]
    `);
}

function parseArgs() {
    const args = process.argv.slice(2);
    const options = {};
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--path') options.targetPath = args[++i];
        if (args[i] === '--status') options.status = args[++i];
        if (args[i] === '--depth') options.depthScore = parseFloat(args[++i]);
        if (args[i] === '--accuracy') options.accuracyScore = parseFloat(args[++i]);
    }
    return options;
}

function processManifest(filePath, status, depth, accuracy) {
    const fullPath = path.resolve(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
        console.error(`❌ [錯誤] 找不到目標檔案: ${fullPath}`);
        return false;
    }

    try {
        const fileContent = fs.readFileSync(fullPath, 'utf8');
        const manifest = JSON.parse(fileContent);

        // 如果沒有 moduleMetaData，就初始化一個
        if (!manifest.moduleMetaData) {
            manifest.moduleMetaData = {};
        }

        manifest.moduleMetaData.status = status;
        
        let isVerified = false;
        if (depth !== undefined && accuracy !== undefined) {
             // 假設兩者大於等於 8 分即視為Verified (這符合我們L4標準)
             if (depth >= 8.0 && accuracy >= 8.0) {
                 isVerified = true;
             }

             manifest.moduleMetaData.quality = {
                depthScore: depth,
                accuracyScore: accuracy,
                isVerified: isVerified
             };
        } else if (!manifest.moduleMetaData.quality) {
            // 提供無法評估時的預設值
             manifest.moduleMetaData.quality = {
                depthScore: 0,
                accuracyScore: 0,
                isVerified: false
             };
        }

        fs.writeFileSync(fullPath, JSON.stringify(manifest, null, 2), 'utf8');
        console.log(`✅ [成功] 已更新 ${filePath}`);
        console.log(`   🔸 狀態: ${status}`);
        if(manifest.moduleMetaData.quality) {
             console.log(`   🔸 分數: Depth=${manifest.moduleMetaData.quality.depthScore}, Accuracy=${manifest.moduleMetaData.quality.accuracyScore}, Verified=${manifest.moduleMetaData.quality.isVerified}`);
        }
        return true;
    } catch (error) {
        console.error(`❌ [錯誤] 無法解析或寫入檔案: ${error.message}`);
        return false;
    }
}

function main() {
    const options = parseArgs();
    
    if (!options.targetPath || !options.status) {
        printUsage();
        process.exit(1);
    }

    if (!['active', 'disabled'].includes(options.status)) {
        console.error('❌ [錯誤] status 只能是 active 或 disabled');
        process.exit(1);
    }

    processManifest(options.targetPath, options.status, options.depthScore, options.accuracyScore);
}

if (require.main === module) {
    main();
}
