const fs = require('fs');
const path = require('path');

// === 環境與組態 ===
const apiKeys = [];
const GLOBAL_ENV_PATH = fs.existsSync(path.resolve(__dirname, '../../ApiKeys.cfg')) 
    ? path.resolve(__dirname, '../../ApiKeys.cfg') 
    : path.resolve(__dirname, '../../Global_API_Keys.txt');

const DELAY_MAP = { free: 10000, tier1: 2000, paid: 1000 };
const BATCH_SIZE = 30;
const R4_MAPPING = {
    'Chinese': {
        'G3/S2': '三年級下學期_國語_發展綱要.md',
        'G6': '六年級下學期_國語_發展綱要.md'
    },
    'SocialStudies': {
        'G3/S2': 'G3_S2_社會發展綱要.md',
        'G4/S2': 'G4_S2_社會發展綱要.md',
        'G5/S1': 'G5_S1_社會發展綱要.md',
        'G5/S2': 'G5_S2_社會發展綱要.md',
        'G6/S2': 'G6_S2_社會_發展綱要.md'
    }
};

function getR4Path(targetDir) {
    let subject = '';
    if (targetDir.includes('Chinese')) subject = 'Chinese';
    else if (targetDir.includes('SocialStudies')) subject = 'SocialStudies';
    else if (targetDir.includes('Science')) subject = 'Science';
    else if (targetDir.includes('Math')) subject = 'Math';

    if (!subject) return null;

    const subjectZh = (subject === 'Chinese') ? '國語' : (subject === 'SocialStudies') ? '社會' : (subject === 'Science') ? '自然' : '數學';
    const baseDir = path.resolve(__dirname, '../knowledge/課綱研究/', subjectZh);

    const mapping = R4_MAPPING[subject];
    if (!mapping) return null;

    for (const [key, filename] of Object.entries(mapping)) {
        // 拆分 key (例如 G3/S2) 並檢查是否所有片段都出現在目標目錄中
        const parts = key.split('/');
        const isMatch = parts.every(part => targetDir.includes(part));
        if (isMatch) return path.join(baseDir, filename);
    }
    return null;
}

if (fs.existsSync(GLOBAL_ENV_PATH)) {
    const envFile = fs.readFileSync(GLOBAL_ENV_PATH, 'utf8');
    const lines = envFile.split('\n');
    let lastTier = 'free';
    lines.forEach(line => {
        const trimmedLine = line.trim();
        const tierMatch = trimmedLine.match(/\[(free|tier1|paid)\]/i);
        if (tierMatch) { lastTier = tierMatch[1].toLowerCase(); return; }
        if (!trimmedLine || trimmedLine.startsWith('#')) return;
        const [key, ...value] = trimmedLine.split('=');
        const val = value.join('=').trim().replace(/^['"]|['"]$/g, '');
        if (key.trim() === 'GEMINI_API_KEY' && val) apiKeys.push({ type: 'gemini', tier: lastTier, key: val });
        if (key.trim() === 'OPENAI_API_KEY' && val) apiKeys.push({ type: 'openai', tier: lastTier, key: val });
        lastTier = 'free';
    });
}
if (apiKeys.length === 0) { console.error(`❌ 找不到可用金鑰`); process.exit(1); }

let currentKeyIdx = 0;

// === Phase 0: 課綱萃取 (LLM-RAG) ===
const r4Cache = {};

async function extractR4Context(fullR4, lessonName) {
    if (r4Cache[lessonName]) return r4Cache[lessonName];

    console.log(`\n    🧠 啟動 LLM 萃取 [${lessonName}] 的專屬教學綱領...`);
    const prompt = `你是一位專業的國小課綱研究助理。請從以下發展綱要中，精準找出關於【${lessonName}】的教學研究精華。
要求：
1. 課文大意（文體、主題）
2. 教學目標重點
3. 考古題方向與錯誤陷阱
4. 繁體中文，精練不超過 600 字

發展綱要全文：
---
${fullR4}
---`;

    while (true) {
        const provider = apiKeys[currentKeyIdx];
        try {
            let text = '';
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000);

            if (provider.type === 'gemini') {
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${provider.key}`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.1 } }),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                if (res.status === 429) throw new Error('429');
                const data = await res.json();
                text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            } else {
                const res = await fetch(`https://api.openai.com/v1/chat/completions`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${provider.key}` },
                    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], temperature: 0.1 }),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                if (res.status === 429) throw new Error('429');
                const data = await res.json();
                text = data.choices[0].message.content;
            }
            if (!text) throw new Error('Empty response');
            r4Cache[lessonName] = text;
            console.log(`    ✅ [${lessonName}] 萃取完成。`);
            return text;
        } catch (e) {
            process.stdout.write(` [換Key重試: ${e.message}] `);
            currentKeyIdx = (currentKeyIdx + 1) % apiKeys.length;
            await new Promise(r => setTimeout(r, 5000));
        }
    }
}

// === Phase 1: 盲測 (30-in-1 BATCH) ===
function buildBatchPrompt(r4Context, batch) {
    const qText = batch.map((q, i) => {
        const opts = q.options.map((o, oi) => `  (${oi}) ${o}`).join('\n');
        return `### 第 ${i + 1} 題\n**題幹**：${q.question}\n**選項**：\n${opts}`;
    }).join('\n\n');

    return `你是一位擁有 20 年經驗的國小科資深命題審核專家。請根據課綱精華，獨立審查以下題目。

## 課綱重點 (R4)
${r4Context}

## 待審查題目 (共 ${batch.length} 題)
${qText}

## 回傳格式
請回傳純 JSON Array。
【警告】必須完整產出所有 ${batch.length} 題，不可中斷或省略。

格式如下：
[
  {
    "q_index": 1,
    "selected_answer": 0,
    "reasoning": "你的判斷理由 (50字以內)",
    "quality_rating": 3
  },
  ... (請繼續展開直到第 ${batch.length} 題)
]`;
}

