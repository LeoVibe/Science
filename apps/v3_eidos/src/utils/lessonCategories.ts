import type { Question } from '@/data/config';

/**
 * 判斷是否為課綱「單元」標題（非單篇課文），不應作為分科題庫的出題課次。
 * 例：第一單元：美好生活的起點、第１單元：想像與現實
 */
export function isCurriculumUnitLabel(text: string): boolean {
  const t = text.trim();
  if (!t.includes('單元')) return false;
  // 必須以「第…單元」開頭（避免誤傷課名中含「單元」二字者）
  return /^第[一二三四五六七八九十百千萬0-9０-９]+單元/.test(t);
}

/** 依各課在題組中的最小 lessonOrder 排序課次名稱 */
export function orderCategoriesByLesson(questions: Question[], categories: string[]): string[] {
  const minOrder = (cat: string) => {
    const orders = questions.filter((q) => q.category === cat).map((q) => q.lessonOrder ?? 9999);
    return orders.length ? Math.min(...orders) : 9999;
  };
  return [...categories].sort((a, b) => minOrder(a) - minOrder(b));
}

/** 過濾單元標題並排序 */
export function filterAndOrderLessonCategories(questions: Question[]): string[] {
  const raw = [...new Set(questions.map((q) => q.category).filter(Boolean))] as string[];
  const lessons = raw.filter((c) => !isCurriculumUnitLabel(c));
  return orderCategoriesByLesson(questions, lessons);
}
