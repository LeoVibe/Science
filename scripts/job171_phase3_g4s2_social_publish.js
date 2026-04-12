/**
 * JOB-171 Phase 3：G4S2 社會盲測後 is_publishable / review_status 規則化。
 * 規則（對應 question/README_驗證與盲測準則 v4.2）：
 * - blind_evaluation !== true → is_publishable false
 * - Match 且 cqi_score >= 6.5 → is_publishable true, review_status confirmed
 * - blind_eval_mismatch 且 ai_selected === -1 → is_publishable false（嚴格）
 * - 其餘 Mismatch → is_publishable false，維持 pending 供 PM 人工 TYPE-A/B/C
 *
 * 執行前提：已跑 run_blind_eval 與 evaluate_question_quality（含盲測後 CQI）。
 * 執行：node scripts/job171_phase3_g4s2_social_publish.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '../question/platform/G4/SocialStudies/S2');

function walkJsonFiles(dir, acc = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walkJsonFiles(p, acc);
        else if (e.name.endsWith('.json') && !e.name.includes('manifest')) acc.push(p);
    }
    return acc;
}

function applyFile(fp) {
    const j = JSON.parse(fs.readFileSync(fp, 'utf8'));
    if (!Array.isArray(j.questions)) return null;

    let pubTrue = 0;
    let mismatchCount = 0;
    let typeBOrUnknown = 0;
    let aiNeg1 = 0;

    for (const q of j.questions) {
        if (q.blind_evaluation !== true) {
            q.is_publishable = false;
            continue;
        }

        const cqi = typeof q.cqi_score === 'number' ? q.cqi_score : 0;
        const mm = q.blind_eval_mismatch;

        if (mm) {
            mismatchCount++;
            const aiSel = mm.ai_selected;
            if (aiSel === -1) {
                aiNeg1++;
                q.is_publishable = false;
                q.review_status = q.review_status || 'pending_review';
                continue;
            }
            q.is_publishable = false;
            if (!mm.mismatch_triage) typeBOrUnknown++;
            continue;
        }

        if (cqi >= 6.5) {
            q.is_publishable = true;
            q.review_status = 'confirmed';
            pubTrue++;
        } else {
            q.is_publishable = false;
        }
    }

    fs.writeFileSync(fp, JSON.stringify(j, null, 2), 'utf8');
    return {
        file: path.relative(path.join(__dirname, '..'), fp),
        publishableTrue: pubTrue,
        total: j.questions.length,
        mismatch: mismatchCount,
        mismatchNoTriage: typeBOrUnknown,
        aiNeg1,
    };
}

function main() {
    const files = walkJsonFiles(ROOT).filter((f) => /G4_S2_SOC_/.test(path.basename(f)));
    const rows = [];
    for (const fp of files.sort()) {
        const r = applyFile(fp);
        if (r) rows.push(r);
    }

    console.log(JSON.stringify({ job: 'JOB-171', phase: 3, lessons: rows }, null, 2));

    let warnB = false;
    for (const r of rows) {
        const pct = r.total ? (r.mismatchNoTriage / r.total) * 100 : 0;
        if (pct > 5) warnB = true;
    }
    if (warnB) {
        console.warn('⚠️ 有課次 Mismatch 未標 triage 比例 > 5%（請 PM 依 TYPE-B 協議審查）');
    }
}

main();
