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

/** 檔案級成熟度是否達「可上架」：至少 L2，且非 L1 (BIAS)。盲測通過由派工／metadata 人工核可，未寫入 JSON 前不由此欄判斷。 */
function isPublishedFileQuality(quality) {
    if (!quality || quality === 'BROKEN') return false;
    if (quality === 'L1' || quality === 'L1 (BIAS)') return false;
    return ['L2', 'L3', 'L4', 'L5'].some((l) => quality.startsWith(l));
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
                const semesterDir = path.join(subjectDir, semester);
                const publishers = fs.readdirSync(semesterDir).filter(d => fs.statSync(path.join(semesterDir, d)).isDirectory());

                for (const publisherKey of publishers) {
                    const publisher = PUBLISHER_MAP[publisherKey] || publisherKey;
                    const publisherDir = path.join(semesterDir, publisherKey);
                    const manifestPath = path.join(publisherDir, 'manifest.json');

                    if (fs.existsSync(manifestPath)) {
                        try {
                            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                            let unitCount = 0;
                            let totalBankQuestions = 0;
                            let totalPublishedQuestions = 0;
                            let totalScore = 0;
                            let unitList = manifest.items || [];
                            let highestQuality = 'L1';

                            if (unitList.length > 0) {
                                unitCount = unitList.length;
                                totalFilesParsed += unitCount;

                                // 實際讀取每個單元檔案來統計題數與分數
                                unitList.forEach(item => {
                                    const itemPath = item.file;
                                    if (itemPath) {
                                        const filePath = path.join(publisherDir, itemPath);
                                        if (fs.existsSync(filePath) && filePath.endsWith('.json')) {
                                            try {
                                                const evalResult = evaluateFile(filePath);
                                                if (evalResult && evalResult.quality !== 'BROKEN') {
                                                    totalBankQuestions += evalResult.count;
                                                    if (isPublishedFileQuality(evalResult.quality)) {
                                                        totalPublishedQuestions += evalResult.count;
                                                    }
                                                    totalScore += parseFloat(evalResult.avgCqi || 0) * evalResult.count;

                                                    // QG 採用最嚴格木桶原則或以最高等為代表？
                                                    // 前台展示單一年級版本的最優/最新綜合品質（此為 aggregator）
                                                    // 改為讀取 evalResult 本身的 quality
                                                    const qLevels = ['L1', 'L1 (BIAS)', 'L2', 'L3', 'L4', 'L5'];
                                                    if (qLevels.indexOf(evalResult.quality) > qLevels.indexOf(highestQuality)) {
                                                        highestQuality = evalResult.quality;
                                                    }
                                                }
                                            } catch (err) {
                                                console.error(`Error scoring ${filePath}:`, err.message);
                                            }
                                        }
                                    }
                                });
                            }

                            let packageAvgCqi = 0;
                            if (totalBankQuestions > 0) {
                                packageAvgCqi = (totalScore / totalBankQuestions).toFixed(2);
                            }

                            /** 整包可上架題數：整包成熟度已達 L2+（非 L1／BIAS）時，與題庫數一致；否則僅計入逐檔達 L2+ 之題（草稿／偏差檔不計入上架） */
                            const packageEligible =
                                highestQuality !== 'L1' && highestQuality !== 'L1 (BIAS)';
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
                            const qLevels = ['L1', 'L2', 'L3', 'L4', 'L5'];
                            if (qLevels.indexOf(highestQuality) > qLevels.indexOf(stats[statKey].depth)) {
                                stats[statKey].depth = highestQuality;
                            }

                            // Specific publisher stats
                            const pubStatKey = `${statKey}_${publisher}`;
                            publisherStats[pubStatKey] = {
                                units: unitCount,
                                /** 題庫數：manifest 內所有可評分題數加總 */
                                bankQuestions: totalBankQuestions,
                                /** 上架數／站內對使用者顯示之可作答題數（整包 L2+ 時等同題庫數；整包 L1／BIAS 時改採逐檔 L2+）。盲測通過由派工／metadata 另行核可 */
                                publishedQuestions: shelfQuestions,
                                /** 與 publishedQuestions 相同，保留給舊版前端／腳本 */
                                questions: shelfQuestions,
                                quality: highestQuality,
                                cqi: packageAvgCqi
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
    console.log(`Successfully generated library_stats.json with ${Object.keys(stats).length} active subjects.`);
}

scanPlatform();
