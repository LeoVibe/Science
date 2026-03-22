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

// 容錯解析 JSON
function parseOpenAIJSON(text) {
    let c = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    try {
        const j = JSON.parse(c);
        if (Array.isArray(j)) return j;
        // 處理 OpenAI json_object 喜歡自創 wrapper 的症狀
        return j.results || j.result || j.data || j.questions || null;
    } catch(e) {}
    
    // 如果連 parse 都掛了，嘗試 regex 暴力提取大括號內的陣列
    const m = c.match(/\[[\s\S]*\]/);
    if (m) {
        try { return JSON.parse(m[0]); } catch(e) { return null; }
    }
    return null;
}

async function runTest(modelName, questionCount, label) {
  const apiKey = loadOpenAIKey();
  if (!apiKey) { console.error('找不到 OpenAI Key'); return; }

  const qData = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), TARGET_FILE), 'utf8'));
  const questions = qData.questions.slice(0, questionCount);

  const dummyR4 = "這是一段模擬的 R4 發展綱要與教學重點，請據此審題，請嚴格遵守所有指令。";
  
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
【重要警告】：你必須完整產出所有 ${questions.length} 題的結果！嚴禁中斷、嚴禁省略、嚴禁只寫前幾題就結束。

格式如下：
[
    {
        "q_index": 1,
        "selected_answer": 0,
        "reasoning": "你的判斷理由",
        "quality_rating": 3,
        "r4_alignment": "對齊度"
    },
    ... (請繼續展開直到第 ${questions.length} 題)
]`;

  console.log(`\n🚀 發送請求給 OpenAI: ${label} (${modelName}, ${questionCount} 題)...`);
  const body = {
    model: modelName,
    messages: [
      { role: 'system', content: '請以繁體中文回應。' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.4,
    max_tokens: 10000,
    response_format: { type: 'json_object' }
  };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (!res.ok) { console.error('❌ API 錯誤', data); return; }

  const rawText = data.choices[0].message.content;
  const finishReason = data.choices[0].finish_reason;
  const tokenUsage = data.usage;

  console.log('================ RAW TEXT (最後300字) ================');
  console.log(rawText.slice(-300));
  console.log('======================================================');
  console.log(`🛑 結束原因 (finishReason): ${finishReason}`);
  console.log(`📊 Token 使用量: 輸入 ${tokenUsage.prompt_tokens}, 輸出 ${tokenUsage.completion_tokens}`);

  const parsed = parseOpenAIJSON(rawText);
  if (parsed) {
      console.log(`✅ 解析成功！共提取出 ${parsed.length} 題`);
  } else {
      console.error('❌ 解析錯誤，無法提取有效陣列');
  }
}

async function main() {
    // 驗證 C 組 (10-in-1, gpt-4o-mini)
    await runTest('gpt-4o-mini', 10, 'C組');
    // 驗證 D 組 (30-in-1, gpt-4o 旗艦模型)
    await runTest('gpt-4o', 30, 'D組旗艦版');
}

main();
