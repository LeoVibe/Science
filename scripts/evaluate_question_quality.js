/**
 * evaluate_question_quality.js
 * 
 * 依據「雙軌品質指標機制 (Dual Quality Metrics)」自動評估題庫 JSON 品質
 * 更新時間：2026-04-08
 * 更新者：Antigravity (Gemini-2.0-Pro-Exp)；JOB-164：修復 gradeCN、國語研究檔遞迴搜尋與三下 KL4 後備
 */

const fs = require('fs');
const path = require('path');

/**
 * 檢查對應的研究發展綱要是否存在
 */
function checkResearchSupport(filePath, meta) {
    const grade = meta.grade || '';
    const semester = meta.semester || '';
    const subject = meta.subject || '';

    const subjectMap = {
        'Math': '數學', 'MATH': '數學',
        'Chinese': '國語', 'CHI': '國語',
        'English': '英語', 'ENG': '英語',
        'Science': '自然', 'SCI': '自然',
        'SocialStudies': '社會', 'SOC': '社會'
    };
    // 舊版錯誤曾於錯誤訊息使用未定義的 gradeCN；年級顯示應使用 gradeShort（見 gradeShortMap）
    const subjectCN = subjectMap[subject] || subject;

    if (!grade || !semester || !subjectCN) {
        return { ceiling: 'QL4', reason: '無法從 meta 推導學科資訊，跳過研究檢查' };
    }

    let projectRoot = filePath;
    for (let i = 0; i < 10; i++) {
        projectRoot = path.dirname(projectRoot);
        if (fs.existsSync(path.join(projectRoot, 'knowledge'))) {
            projectRoot = path.join(projectRoot, 'knowledge');
            break;
        }
    }

    // 簡稱對照表（檔名統一使用簡稱，如「三下_社會_發展綱要.md」）
    const gradeShortMap = { 'G1': '一', 'G2': '二', 'G3': '三', 'G4': '四', 'G5': '五', 'G6': '六' };
    const semesterShortMap = { 'S1': '上', 'S2': '下' };

    let normalizedGrade = grade.startsWith('grade_') ? 'G' + grade.split('_')[1] : grade;
    const gradeShort = gradeShortMap[normalizedGrade] || grade;
    const semesterShort = semesterShortMap[semester] || semester;

    const searchDir = path.join(projectRoot, '1_課綱研究', subjectCN);
    let outlinePath = null;

    /** 遞迴列出目錄內所有 .md 檔絕對路徑 */
    function listAllMdFiles(dir, acc = []) {
        if (!fs.existsSync(dir)) return acc;
        let entries;
        try {
            entries = fs.readdirSync(dir, { withFileTypes: true });
        } catch {
            return acc;
        }
        for (const e of entries) {
            const full = path.join(dir, e.name);
            if (e.isDirectory()) listAllMdFiles(full, acc);
            else if (e.name.endsWith('.md')) acc.push(full);
        }
        return acc;
    }

    if (fs.existsSync(searchDir)) {
        const allMd = listAllMdFiles(searchDir);
        const basenameOk = (base) => {
            if (!base.includes(subjectCN)) return false;
            const hasGrade = base.includes(gradeShort) || base.includes(normalizedGrade);
            const hasSemester =
                base.includes(semesterShort) ||
                base.includes(semester) ||
                (semester === 'S2' && (base.includes('下') || base.includes('_S2'))) ||
                (semester === 'S1' && (base.includes('上') || base.includes('_S1')));
            return hasGrade && hasSemester;
        };
        // 優先：檔名含「研究總綱」或舊式「發展綱要」（JOB-212 後統一為研究總綱）
        outlinePath =
            allMd.find((p) => {
                const b = path.basename(p);
                return (b.includes('研究總綱') || b.includes('發展綱要')) && basenameOk(b);
            }) || null;
        // 三下國語若找不到 KL3，改用 KL4 原始素材庫支撐研究天花板檢查
        if (
            !outlinePath &&
            normalizedGrade === 'G3' &&
            semester === 'S2' &&
            subjectCN === '國語'
        ) {
            outlinePath =
                allMd.find((p) => path.basename(p) === 'KL4_三下_國語_原始研究素材庫.md') || null;
        }
    }

    if (!outlinePath) {
        return { ceiling: 'QL1', reason: `找不到發展綱要: ${gradeShort}${semesterShort} ${subjectCN}（已搜尋 ${searchDir}）` };
    }

    const content = fs.readFileSync(outlinePath, 'utf8');

    // 檢查 RM 等級 (研究成熟度)：如無課文，最高 QL3
    const hasRM0Warning = content.includes('RM0') || content.includes('課文缺失') || content.includes('無課文全文');
    if (hasRM0Warning) {
        return { ceiling: 'QL3', reason: 'RM0 等級（無課文全文）：最高支撐 QL3' };
    }

    const hasMatrix = content.includes('Matrix') || content.includes('矩陣') || content.includes('核心命題') || content.includes('配比');
    const hasEvidence = content.includes('實證') || content.includes('考古題') || content.includes('Evidence') || content.includes('R3');
    const hasStrategy = content.includes('轉化') || content.includes('L2 → L4') || content.includes('迷思') || content.includes('Strategy') || content.includes('守衛');

    if (!hasMatrix) return { ceiling: 'QL1', reason: '發展綱要缺少 Matrix (核心命題矩陣)' };
    if (!hasEvidence) return { ceiling: 'QL2', reason: '發展綱要缺少 Evidence (實證驗證區)' };
    if (!hasStrategy) return { ceiling: 'QL3', reason: '發展綱要缺少 Strategy (轉化策略/迷思守衛)' };

    return { ceiling: 'QL4', reason: '研究文件完整，支撐最高 QL4' };
}

