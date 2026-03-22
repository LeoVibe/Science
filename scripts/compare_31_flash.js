const fs = require('fs');
const path = require('path');

const TARGET_FILE = 'question/platform/G3/Chinese/S2/KangHsuan/Chi_L4.json';
const MODEL_NAME = 'gemini-3.1-flash-lite-preview';

function loadGeminiKey() {
  const cfgPath = fs.existsSync(path.resolve(__dirname, '../../ApiKeys.cfg'))
    ? path.resolve(__dirname, '../../ApiKeys.cfg')
    : path.resolve(__dirname, '../ApiKeys.cfg');
  const lines = fs.readFileSync(cfgPath, 'utf8').split('\n');
  let key = null;
  lines.forEach(line => {
    const t = line.trim();
    if (!t || t.startsWith('#')) return;
    const [k, ...v] = t.split('=');
    if (k.trim() === 'GEMINI_API_KEY') key = v.join('=').trim().replace(/^['"]|['"]$/g, '');
  });
  return key;
}

async function runBatch(apiKey, questions, batchLabel) {
  const dummyR4 = "這是一段模擬的 R4 發展綱要與教學重點，請據此審查所有的測驗題目。嚴禁遺漏。";
  
  const qText = questions.map((q, i) => {
    const opts = q.options.map((o, oi) => `  (${oi}) ${o}`).join('\n');
    return `### 第 ${i + 1} 題\n**題幹**：${q.question}\n**選項**：\n${opts}`;
  }).join('\n\n');

  const prompt = `你是一位擁有 20 年經驗的國小國語科資深命題審核專家。
請根據以下課綱重點，逐題獨立審查以下 ${questions.length} 題。

## 課綱重點
${dummyR4}

## 待審查題目 (共 ${questions.length} 題)
${qText}

## 回傳格式
請回傳純 JSON Array。
【重要警告】：你必須完整產出所有 ${questions.length} 題的結果！嚴禁中斷或省略。

格式如下：
[
    {
        "q_index": 1,
        "selected_answer": 0,
        "reasoning": "簡潔的判斷理由",
        "quality_rating": 3,
        "r4_alignment": "對齊度"
    },
    ... (請繼續展開直到第 ${questions.length} 題)
]`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json'
    }
  };

  const startTime = Date.now();
  console.log(`\n⏳ 開始執行 [${batchLabel}] ...`);
  
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  const data = await res.json();
  
  if (!res.ok) { 
      console.error(`❌ API 錯誤 [${batchLabel}]:`, data); 
      return; 
  }

  const rawText = data.candidates[0].content.parts[0].text;
  const finishReason = data.candidates[0].finishReason;
  const tUsage = data.usageMetadata;

  let parseSuccess = false;
  let parsedCount = 0;
  
  try {
      let c = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(c);
      if (Array.isArray(parsed)) {
          parseSuccess = true;
          parsedCount = parsed.length;
      }
  } catch(e) {}

  console.log(`✅ [${batchLabel}] 執行完畢！`);
  console.log(`  ⏱️ 耗時: ${duration} 秒`);
  console.log(`  📊 Token: 輸入 ${tUsage.promptTokenCount} -> 輸出 ${tUsage.candidatesTokenCount}`);
  console.log(`  🛑 結束原因 (finishReason): ${finishReason}`);
  console.log(`  📏 JSON 解析: ${parseSuccess ? `成功 (共 ${parsedCount} 題)` : '失敗 (格式損毀)'}`);
  
  if (!parseSuccess) {
      console.log('  ⚠️ 結尾內容預覽:', rawText.slice(-100).replace(/\n/g, '\\n'));
  }
}

async function main() {
  const apiKey = loadGeminiKey();
  if (!apiKey) { console.error('找不到 Gemini Key'); return; }

  const qData = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), TARGET_FILE), 'utf8'));
  
  console.log(`====================================================`);
  console.log(`🚀 開始驗證模型: ${MODEL_NAME}`);
  console.log(`====================================================`);
  
  // 測驗一：10-in-1
  await runBatch(apiKey, qData.questions.slice(0, 10), '10-in-1 (10題)');
  
  // 測驗二：30-in-1
  await runBatch(apiKey, qData.questions.slice(0, 30), '30-in-1 (30題)');
  
  console.log(`\n🏁 驗證結束！`);
}

main();
