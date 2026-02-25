/**
 * evaluate_question_quality.js
 * 
 * 依據設計原則自動評估題庫 JSON 的品質等級 (L1~L5)
 * 評分維度：
 * 1. PIRLS 符合度 (事實/理解/應用 比例)
 * 2. 選項對稱性 (字數偏差 < 15%)
 * 3. 結構完整性 (解析、迷思診斷、ID)
 * 4. 情境深度 (字數與描述豐富度)
 * 5. 研究文件門檻 (發展綱要存在性與實證驗證區)
 * 
 * 更新時間：2026-02-25 01:25
 */

const fs = require('fs');
const path = require('path');

/**
 * 檢查對應的研究發展綱要是否存在，以及實證驗證區的完整度
 * 返回天花板等級（研究支撐對品質的最高上限）
 * 
 * @param {string} filePath - 題庫 JSON 的絕對路徑
 * @param {object} meta - 題庫的 metadata（grade, subject, semester）
 * @returns {{ ceiling: string, reason: string }}
 */
function checkResearchSupport(filePath, meta) {
    // 嘗試從檔案路徑推導學科與年級
    const grade = meta.grade || '';
    const semester = meta.semester || '';
    const subject = meta.subject || '';

    // 學科名稱對照表（英文→中文）
    const subjectMap = {
        'Math': '數學',
        'Chinese': '國語',
        'English': '英語',
        'Science': '自然',
        'SocialStudies': '社會'
    };
    const subjectCN = subjectMap[subject] || subject;

    if (!grade || !semester || !subjectCN) {
        return { ceiling: 'L4', reason: '無法從 meta 推導學科資訊，跳過研究文件檢查' };
    }

    // 建構發展綱要的預期路徑
    // 從題庫 JSON 路徑向上尋找 knowledge 目錄
    let projectRoot = filePath;
    // 向上找到包含 knowledge 的根目錄
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

    // 檢查 1：發展綱要是否存在
    if (!fs.existsSync(outlinePath)) {
        console.log("[DEBUG] 未找到檔案:", outlinePath);
        return { ceiling: 'L1', reason: `發展綱要不存在: ${outlineFileNameCN} 或 ${outlineFileNameEN}` };
    }

    // 檢查 2：讀取檔案內容，檢查是否有 Curriculum Matrix
    const content = fs.readFileSync(outlinePath, 'utf8');
    const hasCurriculumMatrix = content.includes('Curriculum Matrix') || content.includes('課程內容與發展矩陣');
    if (!hasCurriculumMatrix) {
        return { ceiling: 'L1', reason: '發展綱要缺少 Curriculum Matrix' };
    }

    // 檢查 3：是否有實證驗證區
    const hasVerificationZone = content.includes('實證驗證區') || content.includes('考古題對照驗證');
    if (!hasVerificationZone) {
        return { ceiling: 'L2', reason: '發展綱要缺少實證驗證區' };
    }

    // 檢查 4：是否有 L4 轉化策略
    const hasL4Strategy = content.includes('L4 轉化策略') || content.includes('L2 → L4') || content.includes('迷思概念圖譜') || content.includes('整合思考歷程 (AI 產出策略)');
    if (!hasL4Strategy) {
        return { ceiling: 'L3', reason: '發展綱要缺少 L4 轉化策略' };
    }

    return { ceiling: 'L4', reason: '研究文件完整，支撐最高 L4' };
}

/**
 * 評核單一題目
 */
