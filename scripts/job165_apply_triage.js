/**
 * JOB-165：G3S2 國語三版本盲測後 MTP 分類與 is_publishable 回寫（一次性腳本）
 * 執行：node scripts/job165_apply_triage.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '../question/platform/G3/Chinese/S2');
const PUBLISHERS = ['KangHsuan', 'HanLin', 'NanYi'];

/** TYPE-C：兩解皆合理，保留題庫答案，記錄於 Report */
const TYPE_C_KEYS = new Set(['NanYi|G3_S2_CHI_NANYI_L2.json|2']);

function keyOf(pub, file, qi) {
    return `${pub}|${file}|${qi}`;
}

function applyFile(pub, file) {
    const fp = path.join(ROOT, pub, file);
    const j = JSON.parse(fs.readFileSync(fp, 'utf8'));
    let typeA = 0,
        typeB = 0,
        typeC = 0;

    j.questions.forEach((q, qi) => {
        const m = q.blind_eval_mismatch;
        if (!m || m.review_status === 'corrected') {
            return;
        }

        const k = keyOf(pub, file, qi);

        // TYPE-B：南一 L9 單題 answer_index 與課文、解析不一致（AI 與解析一致）
        if (pub === 'NanYi' && file === 'G3_S2_CHI_NANYI_L9.json' && q.question.includes('小琪要記錄「打開染布前的心情」')) {
            q.answer_index = 1;
            m.correct_answer = 1;
            m.review_status = 'corrected';
            m.mismatch_triage = 'TYPE-B';
            m.triage_note = 'JOB-165：解析指向「等待開獎」用語，正解應為選項索引 1';
            delete q.blind_eval_mismatch;
            q.is_publishable = q.cqi_score >= 6.5;
            q.review_status = 'corrected';
            typeB++;
            return;
        }

        if (TYPE_C_KEYS.has(k)) {
            m.review_status = 'confirmed';
            m.mismatch_triage = 'TYPE-C';
            m.triage_note = 'JOB-165：想像／情感投射兩解皆部分合理解析，保留題庫答案';
            typeC++;
        } else {
            m.review_status = 'confirmed';
            m.mismatch_triage = 'TYPE-A';
            m.triage_note =
                m.ai_selected === -1
                    ? 'JOB-165：AI 回傳 -1 或誤判，題幹／解析與答案一致'
                    : 'JOB-165：AI 選項與題庫正解不同，依解析判定題庫正確';
            typeA++;
        }

        // Mismatch 經人工審核確認題庫正確 → 可上架（仍須 CQI）
        q.is_publishable = q.cqi_score >= 6.5;
        q.review_status = 'confirmed';
    });

    // 無 mismatch 的題：依 Match + CQI
    j.questions.forEach((q) => {
        if (q.blind_eval_mismatch) return;
        if (q.blind_evaluation !== true) return;
        q.is_publishable = q.cqi_score >= 6.5;
    });

    fs.writeFileSync(fp, JSON.stringify(j, null, 2));
    return { typeA, typeB, typeC };
}

let totA = 0,
    totB = 0,
    totC = 0;
for (const pub of PUBLISHERS) {
    const dir = path.join(ROOT, pub);
    for (const f of fs.readdirSync(dir)) {
        if (!f.endsWith('.json') || f.includes('manifest')) continue;
        const r = applyFile(pub, f);
        totA += r.typeA;
        totB += r.typeB;
        totC += r.typeC;
    }
}
console.log(JSON.stringify({ totA, totB, totC, note: 'JOB-165 triage applied' }, null, 2));
