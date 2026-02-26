import { test, expect } from '@playwright/test';

/**
 * 回歸測試：針對曾出現過的 bug 建立防護網
 * 確保修復後不會再次復發
 *
 * 建立日期：2026-02-26
 */
test.describe('Eidos 回歸測試 (Regression)', () => {

    // 輔助函式：關閉設定蓋台
    async function clearSetupOverlay(page: any) {
        const doneBtn = page.getByRole('button', { name: /完成設定/ });
        if (await doneBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            await doneBtn.click();
        }
    }

    /**
     * Bug #1: 累積錯題本顯示「目前題庫中無此題」
     *
     * 根因：Index.tsx 中 needFull 的判斷只包含 'review' 和 'quiz'，
     * 當 view 為 'result' 時不會觸發完整題庫載入，
     * 導致 ResultView 的 questionMap 找不到題目。
     *
     * 修復：將 'result' 和 'wrong-questions' 加入 needFull 判斷。
     * 修復日期：2026-02-26
     */
    test('累積錯題本應顯示題目文字而非「目前題庫中無此題」', async ({ page }) => {
        // 1. 進入有題庫的科目
        await page.goto('/g5/chi/s2/nani');
        await clearSetupOverlay(page);

        // 確保主選單載入
        await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 10000 });

        // 2. 點擊「基本挑戰」進入答題
        const challengeBtn = page.getByRole('button', { name: /基本挑戰/ }).first();
        await expect(challengeBtn).toBeVisible();
        await challengeBtn.click();

        // 3. 等待題目載入
        await expect(page.locator('button').filter({ hasText: /^[ABCD]$/ }).first()).toBeVisible({ timeout: 10000 });

        // 4. 作答所有題目（全部選 A，會故意答錯一些以產生錯題紀錄）
        const totalQuestions = 10;
        for (let i = 0; i < totalQuestions; i++) {
            // 選擇第一個選項 (A)
            const optionA = page.locator('button').filter({ hasText: /^A$/ }).first();
            await optionA.click();

            // 等待答案確認（自動確認模式或點擊確認）
            // 因為啟用了快捷鍵，點選 A 會直接確認
            await page.waitForTimeout(500);

            // 判斷是否為最後一題
            const finishBtn = page.getByRole('button', { name: /查看結果/ });
            const nextBtn = page.getByRole('button', { name: /下一題/ });

            if (await finishBtn.isVisible({ timeout: 500 }).catch(() => false)) {
                await finishBtn.click();
                break;
            } else if (await nextBtn.isVisible({ timeout: 500 }).catch(() => false)) {
                await nextBtn.click();
                await page.waitForTimeout(300);
            } else {
                // 自動跳題模式：等待自動切換
                await page.waitForTimeout(2000);
            }
        }

        // 5. 確認到達結果頁
        await expect(page.locator('text=答題完成')).toBeVisible({ timeout: 10000 });

        // 6. 核心斷言：頁面上不應出現「目前題庫中無此題」
        const missingText = page.locator('text=目前題庫中無此題');
        await expect(missingText).toHaveCount(0);

        // 7. 如果有累積錯題本區塊，確認裡面有實際的題目文字
        const wrongSection = page.locator('text=累積錯題本');
        if (await wrongSection.isVisible({ timeout: 2000 }).catch(() => false)) {
            // 錯題本中的每一題都應該有選項 (A/B/C/D)，表示題目有正確載入
            const optionLabels = page.locator('text=✓ 正確答案');
            expect(await optionLabels.count()).toBeGreaterThan(0);
        }
    });

    /**
     * Bug #2: 從根路徑 reload 時 URL 跳到深層路徑
     *
     * 根因：State→URL sync effect 在根路徑時也會自動 navigate
     * 修復：hasUrlParams 判斷，根路徑+menu view 不跳轉
     * 修復日期：2026-02-26
     */
    test('根路徑 reload 後不應自動跳轉到深層路徑', async ({ page }) => {
        // 1. 直接前往根路徑
        await page.goto('/');
        await clearSetupOverlay(page);

        // 2. 等待頁面穩定
        await page.waitForTimeout(2000);

        // 3. 根路徑應保持在 / 不被跳轉
        const url = page.url();
        // URL 應為根路徑（/）或不含 /g 開頭的深層路徑
        // 注意：首次訪問時可能顯示設定蓋台，關閉後仍應在根路徑
        expect(url).toMatch(/\/$/);
    });

});
