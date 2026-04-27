const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { isNetworkError } = require('./lib/llm_retry.js');

// ============================================================================
// AI 大腦自動化題庫生成腳本 (Auto Question Generator - Gemini Version)
// ============================================================================
// 執行方式: node scripts/auto_generate_questions.js <平台路徑>
// 例如: node scripts/auto_generate_questions.js question/platform/G3/Chinese/S2/KangHsuan
// 限流相關（遇 429 建議加 --conservative）：
//   --conservative          保守預設：qpm=2、batch 較小、檔間 15s、429 首次等 90s、批次間至少 45s
//   --inter-file-ms <n>     每個 JSON 處理完畢後再延遲 n 毫秒（預設 3000）
//   --429-wait-ms <n>       首次 429 等待毫秒（之後指數退避，上限 300s）
//   --429-max-retries <n>   429 最多遞迴重試次數（預設 8，--conservative 預設 6）
//   --min-batch-gap-sec <n> 兩批產題之間至少間隔秒數（預設 15）
// ============================================================================

const TARGET_QUESTIONS = 30; // 目標擴充至 30 題
const DEFAULT_MODEL = "gemini-3.1-flash"; // 預設模型 (採用免費優質 3.1 系列)

// 從 0_AI_Project 專案根目錄讀取全域金鑰設定檔 (非隱藏檔)
const GLOBAL_ENV_PATH = path.resolve(__dirname, '../../ApiKeys.cfg');
try {
    if (fs.existsSync(GLOBAL_ENV_PATH)) {
        const envFile = fs.readFileSync(GLOBAL_ENV_PATH, 'utf8');
        envFile.split('\n').forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.startsWith('#')) {
                const [key, ...value] = trimmedLine.split('=');
                if (key && value.length) {
                    const val = value.join('=').trim().replace(/^['"]|['"]$/g, '');
                    // 避免後續空 GEMINI_API_KEY= 覆蓋有效金鑰
                    if (val !== '') process.env[key.trim()] = val;
                }
            }
        });
    }
} catch (e) {
    console.warn(`⚠️ [警告] 無法讀取全域金鑰設定檔 (${GLOBAL_ENV_PATH}): ${e.message}`);
    console.warn(`👉 將嘗試使用環境變數中的 GEMINI_API_KEY...`);
}

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn(`⚠️ [警告] 找不到 GEMINI_API_KEY 環境變數。將嘗試透過後方動態載入機制處理...`);
}

// 遞迴取得所有 .json 檔案
function getJsonFiles(dir, pattern = null) {
    let results = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
        if (file === '.DS_Store') continue;
        const fullPath = path.join(dir, file);
        try {
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                results = results.concat(getJsonFiles(fullPath, pattern));
            } else if (file.endsWith('.json') && !file.includes('manifest')) {
                if (!pattern || new RegExp(pattern).test(file)) {
                    results.push(fullPath);
                }
            }
        } catch (e) {
            console.warn(`⚠️ 跳過無法存取的路徑: ${fullPath}`);
        }
    }
    return results;
}

/** 題庫 JSON 的 meta（兼容根節點扁平舊欄位） */
function getBankMeta(jsonObj) {
    const m = jsonObj.meta || {};
    const title = m.title || jsonObj.lesson_title;
    // JOB-205 防破窗：title 缺失或為 LN 佔位符時拋錯，避免產生 AI 幻覺題目
    if (!title || /^L\d+$/.test(title)) {
        const lessonId = m.lesson || jsonObj.lesson_id || '(unknown)';
        throw new Error(
            `[auto_generate_questions.js] 課名缺失或為佔位符：lesson=${lessonId}，title=${title || '(empty)'}\n` +
            `  需先補 KL4 研究並於 meta.title 填入真實課名。\n` +
            `  JOB-184 事故根因：無真實 title 時產題容易題目錯放（見 docs/技術設定/JOB-184-批次建檔事故分析.md）。`
        );
    }
    return {
        grade: m.grade || jsonObj.grade,
        semester: m.semester || jsonObj.semester,
        publisher: m.publisher || jsonObj.publisher,
        lesson: m.lesson || jsonObj.lesson_id,
        title,
        subject: m.subject || jsonObj.subject,
    };
}

const GRADE_SEM_TO_DIR = {
    G1: { S1: '一上', S2: '一下' },
    G2: { S1: '二上', S2: '二下' },
    G3: { S1: '三上', S2: '三下' },
    G4: { S1: '四上', S2: '四下' },
    G5: { S1: '五上', S2: '五下' },
    G6: { S1: '六上', S2: '六下' },
};

const PUBLISHER_TO_DIR = {
    HANLIN: '翰林',
    KANGHSUAN: '康軒',
    NANYI: '南一',
};

/** 四下自然：KL4 單課研究紀錄（與 JOB-168 / G4S2 派工路徑一致） */
const KNOWLEDGE_SCIENCE_G4S2 = path.resolve(__dirname, '../knowledge/1_課綱研究/自然/四下');

/** 四下社會：KL4 單課研究紀錄（JOB-170 / JOB-171） */
const KNOWLEDGE_SOCIAL_G4S2 = path.resolve(__dirname, '../knowledge/1_課綱研究/社會/四下');

/** 五下社會：KL4 單課研究紀錄（JOB-184 / G5S2） */
const KNOWLEDGE_SOCIAL_G5S2 = path.resolve(__dirname, '../knowledge/1_課綱研究/社會/五下');

/** G4／G5 下學期社會題庫路徑（用於 KL4 載入與四選一 MCQ 清洗） */
function isG4S2SocialStudies(filePath) {
    return (
        filePath.includes('SocialStudies') &&
        filePath.includes('G4') &&
        filePath.includes('S2')
    );
}

