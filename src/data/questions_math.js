// 國小三年級數學題目數據庫
// 您可以在此文件中添加、修改或刪除題目

export const CATEGORIES = {
  NUMBERS: '10000以內的數',
  ADDITION_SUBTRACTION: '四位數的加減',
  MULTIPLICATION: '乘法',
  DIVISION: '除法',
  ANGLE: '角',
  MILLIMETER: '毫米',
  AREA: '面積',
  VOLUME: '公升和毫升',
  FRACTION: '分數'
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
    category: '10000以內的數',
    question: '10 個一千合起來是多少？',
    options: ['1000', '10000', '100', '5000'],
    correctAnswer: 1,
    explanation: '10 個 1000 就是 10000（一萬）。',
    funFact: '「萬」是我們學到的第一個五位數單位。'
  },
  {
    id: 2,
    category: '10000以內的數',
    question: '「六千零五」寫成阿拉伯數字是？',
    options: ['605', '6005', '6050', '6500'],
    correctAnswer: 1,
    explanation: '千位是6，百位和十位都是0，個位是5，寫作 6005。',
    funFact: '數字中間不管有幾個零，讀的時候通常只讀一個「零」。'
  },
  {
    id: 3,
    category: '毫米',
    question: '尺上最小的一小格通常代表多長？',
    options: ['1 公分', '1 毫米', '1 公尺', '1 奈米'],
    correctAnswer: 1,
    explanation: '直尺上最小的刻度單位是 1 毫米 (mm)。',
    funFact: '10 個 1 毫米合起來就是 1 公分。'
  },
  {
    id: 4,
    category: '四位數的加減',
    question: '計算 2500 + 400 = ?',
    options: ['2900', '6500', '2100', '3000'],
    correctAnswer: 0,
    explanation: '5 個百加 4 個百是 9 個百，所以是 2900。',
    funFact: '這是不進位的加法，心算就能完成。'
  },
  {
    id: 5,
    category: '角',
    question: '一個角有幾個頂點？',
    options: ['1 個', '2 個', '3 個', '0 個'],
    correctAnswer: 0,
    explanation: '角是由一個頂點和兩條邊組成的。',
    funFact: '頂點就是兩條邊相接那個尖尖的地方。'
  },
  {
    id: 6,
    category: '乘法',
    question: '300 × 3 = ?',
    options: ['600', '900', '90', '9000'],
    correctAnswer: 1,
    explanation: '3 × 3 = 9，後面補兩個 0，是 900。',
    funFact: '乘法表背熟，幾百幾千的乘法都難不倒你。'
  },
  {
    id: 7,
    category: '10000以內的數',
    question: '在數線上，越往右邊的數字通常？',
    options: ['越小', '越大', '不一定', '一樣大'],
    correctAnswer: 1,
    explanation: '數線上的數，右邊的比左邊的大。',
    funFact: '數線就像一把無限長的尺。'
  },
  {
    id: 8,
    category: '毫米',
    question: '5 公分 8 毫米等於幾毫米？',
    options: ['58 毫米', '508 毫米', '13 毫米', '580 毫米'],
    correctAnswer: 0,
    explanation: '5 公分 = 50 毫米，50 + 8 = 58。',
    funFact: '毫米的英文是 millimeter，簡寫 mm。'
  },
  {
    id: 9,
    category: '四位數的加減',
    question: '這學期圖書館買了 1200 本新書，舊書捐出 200 本，現在多了幾本書？',
    options: ['1400 本', '1000 本', '1200 本', '200 本'],
    correctAnswer: 1,
    explanation: '1200 - 200 = 1000。（題目問淨增加量，即現在比原來多了多少，其實是算差額，或者理解為現有增量。若理解為現有藏書變化量：進1200出200，淨增1000）',
    funFact: '捐書可以分享知識，是一件很棒的事！'
  },
  {
    id: 10,
    category: '角',
    question: '正方形的四個角都是什麼角？',
    options: ['銳角', '鈍角', '直角', '平角'],
    correctAnswer: 2,
    explanation: '正方形和長方形的四個角都是 90 度的直角。',
    funFact: '如果四邊相等但角不是直角，那個圖形叫菱形。'
  },
  {
    id: 11,
    category: '10000以內的數',
    question: '比 9999 多 1 的數是？',
    options: ['9998', '10000', '10001', '9000'],
    correctAnswer: 1,
    explanation: '9999 + 1 會產生連續進位，變成 10000。',
    funFact: '這是四位數變成五位數的關鍵時刻。'
  },
  {
    id: 12,
    category: '乘法',
    question: '24 × 2 = ?',
    options: ['48', '46', '28', '84'],
    correctAnswer: 0,
    explanation: '個位 4×2=8，十位 20×2=40，合起來 48。',
    funFact: '這是不進位的二位數乘法。'
  },
  {
    id: 13,
    category: '毫米',
    question: '70 毫米是幾公分？',
    options: ['7 公分', '700 公分', '0.7 公分', '70 公分'],
    correctAnswer: 0,
    explanation: '10 毫米 = 1 公分，70 ÷ 10 = 7。',
    funFact: '用公分量身高，用毫米量小蟲子。'
  },
  {
    id: 14,
    category: '四位數的加減',
    question: '估算 498 + 302 大約是多少？',
    options: ['700', '800', '900', '600'],
    correctAnswer: 1,
    explanation: '498 接近 500，302 接近 300，500 + 300 = 800。',
    funFact: '估算在買東西時超好用，可以快速知道錢帶得夠不夠。'
  },
  {
    id: 15,
    category: '角',
    question: '比直角小的角，我們稱為什麼角？',
    options: ['鈍角', '銳角', '平角', '周角'],
    correctAnswer: 1,
    explanation: '銳角就是尖尖的角，小於 90 度。',
    funFact: '「銳」就是鋒利的意思，像針尖一樣。'
  },
  {
    id: 16,
    category: '乘法',
    question: '405 × 2 = ?',
    options: ['810', '800', '850', '8010'],
    correctAnswer: 0,
    explanation: '2×5=10(寫0進1)，2×0=0，0+1=1，2×4=8。答案 810。',
    funFact: '中間有 0 的乘法，進位的 1 要記得加上去，不能只寫 0 喔！'
  },
  {
    id: 17,
    category: '10000以內的數',
    question: '按照順序：3500、3600、( )、3800。括號中應填？',
    options: ['3700', '3650', '3900', '3750'],
    correctAnswer: 0,
    explanation: '規律是每次加 100。3600 + 100 = 3700。',
    funFact: '這是在練習百位的變化。'
  },
  {
    id: 18,
    category: '毫米',
    question: '一本數學課本的厚度大約是 6 ( )？',
    options: ['公尺', '公分', '毫米', '公里'],
    correctAnswer: 2,
    explanation: '6 公分太厚，6 毫米比較合理。',
    funFact: '填單位時要想像實際的長度大小。'
  },
  {
    id: 19,
    category: '四位數的加減',
    question: '3000 - 1500 = ?',
    options: ['2500', '1500', '1000', '2000'],
    correctAnswer: 1,
    explanation: '3000 減掉一半 1500，剩下 1500。',
    funFact: '整數減法可以想成錢的計算，30 張一百減 15 張一百。'
  },
  {
    id: 20,
    category: '角',
    question: '比直角大的角（但比平角小），稱為什麼角？',
    options: ['銳角', '鈍角', '直角', '周角'],
    correctAnswer: 1,
    explanation: '大於 90 度且小於 180 度的角是鈍角。',
    funFact: '「鈍」就是不尖的意思，感覺鈍鈍的。'
  },
  {
    id: 21,
    category: '乘法',
    question: '一輛三輪車有 3 個輪子，25 輛三輪車共有幾個輪子？',
    options: ['75 個', '65 個', '55 個', '85 個'],
    correctAnswer: 0,
    explanation: '25 × 3 = 75。3×5=15(進1)，3×2=6，6+1=7。',
    funFact: '三輪車以前是重要的交通工具呢！'
  },
  {
    id: 22,
    category: '10000以內的數',
    question: '用 1、0、9、5 四張卡片排出的「最大」四位數是？',
    options: ['9510', '9501', '1059', '9150'],
    correctAnswer: 0,
    explanation: '要最大，千位要放最大的 9，接著百位放 5，十位放 1，個位放 0。',
    funFact: '位數越前面的數字越大，數值就越大。'
  },
  {
    id: 23,
    category: '毫米',
    question: '哪一個長度最長？',
    options: ['4 公分', '39 毫米', '41 毫米', '2 公分 9 毫米'],
    correctAnswer: 2,
    explanation: '全部換成毫米：A=40, B=39, C=41, D=29。41 毫米最長。',
    funFact: '比較長度一定要先換成同單位。'
  },
  {
    id: 24,
    category: '四位數的加減',
    question: '驗算 2000 - 800 = 1200，可以用哪個算式？',
    options: ['1200 + 800', '1200 - 800', '2000 + 1200', '2000 + 800'],
    correctAnswer: 0,
    explanation: '差 (1200) + 減數 (800) = 被減數 (2000)。',
    funFact: '驗算就像倒帶檢查，確保沒算錯。'
  },
  {
    id: 25,
    category: '角',
    question: '要畫出一個直角，最好使用什麼工具？',
    options: ['三角板', '手隨便畫', '圓規', '直尺的一邊(如果不確定直不直)'],
    correctAnswer: 0,
    explanation: '三角板上有現成的直角可以直接描。',
    funFact: '課本也教過可以用摺紙（對摺再對摺）摺出直角。'
  },
  {
    id: 26,
    category: '乘法',
    question: '0 乘以任何數，結果都是？',
    options: ['0', '1', '那個數', '無限大'],
    correctAnswer: 0,
    explanation: '0 乘任何數都等於 0。',
    funFact: '0 是乘法中的黑洞！'
  },
  {
    id: 27,
    category: '10000以內的數',
    question: '3 個千、4 個百、5 個十和 0 個一合起來是？',
    options: ['3450', '3405', '3045', '3540'],
    correctAnswer: 0,
    explanation: '依照千、百、十、個位順序填入，是 3450。',
    funFact: '如果沒有說個位，通常預設也是 0。'
  },
  {
    id: 28,
    category: '毫米',
    question: '20 公分 5 毫米 - 15 毫米 = ?',
    options: ['19 公分', '20 公分', '190 毫米', '200 毫米'],
    correctAnswer: 0,
    explanation: '20 公分 5 毫米 = 205 毫米。205 - 15 = 190 毫米。190 毫米 = 19 公分。',
    funFact: '計算長度減法時，換成小單位計算比較不容易出錯。'
  },
  {
    id: 29,
    category: '四位數的加減',
    question: '甲數是 1500，乙數比甲數少 300，乙數是多少？',
    options: ['1200', '1800', '1300', '1100'],
    correctAnswer: 0,
    explanation: '「少」就是減。1500 - 300 = 1200。',
    funFact: '看清楚題目是「比...多」還是「比...少」。'
  },
  {
    id: 30,
    category: '角',
    question: '長方形的對邊有什麼特性？',
    options: ['一樣長', '不一樣長', '一邊長一邊短', '不一定'],
    correctAnswer: 0,
    explanation: '長方形的上下兩邊一樣長，左右兩邊一樣長（對邊等長）。',
    funFact: '正方形則是四個邊都一樣長。'
  },
  {
    id: 31,
    category: '乘法',
    question: '125 × 8 = ?',
    options: ['1000', '800', '900', '1200'],
    correctAnswer: 0,
    explanation: '8×5=40(進4)，8×2=16，16+4=20(進2)，8×1=8，8+2=10。答案 1000。',
    funFact: '125 × 8 = 1000 是一個很特別的數字組合，記起來很好用。'
  },
  {
    id: 32,
    category: '10000以內的數',
    question: '「一萬元」這張鈔票上寫了幾個 0？',
    options: ['3 個', '4 個', '5 個', '2 個'],
    correctAnswer: 1,
    explanation: '10000，後面有 4 個 0。',
    funFact: '雖然台灣流通貨幣最大只有 2000 元，但數學上我們要學到萬。'
  },
  {
    id: 33,
    category: '毫米',
    question: '一隻螞蟻長約 4 ( )？',
    options: ['毫米', '公分', '公尺', '公里'],
    correctAnswer: 0,
    explanation: '螞蟻很小，用毫米最適合。4 公分就是巨型螞蟻了！',
    funFact: '選對單位能讓我們更精確描述物體。'
  },
  {
    id: 34,
    category: '四位數的加減',
    question: '遊樂場昨天進場 3245 人，今天進場 4100 人，兩天大約共幾人？（估算）',
    options: ['7300', '7000', '8000', '6000'],
    correctAnswer: 0,
    explanation: '3245 約 3200 或 3000，4100 約 4100 或 4000。3200+4100=7300。',
    funFact: '估算是為了快速抓個大概。'
  },
  {
    id: 35,
    category: '角',
    question: '把一張正方形色紙對摺變成三角形，這個三角形的一個角原本是正方形的角，它是什麼角？',
    options: ['直角', '銳角', '鈍角', '平角'],
    correctAnswer: 0,
    explanation: '正方形的角是直角，對摺後如果不去剪它，那個角還是直角。',
    funFact: '等腰直角三角形就是這樣來的。'
  },
  {
    id: 36,
    category: '乘法',
    question: '一包糖果有 8 顆，老師買了 30 包，共有幾顆？',
    options: ['240 顆', '24 顆', '38 顆', '210 顆'],
    correctAnswer: 0,
    explanation: '30 × 8 = 240。先算 3×8=24，再補 0。',
    funFact: '分送糖果時，乘法幫了大忙。'
  },
  {
    id: 37,
    category: '10000以內的數',
    question: '2500, 2600, 2700, ( ), 2900。空白處是？',
    options: ['2750', '2800', '2850', '2790'],
    correctAnswer: 1,
    explanation: '這是百數的數列，2700 下一個是 2800。',
    funFact: '數數不一定要 1 個 1 個數，也可以 100 個 100 個數。'
  },
  {
    id: 38,
    category: '毫米',
    question: '102 毫米大約是幾公分？',
    options: ['1 公分', '10 公分', '100 公分', '12 公分'],
    correctAnswer: 1,
    explanation: '102 毫米 = 10 公分 2 毫米，大約是 10 公分。',
    funFact: '這就是「長度的估測」。'
  },
  {
    id: 39,
    category: '四位數的加減',
    question: '皮鞋一雙 1299 元，球鞋一雙 2150 元，球鞋比皮鞋貴多少？',
    options: ['851 元', '951 元', '1151 元', '800 元'],
    correctAnswer: 0,
    explanation: '2150 - 1299。也可以想成 2150 - 1300 + 1。2150-1300=850，850+1=851。',
    funFact: '減 1299 可以看成減 1300 再加回 1，這樣算更快。'
  },
  {
    id: 40,
    category: '角',
    question: '比較角的大小，主要是看？',
    options: ['邊的長短', '頂點的尖度', '兩邊張開的大小', '畫在紙上的位置'],
    correctAnswer: 2,
    explanation: '角的大小由兩邊張開的程度決定。',
    funFact: '張得越開，角就越大。'
  },
  {
    id: 41,
    category: '乘法',
    question: '600 × 5 = ?',
    options: ['3000', '300', '3500', '30000'],
    correctAnswer: 0,
    explanation: '6 × 5 = 30，後面補兩個 0，是 3000。',
    funFact: '這題也是容易少寫一個 0 的陷阱題。'
  },
  {
    id: 42,
    category: '10000以內的數',
    question: '哪個數的千位數字是 7？',
    options: ['742', '4720', '2470', '7024'],
    correctAnswer: 3,
    explanation: '7024 的千位是 7。A沒有千位，B千位是4，C千位是2。',
    funFact: '找位值要從右邊個、十、百、千數過來。'
  },
  {
    id: 43,
    category: '毫米',
    question: '從刻度 3 到刻度 8 (單位:公分) 的長度，換算成毫米是多少？',
    options: ['5 毫米', '50 毫米', '80 毫米', '30 毫米'],
    correctAnswer: 1,
    explanation: '8 - 3 = 5 公分，5 公分 = 50 毫米。',
    funFact: '測量不一定要從 0 開始，相減也可以算出長度。'
  },
  {
    id: 44,
    category: '四位數的加減',
    question: '299 + 399 = ?',
    options: ['698', '598', '798', '600'],
    correctAnswer: 0,
    explanation: '可以看成 (300-1) + (400-1) = 700 - 2 = 698。',
    funFact: '接近整百的數，用補數法計算很快。'
  },
  {
    id: 45,
    category: '角',
    question: '下列哪一個物品上最容易找到直角？',
    options: ['圓形時鐘', '課本的角', '雨傘尖端', '湯匙'],
    correctAnswer: 1,
    explanation: '課本是長方形，四個角都是直角。',
    funFact: '生活中的桌子、門窗、磁磚大都有直角。'
  },
  {
    id: 46,
    category: '乘法',
    question: '一支筆 15 元，買 6 支要付多少錢？',
    options: ['90 元', '80 元', '60 元', '75 元'],
    correctAnswer: 0,
    explanation: '15 × 6 = 90。6×5=30，6×1=6，6+3=9。',
    funFact: '買文具是小學生最常用到乘法的時候。'
  },
  {
    id: 47,
    category: '10000以內的數',
    question: '四千五百寫作？',
    options: ['4050', '4500', '4005', '4505'],
    correctAnswer: 1,
    explanation: '4500。千位4，百位5，其他補0。',
    funFact: '寫數字時，沒唸到的位數通常就是 0。'
  },
  {
    id: 48,
    category: '毫米',
    question: '自動鉛筆芯 0.5 mm，這裡的 mm 是什麼意思？',
    options: ['公分', '毫米', '公尺', '公里'],
    correctAnswer: 1,
    explanation: 'mm 是 millimeter 的縮寫，意思是毫米。',
    funFact: 'cm 是公分，m 是公尺，km 是公里。'
  },
  {
    id: 49,
    category: '四位數的加減',
    question: '小明存款 3000 元，領出 1000 元買禮物，還剩多少？',
    options: ['4000', '2000', '1000', '3000'],
    correctAnswer: 1,
    explanation: '3000 - 1000 = 2000。',
    funFact: '簡單的整千減法。'
  },
  {
    id: 50,
    category: '乘法',
    question: '一個正方形有 4 個角，5 個正方形共有幾個角？',
    options: ['9 個', '20 個', '16 個', '25 個'],
    correctAnswer: 1,
    explanation: '4 × 5 = 20。',
    funFact: '這題是乘法在幾何圖形數量的應用。'
  },
  {
    id: 51,
    category: '面積',
    question: '邊長 1 公分的正方形，它的面積是多少？',
    options: ['1 公分', '1 平方公分', '10 公分', '4 公分'],
    correctAnswer: 1,
    explanation: '邊長 1 公分的正方形，面積定義為 1 平方公分。',
    funFact: '平方公分的符號是 cm²，那個小小的 2 代表二維平面喔。'
  },
  {
    id: 52,
    category: '除法',
    question: '14 ÷ 2 = ?',
    options: ['6', '7', '8', '28'],
    correctAnswer: 1,
    explanation: '用乘法想：2 × 7 = 14，所以 14 ÷ 2 = 7。',
    funFact: '除法就是「平分」的意思，把 14 顆糖平分給 2 人，每人拿 7 顆。'
  },
  {
    id: 53,
    category: '公升和毫升',
    question: '1 公升等於多少毫升？',
    options: ['10 毫升', '100 毫升', '1000 毫升', '10000 毫升'],
    correctAnswer: 2,
    explanation: '公升與毫升的進率是 1000。1 l = 1000 ml。',
    funFact: '一瓶大的牛奶通常就是 1 公升或 2 公升。'
  },
  {
    id: 54,
    category: '分數',
    question: '一個披薩平分成 8 片，吃了 1 片，是吃了多少個披薩？',
    options: ['1 個', '8 個', '八分之一 個', '一分之八 個'],
    correctAnswer: 2,
    explanation: '平分成 8 份取 1 份，記作 1/8（八分之一）。',
    funFact: '分數的下面那個數字叫「分母」，表示一共切成幾塊。'
  },
  {
    id: 55,
    category: '除法',
    question: '下列哪一個數是「偶數」？',
    options: ['13', '25', '30', '41'],
    correctAnswer: 2,
    explanation: '個位數是 0, 2, 4, 6, 8 的數是偶數。30 的個位是 0，所以是偶數。',
    funFact: '偶數通常可以被 2 整除，奇數則不能。'
  },
  {
    id: 56,
    category: '面積',
    question: '數數看，如果一個圖形蓋住了 6 個 1 平方公分的格子，它的面積是？',
    options: ['6 公分', '6 平方公分', '12 公分', '36 平方公分'],
    correctAnswer: 1,
    explanation: '有幾個 1 平方公分的格子，面積就是幾平方公分。',
    funFact: '用格子點算面積是最基礎的測量方法。'
  },
  {
    id: 57,
    category: '除法',
    question: '25 ÷ 4 = 6 ... 1，算式中的「1」叫做什麼？',
    options: ['被除數', '除數', '商', '餘數'],
    correctAnswer: 3,
    explanation: '分不完剩下的數叫做餘數。',
    funFact: '餘數一定要比除數小，不然就代表還可以再分喔！'
  },
  {
    id: 58,
    category: '公升和毫升',
    question: '養樂多一瓶大約是 100 ( )？',
    options: ['公升', '毫升', '公克', '公分'],
    correctAnswer: 1,
    explanation: '養樂多很小瓶，用毫升 (ml) 當單位。100 公升會是超大桶！',
    funFact: 'ml 是 milliliter，l 是 liter。'
  },
  {
    id: 59,
    category: '分數',
    question: '「十分之三」寫成分數是？',
    options: ['3/10', '10/3', '310', '13'],
    correctAnswer: 0,
    explanation: '讀分數時，先讀分母再讀分子，寫的時候分母在下，分子在上。',
    funFact: '中間那條橫線叫做「分號」。'
  },
  {
    id: 60,
    category: '除法',
    question: '驗算除法「20 ÷ 6 = 3 ... 2」是否正確，可以用哪個算式？',
    options: ['6 × 3 + 2', '6 × 2 + 3', '20 - 2', '3 × 2 + 6'],
    correctAnswer: 0,
    explanation: '驗算公式：除數 × 商 + 餘數 = 被除數。6 × 3 + 2 = 20。',
    funFact: '這就像把分出去的東西收回來，再加上剩下的，要等於原本的數量。'
  },
  {
    id: 61,
    category: '面積',
    question: '下列關於「面積」和「周長」的說法，何者正確？',
    options: ['面積是算邊邊有多長', '周長是算面有多大', '面積單位通常有「平方」', '周長單位通常有「平方」'],
    correctAnswer: 2,
    explanation: '面積是面的大小（平方單位），周長是邊框的長度（長度單位）。',
    funFact: '同樣周長的圖形，面積不一定一樣大喔！'
  },
  {
    id: 62,
    category: '除法',
    question: '一包糖果有 30 顆，平分給 5 個人，每人可以分到幾顆？',
    options: ['5 顆', '6 顆', '150 顆', '25 顆'],
    correctAnswer: 1,
    explanation: '30 ÷ 5 = 6。',
    funFact: '背熟九九乘法表，除法就會變得很簡單。'
  },
  {
    id: 63,
    category: '公升和毫升',
    question: '2 公升 500 毫升 = ? 毫升',
    options: ['250 毫升', '2005 毫升', '2500 毫升', '502 毫升'],
    correctAnswer: 2,
    explanation: '2 公升 = 2000 毫升，2000 + 500 = 2500。',
    funFact: '這大概是大罐可樂的容量（2000ml）再多一點點。'
  },
  {
    id: 64,
    category: '分數',
    question: '在分數 5/8 中，分母是哪一個數字？',
    options: ['5', '8', '13', '3'],
    correctAnswer: 1,
    explanation: '下面的數字是分母，上面的數字是分子。所以分母是 8。',
    funFact: '可以記「媽媽背著孩子」，媽媽（分母）在下面，孩子（分子）在上面。'
  },
  {
    id: 65,
    category: '除法',
    question: '除法算式中，餘數能不能比除數大？',
    options: ['可以', '不可以', '有時候可以', '不一定'],
    correctAnswer: 1,
    explanation: '餘數一定要比除數小。如果餘數比除數大，代表還可以再分一次。',
    funFact: '這是除法運算最重要的規則之一！'
  },
  {
    id: 66,
    category: '面積',
    question: '甲圖形由 5 個 1 平方公分積木組成，乙圖形由 6 個 1 平方公分積木組成，誰的面積大？',
    options: ['甲', '乙', '一樣大', '無法比較'],
    correctAnswer: 1,
    explanation: '乙有 6 個單位面積，甲只有 5 個，所以乙比較大。',
    funFact: '面積大小就是看誰佔的「格子」比較多。'
  },
  {
    id: 67,
    category: '除法',
    question: '奇數加奇數，答案會是什麼數？（例如 3+5）',
    options: ['奇數', '偶數', '不一定', '0'],
    correctAnswer: 1,
    explanation: '3+5=8 (偶數)，1+1=2 (偶數)。兩個奇數相加一定是偶數。',
    funFact: '因為多出來的那個 1 和另一個多出來的 1 剛好配成一對。'
  },
  {
    id: 68,
    category: '公升和毫升',
    question: '媽媽買了 3000 毫升的沙拉油，也就是買了幾公升？',
    options: ['3 公升', '30 公升', '300 公升', '0.3 公升'],
    correctAnswer: 0,
    explanation: '1000 毫升 = 1 公升，3000 ÷ 1000 = 3。',
    funFact: '大桶的沙拉油或水通常都用公升計算。'
  },
  {
    id: 69,
    category: '分數',
    question: '比較大小：1/5 和 1/8，哪一個比較大？',
    options: ['1/5', '1/8', '一樣大', '無法比較'],
    correctAnswer: 0,
    explanation: '分子都是 1 時，分母越小代表切得越少份，每一份就越大。',
    funFact: '想像一個披薩切成 5 塊和切成 8 塊，切 5 塊的每一塊當然比較大！'
  },
  {
    id: 70,
    category: '除法',
    question: '48 ÷ 6 = ?',
    options: ['6', '7', '8', '9'],
    correctAnswer: 2,
    explanation: '6 × 8 = 48，所以 48 ÷ 6 = 8。',
    funFact: '這是整除的情況，餘數是 0。'
  },
  {
    id: 71,
    category: '面積',
    question: '1 平方公分可以簡寫成？',
    options: ['1 cm', '1 cm²', '1 m', '1 g'],
    correctAnswer: 1,
    explanation: 'cm 是長度，cm² 是面積。',
    funFact: '右上角的 2 讀作 square (平方)。'
  },
  {
    id: 72,
    category: '除法',
    question: '下列哪一個數是「奇數」？',
    options: ['20', '34', '58', '97'],
    correctAnswer: 3,
    explanation: '個位是 1, 3, 5, 7, 9 的數是奇數。97 的個位是 7，所以是奇數。',
    funFact: '奇數除以 2 一定會有餘數 1。'
  },
  {
    id: 73,
    category: '公升和毫升',
    question: '一瓶果汁 1 公升 200 毫升，喝掉 500 毫升後，還剩多少？',
    options: ['700 毫升', '1700 毫升', '500 毫升', '1 公升'],
    correctAnswer: 0,
    explanation: '1 公升 200 毫升 = 1200 毫升。1200 - 500 = 700 毫升。',
    funFact: '計算容量減法時，不夠減要記得退位（1 公升換成 1000 毫升）。'
  },
  {
    id: 74,
    category: '分數',
    question: '一條繩子平分成 4 段，其中的 3 段是幾分之幾條繩子？',
    options: ['1/4', '3/4', '4/3', '3/1'],
    correctAnswer: 1,
    explanation: '分母是 4（總共 4 段），分子是 3（取 3 段），所以是 3/4。',
    funFact: '讀作「四分之三」。'
  },
  {
    id: 75,
    category: '除法',
    question: '老師有 50 枝筆，每 8 枝裝一盒，最多可以裝滿幾盒？還剩幾枝？',
    options: ['6 盒，剩 2 枝', '5 盒，剩 10 枝', '7 盒，剩 4 枝', '6 盒，剩 0 枝'],
    correctAnswer: 0,
    explanation: '50 ÷ 8 = 6 ... 2。',
    funFact: '剩下的 2 枝不夠裝一盒，所以只能算餘數。'
  },
  {
    id: 76,
    category: '面積',
    question: '測量郵票的大小，適合用什麼單位？',
    options: ['平方公分', '平方公尺', '公尺', '公里'],
    correctAnswer: 0,
    explanation: '郵票很小，適合用平方公分。',
    funFact: '如果是測量教室地板，就要用「平方公尺」了。'
  },
  {
    id: 77,
    category: '除法',
    question: '7 ÷ 1 = ?',
    options: ['1', '7', '0', '6'],
    correctAnswer: 1,
    explanation: '任何數除以 1，答案還是它自己。',
    funFact: '把 7 顆糖分給 1 個人，那個人獨得所有糖果。'
  },
  {
    id: 78,
    category: '公升和毫升',
    question: '水桶裡有 5 公升的水，倒進去 2000 毫升，現在共有幾公升？',
    options: ['6 公升', '7 公升', '2005 公升', '52 公升'],
    correctAnswer: 1,
    explanation: '2000 毫升 = 2 公升。5 + 2 = 7 公升。',
    funFact: '加法計算要先把單位換算成一樣的喔！'
  },
  {
    id: 79,
    category: '分數',
    question: '比較大小：7/10 和 4/10，哪一個比較大？',
    options: ['7/10', '4/10', '一樣大', '無法比較'],
    correctAnswer: 0,
    explanation: '分母相同時，分子越大，分數就越大。7 比 4 大。',
    funFact: '切同樣大小的塊數，拿 7 塊當然比拿 4 塊多。'
  },
  {
    id: 80,
    category: '除法',
    question: '0 除以任何數（0除外），答案都是？',
    options: ['0', '1', '那個數', '無限大'],
    correctAnswer: 0,
    explanation: '0 顆糖分給 5 個人，每個人還是分到 0 顆。',
    funFact: '但是「除數」不能是 0 喔（例如 5 ÷ 0 是無意義的）。'
  },
  {
    id: 81,
    category: '面積',
    question: '拼拼看，兩個邊長 1 公分的正方形拼在一起，面積是多少？',
    options: ['1 平方公分', '2 平方公分', '3 平方公分', '4 平方公分'],
    correctAnswer: 1,
    explanation: '1 + 1 = 2。面積有可加性。',
    funFact: '不管怎麼拼（橫著拼、豎著拼），面積總和都不變。'
  },
  {
    id: 82,
    category: '除法',
    question: '35 ÷ 5 和 35 ÷ 7，哪一個算出來的商比較大？',
    options: ['35 ÷ 5', '35 ÷ 7', '一樣大', '無法比較'],
    correctAnswer: 0,
    explanation: '35÷5=7，35÷7=5。除數越小，分到的商越大。',
    funFact: '越少人分，每個人分到的就越多。'
  },
  {
    id: 83,
    category: '公升和毫升',
    question: '下列哪個容器的容量大約是 10 公升？',
    options: ['湯匙', '馬克杯', '水桶', '浴缸'],
    correctAnswer: 2,
    explanation: '湯匙、馬克杯太小（毫升級），浴缸太大（幾百公升），水桶大約 10 公升。',
    funFact: '培養量感可以幫助我們估計生活中的物品容量。'
  },
  {
    id: 84,
    category: '分數',
    question: '一個蛋糕切成 6 塊，哥哥吃了 2 塊，弟弟吃了 3 塊，誰吃得比較多？',
    options: ['哥哥', '弟弟', '一樣多', '不知道'],
    correctAnswer: 1,
    explanation: '2/6 比 3/6 小，弟弟吃了 3 塊比較多。',
    funFact: '他們總共吃了 5/6 個蛋糕。'
  },
  {
    id: 85,
    category: '除法',
    question: '除法算式中，被除數 = 除數 × 商 + ( )？',
    options: ['積', '和', '差', '餘數'],
    correctAnswer: 3,
    explanation: '這是除法的驗算公式。',
    funFact: '如果沒有餘數（餘數為0），那就是整除。'
  },
  {
    id: 86,
    category: '面積',
    question: '如果一個長方形長 3 公分、寬 2 公分，它由幾個 1 平方公分組成？',
    options: ['5 個', '6 個', '12 個', '4 個'],
    correctAnswer: 1,
    explanation: '可以畫格子數數看，一排 3 個，有 2 排，共 3 × 2 = 6 個。',
    funFact: '這其實就是長方形面積公式「長 × 寬」的由來。'
  },
  {
    id: 87,
    category: '除法',
    question: '偶數除以 2，餘數一定是多少？',
    options: ['1', '0', '2', '不一定'],
    correctAnswer: 1,
    explanation: '偶數的定義就是可以被 2 整除，所以餘數是 0。',
    funFact: '如果餘數是 1，那就是奇數了。'
  },
  {
    id: 88,
    category: '公升和毫升',
    question: '4005 毫升 = ? 公升 ? 毫升',
    options: ['4 公升 5 毫升', '40 公升 5 毫升', '4 公升 50 毫升', '4 公升 500 毫升'],
    correctAnswer: 0,
    explanation: '4000 毫升是 4 公升，剩下 5 毫升。',
    funFact: '中間的 0 很容易讓人搞混，要小心位值！'
  },
  {
    id: 89,
    category: '分數',
    question: '1 可以寫成幾分之幾？',
    options: ['2/2', '5/5', '10/10', '以上皆可'],
    correctAnswer: 3,
    explanation: '分子和分母一樣大時，數值就是 1（完整的全體）。',
    funFact: '就像一個披薩切 5 塊，你拿了 5 塊，就是拿了 1 個完整的披薩。'
  },
  {
    id: 90,
    category: '除法',
    question: '有 63 個小朋友，每 9 人分一組，可以分幾組？',
    options: ['6 組', '7 組', '8 組', '9 組'],
    correctAnswer: 1,
    explanation: '63 ÷ 9 = 7。',
    funFact: '這題剛好整除，沒有小朋友落單。'
  },
  {
    id: 91,
    category: '面積',
    question: '用方格紙數面積時，如果有不完整的格子怎麼辦？',
    options: ['直接算 1 格', '直接不以計算', '兩個半格湊成 1 格', '用猜的'],
    correctAnswer: 2,
    explanation: '通常我們會嘗試把不完整的格子拼湊起來，或是這階段通常只考完整的格子。但觀念上是拼湊。',
    funFact: '不規則圖形的面積計算比較難，通常會用估算或微積分（長大後學）。'
  },
  {
    id: 92,
    category: '除法',
    question: '80 ÷ 9 = 8 ... 8，這題算對了嗎？',
    options: ['對', '錯，餘數不能等於除數', '錯，商應該是 9', '錯，餘數應該是 0'],
    correctAnswer: 0,
    explanation: '9 × 8 = 72，72 + 8 = 80。且餘數 8 小於除數 9，所以算對了。',
    funFact: '只要檢查餘數 < 除數，且 商 × 除數 + 餘數 = 被除數，就是正確的。'
  },
  {
    id: 93,
    category: '公升和毫升',
    question: '把 2 公升的水倒掉 500 毫升，剩下多少水？',
    options: ['1500 毫升', '150 毫升', '2500 毫升', '500 毫升'],
    correctAnswer: 0,
    explanation: '2000 - 500 = 1500。',
    funFact: '1500 毫升也就是 1 公升 500 毫升。'
  },
  {
    id: 94,
    category: '分數',
    question: '分母是 9，分子是 4 的分數是？',
    options: ['9/4', '4/9', '94', '49'],
    correctAnswer: 1,
    explanation: '分母在下，分子在上，寫作 4/9。',
    funFact: '這是真分數（分子比分母小）。'
  },
  {
    id: 95,
    category: '除法',
    question: '下列哪一個數除以 5 會整除？',
    options: ['21', '33', '45', '52'],
    correctAnswer: 2,
    explanation: '個位數是 0 或 5 的數，一定可以被 5 整除。',
    funFact: '這是 5 的倍數判別法。'
  },
  {
    id: 96,
    category: '面積',
    question: '比較這兩張卡片：A卡片是 3x4 的長方形，B卡片是 2x6 的長方形，誰的面積大？',
    options: ['A大', 'B大', '一樣大', '無法比較'],
    correctAnswer: 2,
    explanation: 'A面積 = 12 格，B面積 = 12 格。所以一樣大。',
    funFact: '形狀不同，面積卻可能一樣大喔！'
  },
  {
    id: 97,
    category: '除法',
    question: '52 ÷ 7 = ?',
    options: ['7 ... 3', '6 ... 10', '7 ... 2', '8 ... 0'],
    correctAnswer: 0,
    explanation: '7 × 7 = 49，52 - 49 = 3。答案 7 餘 3。',
    funFact: '如果背熟乘法表，這題可以用 7x7=49 快速推算。'
  },
  {
    id: 98,
    category: '公升和毫升',
    question: '一瓶牛奶 960 毫升，再加入多少毫升就會變成 1 公升？',
    options: ['40 毫升', '140 毫升', '400 毫升', '4 毫升'],
    correctAnswer: 0,
    explanation: '1 公升 = 1000 毫升。1000 - 960 = 40。',
    funFact: '市售鮮奶常標示 960ml 左右，接近 1 公升但不到。'
  },
  {
    id: 99,
    category: '分數',
    question: '一盒巧克力有 10 顆，弟弟吃了 10 分之 3 盒，是吃了幾顆？',
    options: ['3 顆', '10 顆', '7 顆', '30 顆'],
    correctAnswer: 0,
    explanation: '10 分之 3 盒表示把一盒分成 10 份取 3 份。10 顆分成 10 份，一份是 1 顆，3 份就是 3 顆。',
    funFact: '分數跟除法有很密切的關係喔！'
  },
  {
    id: 100,
    category: '除法',
    question: '最後一題！ 9 ÷ 9 = ?',
    options: ['0', '1', '9', '81'],
    correctAnswer: 1,
    explanation: '任何非 0 的數除以它自己，答案都是 1。',
    funFact: '大家都有份，而且剛好一人一份！'
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

