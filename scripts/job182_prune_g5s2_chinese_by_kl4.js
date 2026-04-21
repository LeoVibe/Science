#!/usr/bin/env node
/**
 * JOB-182：G5S2 國語題庫以 KL4 為語料庫之相關性刪題。
 *
 * 刪除條件（滿足任一即刪除，對齊派工單與 JOB-178 脫節型態）：
 * 1) blind_eval_mismatch.ai_reasoning 含：無效題目／無效命題／完全無關／並未出現在提供的
 * 2) 題幹／選項／說明中《…》所引用之篇名或片語，未出現於同課次 KL4（單課＋考古題）合併語料，
 *    且與 KL4 檔名課名不符
 *
 * 用法：
 *   node scripts/job182_prune_g5s2_chinese_by_kl4.js           # dry-run，印摘要
 *   node scripts/job182_prune_g5s2_chinese_by_kl4.js --apply # 寫回 JSON、更新三份 manifest
 *
 * 詳細刪題列：.logs/JOB-182-prune-detail.jsonl
 */
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const QUESTION_ROOT = path.join(REPO, 'question/platform/G5/Chinese/S2');
const KNOWLEDGE = path.join(REPO, 'knowledge/1_課綱研究/國語/五下');
const LOG_DETAIL = path.join(REPO, '.logs/JOB-182-prune-detail.jsonl');

const PUB = { HanLin: '翰林', KangHsuan: '康軒', NanYi: '南一' };

/** JOB-178 類「脫節／無效命題」盲測訊號（避免誤刪僅答案意見分歧之 mismatch） */
const BLIND_IRRELEVANCE_RE = /無效題目|無效命題|完全無關|並未出現在提供的/;

function lessonKeyFromName(fn) {
    const m = fn.match(/_L(\d+)\.json$/i);
    return m ? `L${m[1]}` : null;
}

function publisherFromPath(abs) {
    if (abs.includes(`${path.sep}HanLin${path.sep}`) || abs.endsWith(`${path.sep}HanLin`)) return 'HanLin';
    if (abs.includes(`${path.sep}KangHsuan${path.sep}`) || abs.endsWith(`${path.sep}KangHsuan`))
        return 'KangHsuan';
    if (abs.includes(`${path.sep}NanYi${path.sep}`) || abs.endsWith(`${path.sep}NanYi`)) return 'NanYi';
    return null;
}

function loadKl4Bundle(publisherEn, lessonKey) {
    const pubZh = PUB[publisherEn];
    if (!pubZh) return { corpusNorm: '', canonicalTitle: '', files: [] };
    const dir = path.join(KNOWLEDGE, pubZh);
    if (!fs.existsSync(dir)) return { corpusNorm: '', canonicalTitle: '', files: [] };
    const prefix = `KL4_五下_${pubZh}_${lessonKey}_`;
    let files;
    try {
        files = fs.readdirSync(dir).filter((f) => f.startsWith(prefix) && f.endsWith('.md'));
    } catch {
        return { corpusNorm: '', canonicalTitle: '', files: [] };
    }
    let raw = '';
    let canonicalTitle = '';
    for (const f of files) {
        const p = path.join(dir, f);
        raw += '\n' + fs.readFileSync(p, 'utf8');
        const m = f.match(
            new RegExp(
                `^KL4_五下_${pubZh.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}_${lessonKey}_(.+)_單課研究紀錄\\.md$`
            )
        );
        if (m) canonicalTitle = m[1];
    }
    const corpusNorm = raw.replace(/\s+/g, '');
    return { corpusNorm, canonicalTitle, files };
}

function extractBookTitles(text) {
    const out = [];
    if (!text) return out;
    const re = /《([^》]{1,80})》/g;
    let m;
    while ((m = re.exec(text)) !== null) {
        const t = m[1].trim();
        if (t) out.push(t);
    }
    return out;
}

function questionBundle(q) {
    return [
        q.question || '',
        q.scenario || '',
        q.explanation || '',
        q.commonMisconception || '',
        Array.isArray(q.options) ? q.options.join('\n') : '',
    ].join('\n');
}

function shouldDelete(q, corpusNorm, canonicalTitle) {
    const mismatchText =
        q.blind_eval_mismatch && typeof q.blind_eval_mismatch.ai_reasoning === 'string'
            ? q.blind_eval_mismatch.ai_reasoning
            : '';
    if (mismatchText && BLIND_IRRELEVANCE_RE.test(mismatchText)) {
        return {
            del: true,
            reason: 'blind_eval_irrelevance_signal',
            snippet: mismatchText.slice(0, 140),
        };
    }

    const bundle = questionBundle(q);
    for (const t of extractBookTitles(bundle)) {
        if (t.length < 2) continue;
        if (corpusNorm.includes(t)) continue;
        if (canonicalTitle && (canonicalTitle.includes(t) || t.includes(canonicalTitle))) continue;
        return { del: true, reason: 'cited_text_not_in_kl4', cited: t };
    }

    return { del: false, reason: 'keep' };
}

