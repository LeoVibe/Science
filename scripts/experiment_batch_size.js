/**
 * JOB-078: 雙模型 × 雙批次 深層驗證效能對照實驗
 * 
 * 實驗設計：
 *   A組 = Gemini 10-in-1 (L1, L2, L3)
 *   B組 = Gemini 30-in-1 (L4, L6, L7)
 *   C組 = OpenAI 10-in-1 (L8, L9, L10)
 *   D組 = OpenAI 30-in-1 (L11, L12, L1-重複)
 * 
 * last_updated: 2026-03-22 14:31
 * updated_by: Antigravity
 */

const fs = require('fs');
const path = require('path');

// === 實驗配置 ===
const TARGET_DIR = 'question/platform/G3/Chinese/S2/KangHsuan';
const R4_FILE = 'knowledge/1_課綱研究/國語/三年級下學期_國語_發展綱要.md';

const EXPERIMENT_GROUPS = {
  A: { model: 'gemini', batchSize: 10, files: ['Chi_L1.json', 'Chi_L2.json', 'Chi_L3.json'], label: 'Gemini 10-in-1' },
  B: { model: 'gemini', batchSize: 30, files: ['Chi_L4.json', 'Chi_L6.json', 'Chi_L7.json'], label: 'Gemini 30-in-1' },
  C: { model: 'openai', batchSize: 10, files: ['Chi_L8.json', 'Chi_L9.json', 'Chi_L10.json'], label: 'OpenAI 10-in-1' },
  D: { model: 'openai', batchSize: 30, files: ['Chi_L11.json', 'Chi_L12.json', 'Chi_L1.json'], label: 'OpenAI 30-in-1' }
};

const LESSON_NAMES = {
  'Chi_L1.json': 'L1 許願', 'Chi_L2.json': 'L2 下雨的時候', 'Chi_L3.json': 'L3 遇見美如奶奶',
  'Chi_L4.json': 'L4 工匠之祖', 'Chi_L6.json': 'L6 神奇密碼', 'Chi_L7.json': 'L7 油桐花．五月雪',
  'Chi_L8.json': 'L8 大自然的美術館', 'Chi_L9.json': 'L9 臺灣的山椒魚', 'Chi_L10.json': 'L10 漁夫和金魚',
  'Chi_L11.json': 'L11 聰明的鼠鹿', 'Chi_L12.json': 'L12 還要跌幾次'
};

// === 金鑰載入 ===
function loadApiKeys() {
  const cfgPath = fs.existsSync(path.resolve(__dirname, '../../ApiKeys.cfg'))
    ? path.resolve(__dirname, '../../ApiKeys.cfg')
    : path.resolve(__dirname, '../ApiKeys.cfg');
  const lines = fs.readFileSync(cfgPath, 'utf8').split('\n');
  const keys = { gemini: [], openai: [] };
  let lastTier = 'free';
  lines.forEach(line => {
    const t = line.trim();
    const tierMatch = t.match(/\[(free|tier1|paid)\]/i);
    if (tierMatch) { lastTier = tierMatch[1].toLowerCase(); return; }
    if (!t || t.startsWith('#')) return;
    const [k, ...v] = t.split('=');
    const val = v.join('=').trim().replace(/^['"]|['"]$/g, '');
    if (k.trim() === 'GEMINI_API_KEY') keys.gemini.push({ tier: lastTier, key: val });
    if (k.trim() === 'OPENAI_API_KEY') keys.openai.push({ tier: lastTier, key: val });
    lastTier = 'free';
  });
  return keys;
}

// === Gemini API 呼叫 ===
async function callGemini(apiKey, prompt, requireJson = true) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const config = { temperature: 0.1, maxOutputTokens: 8192 };
  if (requireJson) config.responseMimeType = 'application/json';
  const body = { contents: [{ parts: [{ text: prompt }] }], generationConfig: config };

  const t0 = Date.now();
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini ${res.status}: ${errText.substring(0, 120)}`);
  }
  const data = await res.json();
  return {
    text: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
    tokensIn: data.usageMetadata?.promptTokenCount || 0,
    tokensOut: data.usageMetadata?.candidatesTokenCount || 0,
    timeMs: Date.now() - t0
  };
}

// === OpenAI API 呼叫 ===
async function callOpenAI(apiKey, prompt, requireJson = true) {
  const body = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: '你是一位擁有 20 年經驗的國小國語科資深命題審核專家。請以繁體中文回應。' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.1,
    max_tokens: 8192
  };
  if (requireJson) body.response_format = { type: 'json_object' };

  const t0 = Date.now();
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI ${res.status}: ${errText.substring(0, 120)}`);
  }
  const data = await res.json();
  return {
    text: data.choices?.[0]?.message?.content || '',
    tokensIn: data.usage?.prompt_tokens || 0,
    tokensOut: data.usage?.completion_tokens || 0,
    timeMs: Date.now() - t0
  };
}

