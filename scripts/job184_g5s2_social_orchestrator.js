/**
 * JOB-184：G5S2 社會三版本出題編排（除錯版）
 *
 * - 翰林：保留 L1 範本，僅對 L2–L6 呼叫 auto_generate_questions.js
 * - 康軒／南一：L1–L5 全跑
 * - 每課：產題（spawn 逾時或失敗 → 休眠 30s，最多 3 次）→ evaluate_question_quality.js → 檔級 quality 須為 QL3／QL4／QL5
 *
 * 用法（專案根目錄）：
 *   node scripts/job184_g5s2_social_orchestrator.js [--key Yotta]
 */

const fs = require('fs');
const path = require('path');
const { spawnSync, execSync } = require('child_process');
const { evaluateFile } = require('./evaluate_question_quality.js');

const ROOT = path.resolve(__dirname, '..');
const SOC_BASE = path.join(ROOT, 'question/platform/G5/SocialStudies/S2');
const AUTO = path.join(ROOT, 'scripts/auto_generate_questions.js');
const EVAL = path.join(ROOT, 'scripts/evaluate_question_quality.js');

const MIN_QUESTIONS = 40;
const TARGET_GEN = 45;
const MAX_ATTEMPTS = 3;
const RETRY_SLEEP_MS = 30_000;
const LESSON_TIMEOUT_MS = 25 * 60 * 1000;

function sleep(ms) {
    const sec = Math.max(1, Math.ceil(ms / 1000));
    try {
        execSync(`sleep ${sec}`, { stdio: 'ignore' });
    } catch {
        const end = Date.now() + ms;
        while (Date.now() < end) {}
    }
}

function parseKeyArg() {
    const a = process.argv.slice(2);
    const i = a.indexOf('--key');
    return i >= 0 && a[i + 1] ? a[i + 1] : 'Yotta';
}

/** 產題後題數門檻（與派工單 40–50 題一致） */
function countQuestions(absFile) {
    const j = JSON.parse(fs.readFileSync(absFile, 'utf8'));
    return Array.isArray(j.questions) ? j.questions.length : 0;
}

function runEvaluateJson(absFile) {
    const r = spawnSync(process.execPath, [EVAL, path.relative(ROOT, absFile)], {
        cwd: ROOT,
        encoding: 'utf8',
        maxBuffer: 32 * 1024 * 1024,
    });
    if (r.status !== 0) {
        throw new Error(`evaluate_question_quality 結束碼 ${r.status}\nSTDERR:\n${r.stderr || ''}\nSTDOUT:\n${r.stdout || ''}`);
    }
    return JSON.parse(r.stdout);
}

function qualityMeetsQl3(qualityStr) {
    if (!qualityStr || qualityStr === 'BROKEN') return false;
    if (qualityStr.includes('BIAS')) return false;
    const order = ['QL1', 'QL2', 'QL3', 'QL4', 'QL5'];
    const idx = order.indexOf(qualityStr);
    return idx >= order.indexOf('QL3');
}

function runAutoGenerate(relFile, keyName) {
    const args = [
        AUTO,
        relFile,
        '--target',
        String(TARGET_GEN),
        '--threshold',
        '5.5',
        '--key',
        keyName,
        '--batch',
        '5',
        '--qpm',
        '6',
        '--min-batch-gap-sec',
        '18',
        '--inter-file-ms',
        '2000',
    ];
    const r = spawnSync(process.execPath, args, {
        cwd: ROOT,
        stdio: 'inherit',
        timeout: LESSON_TIMEOUT_MS,
        env: { ...process.env },
    });
    if (r.error) {
        const err = r.error;
        if (err.code === 'ETIMEDOUT') {
            return { ok: false, reason: 'ETIMEDOUT', signal: r.signal };
        }
        return { ok: false, reason: err.message || String(err), stack: err.stack };
    }
    if (r.status !== 0) {
        return { ok: false, reason: `exit_${r.status}`, signal: r.signal };
    }
    return { ok: true };
}

