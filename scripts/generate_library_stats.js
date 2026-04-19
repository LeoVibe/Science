import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { evaluateFile } = require('./evaluate_question_quality.js');

const PLATFORM_DIR = path.join(__dirname, '..', 'question', 'platform');
const OUTPUT_FILE = path.join(__dirname, '..', 'apps', 'v3_eidos', 'src', 'data', 'libraryStats.json');
const OUTPUT_FILE_PUBLIC = path.join(__dirname, '..', 'apps', 'v3_eidos', 'public', 'data', 'libraryStats.json');

// Map English platform path subjects to Subject names
const SUBJECT_MAP = {
    'Chinese': '國語',
    'Math': '數學',
    'English': '英語',
    'Science': '自然',
    'SocialStudies': '社會',
    'Life': '生活'
};

const PUBLISHER_MAP = {
    'KangHsuan': '康軒',
    'NanYi': '南一',
    'HanLin': '翰林'
};

/**
 * 已開放科目過濾（Canonical：見 question/README_驗證與盲測準則.md §4）
 * 僅計入開放給使用者的年級+學期組合為統計母體。
 * 預設開放：G3/G4/G5/G6 下學期（S2）。
 * 若後台調整實際開放範圍，可擴充此 Set。
 */
const OPEN_GRADE_SEMESTERS = new Set([
    'G3_S2',
    'G4_S2',
    'G5_S2',
    'G6_S2',
]);

/** 是否為 backup 或 job 備份目錄（須自統計中完全排除） */
function isBackupDir(name) {
    return /backup|_job\d+|_legacy/i.test(name);
}

/** 檔案級成熟度是否達「可上架」：至少 QL2，且非 QL1 (BIAS)。 */
function isPublishedFileQuality(quality) {
    if (!quality || quality === 'BROKEN') return false;
    if (quality === 'QL1' || quality === 'QL1 (BIAS)') return false;
    return ['QL2', 'QL3', 'QL4', 'QL5'].some((l) => quality.startsWith(l));
}

/**
 * 新 QL 定義（2026-04-18 重新定義）
 * 每題判定：
 *   QL4 = blind_evaluation === true（有盲測且通過，不受 research ceiling 限制）
 *   QL3 = quality_level 以 'QL3' 或 'QL4'/'QL5' 開頭（有課文＋有考古題）
 *   QL2 = quality_level 以 'QL2' 開頭（有課文）
 *   QL1 = 其餘
 *
 * 科目等級（grade/sem/subject/publisher 加總）：
 *   QL4 = QL4題數 / 總題數 ≥ 90%
 *   QL3 = (QL3+QL4)題數 / 總題數 ≥ 90%
 *   QL2 = (QL2+QL3+QL4)題數 / 總題數 ≥ 90%
 *   QL1 = 否則
 */
function getQuestionQLevel(q) {
    if (q.blind_evaluation === true) return 4;
    const ql = q.quality_level || '';
    if (ql.startsWith('QL4') || ql.startsWith('QL5')) return 3; // blind not done but QL4-tagged → QL3
    if (ql.startsWith('QL3')) return 3;
    if (ql.startsWith('QL2')) return 2;
    return 1;
}

function computeSubjectQL(counts, total) {
    if (total === 0) return 'QL1';
    const ql4ratio = counts[4] / total;
    const ql3ratio = (counts[3] + counts[4]) / total;
    const ql2ratio = (counts[2] + counts[3] + counts[4]) / total;
    if (ql4ratio >= 0.9) return 'QL4';
    if (ql3ratio >= 0.9) return 'QL3';
    if (ql2ratio >= 0.9) return 'QL2';
    return 'QL1';
}

