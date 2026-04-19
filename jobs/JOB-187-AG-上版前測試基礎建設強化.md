*Created by Claude Code (PM) at 2026-04-15 09:00*

`last_updated`: 2026-04-15 09:00
`updated_by`: Claude Code (claude-opus-4-6)

# JOB-187-AG-上版前測試基礎建設強化

**`job_type`**：`engineering`
**`executor`**：Cursor（Claude Code 主動呼叫）
**`priority`**：P0（上版前必須完成）

---

## 📌 任務背景

依 2026-04-14 上版前測試企劃評估，現有測試基礎建設存在 4 項關鍵缺漏：

1. **Vitest 依賴壞**：`@rolldown/pluginutils` 模組解析失敗，24 個單元測試形同虛設
2. **CQI 品質閘門未整合**：工具 (`evaluate_question_quality.js --gate`) 存在但未納入上版流程；目前全站 49.2% 題庫檔不達標
3. **Playwright 只跑 Chromium + Firefox**：Safari/Mobile 被註解，跨瀏覽器驗證缺失
4. **E3/E4/G6/容錯測試缺漏**：About 頁、六年級、API 失敗情境沒有自動化測試

本 JOB 修復上述工程層面問題，讓 `ei_release` 流程真正可被可靠執行。

---

## 🎯 任務目標

1. `npm run test` 在 `apps/v3_eidos` 目錄下可執行並全部通過（exit 0）
2. `bash scripts/release_gate.sh` 可一鍵執行完整上版前閘門並輸出 JSON 摘要報告
3. Playwright 跑三瀏覽器（chromium + firefox + webkit），新增 spec 全通過
4. `docs/上版前整體驗證與檢查清單.md` 補充四個缺漏章節

---

## 🚧 任務邊界

本次任務只做：
- 修復 Vitest 依賴問題（`apps/v3_eidos/` 範圍內）
- 新增 `scripts/release_gate.sh`
- 修改 `playwright.config.ts`（啟用三瀏覽器）
- 新增 Playwright spec 兩個檔案（`about.spec.ts`、`error-boundary.spec.ts`）
- 更新 `_agent/skills/ei_release/SKILL.md`
- 更新 `docs/上版前整體驗證與檢查清單.md`

本次任務不做：
- 修改任何題庫 JSON 檔案
- 修改任何出題/驗證規範文件（除上述明確指定的文件外）
- 修改 CI/CD pipeline（目前無 GitHub Actions）
- 執行 JOB-188 的瀏覽器或題庫驗證工作

---

## 📖 執行步驟

### Step 1：修復 Vitest 依賴

```bash
cd apps/v3_eidos
npm install
npm run test
```

若 `npm install` 後仍失敗（`@rolldown/pluginutils` 問題）：
```bash
npm install --legacy-peer-deps
npm run test
```

若仍失敗，鎖定 `@vitejs/plugin-react` 版本：
1. 查看 `node_modules/@vitejs/plugin-react/package.json` 確認版本
2. 在 `package.json` 中 pin 該版本
3. 再執行 `npm install && npm run test`

**DoD**：`npm run test` exit 0，輸出顯示 all tests passed

---

### Step 2：建立 `scripts/release_gate.sh`

建立 `scripts/release_gate.sh`，內容如下（依序執行，任一失敗即停止）：

