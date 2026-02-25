/**
 * import_research_csv.js
 * 
 * 將 question/source/csv 中的高品質研究數據轉換為平台標準 JSON
 */

const fs = require('fs');
const path = require('path');

const CSV_DIR = path.join(__dirname, '../question/source/csv');
const OUTPUT_BASE = path.join(__dirname, '../question/platform');

// 認知層次映射
const TAXONOMY_MAP = {
    '事實提取': 'literal',
    '事實核對': 'literal',
    '理解推論': 'inferential',
    '推論整合': 'inferential',
    '應用評論': 'applied',
    '應用分析': 'applied'
};

function parseCsvLine(line) {
    // 簡易 CSV 解析 (處理逗號與可能的引號，這裡假設沒引號包含逗號的複雜情況)
    const parts = line.split(',');
    if (parts.length < 8) return null;

    return {
        lesson: parts[0]?.trim(),
        cognitive: parts[1]?.trim(),
        question: parts[2]?.trim(),
        options: [parts[3]?.trim(), parts[4]?.trim(), parts[5]?.trim(), parts[6]?.trim()],
        answerChar: parts[7]?.trim(), // A, B, C, D
        explanation: parts[8]?.trim()
    };
}

function processCsv(filename) {
    console.log(`Processing: ${filename}`);
    const filePath = path.join(CSV_DIR, filename);
    const lines = fs.readFileSync(filePath, 'utf8').split('\n');

    // 判定出版社與學期 (從檔名)
    let publisher = 'NanYi'; // Default
    if (filename.includes('南一')) publisher = 'NanYi';
    else if (filename.includes('康軒')) publisher = 'KangHsuan';
    else if (filename.includes('翰林')) publisher = 'HanLin';

    let grade = 'G3';
    if (filename.includes('三')) grade = 'G3';
    else if (filename.includes('四')) grade = 'G4';
    else if (filename.includes('五')) grade = 'G5';

    const semester = 'S2'; // 目前 CSV 都是下學期

    const lessonsData = {};

    // 跳過首行 header
    for (let i = 1; i < lines.length; i++) {
        const data = parseCsvLine(lines[i]);
        if (!data || !data.lesson || data.lesson === '課次') continue;

        // L1 最美的模樣 -> ID: L1, Title: 最美的模樣
        const match = data.lesson.match(/(L\d+)\s*(.*)/);
        const lessonId = match ? match[1] : 'Unknown';

        if (!lessonsData[lessonId]) {
            lessonsData[lessonId] = [];
        }

        const ansMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
        let correctIdx = ansMap[data.answerChar] || 0;
        let options = [...data.options];

        // 隨機化選項 (Fisher-Yates Shuffle)
        // 為了確保「隨機化」原則，我們在匯入時就打散選項
        const shuffled = options.map((v, i) => ({ v, i }));
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        const finalOptions = shuffled.map(s => s.v);
        const finalAnsIdx = shuffled.findIndex(s => s.i === correctIdx);

        lessonsData[lessonId].push({
            id: `${grade}-${publisher}-${lessonId}-${lessonsData[lessonId].length + 1}`,
            type: "multiple_choice",
            category: match ? match[2] : data.lesson,
            taxonomy: TAXONOMY_MAP[data.cognitive] || 'literal',
            question: data.question,
            options: finalOptions,
            answer_index: finalAnsIdx,
            explanation: data.explanation || ""
        });
    }

    // 寫出檔案
    for (const [lessonId, questions] of Object.entries(lessonsData)) {
        const targetDir = path.join(OUTPUT_BASE, grade, 'Chinese', semester, publisher);
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

        const targetFile = path.join(targetDir, `Chi_${lessonId}.json`);
        const output = { questions };

        fs.writeFileSync(targetFile, JSON.stringify(output, null, 2));
        console.log(`  -> Generated: ${targetFile} (${questions.length} questions)`);
    }
}

// 執行導入
const files = fs.readdirSync(CSV_DIR).filter(f => f.endsWith('.csv'));
files.forEach(processCsv);

console.log('✅ CSV Import complete.');
