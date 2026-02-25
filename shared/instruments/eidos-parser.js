/**
 * Eidos 題庫轉換與發布工具 (eidos-parser.js)
 * 功用：將 source 中的題庫內容轉換為符合 schema_contract.md 的 platform 格式，並自動更新 manifest.json
 * 支援：JSON 單元檔、CSV 題庫（依科目套用國語／英語／自然等細節規則）
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 定義根目錄路徑
const PROJECT_ROOT = path.resolve(__dirname, '../../');
const SOURCE_DIR = path.join(PROJECT_ROOT, 'question/source');
const PLATFORM_DIR = path.join(PROJECT_ROOT, 'question/platform');

// ---------------------------------------------------------------------------
// 科目別 CSV 格式規則（欄位索引、課次解析、答案正規化）
// ---------------------------------------------------------------------------
const SUBJECT_CSV_RULES = {
    // 自然科：預設格式 [課次, ?, 題目, 選項A, B, C, D, 答案, 詳解]
    natural: {
        cols: { lesson: 0, question: 2, optA: 3, optB: 4, optC: 5, optD: 6, answer: 7, explanation: 8 },
        lessonPattern: /^(L\d+)\s+(.+)$/,
        normalizeAnswer: (answer, options) => String(answer).trim(),
    },
    // 國語：常見為 [課次/單元, 題目, 選項A-D, 答案, 詳解]，且 CSV 可能帶 BOM、欄位順序略異
    chinese: {
        cols: { lesson: 0, question: 1, optA: 2, optB: 3, optC: 4, optD: 5, answer: 6, explanation: 7 },
        lessonPattern: /^(L?\d+|[一二三四五六七八九十]+課?)\s*[：:\s]*(.+)$|^(.+)$/,
        normalizeAnswer: (answer, options) => {
            const a = String(answer).trim();
            const upper = a.toUpperCase();
            if (['A', 'B', 'C', 'D'].includes(upper)) return options['ABCD'.indexOf(upper)] ?? a;
            return a;
        },
        stripBOM: true,
    },
    // 英語：答案常為 A/B/C/D，選項可能為 3 或 4 欄
    english: {
        cols: { lesson: 0, question: 1, optA: 2, optB: 3, optC: 4, optD: 5, answer: 6, explanation: 7 },
        lessonPattern: /^(Unit\s*\d+|L\d+|[Uu]\d+)\s*[：:\s-]*(.+)$|^(.+)$/,
        normalizeAnswer: (answer, options) => {
            const a = String(answer).trim().toUpperCase();
            if (['A', 'B', 'C', 'D'].includes(a)) return options['ABCD'.indexOf(a)] ?? a;
            return a;
        },
        allowThreeOptions: true,
    },
};

function getSubjectKey(subject) {
    if (subject === '國語') return 'chinese';
    if (subject === '英語' || subject === '英文') return 'english';
    return 'natural';
}

/**
 * 解析單行 CSV（支援雙引號內逗號）
 */
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else current += char;
    }
    result.push(current.trim());
    return result;
}

/**
 * 從 CSV 文字與科目規則產生 rawData { meta, questions }（供 validateAndTransform 使用）
 */
