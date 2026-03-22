const fs = require('fs');
const path = require('path');

const TARGET_FILE = 'question/platform/G3/Chinese/S2/KangHsuan/Chi_L4.json';

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

async function run() {
  const apiKey = loadGeminiKey();
  if (!apiKey) { console.error('找不到 Gemini Key'); return; }

  const qData = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), TARGET_FILE), 'utf8'));
  const questions = qData.questions.slice(0, 30); // 完整 30 題

  const dummyR4 = "這是一段模擬的 R4 發展綱要與教學重點，請據此審題並完成 30 題的驗證。";
  
  const qText = questions.map((q, i) => {
    const opts = q.options.map((o, oi) => `  (${oi}) ${o}`).join('\n');
    return `### 第 ${i + 1} 題\n**題幹**：${q.question}\n**選項**：\n${opts}`;
  }).join('\n\n');

  const prompt = `你是一位擁有 20 年經驗的國小國語科資深命題審核專家。
請根據以下課綱精華，逐題獨立審查所有待審題目。

## 課綱研究精華 (R4)
${dummyR4}

## 待審查題目 (共 ${questions.length} 題)
${qText}

## 回傳格式
請回傳純 JSON Array。
【重要警告】：你必須完整產出所有 ${questions.length} 題的結果！嚴禁中斷、嚴禁省略、嚴禁只寫前幾題就結束。否則系統會崩潰！

格式如下：
[
    {
        "q_index": 1,
        "selected_answer": 0,
        "reasoning": "你的判斷理由",
        "quality_rating": 3,
        "r4_alignment": "對齊度"
    }
]`;

  console.log('🚀 發送請求給 Gemini 3.1 Pro (30 題)... (Temperature: 0.4 + 防截斷指令)');
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json'
    }
  };

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (!res.ok) { console.error('API 錯誤', data); return; }

  const rawText = data.candidates[0].content.parts[0].text;
  const finishReason = data.candidates[0].finishReason;
  const tokenUsage = data.usageMetadata;

  console.log('\n\n================ RAW TEXT ================');
  console.log(rawText);
  console.log('==========================================\n');
  console.log(`🛑 結束原因 (finishReason): ${finishReason}`);
  console.log(`📊 Token 使用量: 輸入 ${tokenUsage.promptTokenCount}, 輸出 ${tokenUsage.candidatesTokenCount}`);

  // 嘗試解析
  let c = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try {
      const parsed = JSON.parse(c);
      console.log(`✅ 解析成功！共 ${parsed.length} 題`);
  } catch(e) {
      console.error('❌ 解析錯誤:', e.message);
      // 顯示最後 50 個字元來確認是否截斷
      console.log('結尾內容:', c.slice(-50));
  }
}

run();
