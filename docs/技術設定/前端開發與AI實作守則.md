---
last_updated: 2026-04-20
updated_by: Claude Code (claude-sonnet-4-6)
description: 前端開發守則 — 色彩/規格/測試三層硬閘
---

# 前端開發與 AI 實作守則

**技術棧**：Tailwind CSS + shadcn/ui（見 `apps/v3_eidos/tailwind.config.ts`）

---

## 硬閘

1. **禁止在 JSX 硬編碼色碼**
   不可寫 `hsl(200 40% ...)` 或 `#2563EB`。一律用 Tailwind semantic class（`bg-destructive`、`text-muted-foreground`）或 CSS 變數。

2. **禁止擅自發明規格**
   新的顏色、按鈕樣式、圓角尺寸——未經使用者確認不得自創。

---

## 工作流程

1. **修介面前先讀規格書**
   強制讀取 [`../網站功能規格書.md`](../網站功能規格書.md)。顏色、排版、元件狀態一律以該檔為準。

2. **色彩來源優先序**
   - 科目色：`--subject-{theme}` CSS 變數或 `subject-text-{theme}` class
   - 出版社色：`apps/v3_eidos/src/data/config.ts` 的 `PUBLISHER_THEME_COLORS`
   - 狀態色：Tailwind semantic（`bg-destructive`、`text-muted-foreground`）
   - 避免純黑 `#000` / 純白 `#FFF` 極端對比（國小生視覺疲勞）

3. **規格書同步**
   若新增規格書以外的設計，實作完成後把新規格寫回 [`../網站功能規格書.md`](../網站功能規格書.md)，一併在 `/pj_sync` 更新變更紀錄。

---

## 測試硬閘（2026-04-19 起）

因應 `questionLoader.ts` 誤讀 `answer_index` 事故（見 [`../上版前驗證標準.md`](../上版前驗證標準.md)），任何前端資料層或 UI 顯示層的改動必須通過三層驗證：

| 層級 | 驗證 | 觸發 |
|:--|:--|:--|
| L1-3 | `scripts/verify_ui_data_integrity.mjs --gate` | pre-commit hook 節點 3（碰到 `questionLoader.ts` 或 `question/platform/` 自動跑） |
| L2-1 | `questionLoader.test.ts` 單元測試 | 改 loader 須新增或更新對應測試 |
| L2-2 | `answer-integrity.spec.ts` Playwright e2e | 改 `QuizView` / `ReviewView` / `ResultView` 時必跑 |

**禁止**弱化任何一層；新增 loader branch 或 UI 顯示邏輯必須補上對應測試。

> 完整 L1 / L2 / L3 層級（含 L3 人工瀏覽器抽測）定義見 [`../上版前驗證標準.md`](../上版前驗證標準.md)。