function isG5S2SocialStudies(filePath) {
    return (
        filePath.includes('SocialStudies') &&
        filePath.includes('G5') &&
        filePath.includes('S2')
    );
}

/** 小學四～五年級下學期社會：與 KL4 研究目錄對應之題庫 */
function isElementaryS2SocialStudiesMcq(filePath) {
    return isG4S2SocialStudies(filePath) || isG5S2SocialStudies(filePath);
}

/**
 * 載入自然科單課 KL4 研究全文，供產題提示詞使用
 */
function loadScienceKl4StudyText(jsonObj, filePath) {
    const meta = getBankMeta(jsonObj);
    const pubCN = PUBLISHER_TO_DIR[meta.publisher];
    let lesson = meta.lesson;
    if (!lesson) {
        const m = filePath.match(/L\d+/i);
        lesson = m ? m[0] : null;
    }
    if (lesson) {
        const n = String(lesson).match(/(\d+)/);
        lesson = n ? `L${n[1]}` : null;
    }
    if (!pubCN || !lesson) return '';
    const dir = path.join(KNOWLEDGE_SCIENCE_G4S2, pubCN);
    if (!fs.existsSync(dir)) {
        console.warn(`⚠️ [自然] 無研究目錄：${dir}`);
        return '';
    }
    let files;
    try {
        files = fs.readdirSync(dir);
    } catch {
        return '';
    }
    const prefix = `KL4_四下_${pubCN}_${lesson}_`;
    const study = files.find((f) => f.startsWith(prefix) && f.endsWith('_單課研究紀錄.md'));
    if (!study) {
        console.warn(`⚠️ [自然] 找不到 KL4 單課研究（前綴 ${prefix}）`);
        return '';
    }
    const full = path.join(dir, study);
    const text = fs.readFileSync(full, 'utf8');
    console.log(`📖 [自然] KL4 單課研究：${study}（${text.length} 字）`);
    const maxChars = 200000;
    return text.length > maxChars ? `${text.slice(0, maxChars)}\n…（已截斷）` : text;
}

/**
 * 載入社會科（四下／五下）單課 KL4 研究全文，並附「考古題與討論」摘要（供考點方向，禁止抄題）
 */
function loadSocialKl4StudyText(jsonObj, filePath) {
    const meta = getBankMeta(jsonObj);
    const pubCN = PUBLISHER_TO_DIR[meta.publisher];
    let lesson = meta.lesson;
    if (!lesson) {
        const m = filePath.match(/L\d+/i);
        lesson = m ? m[0] : null;
    }
    if (lesson) {
        const n = String(lesson).match(/(\d+)/);
        lesson = n ? `L${n[1]}` : null;
    }
    if (!pubCN || !lesson) return '';
    const grade = meta.grade || (filePath.includes('G5') ? 'G5' : 'G4');
    const semLabel = grade === 'G5' ? '五下' : '四下';
    const knowledgeRoot = grade === 'G5' ? KNOWLEDGE_SOCIAL_G5S2 : KNOWLEDGE_SOCIAL_G4S2;
    const dir = path.join(knowledgeRoot, pubCN);
    if (!fs.existsSync(dir)) {
        console.warn(`⚠️ [社會] 無研究目錄：${dir}`);
        return '';
    }
    let files;
    try {
        files = fs.readdirSync(dir);
    } catch {
        return '';
    }
    const prefix = `KL4_${semLabel}_${pubCN}_${lesson}_`;
    const study = files.find((f) => f.startsWith(prefix) && f.endsWith('_單課研究紀錄.md'));
    if (!study) {
        console.warn(`⚠️ [社會] 找不到 KL4 單課研究（前綴 ${prefix}）`);
        return '';
    }
    const full = path.join(dir, study);
    let text = fs.readFileSync(full, 'utf8');
    console.log(`📖 [社會] KL4 單課研究：${study}（${text.length} 字）`);
    const examFile = files.find((f) => f.startsWith(prefix) && f.endsWith('_考古題與討論.md'));
    if (examFile) {
        const examPath = path.join(dir, examFile);
        try {
            const examText = fs.readFileSync(examPath, 'utf8');
            const examCap = 80000;
            const examSlice = examText.length > examCap ? `${examText.slice(0, examCap)}\n…（考古題檔已截斷）` : examText;
            text += `\n\n---\n\n【KL4 考古題與討論（僅供考點與迷思方向；嚴禁抄寫原題幹／選項）】\n\n${examSlice}`;
            console.log(`📖 [社會] 已併入考古題與討論：${examFile}（併入後總字數 ${text.length}）`);
        } catch (e) {
            console.warn(`⚠️ [社會] 無法讀取考古題檔：${examFile}（${e.message}）`);
        }
    }
    const maxChars = 200000;
    return text.length > maxChars ? `${text.slice(0, maxChars)}\n…（已截斷）` : text;
}

/** 自然科 API 新題：對齊派工單欄位與四選一格式 */
function normalizeScienceGeneratedQuestion(q) {
    if (!q || !Array.isArray(q.options) || q.options.length !== 4) return null;
    const ai = q.answer_index;
    if (typeof ai !== 'number' || ai < 0 || ai > 3) return null;
    const scenario = (q.scenario && String(q.scenario).trim()) ? String(q.scenario).trim() : '【課堂探究時】';
    const cm = (q.commonMisconception && String(q.commonMisconception).trim())
        ? String(q.commonMisconception).trim()
        : '學生常將表面現象與成因混淆，宜對照觀察紀錄逐步推敲。';
    let ql = q.quality_level;
    if (!ql || !String(ql).startsWith('QL')) {
        const m = ql && String(ql).match(/\d+/);
        ql = m ? `QL${m[0]}` : 'QL3';
    }
    return {
        taxonomy: q.taxonomy || 'inferential',
        scenario,
        question: q.question || '',
        options: q.options,
        answer_index: ai,
        explanation: q.explanation || '',
        commonMisconception: cm,
        quality_level: ql,
        cqi_score: typeof q.cqi_score === 'number' ? q.cqi_score : 6,
        blind_evaluation: false,
        is_publishable: false,
        review_status: 'pending_review',
        review_notes: '',
        reviewer: null,
        review_date: null
    };
}

