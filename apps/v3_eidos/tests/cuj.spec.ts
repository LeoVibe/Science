import { test, expect } from '@playwright/test';

test.describe('Eidos 核心答題旅程 (Critical User Journey)', () => {

    // 輔助函式：如果出現「學習與使用設定」蓋台，點擊「完成設定」關閉它
    async function clearSetupOverlay(page: any) {
        const doneBtn = page.getByRole('button', { name: /完成設定/ });
        if (await doneBtn.isVisible()) {
            await doneBtn.click();
        }
    }

    test('使用者可選擇科目、單元並進行答題與看解析', async ({ page }) => {
        // 1. 進入五年級下學期國語 (南一版) 題庫
        await page.goto('/g5/chi/s2/nani');
        await clearSetupOverlay(page);

        // 確保單元選單有出現
        await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();

        // 2. 找到並點擊進入該版的「單元測驗」或第一個單元
        const startTestBtn = page.getByRole('button', { name: /基本挑戰|進階挑戰|第1課|第2課|第3課/i }).first();
        await expect(startTestBtn).toBeVisible();
        await startTestBtn.click();

        // 3. 確認進入答題畫面
        // 預期至少有選項可以點擊
        await expect(page.locator('button').filter({ hasText: /^(A|B|C|D|1|2|3|4|是|否)\.?/i })).not.toHaveCount(0, { timeout: 10000 });

        const optionBtn = page.locator('button').filter({ hasText: /^(A|B|C|D|1|2|3|4)\.?/i }).first();

        // 點擊第一個選項
        await optionBtn.click();

        // 點擊「確認答案」按鈕
        await page.getByRole('button', { name: /確認答案/i }).click();

        // 確保畫面上出現「解析」或「下一題」或「正確/錯誤」
        await expect(page.locator('body')).toContainText(/下一題|解析|正確|錯誤/i, { timeout: 5000 });
    });

    test('切換科目時，網址應同步更新 (導航驗證)', async ({ page }) => {
        // 1. 預設進入首頁 (會自動跳轉至某個預設科目)
        await page.goto('/');
        await clearSetupOverlay(page);

        // 2. 找到並點擊「數學」按鈕 (使用 AppHeader 中的 Tabs/Buttons)
        // 根據 UI 實作，假設科目切換按鈕包含科目名稱
        const mathBtn = page.getByRole('button', { name: /數學/ }).first();
        await expect(mathBtn).toBeVisible();
        await mathBtn.click();

        // 3. 驗證 URL 應該包含 'mat'
        await expect(page).toHaveURL(/.*\/mat\/.*/);

        // 4. 再切換到「自然」
        const sciBtn = page.getByRole('button', { name: /自然/ }).first();
        await expect(sciBtn).toBeVisible();
        await sciBtn.click();

        // 5. 驗證 URL 應該包含 'sci'
        await expect(page).toHaveURL(/.*\/sci\/.*/);
    });

});
