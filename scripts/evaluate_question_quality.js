/**
 * evaluate_question_quality.js
 * 
 * 依據「雙軌品質指標機制 (Dual Quality Metrics)」自動評估題庫 JSON 品質
 * 包含：
 * 1. QG (Quality Gate Level): 絕對達標制 (L1~L5)
 * 2. CQI (Composite Quality Index): 綜合品質指數 (0.0~5.0)
 * 
 * 更新時間：2026-02-25
 */

const fs = require('fs');
const path = require('path');

/**
 * 檢查對應的研究發展綱要是否存在，以及實證驗證區的完整度
 * 返回天花板等級（研究支撐對品質的最高上限）
 */
function checkResearchSupport(filePath, meta) {
    const grade = meta.grade || '';
    const semester = meta.semester || '';
    const subject = meta.subject || '';

    const subjectMap = {
        'Math': '數學', 'Chinese': '國語', 'English': '英語',
        'Science': '自然', 'SocialStudies': '社會'
    };
    const subjectCN = subjectMap[subject] || subject;

    if (!grade || !semester || !subjectCN) {
        return { ceiling: 'L4', reason: '無法從 meta 推導學科資訊，跳過研究文件檢查' };
    }

    let projectRoot = filePath;
    for (let i = 0; i < 10; i++) {
        projectRoot = path.dirname(projectRoot);
        const knowledgePath = path.join(projectRoot, 'knowledge');
        if (fs.existsSync(knowledgePath)) {
            projectRoot = knowledgePath;
            break;
        }
    }

    const gradeMap = { 'G3': '三年級', 'G4': '四年級', 'G5': '五年級', 'G6': '六年級' };
    const semesterMap = { 'S1': '上學期', 'S2': '下學期' };
    const gradeCN = gradeMap[grade] || grade;
    const semesterCN = semesterMap[semester] || semester;
    const outlineFileNameCN = `${gradeCN}${semesterCN}_${subjectCN}_發展綱要.md`;
    const outlineFileNameEN = `${grade}_${semester}_${subjectCN}發展綱要.md`;

    let outlinePath = path.join(projectRoot, '課綱研究', subjectCN, outlineFileNameCN);
    if (!fs.existsSync(outlinePath)) {
        outlinePath = path.join(projectRoot, '課綱研究', subjectCN, outlineFileNameEN);
    }

    if (!fs.existsSync(outlinePath)) {
        return { ceiling: 'L1', reason: `發展綱要不存在: ${outlineFileNameCN}` };
    }

    const content = fs.readFileSync(outlinePath, 'utf8');
    if (!(content.includes('Curriculum Matrix') || content.includes('課程內容與發展矩陣'))) {
        return { ceiling: 'L1', reason: '發展綱要缺少 Curriculum Matrix' };
    }
    if (!(content.includes('實證驗證區') || content.includes('考古題對照驗證'))) {
        return { ceiling: 'L2', reason: '發展綱要缺少實證驗證區' };
    }
    if (!(content.includes('L4 轉化策略') || content.includes('L2 → L4') || content.includes('迷思概念圖譜'))) {
        return { ceiling: 'L3', reason: '發展綱要缺少 L4 轉化策略' };
    }

    return { ceiling: 'L4', reason: '研究文件完整，支撐最高 L4' };
}

/**
 * 評核單一題目 (同時計算 CQI 與 QG)
 */