function collectJsonFiles() {
    const out = [];
    for (const pub of ['HanLin', 'KangHsuan', 'NanYi']) {
        const d = path.join(QUESTION_ROOT, pub);
        if (!fs.existsSync(d)) continue;
        const fs_ = fs.readdirSync(d).filter((f) => f.endsWith('.json') && !f.includes('manifest'));
        for (const f of fs_) out.push(path.join(d, f));
    }
    return out.sort();
}

function updateManifest(pubFolder, pubKey) {
    const manifestPath = path.join(pubFolder, `G5_S2_CHI_${pubKey}_manifest.json`);
    if (!fs.existsSync(manifestPath)) return;
    const man = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    let total = 0;
    for (const item of man.items || []) {
        const jp = path.join(pubFolder, item.file);
        if (!fs.existsSync(jp)) continue;
        const j = JSON.parse(fs.readFileSync(jp, 'utf8'));
        const qs = j.questions || [];
        const n = qs.length;
        item.count = n;
        total += n;
        if (j.meta && typeof j.meta.title === 'string' && j.meta.title.trim()) {
            item.title = j.meta.title.trim();
        }
        if (j.meta && typeof j.meta.theme === 'string') item.theme = j.meta.theme;
        let sumCqi = 0;
        let cqiN = 0;
        for (const q of qs) {
            if (typeof q.cqi_score === 'number') {
                sumCqi += q.cqi_score;
                cqiN++;
            }
        }
        item.avg_cqi = cqiN ? Math.round((sumCqi / cqiN) * 100) / 100 : 0;
    }
    if (!man.moduleMetaData) man.moduleMetaData = {};
    man.moduleMetaData.total_questions = total;
    man.moduleMetaData.last_updated = new Date().toISOString();
    fs.writeFileSync(manifestPath, JSON.stringify(man, null, 2));
}

function main() {
    const apply = process.argv.includes('--apply');
    const files = collectJsonFiles();
    const summary = {
        apply,
        files: files.length,
        before: 0,
        after: 0,
        deleted: 0,
        reasons: { blind_eval_irrelevance_signal: 0, cited_text_not_in_kl4: 0 },
        byPublisher: { HanLin: 0, KangHsuan: 0, NanYi: 0 },
        byLesson: {},
        byFile: [],
    };

    try {
        fs.mkdirSync(path.dirname(LOG_DETAIL), { recursive: true });
    } catch {
        /* */
    }
    if (fs.existsSync(LOG_DETAIL)) fs.unlinkSync(LOG_DETAIL);

    for (const filePath of files) {
        const pub = publisherFromPath(filePath);
        const lk = lessonKeyFromName(path.basename(filePath));
        if (!pub || !lk) continue;

        const { corpusNorm, canonicalTitle } = loadKl4Bundle(pub, lk);
        const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (!json.questions || !Array.isArray(json.questions)) continue;

        const before = json.questions.length;
        summary.before += before;

        const kept = [];
        let fileDel = 0;
        for (let i = 0; i < json.questions.length; i++) {
            const q = json.questions[i];
            const r = shouldDelete(q, corpusNorm, canonicalTitle);
            if (r.del) {
                fileDel++;
                summary.deleted++;
                summary.byPublisher[pub] = (summary.byPublisher[pub] || 0) + 1;
                summary.byLesson[lk] = (summary.byLesson[lk] || 0) + 1;
                summary.reasons[r.reason] = (summary.reasons[r.reason] || 0) + 1;
                fs.appendFileSync(
                    LOG_DETAIL,
                    JSON.stringify({
                        file: path.relative(REPO, filePath),
                        index: i,
                        reason: r.reason,
                        cited: r.cited,
                        snippet: r.snippet,
                        q: (q.question || '').slice(0, 100),
                    }) + '\n',
                    'utf8'
                );
            } else kept.push(q);
        }

        if (canonicalTitle && json.meta) {
            json.meta.title = canonicalTitle;
            if (json.meta.theme === undefined) json.meta.theme = '';
        }
        json.questions = kept;
        const after = kept.length;
        summary.after += after;

        summary.byFile.push({
            file: path.relative(REPO, filePath),
            before,
            after,
            deleted: fileDel,
            kl4Title: canonicalTitle || null,
        });

        if (apply) {
            /** 清除盲測 mismatch，避免重複執行本腳本時依舊字串再次刪光保留題（JOB-182） */
            for (const q of kept) {
                delete q.blind_eval_mismatch;
                q.blind_evaluation = false;
            }
            if (json.meta) {
                json.meta.job182_prune_applied_at = new Date().toISOString();
            }
            fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
        }
    }

    if (apply) {
        for (const pub of ['HanLin', 'KangHsuan', 'NanYi']) {
            const folder = path.join(QUESTION_ROOT, pub);
            if (!fs.existsSync(folder)) continue;
            updateManifest(folder, pub === 'HanLin' ? 'HANLIN' : pub === 'KangHsuan' ? 'KANGHSUAN' : 'NANYI');
        }
    }

    console.log(JSON.stringify(summary, null, 2));
}

main();
