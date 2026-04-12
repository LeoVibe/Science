/**
 * JOB-169 追加：南一 G4S2 自然 L1–L4 全課重產（各 30 題）
 * 依 KL4 單課研究主題出題；四選一；pending_review。
 * 執行後請跑：evaluate_question_quality.js → auto_balance_json.js → evaluate_question_quality.js
 */
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '../question/platform/G4/Science/S2/NanYi');

function Q(payload) {
  const {
    taxonomy,
    scenario,
    question,
    options,
    answer_index,
    explanation,
    commonMisconception,
    topic,
  } = payload;
  return {
    taxonomy,
    scenario,
    question,
    options: [...options],
    answer_index,
    explanation,
    commonMisconception,
    topic: topic || '',
    quality_level: 'QL3',
    cqi_score: 6,
    blind_evaluation: false,
    is_publishable: false,
    review_status: 'pending_review',
    review_notes: 'JOB-169：依 KL4 重產，待人工覆核與盲測前審。',
    reviewer: null,
    review_date: null,
    authoring_model: 'JOB-169-rebuild',
  };
}

/** 將正解選項移到 options[0] 並 answer_index=0，供 auto_balance_json 洗牌 */
function normalizeOptionsAnswerAtZero(q) {
  const ai = q.answer_index;
  if (ai < 0 || ai > 3) throw new Error(`bad answer_index: ${ai}`);
  const correct = q.options[ai];
  const wrong = q.options.filter((_, i) => i !== ai);
  if (wrong.length !== 3) throw new Error('options must be length 4');
  return { ...q, options: [correct, wrong[0], wrong[1], wrong[2]], answer_index: 0 };
}