function rebuildPublisherManifest(pubDir, manifestName) {
    const files = fs
        .readdirSync(pubDir)
        .filter((f) => /^G5_S2_SOC_[A-Z]+_L\d+\.json$/i.test(f) && !f.includes('manifest'))
        .sort((a, b) => {
            const na = parseInt(a.match(/L(\d+)/)[1], 10);
            const nb = parseInt(b.match(/L(\d+)/)[1], 10);
            return na - nb;
        });

    if (files.length === 0) {
        throw new Error(`rebuildPublisherManifest: 無課次 JSON：${pubDir}`);
    }
    const sample = JSON.parse(fs.readFileSync(path.join(pubDir, files[0]), 'utf8'));
    const meta0 = sample.meta || {};
    const manifestStem = manifestName.replace(/_manifest\.json$/i, '').replace(/\.json$/i, '');
    const manifest = {
        id: manifestStem || (meta0.publisher ? `G5_S2_SOC_${meta0.publisher}` : 'G5_S2_SOC'),
        publisher: meta0.publisher || '',
        grade: meta0.grade || 'G5',
        semester: meta0.semester || 'S2',
        subject: meta0.subject || 'SOC',
        items: [],
        moduleMetaData: {
            total_questions: 0,
            blind_tested: 0,
            last_updated: new Date().toISOString(),
        },
    };

    let totalQ = 0;
    for (const file of files) {
        const abs = path.join(pubDir, file);
        const content = JSON.parse(fs.readFileSync(abs, 'utf8'));
        const meta = content.meta || {};
        const ev = evaluateFile(abs);
        const lessonId = meta.lesson || file.match(/L\d+/)[0];
        // JOB-205 防破窗：禁止 lessonId 作 title fallback
        if (!meta.title || /^L\d+$/.test(meta.title)) {
            throw new Error(
                `[job184_g5s2_social_orchestrator.js] 課名缺失：${abs}\n` +
                `  需於 meta.title 填真實課名（見 docs/技術設定/JOB-184-批次建檔事故分析.md）。`
            );
        }
        manifest.items.push({
            id: lessonId.replace(/^L/i, 'L').replace(/^l/, 'L'),
            title: meta.title,
            theme: meta.theme || '',
            file,
            count: ev.count || 0,
            blind_tested: 0,
            avg_cqi: ev.avgCqi ? parseFloat(ev.avgCqi) : 0,
            quality: ev.quality || 'QL1',
        });
        totalQ += ev.count || 0;
    }
    manifest.moduleMetaData.total_questions = totalQ;

    const outPath = path.join(pubDir, manifestName);
    fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), 'utf8');
    console.log(`\n[JOB184] manifest 已更新：${path.relative(ROOT, outPath)}（總題 ${totalQ}）`);
}

const PUBLISHERS = [
    {
        folder: 'HanLin',
        manifest: 'G5_S2_SOC_HANLIN_manifest.json',
        /** 僅檔名；翰林跳過 L1 */
        skipRegex: /HANLIN_L1\.json$/i,
    },
    { folder: 'KangHsuan', manifest: 'G5_S2_SOC_KANGHSUAN_manifest.json', skipRegex: null },
    { folder: 'NanYi', manifest: 'G5_S2_SOC_NANYI_manifest.json', skipRegex: null },
];

function listLessonFiles(pubDir, skipRegex) {
    return fs
        .readdirSync(pubDir)
        .filter((f) => /^G5_S2_SOC_[A-Z]+_L\d+\.json$/i.test(f))
        .filter((f) => !skipRegex || !skipRegex.test(f))
        .sort((a, b) => {
            const na = parseInt(a.match(/L(\d+)/)[1], 10);
            const nb = parseInt(b.match(/L(\d+)/)[1], 10);
            return na - nb;
        })
        .map((f) => path.join(pubDir, f));
}