```bash
#!/usr/bin/env bash
set -e
PROJ_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG_FILE="$PROJ_ROOT/scripts/orchestrator-logs/release_gate_$(date +%Y%m%d_%H%M%S).log"
mkdir -p "$PROJ_ROOT/scripts/orchestrator-logs"

echo "=== Eidos Release Gate ===" | tee "$LOG_FILE"
echo "Start: $(date)" | tee -a "$LOG_FILE"

echo "" | tee -a "$LOG_FILE"
echo "Step 1: Unit Tests (Vitest)" | tee -a "$LOG_FILE"
cd "$PROJ_ROOT/apps/v3_eidos" && npm run test 2>&1 | tee -a "$LOG_FILE"

echo "" | tee -a "$LOG_FILE"
echo "Step 2: Build" | tee -a "$LOG_FILE"
npm run build 2>&1 | tee -a "$LOG_FILE"

echo "" | tee -a "$LOG_FILE"
echo "Step 3: Generate Library Stats" | tee -a "$LOG_FILE"
cd "$PROJ_ROOT" && node scripts/generate_library_stats.js 2>&1 | tee -a "$LOG_FILE"

echo "" | tee -a "$LOG_FILE"
echo "Step 4: Verify & Build Manifests" | tee -a "$LOG_FILE"
node scripts/verify_and_build.js 2>&1 | tee -a "$LOG_FILE"

echo "" | tee -a "$LOG_FILE"
echo "Step 5: CQI Quality Gate" | tee -a "$LOG_FILE"
node scripts/evaluate_question_quality.js question/platform --gate 2>&1 | tee -a "$LOG_FILE"

echo "" | tee -a "$LOG_FILE"
echo "Step 6: Format Consistency Check" | tee -a "$LOG_FILE"
node scripts/verify_format_consistency.js 2>&1 | tee -a "$LOG_FILE"

echo "" | tee -a "$LOG_FILE"
echo "=== ALL STEPS PASSED ===" | tee -a "$LOG_FILE"
echo "End: $(date)" | tee -a "$LOG_FILE"
echo "Log: $LOG_FILE"
```

執行 `chmod +x scripts/release_gate.sh` 並測試：
```bash
bash scripts/release_gate.sh
```

> ⚠️ Step 5 CQI Gate 目前全站有 49.2% 檔案低於 QL3，必然失敗。**這是預期行為**——閘門目的就是揭露問題。執行者不需修復題庫，只需確認腳本本身正確執行並輸出錯誤訊息，然後在 Report 中記錄「CQI Gate 目前失敗，詳見輸出」。

---

### Step 3：Playwright 三瀏覽器 + 新增 spec

**3.1 修改 `apps/v3_eidos/playwright.config.ts`**

找到 projects 陣列中的 Mobile Chrome 和 Mobile Safari 的註解，取消並加入 webkit：

```typescript
projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'] },
  },
  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'] },
  },
  {
    name: 'Mobile Chrome',
    use: { ...devices['Pixel 5'] },
  },
  {
    name: 'Mobile Safari',
    use: { ...devices['iPhone 12'] },
  },
],
```

**3.2 新增 `apps/v3_eidos/tests/about.spec.ts`**

驗證 About 頁各 Tab 正常：E3 題庫總覽、E4 出題原則、E5 更版資訊、G6 六年級路由。

```typescript
import { test, expect } from '@playwright/test';

async function clearSetupOverlay(page: any) {
  const doneBtn = page.getByRole('button', { name: /完成設定/ });
  if (await doneBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await doneBtn.click();
  }
}

test.describe('About 頁驗證 (E3/E4/E5)', () => {
  test('E3: 題庫總覽可載入且有題數資料', async ({ page }) => {
    await page.goto('/g5/chi/s2/nani/about/overview');
    await clearSetupOverlay(page);
    await expect(page.locator('body')).not.toContainText('發生非預期錯誤');
    // 確認頁面有數字（題庫總覽應顯示題數）
    const body = await page.locator('body').textContent() ?? '';
    expect(/\d{3,}/.test(body)).toBeTruthy(); // 至少有3位數的數字
  });

  test('E4: 出題原則 Tab 可正常切換顯示', async ({ page }) => {
    await page.goto('/g5/chi/s2/nani/about/principles');
    await clearSetupOverlay(page);
    await expect(page.locator('body')).not.toContainText('發生非預期錯誤');
    await expect(page.locator('body')).not.toContainText('畫面暫時發生錯誤');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 8000 });
  });

  test('E5: 更版資訊 Tab 可載入', async ({ page }) => {
    await page.goto('/g5/chi/s2/nani/about/changelog');
    await clearSetupOverlay(page);
    await expect(page.locator('body')).not.toContainText('發生非預期錯誤');
  });
});

test.describe('G6 六年級路由驗證', () => {
  test('G6: 六年級國語翰林路由可載入且有題目', async ({ page }) => {
    await page.goto('/g6/chi/s2/hlm');
    await clearSetupOverlay(page);
    await expect(page.locator('body')).not.toContainText('發生非預期錯誤');
    await expect(page.locator('body')).not.toContainText('畫面暫時發生錯誤');
    // 確認有按鈕可選（課程列表）
    const buttons = page.locator('button');
    expect(await buttons.count()).toBeGreaterThan(3);
  });
});
```