function evaluateQuestion(q, subject) {
    const questionText = q.question || '';
    const explanationText = q.explanation || '';
    const options = q.options || [];
    let ansIndex = q.answer_index !== undefined ? q.answer_index : q.answer;

    let reports = [];
    let isLongestAnswer = false;

    // ==========================================
    // 1. CQI (Composite Quality Index) 綜合加分計算
    // ==========================================
    let cqi_score = 0;

    // A. 結構完整性 (最高 2.0 分)
    if (q.id || q.lesson_id) cqi_score += 0.5;
    if (q.commonMisconception || q.scenario) cqi_score += 0.5;
    if (explanationText && explanationText.length > 10) cqi_score += 1.0;

    // B. 選項對稱性 (最高 3.0 分)
    if (options.length === 4) {
        const lengths = options.map(o => String(o).length);
        const avgLen = lengths.reduce((a, b) => a + b, 0) / 4;
        const maxLength = Math.max(...lengths);
        const isAllSameLength = lengths.every(l => l === lengths[0]);

        if (ansIndex >= 0 && ansIndex < 4 && !isAllSameLength && lengths[ansIndex] === maxLength) {
            isLongestAnswer = true;
        }

        if (avgLen > 0) {
            if (['Math', 'Science', 'English'].includes(subject) && avgLen < 15) {
                cqi_score += 3.0;
                isLongestAnswer = false;
            } else {
                if (!isLongestAnswer) {
                    cqi_score += 3.0;
                } else {
                    reports.push('正確選項為最長選項，易被盲猜');
                }
            }
        }
    }

    // C. 情境深度 (最高 3.0 分)
    const qLen = String(questionText).length;
    if (['Math', 'Science', 'English'].includes(subject)) {
        if (qLen >= 25) cqi_score += 3.0;
        else if (qLen >= 15) cqi_score += 1.5;
        else if (qLen >= 5) cqi_score += 0.5;
        else reports.push('數理/英語題幹過短 (<5字)');
    } else {
        if (qLen >= 50) cqi_score += 3.0;
        else if (qLen >= 30) cqi_score += 1.5;
        else if (qLen >= 15) cqi_score += 0.5;
        else reports.push('文科題幹過短 (<15字)');
    }

    // D. 認知層次標註 (最高 2.0 分)
    const taxonomy = q.taxonomy || q.type_pirls || 'literal';
    if (['inferential', 'applied'].includes(taxonomy)) cqi_score += 2.0;
    else if (taxonomy === 'literal') cqi_score += 1.0;

    // 確保分數在 0~10 區間
    cqi_score = Math.min(Math.max(cqi_score, 0), 10);

    // ==========================================
    // 2. QG (Quality Gate Level) 絕對達標制門檻把關
    // ==========================================
    let qg_level = 'L1';
    let qg_reports = [...reports]; // 為了不干擾 CQI 的報告

    // --- L2 門檻檢查 ---
    if (!questionText || options.length < 2 || ansIndex === undefined) {
        qg_reports.push('基礎格式不完整 (無法達 L2)');
        qg_level = 'L1';
    } else {
        qg_level = 'L2';

        // --- L3 門檻檢查 ---
        let passL3 = true;
        if (!explanationText || explanationText.length < 10) {
            passL3 = false;
            qg_reports.push('缺乏有效解析 (阻擋晉升 L3)');
        }

        // 選項長度偏差將不再此處直接阻擋 L3，改由全檔的 isLongestAnswer 比例一併控管 (若超標則降級 L1-BIAS)

        if (passL3) {
            qg_level = 'L3';

            // --- L4 門檻檢查 ---
            let passL4 = false;
            if (['Math', 'Science', 'English'].includes(subject)) {
                if (qLen >= 15) passL4 = true;
                else qg_reports.push('題幹未達 15 字 (阻擋晉升 L4)');
            } else {
                if (qLen >= 30) passL4 = true;
                else qg_reports.push('題幹未達 30 字 (阻擋晉升 L4)');
            }

            if (passL4) {
                qg_level = 'L4';

                // --- L5 門檻檢查 (單題具備診斷) ---
                if (q.commonMisconception) {
                    qg_level = 'L5';
                }
            }
        }
    }

    // 寫入雙指標
    q.cqi_score = parseFloat(cqi_score.toFixed(2));
    q.quality_level = qg_level;

    return {
        cqi_score,
        qg_level,
        taxonomy,
        reports: qg_reports,
        isLongestAnswer
    };
}

