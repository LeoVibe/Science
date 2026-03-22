const fs = require('fs');
const path = require('path');

const TARGET_FILE = 'question/platform/G3/Chinese/S2/KangHsuan/Chi_L8.json';

function loadOpenAIKey() {
  const cfgPath = fs.existsSync(path.resolve(__dirname, '../../ApiKeys.cfg'))
    ? path.resolve(__dirname, '../../ApiKeys.cfg')
    : path.resolve(__dirname, '../ApiKeys.cfg');
  const lines = fs.readFileSync(cfgPath, 'utf8').split('\n');
  let key = null;
  lines.forEach(line => {
    const t = line.trim();
    if (!t || t.startsWith('#')) return;
    const [k, ...v] = t.split('=');
    if (k.trim() === 'OPENAI_API_KEY') key = v.join('=').trim().replace(/^['"]|['"]$/g, '');
  });
  return key;
}

async function run() {
  const apiKey = loadOpenAIKey();
  if (!apiKey) { console.error('找不到 OpenAI Key'); return; }

  const qData = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), TARGET_FILE), 'utf8'));
  const questions = qData.questions.slice(0, 5); // 為了快速除錯，只拿前 5 題

  const dummyR4 = "這是一段模擬的 R4 發展綱要與教學重點，請據此審題。";
  
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
請回傳純 JSON Array，格式如下：
[
    {
        "q_index": 1,
        "selected_answer": 0,
        "reasoning": "你的判斷理由",
        "quality_rating": 3,
        "r4_alignment": "對齊度"
    }
]`;

  console.log('🚀 發送請求給 OpenAI (gpt-4o-mini)...');
  const body = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: '請以繁體中文回應。' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.1,
    max_tokens: 4000,
    response_format: { type: 'json_object' }
  };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (!res.ok) { console.error('API 錯誤', data); return; }

  const rawText = data.choices[0].message.content;
  console.log('\n\n================ RAW TEXT ================');
  console.log(rawText);
  console.log('==========================================\n');

  // 嘗試解析
  let c = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try {
      const parsed = JSON.parse(c);
      console.log('✅ 原生解析結果類型:', Array.isArray(parsed) ? 'Array' : typeof parsed);
      if (!Array.isArray(parsed)) {
          console.log('   內容包含的 Keys:', Object.keys(parsed));
      }
  } catch(e) {
      console.error('❌ 解析錯誤:', e.message);
  }
}

run();