function evaluateQuestion(q, subject) {
    let score = 0;
    const reports = [];

    // 取得文本內容
    const questionText = q.question || '';
    const explanationText = q.explanation || '';
    const options = q.options || [];

    // 1. 結構完整性 (最高 1 分)
    if (q.id || q.lesson_id) score += 0.25;
    if (explanationText && explanationText.length > 10) score += 0.5;
    if (q.commonMisconception || q.scenario) score += 0.25;

    // 2. 選項對稱性 (最高 1.5 分) & 長度偏差偵測
    let isLongestAnswer = false;
    let ansIndex = q.answer_index !== undefined ? q.answer_index : q.answer;

    if (options.length === 4) {
        const lengths = options.map(o => String(o).length);
        const avgLen = lengths.reduce((a, b) => a + b, 0) / 4;
        const maxLength = Math.max(...lengths);
        const isAllSameLength = lengths.every(l => l === lengths[0]);

        if (ansIndex >= 0 && ansIndex < 4 && !isAllSameLength && lengths[ansIndex] === maxLength) {
            isLongestAnswer = true;
        }

        if (avgLen > 0) {
            const maxDev = Math.max(...lengths.map(l => Math.abs(l - avgLen))) / avgLen;
            if (['Math', 'Science'].includes(subject) && avgLen < 15) {
                // 數理邏輯科：若選項為短純數字/公式，豁免對稱性扣分與最長答案偏差
                score += 1.5;
                isLongestAnswer = false;
            } else if (subject === 'English' && avgLen < 15) {
                // 語文建構科：單字題放寬
                score += 1.5;
                isLongestAnswer = false;
            } else {
                if (maxDev < 0.15) {
                    score += 1.5;
                } else if (maxDev < 0.3) {
                    score += 0.75;
                } else {
                    reports.push('選項字數差異過大');
                }
            }
        }
    }

    // 3. 情境深度 (最高 1.5 分)
    const qLen = String(questionText).length;
    if (['Math', 'Science', 'English'].includes(subject)) {
        // 數理邏輯與英語科：放寬題幹長度門檻
        if (qLen > 25) {
            score += 1.5;
        } else if (qLen > 15) {
            score += 1.0;
        } else if (qLen > 5) {
            score += 0.5;
        } else {
            reports.push('題目描述過短');
        }
    } else {
        // 文科思辨 (如國語、社會)：嚴格要求情境豐富度
        if (qLen > 50) {
            score += 1.5;
        } else if (qLen > 30) {
            score += 1.0;
        } else if (qLen > 15) {
            score += 0.5;
        } else {
            reports.push('題目描述過短');
        }
    }

    // 4. 認知層次標註 (最高 1 分)
    const taxonomy = q.taxonomy || q.type_pirls || 'literal';
    if (['inferential', 'applied'].includes(taxonomy)) {
        score += 1.0;
    } else if (taxonomy === 'literal') {
        score += 0.5;
    }

    // 5. 判定單題品質等級 (範圍 0~5，滿分即為L5級別的單題體質，但檔案總評未必給L5)
    let quality_level = 'L1';
    if (score >= 4.5) {
        quality_level = 'L4'; // 單題不擅自標記L5，保留給全檔審核
    } else if (score >= 3.5) {
        quality_level = 'L4';
    } else if (score >= 2.5) {
        quality_level = 'L3';
    } else if (score >= 1.5) {
        quality_level = 'L2';
    }

    // 直接將品質寫回題目物件
    q.quality_level = quality_level;

    return { score, reports, taxonomy, quality_level, isLongestAnswer };
}

/**
 * 評核整個題庫檔案
 */
