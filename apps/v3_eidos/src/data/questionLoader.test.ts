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
});