**3.3 新增 `apps/v3_eidos/tests/error-boundary.spec.ts`**

驗證容錯行為：

```typescript
import { test, expect } from '@playwright/test';

test.describe('容錯與邊界情況驗證 (E6-E8)', () => {
  test('E6: API 500 時前台不顯示白畫面或崩潰', async ({ page }) => {
    // 攔截所有 API 請求回傳 500
    await page.route('**/api/**', route => route.fulfill({
      status: 500,
      body: 'Internal Server Error',
    }));
    await page.goto('/');
    await page.waitForTimeout(2000);
    // 前台應顯示某些內容而非白畫面
    const body = await page.locator('body').textContent() ?? '';
    expect(body.trim().length).toBeGreaterThan(0);
    await expect(page.locator('body')).not.toContainText('畫面暫時發生錯誤');
  });

  test('E7: 題庫 JSON 404 時顯示友善提示而非崩潰', async ({ page }) => {
    // 攔截題庫 JSON 請求回傳 404
    await page.route('**/question/platform/**/*.json', route => route.fulfill({
      status: 404,
      body: 'Not Found',
    }));
    await page.goto('/g5/chi/s2/nani');
    await page.waitForTimeout(3000);
    // 不應有 JS 崩潰
    await expect(page.locator('body')).not.toContainText('畫面暫時發生錯誤');
    // 應有某種提示（「暫無題目」或主選單仍可見）
    const hasGraceful =
      await page.locator('body').filter({ hasText: /暫無題目|尚無題庫|無法載入/ }).isVisible({ timeout: 2000 }).catch(() => false) ||
      await page.getByRole('heading', { level: 1 }).first().isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasGraceful).toBeTruthy();
  });

  test('E8: 斷網（離線）時前台不崩潰', async ({ page, context }) => {
    await page.goto('/g5/chi/s2/nani');
    await page.waitForTimeout(1000);
    // 模擬斷網
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    // 不應出現 JS 錯誤崩潰訊息
    await expect(page.locator('body')).not.toContainText('畫面暫時發生錯誤');
  });
});
```

執行驗證：
```bash
cd apps/v3_eidos
npx playwright test tests/about.spec.ts tests/error-boundary.spec.ts --project=chromium
```

---

### Step 4：更新 `_agent/skills/ei_release/SKILL.md`

將現有 SKILL.md 改為以下內容：

```markdown
---
name: ei_release
description: 上版前全站測試（Release Gate）— 觸發器，推送生產環境前執行
---

# ei_release

**觸發**：推送 Cloudflare Pages 前，或 `/ei_release`。

## 自動化閘門（必做）

```bash
bash scripts/release_gate.sh
```

此指令依序執行：
1. `npm run test` — 單元測試（Vitest）
2. `npm run build` — 建置產出
3. `generate_library_stats.js` — 統計數據更新
4. `verify_and_build.js` — manifest 一致性
5. `evaluate_question_quality.js --gate` — CQI 品質閘門
6. `verify_format_consistency.js` — 格式一致性

日誌輸出至：`scripts/orchestrator-logs/release_gate_YYYYMMDD_HHMMSS.log`

## 手動驗收 Checklist（自動化完成後）

- [ ] About 頁題庫總覽數字正確（≥ 3,000 題）
- [ ] 後台登入與 `/api/settings` API 正常
- [ ] Cloudflare Build 設定對齊（Branch, Build Command, 環境變數）
- [ ] 上線後 30 分鐘煙霧測試（Worker 5xx 監控）
```

---

### Step 5：更新 `docs/上版前整體驗證與檢查清單.md`

