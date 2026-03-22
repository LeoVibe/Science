---
last_updated: 2026-03-23 16:05
updated_by: Cursor Agent
description: 專案 UI/UX 與色彩設計規範 — 指導 AI 如何讀取規格書與防呆
---

# 🎨 介面與色彩設計 AI 工作流 (Design Workflow)

> **觸發時機**：當使用者指令涉及「修改介面顏色」、「新增 UI 元件」、「調整排版佈局」時，AI **必須**嚴格遵守此工作流。

## ⚠️ 絕對禁止的行為 (Strict Prohibitions)

1. **禁止硬編碼 (No Hardcoding)**
   - 絕不可以在 UI 元件 (`.tsx`) 中直接寫入 `hsl(200 40%...)` 或類似色碼。 
   - 絕不可以在沒有確認的情況下發明新的主題色。

2. **禁止擅自創造規格**
   - 不要憑空想像按鈕該長什麼樣、圓角要多大。

## ✅ 必須執行的 SOP (Required Operations)

1. **讀取唯一真理 (Single Source of Truth)**
   - 在開始撰寫或修改任何介面程式碼之前，**強制讀取** `docs/網站功能規格書.md`。
   - 所有關於顏色、排版、元件狀態 (hover/active)、元件層次 (shadow) 的定義，一律以該文件為準。

2. **使用全域設計系統**
   - 科目色一律透過 CSS 變數呼叫，例如：`--subject-{theme}` 或套用預設的 Tailwind 擴展 class（如 `subject-text-{theme}`）。
   - 出版社色一律從 `src/data/config.ts` 中讀取 `PUBLISHER_THEME_COLORS` 變數。
   - 狀態色一律使用 Tailwind Semantic 變數（如 `bg-destructive`, `text-muted-foreground`）。

3. **維持輕量化與低負擔 (Lightweight & Clean)**
   - 這是針對國小學生設計的產品。
   - 避免純黑 `#000` 與純白 `#FFF` 極端對比。
   - 區塊分隔優先使用 `border-border/50`，而非生硬深色的實線。

4. **更新規格書防脫節**
   - 當使用者明確要求一個**不在規格書內**的新設計（例如：新增一種紅色警告標籤），實作完成後，這項新規格**必須同步寫回** `docs/網站功能規格書.md`，並更新文件底部的變更紀錄。這可以與 **`/dosync`** 全域文件同步流程一併執行（見 `_agent/skills/dosync/SKILL.md`）。

5. **頂規設計美學與互動 (Premium Aesthetics)**
   - **微互動生命力 (Micro-Animations)**：所有的按鈕、卡片 hover 時，必須伴隨 `transition-all duration-300 ease-out` 加上 `hover:shadow-md` 等立體浮現或微縮小 (`active:scale-[0.98]`) 效果。
   - **Glassmorphism (毛玻璃)**：在對話框、Modal 或浮動介面，大膽使用背景模糊效果 (`backdrop-filter`) 來增添層次感。
   - **拒絕 Utility-first 框架污染**：絕對禁止使用 TailwindCSS 等 Utility-first 框架（除非大 PM 特批）。本專案採行 Vanilla CSS (CSS Modules 或純 `.css` 檔案)，並嚴禁在元件上留下長串 `className="..."` 或 Inline style 污染。

6. **SEO 與語意化結構 (Semantic HTML)**
   - 自動將 `<div class="title">` 升級為真正的 `<h1>` 或 `<h2>`。
   - 如果是清單，必須用 `<ul>` 和 `<li>`，禁忌用一堆 div 拼湊。
   - 所有可被互動的按鈕都要具備合理的 `aria-label` 或是乾淨的結構，因為要確保教育防呆。

7. **嚴格不留技術債 (No Garbage Left Behind)**
   - 測試用的 `fetch` 到不明路徑、或 `console.log("here")`，在回報給 PM 前自己清乾淨。
   - 臨時建立的草稿或腳本只能放在 `/tmp/`，一旦被發現放在根目錄，視為違規。
   - 所有路徑的呼叫，嚴禁使用本機 OS 的 `Users/xxx/...` 絕對路徑，全數改為相對專案根目錄的 `src/...`。