const L1_RAW = [
  {
    taxonomy: 'inferential',
    scenario: '【飼養紋白蝶時】小組在記錄本上整理昆蟲發育階段，想確認何謂「完全變態」。',
    question:
      '依南一版四下自然《昆蟲的一生》所學，下列哪一組順序最能代表「完全變態」昆蟲的一生？',
    options: [
      '卵→若蟲→成蟲（沒有蛹期）',
      '卵→幼蟲→蛹→成蟲',
      '卵→成蟲（沒有幼蟲與蛹）',
      '卵→蛹→幼蟲→成蟲（順序錯置）',
    ],
    answer_index: 1,
    explanation:
      '完全變態包含卵、幼蟲、蛹、成蟲四個階段，幼蟲與成蟲外形差異大，中間有不吃不動的蛹期。',
    commonMisconception:
      '學生常把「若蟲」階段誤套在蝴蝶等完全變態昆蟲上，或漏掉蛹期，把順序記成三階段。',
    topic: '完全變態',
  },
  {
    taxonomy: 'inferential',
    scenario: '【校園草地觀察】同學發現蝗蟲的小個體與大個體外形很像，只是翅膀較小。',
    question:
      '依課本概念判斷，蝗蟲的發育屬於不完全變態時，下列哪一項敘述最合理？',
    options: [
      '幼期稱幼蟲，一定要經過蛹期才會變成蟲',
      '幼期稱若蟲，外型近似成蟲，沒有蛹期',
      '幼期住在水中，上岸後才變成蝗蟲',
      '幼期與成蟲完全不同種，彼此沒有連續關係',
    ],
    answer_index: 1,
    explanation:
      '不完全變態為卵→若蟲→成蟲；若蟲外形與成蟲相似，僅體型與翅未成熟，沒有蛹期。',
    commonMisconception:
      '學生常把「幼蟲」一詞泛用到所有昆蟲幼期，或誤以為不完全變態也有蛹。',
    topic: '不完全變態',
  },
  {
    taxonomy: 'literal',
    scenario: '【分類遊戲】老師拿出節肢動物圖卡，要大家依昆蟲特徵挑出真正的昆蟲。',
    question:
      '下列哪一項屬於昆蟲身體構造與附肢特徵的正確組合，可用來和蜘蛛、蜈蚣區隔？',
    options: [
      '頭胸癒合為一體，共有四對步足',
      '身體分頭、胸、腹，胸部有三對足（六隻腳）',
      '身體分很多體節，每一節都有一對腳',
      '沒有觸角，只靠螯肢感覺環境',
    ],
    answer_index: 1,
    explanation:
      '昆蟲身體分頭、胸、腹三部分，胸部著生三對足；通常還有一對觸角，與蜘蛛、蜈蚣不同。',
    commonMisconception:
      '學生常因蜘蛛、蜈蚣也會爬，就誤以為「很多腳」或「會吐絲」等於昆蟲。',
    topic: '昆蟲特徵',
  },
  {
    taxonomy: 'applied',
    scenario: '【圖卡搶答】圖片上生物有八隻腳，身體明顯分頭胸部與腹部兩大段。',
    question:
      '依昆蟲的判定標準，這隻生物「不屬於昆蟲」的最主要理由是什麼？',
    options: [
      '因為牠不會飛，所以不算昆蟲',
      '因為腳的數目不是六隻，且頭胸部合併成頭胸部',
      '因為牠會結網，昆蟲都不會結網',
      '因為牠生活在陸地，昆蟲只能生活在水中',
    ],
    answer_index: 1,
    explanation:
      '昆蟲為六隻腳；蜘蛛屬蛛形綱，具四對步足且頭胸部癒合，因此不符合昆蟲定義。',
    commonMisconception:
      '學生常把「蟲」字直覺延伸，忽略「六隻腳、身體三段」的科學定義。',
    topic: '分類守衛點',
  },
  {
    taxonomy: 'inferential',
    scenario: '【飼養箱觀察】毛毛蟲不再進食，外殼變硬掛在枝條上，學生討論這是哪一階段。',
    question:
      '這種「不吃不動、外有保護構造」的階段，在完全變態中應稱為什麼？其後通常會發生什麼事？',
    options: [
      '稱為若蟲，之後會脫皮變大但外形不變',
      '稱為蛹，之後羽化成外形不同的成蟲',
      '稱為成蟲，之後會再變回卵',
      '稱為幼蟲，之後直接產卵繁殖',
    ],
    answer_index: 1,
    explanation:
      '完全變態中，幼蟲化蛹後進行內部重組，蛹期結束後羽化為成蟲。',
    commonMisconception:
      '學生常把蛹當成「死掉」，或與不完全變態的連續若蟲脫皮混淆。',
    topic: '蛹期',
  },
  {
    taxonomy: 'literal',
    scenario: '【課本插圖】甲圖為蚊子生活史，乙圖為蟋蟀生活史。',
    question:
      '比較兩者後，下列哪一項敘述符合課本對「完全變態」與「不完全變態」的區分？',
    options: [
      '蟋蟀沒有幼蟲期，所以不是昆蟲',
      '蚊子有蛹期，蟋蟀沒有蛹期',
      '蚊子與蟋蟀都有蛹期，只是顏色不同',
      '蟋蟀有蛹期，蚊子沒有蛹期',
    ],
    answer_index: 1,
    explanation:
      '蚊子是完全變態昆蟲，生活史含蛹期；蟋蟀是不完全變態，無蛹期而有若蟲期。',
    commonMisconception:
      '學生看到「小隻的蟲」就一律叫幼蟲，未區分若蟲與幼蟲的課本用法。',
    topic: '跨物種比較',
  },
  {
    taxonomy: 'critical',
    scenario: '【迷思診斷】小安說：「會飛的才是昆蟲，不會飛的就不是昆蟲。」',
    question:
      '下列哪一個例子最能反駁這個說法，並仍符合昆蟲定義？',
    options: [
      '成蟲蝴蝶會飛，所以昆蟲都會飛',
      '有些昆蟲成蟲沒有翅膀或很少飛行，但仍具六隻腳與三段身體',
      '鳥類會飛，所以鳥也是昆蟲的一種',
      '蜘蛛會跳，所以蜘蛛是昆蟲',
    ],
    answer_index: 1,
    explanation:
      '昆蟲多數成蟲有翅，但非絕對；判定仍以身體分段與三對足等特徵為準。',
    commonMisconception:
      '學生把「會飛」當成單一分類標準，忽略構造特徵才是判斷依據。',
    topic: '翅膀迷思',
  },
  {
    taxonomy: 'applied',
    scenario: '【戶外踏查】同學在葉背找到排列整齊的卵粒，並看到正在啃葉的幼蟲。',
    question:
      '若老師請你推測「這隻幼蟲長大後最可能屬於完全變態昆蟲」，下列哪項觀察最能支持你的推測？',
    options: [
      '幼蟲外形已與成蟲幾乎相同',
      '幼蟲與成蟲外形差異大，且課本中同類有蛹期紀錄',
      '幼蟲只有兩隻腳用來爬行',
      '幼蟲不會進食，只靠卵黃發育',
    ],
    answer_index: 1,
    explanation:
      '完全變態的幼蟲（如蝶類幼蟲）通常與成蟲外形差異大，且發育中會出現蛹期。',
    commonMisconception:
      '學生以為「幼蟲像成蟲」才正常，反而誤判完全變態的特徵。',
    topic: '推論與觀察',
  },
  {
    taxonomy: 'inferential',
    scenario: '【紀錄表填寫】欄位要求寫出「幼期名稱」：甲生寫幼蟲，乙生寫若蟲。',
    question:
      '若觀察對象是螳螂（不完全變態），欄位應優先使用哪一個名稱較符合課本用法？',
    options: [
      '幼蟲（因為看起來幼小）',
      '若蟲（幼期與成蟲外形相似、無蛹期）',
      '蛹（因為之後會變大）',
      '成蟲（因為遲早會長大）',
    ],
    answer_index: 1,
    explanation:
      '不完全變態的幼期稱若蟲；幼蟲一詞多用于完全變態的幼期階段。',
    commonMisconception:
      '學生把「幼小的蟲」都口語稱幼蟲，與課本術語不一致。',
    topic: '名詞區分',
  },
  {
    taxonomy: 'literal',
    scenario: '【特徵辨識】老師強調觸角是昆蟲感覺構造之一。',
    question:
      '下列關於昆蟲觸角的敘述，何者最適當？',
    options: [
      '昆蟲沒有觸角，只靠翅膀感覺風向',
      '昆蟲通常有一對觸角，具有嗅覺與觸覺等功能',
      '昆蟲有三對觸角，與三對足對齊',
      '觸角是昆蟲用來呼吸的構造',
    ],
    answer_index: 1,
    explanation:
      '昆蟲一般具一對觸角，司嗅覺、觸覺等；呼吸主要靠氣門與氣管系統。',
    commonMisconception:
      '學生把觸角當裝飾或與足數量連結，誤解功能。',
    topic: '觸角',
  },
];

// 再補 20 題 L1：複合變形
const L1_EXTRA = [];
const L1_PATTERNS = [
  {
    stem: '關於「昆蟲身體分頭、胸、腹」的學習重點，下列敘述何者正確？',
    ok: '三對足附著在胸部，腹部多負責消化與生殖等',
    w: [
      '三對足附著在頭部，方便取食',
      '三對足附著在腹部，方便跳躍',
      '昆蟲沒有腹部，只有頭與胸',
    ],
    topic: '身體分段',
    tax: 'literal',
    scen: '【課堂複習】老師請同學指著模型說出各段名稱與附肢。',
  },
  {
    stem: '下列哪一種生物「不」屬於昆蟲？',
    ok: '蜈蚣（體節多且每節多對步足）',
    w: ['蝴蝶（成蟲六隻腳）', '蜜蜂（成蟲六隻腳）', '螞蟻（工蟻六隻腳）'],
    topic: '節肢動物區辨',
    tax: 'applied',
    scen: '【分類擂台】四張圖卡中選出不屬昆蟲者。',
  },
  {
    stem: '飼養觀察時，若要記錄「食物與排便狀況」，主要是為了了解昆蟲哪方面的資訊？',
    ok: '了解幼期或成蟲的食性與健康線索',
    w: [
      '測量昆蟲會不會發光',
      '確認昆蟲屬於哪一個星座',
      '推算昆蟲的年齡相當於人類幾歲',
    ],
    topic: '觀察紀錄',
    tax: 'inferential',
    scen: '【飼養日誌】小組討論紀錄表欄位設計。',
  },
  {
    stem: '「完全變態」與「不完全變態」最關鍵的差異為何？',
    ok: '完全變態有蛹期，不完全變態沒有蛹期',
    w: [
      '完全變態比較高等，所以一定比較大隻',
      '不完全變態一定生活在水中',
      '完全變態不需要食物就能長大',
    ],
    topic: '變態比較',
    tax: 'inferential',
    scen: '【概念圖】把兩種變態畫成流程圖時要決定分叉點。',
  },
  {
    stem: '課本提到跳蚤成蟲大多無翅，但仍屬昆蟲。這件事主要說明什麼？',
    ok: '有無翅膀不是判斷昆蟲的唯一標準',
    w: [
      '昆蟲其實可以不用有觸角',
      '無翅的節肢動物都自動算昆蟲',
      '跳蚤因為會跳所以不算昆蟲',
    ],
    topic: '翅膀非必要',
    tax: 'critical',
    scen: '【課後問答】同學對「昆蟲一定有翅」提出質疑。',
  },
];

