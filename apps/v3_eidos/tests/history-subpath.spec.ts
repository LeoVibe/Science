import { test, expect } from '@playwright/test';

test.describe('History routes under base path', () => {
  async function clearSetupOverlay(page: import('@playwright/test').Page) {
    const doneBtn = page.getByRole('button', { name: /完成設定/ });
    if (await doneBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await doneBtn.click();
    }
  }

  test('legacy history routes do not render app 404', async ({ page }) => {
    await page.goto('/history/v1_science/');
    await expect(page.locator('body')).not.toContainText('Oops! Page not found');

    await page.goto('/history/v2_currisite/');
    await expect(page.locator('body')).not.toContainText('Oops! Page not found');
  });

  test('legacy compatibility route aliases remain available', async ({ page }) => {
    await page.goto('/history/v0.1/');
    await expect(page).toHaveURL(/history\/v0\.1\/?$/);
    await expect(page.locator('body')).not.toContainText('Oops! Page not found');

    await page.goto('/history/v0.5/');
    await expect(page).toHaveURL(/history\/v0\.5\/?$/);
    await expect(page.locator('body')).not.toContainText('Oops! Page not found');
  });

  test('about changelog links open legacy pages in new tab', async ({ page }) => {
    await page.goto('/Science/g5/chi/s2/nani/about/changelog');
    await clearSetupOverlay(page);

    const v1Link = page.getByRole('link', { name: /v0\.1 初版\(自然科\)/ }).first();
    const v2Link = page.getByRole('link', { name: /v0\.2 多科目版/ }).first();

    await expect(v1Link).toBeVisible();
    await expect(v2Link).toBeVisible();
    await expect(v1Link).toHaveAttribute('href', /\/Science\/history\/v1_science\/?$/);
    await expect(v2Link).toHaveAttribute('href', /\/Science\/history\/v2_currisite\/?$/);
    await expect(v1Link).toHaveAttribute('target', '_blank');
    await expect(v2Link).toHaveAttribute('target', '_blank');
  });
});