在現有檔案基礎上新增以下四個區塊：

**§二 補充 Q4**（在 Q3 後插入）：
```markdown
| Q4 | CQI 品質閘門 | `bash scripts/release_gate.sh` | exit 0 且無 QL1/BIAS/BROKEN |
```

**§三 補充 E6-E8**（在 G6 後插入）：
```markdown
| E6 | API 500 容錯 | DevTools → Network → Offline 或 Playwright 攔截 | 前台無白畫面/崩潰 |
| E7 | 題庫 404 容錯 | Playwright route 攔截 JSON 404 | 顯示友善提示 |
| E8 | 離線恢復 | context.setOffline(true) | 不崩潰 |
```

**§四 補充 V5-V6**（在 V4 後插入）：
```markdown
| V5 | webkit (Safari) | `npx playwright test --project=webkit` | 全通過 |
| V6 | Mobile Safari | `npx playwright test --project='Mobile Safari'` | 全通過 |
```

**§六 補充 R1**（在現有回報表格後插入）：
```markdown
| R1 | 回報端到端 | 送出一則回報 → 後台 API 或 DB 確認收到 | 有記錄 |
```

**附錄 Z 同步更新**（Z.1 補充 Q4、Z.2 補充 E6-E8、Z.3 補充 V5-V6、Z.5 補充 R1）

更新 `last_updated` 欄位為執行日期。

---

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `apps/v3_eidos/package.json` | npm scripts、依賴版本 |
| `apps/v3_eidos/playwright.config.ts` | Playwright 設定 |
| `apps/v3_eidos/tests/` | 現有 E2E spec |
| `scripts/evaluate_question_quality.js` | CQI 評分腳本 |
| `scripts/release_gate.sh` | **本 JOB 新建** |
| `_agent/skills/ei_release/SKILL.md` | 上版技能（本 JOB 更新） |
| `docs/上版前整體驗證與檢查清單.md` | 驗收清單（本 JOB 更新） |

---

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] 已讀取：`docs/技術設定/前端開發與AI實作守則.md`
- [ ] 已確認本 JOB 範圍：只改工程文件，不動題庫 JSON
- [ ] 確認 Node.js 版本：`node --version`（≥ 18）
- [ ] 確認 `apps/v3_eidos/node_modules` 存在（若無，先 `npm install`）
- [ ] 確認 `npx playwright install` 已安裝所有瀏覽器

---

## ✅ 驗收 Checklist (Acceptance)

> 每一項需提供佐證（指令輸出截圖或 log），不得僅靠自我判斷打勾。

- [ ] **Step 1**：`npm run test` exit 0，附測試輸出（顯示 N tests passed）
- [ ] **Step 2**：`bash scripts/release_gate.sh` 執行完整 6 步，附最後幾行輸出；CQI Gate 失敗屬預期，記錄失敗訊息即可
- [ ] **Step 3a**：`playwright.config.ts` 已啟用 webkit + Mobile Chrome + Mobile Safari
- [ ] **Step 3b**：`tests/about.spec.ts` 存在，chromium 執行全通過
- [ ] **Step 3c**：`tests/error-boundary.spec.ts` 存在，chromium 執行全通過（E7/E8 可能因環境限制 skip，需記錄原因）
- [ ] **Step 4**：`_agent/skills/ei_release/SKILL.md` 已更新，包含 `release_gate.sh` 指令
- [ ] **Step 5**：`docs/上版前整體驗證與檢查清單.md` 已補充 Q4/E6-E8/V5-V6/R1，`last_updated` 更新

---

## ✅ 成果 Checklist (Deliverables)

- [ ] 產出 `jobs/JOB-187-Report.md`，列出所有修改的檔案路徑
- [ ] Report 含 `npm run test` 輸出（N tests passed）
- [ ] Report 含 `release_gate.sh` 執行摘要
- [ ] 執行 `/pj_sync`

---

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:{真實Meta中數字} | 花費: ${換算台幣} | 使用模型: {真實Meta中的模型代碼} | 執行者: Cursor