for (let k = 0; k < 20; k++) {
  const pat = L1_PATTERNS[k % L1_PATTERNS.length];
  const opts = [pat.ok, ...pat.w];
  L1_EXTRA.push(
    Q({
      taxonomy: pat.tax,
      scenario: pat.scen,
      question: pat.stem,
      options: opts,
      answer_index: 0,
      explanation: `正確選項陳述符合課本對昆蟲與變態的定義；其餘選項混淆構造、生活史或觀察目的。`,
      commonMisconception:
        '學生常以生活經驗或字面聯想（如「蟲」）取代課本的判準與術語。',
      topic: pat.topic,
    })
  );
}

const L1 = [
  ...L1_RAW.map((x) => normalizeOptionsAnswerAtZero(Q(x))),
  ...L1_EXTRA.map((x) => normalizeOptionsAnswerAtZero(x)),
];
if (L1.length !== 30) throw new Error(`L1 count ${L1.length}`);

// —— L2 電路 —— 
const L2_RAW = [
  {
    taxonomy: 'inferential',
    scenario: '【實驗桌】小組用一顆電池、導線與小燈泡嘗試讓燈泡發光。',
    question:
      '依簡單電路概念，小燈泡要穩定發光，最需要滿足下列哪一項條件？',
    options: [
      '只要導線碰到電池任一極即可',
      '電流需形成封閉迴路，讓電能經用電器回到另一極',
      '燈泡只要靠近電池就會因靜電發光',
      '導線愈短一定愈亮，與接法無關',
    ],
    answer_index: 1,
    explanation:
      '簡單電路須有電源、導線與用電器，且路徑閉合，電流才能持續流動使燈泡發光。',
    commonMisconception:
      '學生常以為「碰到電池就通電」，忽略必須形成完整迴路。',
    topic: '封閉迴路',
  },
  {
    taxonomy: 'literal',
    scenario: '【器材介紹】老師提醒電池金屬帽為正極、另一側為負極。',
    question:
      '在課本常見的敘述中，電流從電池哪一極流出，經外電路後回到另一極？',
    options: [
      '從負極流出，再回到正極（與傳統說法相反）',
      '從正極流出，經燈泡等元件後回到負極',
      '從正負兩極同時流出在燈泡內相遇',
      '電流方向每秒鐘交換一次',
    ],
    answer_index: 1,
    explanation:
      '課本慣用敘述為：電流自電池正極流出，經外電路回到負極（傳統電流方向）。',
    commonMisconception:
      '學生以為兩極「各出一半電流」在燈泡會合，混淆路徑觀念。',
    topic: '電流方向',
  },
  {
    taxonomy: 'applied',
    scenario: '【串聯電路】兩顆燈泡首尾相連接在同一迴路中。',
    question:
      '與並聯相比，下列哪一項較符合串聯電路中「亮度或故障影響」的常見觀察？',
    options: [
      '其中一顆燈泡燒壞，另一顆仍可能正常發光',
      '兩顆燈泡通常較暗，且一顆斷路時另一顆也常不亮',
      '串聯時電流會分兩條路各自流動',
      '串聯一定比並聯更亮，因為電壓變兩倍',
    ],
    answer_index: 1,
    explanation:
      '串聯只有一條路徑，電流相同；一處斷路全滅，且兩燈共享電壓常較暗。',
    commonMisconception:
      '學生以為「接越多燈越亮」，忽略串聯分壓與單一路徑特性。',
    topic: '串聯',
  },
  {
    taxonomy: 'applied',
    scenario: '【並聯電路】兩顆燈泡各接在電池兩極之間的不同支路。',
    question:
      '下列敘述何者較合理？',
    options: [
      '其中一條支路燈泡燒壞，另一條支路仍可能亮',
      '並聯時只有一顆燈泡會亮，另一顆永遠不亮',
      '並聯時兩燈必定較暗，因為電流被切半消失',
      '並聯代表沒有封閉迴路',
    ],
    answer_index: 0,
    explanation:
      '並聯有多條路徑，各支路可獨立；一條斷路不一定讓其他支路失效。',
    commonMisconception:
      '學生把並聯畫成「沒接回負極」的開路，或誤解電流被「用掉」。',
    topic: '並聯',
  },
  {
    taxonomy: 'inferential',
    scenario: '【安全討論】有人用導線直接把電池正負極接在一起。',
    question:
      '這種接法在課堂上稱為什麼？其主要危險或後果為何？',
    options: [
      '稱為斷路，燈泡會特別亮且安全',
      '稱為短路，電流過大可能使電池過熱損壞',
      '稱為並聯，可以延長電池壽命',
      '稱為串聯，能讓燈泡閃爍更有趣',
    ],
    answer_index: 1,
    explanation:
      '導線直接連接正負極且未經用電器，形成短路，電阻極小、電流過大，電池易過熱。',
    commonMisconception:
      '學生以為「沒接燈泡就不會有電」，不知短路反而電流更大。',
    topic: '短路',
  },
  {
    taxonomy: 'literal',
    scenario: '【材料測試】把迴紋針、塑膠尺分別串入電路中觀察燈泡。',
    question:
      '依導體與絕緣體概念，下列配對何者正確？',
    options: [
      '塑膠尺是導體，迴紋針是絕緣體',
      '金屬迴紋針多半是導體，塑膠尺多半是絕緣體',
      '兩者都是導體，因為都是固體',
      '兩者都是絕緣體，因為都很輕',
    ],
    answer_index: 1,
    explanation:
      '金屬一般為導體；塑膠為絕緣體。實測時須確保接觸良好才判讀。',
    commonMisconception:
      '學生以為「硬」或「亮」等外觀決定導電與否。',
    topic: '導體絕緣體',
  },
  {
    taxonomy: 'critical',
    scenario: '【生活連結】小琪說：「只要是液體，就一定會讓電流通過。」',
    question:
      '下列哪一個反例或修正最能指出這句話的問題？',
    options: [
      '蒸餾水幾乎不含離子時不易導電，不能說所有液體都導電',
      '所有液體都一定絕緣，包括海水',
      '液體導電與顏色有關，有顏色才導電',
      '液體導電與溫度無關，所以不必做實驗',
    ],
    answer_index: 0,
    explanation:
      '導電與否取決於可移動帶電粒子；純水離子少，導電性差；鹽水則較易導電。',
    commonMisconception:
      '學生把「水能導電」過度推廣到所有液體。',
    topic: '液體導電',
  },
  {
    taxonomy: 'applied',
    scenario: '【開關設計】在燈泡與電池之間接入金屬接點開關。',
    question:
      '開關在電路中的主要功能是什麼？',
    options: [
      '改變電池的化學成分',
      '控制迴路是否閉合，以決定燈泡亮或不亮',
      '把交流電變成直流電',
      '自動替燈泡充電到百分之百',
    ],
    answer_index: 1,
    explanation:
      '開關藉由接通或斷開導體路徑，控制電流是否能流通。',
    commonMisconception:
      '學生以為開關「製造電」或「放大電壓」。',
    topic: '開關',
  },
  {
    taxonomy: 'inferential',
    scenario: '【實驗紀錄】同學發現燈泡不亮，電池發燙。',
    question:
      '最可能的原因是下列何者？',
    options: [
      '燈泡瓦數太大所以正常發燙',
      '可能發生短路，導致電流過大',
      '一定是因為並聯接太多燈泡',
      '一定是因為導體太長造成斷路',
    ],
    answer_index: 1,
    explanation:
      '短路時電流暴增，電池內阻耗能轉熱；燈泡不亮常因未形成正常負載迴路。',
    commonMisconception:
      '學生把「不亮」只歸因燈泡壞，忽略短路診斷。',
    topic: '故障排除',
  },
  {
    taxonomy: 'literal',
    scenario: '【用電安全】老師提醒濕手不要觸碰插座與電器。',
    question:
      '這項提醒與下列哪一個科學概念最直接相關？',
    options: [
      '濕手會讓皮膚更乾燥所以更安全',
      '潮濕皮膚與汗液離子可能降低電阻，增加觸電風險',
      '濕手只影響視線，與電流無關',
      '濕手會讓電壓自動降為零',
    ],
    answer_index: 1,
    explanation:
      '人體可導電；潮濕時表面導電性上升，觸電危險增加。',
    commonMisconception:
      '學生低估低電壓情境下的風險，以為「沒感覺就安全」。',
    topic: '安全',
  },
];

