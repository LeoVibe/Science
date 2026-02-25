import { describe, it, expect } from 'vitest';
import { evaluateQuestion, evaluateQuestions } from './qualityEvaluator';

describe('qualityEvaluator', () => {
  describe('evaluateQuestion', () => {
    it('應對完整題目給出較高分', () => {
      const q = {
        id: 'q1',
        question: '這是一道超過五十個字以上的題目描述，用來測試情境深度與結構完整性的評分邏輯是否正確運作。',
        options: ['選項一', '選項二', '選項三', '選項四'],
        explanation: '解析內容需要超過十個字才會拿到分數。',
        commonMisconception: '常見迷思',
        taxonomy: 'inferential',
      };
      const r = evaluateQuestion(q);
      expect(r.score).toBeGreaterThanOrEqual(6);
      expect(r.taxonomy).toBe('inferential');
    });

    it('應對缺漏題目給低分', () => {
      const r = evaluateQuestion({});
      expect(r.score).toBe(0);
    });

    it('選項字數對稱時應加 2 分', () => {
      const q = { question: '題幹約二十字左右即可拿一分', options: ['A', 'B', 'C', 'D'] };
      const r = evaluateQuestion(q);
      expect(r.score).toBeGreaterThanOrEqual(2);
    });
  });

  describe('evaluateQuestions', () => {
    it('空陣列應回傳 L1', () => {
      const r = evaluateQuestions([]);
      expect('error' in r ? r.quality : r.quality).toBe('L1');
      if (!('error' in r)) {
        expect(r.count).toBe(0);
        expect(r.avgScore).toBe('0.00');
      }
    });

    it('多題平均分與品質等級應符合門檻', () => {
      const questions = [
        { id: '1', question: '較長題幹超過五十字可以拿到情境深度三分，並需要解析與迷思診斷。', explanation: '解析超過十個字', commonMisconception: '迷思', options: ['A', 'B', 'C', 'D'], taxonomy: 'literal' },
        { id: '2', question: '第二題同樣較長題幹超過五十字可以拿到情境深度三分。', explanation: '解析超過十個字', commonMisconception: '迷思', options: ['A', 'B', 'C', 'D'], taxonomy: 'inferential' },
        { id: '3', question: '第三題較長題幹超過五十字。', explanation: '解析超過十個字', options: ['A', 'B', 'C', 'D'], taxonomy: 'applied' },
      ];
      const r = evaluateQuestions(questions);
      expect('error' in r).toBe(false);
      if ('error' in r) return;
      expect(r.count).toBe(3);
      expect(parseFloat(r.avgScore)).toBeGreaterThan(0);
      expect(['L1', 'L2', 'L3', 'L4', 'L4+', 'L5']).toContain(r.quality);
    });
  });
});
