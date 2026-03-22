/**
 * v5.0 深層驗證 POC 測試腳本
 * 
 * 功能：整合 R3/R4 教學研究素材，以「資深審題員」模式進行 10 題一組的批次驗證。
 * 使用方式：node scripts/test_deep_verify_poc.js
 * 
 * last_updated: 2026-03-22 13:55
 * updated_by: Antigravity
 */

const fs = require('fs');
const path = require('path');

// === 設定 ===
// 目標題庫
const QUESTION_FILE = 'question/platform/G3/Chinese/S2/KangHsuan/Chi_L4.json';
// R4 發展綱要
const R4_FILE = 'knowledge/課綱研究/國語/三年級下學期_國語_發展綱要.md';
// 課次識別標記
const LESSON_KEY = '#### L4 工匠之祖';
// 批次大小
const BATCH_SIZE = 10;
// API 延遲 (毫秒)
const API_DELAY = 2000;

// === 讀取 API 金鑰 ===
function loadApiKeys() {
  // 與 run_blind_eval.js 相同的路徑策略
  const cfgPath = fs.existsSync(path.resolve(__dirname, '../../ApiKeys.cfg'))
    ? path.resolve(__dirname, '../../ApiKeys.cfg')
    : path.resolve(__dirname, '../ApiKeys.cfg');
  if (!fs.existsSync(cfgPath)) {
    console.error('❌ 找不到 ApiKeys.cfg (嘗試路徑:', cfgPath, ')');
    process.exit(1);
  }
  const lines = fs.readFileSync(cfgPath, 'utf8').split('\n');
  const keys = [];
  let lastTier = 'free';
  lines.forEach(line => {
    const trimmedLine = line.trim();
    // 偵測分級標籤
    const tierMatch = trimmedLine.match(/\[(free|tier1|paid)\]/i);
    if (tierMatch) { lastTier = tierMatch[1].toLowerCase(); return; }
    // 略過註解與空白行
    if (!trimmedLine || trimmedLine.startsWith('#')) return;
    const [key, ...value] = trimmedLine.split('=');
    if (key.trim() === 'GEMINI_API_KEY' && value.length) {
      keys.push({ provider: 'gemini', tier: lastTier, key: value.join('=').trim().replace(/^['"]|['"]$/g, '') });
    }
    if (key.trim() === 'OPENAI_API_KEY' && value.length) {
      keys.push({ provider: 'openai', tier: lastTier, key: value.join('=').trim().replace(/^['"]|['"]$/g, '') });
    }
    lastTier = 'free';
  });
  return keys;
}

// === 從 R4 發展綱要提取指定課次的研究素材 ===
function extractR4Context(r4Content, lessonKey) {
  // 找到該課次的起始位置
  const startIdx = r4Content.indexOf(lessonKey);
  if (startIdx === -1) {
    console.error(`❌ 在發展綱要中找不到 "${lessonKey}"`);
    return null;
  }

  // 找到下一個 #### 標記作為結束位置
  const afterStart = r4Content.substring(startIdx + lessonKey.length);
  const nextSectionMatch = afterStart.match(/\n#### [LU]/);
  const endIdx = nextSectionMatch
    ? startIdx + lessonKey.length + nextSectionMatch.index
    : startIdx + lessonKey.length + afterStart.length;

  const sectionContent = r4Content.substring(startIdx, endIdx).trim();

  console.log(`📚 成功提取 R4 素材 (${sectionContent.length} 字元)`);
  return sectionContent;
}

// === 建構深層驗證 Prompt ===
function buildDeepVerifyPrompt(r4Context, questions) {
  const questionsText = questions.map((q, i) => {
    const opts = q.options.map((o, oi) => `  (${oi}) ${o}`).join('\n');
    return `### 第 ${i + 1} 題 (q_index: ${q.originalIndex})\n**題幹**：${q.question}\n**選項**：\n${opts}`;
  }).join('\n\n');

  return `你是一位擁有 20 年經驗的國小國語科資深命題審核專家。你的任務是逐題審查以下題目，判斷每一題的品質。

## 你的審查依據 (教學研究素材)
以下是這一課的教學研究摘要，包含課文大意、考古題分析與命題策略：

---
${r4Context}
---

## 審查規則
1. **逐題獨立思考**：每一題都必須獨立審查，不可混淆。
2. **先選答案再寫評語**：不看正確答案，根據課文內容與教學目標，選出你認為最正確的答案。
3. **專業評語**：簡述為何選擇該答案，並指出此題是否符合 R4 發展綱要的命題方向。
4. **品質評級**：
   - ⭐⭐⭐：完美對齊 R4 教學目標，誘答設計精準。
   - ⭐⭐：基本合格，但可更貼近教學研究。
   - ⭐：存在明顯問題（選項不均、邏輯矛盾、偏離課綱等）。

## 待審題目
${questionsText}

## 回傳格式
請回傳一個 JSON Array，每個物件格式如下：
[
  {
    "q_index": 1,
    "selected_answer": 0,
    "reasoning": "你的專業評語 (繁體中文，50字內)",
    "quality_rating": 3,
    "r4_alignment": "此題是否呼應 R4 提到的命題策略 (繁體中文，30字內)"
  }
]

**嚴禁額外格式**：只回傳純 JSON Array，不要包含 markdown 代碼框或其他文字。`;
}

// === 呼叫 Gemini API ===
async function callGeminiAPI(apiKey, prompt) {
  // 使用 gemini-2.5-flash, 保留 responseMimeType 以穩定 JSON 回傳
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json'
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API ${response.status}: ${errText.substring(0, 200)}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const usage = data.usageMetadata || {};

  return { text, usage };
}

// === 解析 AI 回傳的 JSON ===
function parseAIResponse(text) {
  // 移除可能的 markdown code block
  let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('⚠️ JSON 解析失敗，嘗試修復...');
    // 嘗試提取 [ ... ] 部分
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (match) {
      try { return JSON.parse(match[0]); } catch (e2) {}
    }
    return null;
  }
}

// === 主程式 ===
async function main() {
  console.log('🔬 v5.0 深層驗證 POC — 康軒 L4《工匠之祖》\n');

  // 1. 載入題庫
  const questionData = JSON.parse(fs.readFileSync(QUESTION_FILE, 'utf8'));
  const questions = questionData.questions;
  console.log(`📄 載入題庫: ${questions.length} 題`);

  // 2. 載入並提取 R4 素材
  const r4Full = fs.readFileSync(R4_FILE, 'utf8');
  const r4Context = extractR4Context(r4Full, LESSON_KEY);
  if (!r4Context) process.exit(1);

  // 3. 載入 API 金鑰
  const apiKeys = loadApiKeys();
  const geminiKeys = apiKeys.filter(k => k.provider === 'gemini');
  const geminiKey = geminiKeys.find(k => k.tier === 'paid' || k.tier === 'tier1') || geminiKeys[0];
  if (!geminiKey) { console.error('❌ 找不到 Gemini 金鑰'); process.exit(1); }
  console.log(`🔑 使用 Gemini API (選用 Tier: ${geminiKey.tier}, Key 尾數: ...${geminiKey.key.slice(-3)})\n`);

  // 4. 分批處理
  const batches = [];
  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    batches.push(questions.slice(i, i + BATCH_SIZE).map((q, idx) => ({
      ...q,
      originalIndex: i + idx + 1
    })));
  }
  console.log(`📦 分成 ${batches.length} 個批次 (每批 ${BATCH_SIZE} 題)\n`);

  // 5. 執行驗證
  const allResults = [];
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
    const batch = batches[batchIdx];
    const batchLabel = `批次 ${batchIdx + 1}/${batches.length} (題 ${batch[0].originalIndex}-${batch[batch.length - 1].originalIndex})`;
    console.log(`🚀 ${batchLabel}...`);

    const prompt = buildDeepVerifyPrompt(r4Context, batch);
    
    try {
      const { text, usage } = await callGeminiAPI(geminiKey.key, prompt);
      
      // 統計 Token (使用 API 回傳的真實數據)
      const inputTokens = usage.promptTokenCount || 0;
      const outputTokens = usage.candidatesTokenCount || 0;
      totalInputTokens += inputTokens;
      totalOutputTokens += outputTokens;
      console.log(`  📊 Token: 輸入 ${inputTokens} / 輸出 ${outputTokens}`);

      const results = parseAIResponse(text);
      if (results && Array.isArray(results)) {
        for (const r of results) {
          const qIdx = r.q_index - 1 + (batchIdx * BATCH_SIZE);
          const originalQ = questions[qIdx];
          const isMatch = r.selected_answer === originalQ.answer_index;
          const icon = isMatch ? '✅' : '❌';
          const stars = '⭐'.repeat(r.quality_rating || 1);

          console.log(`  ${icon} #${qIdx + 1} ${stars} | AI選:${r.selected_answer} 正解:${originalQ.answer_index} | ${r.reasoning}`);
          if (r.r4_alignment) {
            console.log(`     📐 R4對齊: ${r.r4_alignment}`);
          }

          allResults.push({
            questionIndex: qIdx + 1,
            match: isMatch,
            aiSelected: r.selected_answer,
            correctAnswer: originalQ.answer_index,
            reasoning: r.reasoning,
            qualityRating: r.quality_rating,
            r4Alignment: r.r4_alignment
          });
        }
      } else {
        console.log(`  ⚠️ 批次 ${batchIdx + 1} 解析失敗，跳過`);
      }
    } catch (err) {
      console.error(`  ❌ API 錯誤: ${err.message}`);
    }

    // 延遲
    if (batchIdx < batches.length - 1) {
      await new Promise(r => setTimeout(r, API_DELAY));
    }
  }

  // 6. 統計結果
  console.log('\n' + '='.repeat(60));
  console.log('📊 v5.0 深層驗證 POC 結果彙總\n');

  const matchCount = allResults.filter(r => r.match).length;
  const mismatchCount = allResults.filter(r => !r.match).length;
  const avgRating = allResults.reduce((s, r) => s + (r.qualityRating || 0), 0) / allResults.length;

  console.log(`✅ Match: ${matchCount} / ❌ Mismatch: ${mismatchCount} / 總計: ${allResults.length}`);
  console.log(`📈 Match Rate: ${(matchCount / allResults.length * 100).toFixed(1)}%`);
  console.log(`⭐ 平均品質評級: ${avgRating.toFixed(1)} / 3.0`);
  console.log(`\n💰 Token 消耗統計:`);
  console.log(`   輸入 Token: ${totalInputTokens.toLocaleString()}`);
  console.log(`   輸出 Token: ${totalOutputTokens.toLocaleString()}`);
  console.log(`   總計 Token: ${(totalInputTokens + totalOutputTokens).toLocaleString()}`);
  
  // Gemini Flash 定價 (Tier 1: 超過免費額度後)
  const inputCostUSD = (totalInputTokens / 1000000) * 0.10;
  const outputCostUSD = (totalOutputTokens / 1000000) * 0.40;
  const totalCostUSD = inputCostUSD + outputCostUSD;
  const totalCostTWD = totalCostUSD * 32;
  console.log(`   預估費用: $${totalCostUSD.toFixed(4)} USD (≈ NT$ ${totalCostTWD.toFixed(2)})`);

  // 7. 品質分佈
  const ratingDist = { 3: 0, 2: 0, 1: 0 };
  allResults.forEach(r => { ratingDist[r.qualityRating] = (ratingDist[r.qualityRating] || 0) + 1; });
  console.log(`\n⭐ 品質分佈:`);
  console.log(`   ⭐⭐⭐ (完美對齊): ${ratingDist[3] || 0} 題`);
  console.log(`   ⭐⭐ (基本合格): ${ratingDist[2] || 0} 題`);
  console.log(`   ⭐ (有問題): ${ratingDist[1] || 0} 題`);

  // 8. 列出不吻合題目
  if (mismatchCount > 0) {
    console.log(`\n📋 不吻合題目詳情:`);
    allResults.filter(r => !r.match).forEach(r => {
      console.log(`  ❌ #${r.questionIndex} | AI:${r.aiSelected} 正解:${r.correctAnswer} | ${r.reasoning}`);
    });
  }

  // 9. 將結果存檔
  const reportPath = '/tmp/v5_poc_result.json';
  fs.writeFileSync(reportPath, JSON.stringify({
    testDate: new Date().toISOString(),
    target: 'KangHsuan/Chi_L4.json (工匠之祖)',
    totalQuestions: allResults.length,
    matchRate: (matchCount / allResults.length * 100).toFixed(1) + '%',
    avgQualityRating: avgRating.toFixed(1),
    tokenUsage: { input: totalInputTokens, output: totalOutputTokens, total: totalInputTokens + totalOutputTokens },
    estimatedCostUSD: totalCostUSD.toFixed(4),
    results: allResults
  }, null, 2));
  console.log(`\n💾 結果已存檔: ${reportPath}`);
}

main().catch(console.error);
