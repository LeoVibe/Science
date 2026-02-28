---
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
   - 當使用者明確要求一個**不在規格書內**的新設計（例如：新增一種紅色警告標籤），實作完成後，這項新規格**必須同步寫回** `docs/網站功能規格書.md`，並更新文件底部的變更紀錄。這可以與 `/sync` 流程合併執行。