/**
 * 評核整個題庫檔案
 */
function evaluateFile(filePath) {
    try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        let questions = [];
        let meta = {};

        if (content.questions) {
            questions = content.questions;
            meta = content.meta || {
                grade: content.grade,
                subject: content.subject,
                semester: content.semester,
                publisher: content.publisher,
                lesson: content.lesson_id || content.lesson
            };
        } else if (Array.isArray(content)) {
            questions = content;
        } else if (content.question) {
            questions = [content];
        }

        if (questions.length === 0) return { quality: 'L1', avgCqi: 0, count: 0 };

        let totalCqiScore = 0;
        const taxCount = { literal: 0, inferential: 0, applied: 0 };
        const answerDist = {};
        let longestAnswerCount = 0;

        // 統計 QG 各等級的題目數量
        const levelCount = { 'L1': 0, 'L2': 0, 'L3': 0, 'L4': 0, 'L5': 0 };

        questions.forEach(q => {
            const result = evaluateQuestion(q, meta.subject);
            totalCqiScore += result.cqi_score;
            levelCount[result.qg_level]++;

            if (result.isLongestAnswer) longestAnswerCount++;
            if (taxCount[result.taxonomy] !== undefined) taxCount[result.taxonomy]++;
            else taxCount.literal++;

            let ans = q.answer_index !== undefined ? q.answer_index : q.answer;
            if (ans !== undefined) {
                answerDist[ans] = (answerDist[ans] || 0) + 1;
            }
        });

        const total = questions.length;
        // 計算全檔平均 CQI
        const avgCqi = totalCqiScore / total;

        // --- 破壞性 BIAS 檢查 (L1 Gate) ---
        let biasWarning = null;
        if (total >= 5) {
            for (const ans in answerDist) {
                if (answerDist[ans] / total > 0.6) {
                    biasWarning = `答案過度集中於: ${ans} (${(answerDist[ans] / total * 100).toFixed(0)}%)`;
                    break;
                }
            }
            if (!biasWarning && (longestAnswerCount / total) > 0.4) {
                biasWarning = `選項長度偏差: ${(longestAnswerCount / total * 100).toFixed(0)}% 的正確答案為最長選項`;
            }
        }

        // --- 全檔 QG 等級判定 (基於 80% 門檻原則) ---
        let qg_quality = 'L1';

        if (biasWarning) {
            qg_quality = 'L1 (BIAS)';
        } else {
            const l4_l5_ratio = (levelCount['L4'] + levelCount['L5']) / total;
            const l3_plus_ratio = (levelCount['L3'] + levelCount['L4'] + levelCount['L5']) / total;

            if (l4_l5_ratio >= 0.8) qg_quality = 'L4';
            else if (l3_plus_ratio >= 0.8) qg_quality = 'L3';
            else qg_quality = 'L2';
        }

        // L5 全檔覆蓋：需達到 L4 標準，且 expert verified
        const isExpertVerified = content.meta && content.meta.verified_by === 'expert';
        if (qg_quality === 'L4' && isExpertVerified) {
            qg_quality = 'L5';
        }

        // --- 研究文件天花板限制 ---
        const researchCheck = checkResearchSupport(filePath, meta);
        const levelOrder = ['L1', 'L1 (BIAS)', 'L2', 'L3', 'L4', 'L5'];
        if (qg_quality !== 'L5' && !qg_quality.includes('BIAS')) {
            const ceilingIdx = levelOrder.indexOf(researchCheck.ceiling);
            const realIdx = levelOrder.indexOf(qg_quality);
            if (realIdx > ceilingIdx && ceilingIdx !== -1) {
                qg_quality = researchCheck.ceiling;
            }
        }

        // 將有品質標記 (QG 與 CQI) 的 JSON 寫回
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');

        return {
            quality: qg_quality,       // QG (對外)
            avgCqi: avgCqi.toFixed(2), // CQI (對內)
            count: total,
            taxCount,
            answerDist,
            biasWarning,
            researchCeiling: researchCheck.ceiling,
            researchReason: researchCheck.reason,
            meta,
            filePath: path.relative(process.cwd(), filePath)
        };
    } catch (e) {
        return { quality: 'BROKEN', error: e.message, filePath };
    }
}

