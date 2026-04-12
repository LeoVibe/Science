/**
 * JOB-171：G4S2 社會三版本—清理選項贅句、修正題幹結構、重置需重測題之盲測欄位。
 * 執行：node scripts/job171_content_fix_g4s2_soc.js
 */
const fs = require('fs');
const path = require('path');

function stripBlindFields(q) {
    delete q.verifying_model;
    delete q.verifying_date;
    delete q.blind_verify_quality_rating;
    delete q.blind_eval_mismatch;
    delete q.authoring_model;
    q.blind_evaluation = false;
}

const nanyiL6 = path.join(
    __dirname,
    '../question/platform/G4/SocialStudies/S2/NanYi/G4_S2_SOC_NANYI_L6.json'
);
const j = JSON.parse(fs.readFileSync(nanyiL6, 'utf8'));

/** @type {Record<number, Partial<{ options: string[]; taxonomy: string; strip: boolean }>>} */
const byIndex = {
    9: {
        options: [
            '召開討論會協調停車需求與公園綠地的折衷方案　　　　　　',
            '為了避免爭吵而放棄提案，從此不再討論　　　　　　　　',
            '向市府陳情要求強制執行，不理會反對意見　　　　　　　',
            '堅持己見並拒絕溝通，要求對方完全讓步　　　　　　　　',
        ],
        strip: true,
    },
    10: {
        options: [
            '政府發建照前須先完成所有環評程序　　　　　　　　　　',
            '引進大廠比保留森林更能帶動繁榮　　　　　　　　　　　',
            '環境保育與經濟發展應尋求平衡　　　　　　　　　　　　',
            '森林沒有經濟價值，應優先開發蓋工廠　　　　　　　　　',
        ],
    },
    11: {
        options: [
            '在空地種植原生種植物並設立生態觀察區　　　　　　　　',
            '全面禁止居民進入公園以免破壞植栽　　　　　　　　　　',
            '將河川加盖成停車場以增加收入　　　　　　　　　　　',
            '砍除老樹改設光雕與大型霓虹裝置　　　　　　　　　　',
        ],
    },
    12: {
        options: [
            '因為必須等選舉年才推動社區計畫　　　　　　　　　　　',
            '因為居民意見需要時間溝通與磨合　　　　　　　　　　　',
            '因為建材與工班難以調度導致延宕　　　　　　　　　　　',
            '因為承辦人員刻意拖延不辦　　　　　　　　　　　　　　',
        ],
    },
    13: {
        options: [
            '認為公共事務與我無關，只要自己開心就好　　　　　　　',
            '只在網路發文抱怨卻沒有實際行動　　　　　　　　　　　',
            '參加社區舉辦的環保淨街志工活動　　　　　　　　　　　',
            '看見問題卻假裝沒看到、不願介入　　　　　　　　　　　',
        ],
    },
    14: {
        options: [
            '大規模拆除老社區以進行都市更新　　　　　　　　　　　',
            '凍結建設、完全維持現狀不作改變　　　　　　　　　　　',
            '限制外地人進入以免資源被占用　　　　　　　　　　　　',
            '居民願意主動關心並參與改善行動　　　　　　　　　　　',
        ],
    },
    17: {
        options: [
            '認為垃圾多是別人的錯，自己不亂丟就好　　　　　　　　',
            '只責怪清潔隊，自己完全不採取行動　　　　　　　　　　',
            '寫信向里長建議並發起社區志工清掃　　　　　　　　　　',
            '覺得年紀太小，只能等大人處理　　　　　　　　　　　　',
        ],
    },
    18: { taxonomy: 'inferential' },
    21: {
        options: [
            '默默等待政府發現問題並處理　　　　　　　　　　　　　　',
            '只在網路發文抱怨，希望別人幫忙按讚　　　　　　　　　',
            '號召鄰居討論並向里長提出具體改善建議　　　　　　　　',
            '直接要求市長下令拆除重建、不必討論　　　　　　　　',
        ],
    },
    22: {
        options: [
            '藝術創作成本較低，是唯一可行的做法　　　　　　　　',
            '軟體活動無助於改善髒亂，應全面改建硬體　　　　　　　',
            '因為沒經費蓋新房，只好改辦活動敷衍　　　　　　　　　',
            '社區營造也可透過文化活動凝聚居民，不必只靠蓋房子　',
        ],
    },
    23: {
        options: [
            '規劃生態步道並保留樹林，兼顧觀光與保育　　　　　　　',
            '為了環境應完全拒絕任何建設與就業機會　　　　　　　　',
            '交給工廠老闆單方決定，居民不必過問　　　　　　　　　',
            '為了經濟優先砍樹蓋廠，環境以後再說　　　　　　　　　',
        ],
    },
    24: {
        options: [
            '捐出全部零用錢蓋一座社區圖書館　　　　　　　　　　　',
            '參加校園環保志工並協助社區垃圾減量宣導　　　　　　　',
            '獨自處理社區污水排放問題　　　　　　　　　　　　　',
            '冒充大人到里辦投票決定經費　　　　　　　　　　　　',
        ],
    },
    25: {
        options: [
            '因為可幫政府省下人事費用　　　　　　　　　　　　　　',
            '因為政府沒時間處理所有細節　　　　　　　　　　　　　',
            '因為居民最了解在地需求，參與後較符合現況　　　　　',
            '因為政府決策通常花費過高　　　　　　　　　　　　　　',
        ],
    },
    26: {
        options: [
            '先在社群公開指責清潔人員偷懶　　　　　　　　　　　　',
            '先畫好美麗設計圖但不評估經費　　　　　　　　　　　　',
            '要求校長封鎖空地禁止進入　　　　　　　　　　　　　',
            '先了解髒亂原因並詢問附近居民需求　　　　　　　　　',
        ],
    },
    27: { taxonomy: 'inferential' },
    28: {
        options: [
            '只有繳稅的人才有資格對社區發表意見　　　　　　　　　',
            '只要自家乾淨就好，公共事務不必理會　　　　　　　　',
            '等長大成人後才需要關心公共事務　　　　　　　　　　',
            '從小就能透過生活行動參與公共事務　　　　　　　　　',
        ],
    },
};

for (const [k, p] of Object.entries(byIndex)) {
    const i = Number(k);
    const q = j.questions[i];
    if (!q) continue;
    if (p.options) q.options = p.options;
    if (p.taxonomy) q.taxonomy = p.taxonomy;
    if (p.strip) stripBlindFields(q);
}

/* Q11–Q30（index 10–29）尚未完成盲測：清除可能殘留的驗證欄位 */
for (let i = 10; i < 30; i++) {
    stripBlindFields(j.questions[i]);
}

fs.writeFileSync(nanyiL6, JSON.stringify(j, null, 2), 'utf8');
console.log('Patched', path.relative(process.cwd(), nanyiL6));
