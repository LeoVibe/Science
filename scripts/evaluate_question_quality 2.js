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
    
    // 標準化年級格式 (將 grade_4 或 G4 都轉為 G4)
    let normalizedGrade = grade;
    if (grade.startsWith('grade_')) {
        normalizedGrade = 'G' + grade.split('_')[1];
    }
    
    const gradeCN = gradeMap[normalizedGrade] || grade;
    const semesterCN = semesterMap[semester] || semester;
    const outlineFileNameCN = `${gradeCN}${semesterCN}_${subjectCN}_發展綱要.md`;
    const outlineFileNameEN = `${grade}_${semester}_${subjectCN}發展綱要.md`;
    const outlineFileNameEN2 = `${grade}_${semester}_${subjectCN}_發展綱要.md`;

    let outlinePath = path.join(projectRoot, '課綱研究', subjectCN, outlineFileNameCN);
    if (!fs.existsSync(outlinePath)) {
        outlinePath = path.join(projectRoot, '課綱研究', subjectCN, outlineFileNameEN);
    }
    if (!fs.existsSync(outlinePath)) {
        outlinePath = path.join(projectRoot, '課綱研究', subjectCN, outlineFileNameEN2);
    }

    if (!fs.existsSync(outlinePath)) {
        return { ceiling: 'L1', reason: `發展綱要不存在: ${outlineFileNameCN} / ${outlineFileNameEN2}` };
    }

    const content = fs.readFileSync(outlinePath, 'utf8');
    if (!(content.includes('Curriculum Matrix') || content.includes('課程內容與發展矩陣') || content.includes('核心命題導引'))) {
        return { ceiling: 'L1', reason: '發展綱要缺少 Curriculum Matrix' };
    }
    if (!(content.includes('實證驗證區') || content.includes('考古題對照驗證') || content.includes('Audit Gateway'))) {
        return { ceiling: 'L2', reason: '發展綱要缺少實證驗證區' };
    }
    if (!(content.includes('L4 轉化策略') || content.includes('L2 → L4') || content.includes('迷思概念圖譜') || content.includes('L4 Strategy'))) {
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
    // 1. CQI v2 (Composite Quality Index) 綜合加分計算
    // 版本：v2.0 (2026-03-21 重構)
    // 配分總表：A(2.0) + B(2.0) + C(1.5) + D(1.0) + E(1.0) + F(1.0) + G(0.5) = 9.0 基礎
    //           + H(1.0 誘答鑑別度, Phase 3 離線批次) = 10.0 滿分
    //           - I(文化公平性扣分制, 觸發扣 0.5)
    // ==========================================
    let cqi_score = 0;

    // --- A. 選項對稱性 (最高 2.0 分) ---
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
                cqi_score += 2.0;
                isLongestAnswer = false;
            } else {
                if (!isLongestAnswer) {
                    cqi_score += 2.0;
                } else {
                    reports.push('正確選項為最長選項，易被盲猜');
                }
            }
        }
    }

    // --- B. 情境深度 (最高 2.0 分) ---
    // B1: 字數門檻 (1.0)
    // B2: 情境標籤或對話框檢測 (1.0)
    const qLen = String(questionText).length;
    let scenarioDepthScore = 0;
    if (['Math', 'Science', 'English'].includes(subject)) {
        if (qLen >= 25) scenarioDepthScore += 1.0;
        else if (qLen >= 15) scenarioDepthScore += 0.5;
        else if (qLen < 5) reports.push('數理/英語題幹過短 (<5字)');
    } else {
        if (qLen >= 40) scenarioDepthScore += 1.0;
        else if (qLen >= 20) scenarioDepthScore += 0.5;
        else if (qLen < 15) reports.push('文科題幹過短 (<15字)');
    }
    // B2: 情境標籤檢測（【...】或「...」對話框）
    const hasContextTag = /【.+?】/.test(questionText) || /「.+?」/.test(questionText);
    if (hasContextTag) scenarioDepthScore += 1.0;
    cqi_score += Math.min(scenarioDepthScore, 2.0);

    // --- C. 認知層次標註 (最高 1.5 分) ---
    const taxonomy = q.taxonomy || q.type_pirls || 'literal';
    if (['inferential', 'applied', 'critical', 'evaluative', 'analysis'].includes(taxonomy)) cqi_score += 1.5;
    else if (taxonomy === 'literal') cqi_score += 0.75;

    // --- D. 結構完整度 (最高 1.0 分) ---
    if (explanationText && explanationText.length > 10) cqi_score += 0.5;
    if (q.commonMisconception || q.scenario) cqi_score += 0.5;

    // --- E. 易讀性 (最高 1.0 分) ---
    // 計算題幹+選項的平均句長，比對年級合理範圍
    const allText = questionText + ' ' + options.map(o => String(o)).join(' ');
    const sentences = allText.split(/[，。？！；：、\n]/g).filter(s => s.trim().length > 0);
    const avgSentLen = sentences.length > 0 ? sentences.reduce((a, s) => a + s.trim().length, 0) / sentences.length : 0;
    // 依年級判定合理範圍（從 meta 中的 grade 推算，預設中年級標準）
    const gradeNum = parseInt(String(subject === 'English' ? 6 : (q._gradeNum || 4)));
    const sentLenLimit = gradeNum <= 2 ? 12 : gradeNum <= 4 ? 18 : 25;
    if (avgSentLen > 0 && avgSentLen <= sentLenLimit) cqi_score += 0.5;
    else if (avgSentLen > 0 && avgSentLen <= sentLenLimit * 1.3) cqi_score += 0.25;
    // 選項是否含特殊難字（簡易檢測：超長選項可能含難詞）
    const optionAvgLen = options.length > 0 ? options.reduce((a, o) => a + String(o).length, 0) / options.length : 0;
    if (optionAvgLen > 0 && optionAvgLen <= 40) cqi_score += 0.5;
    else if (optionAvgLen > 0 && optionAvgLen <= 60) cqi_score += 0.25;

    // --- F. 課綱對齊 (最高 1.0 分) ---
    // Phase 2 完整實作（需 Curriculum Matrix 結構化）
    // Phase 1 簡易版：研究檔存在即得 0.5，題目有 scenario 且 > 5 字再加 0.5
    if (q.scenario && String(q.scenario).length > 5) cqi_score += 0.5;
    // 研究檔的 0.5 分由全檔級 checkResearchSupport() 提供（見 evaluateFile）

    // --- G. 認知成熟度匹配 (最高 0.5 分) ---
    // 此為全檔級指標，在 evaluateFile() 中攤回每題。此處預留欄位。

    // --- H. 誘答鑑別度 (最高 1.0 分, Phase 3) ---
    // 需 LLM 離線批次驗證結果（blind_test_result 欄位），Phase 1 暫不計入

    // --- I. 文化公平性 (扣分制：觸發扣 0.5) ---
    const biasKeywords = ['百貨公司', '名牌', '出國旅遊', '商務艙', '高鐵商務', '信用卡', '豪宅', '別墅', '跑車', '精品店', '五星級飯店'];
    const fullText = questionText + ' ' + options.join(' ');
    const hasCulturalBias = biasKeywords.some(kw => fullText.includes(kw));
    if (hasCulturalBias) {
        cqi_score -= 0.5;
        reports.push('⚠️ 文化公平性警告：題目含高社經偏見關鍵字');
    }

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
            meta = {
                grade: content.grade,
                subject: content.subject,
                semester: content.semester,
                publisher: content.publisher,
                lesson: content.lesson_id || content.lesson
            };
        }

        if (questions.length === 0) return { quality: 'L1', avgCqi: 0, count: 0 };

        let totalCqiScore = 0;
        const taxCount = { literal: 0, inferential: 0, applied: 0 };
        const answerDist = {};
        let longestAnswerCount = 0;

        // 統計 QG 各等級的題目數量
        const levelCount = { 'L1': 0, 'L2': 0, 'L3': 0, 'L4': 0, 'L5': 0 };

        // CQI v2: 注入年級數字供易讀性評估使用
        const gradeNumForFile = parseInt(String(meta.grade || 'G4').replace(/\D/g, '')) || 4;

        let modified = false;

        questions.forEach(q => {
            // 自動清洗選項與解答中的作弊空白 (包含全形與半形)
            if (Array.isArray(q.options)) {
                const cleanedOptions = q.options.map(o => String(o).replace(/[ \u3000]+/g, ' ').trim());
                for (let i = 0; i < q.options.length; i++) {
                    if (q.options[i] !== cleanedOptions[i]) {
                        q.options[i] = cleanedOptions[i];
                        modified = true;
                    }
                }
            }
            if (typeof q.answer === 'string') {
                const cleanedAns = q.answer.replace(/[ \u3000]+/g, ' ').trim();
                if (q.answer !== cleanedAns) {
                    q.answer = cleanedAns;
                    modified = true;
                }
            }

            q._gradeNum = gradeNumForFile; // 暫存年級供 evaluateQuestion 使用
            const result = evaluateQuestion(q, meta.subject);
            delete q._gradeNum; // 清除暫存
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
        
        if (modified) {
            console.log(`🧹 自動移除作弊空白並存檔: ${path.basename(filePath)}`);
        }

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
        if (file === '.DS_Store') continue;
        const fullPath = path.join(dir, file);
        try {
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                results = results.concat(scanDirectory(fullPath));
            } else if (file.endsWith('.json') && !file.includes('manifest') && !file.includes('libraryStats')) {
                results.push(evaluateFile(fullPath));
            }
        } catch (e) {
            console.warn(`⚠️ 無法讀取檔案或目錄: ${fullPath} (${e.code})`);
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

        const logDir = path.join(process.cwd(), '.logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        const reportPath = path.join(logDir, 'evaluation_report.json');
        try {
            fs.writeFileSync(reportPath, JSON.stringify({ summary, details: allResults }, null, 2));
            console.log(`\n詳細報告已儲存至 ${reportPath}`);
        } catch (e) {
            console.log(`\n寫入報告失敗 (無權限): ${e.message}`);
        }

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
