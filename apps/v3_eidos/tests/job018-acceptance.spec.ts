import { test, expect } from '@playwright/test';

/**
 * JOB-018 UAT 綜合修復 — 瀏覽器驗收測試
 * 對應派工單 12 項，在可自動化範圍內驗證行為。
 */

async function clearSetupOverlay(page: import('@playwright/test').Page) {
  const doneBtn = page.getByRole('button', { name: /完成設定/ });
  if (await doneBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await doneBtn.click();
  }
}

test.describe('JOB-018 驗收：第一階段 5 大共同問題', () => {

  // #3 深層網址空降 — 直接進入 /quiz 應 fallback 到選單（URL 不再含 /quiz）
  test('#3 深連結進入 /quiz 無 session 時應導回選單', async ({ page }) => {
    await page.goto('/g3/chi/s1/nani/quiz');
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).not.toMatch(/\/quiz/);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('body')).not.toContainText('畫面暫時發生錯誤');
  });

  // #3 深連結 /wrong 無 session 時應導回選單（URL 不再含 /wrong）
  test('#3 深連結進入 /wrong 無 session 時應導回選單', async ({ page }) => {
    await page.goto('/g3/chi/s1/nani/wrong');
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).not.toMatch(/\/wrong/);
  });

  // #4 Admin 無 token 時應導向登入頁
  test('#4 未登入存取 /admin 應導向登入頁', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('#4 未登入存取 /admin/system/config 應導向登入頁', async ({ page }) => {
    await page.goto('/admin/system/config');
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  // #5 Error Boundary 存在時，正常頁面不應顯示錯誤 UI
  test('#5 正常載入首頁不應觸發 ErrorBoundary 錯誤頁', async ({ page }) => {
    await page.goto('/');
    await clearSetupOverlay(page);
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).not.toContainText('畫面暫時發生錯誤');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 8000 });
  });
});

test.describe('JOB-018 驗收：第二階段個別問題', () => {

  // #9 學習報告無紀錄時應為 Empty State（不顯示 MOCK 假數字）
  test('#9 學習報告無紀錄時應顯示 Empty State', async ({ page }) => {
    await page.goto('/g5/chi/s2/nani/stats');
    await clearSetupOverlay(page);
    await page.waitForTimeout(2000);
    const body = await page.locator('body').textContent() ?? '';
    const hasEmptyState = body.includes('你還沒有開始練習');
    const hasMockLabel = body.includes('模擬資料');
    expect(hasEmptyState || !hasMockLabel).toBeTruthy();
  });

  // 主選單在有題庫時應顯示挑戰按鈕（基本/進階）
  test('主選單有題庫時應顯示基本挑戰與進階挑戰', async ({ page }) => {
    await page.goto('/g5/chi/s2/nani');
    await clearSetupOverlay(page);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /基本挑戰/ }).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /進階挑戰/ }).first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('JOB-018 驗收：回歸與整體健康', () => {

  test('首頁載入後可見題庫或尚無題庫提示（非白畫面）', async ({ page }) => {
    await page.goto('/');
    await clearSetupOverlay(page);
    await page.waitForTimeout(2000);
    const hasContent =
      (await page.getByRole('heading', { level: 1 }).first().isVisible({ timeout: 5000 }).catch(() => false)) ||
      (await page.locator('text=尚無題庫').isVisible().catch(() => false)) ||
      (await page.locator('text=此題庫已關閉').isVisible().catch(() => false));
    expect(hasContent).toBeTruthy();
  });

  test('科目路由載入後無崩潰', async ({ page }) => {
    await page.goto('/g4/mat/s2/hlm');
    await clearSetupOverlay(page);
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).not.toContainText('畫面暫時發生錯誤');
  });
});
