const fs = require('fs');
const path = require('path');

// === 環境初始化 ===
let geminiKey = null;
let openaiKey = null;

const GLOBAL_ENV_PATH = fs.existsSync(path.resolve(__dirname, '../../ApiKeys.cfg')) 
    ? path.resolve(__dirname, '../../ApiKeys.cfg') 
    : path.resolve(__dirname, '../../Global_API_Keys.txt');

if (fs.existsSync(GLOBAL_ENV_PATH)) {
    const envFile = fs.readFileSync(GLOBAL_ENV_PATH, 'utf8');
    envFile.split('\n').forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
            const [key, ...value] = trimmedLine.split('=');
            const val = value.join('=').trim().replace(/^['"]|['"]$/g, '');
            if (key.trim() === 'GEMINI_API_KEY' && !geminiKey) {
                geminiKey = val; // 取第一個有效金鑰 (通常是解開註解的)
            }
            if (key.trim() === 'OPENAI_API_KEY') {
                openaiKey = val;
            }
        }
    });
}

if (!geminiKey || !openaiKey) {
    console.error("❌ 找不到 GEMINI_API_KEY 或 OPENAI_API_KEY，請確認設定檔配置。");
    process.exit(1);
}

// === 抽樣 10 題 ===
const sampleQuestions = [];
const targetDir = path.resolve(__dirname, '../question/platform/G3/Chinese/S2/HanLin');
const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.json') && !f.includes('manifest'));

for (const file of files) {
    const json = JSON.parse(fs.readFileSync(path.join(targetDir, file), 'utf8'));
    if (json.questions) {
        for (const q of json.questions) {
            sampleQuestions.push(q);
            if (sampleQuestions.length >= 10) break;
        }
    }
    if (sampleQuestions.length >= 10) break;
}

// === API 呼叫與 Token 計算 ===
async function runTest() {
    console.log(`\n🔍 開始真金白銀 API 費率實測 (抽樣 ${sampleQuestions.length} 題)...\n`);
    
    // 統計變數
    let geminiInput = 0, geminiOutput = 0;
    let openaiInput = 0, openaiOutput = 0;

    for (let i = 0; i < sampleQuestions.length; i++) {
        const q = sampleQuestions[i];
        const prompt = `任務：根據題幹與四個選項，選出最合理的答案。回傳 JSON：{"answer_index": <0~3>}\n題幹：${q.question}\n選項 0: ${q.options[0]}\n選項 1: ${q.options[1]}\n選項 2: ${q.options[2]}\n選項 3: ${q.options[3]}`;
        
        process.stdout.write(`測驗 #${i+1} `);

        // 1. Gemini 測試
        try {
            const resG = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: "只回傳 JSON。" }] },
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
                })
            });
            const dataG = await resG.json();
            if (dataG.usageMetadata) {
                geminiInput += dataG.usageMetadata.promptTokenCount || 0;
                geminiOutput += dataG.usageMetadata.candidatesTokenCount || 0;
            }
            process.stdout.write(`[Gem: OK] `);
        } catch(e) { process.stdout.write(`[Gem: ERR] `); }

        // 2. OpenAI 測試
        try {
            const resO = await fetch(`https://api.openai.com/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openaiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", "content": "你是一位測試員，請以 JSON 格式回傳答案。格式範例: {\"answer_index\": 1}" },
                        { role: "user", "content": prompt }
                    ],
                    temperature: 0.1,
                    response_format: { type: "json_object" }
                })
            });
            const dataO = await resO.json();
            if (dataO.usage) {
                openaiInput += dataO.usage.prompt_tokens || 0;
                openaiOutput += dataO.usage.completion_tokens || 0;
            }
            process.stdout.write(`[OAI: OK]\n`);
        } catch(e) { process.stdout.write(`[OAI: ERR]\n`); }

        // 避免 429
        await new Promise(r => setTimeout(r, 4000));
    }

    console.log(`\n==========================================`);
    console.log(`📊 真實 Token 消耗統計 (10 題基準)`);
    console.log(`==========================================`);
    console.log(`【Gemini-2.5-Flash】 輸入: ${geminiInput} 輸出: ${geminiOutput}`);
    console.log(`【GPT-4o-mini】      輸入: ${openaiInput} 輸出: ${openaiOutput}`);
    
    // 依比例外推到 100 題
    const gIn100 = geminiInput * 10;
    const gOut100 = geminiOutput * 10;
    const oIn100 = openaiInput * 10;
    const oOut100 = openaiOutput * 10;

    // 計算美金成本 (依 2025 標準定價)
    // Gemini: Input $0.075 / 1M, Output $0.30 / 1M
    const gCostUSD = (gIn100 / 1000000 * 0.075) + (gOut100 / 1000000 * 0.30);
    
    // OpenAI: Input $0.15 / 1M, Output $0.60 / 1M
    const oCostUSD = (oIn100 / 1000000 * 0.15) + (oOut100 / 1000000 * 0.60);

    const usdToTwd = 32.5; // 近期匯率估算

    console.log(`\n💸 如果跑 100 題的真實帳單外推 (以 10 題平均值乘 10 倍):`);
    console.log(`【Gemini-2.5-Flash 所需付費估算】`);
    console.log(`   - 總消耗 Token: ${gIn100 + gOut100}`);
    console.log(`   - 帳單花費: $${gCostUSD.toFixed(5)} USD (約新台幣 NT$ ${(gCostUSD * usdToTwd).toFixed(3)} 元)`);

    console.log(`\n【GPT-4o-mini 所需付費估算】`);
    console.log(`   - 總消耗 Token: ${oIn100 + oOut100}`);
    console.log(`   - 帳單花費: $${oCostUSD.toFixed(5)} USD (約新台幣 NT$ ${(oCostUSD * usdToTwd).toFixed(3)} 元)`);
    console.log(`==========================================\n`);
}

runTest();
