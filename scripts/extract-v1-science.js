import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 由於 questions.js 是純資料導向的 JS，我們直接讀取文字並處理成 JSON
const V1_JS_PATH = path.resolve(__dirname, '../apps/v1_science/src/data/questions.js');
const TARGET_DIR = path.resolve(__dirname, '../question/source/sci/knsh');

async function run() {
    console.log('🔍 正在提取舊版科學題庫...');

    // 動態載入舊資料 (注意: 如果 Node 環境不支援直接載入，改用正則或 eval)
    // 這裡我們由於是靜態資料，直接用特殊的 hack 方式讀取
    const content = fs.readFileSync(V1_JS_PATH, 'utf-8');

    // 提取 QUESTIONS 陣列部分
    const arrayMatch = content.match(/export const QUESTIONS = (\[[\s\S]*\])/);
    if (!arrayMatch) {
        console.error('❌ 找不到 QUESTIONS 陣列');
        return;
    }

    // 簡單的轉換：將 JS 物件字串轉換為合法的 JSON
    // 注意: 舊代碼有註解且屬性名沒引號，這裡我們使用 eval 獲取真實資料 (在受控環境下可行)
    let questions;
    try {
        const jsCode = arrayMatch[1];
        // 移除 export 讓它變成單純變數宣告
        questions = eval(jsCode);
    } catch (e) {
        console.error('❌ 解析 JS 失敗:', e.message);
        return;
    }

    // 建立分單元的物件
    const unitsMap = {
        '植物的身體': { lesson: 'Sci1', title: '多采多姿的植物', order: 1 },
        '神奇的磁鐵': { lesson: 'Sci2', title: '神奇的磁鐵', order: 2 },
        '奇妙的空氣': { lesson: 'Sci3', title: '奇妙的空氣', order: 3 },
        '廚房裡的科學': { lesson: 'Sci4', title: '廚房裡的科學-溶解', order: 4 }
    };

    const grouped = {};

    questions.forEach(q => {
        const unitInfo = unitsMap[q.category];
        if (!unitInfo) return;

        if (!grouped[unitInfo.lesson]) {
            grouped[unitInfo.lesson] = {
                meta: {
                    grade: 'grade_3',
                    subject: '自然',
                    semester: 'semester_1',
                    publisher: 'kang_hsuan',
                    lesson: unitInfo.lesson,
                    title: unitInfo.title,
                    order: unitInfo.order
                },
                questions: []
            };
        }

        grouped[unitInfo.lesson].questions.push({
            id: String(q.id),
            type: 'multiple_choice',
            question: q.question,
            options: q.options,
            answer: q.options[q.correctAnswer], // 舊版用 index，新版用文字
            explanation: q.explanation + (q.funFact ? ` (趣聞: ${q.funFact})` : '')
        });
    });

    // 寫入檔案
    if (!fs.existsSync(TARGET_DIR)) fs.mkdirSync(TARGET_DIR, { recursive: true });

    for (const lesson in grouped) {
        const filePath = path.join(TARGET_DIR, `G3_S1_KNSH_${lesson}.json`);
        fs.writeFileSync(filePath, JSON.stringify(grouped[lesson], null, 2), 'utf-8');
        console.log(`✅ 已萃取: ${lesson} -> ${filePath} (共 ${grouped[lesson].questions.length} 題)`);
    }
}

run();
