const fs = require('fs');
const path = require('path');
const { isNetworkError } = require('./lib/llm_retry.js');

// 5xx + network error 退避重試上限（可由 env 覆寫）；超過印 EXIT_5XX/EXIT_NETWORK 後 process.exit(2)
function blindHandleRetry({ kind, status, err, retryCount, max }) {
    if (retryCount >= max) {
        if (kind === '5xx') {
            console.error(`\n[blind] 5xx 重試 ${max} 次仍失敗 (status=${status}) EXIT_5XX`);
            process.stdout.write('EXIT_5XX\n');
        } else {
            const code = (err.cause && err.cause.code) || err.code || err.message;
            console.error(`\n[blind] 網路錯誤重試 ${max} 次仍失敗 (${code}) EXIT_NETWORK`);
            process.stdout.write('EXIT_NETWORK\n');
        }
        process.exit(2);
    }
    const wait = Math.pow(3, retryCount) * 1000;
    const tag = kind === '5xx' ? `5xx (${status})` : `網路錯誤 ${(err.code || err.message)}`;
    console.warn(`\n[blind] ${tag}，等 ${wait / 1000}s 後重試（第 ${retryCount + 1}/${max} 次）...`);
    return new Promise(r => setTimeout(r, wait));
}

/** 原子寫入，降低盲測中斷時寫出半截 JSON 的風險（JOB-182 後記） */
function writeJsonAtomic(absPath, obj) {
    const dir = path.dirname(absPath);
    const base = path.basename(absPath);
    const tmp = path.join(dir, `.${base}.${process.pid}.${Date.now()}.tmp`);
    fs.writeFileSync(tmp, JSON.stringify(obj, null, 2), 'utf8');
    fs.renameSync(tmp, absPath);
}

// === 環境與組態 ===
const apiKeys = [];
const GLOBAL_ENV_PATH = path.resolve(__dirname, '../../ApiKeys.cfg');

const DELAY_MAP = { free: 20000, tier1: 2000, paid: 1000 };
const BATCH_SIZE = 10;
const R4_MAPPING = {
    'Chinese': {
        // 倉庫實際檔為 KL3 三下研究總綱（非舊名 G3_S2_國語_發展綱要.md）
        'G3/S2': path.join('三下', 'KL3_三下_國語_研究總綱.md'),
        'G4/S2': path.join('四下', 'KL3_四下_國語_發展綱要.md'),
        // 倉庫實際檔於 五下/（與 G4/S2 四下 同層級結構）
        'G5/S2': path.join('五下', 'KL3_五下_國語_發展綱要.md'),
        'G6/S2': '六年級下學期_國語_發展綱要.md'
    },
    'SocialStudies': {
        'G3/S2': '三下_社會_發展綱要.md',
        'G4/S2': '四下_社會_發展綱要.md',
        'G5/S1': '五上_社會_發展綱要.md',
        'G5/S2': '五下_社會_發展綱要.md',
        'G6/S2': '六下_社會_發展綱要.md'
    },
    'Math': {
        'G3/S1': '三上_數學_發展綱要.md',
        'G3/S2': '三下_數學_發展綱要.md',
        'G4/S2': '四下_數學_發展綱要.md',
        'G5/S1': '五上_數學_發展綱要.md',
        'G5/S2': '五下_數學_發展綱要.md',
        'G6/S2': '六下_數學_發展綱要.md'
    },
    // G3 英語：倉庫單一發展綱要檔（見 knowledge/1_課綱研究/英語/）
    'English': {
        'G3/S2': 'G3_S2_英語發展綱要.md'
    },
    'Science': {
        'G3/S2': '三下_自然_發展綱要.md',
        'G4/S2': '四下_自然_發展綱要.md',
        'G5/S1': '五上_自然_發展綱要.md',
        'G5/S2': '五下_自然_發展綱要.md',
        'G6/S2': '六下_自然_發展綱要.md'
    }
};