function csvToRawData(csvText, subject, metaFromPath) {
    let text = csvText;
    const key = getSubjectKey(subject);
    const rules = SUBJECT_CSV_RULES[key] || SUBJECT_CSV_RULES.natural;
    if (rules.stripBOM) text = text.replace(/^\uFEFF/, '');
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return null;

    const c = rules.cols;
    const lessonOrderMap = {};
    let orderCounter = 0;
    const questions = [];

    for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        const minLen = Math.max(c.question, c.optD, c.answer) + 1;
        if (cols.length < minLen) continue;

        const lessonRaw = (cols[c.lesson] || '').trim();
        const questionText = (cols[c.question] || '').trim();
        const options = [
            (cols[c.optA] || '').trim(),
            (cols[c.optB] || '').trim(),
            (cols[c.optC] || '').trim(),
            (cols[c.optD] || '').trim(),
        ].filter(Boolean);
        if (rules.allowThreeOptions && options.length === 3) options.push('');
        if (options.length < 2) continue;

        let answer = rules.normalizeAnswer(cols[c.answer] || '', options);
        const explanation = (cols[c.explanation] != null ? cols[c.explanation] : '').trim();

        let lessonId = 'L1';
        let title = metaFromPath?.title || '單元一';
        const match = lessonRaw.match(rules.lessonPattern);
        if (match) {
            if (match[1]) {
                lessonId = match[1].replace(/\s/g, '');
                if (!/^L\d+/i.test(lessonId)) lessonId = 'L' + (lessonOrderMap[lessonId] ?? (orderCounter + 1));
                title = match[2] || title;
            } else if (match[3]) title = match[3];
        }

        if (!(lessonId in lessonOrderMap)) lessonOrderMap[lessonId] = ++orderCounter;

        questions.push({
            id: `q_${i}`,
            type: 'multiple_choice',
            question: questionText,
            options,
            answer,
            explanation,
            _lesson: lessonId,
            _title: title,
            _order: lessonOrderMap[lessonId],
        });
    }

    if (questions.length === 0) return null;

    const meta = {
        grade: metaFromPath.grade,
        subject: metaFromPath.subject,
        semester: metaFromPath.semester,
        publisher: metaFromPath.publisher,
        lesson: metaFromPath.lesson || 'L1',
        title: metaFromPath.title || '單元一',
        order: metaFromPath.order ?? 1,
    };

    questions.forEach(q => {
        delete q._lesson;
        delete q._title;
        delete q._order;
    });

    return { meta, questions };
}

/**
 * 核心轉換與驗證函數 (導出供測試使用)
 */
export function validateAndTransform(rawData) {
    const { meta, questions } = rawData;

    if (!meta || !questions || !Array.isArray(questions)) {
        throw new Error('資料格式錯誤：缺少 meta 或 questions 陣列');
    }

    // 1. 驗證 meta 必填欄位
    const requiredMeta = ['grade', 'subject', 'semester', 'publisher', 'lesson', 'title'];
    requiredMeta.forEach(field => {
        if (!meta[field]) throw new Error(`Meta 遺失必填欄位: ${field}`);
    });

    // 2. 轉換與驗證題目
    const transformedQuestions = questions.map((q, idx) => {
        if (!q.question || !q.answer) {
            throw new Error(`題目 [${q.id || idx}] 內容不完整`);
        }

        // 如果是選擇題，驗證 options
        if (q.type === 'multiple_choice') {
            if (!q.options || q.options.length === 0) {
                throw new Error(`選擇題 [${q.id}] 缺少選項`);
            }
            // 驗證答案是否在選項內 (精準比對)
            if (!q.options.includes(q.answer)) {
                throw new Error(`題目 [${q.id}] 答案 "${q.answer}" 不在選項清單中`);
            }
        }

        return {
            id: String(q.id || idx + 1),
            type: q.type || 'multiple_choice',
            question: q.question.trim(),
            options: q.options ? q.options.map(opt => opt.trim()) : [],
            answer: q.answer.trim(),
            explanation: (q.explanation || '').trim()
        };
    });

    return {
        meta: {
            ...meta,
            verified: meta.verified !== undefined ? meta.verified : true,
            verification_source: meta.verification_source || 'Parser 自動轉換'
        },
        questions: transformedQuestions
    };
}

/**
 * 更新指定出版社目錄下的 manifest.json
 */
function updateManifest(publisherPath, meta) {
    const manifestPath = path.join(publisherPath, 'manifest.json');
    let manifest = {
        grade: meta.grade,
        semester: meta.semester,
        subject: meta.subject,
        publisher: meta.publisher,
        units: []
    };

    // 讀取該目錄下所有的 .json 檔案 (排除 manifest.json 自己)
    const files = fs.readdirSync(publisherPath)
        .filter(f => f.endsWith('.json') && f !== 'manifest.json');

    files.forEach(file => {
        const content = JSON.parse(fs.readFileSync(path.join(publisherPath, file), 'utf-8'));
        manifest.units.push({
            id: content.meta.lesson,
            order: content.meta.order || 0,
            title: content.meta.title,
            file: file
        });
    });

    // 依照 order 排序
    manifest.units.sort((a, b) => a.order - b.order);

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
    console.log(`   - Manifest 更新完成: ${manifestPath}`);
}

/**
 * 從 CSV 所在目錄路徑與檔名推斷 meta（若目錄結構為 .../G3/國語/S1/康軒/L1_課名.csv）
 */
