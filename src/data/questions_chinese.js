// 國小三年級國語題目數據庫
// 您可以在此文件中添加、修改或刪除題目

export const CATEGORIES = {
  VOCABULARY: '字詞',
  READING: '閱讀理解',
  GRAMMAR: '語法',
  PHONETICS: '字音字形',
  IDIOMS: '成語運用',
  RHETORIC: '修辭',
  PUNCTUATION: '標點符號',
  CLASSICS: '國學常識'
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
    category: '字詞',
    question: '「未雨綢繆」的意思是什麼？',
    options: ['事前做好準備', '天氣變化無常', '形容雨下得很大', '兩人感情很好'],
    correctAnswer: 0,
    explanation: '「未雨綢繆」比喻在天還沒下雨前，就先修補好門窗。引申為事前做好準備工作。',
    funFact: '綢繆（ㄔㄡˊ ㄇㄡˊ）原意是緊密纏縛，引申為修補。'
  },
  {
    id: 2,
    category: '字音字形',
    question: '下列哪一個詞語的「中」字讀音為第四聲（ㄓㄨㄥˋ）？',
    options: ['百發百中', '中間', '人中', '中庸之道'],
    correctAnswer: 0,
    explanation: '「中」讀第一聲時通常指方位或過程；讀第四聲時表「符合」或「射到目標」。百發百中意指每次都射中目標。',
    funFact: '「中肯」的「中」也是讀第四聲喔！'
  },
  {
    id: 3,
    category: '成語運用',
    question: '形容一個人「閱歷豐富，處世練達」，可以使用哪個成語？',
    options: ['飽食終日', '飽經風霜', '老謀深算', '囫圇吞棗'],
    correctAnswer: 1,
    explanation: '「飽經風霜」形容經歷過許多艱難困苦，引申為閱歷豐富。C選項「老謀深算」通常帶有貶義，指心機深。',
    funFact: '「飽」在這裡是「充分」的意思，不是肚子飽喔！'
  },
  {
    id: 4,
    category: '修辭',
    question: '「那雙眼睛像星星一樣閃閃發光。」這句話使用了哪種修辭技巧？',
    options: ['擬人', '譬喻 (明喻)', '誇飾', '借代'],
    correctAnswer: 1,
    explanation: '使用了「像...一樣」將眼睛比喻為星星，屬於譬喻中的「明喻」。',
    funFact: '明喻的關鍵詞通常有：像、如、似、若。'
  },
  {
    id: 5,
    category: '國學常識',
    question: '唐代詩人李白被後世尊稱為？',
    options: ['詩聖', '詩仙', '詩佛', '詩鬼'],
    correctAnswer: 1,
    explanation: '李白詩風豪放飄逸，想像豐富，故被稱為「詩仙」。',
    funFact: '詩聖是杜甫，詩佛是王維，詩鬼是李賀。'
  },
  {
    id: 6,
    category: '字詞',
    question: '「膾炙人口」中的「炙」原本的意思是？',
    options: ['煮湯', '烤肉', '切細的肉', '美酒'],
    correctAnswer: 1,
    explanation: '「炙」是用火烤肉，「膾」是切細的肉。兩者都很美味，引申為美好的詩文人人愛讀。',
    funFact: '成語「殘羹冷炙」就是指剩下的菜和冷掉的烤肉，形容景況淒涼。'
  },
  {
    id: 7,
    category: '字音字形',
    question: '下列成語中，哪一個沒有錯別字？',
    options: ['默守成規', '迫不及待', '再接再勵', '煥然一新'],
    correctAnswer: 3,
    explanation: 'A應為「墨」守成規；B應為迫不「及」待；C應為再接再「厲」。D是正確的。',
    funFact: '「墨守」是指戰國時期的墨子善於守城，後來才引申為固守舊規。'
  },
  {
    id: 8,
    category: '閱讀理解',
    question: '「三人行，必有我師焉。」這句話主要在勉勵我們？',
    options: ['要找三個人一起走路', '隨時隨地向人學習', '老師就在隊伍裡', '要慎選朋友'],
    correctAnswer: 1,
    explanation: '這句話出自《論語》，意思是幾個人在一起，其中一定有值得我學習的人（優點學習，缺點警惕）。',
    funFact: '孔子非常強調「謙虛」與「向他人學習」的重要性。'
  },
  {
    id: 9,
    category: '修辭',
    question: '「白髮三千丈，緣愁似個長」使用了哪種修辭？',
    options: ['映襯', '轉化', '誇飾', '設問'],
    correctAnswer: 2,
    explanation: '頭髮不可能真的有三千丈長，這是利用「誇飾」來強調愁緒的深長。',
    funFact: '這是李白的詩句，他真的很愛用誇飾法！'
  },
  {
    id: 10,
    category: '成語運用',
    question: '下列哪個成語用來形容「做事非常小心謹慎」？',
    options: ['如履薄冰', '膽大包天', '馬馬虎虎', '袖手旁觀'],
    correctAnswer: 0,
    explanation: '「如履薄冰」像走在薄冰上一樣，形容非常戒懼謹慎。',
    funFact: '這個成語出自《詩經》，原文是「戰戰兢兢，如臨深淵，如履薄冰」。'
  },
  {
    id: 11,
    category: '字詞',
    question: '「司空見慣」的意思是？',
    options: ['看得很習慣，不覺得奇怪', '看得很驚訝', '這是一種特殊的官位', '形容東西很少見'],
    correctAnswer: 0,
    explanation: '「司空」是古代官名，「見慣」指看習慣了。形容某事常見，不足為奇。',
    funFact: '這個成語來自唐代詩人劉禹錫，他在司空李紳家作客時寫下的詩句。'
  },
  {
    id: 12,
    category: '字音字形',
    question: '「強」人所難的「強」字讀音為？',
    options: ['ㄑㄧㄤˊ (qiáng)', 'ㄑㄧㄤˇ (qiǎng)', 'ㄐㄧㄤˋ (jiàng)', 'ㄓㄨㄤˋ (zhuàng)'],
    correctAnswer: 1,
    explanation: '在此處指「勉強」，故讀作三聲 ㄑㄧㄤˇ。',
    funFact: '倔「強」才讀作 ㄐㄧㄤˋ。'
  },
  {
    id: 13,
    category: '標點符號',
    question: '當一句話語意未完，或者表示聲音斷斷續續時，應使用？',
    options: ['句號 (。)', '驚嘆號 (!)', '刪節號 (……)', '分號 (；)'],
    correctAnswer: 2,
    explanation: '刪節號（六點）用於省略原文或語氣未完、聲音斷續。',
    funFact: '書寫時佔兩格，共六點，不可寫成三點喔！'
  },
  {
    id: 14,
    category: '國學常識',
    question: '中國古代神話中，是誰「補天」救了人類？',
    options: ['盤古', '夸父', '女媧', '后羿'],
    correctAnswer: 2,
    explanation: '傳說共工撞倒不周山導致天破了洞，女媧煉五色石補天。',
    funFact: '盤古是開天闢地，后羿是射日。'
  },
  {
    id: 15,
    category: '字詞',
    question: '信封上的啟封詞，若收信人是長輩，應使用？',
    options: ['敬啟', '大啟', '鈞啟', '收'],
    correctAnswer: 2,
    explanation: '對長輩或上司應使用「鈞啟」以示尊敬；「大啟」用於平輩；「啟」或「收」用於晚輩。切勿用「敬啟」（那是叫對方恭敬地打開）。',
    funFact: '「敬啟」是書信中最常見的錯誤之一！'
  },
  {
    id: 16,
    category: '成語運用',
    question: '「東施效顰」比喻？',
    options: ['盲目模仿，結果適得其反', '比喻美女非常多', '形容化妝技術很好', '學習別人的優點'],
    correctAnswer: 0,
    explanation: '醜女東施模仿美女西施捧心皺眉的樣子，結果反而更醜。比喻盲目胡亂模仿，效果更糟。',
    funFact: '「顰」的意思就是皺眉頭。'
  },
  {
    id: 17,
    category: '修辭',
    question: '「感時花濺淚，恨別鳥驚心」將人的情感投射到花鳥身上，這是？',
    options: ['設問', '轉化 (擬人)', '引用', '排比'],
    correctAnswer: 1,
    explanation: '將花鳥寫得有人的情感（流淚、驚心），屬於轉化修辭中的擬人化。',
    funFact: '這是杜甫《春望》中的名句。'
  },
  {
    id: 18,
    category: '字音字形',
    question: '下列詞語中，「一」字讀音為二聲（ㄧˊ）的是？',
    options: ['一模一樣', '一心一意', '一干二淨', '一定'],
    correctAnswer: 3,
    explanation: '「一」在去聲（四聲）字前變調為二聲。「定」是四聲，故讀ㄧˊ定。A一(ㄧˋ)模；B一(ㄧˋ)心；C一(ㄧˋ)干。',
    funFact: '這是中文特有的變調規則，為了讓發音更順暢。'
  },
  {
    id: 19,
    category: '國學常識',
    question: '「歲寒三友」是指哪三種植物？',
    options: ['梅、蘭、竹', '松、竹、梅', '梅、蘭、菊', '松、柏、槐'],
    correctAnswer: 1,
    explanation: '松、竹經冬不凋，梅花耐寒開放，象徵堅貞氣節。',
    funFact: '蘭花和菊花屬於「四君子」（梅蘭竹菊）。'
  },
  {
    id: 20,
    category: '語法',
    question: '「雖然...但是...」是用來連接什麼關係的複句？',
    options: ['因果關係', '轉折關係', '並列關係', '遞進關係'],
    correctAnswer: 1,
    explanation: '前句與後句語意相反或相對，稱為轉折關係。',
    funFact: '英文中的 Although... but... 是錯誤語法，但中文可以說「雖然...但是...」。'
  },
  {
    id: 21,
    category: '成語運用',
    question: '「罄竹難書」通常用來形容？',
    options: ['竹子很多', '功勞很大', '學問很高', '罪惡極多'],
    correctAnswer: 3,
    explanation: '原指用盡所有的竹簡也寫不完，後專指罪狀之多，寫都寫不完。',
    funFact: '這個成語是用來罵人的，千萬別用來稱讚別人著作等身喔！'
  },
  {
    id: 22,
    category: '字詞',
    question: '量詞填空：一□新月。',
    options: ['條', '彎', '張', '個'],
    correctAnswer: 1,
    explanation: '形容月亮彎曲的形狀，習慣使用量詞「彎」。',
    funFact: '若是滿月，則可以用「一輪」明月。'
  },
  {
    id: 23,
    category: '閱讀理解',
    question: '「欲窮千里目，更上一層樓」勉勵我們？',
    options: ['要蓋很高的樓', '視力要好', '積極進取，精益求精', '要注意安全'],
    correctAnswer: 2,
    explanation: '想要看得更遠，就要站得更高。比喻想要取得更大的成就，必須更加努力。',
    funFact: '這是王之渙《登鸛雀樓》的詩句。'
  },
  {
    id: 24,
    category: '字詞',
    question: '「令尊」是對對方誰的尊稱？',
    options: ['母親', '父親', '兒子', '老師'],
    correctAnswer: 1,
    explanation: '稱對方的父親為「令尊」，稱自己的父親為「家父」。',
    funFact: '對方的母親則是「令堂」。'
  },
  {
    id: 25,
    category: '修辭',
    question: '「這間教室安靜得連根針掉在地上都聽得見。」使用了什麼修辭？',
    options: ['誇飾', '譬喻', '擬人', '排比'],
    correctAnswer: 0,
    explanation: '極力形容安靜的程度，屬於誇飾。',
    funFact: '誇飾可以讓文字更有張力，但要用得恰當。'
  },
  {
    id: 26,
    category: '國學常識',
    question: '端午節吃粽子、划龍舟是為了紀念誰？',
    options: ['孔子', '老子', '屈原', '李白'],
    correctAnswer: 2,
    explanation: '戰國時期愛國詩人屈原投汨羅江自盡，百姓為了防止魚蝦咬食他的身體，故投粽子、划船驅趕魚群。',
    funFact: '其實在屈原之前，端午節原本是夏季驅除瘟疫的節日。'
  },
  {
    id: 27,
    category: '字音字形',
    question: '「鍥而不捨」的「鍥」讀音為？',
    options: ['ㄑㄧˋ (qì)', 'ㄑㄧㄝˋ (qiè)', 'ㄎㄞ (kāi)', 'ㄑㄧㄢ (qiān)'],
    correctAnswer: 1,
    explanation: '讀作 ㄑㄧㄝˋ。意思是雕刻。比喻堅持到底，不半途而廢。',
    funFact: '「鍥」是用刀刻的意思。'
  },
  {
    id: 28,
    category: '成語運用',
    question: '下列何者與「學習」無關？',
    options: ['韋編三絕', '懸梁刺股', '鑿壁偷光', '杞人憂天'],
    correctAnswer: 3,
    explanation: 'A、B、C 都是形容勤奮讀書的故事。「杞人憂天」比喻缺乏根據且不必要的憂慮。',
    funFact: '「鑿壁偷光」的主角是匡衡，他家裡窮買不起燈油，只好挖破牆壁借鄰居的光讀書。'
  },
  {
    id: 29,
    category: '字詞',
    question: '「忐忑不安」中的「忐忑」意思是？',
    options: ['心情平靜', '心神不寧，情緒起伏', '非常生氣', '非常開心'],
    correctAnswer: 1,
    explanation: '形容心緒起伏不定的樣子。',
    funFact: '這兩個字很形象，「上心」與「下心」，心七上八下的。'
  },
  {
    id: 30,
    category: '標點符號',
    question: '「這本書真是太有趣了」句尾應加上什麼標點符號表達強烈情感？',
    options: ['句號', '逗號', '驚嘆號', '問號'],
    correctAnswer: 2,
    explanation: '表示驚訝、讚嘆等強烈語氣時，使用驚嘆號。',
    funFact: '驚嘆號又叫感嘆號。'
  },
  {
    id: 31,
    category: '國學常識',
    question: '《西遊記》中的孫悟空是從哪裡出來的？',
    options: ['桃子裡', '石頭裡', '海裡', '土裡'],
    correctAnswer: 1,
    explanation: '孫悟空是受天地靈氣孕育的仙石崩裂後產生的石猴。',
    funFact: '他出生的石頭位於花果山。'
  },
  {
    id: 32,
    category: '修辭',
    question: '「要怎麼收穫，先怎麼栽。」這句話使用了哪種修辭中的對仗或對稱概念？',
    options: ['回文', '映襯', '頂真', '類疊'],
    correctAnswer: 1,
    explanation: '收穫對應栽，利用相反或相對的觀念對照，屬於映襯。',
    funFact: '這也是胡適的名言。'
  },
  {
    id: 33,
    category: '字詞',
    question: '「家徒四壁」形容一個人？',
    options: ['房子很大', '家裡只有四面牆，非常貧窮', '家裡裝潢很簡單', '喜歡極簡風'],
    correctAnswer: 1,
    explanation: '家裡空蕩蕩的，只剩下四周的牆壁。形容極為貧窮。',
    funFact: '「徒」是「只有」的意思。'
  },
  {
    id: 34,
    category: '字音字形',
    question: '「一哄而散」的「哄」讀音為？',
    options: ['ㄏㄨㄥ (hōng)', 'ㄏㄨㄥˇ (hǒng)', 'ㄏㄨㄥˋ (hòng)', 'ㄍㄨㄥ (gōng)'],
    correctAnswer: 2,
    explanation: '讀四聲 ㄏㄨㄥˋ，指吵鬧喧嘩。',
    funFact: '哄（ㄏㄨㄥˇ）小孩才是讀三聲。'
  },
  {
    id: 35,
    category: '成語運用',
    question: '「杯弓蛇影」比喻？',
    options: ['真心換絕情', '疑神疑鬼，自己嚇自己', '喝酒誤事', '箭術高超'],
    correctAnswer: 1,
    explanation: '將酒杯裡弓的倒影誤認為蛇，因此嚇出病來。比喻因無中生有的疑慮而自相驚擾。',
    funFact: '事情弄清楚後，病自然就好了，這就是「心病還需心藥醫」。'
  },
  {
    id: 36,
    category: '語法',
    question: '「爸爸在看報紙。」句中的「在」詞性是？',
    options: ['名詞', '動詞', '副詞', '介系詞'],
    correctAnswer: 2,
    explanation: '這裡的「在」表示動作正在進行的狀態，作為副詞使用（時間副詞）。',
    funFact: '如果說「爸爸在家裡」，這個「在」就是動詞了。'
  },
  {
    id: 37,
    category: '字詞',
    question: '「不速之客」的意思是？',
    options: ['走路很慢的客人', '不受歡迎的客人', '沒有邀請而自己來的客人', '跑很快的客人'],
    correctAnswer: 2,
    explanation: '「速」是邀請的意思。「不速之客」指沒有經過邀請而突然到來的客人。',
    funFact: '雖然是不請自來，但不一定是不受歡迎喔，有時候會有驚喜！'
  },
  {
    id: 38,
    category: '國學常識',
    question: '中國書法字體中，最規矩端正，適合初學者練習的是？',
    options: ['草書', '行書', '楷書', '篆書'],
    correctAnswer: 2,
    explanation: '楷書筆畫端正平直，結構嚴謹，是書法練習的基礎。',
    funFact: '「楷」就是楷模、模範的意思。'
  },
  {
    id: 39,
    category: '成語運用',
    question: '「掩耳盜鈴」的意思是？',
    options: ['聽力不好', '自欺欺人', '偷東西很安靜', '形容鈴聲很小'],
    correctAnswer: 1,
    explanation: '摀住自己的耳朵去偷鈴鐺，以為自己聽不到，別人也聽不到。比喻自欺欺人。',
    funFact: '這是一個非常經典的寓言故事。'
  },
  {
    id: 40,
    category: '字詞',
    question: '下列何者是「謙詞」（用來謙虛稱呼自己）？',
    options: ['高見', '寒舍', '貴庚', '府上'],
    correctAnswer: 1,
    explanation: '「寒舍」是謙稱自己的家簡陋。其他三者皆為對別人的敬詞。',
    funFact: '「蓬蓽生輝」也是形容貴客來訪，讓自己簡陋的家（蓬蓽）增添光彩的謙詞。'
  },
  {
    id: 41,
    category: '修辭',
    question: '「歸來見天子，天子坐明堂。」使用了哪種修辭技巧？',
    options: ['頂真', '排比', '譬喻', '轉化'],
    correctAnswer: 0,
    explanation: '前一句的結尾（天子）作為後一句的開頭，這種首尾相連的修辭叫頂真。',
    funFact: '頂真可以讓語氣緊湊流暢，像接力賽一樣。'
  },
  {
    id: 42,
    category: '字音字形',
    question: '「塑」膠的「塑」讀音為？',
    options: ['ㄕㄨㄛˋ (shuò)', 'ㄙㄨㄛ (suō)', 'ㄙㄨˋ (sù)', 'ㄕㄨˋ (shù)'],
    correctAnswer: 2,
    explanation: '讀作 ㄙㄨˋ。',
    funFact: '很多人會誤讀成 ㄕㄨㄛˋ，那是「朔」氣傳金柝的朔。'
  },
  {
    id: 43,
    category: '成語運用',
    question: '「指鹿為馬」比喻？',
    options: ['動物學知識不足', '刻意顛倒是非', '形容馬長得像鹿', '視力模糊'],
    correctAnswer: 1,
    explanation: '秦朝趙高指著鹿硬說是馬，以此測試群臣是否服從。比喻公然顛倒黑白是非。',
    funFact: '當時敢說那是鹿的大臣，後來都被趙高陷害了。'
  },
  {
    id: 44,
    category: '字詞',
    question: '「每下愈況」原本的意思其實是？',
    options: ['情況越來越糟', '情況越來越好', '要從低處觀察才最真實', '路況越來越差'],
    correctAnswer: 2,
    explanation: '莊子用「每下愈況」比喻道無所不在，即使在豬腿最低下的部位也能看出豬的肥瘦。現多誤用為情況越來越糟（況愈下）。',
    funFact: '這個詞現在通用義雖然是「情況變糟」，但原本莊子的哲學含義很深喔！'
  },
  {
    id: 45,
    category: '國學常識',
    question: '《三國演義》中，「過五關斬六將」的是誰？',
    options: ['張飛', '趙雲', '關羽', '呂布'],
    correctAnswer: 2,
    explanation: '關羽為了尋找結拜兄長劉備，一路上突破曹操設下的關卡。',
    funFact: '關羽的坐騎是「赤兔馬」。'
  },
  {
    id: 46,
    category: '修辭',
    question: '「筆落驚風雨，詩成泣鬼神。」運用了？',
    options: ['譬喻', '誇飾', '引用', '倒反'],
    correctAnswer: 1,
    explanation: '形容詩文極好，連風雨都被驚動，鬼神都被感動得哭泣。這是極度的誇飾。',
    funFact: '這是杜甫稱讚李白的詩句。'
  },
  {
    id: 47,
    category: '字詞',
    question: '「夙夜匪懈」形容？',
    options: ['日夜勤奮不懈怠', '晚上睡不著覺', '喜歡在晚上工作', '土匪很猖狂'],
    correctAnswer: 0,
    explanation: '「夙」是早晨，「夜」是晚上，「匪」通非（不）。形容從早到晚都不懈怠。',
    funFact: '常用於公務員考績評語或形容工作認真。'
  },
  {
    id: 48,
    category: '字音字形',
    question: '「偌」大的「偌」讀音為？',
    options: ['ㄋㄨㄛˋ (nuò)', 'ㄖㄨㄛˋ (ruò)', '一ㄡˋ (yòu)', 'ㄗㄨㄛˋ (zuò)'],
    correctAnswer: 1,
    explanation: '讀作 ㄖㄨㄛˋ。意思是「這麼」。偌大就是「這麼大」。',
    funFact: '這個字比較少見，常被誤讀。'
  },
  {
    id: 49,
    category: '標點符號',
    question: '列舉人名、地名等並列詞語時，中間應使用什麼符號？',
    options: ['逗號', '頓號', '分號', '冒號'],
    correctAnswer: 1,
    explanation: '語氣未完，且為並列詞語時，使用頓號（、）。',
    funFact: '比如：西瓜、蘋果、香蕉。'
  },
  {
    id: 50,
    category: '字詞',
    question: '「弱冠之年」是指男子幾歲？',
    options: ['15歲', '20歲', '30歲', '40歲'],
    correctAnswer: 1,
    explanation: '古代男子 20 歲行冠禮，表示成年，但身體還不夠強壯，故稱「弱冠」。',
    funFact: '15歲是「志學之年」，30歲是「而立之年」，40歲是「不惑之年」。'
  },
  {
    id: 51,
    category: '成語運用',
    question: '「吳牛喘月」是用來比喻？',
    options: ['工作非常勤奮', '見到曾受其害的類似事物而過分害怕', '天氣非常炎熱', '想念家鄉'],
    correctAnswer: 1,
    explanation: '江淮一帶的水牛怕熱，看到月亮以為是太陽，就嚇得喘氣。比喻因受過驚嚇，遇到類似的情況就害怕。',
    funFact: '跟「杯弓蛇影」有異曲同工之妙。'
  },
  {
    id: 52,
    category: '字音字形',
    question: '海鮮「蛤蜊」的正確讀音是？',
    options: ['ㄍㄜˇ ㄌㄧˋ (gě lì)', 'ㄍㄜˊ ㄌㄧˊ (gé lí)', 'ㄏㄚ ㄌㄧˋ (hā lì)', 'ㄍㄜˇ ㄌㄞˋ (gě lài)'],
    correctAnswer: 1,
    explanation: '教育部標準讀音為「ㄍㄜˊ ㄌㄧˊ」。',
    funFact: '雖然大家口語常說「ㄍㄜˇ ㄌㄧˋ」，但考試要選「ㄍㄜˊ ㄌㄧˊ」喔！'
  },
  {
    id: 53,
    category: '字詞',
    question: '「弄璋之喜」是指？',
    options: ['生了兒子', '生了女兒', '搬新家', '中了樂透'],
    correctAnswer: 0,
    explanation: '「璋」是玉器，古人把玉器給男孩玩，希望他將來有玉一樣的品德。指生男孩。',
    funFact: '如果是生女兒，則稱為「弄瓦之喜」（瓦是紡織用的陶錘，希望女兒善於紡織）。'
  },
  {
    id: 54,
    category: '修辭',
    question: '新聞報導中常以「祝融」來借代什麼災害？',
    options: ['水災', '火災', '地震', '風災'],
    correctAnswer: 1,
    explanation: '祝融是傳說中的「火神」，所以用來借代火災。',
    funFact: '若是水災，有時會用水神「共工」或「洪魔」來形容。'
  },
  {
    id: 55,
    category: '國學常識',
    question: '《紅樓夢》原本的書名叫做？',
    options: ['西廂記', '石頭記', '金瓶梅', '牡丹亭'],
    correctAnswer: 1,
    explanation: '《紅樓夢》開頭描寫一塊無才補天的通靈寶玉（石頭）下凡歷劫的故事，故名《石頭記》。',
    funFact: '《紅樓夢》的作者是曹雪芹。'
  },
  {
    id: 56,
    category: '成語運用',
    question: '「濫竽充數」的主角是誰？',
    options: ['南郭先生', '東郭先生', '葉公', '愚公'],
    correctAnswer: 0,
    explanation: '南郭先生不會吹竽，卻混在樂隊裡湊數。比喻沒有真才實學的人混在行家裡充數。',
    funFact: '東郭先生則是那個救了狼反而被狼咬的濫好人。'
  },
  {
    id: 57,
    category: '標點符號',
    question: '在書寫書名、篇名、電影名稱時，應該使用什麼符號標示？',
    options: ['專名號 (___)', '書名號 (﹏﹏)', '引號 (「」)', '括號 (（）)'],
    correctAnswer: 1,
    explanation: '直行書寫時標在左邊波浪線，橫行書寫時也是波浪線（現今電腦打字常用《》符號代替書名號，但傳統標點符號為波浪線）。',
    funFact: '《》是甲式書名號，﹏﹏是乙式書名號。'
  },
  {
    id: 58,
    category: '字詞',
    question: '「花甲之年」是指幾歲？',
    options: ['50歲', '60歲', '70歲', '80歲'],
    correctAnswer: 1,
    explanation: '天干地支配合，六十年為一循環，稱為一甲子，故花甲指 60 歲。',
    funFact: '70歲稱為「古稀之年」（人生七十古來稀）。'
  },
  {
    id: 59,
    category: '字音字形',
    question: '戲劇中的「主角」讀音為？',
    options: ['ㄓㄨˇ ㄐㄧㄠˇ (zhǔ jiǎo)', 'ㄓㄨˇ ㄐㄩㄝˊ (zhǔ jué)', 'ㄓㄨ ㄐㄧㄠˇ (zhū jiǎo)', 'ㄓㄨˋ ㄐㄩㄝˊ (zhù jué)'],
    correctAnswer: 1,
    explanation: '「角」在指角色、競逐時讀 ㄐㄩㄝˊ。',
    funFact: '但是「角落」、「牛角」讀 ㄐㄧㄠˇ。'
  },
  {
    id: 60,
    category: '修辭',
    question: '「舉頭望明月，低頭思故鄉。」這兩句運用了？',
    options: ['對偶', '排比', '誇飾', '譬喻'],
    correctAnswer: 0,
    explanation: '「舉頭」對「低頭」，「望」對「思」，「明月」對「故鄉」，詞性相同，字數相等，結構相似，是對偶。',
    funFact: '這首《靜夜思》應該是全世界華人都會背的詩。'
  },
  {
    id: 61,
    category: '字詞',
    question: '「他做事總是『三分鐘熱度』。」意思是？',
    options: ['做事很有效率', '熱情不能持久', '喜歡喝熱湯', '脾氣很暴躁'],
    correctAnswer: 1,
    explanation: '形容對事物的興趣或熱情維持不久，很快就冷淡了。',
    funFact: '類似意思的還有「虎頭蛇尾」。'
  },
  {
    id: 62,
    category: '成語運用',
    question: '「名落孫山」是指？',
    options: ['住在孫山這個地方', '考試落榜', '爬山掉下來', '名字被刻在山上'],
    correctAnswer: 1,
    explanation: '孫山是榜單上的最後一名。名字落在孫山後面，表示沒有考上。',
    funFact: '孫山真有其人，他考中最後一名，幽默地告訴朋友：「解名盡處是孫山，賢郎更在孫山外。」'
  },
  {
    id: 63,
    category: '國學常識',
    question: '唐詩通常分為「絕句」與「律詩」，請問「七言律詩」一首共有幾個字？',
    options: ['20字', '28字', '40字', '56字'],
    correctAnswer: 3,
    explanation: '律詩共有八句，七言律詩每句七個字，8 x 7 = 56 字。',
    funFact: '五言絕句是 20 字；七言絕句是 28 字。'
  },
  {
    id: 64,
    category: '語法',
    question: '「爺爺的頭髮像雪一樣白。」這句的「喻依」（用來作比喻的事物）是？',
    options: ['爺爺', '頭髮', '雪', '白'],
    correctAnswer: 2,
    explanation: '喻體是頭髮（本體），喻依是雪（用來比喻的東西），喻詞是像。',
    funFact: '把結構拆解清楚，有助於寫出更棒的比喻句！'
  },
  {
    id: 65,
    category: '字音字形',
    question: '「落」枕的「落」讀音為？',
    options: ['ㄌㄨㄛˋ (luò)', 'ㄌㄠˋ (lào)', 'ㄌㄚˋ (là)', 'ㄌㄜˋ (lè)'],
    correctAnswer: 1,
    explanation: '落枕（脖子因睡姿不當而疼痛）讀作 ㄌㄠˋ ㄓㄣˇ。',
    funFact: '丟三「落」四，也讀作 ㄌㄚˋ。'
  },
  {
    id: 66,
    category: '字詞',
    question: '在書信中，若是寫給老師，提稱語（信封中間名字下的敬詞）應使用？',
    options: ['膝下', '大鑒', '道鑒', '知之'],
    correctAnswer: 2,
    explanation: '「道鑒」用於教育界或師長；「膝下」用於父母；「大鑒」用於平輩。',
    funFact: '「鑒」就是請對方看信的意思。'
  },
  {
    id: 67,
    category: '成語運用',
    question: '「鎩羽而歸」形容？',
    options: ['帶著榮耀回來', '失意或失敗而回', '羽毛很漂亮', '滿載而歸'],
    correctAnswer: 1,
    explanation: '鎩（ㄕㄚ）羽指鳥傷了羽毛。比喻失意或受挫折回來的樣子。',
    funFact: '「鎩」原本是一種長矛。'
  },
  {
    id: 68,
    category: '修辭',
    question: '「只有夜風還醒著，從竹林裡跑出來。」使用了什麼修辭？',
    options: ['轉化 (擬人)', '譬喻', '排比', '映襯'],
    correctAnswer: 0,
    explanation: '風不會「醒著」也不會「跑」，這是賦予風人的動作與狀態。',
    funFact: '擬人法可以讓靜態的風景動起來。'
  },
  {
    id: 69,
    category: '字詞',
    question: '「黃髮垂髫」中的「黃髮」是指？',
    options: ['嬰兒', '老人', '外國人', '染髮的人'],
    correctAnswer: 1,
    explanation: '「黃髮」指老人（髮色轉黃白）；「垂髫」指兒童（頭髮下垂）。合指老人與小孩。',
    funFact: '所以《桃花源記》說「黃髮垂髫，並怡然自樂」。'
  },
  {
    id: 70,
    category: '字音字形',
    question: '「滑稽」的正確讀音是？',
    options: ['ㄏㄨㄚˊ ㄐㄧ (huá jī)', 'ㄍㄨˇ ㄐㄧ (gǔ jī)', 'ㄏㄨㄚˊ ㄑㄧ (huá qī)', 'ㄍㄨˇ ㄑㄧ (gǔ qī)'],
    correctAnswer: 1,
    explanation: '雖然口語常唸滑（ㄏㄨㄚˊ）稽，但古音及標準讀音應為 ㄍㄨˇ ㄐㄧ。',
    funFact: '《史記》裡有一篇《滑稽列傳》。'
  },
  {
    id: 71,
    category: '國學常識',
    question: '下列哪一首詩是描寫「農民辛勞」的作品？',
    options: ['床前明月光', '鋤禾日當午', '白日依山盡', '故人西辭黃鶴樓'],
    correctAnswer: 1,
    explanation: '「鋤禾日當午，汗滴禾下土。誰知盤中飧，粒粒皆辛苦。」描寫農民耕作的艱辛。',
    funFact: '這是唐代詩人李紳的作品《憫農》。'
  },
  {
    id: 72,
    category: '成語運用',
    question: '「囫圇吞棗」比喻？',
    options: ['吃棗子不吐核', '做事很乾脆', '學習不求甚解', '胃口很好'],
    correctAnswer: 2,
    explanation: '把棗子整個吞下去，不辨滋味。比喻理解事物籠統含糊，不求深究。',
    funFact: '「囫圇」（ㄏㄨˊ ㄌㄨㄣˊ）就是完整的、未加咀嚼的意思。'
  },
  {
    id: 73,
    category: '字詞',
    question: '「東窗事發」通常指什麼事情敗露？',
    options: ['喜事', '陰謀或壞事', '公務', '家事'],
    correctAnswer: 1,
    explanation: '傳說秦檜在東窗下與妻子密謀陷害岳飛，後來事情敗露。指陰謀或罪惡敗露。',
    funFact: '所以這是一個負面詞語。'
  },
  {
    id: 74,
    category: '修辭',
    question: '「千呼萬喚始出來，猶抱琵琶半遮面。」句中的「千」與「萬」是？',
    options: ['實數，剛好一千次一萬次', '虛數，形容次數很多', '數學計算', '沒有意義'],
    correctAnswer: 1,
    explanation: '中文裡的千、萬、百、九，常作為虛數使用，表示「很多」的意思，這也是誇飾修辭。',
    funFact: '像是「九死一生」、「百戰百勝」都是虛數。'
  },
  {
    id: 75,
    category: '語法',
    question: '下列量詞使用何者**錯誤**？',
    options: ['一頭牛', '一匹馬', '一條蛇', '一個畫'],
    correctAnswer: 3,
    explanation: '畫的量詞應該用「幅」，一幅畫。',
    funFact: '量詞是漢語的一大特色，用對量詞顯得更有文化。'
  },
  {
    id: 76,
    category: '字音字形',
    question: '「創」傷的「創」讀音為？',
    options: ['ㄔㄨㄤˋ (chuàng)', 'ㄔㄨㄤ (chuāng)', 'ㄘㄤ (cāng)', 'ㄔㄥ (chēng)'],
    correctAnswer: 1,
    explanation: '受傷、傷口讀一聲 ㄔㄨㄤ。創造、開始讀四聲 ㄔㄨㄤˋ。',
    funFact: '所以「重創」讀 ㄔㄨㄤ，「創意」讀 ㄔㄨㄤˋ。'
  },
  {
    id: 77,
    category: '國學常識',
    question: '漢字構造的「六書」中，最基本、最早產生的是？',
    options: ['形聲', '會意', '象形', '轉注'],
    correctAnswer: 2,
    explanation: '象形是畫出事物的形狀（如日、月、木），是造字的基礎。',
    funFact: '但漢字數量最多的是「形聲」字，佔了80%以上。'
  },
  {
    id: 78,
    category: '成語運用',
    question: '「一丘之貉」意思是？',
    options: ['大家都是好朋友', '同一個山丘上的動物', '彼此同樣低劣，並無差異', '形容環境生態很好'],
    correctAnswer: 2,
    explanation: '貉（ㄏㄜˊ）是像狐狸的野獸。意指都是同一個山丘上的貉。比喻都是壞人，沒有差別。',
    funFact: '這是貶義詞，罵人用的。'
  },
  {
    id: 79,
    category: '字詞',
    question: '「他這幾天總是『魂不守舍』。」意思是？',
    options: ['不喜歡待在家裡', '精神恍惚，心神不定', '靈魂出竅', '非常專注'],
    correctAnswer: 1,
    explanation: '靈魂不肯安住在房舍（身體）裡。形容精神恍惚，注意力不集中。',
    funFact: '「舍」就是房子。'
  },
  {
    id: 80,
    category: '閱讀理解',
    question: '看到詩句「接天蓮葉無窮碧，映日荷花別樣紅」，可以判斷季節是？',
    options: ['春', '夏', '秋', '冬'],
    correctAnswer: 1,
    explanation: '荷花（蓮花）盛開是夏天的景象。',
    funFact: '菊花是秋天，梅花是冬天，桃花通常代表春天。'
  },
  {
    id: 81,
    category: '字音字形',
    question: '「 載」歌「載」舞的讀音是？',
    options: ['ㄗㄞˋ (zài)', 'ㄗㄞˇ (zǎi)', 'ㄉㄞˋ (dài)', 'ㄐㄧㄝ (jiē)'],
    correctAnswer: 0,
    explanation: '讀作 ㄗㄞˋ。意思是「且、又」，邊唱歌邊跳舞。',
    funFact: '記載、三年五載（年）則讀 ㄗㄞˇ。'
  },
  {
    id: 82,
    category: '標點符號',
    question: '「私名號」標示在哪裡？',
    options: ['文字的右邊', '文字的上方', '文字的左邊 (直書) 或 下方 (橫書)', '文字的中間'],
    correctAnswer: 2,
    explanation: '直行書寫時標在左旁，橫行書寫時標在下方。是一條直線。',
    funFact: '專門用來標示人名、地名、朝代名等專有名詞。'
  },
  {
    id: 83,
    category: '成語運用',
    question: '「汗牛充棟」是用來形容？',
    options: ['牛流了很多汗', '建築物很堅固', '藏書非常多', '天氣很熱'],
    correctAnswer: 2,
    explanation: '搬運書籍讓牛累得出汗，堆放書籍充滿整個屋子。形容書籍極多。',
    funFact: '不要誤以為是形容汗流浹背喔！'
  },
  {
    id: 84,
    category: '字詞',
    question: '「鰲頭獨占」或「獨占鰲頭」是指？',
    options: ['搶到好吃的魚', '獲得第一名', '獨自去游泳', '佔領海島'],
    correctAnswer: 1,
    explanation: '科舉時代中狀元要站在宮殿階前石刻的巨鰲（大龜）頭上迎榜。指考中狀元或競賽第一名。',
    funFact: '鰲是傳說中的大海龜。'
  },
  {
    id: 85,
    category: '修辭',
    question: '「路遙知馬力，日久見人心。」運用了？',
    options: ['對偶', '頂真', '倒反', '設問'],
    correctAnswer: 0,
    explanation: '字數相等，結構相似，詞性相對，句意相關，是對偶。',
    funFact: '這句話強調時間能證明一切。'
  },
  {
    id: 86,
    category: '國學常識',
    question: '《史記》的作者是誰？',
    options: ['司馬光', '司馬遷', '班固', '孔子'],
    correctAnswer: 1,
    explanation: '司馬遷忍辱負重寫下了中國第一部紀傳體通史《史記》。',
    funFact: '司馬光寫的是《資治通鑑》，而且他是宋朝人，砸缸救友的那位。'
  },
  {
    id: 87,
    category: '字音字形',
    question: '「否」極泰來的「否」讀音為？',
    options: ['ㄈㄡˇ (fǒu)', 'ㄆㄧˇ (pǐ)', 'ㄅㄨˋ (bù)', 'ㄆㄟ (pēi)'],
    correctAnswer: 1,
    explanation: '否（ㄆㄧˇ）卦是《易經》中不好的卦象。意指壞運氣到了盡頭，好運氣就來了。',
    funFact: '若讀 ㄈㄡˇ，是「不」的意思，如「否定」。'
  },
  {
    id: 88,
    category: '成語運用',
    question: '「井底之蛙」比喻？',
    options: ['青蛙住在井裡很安全', '見識淺薄的人', '環境保護很重要', '游泳技術很好'],
    correctAnswer: 1,
    explanation: '住在井底的青蛙，以為天只有井口那麼大。比喻見識狹窄。',
    funFact: '莊子也用過這個寓言。'
  },
  {
    id: 89,
    category: '字詞',
    question: '「不苟言笑」的意思是？',
    options: ['不喜歡狗', '隨便說說笑笑', '態度嚴肅，不隨便說笑', '說話很好笑'],
    correctAnswer: 2,
    explanation: '「苟」是隨便、草率。形容人態度嚴謹莊重，不隨便開玩笑。',
    funFact: '「一絲不苟」也是這個「苟」，指一點也不馬虎。'
  },
  {
    id: 90,
    category: '字詞',
    question: '寫信封時，若要表示「請對方開啟」，不可使用下列哪個詞（因為那是叫對方封口）？',
    options: ['啟', '收', '展', '緘'],
    correctAnswer: 3,
    explanation: '「緘」是封閉、黏住信口的意思。寫在寄件人處（如：王小明 緘），表示是我封的信。不能叫收件人「緘」。',
    funFact: '「三緘其口」就是把嘴巴封住不說話。'
  },
  {
    id: 91,
    category: '修辭',
    question: '「我好餓，我可以吃下一整頭牛！」這句話使用了？',
    options: ['譬喻', '誇飾', '擬人', '借代'],
    correctAnswer: 1,
    explanation: '人不可能真的吃下一整頭牛，這是誇張的說法。',
    funFact: '英文也有類似用法 "I could eat a horse."。'
  },
  {
    id: 92,
    category: '國學常識',
    question: '「初唐四傑」是指王勃、楊炯、盧照鄰和誰？',
    options: ['駱賓王', '李白', '杜甫', '白居易'],
    correctAnswer: 0,
    explanation: '這四位是唐朝初年非常有才華的詩人。',
    funFact: '駱賓王就是七歲寫《詠鵝》（鵝鵝鵝，曲項向天歌）的那位神童。'
  },
  {
    id: 93,
    category: '字音字形',
    question: '「校」對的「校」讀音為？',
    options: ['ㄒㄧㄠˋ (xiào)', 'ㄐㄧㄠˋ (jiào)', 'ㄑㄧㄠˊ (qiáo)', 'ㄏㄠˊ (háo)'],
    correctAnswer: 1,
    explanation: '訂正文字讀 ㄐㄧㄠˋ，如校稿、校對。學校讀 ㄒㄧㄠˋ。',
    funFact: '軍銜「上校」也讀 ㄐㄧㄠˋ。'
  },
  {
    id: 94,
    category: '成語運用',
    question: '「班門弄斧」比喻？',
    options: ['拿著斧頭砍柴', '在行家面前賣弄本事，不自量力', '木工技術很高明', '整修門窗'],
    correctAnswer: 1,
    explanation: '魯班是古代著名的巧匠（木工祖師爺）。在魯班門前舞弄斧頭，當然是不自量力。',
    funFact: '跟「關公面前耍大刀」意思一樣。'
  },
  {
    id: 95,
    category: '字詞',
    question: '「春秋鼎盛」形容？',
    options: ['春天和秋天景色很美', '正當壯年，精力充沛', '國家很強盛', '歷史故事很多'],
    correctAnswer: 1,
    explanation: '春秋指年齡。鼎盛指正旺。形容人正當壯年，體力、精神都處於最佳狀態。',
    funFact: '不要以為是在講季節喔！'
  },
  {
    id: 96,
    category: '修辭',
    question: '「那個人像狐狸一樣狡猾。」是明喻，若改成隱喻（暗喻）應怎麼說？',
    options: ['那個人是狐狸', '那個人似乎是狐狸', '那個人狡猾得像狐狸', '狐狸很狡猾'],
    correctAnswer: 0,
    explanation: '隱喻通常使用「是」、「為」來連接本體和喻體，直接斷定。',
    funFact: '「我是天空裡的一片雲」就是隱喻。'
  },
  {
    id: 97,
    category: '國學常識',
    question: '孔子最得意的弟子，以「安貧樂道」著稱的是？',
    options: ['子路', '顏回', '子貢', '曾子'],
    correctAnswer: 1,
    explanation: '孔子讚美顏回：「一簞食，一瓢飲，在陋巷，人不堪其憂，回也不改其樂。」',
    funFact: '可惜顏回很早就過世了，孔子非常傷心。'
  },
  {
    id: 98,
    category: '字音字形',
    question: '「 匹」配的「匹」讀音為？',
    options: ['ㄆㄧ (pī)', 'ㄆㄧˇ (pǐ)', 'ㄆㄟˋ (pèi)', 'ㄅㄧˇ (bǐ)'],
    correctAnswer: 1,
    explanation: '讀作 ㄆㄧˇ。',
    funFact: '單槍「匹」馬也讀 ㄆㄧˇ。'
  },
  {
    id: 99,
    category: '成語運用',
    question: '「望洋興嘆」的「望洋」原本是指？',
    options: ['看著海洋', '仰視的樣子', '看著洋人', '看著羊群'],
    correctAnswer: 1,
    explanation: '「望洋」在古文中是仰視的樣子。引申為看著偉大的事物感嘆自己渺小或無能為力。',
    funFact: '現在多用來形容因力量不夠而感到無可奈何。'
  },
  {
    id: 100,
    category: '字詞',
    question: '最後一題！「壓軸」原本是指？',
    options: ['倒數第二個節目', '最後一個節目', '最重要的節目', '最無聊的節目'],
    correctAnswer: 0,
    explanation: '在傳統戲曲中，最後一齣戲叫「大軸」，倒數第二齣叫「壓軸」。但現在常被借用來形容最後最精彩的節目。',
    funFact: '所以嚴格來說，最後一個出場的應該叫「大軸」才對喔！'
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