// === 統一 API 呼叫介面 ===
async function callModel(model, apiKey, prompt, requireJson = true) {
  return model === 'gemini'
    ? callGemini(apiKey, prompt, requireJson)
    : callOpenAI(apiKey, prompt, requireJson);
}

// === Phase 0: LLM 課綱萃取 (不用正則表達式) ===
const contextCache = {};
async function extractR4Context(model, apiKey, fullR4, lessonName) {
  if (contextCache[lessonName]) {
    console.log(`    📦 ${lessonName} 課綱已在快取中`);
    return contextCache[lessonName];
  }
  console.log(`    🧠 LLM 萃取 ${lessonName} 課綱精華...`);
  const prompt = `你是一位專業的國小課綱研究助理。
請從以下「三年級下學期國語發展綱要（康軒版）」中，精準找出關於【${lessonName}】的所有教學研究精華。

### 萃取要求
1. 課文大意（含文體、主題、角色、起承轉合）
2. 教學目標重點（識字、語法、閱讀理解）
3. 考古題方向與誘答設計地雷（學生常犯錯的概念）
4. 放棄其他不相干課次的內容
5. 用繁體中文輸出，精練不超過 600 字

### 發展綱要全文
---
${fullR4}
---`;
  const res = await callModel(model, apiKey, prompt, false);
  contextCache[lessonName] = res.text;
  console.log(`    ✅ 萃取完成 (${res.timeMs}ms, ${res.tokensIn}→${res.tokensOut} tokens)`);
  return res.text;
}

// === Phase 1: 盲測 Prompt 建構 ===
function buildBlindPrompt(r4Context, questions) {
  const qText = questions.map((q, i) => {
    const opts = q.options.map((o, oi) => `  (${oi}) ${o}`).join('\n');
    return `### 第 ${i + 1} 題\n**題幹**：${q.question}\n**選項**：\n${opts}`;
  }).join('\n\n');

  return `你是一位擁有 20 年經驗的國小國語科資深命題審核專家。
請根據以下課綱精華，逐題獨立審查所有待審題目。

## 課綱研究精華 (R4)
${r4Context}

## 待審查題目 (共 ${questions.length} 題)
${qText}

## 回傳格式
請回傳純 JSON Array（不要包裝 Markdown 程式碼區塊），格式如下：
[
  {
    "q_index": 1,
    "selected_answer": 0,
    "reasoning": "你的判斷理由 (繁體中文, 50字以內)",
    "quality_rating": 3,
    "r4_alignment": "與R4教學研究的對齊度 (繁體中文, 30字以內)"
  }
]
重要：
- 「selected_answer」只填 0~3 的數字
- 「quality_rating」只填 1~3 的數字 (3=完美, 2=合格, 1=有問題)
- 所有 ${questions.length} 題都必須回傳，不可遺漏
- 確保 JSON 結構完整可解析`;
}

// === JSON 解析 ===
function parseJSON(text) {
  let c = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  // 嘗試直接解析
  try { const j = JSON.parse(c); return Array.isArray(j) ? j : (j.results || j.data || null); } catch(e) {}
  // 嘗試提取 [ ... ]
  const m = c.match(/\[[\s\S]*\]/);
  if (m) { try { return JSON.parse(m[0]); } catch(e) {} }
  return null;
}