/**
 * 檢查該課的 KL4 雙檔是否存在（Canonical QL 判定依據）
 *
 * 依據 `question/README_驗證與盲測準則.md` 第四章：
 *   QL2 = 該課 KL4 單課研究紀錄 存在（有課文）
 *   QL3 = QL2 + 該課 KL4 考古題與討論 存在
 *
 * @returns {{hasResearch: boolean, hasExam: boolean, searchDir: string}}
 */
function checkLessonKL4Files(meta) {
    // 長碼與短碼皆支援（題庫 meta 實際會是 "CHI"/"HANLIN" 等短碼）
    const SUBJECT_CN = {
        Chinese: '國語', CHI: '國語',
        Math: '數學', MATH: '數學',
        Science: '自然', SCI: '自然',
        SocialStudies: '社會', SOC: '社會',
        English: '英語', ENG: '英語',
        Life: '生活', LIF: '生活'
    };
    const PUB_CN = {
        HanLin: '翰林', HANLIN: '翰林',
        KangHsuan: '康軒', KANGHSUAN: '康軒',
        NanYi: '南一', NANYI: '南一'
    };
    const SEM_CN = { S1: '上', S2: '下' };
    const GRADE_CN = { G1: '一', G2: '二', G3: '三', G4: '四', G5: '五', G6: '六' };

    const subjectCN = SUBJECT_CN[meta.subject] || meta.subject;
    const pubCN = PUB_CN[meta.publisher] || meta.publisher;
    const semCN = SEM_CN[meta.semester] || meta.semester;
    const gradeCN = GRADE_CN[meta.grade] || meta.grade;
    const lesson = meta.lesson || '';

    const searchDir = path.join(__dirname, '..', 'knowledge', '1_課綱研究', subjectCN, `${gradeCN}${semCN}`, pubCN);

    const result = { hasResearch: false, hasExam: false, searchDir };
    if (!fs.existsSync(searchDir)) return result;

    let files;
    try { files = fs.readdirSync(searchDir); } catch { return result; }

    const lessonTag = `_${lesson}_`;
    for (const f of files) {
        if (!f.startsWith('KL4_') || !f.includes(lessonTag)) continue;
        if (f.endsWith('_單課研究紀錄.md')) result.hasResearch = true;
        if (f.endsWith('_考古題與討論.md')) result.hasExam = true;
    }

    return result;
}

/**
 * 評核單一題目 (CQI & QL)
 *
 * QL 判定（Canonical）：
 *   QL1 = 結構不完整 或 該課無 KL4 單課研究紀錄
 *   QL2 = 結構完整 + 該課有 KL4 單課研究紀錄（有課文）
 *   QL3 = QL2 + 該課有 KL4 考古題與討論
 *   QL4 = QL3 + blind_evaluation === true
 *   QL5 = QL4 + verifying_model 含 Expert（未來）
 */
