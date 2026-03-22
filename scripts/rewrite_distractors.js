const fs = require('fs');
const path = require('path');

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
    console.error(`❌ 找不到 GEMINI_API_KEY`);
    process.exit(1);
}

// 確保 15 RPM 內 (每四秒一個請求)
const DELAY_MS = 4500;

async function callGemini(q, publisher, grade, lesson) {
    // 檢查是否已經是我們改寫過的
    // 若四個選項中沒有這些制式搞笑詞，代表前幾次腳本可能已經寫入成功
    const hasSillyOptions = q.options.some(o => o.includes('外星人') || o.includes('別墅') || o.includes('實驗室') || o.includes('買名牌'));
    const hasSillyFillers = q.options.some(o => o.includes('這在文章中是一個很明顯') || o.includes('雖然看起來很有道理'));
    if (!hasSillyOptions && !hasSillyFillers) {
        // 如果沒有這些，有可能是原先合理的題目，或是已經被我們的舊腳本替換過了
        return null;
    }

    const prompt = `
任務：你是一位專業命題專家。針對國小${grade} ${publisher}版課文《${lesson}》，以下的題目已經有固定的「正確答案」，但錯誤選項太荒謬。
請根據題幹、解析 (explanation) 與常見迷思 (commonMisconception)，重新設計 3 個具有「高度迷惑性」的錯誤選項。

【原題目資料】
題幹: ${q.question}
原本的正確答案: ${q.options[q.answer_index !== undefined ? q.answer_index : q.answer]}
解析: ${q.explanation}
迷思: ${q.commonMisconception}

【要求】
1. 回傳 JSON 包含一個 \`new_options\` 陣列（長度 4）。
2. 其中 1 個選項必須完全是正確答案文字，另外 3 個是你新設計的誘答。
3. 誘答必須具備鑑別度，符合六年級學生的理解層次。
4. 誘答長度必須跟正確答案對稱，正確選項不能特別長或特別短。
5. 新的 \`new_answer_index\` 必須指向正確選項。

請回傳：
{
  "new_options": ["選項1", "選項2", "選項3", "選項4"],
  "new_answer_index": <數字>
}`;

    let attempts = 0;
    while (attempts < 3) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: "你是一位嚴謹的命題專家，只回傳 JSON 格式。" }] },
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.5, responseMimeType: "application/json" }
                })
            });

            if (response.status === 429) {
                console.warn(`    ⚠️ [429] Limit Hit. Wait 15s...`);
                await new Promise(r => setTimeout(r, 15000));
                // 不要增加 attempts，遇到 429 應該無限等待重試
                continue;
            }

            const data = await response.json();
            if (!data.candidates) return null;
            
            const content = data.candidates[0].content.parts[0].text;
            let jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (err) {
            console.error(`    ❌ 解析錯誤:`, err.message);
            attempts++;
            await new Promise(r => setTimeout(r, 5000));
        }
    }
    return null;
}

async function processFile(filePath) {
    console.log(`\n📄 正在處理檔案: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(content);
    
    if (!json.questions || json.questions.length === 0) return;
    
    let modified = false;
    
    for (let i = 0; i < json.questions.length; i++) {
        process.stdout.write(`  - 處理第 ${i+1}/${json.questions.length} 題... `);
        const q = json.questions[i];
        const result = await callGemini(q, json.publisher, json.grade, json.lesson_title);
        
        if (result === null) {
            console.log(`跳過 (已優化或無需處理)`);
        } else if (result.new_options && result.new_options.length === 4) {
            q.options = result.new_options;
            q.answer_index = result.new_answer_index !== undefined ? result.new_answer_index : result.answer_index;
            modified = true;
            console.log(`✅ 替換成功`);
        } else {
            console.log(`⚠️ 生成失敗`);
        }
        
        // 嚴格控制 API 請求間隔
        await new Promise(r => setTimeout(r, DELAY_MS));
    }
    
    if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
        console.log(`💾 檔案儲存成功: ${filePath}`);
    }
}

async function main() {
    // 支援命令列引數：node scripts/rewrite_distractors.js <路徑1> [路徑2] ...
    const args = process.argv.slice(2);
    
    let targetDirs = [];
    
    if (args.length > 0) {
        // 使用者指定了路徑
        targetDirs = args.map(a => path.resolve(a));
    } else {
        // 預設：G6 國語全版本
        const baseDir = 'question/platform/G6/Chinese/S2/';
        const publishers = ['KangHsuan', 'HanLin', 'NanYi'];
        targetDirs = publishers.map(p => path.resolve(path.join(baseDir, p)));
    }
    
    console.log(`==========================================`);
    console.log(`🔬 誘答品質優化引擎 v1.0`);
    console.log(`📂 目標目錄: ${targetDirs.join(', ')}`);
    console.log(`==========================================`);
    
    for (const targetDir of targetDirs) {
        if (!fs.existsSync(targetDir)) {
            console.log(`⚠️ 路徑不存在，跳過: ${targetDir}`);
            continue;
        }
        
        const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.json') && !f.includes('manifest'));
        console.log(`\n📁 處理目錄: ${targetDir} (${files.length} 個檔案)`);
        
        for (const file of files) {
            await processFile(path.join(targetDir, file));
        }
    }
    console.log('\n🎉 所有版本誘答重寫完成！');
}

main();