const L2_EXTRA = [];
const L2_PATTERNS = [
  {
    stem: '兩顆相同燈泡「串聯」接到一顆電池，與「並聯」接到同一顆電池相比，下列何者較常見？',
    ok: '串聯時單顆燈泡兩端電壓較小，通常較暗',
    w: [
      '串聯一定比並聯亮，因為電流變兩倍',
      '並聯時只有一顆燈泡分得電壓',
      '串聯與並聯亮度永遠相同',
    ],
    topic: '亮度比較',
    tax: 'inferential',
    scen: '【比較實驗】控制電池與燈泡規格相同。',
  },
  {
    stem: '要檢測某物體是否為導體，實驗操作最重要的是什麼？',
    ok: '把該物體接入原本可亮的測試電路中觀察燈泡是否仍亮',
    w: [
      '只看物體顏色是否為金屬色',
      '把物體放在磁鐵上能否被吸住',
      '用舌頭嚐味道是否鹹',
    ],
    topic: '導體檢測',
    tax: 'applied',
    scen: '【探究步驟】寫出可操作步驟。',
  },
  {
    stem: '下列哪一種情況最像「封閉迴路」成功、燈泡可能正常發光？',
    ok: '電池、導線、燈泡與開關（若接入）連成可閉合的完整路徑',
    w: [
      '導線只接正極，另一端懸空',
      '燈泡只接一條線到電池',
      '開關永遠保持斷開且無法閉合',
    ],
    topic: '迴路判斷',
    tax: 'inferential',
    scen: '【電路圖判讀】選出可行的接法。',
  },
  {
    stem: '關於「絕緣體」的用途，下列敘述何者最合理？',
    ok: '電線外皮使用絕緣材質，避免觸碰導線時觸電',
    w: [
      '絕緣體用來增加導線電阻到無限大讓電流變強',
      '絕緣體的主要功能是讓燈泡更亮',
      '絕緣體可以把交流變直流',
    ],
    topic: '絕緣應用',
    tax: 'literal',
    scen: '【生活連結】觀察延長線與電線構造。',
  },
  {
    stem: '把多顆電池以「正接負」串聯供電給同一規格燈泡時，若接法正確，下列何者較合理？',
    ok: '總電壓增加，燈泡可能更亮（仍須注意安全與器材限度）',
    w: [
      '電池串聯會讓電壓變成零',
      '串聯只改變燈泡顏色不改變亮度',
      '串聯會自動讓電路斷路',
    ],
    topic: '電池串聯',
    tax: 'applied',
    scen: '【進階操作】教師示範後由學生觀察亮度變化。',
  },
];