function evaluateQuestion(q, subject, kl4Status) {
    const questionText = q.question || '';
    const explanationText = q.explanation || '';
    const options = q.options || [];
    let ansIndex = q.answer_index !== undefined ? q.answer_index : q.answer;

    let reports = [];
    let isLongestAnswer = false;
    let cqi_score = 0;

    // A. 選項對稱性 (2.0)
    if (options.length === 4) {
        const lengths = options.map(o => String(o).length);
        const maxLength = Math.max(...lengths);
        const isAllSameLength = lengths.every(l => l === lengths[0]);
        if (ansIndex >= 0 && ansIndex < 4 && !isAllSameLength && lengths[ansIndex] === maxLength) {
            isLongestAnswer = true;
            cqi_score += 0.5;
        } else {
            cqi_score += 2.0;
        }
    }

    // B. 情境深度 (2.0)
    const qLen = String(questionText).length;
    if (qLen >= 30) cqi_score += 2.0;
    else if (qLen >= 15) cqi_score += 1.0;

    // C. 認知層次 (1.5)
    const taxonomy = q.taxonomy || 'literal';
    if (taxonomy !== 'literal') cqi_score += 1.5;
    else cqi_score += 0.75;

    // D. 結構完整度 (1.0)
    if (explanationText && explanationText.length > 10) cqi_score += 0.5;
    if (q.commonMisconception || q.scenario) cqi_score += 0.5;

    // E. 盲測與加分 (3.5 可選)
    if (q.blind_evaluation === true) cqi_score += 2.0;
    if (q.commonMisconception) cqi_score += 1.0;

    cqi_score = Math.min(Math.max(cqi_score, 0), 10);

    // QL 判定（Canonical：見 question/README_驗證與盲測準則.md §4.2）
    let qg_level = 'QL1';
    const structOk = questionText && options.length >= 2 && (ansIndex !== undefined && ansIndex !== null) && explanationText && explanationText.length >= 10;

    if (structOk && kl4Status && kl4Status.hasResearch) {
        if (kl4Status.hasExam) {
            qg_level = 'QL3';
            if (q.blind_evaluation === true) {
                qg_level = 'QL4';
                if (q.commonMisconception && q.verifying_model && q.verifying_model.includes('Expert')) {
                    qg_level = 'QL5';
                }
            }
        } else {
            qg_level = 'QL2';
        }
    }

    q.cqi_score = parseFloat(cqi_score.toFixed(2));
    q.quality_level = qg_level;

    return { cqi_score, qg_level, taxonomy, reports, isLongestAnswer };
}

/**
 * 評核整個題庫檔案
 */
