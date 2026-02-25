// 國小三年級自然科學題目數據庫

export const CATEGORIES = {
  PLANTS_ANIMALS: '動植物',
  WEATHER: '天氣與季節',
  MATERIALS: '物質與材料',
  LIGHT_SOUND: '光與聲音',
  MAGNET: '磁鐵',
  WATER_AIR: '水與空氣'
}

export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: '選擇題',
  TRUE_FALSE: '是非題',
  FILL_BLANK: '填空題'
}

// 題目數據
export const QUESTIONS = [


        // ==========================================
        // 第一單元：多采多姿的植物 (25題)
        // 習作重點：根莖葉構造、葉序(互/對/輪)、葉脈(網/平)、種菜紀錄
        // ==========================================
        {
            id: 1,
            category: '植物的身體',
            question: '觀察植物時，我們發現植物的身體構造主要分為根、莖、葉，還有哪三個部分？',
            options: ['花、果實、種子', '頭、手、腳', '樹枝、樹幹、樹皮', '花瓣、花粉、花蜜'],
            correctAnswer: 0,
            explanation: '完整的植物六大器官：根、莖、葉、花、果實、種子。習作中會請小朋友畫出來喔！',
            funFact: '我們平常吃的米飯，其實就是水稻的「種子」！🍚'
        },
        {
            id: 2,
            category: '植物的身體',
            question: '像小白菜、菠菜這樣，有一條粗粗的主根，旁邊長出細細側根的，稱為？',
            options: ['鬚根系', '軸根系', '氣生根', '板根'],
            correctAnswer: 1,
            explanation: '課本重點：有明顯主根的叫「軸根系」；像蔥一樣全是細根的叫「鬚根系」。',
            funFact: '軸根系的植物通常抓地力比較深，拔草時比較費力喔！🌱'
        },
        {
            id: 3,
            category: '植物的身體',
            question: '植物的「莖」在生長過程中，主要的功能是什麼？',
            options: ['吸收陽光', '製造養分', '輸送水分與支撐身體', '繁殖後代'],
            correctAnswer: 2,
            explanation: '莖像是植物的高速公路，負責將根吸收的水分往上輸送到葉子。',
            funFact: '我們喝的甘蔗汁，就是儲存在甘蔗「莖」裡的糖水喔！🎋'
        },
        {
            id: 4,
            category: '植物的身體',
            question: '觀察葉子在莖上的生長方式（葉序），如果「一個節只長出一片葉子」，左右交替，這叫？',
            options: ['對生', '互生', '輪生', '叢生'],
            correctAnswer: 1,
            explanation: '習作觀察重點：左一片、右一片交替生長，稱為「互生」。',
            funFact: '你可以觀察校園裡的桑樹或朱槿，它們都是互生的代表！🌿'
        },
        {
            id: 5,
            category: '植物的身體',
            question: '榕樹或朱槿的葉子，上面的紋路像網子一樣交叉，這種葉脈稱為？',
            options: ['平行脈', '網狀脈', '交叉脈', '亂脈'],
            correctAnswer: 1,
            explanation: '像網子的叫網狀脈；像平行線直直的叫平行脈（如玉米）。',
            funFact: '通常「軸根系」的植物，葉子都是「網狀脈」，這是一個秘密規則喔！🔍'
        },
        {
            id: 6,
            category: '植物的身體',
            question: '下列哪種植物的葉脈是「平行脈」（線條直直的）？',
            options: ['杜鵑花', '百合', '玫瑰', '榕樹'],
            correctAnswer: 1,
            explanation: '百合、稻子、玉米、竹子的葉脈都是平行的。',
            funFact: '撕撕看平行脈的葉子，通常可以撕出直直的線條！🎋'
        },
        {
            id: 7,
            category: '植物的身體',
            question: '在種植蔬菜的單元中，如果發現土乾了，應該要？',
            options: ['把土換掉', '澆適量的水', '加很多肥料', '對它唱歌'],
            correctAnswer: 1,
            explanation: '種子發芽與生長需要水分，保持土壤溼潤是照顧蔬菜的重點。',
            funFact: '澆水最好在早晨或傍晚，中午大太陽下澆水植物容易受傷喔！🚿'
        },
        {
            id: 8,
            category: '植物的身體',
            question: '花謝了之後，通常花的哪個部位會慢慢變大，發育成果實？',
            options: ['花瓣', '雄蕊', '子房', '花萼'],
            correctAnswer: 2,
            explanation: '習作填圖題：雌蕊底部的子房在受粉後會膨大變成果實。',
            funFact: '我們吃的芭樂就是由子房變來的，花瓣則會掉光光！🍐'
        },
        {
            id: 9,
            category: '植物的身體',
            question: '牽牛花或四季豆的莖軟軟的，會纏繞在竿子上往上爬，這種莖稱為？',
            options: ['直立莖', '匍匐莖', '攀緣莖（纏繞莖）', '地下莖'],
            correctAnswer: 2,
            explanation: '無法直立，需要攀爬物體的莖稱為攀緣莖。',
            funFact: '種植這些植物時，記得要幫它們搭架子才長得好！🥒'
        },
        {
            id: 10,
            category: '植物的身體',
            question: '下列哪種植物的根，長得像老公公的鬍鬚（鬚根系），沒有主根？',
            options: ['菠菜', '蔥', '香菜', '小白菜'],
            correctAnswer: 1,
            explanation: '蔥、蒜、玉米的根是一叢細細的鬚根。',
            funFact: '鬚根系的植物通常根長得比較淺，颱風來容易倒伏。💨'
        },
        {
            id: 11,
            category: '植物的身體',
            question: '木瓜樹的莖是中空的，而且莖上面有一圈一圈落葉留下的痕跡，那是？',
            options: ['葉痕', '傷口', '年輪', '花紋'],
            correctAnswer: 0,
            explanation: '葉子掉落後在莖上留下的痕跡叫做「葉痕」。',
            funFact: '木瓜樹雖然長得高，但它的莖比較軟（草本），容易被風吹斷！⚠️'
        },
        {
            id: 12,
            category: '植物的身體',
            question: '我們平常吃的「地瓜（番薯）」是植物的哪一部位？',
            options: ['塊莖', '塊根', '果實', '種子'],
            correctAnswer: 1,
            explanation: '地瓜是儲藏養分的「根」（塊根），馬鈴薯才是「莖」（塊莖）。',
            funFact: '你可以把地瓜泡水，它會長出根和葉子，證明它是活的！🍠'
        },
        {
            id: 13,
            category: '植物的身體',
            question: '黑板樹的葉子，在同一個節上長出三片以上，像車輪一樣，這叫？',
            options: ['互生', '對生', '輪生', '叢生'],
            correctAnswer: 2,
            explanation: '三片以上環繞生長，稱為「輪生」。',
            funFact: '去校園找找看黑板樹，抬頭看它的葉子是不是像輪子！🏫'
        },
        {
            id: 14,
            category: '植物的身體',
            question: '觀察芭樂（番石榴）的葉子，一個節長兩片，且面對面生長，這叫？',
            options: ['對生', '互生', '輪生', '叢生'],
            correctAnswer: 0,
            explanation: '一節兩片且相對，是標準的「對生」。',
            funFact: '可以用雙手比「耶」✌️，兩根手指就像對生的葉子！'
        },
        {
            id: 15,
            category: '植物的身體',
            question: '有些植物的種子有像翅膀的構造（如大葉桃花心木），是為了？',
            options: ['好看', '隨風飄到遠處繁殖', '給鳥吃', '游泳'],
            correctAnswer: 1,
            explanation: '利用風力傳播的種子，通常有翅膀或羽毛狀構造。',
            funFact: '玩過竹蜻蜓嗎？這些種子掉下來時也會旋轉喔！🚁'
        },
        {
            id: 16,
            category: '植物的身體',
            question: '咸豐草（鬼針草）的果實有倒鉤刺，會黏在衣服上，這是利用什麼傳播？',
            options: ['風力', '動物幫忙攜帶', '水力', '彈力'],
            correctAnswer: 1,
            explanation: '利用倒鉤刺黏在動物毛髮或人衣物上，把種子帶到遠方。',
            funFact: '去草地玩回來褲子上的「恰查某」就是它！🚌'
        },
        {
            id: 17,
            category: '植物的身體',
            question: '種蔬菜時，在容器底部挖洞或放紗網，主要是為了？',
            options: ['讓蟲進來', '排水與通氣', '省土', '觀察根'],
            correctAnswer: 1,
            explanation: '排水不良會讓植物的根爛掉，所以底部要有孔洞。',
            funFact: '如果是用寶特瓶種菜，記得要自己戳洞喔！🕳️'
        },
        {
            id: 18,
            category: '植物的身體',
            question: '如果蔬菜種太密了，長得不好，我們應該怎麼做？',
            options: ['全部拔掉', '進行「間拔」（疏苗）', '加更多水', '蓋上蓋子'],
            correctAnswer: 1,
            explanation: '拔除生長過密或發育不良的幼苗，讓留下的菜有空間長大。',
            funFact: '間拔下來的小菜苗也可以吃喔！🥗'
        },
        {
            id: 19,
            category: '植物的身體',
            question: '植物的根除了吸收水分，還有什麼重要功能？',
            options: ['行光合作用', '抓住泥土固定身體', '開花', '吸引蝴蝶'],
            correctAnswer: 1,
            explanation: '根深入土裡可以固定植物，避免倒塌。',
            funFact: '颱風天大樹不倒，就是靠根緊緊抓住泥土！⛰️'
        },
        {
            id: 20,
            category: '植物的身體',
            question: '有些植物的莖長在土裡，肥肥大大的（如薑、蓮藕），稱為？',
            options: ['地下莖', '氣生根', '攀緣莖', '纏繞莖'],
            correctAnswer: 0,
            explanation: '薑、馬鈴薯、蓮藕都是特殊的地下莖。',
            funFact: '蓮藕切開會有絲，那是它的輸水管（維管束）喔！🫚'
        },
        {
            id: 21,
            category: '植物的身體',
            question: '芒果裡面只有一顆大大的硬核，那是它的？',
            options: ['果肉', '種子', '莖', '葉'],
            correctAnswer: 1,
            explanation: '芒果、桃子都屬於只有一顆大種子的水果。',
            funFact: '西瓜則有非常多小種子，這也是為了增加繁殖機會！🥭'
        },
        {
            id: 22,
            category: '植物的身體',
            question: '我們吃的花椰菜，其實是吃它的什麼部位？',
            options: ['葉子', '花（花苞）', '根', '果實'],
            correctAnswer: 1,
            explanation: '花椰菜那一球就是無數的小花苞聚集而成的。',
            funFact: '如果花椰菜不採收，它真的會開出黃色的小花喔！🥦'
        },
        {
            id: 23,
            category: '植物的身體',
            question: '想要把葉子的樣子記錄下來，可以用什麼方法？',
            options: ['用拓印的', '把它吃掉', '用火燒', '撕碎'],
            correctAnswer: 0,
            explanation: '習作活動：將葉子放在紙下，用蠟筆塗抹，可以印出葉脈形狀。',
            funFact: '葉脈越明顯的葉子，拓印出來越漂亮！🖍️'
        },
        {
            id: 24,
            category: '植物的身體',
            question: '葉子主要的功能是進行「光合作用」，幫植物製造什麼？',
            options: ['水分', '養分', '泥土', '陽光'],
            correctAnswer: 1,
            explanation: '葉子利用陽光、空氣和水製造植物生長需要的養分。',
            funFact: '葉子就像植物的「綠色廚房」！👩‍🍳'
        },
        {
            id: 25,
            category: '植物的身體',
            question: '下列哪種植物的葉子邊緣是「鋸齒狀」的？',
            options: ['榕樹', '玫瑰', '馬鞍藤', '百合'],
            correctAnswer: 1,
            explanation: '玫瑰的葉子邊緣有細細的鋸齒，榕樹葉緣是平滑的。',
            funFact: '葉子邊緣的形狀也是分辨植物種類的重要線索！🌹'
        },
    
        // ==========================================
        // 第二單元：神奇的磁鐵 (25題)
        // 習作重點：吸鐵、磁極、同極斥異極吸、磁力穿透
        // ==========================================
        {
            id: 26,
            category: '神奇的磁鐵',
            question: '磁鐵可以吸住下列哪種物品？',
            options: ['塑膠尺', '鐵夾子', '橡皮擦', '鋁罐'],
            correctAnswer: 1,
            explanation: '磁鐵主要吸附「鐵」製品，鋁、銅、金都吸不住。',
            funFact: '試試看，磁鐵吸不住1元硬幣（銅），但有些國家的硬幣可以喔！🧲'
        },
        {
            id: 27,
            category: '神奇的磁鐵',
            question: '長條形磁鐵上，磁力最強的地方在哪裡？',
            options: ['正中間', '兩端（磁極）', '任何地方都一樣', '轉角處'],
            correctAnswer: 1,
            explanation: '習作實驗：磁鐵的兩端吸住的迴紋針最多，稱為磁極。',
            funFact: '中間幾乎吸不住迴紋針，那是磁力最弱的地方。⚡'
        },
        {
            id: 28,
            category: '神奇的磁鐵',
            question: '當兩個磁鐵的 N 極靠近 N 極（同極）時，會發生什麼事？',
            options: ['互相吸引', '互相排斥（推開）', '沒反應', '黏在一起'],
            correctAnswer: 1,
            explanation: '磁鐵定律：「同極相斥，異極相吸」。',
            funFact: '磁鐵車遊戲就是利用相斥的力，讓車子不碰也能跑！✋'
        },
        {
            id: 29,
            category: '神奇的磁鐵',
            question: '把磁鐵放在浮板上讓它自由轉動，靜止後 N 極通常會指向哪裡？',
            options: ['東方', '西方', '南方', '北方'],
            correctAnswer: 3,
            explanation: 'N 極（North）會指向北方，這是指南針的原理。',
            funFact: '因為地球本身就是一個超大磁鐵！🌏'
        },
        {
            id: 30,
            category: '神奇的磁鐵',
            question: '隔著一張薄墊板或課本，磁鐵還能吸住迴紋針嗎？',
            options: ['不行', '可以', '磁力會消失', '墊板會破掉'],
            correctAnswer: 1,
            explanation: '習作實驗：磁力可以穿透非磁性物質（如紙、玻璃、塑膠）。',
            funFact: '這就是為什麼磁鐵可以吸在冰箱門上夾住便條紙！📝'
        },
        {
            id: 31,
            category: '神奇的磁鐵',
            question: '如果想製作簡易指南針，可以用磁鐵摩擦什麼東西？',
            options: ['塑膠湯匙', '鐵製縫衣針', '竹筷子', '橡皮筋'],
            correctAnswer: 1,
            explanation: '鐵針被磁鐵摩擦後會被「磁化」，暫時變成小磁鐵。',
            funFact: '記得要「單一方向」摩擦，不可以來回磨喔！🧭'
        },
        {
            id: 32,
            category: '神奇的磁鐵',
            question: '如果不小心把長條形磁鐵摔斷成兩半，每一段會有幾個磁極？',
            options: ['1個', '2個（N和S）', '0個', '3個'],
            correctAnswer: 1,
            explanation: '磁鐵斷掉後，每一段都還是會有完整的 N 極和 S 極。',
            funFact: '不管切多小塊，磁鐵永遠都會有兩個極，很神奇吧！🔗'
        },
        {
            id: 33,
            category: '神奇的磁鐵',
            question: 'U型磁鐵（馬蹄形）做成彎彎的樣子，是為了？',
            options: ['比較好看', '讓兩端的磁力集中在同一邊', '比較好拿', '可以掛東西'],
            correctAnswer: 1,
            explanation: '把兩個磁極集中在同一側，吸力會更強且方便吸物體。',
            funFact: 'U型磁鐵通常比同大小的長條磁鐵更能吸住重物！🧲'
        },
        {
            id: 34,
            category: '神奇的磁鐵',
            question: '下列哪個生活用品應用了磁鐵？',
            options: ['鉛筆盒蓋子', '寶特瓶', '木頭椅子', '衛生紙'],
            correctAnswer: 0,
            explanation: '鉛筆盒蓋利用磁鐵吸住，防止打開。',
            funFact: '還有冰箱門邊條、皮包扣子也都是利用磁鐵喔！🚪'
        },
        {
            id: 35,
            category: '神奇的磁鐵',
            question: '想要讓磁鐵的吸力變強，可以怎麼做？',
            options: ['把磁鐵加熱', '串聯多個磁鐵（異極相吸疊起來）', '把磁鐵摔碎', '泡在水裡'],
            correctAnswer: 1,
            explanation: '磁鐵串聯（N接S接N接S）可以增強磁力。',
            funFact: '但是如果並聯（同極綁在一起），反而可能會互相干擾喔！💪'
        },
        {
            id: 36,
            category: '神奇的磁鐵',
            question: '環形磁鐵套在圓柱上，如果兩個磁鐵「浮」起來了，是因為？',
            options: ['它們太輕了', '同極相斥（N對N 或 S對S）', '異極相吸', '有風在吹'],
            correctAnswer: 1,
            explanation: '上下兩個面是同極就會產生斥力抵抗重力而浮起。',
            funFact: '這是一個很好玩的科學玩具，叫「跳跳磁鐵」！🎈'
        },
        {
            id: 37,
            category: '神奇的磁鐵',
            question: '指南針不可以靠近下列什麼東西，以免指針亂轉失準？',
            options: ['木頭桌子', '鐵製品或磁鐵', '塑膠杯', '書本'],
            correctAnswer: 1,
            explanation: '鐵製品和磁鐵會干擾指南針的磁場。',
            funFact: '所以在做實驗時，桌上不要放太多剪刀或磁鐵喔！✂️'
        },
        {
            id: 38,
            category: '神奇的磁鐵',
            question: '長尾夾為什麼可以被磁鐵吸起來？',
            options: ['因為它是黑色的', '因為它是鐵做的', '因為它很輕', '因為它有尾巴'],
            correctAnswer: 1,
            explanation: '磁鐵吸鐵，長尾夾通常是鐵製品。',
            funFact: '如果是塑膠做的夾子就吸不起來囉！📎'
        },
        {
            id: 39,
            category: '神奇的磁鐵',
            question: '磁鐵的 S 極（South）通常代表什麼方位？',
            options: ['北方', '南方', '東方', '西方'],
            correctAnswer: 1,
            explanation: 'S 代表 South，也就是南方。',
            funFact: '指南針上通常 S 極會塗成白色或藍色，N 極塗成紅色。⬇️'
        },
        {
            id: 40,
            category: '神奇的磁鐵',
            question: '把鐵釘吸在磁鐵上，結果鐵釘尖端也能吸住迴紋針，這是因為？',
            options: ['鐵釘被「磁化」了', '鐵釘黏黏的', '迴紋針壞了', '幻覺'],
            correctAnswer: 0,
            explanation: '鐵製品接觸磁鐵後，會暫時獲得磁性，稱為磁化。',
            funFact: '把磁鐵拿走後，鐵釘的磁性很快就會消失。⏳'
        },
        {
            id: 41,
            category: '神奇的磁鐵',
            question: '磁鐵放在水中，還有磁力嗎？',
            options: ['沒有', '有', '變強十倍', '變成電力'],
            correctAnswer: 1,
            explanation: '習作實驗：水不能阻隔磁力，磁鐵在水中一樣能吸鐵。',
            funFact: '所以如果不小心把針掉進水杯，可以用磁鐵吸出來！💧'
        },
        {
            id: 42,
            category: '神奇的磁鐵',
            question: '所謂的「異極相吸」，是指哪兩個極？',
            options: ['N極吸N極', 'S極吸S極', 'N極吸S極', '大磁鐵吸小磁鐵'],
            correctAnswer: 2,
            explanation: '不同的極性（N配S）會互相吸引。',
            funFact: '就像拼圖一樣，合得剛剛好！🧩'
        },
        {
            id: 43,
            category: '神奇的磁鐵',
            question: '如果用「鐵盒」把磁鐵裝起來，外面的迴紋針還吸得住嗎？',
            options: ['可以', '不行（被屏蔽）', '會變更強', '沒影響'],
            correctAnswer: 1,
            explanation: '鐵盒會導引磁力線，造成「磁屏蔽」，磁力就穿不出來了。',
            funFact: '所以磁鐵通常不會裝在鐵盒子裡，不然會失效！🛡️'
        },
        {
            id: 44,
            category: '神奇的磁鐵',
            question: '教室黑板上的磁鐵釦，為什麼能吸在黑板上？',
            options: ['黑板有塗膠水', '黑板裡面有鐵片（或鐵粉）', '黑板有魔鬼氈', '黑板有靜電'],
            correctAnswer: 1,
            explanation: '黑板通常是鐵製品或含有鐵粉層，所以磁鐵能吸住。',
            funFact: '如果黑板是純玻璃做的，磁鐵就吸不住囉！🏫'
        },
        {
            id: 45,
            category: '神奇的磁鐵',
            question: '門擋（門吸）利用磁鐵是為了？',
            options: ['把人吸住', '把門吸住固定', '讓門自動關上', '嚇跑小偷'],
            correctAnswer: 1,
            explanation: '利用磁鐵吸住門上的鐵片，防止門被風吹關上。',
            funFact: '這是生活中小小磁鐵的大大功用！🚪'
        },
        {
            id: 46,
            category: '神奇的磁鐵',
            question: '如果不小心把磁鐵拿去火燒，磁力會？',
            options: ['變更強', '變弱或消失（退磁）', '不變', '變成彩虹'],
            correctAnswer: 1,
            explanation: '高溫會破壞磁鐵內部的排列，讓磁力消失。',
            funFact: '所以磁鐵不能拿去煮，也不能放在高溫的地方喔！🔥'
        },
        {
            id: 47,
            category: '神奇的磁鐵',
            question: '要讓鐵針變成小磁鐵，摩擦時要注意什麼？',
            options: ['來回摩擦', '同一個方向摩擦', '隨便亂擦', '用力敲打'],
            correctAnswer: 1,
            explanation: '習作重點：要順著同一個方向摩擦，才能把鐵針內的磁性排列整齊。',
            funFact: '如果來回摩擦，磁性就會亂掉，做不出指南針了！🧭'
        },
        {
            id: 48,
            category: '神奇的磁鐵',
            question: '磁鐵車要怎麼樣才會「前進」？（假設磁鐵在車尾，手拿磁鐵靠近）',
            options: ['異極相吸（吸回來）', '同極相斥（推出去）', '用手推', '用嘴吹'],
            correctAnswer: 1,
            explanation: '利用排斥力（推力）可以把車子往前推。',
            funFact: '這是一種看不見的力喔！🚗'
        },
        {
            id: 49,
            category: '神奇的磁鐵',
            question: '下列哪種硬幣通常「不會」被磁鐵吸住（台灣硬幣）？',
            options: ['1元', '5元', '10元', '以上通常都不行'],
            correctAnswer: 3,
            explanation: '台灣流通的硬幣主要成分是銅，磁鐵吸不住（或吸力極微弱）。',
            funFact: '你可以拿磁鐵試試看家裡的各種硬幣！💰'
        },
        {
            id: 50,
            category: '神奇的磁鐵',
            question: '磁鐵的 N 極是指向地球的？',
            options: ['北方', '南方', '東方', '西方'],
            correctAnswer: 0,
            explanation: 'N = North，指向北方。',
            funFact: '記得口訣：N北S南！'
        },
    
        // ==========================================
        // 第三單元：奇妙的空氣 (25題)
        // 習作重點：空氣佔空間(杯子實驗)、壓縮(注射筒)、風向風力
        // ==========================================
        {
            id: 51,
            category: '奇妙的空氣',
            question: '將空的玻璃杯垂直壓入水中，杯底塞的紙巾不會濕，這證明了？',
            options: ['杯子破了', '空氣佔有空間', '水不喜歡紙', '紙巾防水'],
            correctAnswer: 1,
            explanation: '習作實驗：空氣雖然看不見，但它佔據了杯子的空間，水進不去。',
            funFact: '這證明空氣不是「空」的，它真的存在！🤿'
        },
        {
            id: 52,
            category: '奇妙的空氣',
            question: '關於空氣的特性，下列何者正確？',
            options: ['空氣有固定的形狀', '空氣看不見所以不存在', '空氣可以被壓縮', '空氣只有在室外才有'],
            correctAnswer: 2,
            explanation: '空氣沒有固定形狀，但可以被壓縮（體積變小）。',
            funFact: '把針筒堵住用力推，會感覺到彈力，這就是壓縮空氣的力量！💉'
        },
        {
            id: 53,
            category: '奇妙的空氣',
            question: '當風向計的箭頭指向「東方」時，代表現在吹什麼風？',
            options: ['東風', '西風', '南風', '北風'],
            correctAnswer: 0,
            explanation: '習作重點：風向計的箭頭是指向風「吹過來」的方向。',
            funFact: '記住口訣：「風從哪裡來，就叫什麼風」。🚩'
        },
        {
            id: 54,
            category: '奇妙的空氣',
            question: '我們看到的煙往「北邊」飄，代表現在吹什麼風？',
            options: ['東風', '西風', '南風', '北風'],
            correctAnswer: 2,
            explanation: '煙往北飄，代表風從南方吹向北方，所以是「南風」。',
            funFact: '這題很容易搞混，要畫圖想一下喔！⬅️➡️'
        },
        {
            id: 55,
            category: '奇妙的空氣',
            question: '注射筒吸入空氣後堵住出口，用力壓活塞，放手後活塞會？',
            options: ['停在底下', '彈回來', '爆炸', '不見'],
            correctAnswer: 1,
            explanation: '被壓縮的空氣想要恢復原狀，會產生彈力把活塞推回。',
            funFact: '這就像輪胎裡的空氣支撐著車子一樣！🏀'
        },
        {
            id: 56,
            category: '奇妙的空氣',
            question: '如果注射筒裡裝的是「水」，堵住出口推活塞，活塞會？',
            options: ['推不動', '推到底', '很有彈性', '水變不見'],
            correctAnswer: 0,
            explanation: '習作實驗比較：水（液體）很難被壓縮，所以幾乎推不動。',
            funFact: '這也是為什麼水槍可以把水射得很遠，因為水壓傳遞力量！💧'
        },
        {
            id: 57,
            category: '奇妙的空氣',
            question: '風是怎麼產生的？',
            options: ['空氣流動', '水蒸發', '太陽發光', '雲移動'],
            correctAnswer: 0,
            explanation: '風就是空氣流動產生的自然現象。',
            funFact: '用扇子搧風，就是人為製造空氣流動喔！🌬️'
        },
        {
            id: 58,
            category: '奇妙的空氣',
            question: '做紙風車時，如果要讓風車轉動，需要有？',
            options: ['陽光', '水', '風（流動的空氣）', '磁鐵'],
            correctAnswer: 2,
            explanation: '流動的空氣推動葉片，風車才會轉。',
            funFact: '風力發電的大風車也是這樣轉動發電的！⚡'
        },
        {
            id: 59,
            category: '奇妙的空氣',
            question: '空氣槍（空氣砲）是利用空氣的什麼特性來發射子彈？',
            options: ['空氣有顏色', '空氣被壓縮產生彈力', '空氣會溶解', '空氣很輕'],
            correctAnswer: 1,
            explanation: '壓縮空氣產生壓力，推動紙團發射出去。',
            funFact: '發射時會「波」一聲，那是空氣突然膨脹振動的聲音！💥'
        },
        {
            id: 60,
            category: '奇妙的空氣',
            question: '在水裡吹氣球，氣球會鼓起來，證明？',
            options: ['氣球怕水', '空氣佔有空間', '空氣會游泳', '水裡有魚'],
            correctAnswer: 1,
            explanation: '氣球排開了水，佔據了空間，證明空氣存在。',
            funFact: '魚缸裡的打氣機也是把空氣打進水裡增加氧氣喔！🐟'
        },
        {
            id: 61,
            category: '奇妙的空氣',
            question: '把塑膠袋裝滿空氣綁緊，摸起來鼓鼓軟軟的，形狀可以改變，代表？',
            options: ['空氣沒有固定形狀', '空氣很硬', '空氣是液體', '空氣有毒'],
            correctAnswer: 0,
            explanation: '氣體沒有固定形狀，會隨容器改變。',
            funFact: '你可以把空氣裝進圓形氣球，也可以裝進長條氣球！🎈'
        },
        {
            id: 62,
            category: '奇妙的空氣',
            question: '風力計轉得越快，代表？',
            options: ['風越強', '風越弱', '沒有風', '快下雨了'],
            correctAnswer: 0,
            explanation: '風力計是用來測量風的強弱（大小）。',
            funFact: '颱風天新聞報的「10級陣風」就是風力計量出來的！🌪️'
        },
        {
            id: 63,
            category: '奇妙的空氣',
            question: '下列哪種物品「不需要」充氣就能使用？',
            options: ['籃球', '輪胎', '游泳圈', '棒球'],
            correctAnswer: 3,
            explanation: '棒球是實心的；其他都需要空氣填充才有彈性或浮力。',
            funFact: '腳踏車輪胎如果沒氣了，騎起來會很費力喔！⚽'
        },
        {
            id: 64,
            category: '奇妙的空氣',
            question: '紙飛機要飛得遠，除了摺法，通常要怎麼丟（國小科學原理）？',
            options: ['順著風丟', '逆著風丟（增加升力）', '往地板丟', '閉眼睛丟'],
            correctAnswer: 1,
            explanation: '雖然順風飛得快，但在科學上逆風能增加升力讓飛機飛得穩。',
            funFact: '真正的飛機起降一定要「逆風」才安全喔！✈️'
        },
        {
            id: 65,
            category: '奇妙的空氣',
            question: '我們日常生活呼吸，是需要空氣中的什麼氣體？',
            options: ['氮氣', '氧氣', '二氧化碳', '氫氣'],
            correctAnswer: 1,
            explanation: '氧氣維持生命，也幫助燃燒。',
            funFact: '高山上空氣稀薄（氧氣少），所以爬山容易喘！⛰️'
        },
        {
            id: 66,
            category: '奇妙的空氣',
            question: '下列哪種現象「不能」證明空氣佔有空間？',
            options: ['吹氣球氣球變大', '空杯倒扣入水紙不濕', '扁的輪胎打氣變鼓', '手電筒發光'],
            correctAnswer: 3,
            explanation: '光線傳播與空氣佔空間無關，光在真空中也能傳播。',
            funFact: '太陽光就是穿過真空的宇宙來到地球的！💡'
        },
        {
            id: 67,
            category: '奇妙的空氣',
            question: '風向計的箭頭指向「東」，代表風是從哪邊吹來？',
            options: ['東邊', '西邊', '南邊', '北邊'],
            correctAnswer: 0,
            explanation: '風向計箭頭指的方向就是風的來向。',
            funFact: '東風就是從東邊吹向西邊的風喔！➡️'
        },
        {
            id: 68,
            category: '奇妙的空氣',
            question: '為什麼充滿氣的救生圈可以讓人浮在水面？',
            options: ['空氣有顏色', '空氣比水輕（產生浮力）', '救生圈很重', '水喜歡救生圈'],
            correctAnswer: 1,
            explanation: '空氣密度比水小，所以會產生浮力。',
            funFact: '千萬不要把救生圈刺破，不然空氣跑掉就浮不起來了！🆘'
        },
        {
            id: 69,
            category: '奇妙的空氣',
            question: '製作紙風車時，葉片為什麼要稍微傾斜？',
            options: ['為了好看', '為了接受風的推力', '為了省紙', '隨便做的'],
            correctAnswer: 1,
            explanation: '葉片傾斜才能將風的推力轉化為旋轉的力量。',
            funFact: '如果葉片是平的，風車就不會轉囉！💨'
        },
        {
            id: 70,
            category: '奇妙的空氣',
            question: '把瓶子裡的空氣抽掉變成真空，裡面的鬧鐘響了，我們聽得到嗎？',
            options: ['變很大聲', '聽不到', '變好聽', '沒差'],
            correctAnswer: 1,
            explanation: '聲音需要空氣傳播，真空中沒有空氣，所以聽不到。',
            funFact: '所以在太空中，太空人說話要靠無線電！👨‍🚀'
        },
        {
            id: 71,
            category: '奇妙的空氣',
            question: '把杯子裡的空氣吸走，杯子會吸在嘴巴上，這是因為？',
            options: ['杯子有膠水', '大氣壓力', '杯子喜歡嘴巴', '嘴巴有磁力'],
            correctAnswer: 1,
            explanation: '杯內空氣變少壓力變小，外面的大氣壓力把杯子壓在嘴上。',
            funFact: '拔罐也是利用這個原理喔！🩸'
        },
        {
            id: 72,
            category: '奇妙的空氣',
            question: '夏天吹電風扇會涼，是因為風能？',
            options: ['噴出冰塊', '加速汗水蒸發帶走熱', '吸熱', '發電'],
            correctAnswer: 1,
            explanation: '空氣流動加速水分蒸發，蒸發會吸熱讓人覺得涼快。',
            funFact: '如果空氣很濕（很悶），電風扇吹起來就不涼了！🥵'
        },
        {
            id: 73,
            category: '奇妙的空氣',
            question: '看到煙囪的煙「直直往上」升，代表現在風力？',
            options: ['很大', '很小或無風', '颱風', '煙囪壞了'],
            correctAnswer: 1,
            explanation: '沒有風吹動煙，煙就會因熱氣上升而直直往上。',
            funFact: '這時候風力級數可能是 0 級。🏭'
        },
        {
            id: 74,
            category: '奇妙的空氣',
            question: '空氣槍的管子如果有破洞，發射得遠嗎？',
            options: ['更遠', '射不遠', '沒影響', '會倒退'],
            correctAnswer: 1,
            explanation: '空氣會從破洞漏掉，無法累積足夠的壓力推紙團。',
            funFact: '這告訴我們實驗器材的「氣密性」很重要！🎈'
        },
        {
            id: 75,
            category: '奇妙的空氣',
            question: '蠟燭燃燒需要空氣嗎？',
            options: ['需要', '不需要', '看心情', '只需要水'],
            correctAnswer: 0,
            explanation: '習作實驗：燃燒需要氧氣，如果用杯子蓋住，火很快熄滅。',
            funFact: '所以火災時不能亂開門，以免更多空氣跑進去助燃！🕯️'
        },
    
        // ==========================================
        // 第四單元：廚房裡的科學-溶解 (25題)
        // 習作重點：溶解定義、加速溶解(溫/攪/粒)、粉末觀察
        // ==========================================
        {
            id: 76,
            category: '廚房裡的科學',
            question: '把鹽巴加入水中攪拌後看不見顆粒了，這個現象叫做？',
            options: ['融化', '溶解', '蒸發', '凝固'],
            correctAnswer: 1,
            explanation: '課本定義：物質均勻散布在水中，看不見顆粒，稱為溶解。',
            funFact: '冰塊變成水叫「融化」，不要搞混喔！🧂'
        },
        {
            id: 77,
            category: '廚房裡的科學',
            question: '下列哪種廚房裡的粉末「不會」溶解在水裡？',
            options: ['砂糖', '食鹽', '玉米粉（太白粉）', '冰糖'],
            correctAnswer: 2,
            explanation: '太白粉或玉米粉放入水中會白白的（懸浮），靜置會沉澱，不算完全溶解。',
            funFact: '媽媽煮菜勾芡就是用太白粉水的這個特性！🥣'
        },
        {
            id: 78,
            category: '廚房裡的科學',
            question: '想要讓冰糖趕快溶解在水裡，可以用什麼方法？',
            options: ['加冰塊', '放入冰箱', '用熱水並攪拌', '放在桌上不動'],
            correctAnswer: 2,
            explanation: '習作實驗：高溫、攪拌、磨碎都可以加速溶解。',
            funFact: '所以泡熱牛奶比泡冰牛奶容易多了！☕'
        },
        {
            id: 79,
            category: '廚房裡的科學',
            question: '把糖果敲碎變成粉末再泡水，溶解速度會？',
            options: ['變快', '變慢', '沒變', '不會溶解'],
            correctAnswer: 0,
            explanation: '磨碎增加了接觸面積，水更容易帶走糖分子。',
            funFact: '這就是為什麼藥粉比藥丸吸收得快！💊'
        },
        {
            id: 80,
            category: '廚房裡的科學',
            question: '如果一直往水裡加鹽巴，最後會發生什麼事？',
            options: ['水會爆炸', '鹽巴會一直溶解無限多', '會有鹽巴沉在底下無法溶解', '水會變成立方體'],
            correctAnswer: 2,
            explanation: '水能溶解的量是有限的（飽和），多出來的會沉在杯底。',
            funFact: '這時候如果你把水加熱，通常可以再多溶一點點喔！🔥'
        },
        {
            id: 81,
            category: '廚房裡的科學',
            question: '完全溶解後的糖水，喝起來味道如何？',
            options: ['下面比較甜', '上面比較甜', '每一口都一樣甜', '中間最甜'],
            correctAnswer: 2,
            explanation: '溶解後糖分子是「均勻」分布在水中的。',
            funFact: '如果是還沒攪散，那就是下面比較甜囉！🥤'
        },
        {
            id: 82,
            category: '廚房裡的科學',
            question: '下列哪種調味料無法溶解在水中，會浮在水面上？',
            options: ['醬油', '醋', '麻油（沙拉油）', '味精'],
            correctAnswer: 2,
            explanation: '油水不互溶，油比水輕，所以會浮在上面。',
            funFact: '這就是為什麼煮湯時，油花都浮在最上面！🍜'
        },
        {
            id: 83,
            category: '廚房裡的科學',
            question: '果凍粉加入熱水中攪拌，放涼後變成固體，這是利用？',
            options: ['溶解後凝結', '蒸發', '燃燒', '磁力'],
            correctAnswer: 0,
            explanation: '果凍粉先溶解在熱水中，冷卻後凝固成凍。',
            funFact: '做果凍時水不能太多，不然會結不起來喔！🍮'
        },
        {
            id: 84,
            category: '廚房裡的科學',
            question: '如何把溶解在水裡的鹽巴「救」回來（變回顆粒）？',
            options: ['用濾網過濾', '把水拿去曬太陽蒸發', '放入冰箱', '加更多水'],
            correctAnswer: 1,
            explanation: '水蒸發後，鹽巴不會跟著蒸發，會結晶留下來。',
            funFact: '台南的鹽田就是利用太陽曬乾海水來收成鹽巴的！☀️'
        },
        {
            id: 85,
            category: '廚房裡的科學',
            question: '觀察鹽巴溶解時，會看到什麼現象？',
            options: ['鹽巴顆粒變小最後消失', '水變混濁看不清楚', '水變紅色', '冒出大量泡泡'],
            correctAnswer: 0,
            explanation: '鹽溶解是透明的物理變化，顆粒會消失在水中。',
            funFact: '如果看到冒泡泡，通常是像小蘇打粉加醋的化學反應！🫧'
        },
        {
            id: 86,
            category: '廚房裡的科學',
            question: '煮湯時覺得太淡了，加鹽巴攪拌後試喝，這是應用了什麼原理？',
            options: ['溶解', '凝固', '沉澱', '過濾'],
            correctAnswer: 0,
            explanation: '鹽溶解在湯裡，讓整鍋湯都有鹹味。',
            funFact: '記得要攪拌，不然鹽巴會沉在鍋底喔！🥣'
        },
        {
            id: 87,
            category: '廚房裡的科學',
            question: '下列哪個因素「不會」影響溶解的速度？',
            options: ['水溫高低', '攪拌與否', '杯子的顏色', '顆粒大小'],
            correctAnswer: 2,
            explanation: '杯子的外觀跟溶解速度無關，這是實驗中的「無關變因」。',
            funFact: '科學實驗要公平，無關的因素不要管它！🧪'
        },
        {
            id: 88,
            category: '廚房裡的科學',
            question: '胡椒粉灑進湯裡，大部分會浮在上面或沉底，因為？',
            options: ['胡椒粉難溶解於水', '胡椒粉怕熱', '胡椒粉很貴', '鍋子太小'],
            correctAnswer: 0,
            explanation: '胡椒粉通常不溶解，是懸浮在水中。',
            funFact: '所以喝酸辣湯時，最後碗底常會有一堆胡椒粉！🌶️'
        },
        {
            id: 89,
            category: '廚房裡的科學',
            question: '把方糖放入冷水和熱水中，哪一杯先溶解完？',
            options: ['冷水', '熱水', '一樣快', '都不會溶'],
            correctAnswer: 1,
            explanation: '熱水分子運動快，能更快溶解方糖。',
            funFact: '這是「溫度對溶解速度的影響」實驗。🌡️'
        },
        {
            id: 90,
            category: '廚房裡的科學',
            question: '用濾網可以把煮好的珍珠從糖水中撈起來，卻撈不到溶解的糖，為什麼？',
            options: ['濾網破了', '糖溶解後顆粒太小通過濾網', '珍珠比較黏', '糖不想上來'],
            correctAnswer: 1,
            explanation: '溶解的物質分子極小，濾網擋不住；珍珠很大顆所以擋得住。',
            funFact: '這就是「過濾」的原理，只能過濾沒溶解的固體！🧋'
        },
        {
            id: 91,
            category: '廚房裡的科學',
            question: '洗衣服時用洗衣粉，為什麼要先用水攪一攪？',
            options: ['好玩', '幫助洗衣粉溶解', '產生泡沫才洗得乾淨', '讓水變香'],
            correctAnswer: 1,
            explanation: '溶解後的洗衣劑才能均勻滲透到衣服纖維裡清潔。',
            funFact: '冬天水太冷洗衣粉不易溶，有時會殘留在衣服上喔！👕'
        },
        {
            id: 92,
            category: '廚房裡的科學',
            question: '比較砂糖和食鹽的溶解量時，每次加的量應該？',
            options: ['隨便加', '固定一平匙', '一次加整包', '看心情'],
            correctAnswer: 1,
            explanation: '實驗要公平，每次加入的量要固定（定量）才能比較。',
            funFact: '通常食鹽和砂糖，砂糖在水中的溶解量比較大喔！⚖️'
        },
        {
            id: 93,
            category: '廚房裡的科學',
            question: '把麵粉加入水中攪拌，水變成白白糊糊的，靜置後沉在底部，這叫？',
            options: ['完全溶解', '沒有完全溶解（沉澱）', '蒸發', '結冰'],
            correctAnswer: 1,
            explanation: '麵粉不溶於水，久了會沉澱。',
            funFact: '太白粉水勾芡也是類似原理，加熱後會變透明黏稠！🥟'
        },
        {
            id: 94,
            category: '廚房裡的科學',
            question: '沖泡奶粉時，如果結塊泡不開，最好的解決方法是？',
            options: ['加冰塊', '用筷子快速攪拌並用熱一點的水', '把奶粉倒掉', '對它吹氣'],
            correctAnswer: 1,
            explanation: '攪拌和加熱能打散結塊，加速溶解。',
            funFact: '奶粉其實是膠體溶液，但在國小階段視為溶解的一種應用。🍼'
        },
        {
            id: 95,
            category: '廚房裡的科學',
            question: '汽水裡面有冒泡泡，是因為什麼氣體溶解在糖水裡？',
            options: ['氧氣', '氮氣', '二氧化碳', '氫氣'],
            correctAnswer: 2,
            explanation: '加壓讓二氧化碳溶入糖水，打開時冒泡泡就是氣體跑出來。',
            funFact: '搖晃汽水會讓氣體瞬間跑出來，噴得到處都是！🥤'
        },
        {
            id: 96,
            category: '廚房裡的科學',
            question: '把紅糖（黑糖）拿去溶解，水變成褐色的，它是溶解了嗎？',
            options: ['沒有，因為水變色了', '有，雖然變色但還是透明的', '變成泥巴水', '不知道'],
            correctAnswer: 1,
            explanation: '紅糖含色素，溶解後水有顏色但仍透明，這也是溶解。',
            funFact: '只要看不見顆粒且均勻分布，就算溶解喔！🟤'
        },
        {
            id: 97,
            category: '廚房裡的科學',
            question: '如果杯底還有沒溶完的鹽巴，再加水進去，底下的鹽巴可能會？',
            options: ['繼續溶解', '變得更硬', '變成石頭', '跑出來'],
            correctAnswer: 0,
            explanation: '增加水量（溶劑），可以溶解更多的鹽巴。',
            funFact: '就像公車加開一班，就能載更多乘客（鹽巴）！🚌'
        },
        {
            id: 98,
            category: '廚房裡的科學',
            question: '做實驗時，為什麼不能用嘴巴嚐嚐看不明的白粉末？',
            options: ['因為不好吃', '因為可能有毒或危險', '因為老師會生氣', '因為會變胖'],
            correctAnswer: 1,
            explanation: '實驗室安全第一條：絕對不可食用實驗藥品。',
            funFact: '如果是廚房裡的糖或鹽，在大人確認下才可以試吃喔！😱'
        },
        {
            id: 99,
            category: '廚房裡的科學',
            question: '蜂蜜加入冰水中，沉在底下不動，這時候該怎麼辦？',
            options: ['大力攪拌', '加鹽巴', '放進冷凍庫', '放棄'],
            correctAnswer: 0,
            explanation: '蜂蜜黏稠度高且冰水溶解慢，需要攪拌幫助擴散。',
            funFact: '其實蜂蜜用溫水泡最好喝，太熱會破壞營養喔！🐝'
        },
        {
            id: 100,
            category: '廚房裡的科學',
            question: '我們說「水是萬能溶劑」，是因為？',
            options: ['水很便宜', '水可以溶解很多種物質', '水可以喝', '水是透明的'],
            correctAnswer: 1,
            explanation: '生活中有非常多東西都能溶於水，所以這樣稱呼。',
            funFact: '但水也不是真的萬能，像油它就溶不了！💧'
        }
   

]