/**
 * 遞迴掃描目錄
 */
function scanDirectory(dir) {
    let results = [];
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            results = results.concat(scanDirectory(fullPath));
        } else if (file.endsWith('.json') && !file.includes('manifest') && !file.includes('libraryStats')) {
            results.push(evaluateFile(fullPath));
        }
    }
    return results;
}

// 主程式執行區塊
if (require.main === module) {
    const args = process.argv.slice(2);
    const isGateMode = args.includes('--gate');
    const target = args.find(a => !a.startsWith('--')) || 'question/platform';

    const absoluteTarget = path.isAbsolute(target) ? target : path.join(process.cwd(), target);

    if (fs.existsSync(absoluteTarget)) {
        let allResults = [];
        if (fs.lstatSync(absoluteTarget).isDirectory()) {
            console.log(`Scanning directory: ${absoluteTarget}`);
            allResults = scanDirectory(absoluteTarget);
        } else {
            allResults = [evaluateFile(absoluteTarget)];
        }

        const summary = {
            totalFiles: allResults.length,
            totalQuestions: 0,
            qualityDist: { L5: 0, L4: 0, L3: 0, L2: 0, L1: 0, BROKEN: 0, 'L1 (BIAS)': 0 },
            byPublisher: {}
        };

        let hasCriticalFailure = false;

        allResults.forEach(r => {
            if (r.quality === 'BROKEN') {
                summary.qualityDist.BROKEN++;
                hasCriticalFailure = true;
                return;
            }
            summary.totalQuestions += r.count;
            summary.qualityDist[r.quality] = (summary.qualityDist[r.quality] || 0) + 1;

            if (r.quality.includes('BIAS') || r.quality === 'L1' || r.quality === 'L2') {
                hasCriticalFailure = true;
            }

            const pub = r.meta.publisher || 'Unknown';
            if (!summary.byPublisher[pub]) {
                summary.byPublisher[pub] = { files: 0, questions: 0, cqi_scores: [] };
            }
            summary.byPublisher[pub].files++;
            summary.byPublisher[pub].questions += r.count;
            summary.byPublisher[pub].cqi_scores.push(parseFloat(r.avgCqi));
        });

        // 計算各出版社的全域 CQI
        for (const pub in summary.byPublisher) {
            const p = summary.byPublisher[pub];
            p.avgCQI = (p.cqi_scores.reduce((a, b) => a + b, 0) / p.cqi_scores.length).toFixed(2);
            delete p.cqi_scores;
        }

        console.log('\n=== 題庫雙軌品質評核總結報告 (CQI & QG) ===');
        console.log(JSON.stringify(summary, null, 2));

        const logDir = path.join(process.cwd(), 'docs/reports');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        const reportPath = path.join(logDir, 'evaluation_report.json');
        fs.writeFileSync(reportPath, JSON.stringify({ summary, details: allResults }, null, 2));
        console.log(`\n詳細報告已儲存至 ${reportPath}`);

        if (isGateMode && hasCriticalFailure) {
            console.error('\n❌ [Quality Gate] 偵測到嚴重品質異常或包含低於標準備備 (L1, L2) 之內容，產出被攔截！');
            process.exit(1);
        } else if (isGateMode) {
            console.log('\n✅ [Quality Gate] 品質稽核通過。全數題庫均達 L3 嚴格標準以上！');
        }
    } else {
        console.log(`Path not found: ${absoluteTarget}`);
        if (isGateMode) process.exit(1);
    }
}

module.exports = { evaluateFile, evaluateQuestion };
