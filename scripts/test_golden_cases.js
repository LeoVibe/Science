const fs = require('fs');
const path = require('path');
const { evaluateFile } = require('./evaluate_question_quality.js');

const PROJECT_ROOT = path.join(__dirname, '..');
const GOLDEN_DIR = path.join(PROJECT_ROOT, 'tests', 'golden_cases');

// 測試案例定義
const testCases = [
    {
        file: 'social_l4.json',
        expectedQuality: 'L4', // 由於有 scenario 與長度控制，預期社會科可以過 L4（假設研究文件檢核通過，此處我們在 evaluateFile 會一併把檔案送進去跑邏輯）
        description: '社會科完整包裝 L4 題目'
    },
    {
        file: 'math_l2.json',
        expectedQuality: 'L2', // 少了情境包裝或是長度，基礎題應該被卡在 L2
        description: '數學科短題幹與單純運算 L2 題目'
    }
];

let hasError = false;

console.log('=== [Golden Test] 開始執行品質評估單元測試 ===');

for (const tc of testCases) {
    const filePath = path.join(GOLDEN_DIR, tc.file);

    if (!fs.existsSync(filePath)) {
        console.error(`[無法讀取]: 找不到黃金測資檔案 ${tc.file}`);
        hasError = true;
        continue;
    }

    // 執行評核
    const result = evaluateFile(filePath);

    if (result.quality === tc.expectedQuality) {
        console.log(`✅ PASS: [${tc.file}] 評核結果符合預期 (${tc.expectedQuality}) - ${tc.description}`);
    } else {
        // 也有可能是研究文件沒對到導致天花板被拉下，此時印出細節以供排查
        let trueQuality = result.quality;
        if (result.quality !== tc.expectedQuality) {
            console.error(`❌ FAIL: [${tc.file}] 評核結果為 ${result.quality}，與預期の ${tc.expectedQuality} 不符！`);
            console.error(`          >> 詳細報告: CQI=${result.avgCqi} Ceiling=${result.researchCeiling} (${result.researchReason})`);
            hasError = true;
        }
    }
}

if (hasError) {
    console.log('\n❌ [Golden Test] 測試失敗！本次品質評分邏輯變更破壞了既有評鑑標準，請檢查 evaluate_question_quality.js！');
    process.exit(1);
} else {
    console.log('\n✅ [Golden Test] 所有測資通過！雙軌評分邏輯健全。');
    process.exit(0);
}