function getR4Path(targetDir) {
    let subject = '';
    if (targetDir.includes('Chinese')) subject = 'Chinese';
    else if (targetDir.includes('SocialStudies')) subject = 'SocialStudies';
    else if (targetDir.includes('Science')) subject = 'Science';
    else if (targetDir.includes('Math')) subject = 'Math';
    else if (targetDir.includes('English')) subject = 'English';

    if (!subject) return null;

    const subjectZh =
        subject === 'Chinese'
            ? '國語'
            : subject === 'SocialStudies'
              ? '社會'
              : subject === 'Science'
                ? '自然'
                : subject === 'English'
                  ? '英語'
                  : '數學';
    const baseDir = path.resolve(__dirname, '../knowledge/1_課綱研究/', subjectZh);

    const mapping = R4_MAPPING[subject];
    if (!mapping) return null;

    for (const [key, filename] of Object.entries(mapping)) {
        // 拆分 key (例如 G3/S2) 並檢查是否所有片段都出現在目標目錄中
        const parts = key.split('/');
        const isMatch = parts.every(part => targetDir.includes(part));
        if (isMatch) return path.isAbsolute(filename) ? filename : path.join(baseDir, filename);
    }
    return null;
}

/** KL4 單課研究檔根目錄 */
const KNOWLEDGE_BASE = path.resolve(__dirname, '../knowledge/1_課綱研究');

/** 科目英文→中文對照 */
const SUBJECT_EN_TO_ZH = { Chinese: '國語', Math: '數學', Science: '自然', SocialStudies: '社會', English: '英語' };

/** 年級+學期→中文學期名 */
const GRADE_SEM_TO_ZH = {
    'G3/S1': '三上', 'G3/S2': '三下', 'G4/S1': '四上', 'G4/S2': '四下',
    'G5/S1': '五上', 'G5/S2': '五下', 'G6/S1': '六上', 'G6/S2': '六下'
};

/**
 * 從題庫路徑取得出版社子資料夾名稱（康軒／翰林／南一）。
 */
function resolvePublisherZh(absFilePath) {
    const parts = absFilePath.split(path.sep);
    for (const seg of parts) {
        if (seg === 'KangHsuan') return '康軒';
        if (seg === 'HanLin') return '翰林';
        if (seg === 'NanYi') return '南一';
    }
    return null;
}

/**
 * 從檔名或 meta 取得課次鍵（L1、L2…）。
 */
function resolveLessonKeyFromFileOrMeta(filename, meta) {
    if (meta && typeof meta.lesson === 'string') {
        const t = meta.lesson.trim();
        if (/^L\d+$/i.test(t)) return t.replace(/^l/i, 'L');
    }
    const m = filename.match(/_L(\d+)[\._]/i);
    if (m) return `L${m[1]}`;
    return null;
}

/**
 * 從題庫路徑解析科目與年級學期。
 */
function resolveSubjectAndGradeSem(absFilePath) {
    let subject = null, grade = null, semester = null;
    for (const [en] of Object.entries(SUBJECT_EN_TO_ZH)) {
        if (absFilePath.includes(en)) { subject = en; break; }
    }
    const gm = absFilePath.match(/[/\\](G\d)[/\\]/);
    if (gm) grade = gm[1];
    const sm = absFilePath.match(/[/\\](S[12])[/\\]/);
    if (sm) semester = sm[1];
    return { subject, grade, semester };
}

/** 從 KL4 單課檔名取出課文標題（不含課次）。 */
function extractTitleFromKl4Filename(fn) {
    if (!fn || !fn.endsWith('_單課研究紀錄.md')) return null;
    const m = fn.match(/^KL4_.+_L\d+_(.+)_單課研究紀錄\.md$/);
    return m ? m[1].trim() : null;
}

/** 題庫 meta.title 與 KL4 檔內課名是否為同一課（避免 L1 檔配到錯誤 KL4）。 */
function titlesRoughlyMatch(metaTitle, kl4Title) {
    if (!metaTitle || !kl4Title) return false;
    const a = metaTitle.trim();
    const b = kl4Title.trim();
    if (a === b) return true;
    if (a.length >= 2 && b.includes(a)) return true;
    if (b.length >= 2 && a.includes(b)) return true;
    return false;
}

/**
 * 通用 KL4 單課研究檔查找。
 * 優先以 json.meta.title 與檔名中的課文標題比對，且 **KL4 檔名課次須與本 JSON 課次一致**；
 * 若標題對到他課（題庫 meta 誤植）則改以課次前綴選 KL4；再不行則 null（LLM 萃取）。
 */