function main() {
    const keyName = parseKeyArg();
    console.log(`[JOB184] 根目錄: ${ROOT}`);
    console.log(`[JOB184] 金鑰區段: --key ${keyName}`);
    console.log(`[JOB184] 目標每課題數: ${TARGET_GEN}（驗收至少 ${MIN_QUESTIONS} 題）`);
    console.log(`[JOB184] 單課逾時: ${LESSON_TIMEOUT_MS / 60000} 分鐘；失敗重試: ${MAX_ATTEMPTS} 次，間隔 ${RETRY_SLEEP_MS / 1000}s\n`);

    for (const pub of PUBLISHERS) {
        const pubDir = path.join(SOC_BASE, pub.folder);
        if (!fs.existsSync(pubDir)) {
            console.error(`[JOB184] 找不到出版社目錄: ${pubDir}`);
            process.exit(1);
        }
        const lessons = listLessonFiles(pubDir, pub.skipRegex);
        console.log(`\n========== ${pub.folder}：共 ${lessons.length} 課 ==========`);

        for (const absFile of lessons) {
            const rel = path.relative(ROOT, absFile);
            const base = path.basename(absFile);
            console.log(`\n[JOB184] >>> 開始課次：${rel}`);

            let lastFail = null;
            for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
                console.log(`[JOB184] 產題嘗試 ${attempt}/${MAX_ATTEMPTS}…`);
                const gen = runAutoGenerate(rel, keyName);
                if (!gen.ok) {
                    lastFail = gen;
                    console.error(`[JOB184] 產題失敗：${JSON.stringify(gen)}`);
                    if (attempt < MAX_ATTEMPTS) {
                        console.log(`[JOB184] ${RETRY_SLEEP_MS / 1000}s 後重試…`);
                        sleep(RETRY_SLEEP_MS);
                    }
                    continue;
                }
                const n = countQuestions(absFile);
                console.log(`[JOB184] 產題結束，目前題數：${n}`);
                if (n < MIN_QUESTIONS) {
                    lastFail = { ok: false, reason: `題數不足 ${n} < ${MIN_QUESTIONS}` };
                    console.error(`[JOB184] ${lastFail.reason}`);
                    if (attempt < MAX_ATTEMPTS) {
                        console.log(`[JOB184] ${RETRY_SLEEP_MS / 1000}s 後重試…`);
                        sleep(RETRY_SLEEP_MS);
                    }
                    continue;
                }
                lastFail = null;
                break;
            }

            if (lastFail) {
                console.error('[JOB184] ❌ 產題在最大重試後仍失敗。完整資訊：');
                console.error(lastFail.stack || JSON.stringify(lastFail, null, 2));
                process.exit(1);
            }

            console.log(`[JOB184] 執行 CQI-P 評分：evaluate_question_quality.js ${rel}`);
            let evalPayload;
            try {
                evalPayload = runEvaluateJson(absFile);
            } catch (e) {
                console.error('[JOB184] ❌ 評分腳本失敗');
                console.error(e.stack || e.message);
                process.exit(1);
            }
            const detail = (evalPayload.details || [])[0];
            if (!detail) {
                console.error('[JOB184] ❌ 評分結果無 details');
                console.error(JSON.stringify(evalPayload, null, 2));
                process.exit(1);
            }
            console.log(
                `[JOB184] 課次品質：${detail.quality} | 平均 CQI：${detail.avgCqi} | 題數：${detail.count}`
            );
            if (!qualityMeetsQl3(detail.quality)) {
                console.error(`[JOB184] ❌ 未達檔級 QL3（實際：${detail.quality}），停止。`);
                process.exit(1);
            }
            const avgCqi = parseFloat(detail.avgCqi);
            if (Number.isFinite(avgCqi) && avgCqi < 5.5) {
                console.error(`[JOB184] ❌ 平均 CQI ${avgCqi} < 5.5，停止。`);
                process.exit(1);
            }
            console.log(`[JOB184] <<< 完成課次：${base}\n`);
        }

        try {
            rebuildPublisherManifest(pubDir, pub.manifest);
        } catch (e) {
            console.error('[JOB184] ❌ 更新 manifest 失敗');
            console.error(e.stack || e.message);
            process.exit(1);
        }
    }

    console.log('\n[JOB184] 複核 G5S2 社會 review 欄位（僅本任務目錄）…');
    walkLessonJsons(SOC_BASE, (abs) => {
        assertReviewFieldsOnFile(abs);
    });

    console.log('\n[JOB184] ✅ 全部課次產題、QL3 門檻與 review 欄位複核通過。');
}

const VALID_REVIEW_STATUS = new Set(['pending_review', 'confirmed', 'corrected', 'needs_rework']);

function assertReviewFieldsOnFile(absPath) {
    const data = JSON.parse(fs.readFileSync(absPath, 'utf8'));
    const qs = data.questions;
    if (!Array.isArray(qs)) return;
    qs.forEach((q, i) => {
        const need = ['is_publishable', 'review_status', 'review_notes', 'reviewer', 'review_date'];
        for (const k of need) {
            if (!Object.prototype.hasOwnProperty.call(q, k)) {
                throw new Error(`[JOB184] review 欄位缺漏：${path.relative(ROOT, absPath)} 第 ${i} 題缺少 ${k}`);
            }
        }
        if (!VALID_REVIEW_STATUS.has(q.review_status)) {
            throw new Error(
                `[JOB184] review_status 不合法：${path.relative(ROOT, absPath)} 第 ${i} 題 → ${q.review_status}`
            );
        }
    });
}

function walkLessonJsons(dir, onFile) {
    for (const name of fs.readdirSync(dir)) {
        if (name === '.DS_Store') continue;
        const abs = path.join(dir, name);
        const st = fs.statSync(abs);
        if (st.isDirectory()) walkLessonJsons(abs, onFile);
        else if (/^G5_S2_SOC_[A-Z]+_L\d+\.json$/i.test(name)) {
            onFile(abs);
        }
    }
}

if (require.main === module) {
    try {
        main();
    } catch (e) {
        console.error('[JOB184] ❌ 未預期例外：');
        console.error(e.stack || e.message);
        process.exit(1);
    }
}

module.exports = { qualityMeetsQl3, runAutoGenerate };