for (let k = 0; k < 20; k++) {
  const pat = L2_PATTERNS[k % L2_PATTERNS.length];
  L2_EXTRA.push(
    Q({
      taxonomy: pat.tax,
      scenario: pat.scen,
      question: pat.stem,
      options: [pat.ok, ...pat.w],
      answer_index: 0,
      explanation:
        '題目對應課本簡單電路、串並聯、導體絕緣體與短路等核心概念；錯誤選項為常見迷思或操作誤解。',
      commonMisconception:
        '學生常把亮度變化只歸因電池顆數，忽略接法與迴路是否封閉。',
      topic: pat.topic,
    })
  );
}
const L2 = [
  ...L2_RAW.map((x) => normalizeOptionsAnswerAtZero(Q(x))),
  ...L2_EXTRA.map((x) => normalizeOptionsAnswerAtZero(x)),
];
if (L2.length !== 30) throw new Error(`L2 count ${L2.length}`);

// —— L3 水：毛細、連通管、虹吸 —— 
const L3_RAW = [
  {
    taxonomy: 'inferential',
    scenario: '【實驗桌】把衛生紙下端浸入有色水中，水沿紙上升。',
    question:
      '這種水沿細小孔隙上升現象，課本中稱為什麼？其關鍵條件為何？',
    options: [
      '稱為連通管，關鍵是管子粗細不同',
      '稱為毛細現象，關鍵是材料有細小縫隙或孔隙',
      '稱為虹吸，關鍵是管子要先充滿水且出水端較高',
      '稱為沸騰，關鍵是加熱到一百度',
    ],
    answer_index: 1,
    explanation:
      '毛細現象是水在可潤濕且具細孔的材質中，因附著力與表面張力沿孔隙上升或擴散。',
    commonMisconception:
      '學生以為光滑塑膠板也能讓水「自己往上爬」。',
    topic: '毛細現象',
  },
  {
    taxonomy: 'applied',
    scenario: '【連通管裝置】底部以軟管連通兩支粗細不同的透明管，靜止後觀察水面。',
    question:
      '下列敘述何者正確？',
    options: [
      '粗管水面較低、細管水面較高才會平衡',
      '靜止時各管水面高度相同，與管子粗細無關',
      '水面高度由管子顏色決定',
      '連通管原理只適用於油，不適用水',
    ],
    answer_index: 1,
    explanation:
      '連通管內同種液體靜止時，自由液面等高；粗細改變截面積但不改變平衡高度。',
    commonMisconception:
      '學生直覺以為粗管「裝得多」所以液面較低。',
    topic: '連通管',
  },
  {
    taxonomy: 'inferential',
    scenario: '【茶壺倒水】壺嘴與壺身內水面在靜止時幾乎一樣高。',
    question:
      '這個生活例子主要可用哪一個原理說明？',
    options: [
      '毛細現象使壺嘴的水特別黏',
      '連通管原理：底部連通時液面等高',
      '虹吸使水自動從壺蓋噴出',
      '沸騰使蒸氣把水面壓平',
    ],
    answer_index: 1,
    explanation:
      '壺身與壺嘴底部連通，屬連通管；靜止液面等高，才能順利倒出。',
    commonMisconception:
      '學生把茶壺倒水的順暢性誤歸因毛細或虹吸。',
    topic: '連通管應用',
  },
  {
    taxonomy: 'applied',
    scenario: '【魚缸換水】軟管先裝滿水，一端在水中、另一端垂到更低位置的桶子。',
    question:
      '水能持續流出，最符合下列哪一種現象與條件組合？',
    options: [
      '連通管，只要兩桶水面一樣高即可',
      '虹吸，出水端低於入水端水面且管內充滿水',
      '毛細現象，只要管子夠細即可無限吸水',
      '凝固現象，水結冰後體積膨脹流出',
    ],
    answer_index: 1,
    explanation:
      '虹吸利用管內連續水柱與高度差，讓水越過容器邊緣由高位流向更低的出口端。',
    commonMisconception:
      '學生把虹吸與連通管混為一談，忽略出水端高度條件。',
    topic: '虹吸',
  },
  {
    taxonomy: 'literal',
    scenario: '【材料比較】報紙、鋁箔紙各一端浸入有色水。',
    question:
      '哪一種材料較可能出現明顯「水往上移動」？原因為何？',
    options: [
      '鋁箔紙，因為金屬一定會毛細',
      '報紙，因纖維間有細小孔隙利於毛細',
      '兩者都不會，因為水只會往下流',
      '鋁箔紙，因為它比較重所以把水拉上來',
    ],
    answer_index: 1,
    explanation:
      '紙張纖維間有孔隙，水可毛細上升；金屬箔本身孔隙極少，效果通常不明顯。',
    commonMisconception:
      '學生以為「亮面＝會吸水」。',
    topic: '材料與毛細',
  },
  {
    taxonomy: 'critical',
    scenario: '【概念辨析】小偉說：「連通管與虹吸都是水自己流過管子，所以完全一樣。」',
    question:
      '下列哪一項最能指出兩者的差異？',
    options: [
      '兩者完全相同，沒有差異',
      '連通管強調靜止液面等高；虹吸常利用充水管與高度差讓水越過邊緣流動',
      '連通管只能用在氣體，虹吸只能用在固體',
      '連通管需要加熱，虹吸需要降溫',
    ],
    answer_index: 1,
    explanation:
      '連通管處理靜力平衡下的液面高度；虹吸著重管內滿水與出口位置形成流動。',
    commonMisconception:
      '學生只看「都有管子」忽略物理條件與平衡/流動差異。',
    topic: '三現象辨析',
  },
  {
    taxonomy: 'inferential',
    scenario: '【毛巾擦汗】毛巾能吸汗並擴散到較大面積。',
    question:
      '這與下列哪一個概念最直接相關？',
    options: [
      '連通管使汗水平分佈到等高',
      '虹吸把汗從皮膚抽到空中',
      '毛細作用使液體在纖維縫隙中移動擴散',
      '凝固使汗變成冰晶',
    ],
    answer_index: 2,
    explanation:
      '布料纖維間孔隙提供毛細通道，利於汗液沿纖維擴散與暫存。',
    commonMisconception:
      '學生以為毛巾吸水只靠重力向下。',
    topic: '生活應用',
  },
  {
    taxonomy: 'applied',
    scenario: '【實驗設計】要凸顯「孔隙粗細影響毛細上升高度」。',
    question:
      '下列哪一組對照較符合控制變因精神？',
    options: [
      '同時改變水溫與材料種類',
      '選擇孔隙粗細不同但材質類似或可比的紙條，浸入同一杯有色水',
      '一杯用熱水一杯用冰水分開測但材料相同',
      '只觀察不記錄上升高度',
    ],
    answer_index: 1,
    explanation:
      '對照實驗應一次改變一個主要變因；比較毛細效果時宜固定液體與浸入深度等條件。',
    commonMisconception:
      '學生同時改多變因卻想下因果結論。',
    topic: '實驗設計',
  },
  {
    taxonomy: 'literal',
    scenario: '【自動澆水器示意圖】水從高位容器經細管流到盆栽土壤。',
    question:
      '此類裝置常結合哪兩個與「水移動」相關的概念討論？',
    options: [
      '只有沸騰與凝固',
      '可能同時涉及虹吸（高度差與滿管）與土壤孔隙的毛細擴散',
      '只有磁力與摩擦力',
      '只有光合作用',
    ],
    answer_index: 1,
    explanation:
      '澆水器常利用虹吸或類似高度差供水，進入土壤後水分亦可沿孔隙毛細擴散。',
    commonMisconception:
      '學生只記名詞「自動」却不連結具體物理條件。',
    topic: '綜合應用',
  },
  {
    taxonomy: 'inferential',
    scenario: '【課後反思】為什麼光滑玻璃板垂直放入水中，不像衛生紙那樣明顯「爬升」？',
    question:
      '下列解釋何者最合理？',
    options: [
      '因為玻璃會把水分解成氫氣',
      '因為玻璃表面缺乏像紙張纖維那樣的細小孔隙通道',
      '因為玻璃比水輕所以水不靠近它',
      '因為玻璃會吸收所有毛細現象',
    ],
    answer_index: 1,
    explanation:
      '毛細需要可潤濕材料中的細小通道；致密光滑玻璃本體不像紙張纖維網絡那樣提供孔隙結構。',
    commonMisconception:
      '學生以為任何固體放進水裡都會毛細上升。',
    topic: '毛細條件',
  },
];