function findKl4SingleLessonRecord(absFilePath, json) {
    const { subject, grade, semester } = resolveSubjectAndGradeSem(absFilePath);
    if (!subject || !grade || !semester) return null;

    const subjectZh = SUBJECT_EN_TO_ZH[subject];
    if (!subjectZh) return null;

    const semZh = GRADE_SEM_TO_ZH[`${grade}/${semester}`];
    if (!semZh) return null;

    const publisherZh = resolvePublisherZh(absFilePath);
    if (!publisherZh) return null;

    const dir = path.join(KNOWLEDGE_BASE, subjectZh, semZh, publisherZh);
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return null;

    const lessonKey = resolveLessonKeyFromFileOrMeta(path.basename(absFilePath), json && json.meta);

    let metaTitle =
        json && json.meta && typeof json.meta.title === 'string' && json.meta.title.trim()
            ? json.meta.title.trim()
            : '';
    // 占位標題（如 "L12"）不視為真課名，改走課次對應 KL4
    if (/^L\d+$/i.test(metaTitle)) metaTitle = '';

    if (metaTitle) {
        let all;
        try {
            all = fs.readdirSync(dir).filter(
                (f) =>
                    f.startsWith(`KL4_${semZh}_${publisherZh}_`) &&
                    f.endsWith('_單課研究紀錄.md')
            );
        } catch {
            return null;
        }
        const hits = [];
        for (const fn of all) {
            const t = extractTitleFromKl4Filename(fn);
            if (t && titlesRoughlyMatch(metaTitle, t)) hits.push(fn);
        }
        if (lessonKey) {
            const pre = `KL4_${semZh}_${publisherZh}_${lessonKey}_`;
            const aligned = hits.filter((f) => f.startsWith(pre));
            if (aligned.length === 1) return path.join(dir, aligned[0]);
            if (aligned.length > 1) {
                aligned.sort(
                    (x, y) =>
                        (extractTitleFromKl4Filename(y) || '').length -
                        (extractTitleFromKl4Filename(x) || '').length
                );
                return path.join(dir, aligned[0]);
            }
        } else if (hits.length === 1) {
            return path.join(dir, hits[0]);
        } else if (hits.length > 1) {
            hits.sort(
                (x, y) =>
                    (extractTitleFromKl4Filename(y) || '').length -
                    (extractTitleFromKl4Filename(x) || '').length
            );
            return path.join(dir, hits[0]);
        }
        // 標題與本檔課次不一致（hits 非空但無 aligned）→ 續用課次前綴
    }

    if (!lessonKey) return null;

    const prefix = `KL4_${semZh}_${publisherZh}_${lessonKey}_`;
    let files;
    try {
        files = fs.readdirSync(dir).filter(
            (f) => f.startsWith(prefix) && f.endsWith('_單課研究紀錄.md')
        );
    } catch {
        return null;
    }
    if (files.length === 0) return null;
    files.sort();
    return path.join(dir, files[0]);
}

const LOCAL_TMP_PATH = path.resolve(__dirname, '../ApiKeys.tmp');
const ENV_PATH = fs.existsSync(LOCAL_TMP_PATH) ? LOCAL_TMP_PATH : GLOBAL_ENV_PATH;

function inferTierFromKeyName(keyName, fallbackTier) {
    const u = keyName.toUpperCase();
    if (/_FREE\b|FREE_/i.test(keyName) || u.includes('_FREE')) return 'free';
    if (/TIER1|PAID/i.test(u)) return /PAID/i.test(u) ? 'paid' : 'tier1';
    return fallbackTier;
}

