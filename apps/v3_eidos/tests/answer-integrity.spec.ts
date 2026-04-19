import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * answer-integrity.spec.ts
 *
 * 防範 2026-04-19 發現的 questionLoader.ts answer_index 錯位 bug。
 * 核心斷言：在 Review 模式下，畫面上帶 `bg-correct-light` class 的選項文字，
 *          必須等於 JSON `options[answer_index]` 去前綴後的文字。
 *
 * 抽樣範圍：開放範圍（G3-G6 × S2）的每一個（年級×科目×出版社×課次）組合取 1 題。
 * 樣本由 scripts 自動從 question/platform 產生，寫入 tests/answer-integrity.samples.json。
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

interface Sample {
    grade: number;
    subjectPath: string;
    semesterPath: string;
    publisherPath: string;
    jsonFile: string;
    lessonOrder: number;
    questionIndex: number;
}

const samplesPath = path.join(__dirname, 'answer-integrity.samples.json');
const SAMPLES: Sample[] = JSON.parse(fs.readFileSync(samplesPath, 'utf8'));

function stripPrefix(text: string): string {
    return text.replace(/^[A-D][.\s:：．、]+|^[1-4][.\s:：．、]+/i, '').trim();
}

test.describe('UI ↔ 資料一致性（answer_index hotfix 2026-04-19）', () => {

    // 預先寫入 user_profile 繞過首登 Welcome Setup 蓋台
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
            try {
                const profile = {
                    grade: 3,
                    semester: 2,
                    publisher: 'HanLin',
                    setupComplete: true,
                    maxQuizQuestions: 25,
                };
                localStorage.setItem('sci_v2_user_profile', JSON.stringify(profile));
                localStorage.setItem('hasSeenValueOnboarding', 'true');
            } catch (_e) { /* noop */ }
        });
    });

    async function clearSetupOverlay(page: any) {
        const doneBtn = page.getByRole('button', { name: /完成設定|稍後再說|跳過/ });
        if (await doneBtn.isVisible().catch(() => false)) {
            await doneBtn.click();
        }
    }

    for (const sample of SAMPLES) {
        const relFile = path.relative(PROJECT_ROOT, path.join(PROJECT_ROOT, sample.jsonFile));
        test(`${relFile}#${sample.questionIndex + 1}`, async ({ page }) => {
            // 1. 載入 JSON 取得預期答案
            const jsonPath = path.join(PROJECT_ROOT, sample.jsonFile);
            expect(fs.existsSync(jsonPath), `JSON 檔不存在：${jsonPath}`).toBe(true);
            const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
            const q = data.questions[sample.questionIndex];
            expect(q, `題目索引 ${sample.questionIndex} 不存在`).toBeTruthy();
            const answerIndex = q.answer_index;
            expect(Number.isInteger(answerIndex), 'answer_index 非整數').toBe(true);
            const expectedCorrectText = stripPrefix(q.options[answerIndex]);

            // 2. 直接導向 Review 模式
            // 使用 domcontentloaded 避免 4-worker 並行時 goto() 等 load 事件 30s timeout
            const url = `/g${sample.grade}/${sample.subjectPath}/${sample.semesterPath}/${sample.publisherPath}/review`;
            await page.goto(url, { waitUntil: 'domcontentloaded' });
            await clearSetupOverlay(page);

            // 3. 等題庫載入並點選目標課次
            const lessonBtn = page.getByRole('button', { name: new RegExp(`第${sample.lessonOrder}課`) }).first();
            await expect(lessonBtn).toBeVisible({ timeout: 15000 });
            await lessonBtn.click();

            // 4. 找到目標題
            const questionHeader = page.getByText(`第 ${sample.questionIndex + 1} 題`, { exact: false }).first();
            await expect(questionHeader).toBeVisible({ timeout: 10000 });

            // 5. 綠框正解標記
            const card = questionHeader.locator('xpath=ancestor::*[contains(@class,"rounded-2xl") and contains(@class,"border")][1]');
            const correctOption = card.locator('.bg-correct-light').first();
            await expect(correctOption, '找不到 bg-correct-light 綠色正解標記').toBeVisible({ timeout: 5000 });
            const correctText = (await correctOption.textContent())?.trim() ?? '';

            // 6. 核心斷言：UI 綠框文字 === JSON options[answer_index] 去前綴後
            expect(
                correctText.includes(expectedCorrectText),
                `UI 綠框「${correctText.substring(0, 40)}」不含 JSON answer_index=${answerIndex} 的文字「${expectedCorrectText.substring(0, 40)}」`
            ).toBe(true);
        });
    }
});