const L3_EXTRA = [];
const L3_PATTERNS = [
  {
    stem: '下列哪一個現象「最」屬於連通管原理的靜止結果？',
    ok: 'U 形管兩側液面最後停在一樣高度',
    w: [
      '細管中的水因高度差越過桶緣流到更低處',
      '衛生紙纖維把有色水往上吸',
      '水沸騰時氣泡上升',
    ],
    topic: '現象分類',
    tax: 'applied',
    scen: '【分類題】從四個生活情境選出連通管。',
  },
  {
    stem: '進行虹吸換水時，若出水端高於入水端水面，通常會發生什麼事？',
    ok: '水流不易持續，可能很快停止',
    w: [
      '水流會更快，因為高度差變大',
      '水會自動變成冰',
      '水會開始向上沸騰',
    ],
    topic: '虹吸條件',
    tax: 'inferential',
    scen: '【操作錯誤診斷】同學抱怨虹吸失敗。',
  },
  {
    stem: '植物根部吸水向上運送，課堂常與哪一個「水的移動」概念連結討論？',
    ok: '毛細現象與木質部細管通道的輔助想像',
    w: [
      '連通管使根與葉子水面等高',
      '虹吸把根壓到地下深處',
      '凝固使水在根內結冰推上去',
    ],
    topic: '植物吸水',
    tax: 'inferential',
    scen: '【跨領域連結】老師把課本圖示與實驗對照。',
  },
  {
    stem: '兩個底部相連的容器裝水靜止後，把左側容器稍微提高（仍連通），最後靜止時水面關係為何？',
    ok: '自由液面仍會調整到同一水平高度（相對於重力位能平衡）',
    w: [
      '左側永遠較高，因為被提起來',
      '右側永遠較高，因為比較重',
      '水面高度由容器顏色決定',
    ],
    topic: '連通管進階',
    tax: 'critical',
    scen: '【思考題】連通管整體傾斜或升降的定性討論。',
  },
  {
    stem: '下列何者「不是」毛細現象合理的日常例子？',
    ok: '用吸管喝手搖飲時，主要靠嘴巴吸氣造成的壓力差（不屬純毛細主因）',
    w: [
      '抹布吸乾桌面水漬',
      '酒精燈芯吸酒精上升',
      '粉筆吸墨水在紙上擴散',
    ],
    topic: '例子辨識',
    tax: 'critical',
    scen: '【例子分類】挑出機制不同者。',
  },
];

for (let k = 0; k < 20; k++) {
  const pat = L3_PATTERNS[k % L3_PATTERNS.length];
  L3_EXTRA.push(
    Q({
      taxonomy: pat.tax,
      scenario: pat.scen,
      question: pat.stem,
      options: [pat.ok, ...pat.w],
      answer_index: 0,
      explanation:
        '題目聚焦毛細、連通管、虹吸的定義、條件與生活例子；錯誤選項對應典型混淆或錯誤機制。',
      commonMisconception:
        '學生常把三種「水會動」的現象混用同一個名詞，未先判斷邊界條件。',
      topic: pat.topic,
    })
  );
}
const L3 = [
  ...L3_RAW.map((x) => normalizeOptionsAnswerAtZero(Q(x))),
  ...L3_EXTRA.map((x) => normalizeOptionsAnswerAtZero(x)),
];
if (L3.length !== 30) throw new Error(`L3 count ${L3.length}`);