function inferMetaFromPath(dirPath, filename) {
    const rel = path.relative(SOURCE_DIR, dirPath);
    const segments = rel.split(path.sep).filter(Boolean);
    const subjectMap = { '國語': '國語', '自然': '自然', '社會': '社會', '數學': '數學', '英語': '英語', '英文': '英語' };
    const pubMap = { '康軒': 'kang_hsuan', '南一': 'nan_yi', '翰林': 'han_lin', 'kang_hsuan': 'kang_hsuan', 'nan_yi': 'nan_yi', 'han_lin': 'han_lin' };
    let grade = 'grade_3', subject = '自然', semester = 'semester_1', publisher = 'kang_hsuan', title = '';

    const baseName = filename.replace(/\.csv$/i, '');
    const under = baseName.indexOf('_');
    const lesson = under > 0 ? baseName.slice(0, under) : 'L1';
    title = under > 0 ? baseName.slice(under + 1) : baseName;

    for (let i = 0; i < segments.length; i++) {
        const s = segments[i];
        if (/^G?\d$/i.test(s)) grade = 'grade_' + s.replace(/^G?/i, '');
        else if (subjectMap[s]) subject = subjectMap[s];
        else if (/^S?\d$/i.test(s)) semester = 'semester_' + s.replace(/^S?/i, '');
        else if (pubMap[s] || ['康軒', '南一', '翰林'].includes(s)) publisher = pubMap[s] || s;
    }

    return { grade, subject, semester, publisher, lesson, title };
}

/**
 * 主程序：遞迴掃描 source 資料並發布（JSON + CSV）
 */
function processSource() {
    console.log('🚀 開始執行題庫轉換作業...');

    if (!fs.existsSync(SOURCE_DIR)) {
        console.error(`❌ 找不到 source 目錄: ${SOURCE_DIR}`);
        return;
    }

    const subjectMap = { '國語': 'chi', '自然': 'sci', '社會': 'soc', '數學': 'mat', '英文': 'eng', '英語': 'eng' };
    const publisherMap = { 'kang_hsuan': 'knsh', 'nan_i': 'nani', 'nan_yi': 'nani', 'han_lin': 'hlm', 'nani': 'nani', 'knsh': 'knsh', 'hlm': 'hlm' };

    const publishTransformed = (transformed, targetDir) => {
        const meta = transformed.meta;
        const g = meta.grade.toLowerCase().replace('grade_', 'g');
        const s = meta.semester.toLowerCase().replace('semester_', 's');
        const sub = subjectMap[meta.subject] || meta.subject.toLowerCase();
        const pub = publisherMap[meta.publisher] || meta.publisher.toLowerCase();
        const dir = path.join(PLATFORM_DIR, g, sub, s, pub);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const targetFile = path.join(dir, `${meta.lesson}_${meta.title}.json`);
        fs.writeFileSync(targetFile, JSON.stringify(transformed, null, 2), 'utf-8');
        console.log(`✅ 已發布: ${meta.lesson} -> ${targetFile}`);
        updateManifest(dir, meta);
    };

    const scanDirectories = (dir) => {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                scanDirectories(fullPath);
            } else if (file.endsWith('.json') && file !== '_meta.json') {
                try {
                    const rawData = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
                    const transformed = validateAndTransform(rawData);
                    publishTransformed(transformed);
                } catch (err) {
                    console.error(`❌ 檔案處理失敗 [${file}]: ${err.message}`);
                }
            } else if (file.toLowerCase().endsWith('.csv')) {
                try {
                    const csvText = fs.readFileSync(fullPath, 'utf-8');
                    const dirPath = path.dirname(fullPath);
                    let metaFromPath = inferMetaFromPath(dirPath, file);
                    const metaPath = path.join(dirPath, '_meta.json');
                    if (fs.existsSync(metaPath)) {
                        const over = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
                        metaFromPath = { ...metaFromPath, ...over };
                    }
                    const rawData = csvToRawData(csvText, metaFromPath.subject, metaFromPath);
                    if (!rawData) {
                        console.warn(`⚠️ CSV 無有效題目，略過: ${fullPath}`);
                        return;
                    }
                    const transformed = validateAndTransform(rawData);
                    publishTransformed(transformed);
                } catch (err) {
                    console.error(`❌ CSV 處理失敗 [${file}]: ${err.message}`);
                }
            }
        });
    };

    scanDirectories(SOURCE_DIR);
    console.log('\n✨ 所有任務執行完畢！');
}

// 執行
processSource();