// === 主程式 ===
async function main() {
  console.log('🧪 JOB-078: 雙模型 × 雙批次 深層驗證對照實驗');
  console.log('═'.repeat(60) + '\n');

  // 載入金鑰
  const allKeys = loadApiKeys();
  const geminiKey = (allKeys.gemini.find(k => k.tier === 'tier1' || k.tier === 'paid') || allKeys.gemini[0])?.key;
  const openaiKey = (allKeys.openai.find(k => k.tier === 'paid' || k.tier === 'tier1') || allKeys.openai[0])?.key;
  if (!geminiKey) { console.error('❌ 找不到 Gemini 金鑰'); process.exit(1); }
  if (!openaiKey) { console.error('❌ 找不到 OpenAI 金鑰'); process.exit(1); }
  console.log(`🔑 Gemini Key: ...${geminiKey.slice(-3)} | OpenAI Key: ...${openaiKey.slice(-4)}`);

  // 載入 R4 綱要
  const r4Full = fs.readFileSync(R4_FILE, 'utf8');
  console.log(`📚 R4 發展綱要: ${(r4Full.length / 1024).toFixed(0)}KB\n`);

  const results = {};

  for (const [groupId, group] of Object.entries(EXPERIMENT_GROUPS)) {
    const apiKey = group.model === 'gemini' ? geminiKey : openaiKey;
    console.log(`\n${'▶'.repeat(3)} ${group.label} (${groupId} 組)`);
    console.log('─'.repeat(40));

    results[groupId] = {
      label: group.label,
      model: group.model,
      batchSize: group.batchSize,
      lessons: [],
      totalBatches: 0,
      totalTime: 0,
      totalTokensIn: 0,
      totalTokensOut: 0,
      totalQuestions: 0,
      successBatches: 0,
      failBatches: 0,
      matchCount: 0,
      mismatchCount: 0,
      qualitySum: 0,
      qualityCount: 0
    };

    for (const file of group.files) {
      const lessonName = LESSON_NAMES[file] || file;
      console.log(`  📖 ${lessonName}`);

      // 載入題庫
      const qData = JSON.parse(fs.readFileSync(path.join(TARGET_DIR, file), 'utf8'));
      const questions = qData.questions.slice(0, 30);
      if (questions.length < 10) { console.log(`    ⚠️ 題數不足 (${questions.length})，跳過`); continue; }

      // Phase 0: LLM 萃取課綱
      const r4Context = await extractR4Context(group.model, apiKey, r4Full, lessonName);

      // Phase 1: 盲測
      const batches = [];
      for (let i = 0; i < questions.length; i += group.batchSize) {
        batches.push(questions.slice(i, i + group.batchSize));
      }

      let lessonResult = { file, lessonName, batches: [], matchRate: 0 };
      let lessonMatch = 0, lessonTotal = 0;

      for (let bi = 0; bi < batches.length; bi++) {
        const batch = batches[bi];
        const prompt = buildBlindPrompt(r4Context, batch);
        const batchLabel = `批次${bi + 1}/${batches.length} (${batch.length}題)`;

        try {
          const res = await callModel(group.model, apiKey, prompt, true);
          results[groupId].totalBatches++;
          results[groupId].totalTime += res.timeMs;
          results[groupId].totalTokensIn += res.tokensIn;
          results[groupId].totalTokensOut += res.tokensOut;

          const parsed = parseJSON(res.text);
          if (parsed && parsed.length >= Math.floor(batch.length * 0.8)) {
            results[groupId].successBatches++;

            // 比對答案
            for (const r of parsed) {
              const qIdx = (r.q_index - 1) + (bi * group.batchSize);
              if (qIdx >= 0 && qIdx < questions.length) {
                const isMatch = r.selected_answer === questions[qIdx].answer_index;
                if (isMatch) { lessonMatch++; results[groupId].matchCount++; }
                else { results[groupId].mismatchCount++; }
                lessonTotal++;
                results[groupId].totalQuestions++;
                if (r.quality_rating) { results[groupId].qualitySum += r.quality_rating; results[groupId].qualityCount++; }
              }
            }
            const rate = lessonTotal > 0 ? (lessonMatch / lessonTotal * 100).toFixed(0) : '?';
            console.log(`    ✅ ${batchLabel} | ${(res.timeMs/1000).toFixed(1)}s | ${res.tokensIn}→${res.tokensOut}tk | 解析${parsed.length}題 | 吻合率${rate}%`);
          } else {
            results[groupId].failBatches++;
            console.log(`    ❌ ${batchLabel} | ${(res.timeMs/1000).toFixed(1)}s | JSON解析失敗 (回傳${res.tokensOut}tk)`);
          }
        } catch (e) {
          results[groupId].failBatches++;
          console.log(`    ❌ ${batchLabel} | 請求失敗: ${e.message.substring(0, 80)}`);
        }

        // 批次間延遲
        if (bi < batches.length - 1) await new Promise(r => setTimeout(r, 1500));
      }

      lessonResult.matchRate = lessonTotal > 0 ? (lessonMatch / lessonTotal * 100).toFixed(1) : 'N/A';
      results[groupId].lessons.push(lessonResult);
    }
  }

  // === Phase 2: 彙整報告 ===
  console.log('\n\n' + '═'.repeat(60));
  console.log('📊 JOB-078 實驗結果對照表');
  console.log('═'.repeat(60));

  const header = '| 組別 | 模型 | 批次 | API次數 | 成功率 | 總耗時 | 輸入Token | 輸出Token | Match Rate | 平均品質 |';
  const sep =    '|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|';
  console.log(header);
  console.log(sep);
  for (const [gid, r] of Object.entries(results)) {
    const successRate = r.totalBatches > 0 ? ((r.successBatches / r.totalBatches) * 100).toFixed(0) + '%' : 'N/A';
    const matchRate = (r.matchCount + r.mismatchCount) > 0 ? ((r.matchCount / (r.matchCount + r.mismatchCount)) * 100).toFixed(1) + '%' : 'N/A';
    const avgQ = r.qualityCount > 0 ? (r.qualitySum / r.qualityCount).toFixed(1) : 'N/A';
    console.log(`| ${gid} | ${r.model} | ${r.batchSize}-in-1 | ${r.totalBatches} | ${successRate} | ${(r.totalTime/1000).toFixed(1)}s | ${r.totalTokensIn.toLocaleString()} | ${r.totalTokensOut.toLocaleString()} | ${matchRate} | ${avgQ}/3 |`);
  }

  // 關鍵洞察
  console.log('\n📝 關鍵分析維度:');
  const gA = results.A, gB = results.B, gC = results.C, gD = results.D;
  if (gA && gB) {
    const aAvg = gA.totalBatches > 0 ? gA.totalTime / gA.totalBatches : 0;
    const bAvg = gB.totalBatches > 0 ? gB.totalTime / gB.totalBatches : 0;
    console.log(`  ⏱️ Gemini 平均每批: 10-in-1=${(aAvg/1000).toFixed(1)}s vs 30-in-1=${(bAvg/1000).toFixed(1)}s`);
    console.log(`  💰 Gemini 總Token:  10-in-1=${gA.totalTokensIn+gA.totalTokensOut} vs 30-in-1=${gB.totalTokensIn+gB.totalTokensOut}`);
  }
  if (gC && gD) {
    const cAvg = gC.totalBatches > 0 ? gC.totalTime / gC.totalBatches : 0;
    const dAvg = gD.totalBatches > 0 ? gD.totalTime / gD.totalBatches : 0;
    console.log(`  ⏱️ OpenAI 平均每批: 10-in-1=${(cAvg/1000).toFixed(1)}s vs 30-in-1=${(dAvg/1000).toFixed(1)}s`);
    console.log(`  💰 OpenAI 總Token:  10-in-1=${gC.totalTokensIn+gC.totalTokensOut} vs 30-in-1=${gD.totalTokensIn+gD.totalTokensOut}`);
  }

  // 存檔
  fs.writeFileSync('/tmp/job078_experiment_results.json', JSON.stringify(results, null, 2));
  console.log('\n💾 完整數據已存入 /tmp/job078_experiment_results.json');
  console.log('🏁 實驗完畢！');
}

main().catch(e => { console.error('💥 致命錯誤:', e); process.exit(1); });