// 知識庫在 repo 根（scripts 上一層），勿用 ../../ 誤指到 0_AI_Project 同層
const KNOWLEDGE_CHINESE_ROOT = path.resolve(__dirname, '../knowledge/1_課綱研究/國語');

/**
 * 自 KL4 單課研究紀錄.md 截取「課文全文錄製」區塊（RC-01）
 */
function extractLessonBodyFromKl4Markdown(md) {
    const match = md.match(/###\s*1\.\s*課文全文錄製[^\n]*/);
    if (!match) return '';
    const start = match.index + match[0].length;
    const tail = md.slice(start);
    const lines = tail.split(/\r?\n/);
    const buf = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (/^---\s*$/.test(line)) break;
        if (/^##\s+/.test(line)) break;
        if (i > 0 && /^###\s+/.test(line)) break;
        buf.push(line.replace(/^>\s?/, ''));
    }
    return buf.join('\n').replace(/^\*\*課文標題：.*\*\*\s*$/gm, '').replace(/^\*\*來源：.*\*\*\s*$/gm, '').replace(/^\*\*作者：.*\*\*\s*$/gm, '').trim();
}

/**
 * 尋找該課 KL4 雙檔（檔名與倉庫慣例：KL4_<學期>_<版本>_<課次>_…）
 */
function findKl4ChinesePair(grade, semester, publisher, lesson) {
    const semDir = GRADE_SEM_TO_DIR[grade] && GRADE_SEM_TO_DIR[grade][semester];
    const pubDir = PUBLISHER_TO_DIR[publisher];
    if (!semDir || !pubDir || !lesson) return null;
    const dir = path.join(KNOWLEDGE_CHINESE_ROOT, semDir, pubDir);
    if (!fs.existsSync(dir)) return { dir, semDir, pubDir, lesson, missingDir: true };
    let files;
    try {
        files = fs.readdirSync(dir);
    } catch {
        return null;
    }
    const prefix = `KL4_${semDir}_${pubDir}_${lesson}_`;
    const study = files.find((f) => f.startsWith(prefix) && f.endsWith('_單課研究紀錄.md'));
    const exam = files.find((f) => f.startsWith(prefix) && f.endsWith('_考古題與討論.md'));
    return {
        dir,
        semDir,
        pubDir,
        lesson,
        study,
        exam,
        studyPath: study ? path.join(dir, study) : null,
        examPath: exam ? path.join(dir, exam) : null,
    };
}

const KL3_CHINESE_INDEX = 'knowledge/1_課綱研究/國語/KL3_國語_研究進度_課文與索引.md';

/** 讀取國語課文：僅自 KL4 單課研究紀錄「課文全文錄製」；不齊備則略過並註記 */
function loadChineseLessonText(jsonObj, filePath) {
    const meta = getBankMeta(jsonObj);
    let lesson = meta.lesson;
    if (!lesson) {
        const m = filePath.match(/L\d+/i);
        lesson = m ? m[0] : null;
    }
    if (lesson) {
        const n = String(lesson).match(/(\d+)/);
        lesson = n ? `L${n[1]}` : null;
    }

    const pair = findKl4ChinesePair(meta.grade, meta.semester, meta.publisher, lesson);
    const minLessonChars = 40;
    const minExamBytes = 80;

    if (pair && !pair.missingDir) {
        if (!pair.study || !pair.exam) {
            console.error(`【資料不齊備】[國語] ${path.basename(filePath)}：缺 KL4 雙檔（單課研究紀錄 + 考古題與討論）。`);
            console.error(`   目錄：${pair.dir}（預期前綴 KL4_${pair.semDir}_${pair.pubDir}_${lesson}_）`);
            console.error(`   請依 ${KL3_CHINESE_INDEX} 對照課文與課次，將研究檔補完整後再產題。`);
            return { text: '', ok: false, source: 'kl4-incomplete' };
        }
        const examStat = fs.statSync(pair.examPath);
        if (examStat.size < minExamBytes) {
            console.error(`【資料不齊備】[國語] ${path.basename(filePath)}：考古題與討論檔過短或空（${pair.exam}）。`);
            console.error(`   請依 ${KL3_CHINESE_INDEX} 補齊該課研究檔後再產題。`);
            return { text: '', ok: false, source: 'kl4-exam-short' };
        }
        const md = fs.readFileSync(pair.studyPath, 'utf8');
        const body = extractLessonBodyFromKl4Markdown(md);
        if (body.length < minLessonChars) {
            console.error(`【資料不齊備】[國語] ${path.basename(filePath)}：單課研究紀錄缺「課文全文錄製」或內容過短。`);
            console.error(`   檔案：${pair.studyPath}`);
            console.error(`   請依 ${KL3_CHINESE_INDEX} 將課文寫入 RC-01 區塊並成對補齊考古檔後再產題。`);
            return { text: '', ok: false, source: 'kl4-body-short' };
        }
        console.log(`📖 [國語] 課文來源：KL4 單課研究紀錄（${pair.study}），${body.length} 字`);
        return { text: body, ok: true, source: 'kl4-study', studyFile: pair.study };
    }

    console.error(`【資料不齊備】[國語] ${path.basename(filePath)}：無法自 KL4 載入課文（目錄或學期／版本／課次無法對應）。`);
    if (pair && pair.missingDir) {
        console.error(`   缺少目錄：${pair.dir}`);
    } else if (!pair) {
        console.error(`   請確認 meta：grade=${meta.grade} semester=${meta.semester} publisher=${meta.publisher} lesson=${lesson}`);
    }
    console.error(`   請先閱讀 ${KL3_CHINESE_INDEX}（含課文與課次連結），補齊該課 KL4 雙檔與課文全文錄製後再產題。`);
    return { text: '', ok: false, source: 'data-incomplete' };
}

// 建立呼叫 Gemini 的非同步函數
async function callLLM(prompt, currentQuestionsSize, totalNeeded, filePath = "", retryCount = 0) {
    console.log(`🤖 正在呼叫 Gemini 引擎... (預計生成 ${totalNeeded} 題)`);

    // 判斷學科以動態載入相應的 System 預設人格 
    const isMath = filePath.includes('Math');
    const isSocial = filePath.includes('Social');
    const isScience = filePath.includes('Science');
    const isEnglish = filePath.includes('English');
    const isLife = filePath.includes('Life');
    let subjectExpertise = "小學國語教育";
    let extraFocus = "設計閱讀測驗";
    let outlineDoc = "《KL2_國語科共同發展總綱》";

    if (isMath) {
        subjectExpertise = "小學數學教育";
        extraFocus = "設計大腦友善的生活情境數學應用題，絕不出現純粹的數字計算題";
        outlineDoc = "《KL2_數學科共同發展總綱》";
    } else if (isSocial) {
        subjectExpertise = "小學社會科教育";
        extraFocus = "設計結合生活場景與道德社會兩難的反思題";
        outlineDoc = "《KL2_社會科共同發展總綱》";
    } else if (isScience) {
        subjectExpertise = "小學自然科學教育";
        let scienceFocus = "設計強調觀察邏輯、實驗步驟與生態常識的情境題";
        if (filePath.includes('G5')) {
            scienceFocus += "。\n特別注意針對五年級的認知成熟度，必須在干擾選項中寫入常見的『直覺物理偏誤』、『擬人化目的論（如：植物開花是為了報答鳥類）』與『能量物質混淆（如：把肥料當成植物的便當）』等迷思。若題型為實驗題，必須考驗『控制變因瑕疵』。當解答為迷思除錯時，explanation 解析欄位必須明確且溫柔地打破該迷思！";
        }
        extraFocus = scienceFocus;
        outlineDoc = "《KL2_自然科共同發展總綱》";
    } else if (isEnglish) {
        subjectExpertise = "小學英語教學專家";
        extraFocus = "設計符合溝通式教學法 (CLT) 的真實生活對象與語用情境，避免中式英文";
        outlineDoc = "《KL2_英語科共同發展總綱》";
    } else if (isLife) {
        subjectExpertise = "低年級生活課程專家";
        extraFocus = "設計強調五官感知、常規建立與校園生活探索的統整性情境題";
        outlineDoc = "《00_生活科共同發展總綱》";
    }

    const isG5SocialS2 = filePath.includes('G5') && filePath.includes('SocialStudies') && filePath.includes('S2');
    const cognitiveInstruction = isG5SocialS2
        ? `請根據「大腦友善三原則」與「高年級（G5）認知配比」：literal（事實提取）約 20%、inferential／applied（推論與應用）約 30%、詮釋整合與評估批判（含 critical）約 50%，勿過度集中在純記憶題；並以此來${extraFocus}。`
        : `請根據「大腦友善三原則」與「中年級 4-4-2 認知動態配比」來${extraFocus}。`;

    try {
        const modelName = process.env.GEMINI_MODEL || DEFAULT_MODEL;
        const activeApiKey = process.env.GEMINI_API_KEY;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${activeApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{
                        text: `你是一位充滿熱忱的${subjectExpertise}學者，同時也是一位深愛孩子的父母。
你要秉持著讓孩子學得更好、更廣的心情來幫助他們複習課業。
你的任務是熟讀${outlineDoc}所確立的標準，並嚴守「命題心法與角色界線」：
1. 構思題幹情境時，你是個【擅長說故事的生活家】，情境必須絕對自然、符合真實生活，絕不能為了設陷阱而硬湊不合理的對話。
2. 設計誘答選項時，你是【嚴謹的教育心理層次分析師】，利用學生的認知迷思（隱蔽性誘答）來精準鑑定能力。
${cognitiveInstruction}
長情境題幹必須使用【在xxx時】標籤。
請以 JSON 格式回傳，格式必需為一個包含 new_questions 陣列的物件。
🎯 極重要：請隨機分配 answer_index (0-3)，嚴禁大比例將答案集中在 0 或任何單一數字！
{
  "new_questions": [
    {
      "taxonomy": "literal / inferential / contextual / critical",
      "scenario": "情境與測驗標籤",
      "question": "題幹...",
      "options": ["A", "B", "C", "D"],
      "answer_index": 0,
      "explanation": "原因與推導...",
      "commonMisconception": "易錯迷思分析...",
      "quality_level": "L4",
      "cqi_score": 9.5
    }
  ]
}`
                    }]
                },
                contents: [{
                    role: "user",
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    responseMimeType: "application/json"
                }
            })
        });

        if (response.status === 429) {
            const maxR = global.GEN_429_MAX_RETRIES ?? 8;
            if (retryCount >= maxR) {
                console.error(
                    `[API] 仍回傳 429，已達最大重試 ${maxR} 次。請稍後再執行（建議 10～60 分鐘後），或改用 --conservative / 更低 --qpm。`
                );
                return [];
            }
            const base = global.GEN_429_WAIT_MS || 35000;
            const waitMs = Math.min(base * Math.pow(2, retryCount), 300000);
            console.warn(
                `[API] 觸發限制 (429)。等待 ${(waitMs / 1000).toFixed(0)} 秒後重試（第 ${retryCount + 1}/${maxR} 次，指數退避）...`
            );
            await new Promise((r) => setTimeout(r, waitMs));
            return callLLM(prompt, currentQuestionsSize, totalNeeded, filePath, retryCount + 1);
        }

        // 5xx 退避重試（與 429 同精神）：1s/3s/9s 上限 max5xx 次，超過印 EXIT_5XX
        if (response.status >= 500 && response.status < 600) {
            const max5xx = global.GEN_5XX_MAX_RETRIES ?? 3;
            if (retryCount >= max5xx) {
                console.error(`[API] 5xx 重試 ${max5xx} 次仍失敗（status=${response.status}）EXIT_5XX`);
                process.stdout.write('EXIT_5XX\n');
                return [];
            }
            const wait5xx = Math.pow(3, retryCount) * 1000;
            console.warn(`[API] 5xx (${response.status})，等 ${wait5xx / 1000}s 後重試（第 ${retryCount + 1}/${max5xx} 次）...`);
            await new Promise(r => setTimeout(r, wait5xx));
            return callLLM(prompt, currentQuestionsSize, totalNeeded, filePath, retryCount + 1);
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API 錯誤: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            return [];
        }

        const content = data.candidates[0].content.parts[0].text;
        // Strip out codeblock markdown and control characters that break JSON parsing
        let jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
        // Remove unescaped control characters (0x00-0x1F) from the string, except common ones safely handled
        jsonStr = jsonStr.replace(/[\u0000-\u001F]/g, '');
        const parsed = JSON.parse(jsonStr);

        // 洗牌邏輯，打散 answer_index
        if (parsed.new_questions && Array.isArray(parsed.new_questions)) {
            parsed.new_questions.forEach(q => {
                if (q.options && typeof q.answer_index === 'number') {
                    const correctAnswer = q.options[q.answer_index];
                    const finalOptions = [...q.options];
                    // 隨機重排
                    for (let i = finalOptions.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [finalOptions[i], finalOptions[j]] = [finalOptions[j], finalOptions[i]];
                    }

                    let newAnswerIndex = finalOptions.indexOf(correctAnswer);

                    // 📐 加強防盲猜：確保正確解答絕對不是最長的選項
                    let lengths = finalOptions.map(o => String(o).length);
                    let maxLength = Math.max(...lengths);

                    if (lengths[newAnswerIndex] === maxLength) {
                        // 挑選一個非答案的選項進行擴寫，直到它比正確答案長
                        let targetIdx = (newAnswerIndex + 1) % 4;
                        const fillers = ["，這點在實務上很重要。", "，並且需要經過深思熟慮的考量。", "，這也是作者想強調的重點之一。"];
                        while (String(finalOptions[targetIdx]).length <= String(finalOptions[newAnswerIndex]).length) {
                            finalOptions[targetIdx] += fillers[Math.floor(Math.random() * fillers.length)];
                        }
                    }

                    q.options = finalOptions;
                    q.answer_index = finalOptions.indexOf(correctAnswer);
                }
            });
        }

        return parsed.new_questions || [];

    } catch (error) {
        // network error（DNS/connection/socket 層）值得退避重試；其他（JSON parse、API throw）吞回 []
        if (isNetworkError(error)) {
            const maxNet = global.GEN_NET_MAX_RETRIES ?? 3;
            const errCode = (error.cause && error.cause.code) || error.code || error.message;
            if (retryCount >= maxNet) {
                console.error(`[API] 網路錯誤重試 ${maxNet} 次仍失敗 (${errCode}) EXIT_NETWORK`);
                process.stdout.write('EXIT_NETWORK\n');
                return [];
            }
            const waitNet = Math.pow(3, retryCount) * 1000;
            console.warn(`[API] 網路錯誤 ${errCode}，等 ${waitNet / 1000}s 後重試（第 ${retryCount + 1}/${maxNet} 次）...`);
            await new Promise(r => setTimeout(r, waitNet));
            return callLLM(prompt, currentQuestionsSize, totalNeeded, filePath, retryCount + 1);
        }

        console.error('❌ Gemini 引擎連線失敗或解析錯誤:', error.message);
        return [];
    }
}