function parseJSON(text) {
    let c = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    try { const j = JSON.parse(c); return Array.isArray(j) ? j : (j.results || j.data || null); } catch(e) {}
    const m = c.match(/\[[\s\S]*\]/);
    if (m) { try { return JSON.parse(m[0]); } catch(e) {} }
    return null;
}

async function evalBatch(prompt, batchCount) {
    while (true) {
        const provider = apiKeys[currentKeyIdx];
        try {
            let text = '', usedModel = '';
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000);

            if (provider.type === 'gemini') {
                usedModel = 'Gemini-3.1-Flash-Lite';
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${provider.key}`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.1, responseMimeType: 'application/json' } }),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                if (res.status === 429) throw new Error('429');
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            } else {
                usedModel = 'GPT-4o-mini';
                const res = await fetch(`https://api.openai.com/v1/chat/completions`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${provider.key}` },
                    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], temperature: 0.1, response_format: { type: 'json_object' } }),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                if (res.status === 429) throw new Error('429');
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                text = data.choices[0].message.content || '';
            }
            const parsed = parseJSON(text);
            if (parsed && parsed.length === batchCount) return { parsed, usedModel };
            throw new Error(`解析失敗或題數不符 (${parsed ? parsed.length : 0} vs ${batchCount})`);
        } catch (e) {
            process.stdout.write(` [換Key: ${e.message.split('\n')[0].substring(0,30)}] `);
            currentKeyIdx = (currentKeyIdx + 1) % apiKeys.length;
            await new Promise(r => setTimeout(r, 5000));
        }
    }
}




// === 主程式 ===
async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) { console.error("❌ 用法: node run_blind_eval.js <目錄>..."); process.exit(1); }

    console.log(`\n🔑 金鑰佈陣: ${apiKeys.map(k=>k.tier).join(', ')}`);
    console.log(`🚀 v5.0 深層驗證引擎啟動 (10-in-1 BATCH)`);

    let totalMatch = 0, totalMismatch = 0;

    for (const targetPath of args.map(a => path.resolve(a))) {
        if (!fs.existsSync(targetPath)) continue;
        const r4Path = getR4Path(targetPath);
        if (!r4Path || !fs.existsSync(r4Path)) { console.warn(`⚠️ 找不到對應的 R4 課綱，跳過: ${targetPath}`); continue; }
        const r4Full = fs.readFileSync(r4Path, 'utf8');

        const files = fs.readdirSync(targetPath).filter(f => f.endsWith('.json') && !f.includes('manifest'));
        for (const f of files) {
            const filePath = path.join(targetPath, f);
            const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            if (!json.questions) continue;

            const pending = json.questions.map((q, i) => ({ q, i })).filter(item => !item.q.blind_evaluation);
            if (pending.length === 0) continue;

            const lessonName = f.replace('.json', '');
            console.log(`\n📄 處理 ${f} (${pending.length} 題)`);
            const r4Context = await extractR4Context(r4Full, lessonName);

            for (let i = 0; i < pending.length; i += BATCH_SIZE) {
                const batchChunk = pending.slice(i, i + BATCH_SIZE);
                process.stdout.write(`  ▶ 發送批次 ${Math.floor(i/BATCH_SIZE)+1}/${Math.ceil(pending.length/BATCH_SIZE)}... `);

                const prompt = buildBatchPrompt(r4Context, batchChunk.map(item => item.q));
                const { parsed, usedModel } = await evalBatch(prompt, batchChunk.length);

                let batchMatches = 0;
                for (let j = 0; j < parsed.length; j++) {
                    const aiResult = parsed[j];
                    const qIdx = batchChunk[j].i;
                    const qObj = json.questions[qIdx];
                    const actualAns = qObj.answer_index !== undefined ? qObj.answer_index : qObj.answer;

                    const isMatch = aiResult.selected_answer === actualAns;
                    if (isMatch) { batchMatches++; totalMatch++; } else totalMismatch++;

                    qObj.blind_evaluation = true;
                    qObj.authoring_model = qObj.authoring_model || 'Gemini-2.5-Pro';
                    qObj.verifying_model = usedModel;
                    qObj.verifying_date = new Date().toISOString().slice(0, 10);
                    if (aiResult.quality_rating) qObj.cqi_score = aiResult.quality_rating;

                    if (!isMatch) {
                        qObj.blind_eval_mismatch = {
                            ai_selected: aiResult.selected_answer,
                            correct_answer: actualAns,
                            ai_reasoning: aiResult.reasoning || "無理由",
                            review_status: "pending"
                        };
                    } else delete qObj.blind_eval_mismatch;
                }
                
                console.log(`✅ 完工 (${batchMatches}/${batchChunk.length} Match) [${usedModel}]`);
                fs.writeFileSync(filePath, JSON.stringify(json, null, 2));

                const tier = apiKeys[currentKeyIdx].tier;
                await new Promise(r => setTimeout(r, DELAY_MAP[tier] || 5000));
            }
        }
    }
    const sum = totalMatch + totalMismatch;
    console.log(`\n🎉 盲審大調查結束！ 命中: ${totalMatch} / 失敗: ${totalMismatch} (${sum?((totalMatch/sum)*100).toFixed(1):0}%)`);
}

main().catch(console.error);
