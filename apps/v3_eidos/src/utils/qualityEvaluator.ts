/**
 * 題庫品質評分引擎（前端版）
 * 移植自 scripts/evaluate_question_quality.js，不含 Node.js fs。
 * 維度：結構完整性、選項對稱性、情境深度、認知層次標註；PIRLS 比例用於等級判定。
 */

export type Taxonomy = 'literal' | 'inferential' | 'applied';

export interface EvaluateQuestionResult {
  score: number;
  reports: string[];
  taxonomy?: Taxonomy;
}

/** 原始題目形狀（與題庫 JSON 一致） */
export interface RawQ {
  id?: string;
  question?: string;
  options?: string[];
  explanation?: string;
  commonMisconception?: string;
  taxonomy?: string;
  type?: string;
}

/**
 * 評核單一題目
 */
export function evaluateQuestion(q: RawQ): EvaluateQuestionResult {
  let score = 0;
  const reports: string[] = [];

  if (!q || typeof q !== 'object') return { score: 0, reports: ['無題目'] };

  if (q.id) score += 0.5;
  if (q.explanation && q.explanation.length > 10) score += 1;
  if (q.commonMisconception) score += 0.5;

  if (q.options && q.options.length === 4) {
    const lengths = q.options.map((o) => (o && String(o).length) || 0);
    const avgLen = lengths.reduce((a, b) => a + b, 0) / 4;
    const maxDev = avgLen > 0
      ? Math.max(...lengths.map((l) => Math.abs(l - avgLen))) / avgLen
      : 1;
    if (maxDev < 0.15) score += 2;
    else if (maxDev < 0.3) score += 1;
    else reports.push('選項字數差異過大');
  }

  const qLen = (q.question && String(q.question).length) || 0;
  if (qLen > 50) score += 3;
  else if (qLen > 30) score += 2;
  else if (qLen > 15) score += 1;
  else reports.push('題目描述過短');

  const tax = q.taxonomy as Taxonomy | undefined;
  if (tax && ['literal', 'inferential', 'applied'].includes(tax)) score += 1;

  return { score, reports, taxonomy: tax };
}

export interface EvaluateFileResult {
  quality: string;
  avgScore: string;
  count: number;
  taxCount: { literal: number; inferential: number; applied: number };
  pirlsLiteralRatio?: number;
  pirlsInferentialRatio?: number;
  pirlsAppliedRatio?: number;
}

/**
 * 評核整份題目陣列（對應 evaluateFile 的純邏輯，無 fs）
 */
export function evaluateQuestions(questions: RawQ[]): EvaluateFileResult | { quality: 'BROKEN'; error: string } {
  const list = Array.isArray(questions) ? questions : [];
  if (list.length === 0) return { quality: 'L1', count: 0, avgScore: '0.00', taxCount: { literal: 0, inferential: 0, applied: 0 } };

  let totalScore = 0;
  const taxCount = { literal: 0, inferential: 0, applied: 0 };

  list.forEach((q) => {
    const result = evaluateQuestion(q);
    totalScore += result.score;
    if (result.taxonomy && taxCount[result.taxonomy] !== undefined) {
      taxCount[result.taxonomy]++;
    }
  });

  const avgScore = totalScore / list.length;
  const total = list.length;
  const pirlsLiteralRatio = taxCount.literal / total;
  const pirlsInferentialRatio = taxCount.inferential / total;
  const pirlsAppliedRatio = taxCount.applied / total;

  const isPirlsBalanced =
    pirlsLiteralRatio >= 0.2 && pirlsLiteralRatio <= 0.4 &&
    pirlsInferentialRatio >= 0.4 && pirlsInferentialRatio <= 0.6;

  let quality = 'L1';
  if (avgScore >= 6.5 && isPirlsBalanced) quality = 'L5';
  else if (avgScore >= 5.5) quality = 'L4+';
  else if (avgScore >= 4.5) quality = 'L4';
  else if (avgScore >= 3.0) quality = 'L3';
  else if (avgScore >= 1.5) quality = 'L2';

  return {
    quality,
    avgScore: avgScore.toFixed(2),
    count: total,
    taxCount,
    pirlsLiteralRatio,
    pirlsInferentialRatio,
    pirlsAppliedRatio,
  };
}
