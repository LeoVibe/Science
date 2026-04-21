export type SubjectTheme = 'chinese' | 'math' | 'english' | 'science' | 'social' | 'life';
export type Publisher = '康軒' | '南一' | '翰林';
export type PublisherKey = 'kanghsuan' | 'nanyi' | 'hanlin';

export interface MockQuestion {
  id: string;
  category: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  commonMisconception?: string;
  scenario?: string;
}

export const SUBJECT_META: Record<SubjectTheme, { name: string; icon: string }> = {
  chinese: { name: '國語', icon: '📖' },
  math: { name: '數學', icon: '➕' },
  english: { name: '英語', icon: '🔤' },
  science: { name: '自然', icon: '🔬' },
  social: { name: '社會', icon: '🏛️' },
  life: { name: '生活', icon: '🌈' },
};

export const PUBLISHER_META: Record<PublisherKey, { name: Publisher }> = {
  kanghsuan: { name: '康軒' },
  nanyi: { name: '南一' },
  hanlin: { name: '翰林' },
};

// 取自 question/platform/G3/Chinese/S2/KangHsuan/G3_S2_CHI_KANGHSUAN_manifest.json 真實課名
export const MOCK_CATEGORIES = [
  '許願',
  '下雨的時候',
  '遇見美如奶奶',
  '工匠之祖',
  '學田鼠開路',
  '神奇密碼',
  '油桐花・五月雪',
  '大自然的美術館',
  '臺灣的山椒魚',
  '漁夫和金魚',
  '聰明的鼠鹿',
  '還要跌幾次',
];

export const MOCK_QUESTIONS: MockQuestion[] = [
  {
    id: 'q1',
    category: '許願',
    scenario: '理解詩歌中的情感表達',
    question: '課文《許願》中，作者用「星星」代表什麼？最符合詩意的選項是？',
    options: [
      '夜晚照亮回家路的光',
      '心中嚮往卻難以到達的理想',
      '可以被摘下來送人的禮物',
      '會隨著季節改變位置的裝飾',
    ],
    answerIndex: 1,
    explanation: '在《許願》這首詩裡，「星星」是象徵性的意象，代表遙遠卻美好的願望。作者透過「向星星許願」這個動作，傳遞「心中有想達成的事物」這個意念。',
    commonMisconception: '詩歌的「星星」通常不是字面的天體，也不是可被摘取的物體。它是詩人情感的投射。',
  },
  {
    id: 'q2',
    category: '下雨的時候',
    question: '課文《下雨的時候》透過哪一個感官描寫，讓讀者感受到下雨的氛圍？',
    options: [
      '視覺（看見雨滴）',
      '聽覺（聽到雨聲）',
      '多重感官交錯',
      '味覺（嘗到雨水）',
    ],
    answerIndex: 2,
    explanation: '課文使用視覺（雨絲、窗景）、聽覺（雨聲滴答）、嗅覺（泥土氣味）多重感官描寫，營造下雨時的立體感受。這是記敘文常用的「感官描寫」手法。',
  },
  {
    id: 'q3',
    category: '遇見美如奶奶',
    question: '從課文對美如奶奶的描寫，可以推測她是一位什麼樣的長者？',
    options: [
      '嚴厲寡言的老師',
      '樂觀開朗、關懷他人的長輩',
      '忙碌無暇的工作者',
      '孤僻隱居的隱士',
    ],
    answerIndex: 1,
    explanation: '課文透過美如奶奶與鄰居互動、分享物品、說話的方式，勾勒出一位樂觀開朗且關懷他人的長者形象。這是「人物描寫」中「從行為推論性格」的能力。',
    commonMisconception: '課文並未直接用形容詞告訴讀者「美如奶奶是怎樣的人」，需要從她的「行為」與「對話」去推論——這是閱讀素養的基本訓練。',
  },
  {
    id: 'q4',
    category: '工匠之祖',
    question: '「工匠之祖」魯班的故事，主要傳遞什麼核心精神？',
    options: ['保守傳統，不輕易改變', '觀察、思考並創新工具', '服從命令完成工作', '追求華美的外觀'],
    answerIndex: 1,
    explanation: '魯班被稱為「工匠之祖」，正因為他善於觀察自然（如葉子鋸齒啟發鋸子），思考並創新工具。課文透過這些故事強調「觀察→思考→創新」的精神。',
  },
];

export interface MockStats {
  practiceCount: number;
  totalAnswered: number;
  totalCorrect: number;
  accuracy: number;
  streak: number;
  perCategory: Array<{ category: string; total: number; correct: number; accuracy: number }>;
  recentHistory: Array<{ id: string; type: string; date: string; score: number; count: number; accuracy: number }>;
}

export const MOCK_STATS: Record<PublisherKey, MockStats> = {
  kanghsuan: {
    practiceCount: 12,
    totalAnswered: 128,
    totalCorrect: 117,
    accuracy: 92,
    streak: 5,
    perCategory: [
      { category: '許願', total: 24, correct: 22, accuracy: 92 },
      { category: '下雨的時候', total: 20, correct: 18, accuracy: 90 },
      { category: '遇見美如奶奶', total: 18, correct: 15, accuracy: 83 },
      { category: '工匠之祖', total: 22, correct: 20, accuracy: 91 },
      { category: '學田鼠開路', total: 14, correct: 12, accuracy: 86 },
      { category: '神奇密碼', total: 16, correct: 15, accuracy: 94 },
      { category: '油桐花・五月雪', total: 8, correct: 8, accuracy: 100 },
      { category: '大自然的美術館', total: 6, correct: 6, accuracy: 100 },
    ],
    recentHistory: [
      { id: 'p1', type: '進階挑戰', date: '04/18', score: 23, count: 25, accuracy: 92 },
      { id: 'p2', type: '第1課', date: '04/17', score: 9, count: 10, accuracy: 90 },
      { id: 'p3', type: '基本挑戰', date: '04/16', score: 9, count: 10, accuracy: 90 },
      { id: 'p4', type: '第3課', date: '04/15', score: 17, count: 20, accuracy: 85 },
      { id: 'p5', type: '全部做', date: '04/14', score: 88, count: 100, accuracy: 88 },
    ],
  },
  nanyi: {
    practiceCount: 4,
    totalAnswered: 42,
    totalCorrect: 32,
    accuracy: 76,
    streak: 2,
    perCategory: [
      { category: '許願', total: 15, correct: 11, accuracy: 73 },
      { category: '下雨的時候', total: 12, correct: 10, accuracy: 83 },
      { category: '遇見美如奶奶', total: 8, correct: 5, accuracy: 63 },
      { category: '工匠之祖', total: 7, correct: 6, accuracy: 86 },
    ],
    recentHistory: [
      { id: 'p1', type: '基本挑戰', date: '04/19', score: 7, count: 10, accuracy: 70 },
      { id: 'p2', type: '進階挑戰', date: '04/15', score: 18, count: 25, accuracy: 72 },
    ],
  },
  hanlin: {
    practiceCount: 0,
    totalAnswered: 0,
    totalCorrect: 0,
    accuracy: 0,
    streak: 0,
    perCategory: [],
    recentHistory: [],
  },
};
