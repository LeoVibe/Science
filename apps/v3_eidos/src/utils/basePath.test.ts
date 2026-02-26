import { describe, expect, it } from 'vitest';
import { withBaseFrom } from './basePath';

describe('withBaseFrom', () => {
  it('keeps root deployment paths stable', () => {
    expect(withBaseFrom('history/v1_science/', '/')).toBe('/history/v1_science/');
    expect(withBaseFrom('/question/platform', '/')).toBe('/question/platform');
  });

  it('prefixes subpath deployment paths for GitHub Pages', () => {
    expect(withBaseFrom('history/v1_science/', '/Science/')).toBe('/Science/history/v1_science/');
    expect(withBaseFrom('/question/platform', '/Science/')).toBe('/Science/question/platform');
  });

  it('normalizes base paths without trailing slash', () => {
    expect(withBaseFrom('history/v2_currisite/', '/Science')).toBe('/Science/history/v2_currisite/');
  });
});