async function processFile(filePath) {
    console.log(`\n📄 正在讀取: ${filePath}`);
    const rawData = fs.readFileSync(filePath, 'utf8');
    let jsonObj;

    try {
        jsonObj = JSON.parse(rawData);
    } catch (e) {
        console.error(`❌ 解析 JSON 失敗，跳過此檔: ${filePath}`);
        return;
    }

    if (!jsonObj.questions || !Array.isArray(jsonObj.questions)) {
        console.log(`⚠️ 找不到 questions 陣列，跳過此檔。`);
        return;
    }

    /** G4／G5 S2 社會：移除非法題（非四選一、answer_index 非 0–3），避免殘留是非／填空 */
    if (isElementaryS2SocialStudiesMcq(filePath)) {
        const origLen = jsonObj.questions.length;
        jsonObj.questions = jsonObj.questions.filter((q) => {
            if (!Array.isArray(q.options) || q.options.length !== 4) return false;
            const ai = q.answer_index;
            return typeof ai === 'number' && ai >= 0 && ai <= 3;
        });
        if (jsonObj.questions.length !== origLen) {
            console.log(
                `🧹 [社會 G4/G5 S2] 已移除 ${origLen - jsonObj.questions.length} 題（須為四選一且 answer_index 為 0–3）`
            );
            fs.writeFileSync(filePath, JSON.stringify(jsonObj, null, 2), 'utf8');
        }
    }

    let lessonText = "";
    let scienceKl4Text = "";
    let socialKl4Text = "";
    const bankMeta = getBankMeta(jsonObj);
    const isChinese = bankMeta.subject === "CHI" || filePath.includes('Chinese');
    if (isChinese) {
        const loaded = loadChineseLessonText(jsonObj, filePath);
        if (!loaded.ok) return;
        lessonText = loaded.text;
    } else if (filePath.includes('Science')) {
        scienceKl4Text = loadScienceKl4StudyText(jsonObj, filePath);
        if (!scienceKl4Text) {
            console.warn(`⚠️ [自然] KL4 單課研究未載入，將僅依課名與課綱產題：${path.basename(filePath)}`);
        }
    } else if (isElementaryS2SocialStudiesMcq(filePath)) {
        socialKl4Text = loadSocialKl4StudyText(jsonObj, filePath);
        if (!socialKl4Text) {
            console.warn(`⚠️ [社會] KL4 單課研究未載入，將僅依課名產題：${path.basename(filePath)}`);
        }
    }

    const targetQuestions = global.GEN_TARGET || 30;
    const initialCount = jsonObj.questions.length;
    const threshold =
        typeof global.GEN_THRESHOLD === 'number' && !Number.isNaN(global.GEN_THRESHOLD)
            ? global.GEN_THRESHOLD
            : 5.0;
    // 🧹 過濾不良題目 (CQI < threshold)
    const badIndices = [];
    jsonObj.questions.forEach((q, i) => {
        if (q.cqi_score !== undefined && q.cqi_score < threshold) {
            badIndices.push(i);
        }
    });

    if (badIndices.length > 0) {
        console.log(`🧹 偵測到 ${badIndices.length} 題低於門檻 (${threshold})，準備進行重塑...`);
        jsonObj.questions = jsonObj.questions.filter((_, i) => !badIndices.includes(i));
    }

    const currentCount = jsonObj.questions.length;

    // 已達或超過目標題數：只處理「刪低分」或「超量截斷」，勿讓 neededCount 變負
    if (currentCount >= targetQuestions) {
        let needWrite = badIndices.length > 0;
        if (currentCount > targetQuestions) {
            console.log(
                `✂️ 現有 ${currentCount} 題超過目標 ${targetQuestions}，截斷保留 ${targetQuestions} 題。`
            );
            jsonObj.questions = jsonObj.questions.slice(0, targetQuestions);
            needWrite = true;
        }
        if (needWrite) {
            fs.writeFileSync(filePath, JSON.stringify(jsonObj, null, 2), 'utf8');
            console.log(`💾 已同步更新（低分題已刪或已截斷）(${filePath})`);
        } else {
            console.log(`✅ 題數已經達標且品質良好，無需處理。`);
        }
        return;
    }

    const neededCount = targetQuestions - currentCount;
    const batchSize = global.GEN_BATCH || 10;
    const chunkCounts = [];
    let remaining = neededCount;
    while (remaining > 0) {
        chunkCounts.push(Math.min(batchSize, remaining));
        remaining -= batchSize;
    }

    console.log(`📊 現存優質題: ${currentCount} / 目標: ${targetQuestions} (需補足: ${neededCount}, 將分 ${chunkCounts.length} 批產出)`);

    const newQuestions = [];
    const baseCurrentCount = currentCount;
    for (let c = 0; c < chunkCounts.length; c++) {
        const chunkNeeded = chunkCounts[c];
        const loopCurrentCount = baseCurrentCount + newQuestions.length;
        console.log(`\n⏳ [Batched Generation: 批次 ${c + 1}/${chunkCounts.length}] 尚缺 ${chunkNeeded} 題...`);
        const lessonTitle = bankMeta.title || bankMeta.lesson || jsonObj.lesson_id || '';
        let prompt = `
目前我們正在擴充與修復【${bankMeta.publisher}版】第【${bankMeta.grade}】年級第【${bankMeta.semester}】學期，課名：《${lessonTitle}》。
原題庫已經有 ${loopCurrentCount} 題優質題，我們還需要 ${chunkNeeded} 題。
請根據這篇課文，為我自動生成這 ${chunkNeeded} 題。`;

        if (lessonText) {
            prompt += `\n\n【本課課文原文】：\n${lessonText}\n\n`;
        }

        if (scienceKl4Text) {
            prompt += `\n\n【本課 KL4 單課研究紀錄（命題依據，概念與用語請對齊此文，勿憑空超綱）】：\n${scienceKl4Text}\n\n`;
        }

        if (socialKl4Text) {
            prompt += `\n\n【本課 KL4 單課研究紀錄（命題唯一依據；僅考本課主題，嚴禁跨課混題，例如本課談產業則不可出交通專題）】：\n${socialKl4Text}\n\n`;
        }

        if (filePath.includes('Science')) {
            prompt += `每一題必須為四選一單選題：options 必須恰為 4 個字串，answer_index 必須為 0、1、2、3 之一的整數（對應 options 的索引）。\n`;
        }

        if (isElementaryS2SocialStudiesMcq(filePath)) {
            prompt += `【社會科強制】僅能出四選一單選題：禁止是非題、填空題、勾選題。options 必須恰為 4 個字串；answer_index 必須為 0、1、2、3 的整數。\n`;
            prompt += `每題 scenario 須為非空字串（建議含【…時】情境標籤），explanation 與 commonMisconception 須具體。\n`;
            if (isG5S2SocialStudies(filePath)) {
                prompt += `【G5 配題】整批試題請符合約 20% literal、30% inferential/applied、50% 詮釋整合與評估批判（taxonomy 分布），且社會科題幹（scenario+question 合計）宜充足、避免過短。\n`;
            }
        }

        prompt += `請務必遵守『大腦友善干擾項原則（同理心投射、合理化迷思）』與前述認知層次指引。
嚴禁使用重複性後綴（如：雖然看起來很有道理...）。
長情境題幹必須加上【在地點/情境時】的標籤。
若為 L4 或其餘課次，請針對課文核心《${lessonTitle}》的「劇情與細節事實」產出，切勿憑空捏造不存在的角色與無關的情節。
請回傳包含 ${chunkNeeded} 個物件的 new_questions 陣列 JSON。`;

        const chunkQuestions = await callLLM(prompt, loopCurrentCount, chunkNeeded, filePath);
        let acceptedChunk = chunkQuestions || [];
        if (filePath.includes('Science') || isElementaryS2SocialStudiesMcq(filePath)) {
            const before = acceptedChunk.length;
            acceptedChunk = acceptedChunk.map(normalizeScienceGeneratedQuestion).filter(Boolean);
            if (acceptedChunk.length < before) {
                const lab = filePath.includes('Science') ? '自然' : '社會';
                console.warn(`⚠️ [${lab}] 本批有 ${before - acceptedChunk.length} 題因格式不符已略過`);
            }
        }
        if (acceptedChunk && acceptedChunk.length > 0) {
            newQuestions.push(...acceptedChunk);
        } else {
            console.log(`⚠️ 批次 ${c + 1} 生成失敗。`);
        }

        if (c < chunkCounts.length - 1) {
            const qpm = global.GEN_QPM || 10;
            const minGap = global.GEN_MIN_BATCH_GAP_SEC ?? 15;
            // 如果 batchSize 變小，間隔應縮短但至少維持在保險頻率與下限秒數
            const waitSec = Math.max(minGap, (60 / qpm) * batchSize);
            console.log(`⏳ 批次間等待 ${waitSec.toFixed(1)} 秒...`);
            await new Promise((r) => setTimeout(r, waitSec * 1000));
        }
    }

    if (newQuestions && newQuestions.length > 0) {
        console.log(`🎉 成功生成或重塑 ${newQuestions.length} 題，準備寫入...`);
        jsonObj.questions.push(...newQuestions);

        fs.writeFileSync(filePath, JSON.stringify(jsonObj, null, 2), 'utf8');
        console.log(`💾 檔案已同步更新至 ${targetQuestions} 題！(${filePath})`);
    } else {
        console.log(`⚠️ 生成失敗，檔案未更動。`);
    }
}