if (fs.existsSync(ENV_PATH)) {
    const envFile = fs.readFileSync(ENV_PATH, 'utf8');
    const lines = envFile.split('\n');
    let lastTier = 'free';
    lines.forEach(line => {
        const trimmedLine = line.trim();
        const tierMatch = trimmedLine.match(/\[(free|tier1|paid)\]/i);
        if (tierMatch) {
            lastTier = tierMatch[1].toLowerCase();
            return;
        }
        if (!trimmedLine || trimmedLine.startsWith('#')) return;
        const [key, ...value] = trimmedLine.split('=');
        const keyName = key.trim();
        const val = value.join('=').trim().replace(/^['"]|['"]$/g, '');
        if (!val || val === '""' || val === "''") return;
        const tier = inferTierFromKeyName(keyName, lastTier);
        if (keyName === 'GEMINI_API_KEY' || keyName.startsWith('GEMINI_API_KEY_')) {
            apiKeys.push({ type: 'gemini', tier, key: val });
        }
        if (keyName === 'OPENAI_API_KEY' || keyName.startsWith('OPENAI_API_KEY_')) {
            apiKeys.push({ type: 'openai', tier, key: val });
        }
    });
}
if (apiKeys.length === 0) {
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) {
        apiKeys.push({ type: 'gemini', tier: 'free', key: process.env.GEMINI_API_KEY.trim() });
    }
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim()) {
        apiKeys.push({ type: 'openai', tier: 'paid', key: process.env.OPENAI_API_KEY.trim() });
    }
}
if (apiKeys.length === 0) {
    console.error(`❌ 找不到可用金鑰（需 ApiKeys.cfg 內 GEMINI_API_KEY 或 GEMINI_API_KEY_*，或環境變數）`);
    process.exit(1);
}

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

    let net5xxRetry = 0;
    let netRetry = 0;
    const max5xx = global.BLIND_5XX_MAX_RETRIES ?? 3;
    const maxNet = global.BLIND_NET_MAX_RETRIES ?? 3;
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
                if (res.status >= 500 && res.status < 600) {
                    await blindHandleRetry({ kind: '5xx', status: res.status, retryCount: net5xxRetry, max: max5xx });
                    net5xxRetry++;
                    continue;
                }
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
                if (res.status >= 500 && res.status < 600) {
                    await blindHandleRetry({ kind: '5xx', status: res.status, retryCount: net5xxRetry, max: max5xx });
                    net5xxRetry++;
                    continue;
                }
                const data = await res.json();
                text = data.choices[0].message.content;
            }
            if (!text) throw new Error('Empty response');
            r4Cache[lessonName] = text;
            console.log(`    ✅ [${lessonName}] 萃取完成。`);
            return text;
        } catch (e) {
            if (isNetworkError(e)) {
                await blindHandleRetry({ kind: 'network', err: e, retryCount: netRetry, max: maxNet });
                netRetry++;
                continue;
            }
            process.stdout.write(` [換Key重試: ${e.message}] `);
            currentKeyIdx = (currentKeyIdx + 1) % apiKeys.length;
            await new Promise(r => setTimeout(r, 5000));
        }
    }
}

