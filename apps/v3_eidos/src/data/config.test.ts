import { describe, it, expect } from 'vitest';
import { buildPath } from './config';

describe('buildPath', () => {
  it('分科題庫返回應導向 about/library', () => {
    const path = buildPath(3, '社會', 2, '南一', 'about', 'library');
    expect(path).toBe('/g3/soc/s2/nani/about/library');
  });

  it('僅 about 不帶 subTab 時不帶 library 段', () => {
    const path = buildPath(3, '國語', 1, '翰林', 'about');
    expect(path).toBe('/g3/chi/s1/hlm/about');
  });
});