// 根據分類獲取題目
export function getQuestionsByCategory(category) {
  return QUESTIONS.filter(q => q.category === category)
}

// 根據答題歷史調整題目出現概率
function getQuestionWeight(questionId, history) {
  if (!history || !history[questionId]) {
    return 1.0 // 未答過的題目正常權重
  }
  
  const record = history[questionId]
  const accuracy = record.total > 0 ? record.correct / record.total : 1.0
  
  // 答錯的題目有60%的重複出現率（權重設為6.0，更容易被選中）
  if (record.wrong > 0) {
    return 6.0
  }
  
  // 答對的題目只有10%的重複出現率（權重設為0.1，更不容易被選中）
  if (accuracy >= 0.8 && record.correct > 0) {
    return 0.1
  }
  
  // 其他情況正常權重
  return 1.0
}

// 隨機獲取題目（考慮答題歷史）
export function getRandomQuestions(count = 10, history = null) {
  // 如果沒有歷史記錄，使用簡單隨機
  if (!history) {
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(count, QUESTIONS.length))
  }
  
  // 根據權重選擇題目
  const weightedQuestions = QUESTIONS.map(q => ({
    question: q,
    weight: getQuestionWeight(q.id, history)
  }))
  
  // 計算總權重
  const totalWeight = weightedQuestions.reduce((sum, item) => sum + item.weight, 0)
  
  // 根據權重隨機選擇
  const selected = []
  const available = [...weightedQuestions]
  
  while (selected.length < count && available.length > 0) {
    let random = Math.random() * totalWeight
    let currentWeight = 0
    
    for (let i = 0; i < available.length; i++) {
      currentWeight += available[i].weight
      if (random <= currentWeight) {
        selected.push(available[i].question)
        totalWeight -= available[i].weight
        available.splice(i, 1)
        break
      }
    }
  }
  
  // 如果選出的題目不夠，用隨機填充
  if (selected.length < count) {
    const remaining = QUESTIONS.filter(q => !selected.find(s => s.id === q.id))
    const shuffled = remaining.sort(() => Math.random() - 0.5)
    selected.push(...shuffled.slice(0, count - selected.length))
  }
  
  return selected
}

// 獲取所有分類（從實際題目中提取）
export function getAllCategories() {
  const categories = new Set()
  QUESTIONS.forEach(q => {
    if (q.category) {
      categories.add(q.category)
    }
  })
  return Array.from(categories)
}