// === Phase 1: 盲測 (30-in-1 BATCH) ===
function buildBatchPrompt(r4Context, batch) {
    const qText = batch.map((q, i) => {
        if (!q.options) return `### 第 ${i + 1} 題\n**題幹**：${q.question}\n⚠️ [錯誤] 缺少選項數據`;
        const opts = q.options.map((o, oi) => `  (${oi}) ${o}`).join('\n');
        return `### 第 ${i + 1} 題\n**情境**：${q.scenario || "無"}\n**題幹**：${q.question}\n**選項**：\n${opts}`;
    }).join('\n\n');

    return `你是一位擁有 20 年經驗的國小數學教育專家與命題委員會核心成員。請根據課綱精華，以極度嚴謹的態度審查以下題目。

## 審查核心原則 (V6.1 絕對對齊)
1. **模擬求證 (Simulation First)**：在看選項前，請先根據題幹進行完整的兩步驟數學運算。
2. **選項比對 (Matching)**：將你的運算結果與選項 (0)~(3) 進行「逐字符」比對。
3. **對齊檢查 (Double Check)**：
   - 【警告】絕不可以推理說 "(1) 是對的" 但 selected_answer 填入 "0"。
   - 選項序號必須與你的理由文字 100% 一致。
4. **結構瑕疵偵測 (Flaw Labeling)**：
   - 若選項中「完全沒有」正確答案 -> 請回傳 selected_answer: -1。
   - 若題目描述有嚴重邏輯誤導或數據矛盾 -> 請回傳 selected_answer: -1。

## 課綱重點 (R4)
${r4Context}

## 待審查題目 (共 ${batch.length} 題)
${qText}

## 回傳格式 (JSON Array Only)
[
  {
    "q_index": 1,
    "selected_answer": 0,
    "reasoning": "運算結果為 X，對應到選項(0)的文字內容。再次核對：算式正解 X 與選項(0)完全一致。",
    "quality_rating": 3
  },
  ...
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
    let net5xxRetry = 0;
    let netRetry = 0;
    const max5xx = global.BLIND_5XX_MAX_RETRIES ?? 3;
    const maxNet = global.BLIND_NET_MAX_RETRIES ?? 3;
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
                if (res.status >= 500 && res.status < 600) {
                    await blindHandleRetry({ kind: '5xx', status: res.status, retryCount: net5xxRetry, max: max5xx });
                    net5xxRetry++;
                    continue;
                }
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
                if (res.status >= 500 && res.status < 600) {
                    await blindHandleRetry({ kind: '5xx', status: res.status, retryCount: net5xxRetry, max: max5xx });
                    net5xxRetry++;
                    continue;
                }
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                text = data.choices[0].message.content || '';
            }
            const parsed = parseJSON(text);
            if (parsed && parsed.length === batchCount) return { parsed, usedModel };
            throw new Error(`解析失敗或題數不符 (${parsed ? parsed.length : 0} vs ${batchCount})`);
        } catch (e) {
            if (isNetworkError(e)) {
                await blindHandleRetry({ kind: 'network', err: e, retryCount: netRetry, max: maxNet });
                netRetry++;
                continue;
            }
            process.stdout.write(` [換Key: ${e.message.split('\n')[0].substring(0,30)}] `);
            currentKeyIdx = (currentKeyIdx + 1) % apiKeys.length;
            await new Promise(r => setTimeout(r, 5000));
        }
    }
}




/**
 * S2 等目錄若僅含出版社子資料夾、無直接課檔，則回傳各子資料夾路徑（葉節點含課程 JSON）。
 */
function collectLeafJsonDirs(absRoot) {
    const results = [];
    function walk(d) {
        let entries;
        try {
            entries = fs.readdirSync(d, { withFileTypes: true });
        } catch {
            return;
        }
        const lessonJson = entries.filter(
            (e) => e.isFile() && e.name.endsWith('.json') && !e.name.includes('manifest')
        );
        if (lessonJson.length > 0) {
            results.push(d);
            return;
        }
        for (const e of entries) {
            if (e.isDirectory() && !e.name.startsWith('.')) walk(path.join(d, e.name));
        }
    }
    walk(absRoot);
    return results;
}

// === 主程式 ===
async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) { console.error("❌ 用法: node run_blind_eval.js <目錄> [--batch_size=N] [--force] [--only_mismatch]"); process.exit(1); }

    const force = args.includes('--force');
    const onlyMismatch = args.includes('--only_mismatch');
    const batchArg = args.find(a => a.startsWith('--batch_size='));
    const dynamicBatchSize = batchArg ? parseInt(batchArg.split('=')[1]) : BATCH_SIZE;

    console.log(`\n🔑 金鑰佈陣: ${apiKeys.map(k=>k.tier).join(', ')}`);
    console.log(`🚀 v5.0 深層驗證引擎啟動 (${dynamicBatchSize}-in-1 BATCH, force=${force}, mismatch_only=${onlyMismatch})`);

    let totalMatch = 0, totalMismatch = 0;

    for (const raw of args.filter(a => !a.startsWith('--'))) {
        const targetPath = path.resolve(raw);
        if (!fs.existsSync(targetPath)) continue;

        const isDir = fs.statSync(targetPath).isDirectory();
        /** @type {{ dir: string, files: string[] | null }[]} */
        let scanJobs = [];
        if (!isDir) {
            scanJobs = [{ dir: path.dirname(targetPath), files: [path.basename(targetPath)] }];
        } else {
            const leaves = collectLeafJsonDirs(targetPath);
            if (leaves.length > 0) {
                scanJobs = leaves.map((dir) => ({ dir, files: null }));
            } else {
                const top = fs
                    .readdirSync(targetPath)
                    .filter((f) => f.endsWith('.json') && !f.includes('manifest'));
                scanJobs = [{ dir: targetPath, files: top.length ? top : null }];
            }
        }

        for (const job of scanJobs) {
            const baseDir = job.dir;
            const r4Path = getR4Path(baseDir);
            if (!r4Path || !fs.existsSync(r4Path)) {
                console.warn(`⚠️ 找不到對應的 R4 課綱，跳過: ${baseDir}`);
                continue;
            }
            const r4Full = fs.readFileSync(r4Path, 'utf8');
            const files =
                job.files ||
                fs.readdirSync(baseDir).filter((f) => f.endsWith('.json') && !f.includes('manifest'));

            for (const f of files) {
                const filePath = path.join(baseDir, f);
                const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                if (!json.questions) continue;

                const pending = json.questions
                    .map((q, i) => ({ q, i }))
                    .filter(
                        (item) =>
                            (force || !item.q.blind_evaluation) &&
                            (!onlyMismatch || item.q.blind_eval_mismatch)
                    );

                if (pending.length === 0) continue;

                const lessonName = f.replace('.json', '');
                let metaTit =
                    json.meta && typeof json.meta.title === 'string' ? json.meta.title.trim() : '';
                if (/^L\d+$/i.test(metaTit)) metaTit = '';
                const lessonLabel = metaTit || lessonName;
                console.log(`\n📄 處理 ${path.relative(process.cwd(), filePath)} (${pending.length} 題)`);
                const kl4Path = findKl4SingleLessonRecord(filePath, json);
                let r4Context;
                if (kl4Path && fs.existsSync(kl4Path)) {
                    r4Context = fs.readFileSync(kl4Path, 'utf8');
                    console.log(`    📚 R4 使用 KL4 單課研究（略過 LLM 萃取）：${path.basename(kl4Path)}`);
                } else {
                    console.log(`    🧠 無對應 KL4 或課名不一致，以發展綱要 LLM 萃取課程：【${lessonLabel}】`);
                    r4Context = await extractR4Context(r4Full, lessonLabel);
                }

                for (let i = 0; i < pending.length; i += dynamicBatchSize) {
                    const batchChunk = pending.slice(i, i + dynamicBatchSize);
                    process.stdout.write(
                        `  ▶ 發送批次 ${Math.floor(i / dynamicBatchSize) + 1}/${Math.ceil(pending.length / dynamicBatchSize)}... `
                    );

                    const prompt = buildBatchPrompt(
                        r4Context,
                        batchChunk.map((item) => item.q)
                    );
                    const { parsed, usedModel } = await evalBatch(prompt, batchChunk.length);

                    let batchMatches = 0;
                    for (let j = 0; j < parsed.length; j++) {
                        const aiResult = parsed[j];
                        const qIdx = batchChunk[j].i;
                        const qObj = json.questions[qIdx];
                        const actualAns =
                            qObj.answer_index !== undefined ? qObj.answer_index : qObj.answer;

                        const isMatch = aiResult.selected_answer === actualAns;
                        if (isMatch) {
                            batchMatches++;
                            totalMatch++;
                        } else totalMismatch++;

                        qObj.blind_evaluation = true;
                        qObj.authoring_model = qObj.authoring_model || 'Gemini-2.5-Pro';
                        qObj.verifying_model = usedModel;
                        qObj.verifying_date = new Date().toISOString().slice(0, 10);
                        // 勿覆寫 CQI-P：品質分數另存，避免破壞 evaluate_question_quality.js 寫入之 cqi_score（JOB-165）
                        if (aiResult.quality_rating != null) {
                            qObj.blind_verify_quality_rating = aiResult.quality_rating;
                        }

                        if (!isMatch) {
                            qObj.blind_eval_mismatch = {
                                ai_selected: aiResult.selected_answer,
                                correct_answer: actualAns,
                                ai_reasoning: aiResult.reasoning || '無理由',
                                review_status: 'pending',
                            };
                        } else delete qObj.blind_eval_mismatch;
                    }

                    console.log(`✅ 完工 (${batchMatches}/${batchChunk.length} Match) [${usedModel}]`);
                    writeJsonAtomic(filePath, json);

                    const tier = apiKeys[currentKeyIdx].tier;
                    await new Promise((r) => setTimeout(r, DELAY_MAP[tier] || 5000));
                }
            }
        }
    }
    const sum = totalMatch + totalMismatch;
    console.log(`\n🎉 盲審大調查結束！ 命中: ${totalMatch} / 失敗: ${totalMismatch} (${sum?((totalMatch/sum)*100).toFixed(1):0}%)`);
}

main().catch(console.error);
