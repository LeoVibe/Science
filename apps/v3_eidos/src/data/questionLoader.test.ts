import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadQuestions } from './questionLoader';

/**
 * 五下國語 manifest（AG 重構格式：items + path）
 */
const G5_CHINESE_S2_MANIFEST = {
  publisher: '翰林',
  grade: 'G5',
  semester: 'S2',
  subject: 'Chinese',
  items: [
    { id: 'L1', title: '讀首情詩給大地', path: 'Chi_L1.json' },
    { id: 'L2', title: '聽！那是什麼聲音？', path: 'Chi_L2.json' },
  ],
};

/**
 * 單一題目 JSON（L4 格式：correctAnswer, scenario, commonMisconception）
 */
const SINGLE_QUESTION_JSON = {
  id: 'Chi_G5_S2_HL_U1',
  concept: '鵝鑾鼻詩',
  scenario: '文學賞析與意象連結',
  difficulty: '簡單',
  question: '在《鵝鑾鼻詩》中，作者將哪一個事物比喻為「發光體」？',
  options: ['太陽', '鵝鑾鼻燈塔', '月亮', '星空'],
  correctAnswer: 1,
  explanation: '燈塔為發光體。',
  commonMisconception: '可能誤選太陽或星空。',
};

describe('questionLoader', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('應使用正確的 basePath 請求 manifest（G5 國語 S2 翰林）', async () => {
    const fetchMock = vi.fn();
    fetchMock.mockResolvedValueOnce({ ok: false });
    globalThis.fetch = fetchMock;

    await loadQuestions(5, '國語', 2, '翰林');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/question/platform/G5/Chinese/S2/HanLin/manifest.json')
    );
  });

  it('應解析 items+path 格式的 manifest 並載入單題 JSON', async () => {
    const fetchMock = vi.fn();
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => G5_CHINESE_S2_MANIFEST,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => SINGLE_QUESTION_JSON,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...SINGLE_QUESTION_JSON, id: 'q2', question: '第二題？' }),
      });
    globalThis.fetch = fetchMock;

    const result = await loadQuestions(5, '國語', 2, '翰林');

    expect(result.questions.length).toBe(2);
    expect(result.questions[0].question).toBe(SINGLE_QUESTION_JSON.question);
    expect(result.questions[0].normalizedAnswer).toBe(1);
    expect(result.questions[0].scenario).toBe(SINGLE_QUESTION_JSON.scenario);
    expect(result.questions[0].commonMisconception).toBe(SINGLE_QUESTION_JSON.commonMisconception);
    expect(result.getAllCategories()).toContain('讀首情詩給大地');
    expect(result.getAllCategories()).toContain('聽！那是什麼聲音？');

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('/question/platform/G5/Chinese/S2/HanLin/Chi_L1.json')
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining('/question/platform/G5/Chinese/S2/HanLin/Chi_L2.json')
    );
  });

  it('manifest 無 units/items/files 時應回傳空題目', async () => {
    const fetchMock = vi.fn();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ publisher: '翰林', grade: 'G5' }),
    });
    globalThis.fetch = fetchMock;

    const result = await loadQuestions(5, '國語', 2, '翰林');

    expect(result.questions).toHaveLength(0);
    expect(result.getAllCategories()).toHaveLength(0);
  });

  it('應解析國語 AG 格式：lesson_id / lesson_title / questions[] / answer_index', async () => {
    const fetchMock = vi.fn();
    const chineseLessonJson = {
      publisher: '翰林',
      grade: 'G5',
      semester: 'S2',
      subject: 'Chinese',
      lesson_id: 'L1',
      lesson_title: '讀首情詩給大地',
      questions: [
        {
          question: '本詩標題「情詩」一詞最主要是表達什麼？',
          options: ['選項A', '人類對大自然的愛意', '選項C', '選項D'],
          answer_index: 1,
          explanation: '詩中將大地視為愛人。',
          scenario: '文章主旨',
          commonMisconception: '易從字面聯想男女之情。',
        },
      ],
    };
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => G5_CHINESE_S2_MANIFEST })
      .mockResolvedValueOnce({ ok: true, json: async () => chineseLessonJson })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ...chineseLessonJson, lesson_id: 'L2', lesson_title: '聽！那是什麼聲音？', questions: [] }) });
    globalThis.fetch = fetchMock;

    const result = await loadQuestions(5, '國語', 2, '翰林');

    expect(result.questions.length).toBe(1);
    expect(result.questions[0].question).toBe(chineseLessonJson.questions[0].question);
    expect(result.questions[0].normalizedAnswer).toBe(1);
    expect(result.questions[0].scenario).toBe('文章主旨');
    expect(result.questions[0].commonMisconception).toBe('易從字面聯想男女之情。');
    expect(result.questions[0].category).toBe('讀首情詩給大地');
    expect(result.getAllCategories()).toContain('讀首情詩給大地');
  });

  it('應支援 manifest.manifest 格式（G3 國語南一等）', async () => {
    const fetchMock = vi.fn();
    const g3Manifest = {
      publisher: '南一',
      grade: 'G3',
      semester: 'S2',
      subject: 'Chinese',
      manifest: [
        { id: 'L1', title: '最美的模樣', file: 'Chi_L1.json' },
        { id: 'L2', title: '誰最懂創意', file: 'Chi_L2.json' },
      ],
    };
    const lessonJson = {
      lesson_id: 'L1',
      lesson_title: '最美的模樣',
      questions: [{ question: '題幹？', options: ['A', 'B', 'C', 'D'], answer_index: 0 }],
    };
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => g3Manifest })
      .mockResolvedValueOnce({ ok: true, json: async () => lessonJson })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ...lessonJson, lesson_id: 'L2', questions: [] }) });
    globalThis.fetch = fetchMock;

    const result = await loadQuestions(3, '國語', 2, '南一');

    expect(result.questions.length).toBe(1);
    expect(result.getAllCategories()).toContain('最美的模樣');
    expect(fetchMock).toHaveBeenNthCalledWith(2, expect.stringContaining('/question/platform/G3/Chinese/S2/NanYi/Chi_L1.json'));
  });

  it('應支援舊版 units+file 格式', async () => {
    const fetchMock = vi.fn();
    const oldManifest = {
      units: [
        { id: 'Math_U1', order: 1, title: '十進位結構', file: 'Math_U1.json' },
      ],
    };
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => oldManifest })
      .mockResolvedValueOnce({ ok: true, json: async () => SINGLE_QUESTION_JSON });
    globalThis.fetch = fetchMock;

    const result = await loadQuestions(5, '數學', 2, '翰林');

    expect(result.questions.length).toBe(1);
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('/question/platform/G5/Math/S2/HanLin/Math_U1.json')
    );
  });

  it('應正確解析 production 格式 (data.meta + answer_index) — regression for 2026-04-19 hotfix', async () => {
    // 回歸測試：2026-04-19 發現 questionLoader.ts:242 只讀 q.answer，
    // 但全站 12,911 題只有 answer_index 欄位 → 前端把所有題目顯示為 A 正解。
    // 本測試鎖死 production 格式（data.meta + data.questions[*].answer_index）的正確解析。
    const fetchMock = vi.fn();
    const manifest = {
      id: 'G3_S2_SOC_HANLIN',
      publisher: 'HANLIN',
      grade: 'G3',
      semester: 'S2',
      subject: 'SOC',
      items: [{ id: 'L2', title: '生活空間', file: 'G3_S2_SOC_HANLIN_L2.json', count: 3 }],
    };
    // 此 JSON 形狀必須與 question/platform/ 下真實檔案一致
    const productionFormatJson = {
      version: '1.0',
      meta: {
        grade: 'G3',
        semester: 'S2',
        subject: 'SOC',
        publisher: 'HANLIN',
        lesson: 'L2',
        title: '生活空間',
        order: 2,
      },
      publisher: 'HANLIN',
      questions: [
        {
          question: 'Q1 正解在 C',
          options: ['A 選項', 'B 選項', 'C 選項（正解）', 'D 選項'],
          answer_index: 2,
          explanation: '正解是 C',
          scenario: '情境',
        },
        {
          question: 'Q2 正解在 D',
          options: ['A', 'B', 'C', 'D 正解'],
          answer_index: 3,
          explanation: '正解是 D',
        },
        {
          question: 'Q3 正解在 B',
          options: ['A', 'B 正解', 'C', 'D'],
          answer_index: 1,
          explanation: '正解是 B',
        },
      ],
    };
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => manifest })
      .mockResolvedValueOnce({ ok: true, json: async () => productionFormatJson });
    globalThis.fetch = fetchMock;

    const result = await loadQuestions(3, '社會', 2, '翰林');

    expect(result.questions.length).toBe(3);
    // 關鍵斷言：normalizedAnswer 必須等於 answer_index（而非 0）
    expect(result.questions[0].normalizedAnswer).toBe(2);
    expect(result.questions[1].normalizedAnswer).toBe(3);
    expect(result.questions[2].normalizedAnswer).toBe(1);
    // 輔助斷言：確認沒有因為 q.answer undefined 而 fallback 到 0
    expect(result.questions.every(q => q.normalizedAnswer !== 0 || (q as { answer_index?: number }).answer_index === 0)).toBe(true);
  });

  it('應正確過濾被標記為 is_active: false 的題目', async () => {
    const fetchMock = vi.fn();
    const manifest = {
      publisher: '翰林',
      grade: 'G5',
      units: [{ id: 'U1', title: '單元一', file: 'lesson1.json' }],
    };
    const lessonJson = {
      questions: [
        { id: 'q1', type: 'multiple_choice', question: 'Q1', options: ['1', '2', '3', '4'], answer: 1, is_active: false },
        { id: 'q2', type: 'multiple_choice', question: 'Q2', options: ['1', '2', '3', '4'], answer: 1, is_active: true },
        { id: 'q3', type: 'multiple_choice', question: 'Q3', options: ['1', '2', '3', '4'], answer: 1 }, // 預設 undefined = true
      ]
    };
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => manifest })
      .mockResolvedValueOnce({ ok: true, json: async () => lessonJson });
    globalThis.fetch = fetchMock;

    const result = await loadQuestions(5, '數學', 2, '翰林');
    expect(result.questions).toHaveLength(2);
    expect(result.questions.map(q => q.id)).toEqual(['q2', 'q3']);
  });
});

