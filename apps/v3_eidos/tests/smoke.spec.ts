import { test, expect } from '@playwright/test';

test.describe('Eidos 題庫平台全站健康掃描 (Smoke Test)', () => {

    test('首頁可正常載入，不出現白畫面', async ({ page }) => {
        // 導航到網站首頁 (會跳轉至預設年級/科目)
        await page.goto('/');

        // 預期看到頂部導航列或標題
        await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 10000 });

        // 檢查有沒有 "Eidos" 或 "題庫" 字眼
        await expect(page.locator('body')).toContainText(/題庫|Eidos/i);
    });

    const routesToTest = [
        { name: '五年級國語南一', path: '/g5/chi/s2/nani' },
        { name: '三年級數學康軒', path: '/g3/mat/s2/knsh' },
        { name: '四年級自然翰林', path: '/g4/sci/s2/hlm' },
    ];

    for (const route of routesToTest) {
        test(`核心科目路由存取：${route.name}`, async ({ page }) => {
            await page.goto(route.path);

            // 確保畫面出現該科目的標題或單元清單
            const heading = page.getByRole('heading', { level: 1 });
            await expect(heading).toBeVisible();

            // 確保沒有出現錯誤崩潰訊息 (通常 Error Boundary 會顯示 "出錯了")
            await expect(page.locator('body')).not.toContainText('發生非預期錯誤');

            // 確保左側或中間有「單元」或「課次」選項
            // 這邊預設只要拉取到資料，就會渲染選項清單 (button or links)
            const listItems = page.locator('button, a');
            expect(await listItems.count()).toBeGreaterThan(5);
        });
    }
});
