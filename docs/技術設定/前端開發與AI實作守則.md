---
last_updated: 2026-04-19
updated_by: Claude Code (claude-opus-4-7)
description: 專案 UI/UX 與色彩設計規範 — 指導 AI 如何讀取規格書與防呆
---

# 介面與色彩設計 AI 工作流 (Design Workflow)

> **觸發時機**：當使用者指令涉及「修改介面顏色」、「新增 UI 元件」、「調整排版佈局」時，AI 必須遵守此工作流。

## 禁止事項

1. **禁止硬編碼色碼**
   - 不可在 UI 元件（`.tsx`）中直接寫入 `hsl(200 40%...)` 或類似色碼。
   - 不可未經確認發明新的主題色。

2. **禁止擅自創造規格**
   - 不要憑空想像按鈕該長什麼樣、圓角要多大。

## SOP

1. **讀取規格書**
   - 在開始撰寫或修改任何介面程式碼之前，強制讀取 `../網站功能規格書.md`（相對本檔位置；從專案根為 `docs/網站功能規格書.md`）。
   - 所有關於顏色、排版、元件狀態（hover/active）、元件層次（shadow）的定義，一律以該文件為準。

2. **使用全域設計系統**
   - 本專案採 Tailwind CSS + shadcn/ui（見 `apps/v3_eidos/tailwind.config.ts` 與 `package.json`）。
   - 科目色透過 CSS 變數或 semantic class 呼叫，例如 `--subject-{theme}` 或 `subject-text-{theme}`。
   - 出版社色一律從 `apps/v3_eidos/src/data/config.ts` 的 `PUBLISHER_THEME_COLORS` 讀取。
   - 狀態色使用 Tailwind semantic 變數（如 `bg-destructive`、`text-muted-foreground`）。
   - 禁止在 JSX 內硬編碼 `hsl(...)` 等絕對色碼。

3. **維持輕量化與低負擔**
   - 這是針對國小學生設計的產品。
   - 避免純黑 `#000` 與純白 `#FFF` 極端對比。
   - 區塊分隔優先使用 `border-border/50`，而非生硬深色實線。

4. **更新規格書防脫節**
   - 當使用者明確要求一個**不在規格書內**的新設計（例如：新增一種紅色警告標籤），實作完成後，該新規格必須同步寫回 `../網站功能規格書.md`，並更新文件底部的變更紀錄。這可與 `/pj_sync` 一併執行。

5. **互動與視覺細節**
   - **微互動生命力**：按鈕、卡片 hover 時伴隨 `transition-all duration-300 ease-out` 與 `hover:shadow-md` 等立體浮現或 `active:scale-[0.98]` 微縮小效果。
   - **背景模糊**：Modal／浮動介面可使用 `backdrop-blur-*`，但以不破壞溫暖琥珀主題為前提（深色玻璃擬態與既有 warm amber 主題抵觸時不採用）。

6. **SEO 與語意化結構**
   - 自動將 `<div class="title">` 升級為真正的 `<h1>` 或 `<h2>`。
   - 清單必須用 `<ul>` 和 `<li>`，不用一堆 div 拼湊。
   - 所有可互動按鈕要具備合理的 `aria-label` 或乾淨的結構。

7. **清潔程式碼**
   - 測試用的 `fetch` 到不明路徑、或 `console.log("here")`，回報前自己清乾淨。
   - 臨時草稿或腳本只能放在 `/tmp/`，放在根目錄視為違規。
   - 所有路徑呼叫，禁止使用本機 OS 的 `Users/xxx/...` 絕對路徑，全數改為相對專案根目錄的 `apps/v3_eidos/src/...`。

## 測試硬性要求（2026-04-19 起）

因應 `questionLoader.ts` 誤讀 `answer_index` 導致全站正解錯位的事故（見 `docs/上版前驗證標準.md`），任何前端資料層或 UI 顯示層的改動，**必須**同時通過以下三層驗證才能 commit：

| 層級 | 驗證 | 觸發 |
|:--|:--|:--|
| L1 | `scripts/verify_ui_data_integrity.mjs --gate` | pre-commit hook 節點 3（碰到 `questionLoader.ts` 或 `question/platform/` 自動跑） |
| L2 | `questionLoader.test.ts` 單元測試 | 每次改 loader 須新增或更新對應測試 |
| L3 | `answer-integrity.spec.ts` Playwright e2e | 改 `QuizView` / `ReviewView` / `ResultView` 的顯示邏輯時必跑 |

**禁止**弱化任何一層；若新增 loader branch 或 UI 顯示邏輯，必須補上對應測試。詳細清單見 [`../上版前驗證標準.md`](../上版前驗證標準.md)。
