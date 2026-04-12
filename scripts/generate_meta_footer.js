#!/usr/bin/env node

/**
 * generate_meta_footer.js
 * 用途：統一格式化輸出 AI Agent 的真實 Meta 資訊與花費，避免 Agent 產生幻覺。
 * 用法：node scripts/generate_meta_footer.js <ModelPlaceholder> <TokenCount>
 * 範例：node scripts/generate_meta_footer.js "PLACEHOLDER_M37" 42091
 */

const fs = require('fs');
const path = require('path');

const inputArg = process.argv[2];
let metaData = {};

try {
  // 嘗試將第一個變數解析為 JSON
  metaData = JSON.parse(inputArg);
} catch (e) {
  // 如果遇到單純用舊版空格隔開的指令，提供兼容或錯誤警告
  console.error(`⚠️ 請傳入 JSON 格式的字串。範例: node scripts/generate_meta_footer.js '{"model":"M37", "tokens":42000, "executor":"AG"}'`);
  process.exit(1);
}

const modelCodeArg = metaData.model || "MXX";
let tokenCount = parseInt(metaData.tokens, 10);
if (isNaN(tokenCount)) tokenCount = 0;

const executor = metaData.executor || "AG";
const extraInfo = metaData.job_id ? `[${metaData.job_id}] ` : "";

// 動態載入外部全域模型計價表 (Single Source of Truth)
const pricingPath = path.resolve(__dirname, '../../Model_Price.json');
let config = {};
try {
  const rawData = fs.readFileSync(pricingPath, 'utf8');
  config = JSON.parse(rawData);
} catch (error) {
  console.error("⚠️ 無法讀取全域 Model_Price.json，將使用安全預設值。");
  config = { exchange_rate_twd: 32.5, models: {}, aliases: {} };
}

// 尋找對應模型，若傳入的是 Alias (例如 PLACEHOLDER_M37)，則先轉譯為真實 API ID
const realModelId = config.aliases[modelCodeArg] || modelCodeArg;
const modelInfo = config.models[realModelId];

let output = "";

if (modelInfo) {
  // 正常計算花費 (此處簡化以 Input 價格進行概算)
  // 若需精準，需傳入 Input 與 Output 兩個 Token 數
  const costUSD = (tokenCount / 1000000) * modelInfo.price_in_usd;
  const costTWD = costUSD * config.exchange_rate_twd;
  const costFormatted = costTWD.toFixed(2);
  
  output = `💲作業匯總 ：${extraInfo}Token數:${tokenCount} | 花費(估): $${costFormatted} | 使用模型: ${modelInfo.name}(${realModelId}) | 執行者: ${executor}`;
} else {
  // 觸發未知代碼警告 (Fallback Error Handling)
  const cleanModelCode = modelCodeArg.replace('PLACEHOLDER_', '');
  const promptWarning = `⚠️ 您輸入了一個本系統尚未建檔的模型代號 (${modelCodeArg})，請打開 0_AI_Project/Model_Price.json 將其註冊並填入費率。`;
  console.error(promptWarning);
  
  output = `💲作業匯總 ：${extraInfo}Token數:${tokenCount} | 花費(估): $[未建檔,需手動查價] | 使用模型: [未知模型](${cleanModelCode}) | 執行者: ${executor}`;
}

console.log(output);
