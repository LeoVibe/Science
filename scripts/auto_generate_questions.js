const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ============================================================================
// AI 大腦自動化題庫生成腳本 (Auto Question Generator - Gemini Version)
// ============================================================================
// 執行方式: node scripts/auto_generate_questions.js <平台路徑>
// 例如: node scripts/auto_generate_questions.js question/platform/G3/Chinese/S2/KangHsuan
// ============================================================================

const TARGET_QUESTIONS = 30; // 目標擴充至 30 題

// 從 0_AI_Project 專案根目錄讀取全域金鑰設定檔 (非隱藏檔)
const GLOBAL_ENV_PATH = path.resolve(__dirname, '../../Global_API_Keys.txt');
if (fs.existsSync(GLOBAL_ENV_PATH)) {
    const envFile = fs.readFileSync(GLOBAL_ENV_PATH, 'utf8');
    envFile.split('\n').forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
            const [key, ...value] = trimmedLine.split('=');
            if (key && value.length) {
                process.env[key.trim()] = value.join('=').trim().replace(/^['"]|['"]$/g, '');
            }
        }
    });
}

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error(`❌ [錯誤] 找不到 GEMINI_API_KEY 環境變數。`);
    console.error(`👉 請在 ${GLOBAL_ENV_PATH} 中設定：GEMINI_API_KEY="您的金鑰"`);
    process.exit(1);
}

// 遞迴取得所有 .json 檔案
function getJsonFiles(dir, fileList = []) {
    if (fs.statSync(dir).isFile()) {
        if (dir.endsWith('.json')) fileList.push(dir);
        return fileList;
    }
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getJsonFiles(filePath, fileList);
        } else if (filePath.endsWith('.json') && !file.includes('manifest')) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