async function main() {
    const args = process.argv.slice(2);
    const conservative = args.includes('--conservative');
    const getArg = (name) => {
        const idx = args.indexOf(name);
        return (idx !== -1 && args[idx + 1]) ? args[idx + 1] : null;
    };

    const targetDir = args.find((a) => !a.startsWith('-')) || null;
    const targetCount = parseInt(getArg('--target'), 10) || 30;
    const selectedKeyName = getArg('--key') || 'Yotta';
    const selectedModelRaw = getArg('--model') || 'gemini-3.1-flash-lite-preview';
    /** Google AI Studio 代號常變；口語「Gemini 3 Flash」請用 v1beta 實際 id */
    const GEMINI_MODEL_ALIASES = {
        'gemini-3-flash': 'gemini-3-flash-preview',
        'gemini-3.1-flash': 'gemini-3-flash-preview',
        'gemini-3-flash-latest': 'gemini-3-flash-preview',
        'gemini-3-flash-lite': 'gemini-3.1-flash-lite-preview',
        'gemini-3.1-flash-lite': 'gemini-3.1-flash-lite-preview',
    };
    const selectedModel = GEMINI_MODEL_ALIASES[selectedModelRaw] || selectedModelRaw;
    if (selectedModel !== selectedModelRaw) {
        console.log(`ℹ️  模型別名：${selectedModelRaw} → ${selectedModel}`);
    }
    let qpm = parseInt(getArg('--qpm'), 10);
    if (Number.isNaN(qpm)) qpm = conservative ? 2 : 10;
    const freeTierKey =
        selectedKeyName === 'Yotta' ||
        selectedKeyName === 'eidosFree' ||
        /free/i.test(selectedKeyName);
    let batch = parseInt(getArg('--batch'), 10);
    if (Number.isNaN(batch)) {
        if (conservative) batch = freeTierKey ? 2 : 5;
        else batch = freeTierKey ? 3 : 10;
    }
    let interFileMs = parseInt(getArg('--inter-file-ms'), 10);
    if (Number.isNaN(interFileMs)) interFileMs = conservative ? 15000 : 3000;
    let wait429ms = parseInt(getArg('--429-wait-ms'), 10);
    if (Number.isNaN(wait429ms)) wait429ms = conservative ? 90000 : 35000;
    let minBatchGapSec = parseFloat(getArg('--min-batch-gap-sec'));
    if (Number.isNaN(minBatchGapSec)) minBatchGapSec = conservative ? 45 : 15;
    let max429Retries = parseInt(getArg('--429-max-retries'), 10);
    if (Number.isNaN(max429Retries)) max429Retries = conservative ? 6 : 8;
    const thresholdStr = getArg('--threshold');
    let threshold = 5.0;
    if (thresholdStr !== null && thresholdStr !== '') {
        const t = parseFloat(thresholdStr, 10);
        if (!Number.isNaN(t)) threshold = t;
    }
    const pattern = getArg('--pattern');

    if (!targetDir) {
        console.error('❌ [錯誤] 請提供要處理的資料夾路徑或檔案。');
        console.error('範例: node scripts/auto_generate_questions.js question/platform/G4/Chinese/S2 --pattern "L[1-5]_"');
        process.exit(1);
    }

    // --- 動態金鑰載入 ---
    try {
        if (fs.existsSync(GLOBAL_ENV_PATH)) {
            const envFile = fs.readFileSync(GLOBAL_ENV_PATH, 'utf8');
            const lines = envFile.split('\n');
            let foundKey = false;
            for (let i = 0; i < lines.length; i++) {
                const acctLine = lines[i];
                // 支援「Account: Yotta - eidosFree」等列：行內含 Account: 且含 --key 子字串即可
                const accountMatch =
                    acctLine.includes('Account:') &&
                    acctLine.includes(selectedKeyName);
                if (accountMatch) {
                    for (let j = i + 1; j < lines.length; j++) {
                        const line = lines[j].trim();
                        if (line.startsWith('GEMINI_API_KEY=')) {
                            const val = line.split('=').slice(1).join('=').replace(/^['"]|['"]$/g, '');
                            if (val && val.trim() !== '') {
                                process.env.GEMINI_API_KEY = val;
                                foundKey = true;
                                break;
                            }
                        } else if (/^GEMINI_API_KEY_[A-Za-z0-9_]+=/.test(line)) {
                            const val = line.split('=').slice(1).join('=').replace(/^['"]|['"]$/g, '');
                            if (val && val.trim() !== '' && val !== '""') {
                                process.env.GEMINI_API_KEY = val;
                                foundKey = true;
                                break;
                            }
                        }
                        // 下一個 Account 區塊開始則停止向後找
                        if (line.startsWith('#') && line.includes('Account:')) break;
                    }
                }
                if (foundKey) break;
            }
            // 若以金鑰尾碼辨識（例：--key 06EA 對應 GEMINI_API_KEY 結尾 …06EA）
            if (!foundKey && /^[A-Za-z0-9_-]{4,16}$/.test(selectedKeyName)) {
                for (let j = 0; j < lines.length; j++) {
                    const line = lines[j].trim();
                    if (!line.startsWith('GEMINI_API_KEY=')) continue;
                    const val = line.split('=').slice(1).join('=').replace(/^['"]|['"]$/g, '').trim();
                    if (val && val.endsWith(selectedKeyName)) {
                        process.env.GEMINI_API_KEY = val;
                        foundKey = true;
                        console.log(`ℹ️  金鑰：依 ApiKeys.cfg 內 GEMINI_API_KEY 尾碼「${selectedKeyName}」匹配`);
                        break;
                    }
                }
            }
        }
    } catch (e) {
        if (e.code === 'EPERM') {
            console.warn(`⚠️ [警告] 無法讀取金鑰檔 (EPERM)，將使用環境變數。`);
        } else {
            console.error(`❌ [錯誤] 讀取金鑰檔時發生未知錯誤: ${e.message}`);
        }
    }

    process.env.GEMINI_MODEL = selectedModel; // 已套用別名
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error('❌ [錯誤] 找不到 API Key。');
        console.error('   請確認 --key 與註解列 Account: … 相符，或金鑰字串結尾與尾碼匹配。');
        process.exit(1);
    }

    const fullPath = path.resolve(targetDir);
    const isFile = fs.lstatSync(fullPath).isFile();
    
    let jsonFiles = [];
    if (isFile) {
        jsonFiles = [fullPath];
    } else {
        jsonFiles = getJsonFiles(fullPath);
    }

    if (pattern) {
        const regex = new RegExp(pattern);
        jsonFiles = jsonFiles.filter(f => regex.test(path.basename(f)));
        console.log(`🎯 套用過濾模式 "${pattern}"，剩餘 ${jsonFiles.length} 個檔案。`);
    }

    console.log(`=============================================`);
    console.log(`🚀 啟動 AI 題庫自動化擴充產線 (前五課優先版)`);
    console.log(`📂 目標目錄: ${fullPath}`);
    console.log(`🔑 使用金鑰: ${selectedKeyName}`);
    console.log(`🤖 使用模型: ${selectedModel}`);
    console.log(`⏱️ 限速設定: ${qpm} QPM`);
    console.log(`🎯 品質門檻: ${threshold} (CQI)`);
    if (conservative) console.log(`🐢 保守模式: inter-file=${interFileMs}ms, 429首等=${wait429ms}ms, 批次間≥${minBatchGapSec}s, 429最多${max429Retries}次`);
    if (pattern) console.log(`🔍 過濾模式: ${pattern}`);
    console.log(`=============================================`);

    global.GEN_THRESHOLD = threshold;
    global.GEN_QPM = qpm;
    global.GEN_BATCH = batch;
    global.GEN_TARGET = targetCount;
    global.GEN_INTER_FILE_MS = interFileMs;
    global.GEN_429_WAIT_MS = wait429ms;
    global.GEN_MIN_BATCH_GAP_SEC = minBatchGapSec;
    global.GEN_429_MAX_RETRIES = max429Retries;

    for (const file of jsonFiles) {
        await processFile(file);
        console.log(`⏳ 處理下一筆檔案前等待 ${interFileMs} ms...`);
        await new Promise((resolve) => setTimeout(resolve, interFileMs));
    }

    console.log(`\n✅ 全數檔案掃描與擴充完畢！`);
    console.log(`👉 請記得執行 node scripts/evaluate_question_quality.js 進行品質複驗。`);
}

main().catch(err => {
    console.error('發生預期外錯誤:', err);
});