function evaluateFile(filePath) {
    try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        let questions = content.questions || (Array.isArray(content) ? content : []);
        let meta = content.meta || {
            grade: content.grade,
            subject: content.subject,
            semester: content.semester,
            publisher: content.publisher,
            lesson: content.lesson_id || content.lesson
        };

        if (questions.length === 0) return { quality: 'QL1', avgCqi: 0, count: 0 };

        // Canonical QL 判定所需：檢查該課的 KL4 雙檔是否存在
        const kl4Status = checkLessonKL4Files(meta);

        let totalCqiScore = 0;
        let longestAnswerCount = 0;
        const levelCount = { 'QL1': 0, 'QL2': 0, 'QL3': 0, 'QL4': 0, 'QL5': 0 };
        const answerDist = {};
        const taxCount = {};

        questions.forEach(q => {
            const result = evaluateQuestion(q, meta.subject, kl4Status);
            totalCqiScore += result.cqi_score;
            levelCount[result.qg_level]++;
            if (result.isLongestAnswer) longestAnswerCount++;
            taxCount[result.taxonomy] = (taxCount[result.taxonomy] || 0) + 1;
            let ans = q.answer_index !== undefined ? q.answer_index : q.answer;
            if (ans !== undefined && ans !== null) {
                answerDist[ans] = (answerDist[ans] || 0) + 1;
            }
        });

        const total = questions.length;
        const avgCqi = totalCqiScore / total;

        let biasWarning = null;
        if (total >= 10) {
            const threshold = total <= 15 ? 0.9 : 0.8;
            for (const ans in answerDist) {
                if (answerDist[ans] / total > threshold) {
                    biasWarning = `答案過度集中: ${ans}`;
                    break;
                }
            }
            if (!biasWarning && !['Math', 'Science', 'MATH', 'SCI'].includes(meta.subject)) {
                const lenThreshold = (meta.grade === 'G3' || meta.grade === 'G4') ? 0.75 : 0.65;
                if ((longestAnswerCount / total) > lenThreshold) {
                    biasWarning = '選項長度偏差過大';
                }
            }
        }

        // 檔級 QL：以 canonical 每科 90% 門檻為準（對齊 generate_library_stats.js 的每科公式）
        let qg_quality = 'QL1';
        if (biasWarning) {
            qg_quality = 'QL1 (BIAS)';
        } else {
            const ql4up = (levelCount['QL4'] + levelCount['QL5']) / total;
            const ql3up = (levelCount['QL3'] + levelCount['QL4'] + levelCount['QL5']) / total;
            const ql2up = (levelCount['QL2'] + levelCount['QL3'] + levelCount['QL4'] + levelCount['QL5']) / total;
            if (ql4up >= 0.9) qg_quality = 'QL4';
            else if (ql3up >= 0.9) qg_quality = 'QL3';
            else if (ql2up >= 0.9) qg_quality = 'QL2';
            else qg_quality = 'QL1';
        }

        fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');

        return {
            quality: qg_quality,
            avgCqi: avgCqi.toFixed(2),
            count: total,
            levelCount,
            taxCount,
            answerDist,
            biasWarning,
            kl4Status,
            meta,
            filePath: path.relative(process.cwd(), filePath)
        };
    } catch (e) {
        return { quality: 'BROKEN', error: e.message, filePath };
    }
}

function scanDirectory(dir) {
    let results = [];
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === '.DS_Store') continue;
        const fullPath = path.join(dir, file);
        try {
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                results = results.concat(scanDirectory(fullPath));
            } else if (file.endsWith('.json') && !file.includes('manifest') && !file.includes('libraryStats')) {
                results.push(evaluateFile(fullPath));
            }
        } catch (e) {}
    }
    return results;
}

if (require.main === module) {
    const args = process.argv.slice(2);
    const isGateMode = args.includes('--gate');
    const target = args.find(a => !a.startsWith('--')) || 'question/platform';
    const absoluteTarget = path.isAbsolute(target) ? target : path.join(process.cwd(), target);

    if (fs.existsSync(absoluteTarget)) {
        let allResults = fs.lstatSync(absoluteTarget).isDirectory() ? scanDirectory(absoluteTarget) : [evaluateFile(absoluteTarget)];
        const summary = {
            totalFiles: allResults.length,
            totalQuestions: 0,
            qualityDist: { QL5: 0, QL4: 0, QL3: 0, QL2: 0, QL1: 0, BROKEN: 0, 'QL1 (BIAS)': 0 }
        };
        let hasCriticalFailure = false;

        allResults.forEach(r => {
            if (r.quality === 'BROKEN') {
                summary.qualityDist.BROKEN++;
                hasCriticalFailure = true;
                return;
            }
            summary.totalQuestions += (r.count || 0);
            summary.qualityDist[r.quality] = (summary.qualityDist[r.quality] || 0) + 1;

            if (r.quality.includes('BIAS') || r.quality === 'QL1' || r.quality === 'QL2') {
                hasCriticalFailure = true;
            }
        });
        console.log(JSON.stringify({ summary, details: allResults }, null, 2));

        if (isGateMode && hasCriticalFailure) {
            console.error('\n❌ Quality Gate Failed: Critical quality issues detected.');
            process.exit(1);
        } else if (isGateMode) {
            console.log('\n✅ Quality Gate Passed.');
        }
    } else {
        console.error(`Error: Target path does not exist: ${absoluteTarget}`);
        process.exit(1);
    }
}
module.exports = { evaluateFile, evaluateQuestion };