// 建立呼叫 Gemini 的非同步函數
async function callLLM(prompt, currentQuestionsSize, totalNeeded, filePath = "") {
    console.log(`🤖 正在呼叫 Gemini 引擎... (預計生成 ${totalNeeded} 題)`);

    // 判斷學科以動態載入相應的 System 預設人格 
    const isMath = filePath.includes('Math');
    const isSocial = filePath.includes('Social');
    const isScience = filePath.includes('Science');
    const isEnglish = filePath.includes('English');
    const isLife = filePath.includes('Life');
    let subjectExpertise = "小學國語教育";
    let extraFocus = "設計閱讀測驗";
    let outlineDoc = "《00_國語科共同發展總綱》";

    if (isMath) {
        subjectExpertise = "小學數學教育";
        extraFocus = "設計大腦友善的生活情境數學應用題，絕不出現純粹的數字計算題";
        outlineDoc = "《00_數學科共同發展總綱》";
    } else if (isSocial) {
        subjectExpertise = "小學社會科教育";
        extraFocus = "設計結合生活場景與道德社會兩難的反思題";
        outlineDoc = "《00_社會科共同發展總綱》";
    } else if (isScience) {
        subjectExpertise = "小學自然科學教育";
        let scienceFocus = "設計強調觀察邏輯、實驗步驟與生態常識的情境題";
        if (filePath.includes('G5')) {
            scienceFocus += "。\n特別注意針對五年級的認知成熟度，必須在干擾選項中寫入常見的『直覺物理偏誤』、『擬人化目的論（如：植物開花是為了報答鳥類）』與『能量物質混淆（如：把肥料當成植物的便當）』等迷思。若題型為實驗題，必須考驗『控制變因瑕疵』。當解答為迷思除錯時，explanation 解析欄位必須明確且溫柔地打破該迷思！";
        }
        extraFocus = scienceFocus;
        outlineDoc = "《00_自然科共同發展總綱》";
    } else if (isEnglish) {
        subjectExpertise = "小學英語教學專家";
        extraFocus = "設計符合溝通式教學法 (CLT) 的真實生活對象與語用情境，避免中式英文";
        outlineDoc = "《00_英語科共同發展總綱》";
    } else if (isLife) {
        subjectExpertise = "低年級生活課程專家";
        extraFocus = "設計強調五官感知、常規建立與校園生活探索的統整性情境題";
        outlineDoc = "《00_生活科共同發展總綱》";
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
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
請根據「大腦友善三原則」與「中年級 4-4-2 認知動態配比」來${extraFocus}。
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
            console.warn(`[API] 觸發限制 (429 Rate Limit)。等待 35 秒後進行重試...`);
            await new Promise(r => setTimeout(r, 35000));
            return await callLLM(prompt, currentQuestionsSize, totalNeeded, filePath); // 遞迴重試
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

    // 🕵️ 偵測是否含有舊版格式贅字 ( legacy suffixes )
    const legacyPattern = /雖然看起來很有道理，但其實這只是讀者自己過度延伸的想像|這在文章中是一個很明顯可以發現的客觀事實|我們在尋找答案的時候，千萬不能被這種字面上的意思給騙了/;
    const badIndices = [];
    jsonObj.questions.forEach((q, i) => {
        if (q && q.options && Array.isArray(q.options)) {
            if (q.options.some(opt => legacyPattern.test(opt))) {
                badIndices.push(i);
            }
        }
    });

    const isL4Corrected = filePath.includes('Chi_L4.json') && badIndices.length > 0;

    if (badIndices.length > 0) {
        console.log(`🧹 偵測到 ${badIndices.length} 題含有舊版格式贅字，準備進行重塑...`);
        // 移除壞題目
        jsonObj.questions = jsonObj.questions.filter((_, i) => !badIndices.includes(i));
    }

    const currentCount = jsonObj.questions.length;

    if (currentCount >= TARGET_QUESTIONS && badIndices.length === 0) {
        console.log(`✅ 題數已經達標且品質良好，無需處理。`);
        return;
    }

    const neededCount = TARGET_QUESTIONS - currentCount;
    // Chunk requests into max 10 to avoid 429 rate limit
    const chunkCounts = [];
    let remaining = neededCount;
    while (remaining > 0) {
        chunkCounts.push(Math.min(10, remaining));
        remaining -= 10;
    }

    console.log(`📊 現存優質題: ${currentCount} / 目標: ${TARGET_QUESTIONS} (需補足: ${neededCount}, 將分 ${chunkCounts.length} 批產出)`);

    const newQuestions = [];
    const baseCurrentCount = currentCount;
    for (let c = 0; c < chunkCounts.length; c++) {
        const chunkNeeded = chunkCounts[c];
        const loopCurrentCount = baseCurrentCount + newQuestions.length;
        console.log(`\n⏳ [Batched Generation: 批次 ${c + 1}/${chunkCounts.length}] 尚缺 ${chunkNeeded} 題...`);
        const prompt = `
目前我們正在擴充與修復【${jsonObj.publisher}版】第【${jsonObj.grade}】年級第【${jsonObj.semester}】學期，課名：《${jsonObj.lesson_title || jsonObj.lesson_id}》。
原題庫已經有 ${loopCurrentCount} 題優質題，我們還需要 ${chunkNeeded} 題。
請根據這篇課文（或依據你對國小課文《${jsonObj.lesson_title}》的既有知識庫），為我自動生成這 ${chunkNeeded} 題。
請務必遵守『4-4-2 配比』與『大腦友善干擾項原則（同理心投射、合理化迷思）』。
嚴禁使用重複性後綴（如：雖然看起來很有道理...）。
長情境題幹必須加上【在地點/情境時】的標籤。
若為 L4 或其餘課次，請針對課文核心《${jsonObj.lesson_title}》產出。
請回傳包含 ${chunkNeeded} 個物件的 new_questions 陣列 JSON。`;

        const chunkQuestions = await callLLM(prompt, loopCurrentCount, chunkNeeded, filePath);
        if (chunkQuestions && chunkQuestions.length > 0) {
            newQuestions.push(...chunkQuestions);
        } else {
            console.log(`⚠️ 批次 ${c + 1} 生成失敗。`);
        }

        if (c < chunkCounts.length - 1) {
            console.log('⏳ 批次間等待 10 秒...');
            await new Promise(r => setTimeout(r, 10000));
        }
    }

    if (newQuestions && newQuestions.length > 0) {
        console.log(`🎉 成功生成或重塑 ${newQuestions.length} 題，準備寫入...`);
        jsonObj.questions.push(...newQuestions);

        fs.writeFileSync(filePath, JSON.stringify(jsonObj, null, 2), 'utf8');
        console.log(`💾 檔案已同步更新至 30 題！(${filePath})`);
    } else {
        console.log(`⚠️ 生成失敗，檔案未更動。`);
    }
}

async function main() {
    const targetDir = process.argv[2];
    if (!targetDir) {
        console.error('❌ [錯誤] 請提供要處理的資料夾路徑。');
        console.error('範例: node scripts/auto_generate_questions.js question/platform/G3/Chinese/S2/KangHsuan');
        process.exit(1);
    }

    const fullPath = path.resolve(targetDir);
    if (!fs.existsSync(fullPath)) {
        console.error(`❌ [錯誤] 找不到路徑: ${fullPath}`);
        process.exit(1);
    }

    console.log(`=============================================`);
    console.log(`🚀 啟動 AI 題庫自動化擴充產線`);
    console.log(`📂 目標目錄: ${fullPath}`);
    console.log(`=============================================`);

    const jsonFiles = getJsonFiles(fullPath);
    console.log(`🔎 找到 ${jsonFiles.length} 個 JSON 檔案準備進行掃描...`);

    for (const file of jsonFiles) {
        await processFile(file);
        // 為了避免 API Rate Limit，可以在這裡加上延遲
        console.log('⏳ 等待 3 秒後處理下一筆...');
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    console.log(`\n✅ 全數檔案掃描與擴充完畢！`);
    console.log(`👉 請記得執行 node scripts/evaluate_question_quality.js 進行品質複驗。`);
}

main().catch(err => {
    console.error('發生預期外錯誤:', err);
});