function scanPlatform() {
    const stats = {};
    const publisherStats = {};
    let totalFilesParsed = 0;

    if (!fs.existsSync(PLATFORM_DIR)) {
        console.error(`Directory not found: ${PLATFORM_DIR}`);
        return;
    }

    const grades = fs.readdirSync(PLATFORM_DIR).filter(d => /^G\d$/.test(d));

    for (const grade of grades) {
        const gradeDir = path.join(PLATFORM_DIR, grade);
        const subjects = fs.readdirSync(gradeDir).filter(d => fs.statSync(path.join(gradeDir, d)).isDirectory());

        for (const subjectKey of subjects) {
            const subject = SUBJECT_MAP[subjectKey] || subjectKey;
            const subjectDir = path.join(gradeDir, subjectKey);
            const semesters = fs.readdirSync(subjectDir).filter(d => /^S\d$/.test(d));

            for (const semester of semesters) {
                // 僅計入已開放科目（Canonical：see README_驗證與盲測準則.md §4）
                if (!OPEN_GRADE_SEMESTERS.has(`${grade}_${semester}`)) continue;

                const semesterDir = path.join(subjectDir, semester);
                const publishers = fs.readdirSync(semesterDir).filter(d => {
                    if (d === '.DS_Store') return false;
                    if (isBackupDir(d)) return false;
                    try {
                        return fs.statSync(path.join(semesterDir, d)).isDirectory();
                    } catch (e) {
                        return false;
                    }
                });

                for (const publisherKey of publishers) {
                    const publisher = PUBLISHER_MAP[publisherKey] || publisherKey;
                    const publisherDir = path.join(semesterDir, publisherKey);
                    // Manifest filename: {GRADE}_{SEM}_{SUBJ}_{PUB}_manifest.json
                    const subjectCode = Object.entries(SUBJECT_MAP).find(([k,v]) => v === subject)?.[0] || subjectKey;
                    const pubCode = Object.entries(PUBLISHER_MAP).find(([k,v]) => v === publisher)?.[0] || publisherKey;
                    const SUBJ_CODE_MAP = { Chinese:'CHI', English:'ENG', Math:'MATH', Science:'SCI', SocialStudies:'SOC', Life:'LIF' };
                    const PUB_CODE_MAP = { HanLin:'HANLIN', KangHsuan:'KANGHSUAN', NanYi:'NANYI' };
                    const subjCode = SUBJ_CODE_MAP[subjectKey] || subjectKey.toUpperCase();
                    const pubCode2 = PUB_CODE_MAP[publisherKey] || publisherKey.toUpperCase();
                    const manifestName = `${grade}_${semester}_${subjCode}_${pubCode2}_manifest.json`;
                    const manifestPath = path.join(publisherDir, manifestName);

                    if (fs.existsSync(manifestPath)) {
                        try {
                            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                            let unitCount = 0;
                            let totalBankQuestions = 0;
                            let totalPublishedQuestions = 0;
                            let totalScore = 0;
                            let unitList = manifest.items || [];
                            // 新 QL 統計：跨全科目所有題目累積
                            const qlCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };

                            if (unitList.length > 0) {
                                unitCount = unitList.length;
                                totalFilesParsed += unitCount;

                                unitList.forEach(item => {
                                    const itemPath = item.file;
                                    if (itemPath) {
                                        const filePath = path.join(publisherDir, itemPath);
                                        if (fs.existsSync(filePath) && filePath.endsWith('.json')) {
                                            try {
                                                // CQI 計算仍用 evaluateFile
                                                const evalResult = evaluateFile(filePath);
                                                if (evalResult && evalResult.quality !== 'BROKEN') {
                                                    totalBankQuestions += evalResult.count;
                                                    if (isPublishedFileQuality(evalResult.quality)) {
                                                        totalPublishedQuestions += evalResult.count;
                                                    }
                                                    totalScore += parseFloat(evalResult.avgCqi || 0) * evalResult.count;
                                                }
                                                // 新 QL：直接讀題目欄位
                                                const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                                                const questions = raw.questions || raw;
                                                if (Array.isArray(questions)) {
                                                    for (const q of questions) {
                                                        const lvl = getQuestionQLevel(q);
                                                        qlCounts[lvl]++;
                                                    }
                                                }
                                            } catch (err) {
                                                console.error(`Error scoring ${filePath}:`, err.message);
                                            }
                                        }
                                    }
                                });
                            }

                            const qlTotal = qlCounts[1] + qlCounts[2] + qlCounts[3] + qlCounts[4];
                            const highestQuality = computeSubjectQL(qlCounts, qlTotal);

                            let packageAvgCqi = 0;
                            if (totalBankQuestions > 0) {
                                packageAvgCqi = (totalScore / totalBankQuestions).toFixed(2);
                            }

                            /** 整包可上架題數：整包成熟度已達 L2+（非 L1／BIAS）時，與題庫數一致；否則僅計入逐檔達 L2+ 之題（草稿／偏差檔不計入上架） */
                            const packageEligible =
                                highestQuality !== 'QL1' && highestQuality !== 'QL1 (BIAS)';
                            const shelfQuestions = packageEligible
                                ? totalBankQuestions
                                : totalPublishedQuestions;

                            const statKey = `${grade}_${semester}_${subject}`;
                            if (!stats[statKey]) {
                                stats[statKey] = {
                                    count: 0,
                                    depth: highestQuality,
                                    gradesStr: grade,
                                    semesterStr: semester,
                                    subjectStr: subject
                                };
                            }
                            stats[statKey].count += unitCount;

                            // 更新整個年級的最高品質 (Aggregation)
                            const qLevels = ['QL1', 'QL2', 'QL3', 'QL4', 'QL5'];
                            if (qLevels.indexOf(highestQuality) > qLevels.indexOf(stats[statKey].depth)) {
                                stats[statKey].depth = highestQuality;
                            }

                            // Specific publisher stats
                            const pubStatKey = `${statKey}_${publisher}`;
                            publisherStats[pubStatKey] = {
                                units: unitCount,
                                bankQuestions: totalBankQuestions,
                                publishedQuestions: shelfQuestions,
                                questions: shelfQuestions,
                                quality: highestQuality,
                                cqi: packageAvgCqi,
                                // 新 QL 明細（供升級分析用）
                                qlCounts: { ql4: qlCounts[4], ql3: qlCounts[3], ql2: qlCounts[2], ql1: qlCounts[1] },
                                qlTotal,
                                ql4pct: qlTotal > 0 ? Math.round(qlCounts[4] / qlTotal * 100) : 0,
                                ql3pct: qlTotal > 0 ? Math.round((qlCounts[3] + qlCounts[4]) / qlTotal * 100) : 0,
                            };

                        } catch (e) {
                            console.error(`Error parsing ${manifestPath}:`, e.message);
                        }
                    }
                }
            }
        }
    }

    const result = {
        lastUpdated: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
        stats,
        publisherStats,
        totalIndexed: totalFilesParsed
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
    fs.writeFileSync(OUTPUT_FILE_PUBLIC, JSON.stringify(result, null, 2));
    console.log(`Successfully generated library_stats.json with ${Object.keys(stats).length} active subjects.`);
}

scanPlatform();
