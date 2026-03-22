import { describe, it, expect } from 'vitest';
import { isCurriculumUnitLabel, filterAndOrderLessonCategories } from './lessonCategories';
import type { Question } from '@/data/config';

describe('lessonCategories', () => {
  it('辨識單元列標題', () => {
    expect(isCurriculumUnitLabel('第一單元：美好生活的起點')).toBe(true);
    expect(isCurriculumUnitLabel('第二單元：智慧的對話')).toBe(true);
    expect(isCurriculumUnitLabel('第四單元：愛與成長的腳印')).toBe(true);
    expect(isCurriculumUnitLabel('許願')).toBe(false);
    expect(isCurriculumUnitLabel('這一課的單元重點')).toBe(false);
  });

  it('過濾並依 lessonOrder 排序', () => {
    const mk = (cat: string, order: number): Question =>
      ({
        category: cat,
        lessonOrder: order,
      }) as Question;
    const qs = [
      mk('第二課：下雨', 2),
      mk('第一單元：X', 99),
      mk('第一課：許願', 1),
    ];
    const out = filterAndOrderLessonCategories(qs);
    expect(out).toEqual(['第一課：許願', '第二課：下雨']);
  });
});