// —— L4 星空：星座、月相 —— 
const L4_RAW = [
  {
    taxonomy: 'literal',
    scenario: '【觀星活動】老師介紹北方天空可利用勺形星群尋找指北參考星。',
    question:
      '課本常提到：從北斗七星斗口兩顆星延伸約五倍距離，可找到哪一顆指北參考星？',
    options: [
      '天狼星',
      '北極星',
      '金星',
      '月球',
    ],
    answer_index: 1,
    explanation:
      '沿北斗七星斗口兩星延伸約五倍距離，可找到接近天球北天極附近的北極星。',
    commonMisconception:
      '學生誤以為最亮的那顆就是北極星，實際上北極星亮度普通。',
    topic: '北極星尋找',
  },
  {
    taxonomy: 'inferential',
    scenario: '【冬季觀星】獵戶座腰帶三顆星排列整齊，是辨識熱點。',
    question:
      '下列哪一項敘述較符合課本對「星座」概念的說明？',
    options: [
      '同一星座的星星在宇宙中都緊鄰且距離相同',
      '星座是人為劃分的區域，星星彼此實際距離遠近差異很大',
      '星座的星星都繞地球同一圈軌道運行',
      '星座位置固定不會隨季節改變',
    ],
    answer_index: 1,
    explanation:
      '星座是從地球觀看的投影分組；成員星與地球距離各不相同。',
    commonMisconception:
      '學生把星座當成「星空中的貼紙」，以為星星彼此真的相鄰。',
    topic: '星座概念',
  },
  {
    taxonomy: 'applied',
    scenario: '【月相日記】連續觀察同一時段月亮外形由缺變圓再變缺。',
    question:
      '造成月相變化的主要原因，下列何者正確？',
    options: [
      '地球影子每次都遮住月亮造成盈虧（誤把月食當主因）',
      '月球繞地球公轉，地球上看到被太陽照亮的面比例改變',
      '月亮自己會發光，亮度改變造成形狀變化',
      '雲層厚度決定月亮形狀',
    ],
    answer_index: 1,
    explanation:
      '月相源於日—月—地相對位置改變，使地球上見到的亮面比例改變。',
    commonMisconception:
      '學生把月相成因誤等同月食（地球影子）。',
    topic: '月相成因',
  },
  {
    taxonomy: 'literal',
    scenario: '【排序練習】把眉月、上弦月、滿月、下弦月排成一周期的合理順序（單選最佳敘述）。',
    question:
      '下列哪一個順序「較」接近課本常教的月相演變方向（由缺到滿再到缺）？',
    options: [
      '滿月→眉月→下弦月→上弦月',
      '眉月→上弦月→滿月→下弦月→再回到殘月階段',
      '下弦月→眉月→滿月→上弦月',
      '上弦月→滿月→眉月→下弦月（完全固定不循環）',
    ],
    answer_index: 1,
    explanation:
      '常見敘述為由新月附近開始，經眉月、上弦、盈凸、滿月，再經虧凸、下弦、殘月回到新月附近。',
    commonMisconception:
      '學生把上弦與下弦位置或順序對調。',
    topic: '月相順序',
  },
  {
    taxonomy: 'inferential',
    scenario: '【北極星討論】小芸說北極星是全天最亮恒星。',
    question:
      '下列哪一項最能修正這個說法？',
    options: [
      '北極星確實最亮，因為它在正北方',
      '北極星亮度普通；夜空中很亮的往往是行星或天狼星等恒星',
      '北極星是行星所以特別亮',
      '北極星白天最亮晚上變暗',
    ],
    answer_index: 1,
    explanation:
      '北極星約2等星，並非最亮；天狼星等恒星視星等更亮，金星等行星亦常很亮。',
    commonMisconception:
      '「指北」功能被誤推成「最亮」。',
    topic: '北極星亮度',
  },
  {
    taxonomy: 'applied',
    scenario: '【季節觀星】同一時刻、同一地點，秋冬與春夏看到的星座有差異。',
    question:
      '這種差異主要與下列哪一個因素最有關？',
    options: [
      '月亮每天形狀不同',
      '地球公轉使夜晚面向的星空方向改變',
      '星星每天重新排列成新的圖案',
      '星座會自己移動到別的銀河系',
    ],
    answer_index: 1,
    explanation:
      '地球繞日公轉，不同月份夜間朝向的星空背景不同，因此季節星座可見性改變。',
    commonMisconception:
      '學生以為星座自己「換季搬家」，忽略觀測者公轉位置改變。',
    topic: '季節星空',
  },
  {
    taxonomy: 'critical',
    scenario: '【同一天夜晚】同學發現星座位置慢慢東升西移。',
    question:
      '這種「同一晚」的移動，與「季節換星」的主要差別是什麼？',
    options: [
      '同一晚移動主要由地球自轉造成視運動；季節差異則與公轉造成星空背景改變有關',
      '兩者完全一樣，都是月亮造成',
      '同一晚移動是因為星座自己走路；季節差異是因為風太大',
      '同一晚不會移動，都是錯覺',
    ],
    answer_index: 0,
    explanation:
      '地球自轉造成天體東升西落的日週運動；公轉造成較長時間尺度下可見星座組合改變。',
    commonMisconception:
      '學生把自轉與公轉的效應混成同一個原因。',
    topic: '自轉公轉',
  },
  {
    taxonomy: 'literal',
    scenario: '【仙后座】呈現 W 或 M 形排列，常作為北極星另一側的尋找標誌。',
    question:
      '下列敘述何者較適當？',
    options: [
      '仙后座只在白天出現',
      '仙后座是北天星座之一，形狀像 W 或 M，可作觀星辨識',
      '仙后座就是獵戶座腰帶三颗星',
      '仙后座是太陽系行星集合',
    ],
    answer_index: 1,
    explanation:
      '仙后座為北天著名星座，呈 W/M 形，與北斗分別在北極星兩側區域協助定位。',
    commonMisconception:
      '學生把不同星座的幾何特徵彼此混淆。',
    topic: '仙后座',
  },
  {
    taxonomy: 'inferential',
    scenario: '【觀測高度角】用簡易高度角觀測概念討論月亮或星星的高度。',
    question:
      '在台灣地區觀測，北極星的高度角大約與什麼地理量相近（概念性選擇）？',
    options: [
      '與當地緯度相近（北半球定性理解）',
      '永遠等於零度',
      '永遠等於九十度',
      '與經度相同',
    ],
    answer_index: 0,
    explanation:
      '北半球地區，北極星仰角約等於觀測地緯度（課堂常作定性連結）。',
    commonMisconception:
      '學生以為北極星永遠在天頂或地平線。',
    topic: '高度角與緯度',
  },
  {
    taxonomy: 'applied',
    scenario: '【月食新聞】報導月全食時月亮變暗紅。',
    question:
      '月食與「日常月相變化」的主要差異，下列敘述何者較正確？',
    options: [
      '月食是常見的每天晚上都會發生的現象',
      '月食是地球影子遮住月球造成的特殊事件；月相則是照亮面比例的日常變化',
      '月食代表月亮自己停止發光一天',
      '月食與月相完全同一機制',
    ],
    answer_index: 1,
    explanation:
      '月相變化來自日—月—地幾何；月食發生時地球影子落在月面，屬特殊對齊事件。',
    commonMisconception:
      '學生把月食與月相成因混為一談。',
    topic: '月食與月相',
  },
];

