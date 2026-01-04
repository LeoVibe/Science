// 國小三年級社會題目數據庫
// 您可以在此文件中添加、修改或刪除題目

export const CATEGORIES = {
  GEOGRAPHY: '地理',
  HISTORY: '歷史',
  CIVICS: '公民'
}

export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: '選擇題',
  TRUE_FALSE: '是非題',
  FILL_BLANK: '填空題'
}

// 題目數據
export const QUESTIONS = [
{
    id: 1,
    category: '地理',
    question: '台灣位於歐亞大陸板塊與哪一個板塊的交界處，因此多地震活動？',
    options: ['太平洋板塊', '菲律賓海板塊', '印度洋板塊', '北美洲板塊'],
    correctAnswer: 1,
    explanation: '台灣位於歐亞板塊與菲律賓海板塊的聚合型板塊交界帶，因此地殼不穩定，多地震與溫泉。',
    funFact: '海岸山脈其實原本是菲律賓海板塊上的火山島，後來撞上台灣才變成現在這樣。'
  },
  {
    id: 2,
    category: '歷史',
    question: '1624年，哪一國人來到台灣，並在台南安平興建熱蘭遮城（今安平古堡）？',
    options: ['西班牙人', '荷蘭人', '葡萄牙人', '日本人'],
    correctAnswer: 1,
    explanation: '荷蘭人在 1624 年佔領台灣南部，建立了熱蘭遮城作為統治中心。',
    funFact: '西班牙人則是在 1626 年佔領台灣北部，蓋了聖薩爾瓦多城。'
  },
  {
    id: 3,
    category: '公民',
    question: '依據經濟學原理，當商品的價格下降時，通常會發生什麼情況？',
    options: ['需求量增加', '需求量減少', '供給量增加', '供給量不變'],
    correctAnswer: 0,
    explanation: '根據需求法則，價格與需求量呈反向變動。價格便宜了，大家就更想買（需求量增加）。',
    funFact: '這就是為什麼在大特價的時候，商店總是擠滿了人。'
  },
  {
    id: 4,
    category: '地理',
    question: '北回歸線（23.5°N）經過台灣的哪兩個縣市？',
    options: ['嘉義、花蓮', '台南、台東', '高雄、屏東', '台中、宜蘭'],
    correctAnswer: 0,
    explanation: '北回歸線通過台灣的嘉義縣（水上鄉）與花蓮縣（瑞穗鄉、豐濱鄉）。',
    funFact: '嘉義縣水上鄉有全世界最早建立的北回歸線標誌。'
  },
  {
    id: 5,
    category: '歷史',
    question: '清領時期，為了區隔漢人與原住民的活動範圍，避免衝突，清廷劃定了什麼界線？',
    options: ['海禁紅線', '土牛紅線', '紫禁城線', '長城'],
    correctAnswer: 1,
    explanation: '清廷挖掘深溝並堆土成堆（土牛），劃定漢番界線，禁止漢人越界開墾，稱為「土牛紅線」。',
    funFact: '雖然有這條線，但漢人常常還是會偷跑過去開墾，這就是「偷墾」。'
  },
  {
    id: 6,
    category: '公民',
    question: '我國憲法規定，人民有納稅、服兵役及什麼義務？',
    options: ['投票', '受國民教育', '參加政黨', '信仰宗教'],
    correctAnswer: 1,
    explanation: '憲法規定人民的三大義務是：納稅、服兵役、受國民教育。',
    funFact: '受國民教育既是人民的權利，也是人民的義務喔！'
  },
  {
    id: 7,
    category: '地理',
    question: '台灣冬季盛行什麼季風，導致東北部地區多雨？',
    options: ['西南季風', '東南季風', '東北季風', '西北季風'],
    correctAnswer: 2,
    explanation: '冬季時，大陸冷高壓帶來東北季風，經過海洋攜帶水氣，在迎風面的東北部形成地形雨。',
    funFact: '所以基隆才會有「雨都」的稱號。'
  },
  {
    id: 8,
    category: '歷史',
    question: '「二二八事件」發生於西元哪一年？',
    options: ['1945年', '1947年', '1949年', '1950年'],
    correctAnswer: 1,
    explanation: '1947年2月27日的查緝私菸事件引發衝突，隔日爆發全台性的抗爭，即為二二八事件。',
    funFact: '這起事件對台灣戰後的政治發展影響深遠。'
  },
  {
    id: 9,
    category: '公民',
    question: '下列何者屬於「非政府組織」（NGO）？',
    options: ['聯合國 (UN)', '世界衛生組織 (WHO)', '慈濟基金會', '歐盟 (EU)'],
    correctAnswer: 2,
    explanation: '慈濟基金會是由民間發起，不屬於政府體系的組織。其他三者皆為由國家組成的國際組織。',
    funFact: 'NGO 在國際社會中扮演越來越重要的角色，被稱為「第三部門」。'
  },
  {
    id: 10,
    category: '地理',
    question: '關於「比例尺」，若地圖上 1 公分代表實際距離 10 公里，這張地圖的比例尺是多少？',
    options: ['1:1000', '1:10000', '1:100000', '1:1000000'],
    correctAnswer: 3,
    explanation: '10公里 = 1,000,000公分。所以比例尺是 1:1,000,000。',
    funFact: '比例尺的分母越大，代表地圖縮小得越多，這叫做「小比例尺」地圖。'
  },
  {
    id: 11,
    category: '歷史',
    question: '哪一位歷史人物被尊稱為「國父」，領導革命推翻滿清？',
    options: ['蔣中正', '毛澤東', '孫中山', '袁世凱'],
    correctAnswer: 2,
    explanation: '孫中山先生領導十次革命，終於在辛亥革命成功推翻清朝，建立中華民國。',
    funFact: '孫中山其實原本是學醫的，後來認為「醫人不如醫國」才投身革命。'
  },
  {
    id: 12,
    category: '公民',
    question: '在法律上，年滿幾歲具有完全的刑事責任能力？',
    options: ['14歲', '16歲', '18歲', '20歲'],
    correctAnswer: 2,
    explanation: '刑法規定，年滿 18 歲為完全責任能力人，犯罪需負完全的刑事責任。',
    funFact: '民法的成年年齡現在也下修為 18 歲囉！'
  },
  {
    id: 13,
    category: '地理',
    question: '台灣主要的山脈多呈南北走向，其中最高峰「玉山」位於哪一座山脈？',
    options: ['雪山山脈', '中央山脈', '玉山山脈', '阿里山山脈'],
    correctAnswer: 2,
    explanation: '玉山主峰位於玉山山脈，海拔 3952 公尺，是東北亞第一高峰。',
    funFact: '很多人以為玉山在中央山脈，其實它是獨立的玉山山脈喔！'
  },
  {
    id: 14,
    category: '歷史',
    question: '台灣第一條鐵路是在誰的任內開始興建的？',
    options: ['沈葆楨', '劉銘傳', '唐景崧', '鄭成功'],
    correctAnswer: 1,
    explanation: '劉銘傳擔任台灣首任巡撫時，推動自強運動，開始興建基隆到新竹的鐵路。',
    funFact: '當時的火車頭就是現在展示在二二八和平紀念公園的「騰雲號」。'
  },
  {
    id: 15,
    category: '公民',
    question: '如果買到瑕疵商品，消費者可以依據什麼法律來維護權益？',
    options: ['公平交易法', '消費者保護法', '社會秩序維護法', '勞動基準法'],
    correctAnswer: 1,
    explanation: '《消費者保護法》專門規範企業經營者與消費者之間的關係，保障消費者權益。',
    funFact: '網購的「七天鑑賞期」就是這部法律規定的。'
  },
  {
    id: 16,
    category: '地理',
    question: '下列哪個地形區是台灣人口最密集、工商業最發達的區域？',
    options: ['花東縱谷', '嘉南平原', '台北盆地', '埔里盆地'],
    correctAnswer: 2,
    explanation: '台北盆地是台灣的政治、經濟與文化中心，人口密度最高。',
    funFact: '台北盆地以前其實是一個大湖泊（台北湖）！'
  },
  {
    id: 17,
    category: '歷史',
    question: '「馬關條約」是甲午戰爭後，清廷與哪一國簽訂的？',
    options: ['英國', '法國', '日本', '美國'],
    correctAnswer: 2,
    explanation: '1895年甲午戰爭清廷戰敗，與日本簽訂馬關條約，割讓台灣、澎湖。',
    funFact: '簽約的大臣是李鴻章，他當時為了這件事背負了很大的罵名。'
  },
  {
    id: 18,
    category: '公民',
    question: '我國中央政府中，負責解釋憲法、統一解釋法律及命令的是？',
    options: ['立法院', '司法院', '行政院', '監察院'],
    correctAnswer: 1,
    explanation: '司法院設有大法官，負責進行憲法法庭判決（舊稱釋憲），解釋法律與憲法。',
    funFact: '大法官共有 15 位，由總統提名，立法院同意任命。'
  },
  {
    id: 19,
    category: '地理',
    question: '台灣哪一個離島以「玄武岩柱狀節理」地形景觀聞名？',
    options: ['綠島', '蘭嶼', '澎湖', '金門'],
    correctAnswer: 2,
    explanation: '澎湖群島主要由火山熔岩（玄武岩）冷卻凝固而成，形成了壯觀的柱狀節理。',
    funFact: '著名的「雙心石滬」也在澎湖喔！'
  },
  {
    id: 20,
    category: '歷史',
    question: '中國歷史上唯一的女皇帝是誰？',
    options: ['慈禧太后', '呂后', '武則天', '楊貴妃'],
    correctAnswer: 2,
    explanation: '武則天改國號為「周」，是中國歷史上唯一正統的女皇帝。',
    funFact: '她發明了很多新文字，其中「曌」（ㄓㄠˋ）就是她給自己取的名字，意指日月當空。'
  },
  {
    id: 21,
    category: '公民',
    question: '「機會成本」是指在做選擇時，所放棄的選項中價值為何者？',
    options: ['最低的', '最高的', '平均的', '總和的'],
    correctAnswer: 1,
    explanation: '機會成本是指「被放棄的選擇中，價值最高的那一個」。',
    funFact: '天下沒有白吃的午餐，這句話就是在講機會成本。'
  },
  {
    id: 22,
    category: '地理',
    question: '世界上使用人數最多的語言是？（注意：不是分佈最廣）',
    options: ['英語', '漢語（中文）', '西班牙語', '法語'],
    correctAnswer: 1,
    explanation: '因中國人口眾多，漢語（母語使用者）是世界上使用人數最多的語言。',
    funFact: '英語則是世界上分佈最廣、也是最多國家列為官方語言的語言。'
  },
  {
    id: 23,
    category: '歷史',
    question: '工業革命最早起源於哪一個行業？',
    options: ['鋼鐵業', '紡織業', '交通運輸業', '化學工業'],
    correctAnswer: 1,
    explanation: '18世紀英國工業革命最早是從棉紡織業的機器改良開始的（如飛梭、珍妮紡紗機）。',
    funFact: '蒸汽機的改良（瓦特）後來為工業革命提供了強大的動力。'
  },
  {
    id: 24,
    category: '公民',
    question: '媒體常被稱為行政、立法、司法之外的「第四權」，其主要功能為何？',
    options: ['娛樂大眾', '監督政府', '創造利潤', '宣傳政令'],
    correctAnswer: 1,
    explanation: '媒體透過報導與評論，發揮監督政府、揭發弊端的功能，制衡其他權力。',
    funFact: '隨著網路發展，現在每個人都可以是自媒體，監督的力量更大了。'
  },
  {
    id: 25,
    category: '地理',
    question: '下列哪一個氣候類型，特色是「全年高溫多雨」？',
    options: ['熱帶雨林氣候', '熱帶莽原氣候', '熱帶季風氣候', '地中海型氣候'],
    correctAnswer: 0,
    explanation: '熱帶雨林氣候位於赤道附近，終年受赤道低壓帶影響，高溫且多雨。',
    funFact: '亞馬遜雨林被稱為「地球之肺」，就是屬於這種氣候。'
  },
  {
    id: 26,
    category: '歷史',
    question: '台灣原住民中，哪一族擁有特殊的「矮靈祭」傳說與祭典？',
    options: ['泰雅族', '賽夏族', '阿美族', '布農族'],
    correctAnswer: 1,
    explanation: '賽夏族的矮靈祭（巴斯達隘）是為了紀念傳說中教導農耕卻被陷害的矮黑人。',
    funFact: '矮靈祭每兩年舉辦一次小祭，每十年一次大祭。'
  },
  {
    id: 27,
    category: '公民',
    question: '在民主國家，政黨輪替成為常態。執政黨若在選舉中失敗，將轉變為？',
    options: ['非法組織', '在野黨', '執政黨', '利益團體'],
    correctAnswer: 1,
    explanation: '沒有取得執政權的政黨稱為「在野黨」，主要功能是監督政府。',
    funFact: '這就是民主政治中的「政黨政治」。'
  },
  {
    id: 28,
    category: '地理',
    question: '台灣河川多具有「坡度陡、流速急」的特性，因此哪種資源豐富？',
    options: ['航運資源', '水力資源', '漁業資源', '石油資源'],
    correctAnswer: 1,
    explanation: '地形落差大加上雨量豐沛，使得台灣河川富含水力發電的潛力。',
    funFact: '但也因為流速急，河川並沒有太高的航運價值（船很難開）。'
  },
  {
    id: 29,
    category: '歷史',
    question: '秦始皇統一中國後，推行「書同文，車同軌」，並統一了貨幣與什麼？',
    options: ['服裝', '度量衡', '髮型', '飲食'],
    correctAnswer: 1,
    explanation: '秦始皇統一了度量衡（長度、容量、重量的標準），促進了經濟交流。',
    funFact: '他也修築了萬里長城來防禦北方的匈奴。'
  },
  {
    id: 30,
    category: '公民',
    question: '下列何者屬於「無形」的文化資產？',
    options: ['龍山寺建築', '媽祖遶境活動', '安平古堡', '翠玉白菜'],
    correctAnswer: 1,
    explanation: '媽祖遶境屬於民俗活動，是看不見實體的文化傳承，屬於無形文化資產。其他皆為有形資產。',
    funFact: '傳統的工藝技術、口述傳統也都是無形文化資產喔！'
  },
  {
    id: 31,
    category: '地理',
    question: '「石灰岩地形」又稱為喀斯特地形，主要成因是什麼？',
    options: ['風力侵蝕', '河流堆積', '溶蝕作用', '冰河作用'],
    correctAnswer: 2,
    explanation: '石灰岩容易被含有二氧化碳的雨水或地下水溶解（溶蝕），形成鐘乳石、石筍等地形。',
    funFact: '墾丁的社頂公園就可以看到這種地形。'
  },
  {
    id: 32,
    category: '歷史',
    question: '八田與一在日治時期設計興建了哪一個水利工程，嘉惠了嘉南平原的農民？',
    options: ['桃園大圳', '嘉南大圳', '曹公圳', '瑠公圳'],
    correctAnswer: 1,
    explanation: '嘉南大圳完工後，使嘉南平原成為台灣最大的穀倉。',
    funFact: '為了感念他，烏山頭水庫旁立有八田與一的銅像。'
  },
  {
    id: 33,
    category: '公民',
    question: '當發生車禍糾紛時，如果不想到法院打官司，可以先向鄉鎮市區公所的什麼單位申請？',
    options: ['調解委員會', '戶政事務所', '衛生所', '地政事務所'],
    correctAnswer: 0,
    explanation: '調解委員會負責調解民事糾紛與告訴乃論之刑事糾紛，具有法律效力。',
    funFact: '調解成功就像法院判決一樣有效，省時又省錢。'
  },
  {
    id: 34,
    category: '地理',
    question: '台灣唯一的「內陸縣」，不靠海的縣市是？',
    options: ['嘉義縣', '雲林縣', '南投縣', '苗栗縣'],
    correctAnswer: 2,
    explanation: '南投縣位於台灣中心，四周都被山脈包圍，是唯一沒有海岸線的縣。',
    funFact: '雖然不靠海，但它有美麗的日月潭。'
  },
  {
    id: 35,
    category: '歷史',
    question: '「文藝復興」運動發源於歐洲的哪一個國家？',
    options: ['法國', '英國', '義大利', '德國'],
    correctAnswer: 2,
    explanation: '文藝復興起源於14世紀的義大利佛羅倫斯等地，強調人文主義。',
    funFact: '達文西、米開朗基羅、拉斐爾被稱為「文藝復興三傑」。'
  },
  {
    id: 36,
    category: '公民',
    question: '候選人在選舉前「賄選」（買票），是違反了什麼法律？',
    options: ['憲法', '公職人員選舉罷免法', '民法', '社會秩序維護法'],
    correctAnswer: 1,
    explanation: '《選罷法》嚴格禁止賄選行為，以維護選舉的公平公正。',
    funFact: '檢舉賄選是有高額獎金的喔！'
  },
  {
    id: 37,
    category: '地理',
    question: '下列哪一個國家位於南半球，季節與台灣相反？',
    options: ['日本', '美國', '澳洲', '英國'],
    correctAnswer: 2,
    explanation: '澳洲位於南半球。當台灣是夏天時，澳洲是冬天。',
    funFact: '所以澳洲的聖誕節是在夏天過的，聖誕老公公可能會穿衝浪褲！'
  },
  {
    id: 38,
    category: '歷史',
    question: '台灣歷史上，曾經發生過「牡丹社事件」，導致哪一個國家出兵攻打台灣南部？',
    options: ['法國', '英國', '日本', '美國'],
    correctAnswer: 2,
    explanation: '1874年，日本藉口琉球船民被殺害，出兵攻打排灣族牡丹社，史稱牡丹社事件。',
    funFact: '這件事讓清廷意識到台灣海防的重要性，開始積極治台（沈葆楨來台）。'
  },
  {
    id: 39,
    category: '公民',
    question: '「性別刻板印象」是指？',
    options: ['對性別平等的追求', '對特定性別的固定看法或偏見', '性別之間的生理差異', '法律對性別的保障'],
    correctAnswer: 1,
    explanation: '例如認為「男生要勇敢、女生要溫柔」或「男主外、女主內」，這些都是刻板印象。',
    funFact: '打破性別刻板印象，每個人都能自由發展自己的潛能。'
  },
  {
    id: 40,
    category: '地理',
    question: '中國地形呈現三級階梯狀，地勢特徵是？',
    options: ['東高西低', '西高東低', '南高北低', '北高南低'],
    correctAnswer: 1,
    explanation: '中國地勢西高東低，導致大部分河川向東流入太平洋。',
    funFact: '「一江春水向東流」就是這個地理特徵的寫照。'
  },
  {
    id: 41,
    category: '歷史',
    question: '古埃及文明發源於哪一條河流的流域？',
    options: ['兩河流域', '印度河', '黃河', '尼羅河'],
    correctAnswer: 3,
    explanation: '尼羅河定期的氾濫帶來肥沃土壤，孕育了古埃及文明。',
    funFact: '希臘史學家希羅多德說：「埃及是尼羅河的贈禮。」'
  },
  {
    id: 42,
    category: '公民',
    question: '家庭暴力防治法所規定的「保護令」，應向哪個單位申請？',
    options: ['警察局', '社會局', '法院', '醫院'],
    correctAnswer: 2,
    explanation: '通常由被害人向「法院」聲請，警察局則是可以協助聲請緊急保護令。',
    funFact: '打113保護專線可以獲得協助。'
  },
  {
    id: 43,
    category: '地理',
    question: '台灣最長的河川是？',
    options: ['淡水河', '高屏溪', '濁水溪', '曾文溪'],
    correctAnswer: 2,
    explanation: '濁水溪全長約 186 公里，是台灣最長的河川，流經南投、彰化、雲林。',
    funFact: '濁水溪因為含沙量大，水看起來總是灰灰濁濁的，所以叫濁水溪。'
  },
  {
    id: 44,
    category: '歷史',
    question: '鄭成功驅逐荷蘭人後，將台灣改名為？',
    options: ['台灣府', '東寧', '承天府', '萬年州'],
    correctAnswer: 1,
    explanation: '鄭成功將台灣建立為「東都」，其子鄭經繼位後改稱為「東寧」。不過鄭成功時期主要設「一府二縣」（承天府）。若指全島政權名稱常稱明鄭或東寧王國。題目若問改名為何，通常指東都或東寧。在此選項中，東寧較為合適（代表政權）。',
    funFact: '鄭成功其實只統治了台灣幾個月就過世了。'
  },
  {
    id: 45,
    category: '公民',
    question: '下列哪一種行為最符合「綠色消費」的概念？',
    options: ['購買過度包裝的禮盒', '使用免洗餐具', '自備購物袋', '購買便宜但高污染的產品'],
    correctAnswer: 2,
    explanation: '綠色消費強調購買對環境傷害較少、可回收、低污染的產品，並減少浪費。',
    funFact: '這就是 3R 原則：Reduce（減少使用）、Reuse（重複使用）、Recycle（回收再生）。'
  },
  {
    id: 46,
    category: '地理',
    question: '關於經緯線的敘述，何者正確？',
    options: ['經線指示東西方向', '緯線長度都一樣', '0度經線稱為本初經線', '緯度越高氣溫越高'],
    correctAnswer: 2,
    explanation: '0度經線通過倫敦格林威治天文台，稱為本初經線（子午線）。A經線指南北；B緯線長度不一（赤道最長）；D緯度越高氣溫越低。',
    funFact: '0度緯線就是赤道。'
  },
  {
    id: 47,
    category: '歷史',
    question: '佛教起源於哪一個國家（古國）？',
    options: ['中國', '泰國', '印度', '尼泊爾'],
    correctAnswer: 2,
    explanation: '佛教由釋迦牟尼佛創立於古印度（現今尼泊爾南部與印度邊境）。',
    funFact: '佛教傳入中國後，對中國文化產生了巨大的影響。'
  },
  {
    id: 48,
    category: '公民',
    question: '我國的中央銀行主要負責什麼工作？',
    options: ['借錢給民眾', '發行貨幣與制定貨幣政策', '管理股票市場', '徵收稅金'],
    correctAnswer: 1,
    explanation: '中央銀行是「銀行的銀行」，負責發行新台幣、控制貨幣供給量、維持物價穩定。',
    funFact: '我們口袋裡的鈔票，上面都印著「中央銀行」。'
  },
  {
    id: 49,
    category: '地理',
    question: '哪一個洋流流經台灣東部海域，帶來溫暖的海水，使得台灣氣候較同緯度溫暖？',
    options: ['親潮', '黑潮', '中國沿岸流', '加利福尼亞洋流'],
    correctAnswer: 1,
    explanation: '黑潮是暖流，從赤道向北流經台灣東部，帶來豐富的漁獲與溫暖氣候。',
    funFact: '因為海水顏色較深，看起來像黑色，所以叫黑潮。'
  },
  {
    id: 50,
    category: '歷史',
    question: '著名的「史前巨石陣」位於哪一個國家？',
    options: ['埃及', '英國', '希臘', '墨西哥'],
    correctAnswer: 1,
    explanation: '巨石陣（Stonehenge）位於英國，是史前時代的遺跡，用途至今仍有許多謎團。',
    funFact: '有人猜測它是古代的天文台，也有人說是宗教祭祀場所。'
  },
  {
    id: 51,
    category: '公民',
    question: '在經濟學中，因為資源有限，而人類慾望無窮，這種現象稱為？',
    options: ['通貨膨脹', '稀少性', '外部效果', '供需平衡'],
    correctAnswer: 1,
    explanation: '「稀少性」是經濟學的基本問題，指資源無法滿足所有人的慾望，所以我們必須做選擇。',
    funFact: '就算是有錢人也會面臨稀少性，因為時間也是一種稀缺資源。'
  },
  {
    id: 52,
    category: '歷史',
    question: '二次大戰後，美國與蘇聯兩大強權長期對峙，雖未直接開戰，但進行軍備競賽與外交對抗，稱為？',
    options: ['熱戰', '冷戰', '核戰', '貿易戰'],
    correctAnswer: 1,
    explanation: '冷戰（Cold War）是指美蘇雙方在軍事、政治、經濟上的緊張對立狀態。',
    funFact: '柏林圍牆倒塌常被視為冷戰結束的象徵之一。'
  },
  {
    id: 53,
    category: '地理',
    question: '台灣的時間是以哪一條經線的時間作為標準時間（中原標準時間）？',
    options: ['東經 100 度', '東經 110 度', '東經 120 度', '東經 135 度'],
    correctAnswer: 2,
    explanation: '台灣位於 GMT+8 時區，是以東經 120 度的時間為準。',
    funFact: '北京、香港、新加坡也都使用這個時區的時間喔！'
  },
  {
    id: 54,
    category: '歷史',
    question: '漢武帝時期，派遣誰出使西域，開闢了東西方交流的「絲路」？',
    options: ['張騫', '班超', '鄭和', '玄奘'],
    correctAnswer: 0,
    explanation: '張騫出使西域原本是為了聯絡大月氏夾擊匈奴，卻意外打通了著名的絲路。',
    funFact: '葡萄、核桃、石榴等水果都是透過絲路傳入中國的。'
  },
  {
    id: 55,
    category: '公民',
    question: '依據我國《公民投票法》，年滿幾歲的國民就擁有公民投票權？',
    options: ['16歲', '18歲', '20歲', '23歲'],
    correctAnswer: 1,
    explanation: '目前公投權的年齡門檻已下修為 18 歲（選舉權目前仍為 20 歲）。',
    funFact: '所以高中三年級的學生可能就有機會參與公投囉！'
  },
  {
    id: 56,
    category: '地理',
    question: '下列關於「天氣」與「氣候」的區別，何者正確？',
    options: ['天氣是長期的平均狀態', '氣候是短時間的大氣變化', '「今天好熱」是在講天氣', '「台灣多雨」是在講天氣'],
    correctAnswer: 2,
    explanation: '天氣指短時間（如今天、明天）的大氣狀況；氣候指長時間（如三十年）的平均狀態。',
    funFact: '氣象預報報的是「天氣」，地理課本學的是「氣候」。'
  },
  {
    id: 57,
    category: '歷史',
    question: '日治時期，日本在台灣建立了嚴密的警察制度，警察權力很大，被民間稱為？',
    options: ['大人', '波麗士', '條子', '憲兵'],
    correctAnswer: 0,
    explanation: '當時警察不但管治安，還管衛生、戶口，甚至連小孩哭鬧都會被嚇唬說「大人來了」。',
    funFact: '那時候的派出所會掛著紅燈籠，方便民眾辨識。'
  },
  {
    id: 58,
    category: '公民',
    question: '法律位階最高，具有「根本大法」地位，若其他法律與其牴觸則無效的是？',
    options: ['民法', '刑法', '憲法', '行政命令'],
    correctAnswer: 2,
    explanation: '憲法是國家的根本大法，所有法律命令都不能違背憲法（法律優位原則）。',
    funFact: '修改憲法的門檻非常非常高，因為它是國家穩定的基礎。'
  },
  {
    id: 59,
    category: '地理',
    question: '海水受到月球和太陽引力的影響，產生的水位升降現象稱為？',
    options: ['洋流', '海嘯', '潮汐', '波浪'],
    correctAnswer: 2,
    explanation: '潮汐主要是由月球引力造成的，每天會有兩次漲潮和兩次退潮（半日潮）。',
    funFact: '利用潮汐水位差可以進行「潮汐發電」。'
  },
  {
    id: 60,
    category: '歷史',
    question: '15世紀末，哥倫布向西航行原本是為了到亞洲，結果意外發現了哪裡？',
    options: ['澳洲', '美洲新大陸', '非洲', '南極洲'],
    correctAnswer: 1,
    explanation: '哥倫布誤以為他到了印度，所以稱當地土著為「印第安人」（Indians）。',
    funFact: '其實維京人比哥倫布早幾百年就到過美洲了，只是沒有廣為人知。'
  },
  {
    id: 61,
    category: '公民',
    question: '下列何者屬於「民事責任」的範疇？',
    options: ['搶劫銀行的罪刑', '闖紅燈被罰款', '欠錢不還的債務糾紛', '逃漏稅被補稅'],
    correctAnswer: 2,
    explanation: '欠錢不還是私人之間的財產糾紛，屬於民事責任。A是刑事，B和D是行政責任。',
    funFact: '「借錢還錢，天經地義」就是民法債權的概念。'
  },
  {
    id: 62,
    category: '地理',
    question: '在地圖上，用來表示地圖內容意義的符號說明，稱為？',
    options: ['比例尺', '圖例', '方位', '等高線'],
    correctAnswer: 1,
    explanation: '圖例（Legend）就像地圖的說明書，告訴你這張圖上的符號代表什麼（如：藍色線代表河流）。',
    funFact: '沒有圖例的地圖就像沒有說明書的樂高，很難看懂。'
  },
  {
    id: 63,
    category: '歷史',
    question: '民國47年（1958年），共軍對金門發動猛烈砲擊，持續了44天，史稱？',
    options: ['古寧頭戰役', '八二三砲戰', '登步島戰役', '一江山戰役'],
    correctAnswer: 1,
    explanation: '八二三砲戰確立了兩岸分治的局面，也展現了國軍防衛金馬的決心。',
    funFact: '金門著名的「菜刀」，就是利用當年這些砲彈殼以此廢鋼製成的。'
  },
  {
    id: 64,
    category: '公民',
    question: '提出「三權分立」（行政、立法、司法）學說，主張權力制衡的學者是？',
    options: ['洛克', '孟德斯鳩', '盧梭', '霍布斯'],
    correctAnswer: 1,
    explanation: '法國思想家孟德斯鳩在《法意》一書中提出三權分立，避免政府權力過大。',
    funFact: '孫中山先生後來改良為「五權憲法」（加上考試、監察）。'
  },
  {
    id: 65,
    category: '地理',
    question: '下列哪一種能源屬於「不可再生能源」，用完就沒了？',
    options: ['太陽能', '風力', '石油', '地熱'],
    correctAnswer: 2,
    explanation: '煤、石油、天然氣等化石燃料，形成需要千萬年，屬於不可再生能源。',
    funFact: '所以我們才要積極發展綠色能源（再生能源）。'
  },
  {
    id: 66,
    category: '歷史',
    question: '清朝末年，林則徐在哪裡銷毀鴉片，展現禁菸決心，卻也引發了鴉片戰爭？',
    options: ['北京', '虎門', '上海', '南京'],
    correctAnswer: 1,
    explanation: '林則徐在廣東虎門銷菸，英國以此為藉口發動鴉片戰爭。',
    funFact: '現在每年的6月3日是台灣的「禁菸節」，就是紀念這件事。'
  },
  {
    id: 67,
    category: '公民',
    question: '在選舉時，選民將票投給候選人，這體現了民主政治的什麼原則？',
    options: ['主權在民', '權力分立', '法治政治', '責任政治'],
    correctAnswer: 0,
    explanation: '人民是國家的主人，透過選舉展現意志，即為主權在民（人民主權）。',
    funFact: '投票是公民最直接參與政治的方式。'
  },
  {
    id: 68,
    category: '地理',
    question: '台灣第一座成立的國家公園是？',
    options: ['玉山國家公園', '陽明山國家公園', '墾丁國家公園', '太魯閣國家公園'],
    correctAnswer: 2,
    explanation: '墾丁國家公園成立於 1984 年，是台灣第一座國家公園，位於恆春半島。',
    funFact: '墾丁既有陸域也有海域，是熱帶度假勝地。'
  },
  {
    id: 69,
    category: '歷史',
    question: '唐朝國力最強盛，文化最繁榮的時期，史稱？',
    options: ['文景之治', '貞觀之治', '開元之治', '康雍乾盛世'],
    correctAnswer: 2,
    explanation: '「開元之治」是唐玄宗前期的統治，是唐朝的鼎盛時期。',
    funFact: '可惜後來發生了「安史之亂」，唐朝就開始衰落了。'
  },
  {
    id: 70,
    category: '公民',
    question: '下列何者是「智慧財產權」保障的範圍？',
    options: ['你買的房子', '你發明的機器專利', '你存的錢', '你的車子'],
    correctAnswer: 1,
    explanation: '智慧財產權保障人類精神活動的成果，如著作權、專利權、商標權。',
    funFact: '盜版軟體、非法下載電影都是侵犯智慧財產權的行為。'
  },
  {
    id: 71,
    category: '地理',
    question: '溫室效應加劇造成全球暖化，主要的溫室氣體是？',
    options: ['氧氣', '氮氣', '二氧化碳', '氫氣'],
    correctAnswer: 2,
    explanation: '燃燒化石燃料排放大量二氧化碳，像毯子一樣困住地球熱量，導致暖化。',
    funFact: '其實水蒸氣也是溫室氣體，但二氧化碳是人類活動主要增加的。'
  },
  {
    id: 72,
    category: '歷史',
    question: '提出「各盡所能，各取所需」理想，被視為共產主義創始人的是？',
    options: ['列寧', '馬克思', '史達林', '拿破崙'],
    correctAnswer: 1,
    explanation: '馬克思與恩格斯發表《共產黨宣言》，影響了後來蘇聯與中國的發展。',
    funFact: '馬克思其實是德國人。'
  },
  {
    id: 73,
    category: '公民',
    question: '我國的「所得稅」是採取什麼樣的稅率制度，以符合公平原則？',
    options: ['單一稅率', '累進稅率', '累退稅率', '定額稅率'],
    correctAnswer: 1,
    explanation: '賺越多錢的人繳稅比例越高（稅率越高），稱為累進稅率，能縮小貧富差距。',
    funFact: '這就是所謂的「量能課稅」。'
  },
  {
    id: 74,
    category: '地理',
    question: '「都市化」是指人口向都市集中的過程，通常會導致鄉村發生什麼現象？',
    options: ['人口老化', '房價上漲', '交通擁擠', '就業機會增加'],
    correctAnswer: 0,
    explanation: '年輕壯年人口移往都市工作，導致鄉村只剩下老人，造成人口老化與勞動力不足。',
    funFact: '這在地理學上稱為「推拉理論」。'
  },
  {
    id: 75,
    category: '歷史',
    question: '法國大革命提出的口號是？',
    options: ['民族、民權、民生', '自由、平等、博愛', '和平、土地、麵包', '富國強兵'],
    correctAnswer: 1,
    explanation: '1789年法國大革命攻佔巴士底獄，提出「自由、平等、博愛」的普世價值。',
    funFact: '法國國旗的藍白紅三色就代表這三種精神。'
  },
  {
    id: 76,
    category: '公民',
    question: '媒體若未經查證就報導假新聞，可能觸犯法律並需負起什麼責任？',
    options: ['道義責任', '法律責任', '政治責任', '歷史責任'],
    correctAnswer: 1,
    explanation: '散布假訊息造成他人損害或社會恐慌，需負起民事賠償或行政、刑事上的法律責任。',
    funFact: '所以我們要有「媒體識讀」的能力，不要輕信網路謠言。'
  },
  {
    id: 77,
    category: '地理',
    question: '環繞太平洋周圍，火山與地震活動頻繁的區域稱為？',
    options: ['火環帶 (Ring of Fire)', '百慕達三角', '赤道無風帶', '板塊張裂帶'],
    correctAnswer: 0,
    explanation: '環太平洋火山帶（火環）集中了全球大部分的地震與火山活動，台灣也位於此。',
    funFact: '這也是為什麼日本、台灣、菲律賓、智利都常有地震。'
  },
  {
    id: 78,
    category: '歷史',
    question: '台灣最早的文字歷史，是由誰開始記錄的？',
    options: ['原住民', '荷蘭人', '漢人', '日本人'],
    correctAnswer: 1,
    explanation: '在荷蘭人來台之前，台灣原住民屬於史前時代（無文字），荷蘭人帶來了文字紀錄。',
    funFact: '荷蘭人還創立了「新港文」教原住民拼寫自己的語言。'
  },
  {
    id: 79,
    category: '公民',
    question: '關於「全球化」，下列敘述何者正確？',
    options: ['各國經濟依賴度降低', '文化交流更頻繁', '只有好處沒有壞處', '每個國家都變得很富有'],
    correctAnswer: 1,
    explanation: '全球化讓商品、資訊、文化跨國流動更快速頻繁。',
    funFact: '你在台灣吃麥當勞、看好萊塢電影，就是全球化的生活實例。'
  },
  {
    id: 80,
    category: '地理',
    question: '在等高線地形圖上，若等高線排列非常密集，代表該地？',
    options: ['地勢平坦', '坡度陡峭', '是山頂', '是河流'],
    correctAnswer: 1,
    explanation: '等高線越密集，代表在短距離內高度變化很大，即坡度陡峭（如懸崖）。',
    funFact: '若等高線重疊在一起，那就是「斷崖」。'
  },
  {
    id: 81,
    category: '歷史',
    question: '施琅攻下台灣後，康熙皇帝原本想放棄台灣，後來是誰極力主張保留台灣？',
    options: ['鄭成功', '施琅', '劉銘傳', '沈葆楨'],
    correctAnswer: 1,
    explanation: '施琅上《恭陳臺灣棄留疏》，強調台灣戰略地位重要，才說服康熙將台灣納入版圖。',
    funFact: '如果當時放棄了，台灣歷史可能就會完全不同了。'
  },
  {
    id: 82,
    category: '公民',
    question: '下列何者是地方政府（如台北市政府）的主要職責？',
    options: ['國防外交', '發行貨幣', '垃圾清運與市容整潔', '修改憲法'],
    correctAnswer: 2,
    explanation: '垃圾處理、公園維護、地方教育等屬於地方自治事項。A、B、D 是中央政府的職權。',
    funFact: '我們選出的市長就是要負責把這些事做好。'
  },
  {
    id: 83,
    category: '地理',
    question: '哪一條緯線將地球分為南半球與北半球？',
    options: ['赤道', '本初經線', '北回歸線', '國際換日線'],
    correctAnswer: 0,
    explanation: '赤道（緯度 0 度）是最大的緯線圈，將地球分為南北兩半。',
    funFact: '赤道經過的國家通常都很熱。'
  },
  {
    id: 84,
    category: '歷史',
    question: '發明活字印刷術，讓書籍變便宜，促進知識傳播的宋代平民是？',
    options: ['畢昇', '蔡倫', '沈括', '張衡'],
    correctAnswer: 0,
    explanation: '畢昇發明膠泥活字印刷，比西方的古騰堡早了四百多年。',
    funFact: '蔡倫是改良造紙術（東漢）。'
  },
  {
    id: 85,
    category: '公民',
    question: '當社會發生衝突時，雖然可以透過訴訟解決，但成本較高。下列何者是訴訟外的解決途徑？',
    options: ['私下決鬥', '找幫派談判', '調解與和解', '網路公審'],
    correctAnswer: 2,
    explanation: '調解、和解與仲裁是法律認可的訴訟外紛爭解決機制（ADR）。',
    funFact: '「以此為鑑，下不為例」的和解有時候比打官司更有溫度。'
  },
  {
    id: 86,
    category: '地理',
    question: '哪一種地形位於河口，由河流攜帶的泥沙堆積而成，形狀像三角形？',
    options: ['沖積扇', '三角洲', '氾濫平原', '台地'],
    correctAnswer: 1,
    explanation: '河流入海時流速減慢，泥沙堆積形成三角洲（如尼羅河三角洲）。',
    funFact: '沖積扇通常是在河流出山谷口形成的。'
  },
  {
    id: 87,
    category: '歷史',
    question: '台灣在哪一個時期開始實施「九年國民義務教育」？',
    options: ['日治時期', '民國57年 (1968)', '民國38年', '民國90年'],
    correctAnswer: 1,
    explanation: '政府為提升國民素質，將義務教育由六年延長為九年（國小+國中）。',
    funFact: '現在已經推動「十二年國教」囉！'
  },
  {
    id: 88,
    category: '公民',
    question: '下列哪一項是限制政府權力、保障人民權利的最高指導原則？',
    options: ['依法行政', '以德服人', '多數決', '效率優先'],
    correctAnswer: 0,
    explanation: '法治國家要求政府的一切行為都必須有法律依據，即「依法行政」。',
    funFact: '政府如果不依法行政，人民可以提起行政訴訟告政府。'
  },
  {
    id: 89,
    category: '地理',
    question: '台灣人口結構面臨嚴重的什麼問題，導致勞動力短缺與扶養負擔加重？',
    options: ['嬰兒潮', '少子化與高齡化', '性別比例失衡', '人口過多'],
    correctAnswer: 1,
    explanation: '生育率下降（少子化）加上壽命延長（高齡化），使台灣邁入超高齡社會。',
    funFact: '未來的年輕人每個人要照顧的老人會越來越多。'
  },
  {
    id: 90,
    category: '歷史',
    question: '著名的「宗教改革」是由誰發起的，他反對贖罪券，主張回歸聖經？',
    options: ['馬丁路德', '喀爾文', '羅耀拉', '亨利八世'],
    correctAnswer: 0,
    explanation: '馬丁路德張貼《九十五條論綱》，引發了基督教的宗教改革運動，產生了新教。',
    funFact: '新教（Protestant）就是抗議宗的意思。'
  },
  {
    id: 91,
    category: '公民',
    question: '商品包裝上常見的「綠色標章」、「省水標章」主要是為了？',
    options: ['提高價格', '美觀好看', '引導消費者進行綠色消費', '防止仿冒'],
    correctAnswer: 2,
    explanation: '這些標章幫助消費者辨識環保產品，鼓勵對環境友善的消費行為。',
    funFact: '買冷氣要看「能源效率標示」，級數越低越省電（1級最省）。'
  },
  {
    id: 92,
    category: '地理',
    question: '下列哪個國家有「千島之國」的美稱，且位於東南亞？',
    options: ['菲律賓', '印尼', '日本', '馬來西亞'],
    correctAnswer: 1,
    explanation: '印尼由一萬七千多個島嶼組成，是世界上最大的群島國家。',
    funFact: '著名的峇里島就在印尼。'
  },
  {
    id: 93,
    category: '歷史',
    question: '19世紀末，義和團打著什麼口號，攻擊外國人與教堂，引發八國聯軍？',
    options: ['反清復明', '扶清滅洋', '驅除韃虜', '尊王攘夷'],
    correctAnswer: 1,
    explanation: '義和團主張扶持清朝，消滅洋人，結果導致清廷向各國宣戰並慘敗。',
    funFact: '結果簽訂了賠款最多的《辛丑和約》。'
  },
  {
    id: 94,
    category: '公民',
    question: '現代社會強調「多元文化」，我們面對不同族群的文化應抱持什麼態度？',
    options: ['排斥歧視', '同化融合', '尊重與包容', '視而不見'],
    correctAnswer: 2,
    explanation: '尊重差異、包容不同，是多元文化社會相處的基本原則。',
    funFact: '台灣有原住民、漢人、新住民等多元文化，非常豐富精彩。'
  },
  {
    id: 95,
    category: '地理',
    question: '地球自轉的方向是？',
    options: ['由東向西', '由西向東', '由南向北', '由北向南'],
    correctAnswer: 1,
    explanation: '地球由西向東自轉，所以我們看到太陽和星星都是東升西落。',
    funFact: '如果你跑得比地球自轉快，理論上你可以一直看到夕陽（超人？）。'
  },
  {
    id: 96,
    category: '歷史',
    question: '古希臘哪一個城邦以「民主政治」聞名，成年男性公民可直接參與公民大會？',
    options: ['斯巴達', '雅典', '特洛伊', '馬其頓'],
    correctAnswer: 1,
    explanation: '雅典是西方民主政治的發源地，實施直接民主。',
    funFact: '斯巴達則是以嚴格的軍事教育聞名。'
  },
  {
    id: 97,
    category: '公民',
    question: '下列何者是「公共財」的特性？（如國防、路燈）',
    options: ['獨享性', '排他性', '無法排他且共享', '昂貴性'],
    correctAnswer: 2,
    explanation: '公共財具有「共享性」（大家都能用）與「無法排他性」（很難禁止別人用），通常由政府提供。',
    funFact: '你走在路燈下，不會讓別人少照一點光，這就是共享。'
  },
  {
    id: 98,
    category: '地理',
    question: '珊瑚礁生態系非常珍貴，適合生長在什麼樣的海域？',
    options: ['寒冷深海', '溫暖清澈的淺海', '混濁的河口', '極地海洋'],
    correctAnswer: 1,
    explanation: '造礁珊瑚需要陽光行光合作用（共生藻），且喜歡溫暖（約23-28度）潔淨的水域。',
    funFact: '台灣的墾丁、綠島都有美麗的珊瑚礁。'
  },
  {
    id: 99,
    category: '歷史',
    question: '台灣曾經流傳一句諺語「有唐山公，無唐山媽」，反映了早期漢人移民的什麼現象？',
    options: ['移民皆為女性', '男女比例平均', '男多女少，多娶原住民女性為妻', '禁止通婚'],
    correctAnswer: 2,
    explanation: '清初實施渡台禁令，禁止攜帶家眷，導致來台漢人男性多，多與平埔族女性通婚。',
    funFact: '所以很多台灣漢人其實都有平埔族的血統。'
  },
  {
    id: 100,
    category: '公民',
    question: '在網路上辱罵他人，即使是用假帳號，也可能觸犯刑法的什麼罪？',
    options: ['竊盜罪', '公然侮辱罪', '殺人罪', '詐欺罪'],
    correctAnswer: 1,
    explanation: '在公開場所（包含網路論壇）謾罵他人，貶損其人格評價，構成公然侮辱。',
    funFact: '網路凡走過必留下痕跡，IP位址都查得到的，請謹言慎行喔！'
  }


]

// 獲取所有分類
export function getAllCategories() {
  return Object.values(CATEGORIES)
}

// 根據分類獲取題目
export function getQuestionsByCategory(category) {
  return QUESTIONS.filter(q => q.category === category)
}

// 獲取隨機題目
export function getRandomQuestions(count, history = {}) {
  const availableQuestions = [...QUESTIONS]
  
  // 如果有歷史記錄，優先選擇錯題
  if (history && Object.keys(history).length > 0) {
    availableQuestions.sort((a, b) => {
      const aRecord = history[a.id]
      const bRecord = history[b.id]
      const aWeight = aRecord ? (aRecord.wrong > 0 ? 0.8 : 0.2) : 1.0
      const bWeight = bRecord ? (bRecord.wrong > 0 ? 0.8 : 0.2) : 1.0
      return bWeight - aWeight
    })
  }
  
  // 隨機打亂
  const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

// 只獲取選擇題（4選項）
export function getMultipleChoiceOnly(questions) {
  return questions.filter(q => 
    q.options && 
    Array.isArray(q.options) &&
    q.options.length === 4 &&
    typeof q.correctAnswer === 'number'
  )
}

