/**
 * JOB-171 Phase 0：G4S2 社會三版本 meta.title 修正；南一 L1–L6 清空 questions（保留 meta）。
 * 執行：node scripts/job171_g4s2_social_prep.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '../question/platform/G4/SocialStudies/S2');

const TITLES = {
    KangHsuan: {
        L1: '家鄉的產業（上）',
        L2: '家鄉的產業（下）',
        L3: '家鄉的人口與交通（上）',
        L4: '家鄉的人口與交通（下）',
        L5: '家鄉風情畫（上）',
        L6: '家鄉風情畫（下）',
    },
    HanLin: {
        L1: '家鄉老故事',
        L2: '家鄉的山與海',
        L3: '家鄉的水資源',
        L4: '家鄉的新商機',
        L5: '家鄉新願景',
        L6: '歡迎來到我的家鄉',
    },
    NanYi: {
        L1: '家鄉的地形與生活',
        L2: '家鄉的氣候與生活',
        L3: '家鄉的產業與創新',
        L4: '家鄉的人口與交通',
        L5: '家鄉的多元文化',
        L6: '想像家鄉的樣子',
    },
};

function lessonFromName(base) {
    const m = base.match(/_L(\d+)\.json$/i);
    return m ? `L${m[1]}` : null;
}

function run() {
    let titlesFixed = 0;
    let nanYiCleared = 0;

    for (const pub of ['KangHsuan', 'HanLin', 'NanYi']) {
        const dir = path.join(ROOT, pub);
        const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json') && !f.includes('manifest'));
        for (const f of files) {
            const fp = path.join(dir, f);
            const j = JSON.parse(fs.readFileSync(fp, 'utf8'));
            const lesson = lessonFromName(f);
            if (!lesson || !j.meta) {
                console.warn('skip', fp);
                continue;
            }
            const want = TITLES[pub][lesson];
            if (!want) continue;

            if (j.meta.title !== want) {
                j.meta.title = want;
                titlesFixed++;
            }

            if (pub === 'NanYi') {
                const n = j.questions ? j.questions.length : 0;
                j.questions = [];
                if (n > 0) nanYiCleared += n;
            }

            fs.writeFileSync(fp, JSON.stringify(j, null, 2), 'utf8');
        }
    }

    console.log(`JOB-171 prep: meta.title 更新 ${titlesFixed} 次；南一清空題數合計 ${nanYiCleared}`);
}

run();