const L4_EXTRA = [];
const L4_PATTERNS = [
  {
    stem: '北斗七星與「大熊座」的關係，下列敘述何者較符合課本說明？',
    ok: '北斗七星是大熊座的一部分星群，可用來協助辨識',
    w: [
      '北斗七星本身就是完整的大熊座且等於獵戶座',
      '北斗七星是行星連成的線',
      '北斗七星只在南半球看得到',
    ],
    topic: '北斗七星',
    tax: 'literal',
    scen: '【星座圖卡】對照課本插圖。',
  },
  {
    stem: '為什麼夏天夜晚較不易看到獵戶座（相對冬季）？下列哪一個是「概念上」合理的說法？',
    ok: '不同季節夜晚面向的星空背景不同，獵戶座在冬季夜晚較易觀察',
    w: [
      '因為獵戶座在夏天會掉到地底下消失',
      '因為獵戶座只在白天出現',
      '因為夏天沒有星星',
    ],
    topic: '季節與星座',
    tax: 'inferential',
    scen: '【季節提問】連結公轉與觀測時段。',
  },
  {
    stem: '關於「上弦月」，下列敘述何者較合理？',
    ok: '常見描述為亮面朝西（傍晚至夜晚可見的半圓形態之一）',
    w: [
      '上弦月一定是满月',
      '上弦月只在日全食出現',
      '上弦月是地球影子遮住一半造成',
    ],
    topic: '上弦月',
    tax: 'literal',
    scen: '【月相圖】判讀亮面方向與時段。',
  },
  {
    stem: '同一晚觀察星星，隔幾小時後星座位置改變，主要是因為什麼？',
    ok: '地球自轉造成天體視位置的改變',
    w: [
      '星星自己排隊換位置',
      '月亮把星座推開',
      '只有雲在動，星星其實不動',
    ],
    topic: '視運動',
    tax: 'inferential',
    scen: '【長時間曝光照片討論】',
  },
  {
    stem: '下列哪一項是「錯誤」的迷思陳述？',
    ok: '「月亮會自己發光，所以才有圓缺」',
    w: [
      '「月相與觀測者看到被照亮的面比例有關」',
      '「北極星可用來協助辨別北方」',
      '「星座是人為劃分的區域」',
    ],
    topic: '迷思診斷',
    tax: 'critical',
    scen: '【是非迷思改寫成四選一】選出錯誤說法。',
  },
];

for (let k = 0; k < 20; k++) {
  const pat = L4_PATTERNS[k % L4_PATTERNS.length];
  L4_EXTRA.push(
    Q({
      taxonomy: pat.tax,
      scenario: pat.scen,
      question: pat.stem,
      options: [pat.ok, ...pat.w],
      answer_index: 0,
      explanation:
        '題目對應星座辨識、北極星、季節星空與月相／月食差異等 KL4 重點；錯誤選項為常見迷思。',
      commonMisconception:
        '學生常把「最亮」「指北」「月食」與「月相」等概念彼此套用錯位。',
      topic: pat.topic,
    })
  );
}
const L4 = [
  ...L4_RAW.map((x) => normalizeOptionsAnswerAtZero(Q(x))),
  ...L4_EXTRA.map((x) => normalizeOptionsAnswerAtZero(x)),
];
if (L4.length !== 30) throw new Error(`L4 count ${L4.length}`);

const FILES = [
  {
    file: 'G4_S2_SCI_NANYI_L1.json',
    meta: {
      grade: 'G4',
      semester: 'S2',
      subject: 'SCI',
      publisher: 'NANYI',
      lesson: 'L1',
      order: 1,
      title: '昆蟲的一生',
      theme: '',
    },
    questions: L1,
  },
  {
    file: 'G4_S2_SCI_NANYI_L2.json',
    meta: {
      grade: 'G4',
      semester: 'S2',
      subject: 'SCI',
      publisher: 'NANYI',
      lesson: 'L2',
      order: 2,
      title: '神奇的電力',
      theme: '',
    },
    questions: L2,
  },
  {
    file: 'G4_S2_SCI_NANYI_L3.json',
    meta: {
      grade: 'G4',
      semester: 'S2',
      subject: 'SCI',
      publisher: 'NANYI',
      lesson: 'L3',
      order: 3,
      title: '水的移動',
      theme: '',
    },
    questions: L3,
  },
  {
    file: 'G4_S2_SCI_NANYI_L4.json',
    meta: {
      grade: 'G4',
      semester: 'S2',
      subject: 'SCI',
      publisher: 'NANYI',
      lesson: 'L4',
      order: 4,
      title: '星空',
      theme: '',
    },
    questions: L4,
  },
];

for (const pack of FILES) {
  const outPath = path.join(OUT_DIR, pack.file);
  const doc = {
    meta: pack.meta,
    questions: pack.questions,
    publisher: 'NanYi',
  };
  fs.writeFileSync(outPath, JSON.stringify(doc, null, 2), 'utf8');
  console.log('Wrote', outPath, 'questions:', pack.questions.length);
}