function evaluateFile(filePath) {
    try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        // 辨識格式
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

        if (questions.length === 0) return { quality: 'L1', score: 0, count: 0 };

        let totalScore = 0;
        const taxCount = { literal: 0, inferential: 0, applied: 0 };
        const answerDist = {}; // 紀錄答案分佈
        let longestAnswerCount = 0; // 紀錄「最長選項=答案」的次數

        questions.forEach(q => {
            const result = evaluateQuestion(q, meta.subject);
            totalScore += result.score;
            if (result.isLongestAnswer) longestAnswerCount++;

            if (taxCount[result.taxonomy] !== undefined) {
                taxCount[result.taxonomy]++;
            } else {
                taxCount.literal++; // 預設
            }

            // 紀錄答案 (支援 answer_index 或 answer)
            let ans = q.answer_index;
            if (ans === undefined) ans = q.answer;
            if (ans !== undefined) {
                answerDist[ans] = (answerDist[ans] || 0) + 1;
            }
        });

        const avgScore = totalScore / questions.length;
        const total = questions.length;

        // 答案分佈與選項長度異常檢測 
        let biasWarning = null;
        for (const ans in answerDist) {
            if (answerDist[ans] / total > 0.6) {
                biasWarning = `答案過度集中於: ${ans} (${(answerDist[ans] / total * 100).toFixed(0)}%)`;
                break;
            }
        }

        // 偵測「選項最長的就是答案」的盲猜漏洞 (大於 40% 則視為異常)
        if (!biasWarning && (longestAnswerCount / total) > 0.4) {
            biasWarning = `選項長度偏差: ${(longestAnswerCount / total * 100).toFixed(0)}% 的正確答案為最長選項`;
        }

        // PIRLS 分佈檢查
        let isPirlsBalanced = false;
        if (['Math', 'Science', 'English'].includes(meta.subject)) {
            // 數學、自然、英語的 Literal (事實/計算/單字) 佔比原本就會比較高，放寬限制
            isPirlsBalanced = (taxCount.inferential / total >= 0.15) || (taxCount.applied / total >= 0.1);
        } else {
            // 國語、社會等文科，嚴篩高階理解題佔比
            isPirlsBalanced = (taxCount.inferential / total >= 0.3); // 至少有 30% 是理解層次
        }

        // 研究文件門檻檢查 (第二層防護)
        const researchCheck = checkResearchSupport(filePath, meta);
        console.log(`[DEBUG] File: ${path.basename(filePath)}, Research Ceiling: ${researchCheck.ceiling}, Reason: ${researchCheck.reason}`);
        const levelOrder = ['L1', 'L2', 'L3', 'L4', 'L5'];

        // 等級判定邏輯 (精確對位 5 級分制)
        let quality = 'L1';

        // L4 的嚴格必要條件：高分且選項格式與層次無顯著偏誤
        const isAnswerBalancedForL4 = Object.values(answerDist).every(count => (count / total) <= 0.4);

        // 判斷是否強制 L5 (透過特殊 Meta 宣告)
        const isExpertVerified = content.meta && content.meta.verified_by === 'expert';

        if (isExpertVerified) {
            quality = 'L5';
        } else if (avgScore >= 3.5 && isPirlsBalanced && isAnswerBalancedForL4 && !biasWarning) {
            quality = 'L4';
        } else if (avgScore >= 2.5 && !biasWarning) {
            quality = 'L3';
        } else if (avgScore >= 1.5) {
            quality = 'L2';
        }

        // 熔斷機制：只有當評分為 L1 或 L2 時，才觸發 BIAS 警報並予以降級
        // 若達到 L3，代表其題目的「解析」與「選項對稱」本身已有高水準，適度豁免。
        if (biasWarning) {
            if (quality === 'L1' || quality === 'L2') {
                quality = 'L1 (BIAS)';
            } else {
                biasWarning = null; // L3 以上高品質題庫豁免 BIAS 熔斷
            }
        }

        // 研究文件天花板限制：不得超過研究支撐的最高等級
        // L5 由專家認證，不受研究文件天花板限制
        if (quality !== 'L5') {
            const ceilingIdx = levelOrder.indexOf(researchCheck.ceiling);
            const currentIdx = levelOrder.indexOf(quality);
            if (currentIdx > ceilingIdx) {
                quality = researchCheck.ceiling;
            }
        }

        // 把更新後的 JSON (含每題的 quality_level) 寫回檔案
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');

        return {
            quality,
            avgScore: avgScore.toFixed(2),
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

// 如果直接執行
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

        // 彙整報表
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
                summary.byPublisher[pub] = { files: 0, questions: 0, scores: [] };
            }
            summary.byPublisher[pub].files++;
            summary.byPublisher[pub].questions += r.count;
            summary.byPublisher[pub].scores.push(parseFloat(r.avgScore));
        });

        // 計算平均分
        for (const pub in summary.byPublisher) {
            const p = summary.byPublisher[pub];
            p.avgQualityScore = (p.scores.reduce((a, b) => a + b, 0) / p.scores.length).toFixed(2);
            delete p.scores;
        }

        console.log('\n=== 題庫品質評核總結報告 ===');
        console.log(JSON.stringify(summary, null, 2));

        // 輸出詳細結果到檔案供後續使用
        fs.writeFileSync('evaluation_report.json', JSON.stringify({ summary, details: allResults }, null, 2));
        console.log('\n詳細報告已儲存至 evaluation_report.json');

        // 閘門模式邏輯
        if (isGateMode && hasCriticalFailure) {
            console.error('\n❌ [Quality Gate] 偵測到嚴重品質異常或答案偏差，產出被攔截！');
            process.exit(1);
        } else if (isGateMode) {
            console.log('\n✅ [Quality Gate] 品質稽核通過。');
        }
    } else {
        console.log(`Path not found: ${absoluteTarget}`);
        if (isGateMode) process.exit(1);
    }
}

module.exports = { evaluateFile, evaluateQuestion };
