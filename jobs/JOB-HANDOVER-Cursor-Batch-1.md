# 🚀 Cursor 開發交接手冊 (JOB 36 / 38 / 42)

Cursor 您好，這是一份經過 PM (Antigravity) 嚴格邏輯檢驗的綜合開發交接單。
請依序執行下列 3 個 JOB。它們彼此在 DOM 結構與頁面路由上**互不干擾、互為補充**。

---

## 📅 任務一：JOB-036 (測驗 UI 體驗優化)
**目標**：修改核心 DOM 佈局，放大首頁測驗按鈕的觸控範圍與字體，並連動動態題數。
*   **指派命令**：
    > 「請讀取 `jobs/JOB-036-USER-Quiz-UI-Experience-Refinement.md`。前往 `MainMenu.tsx` 將挑戰按鈕的字級提升。同時閱讀 `storage.ts` 取出 `maxQuizQuestions` 變數並動態顯示在按鈕上。完成後執行單元測試，並寫入 JOB-036-Report.md。」
*   **注意**：這是佈局級的神經元修改，請確保 RWD 手機版不要產生文字溢出 (Overflow)。

## 📅 任務二：JOB-038 (內容探討專區與家長互動)
**目標**：建立一個獨立的長文「研究專頁」，並實作文章渲染與按讚/留言機制。
*   **指派命令**：
    > 「請讀取 `jobs/JOB-038-USER-Content-Deep-Dive-and-Parent-Interaction.md`。在 `AboutView.tsx` 或合適的首頁入口建立一個『研究深探』獨立分頁。請預先寫死兩篇指定的 Markdown 首波文章並正確渲染。完成後寫入 JOB-038-Report.md。」
*   **注意**：這是一個獨立路由 (Route/View)，請確保與現有作答流程完全解耦。

## 📅 任務三：JOB-042 (教育價值微型導覽 Modal & Tooltip)
**目標**：在作答流程中的特定節點，使用不佔據空間的 Z-index 元件（彈窗與氣泡）傳遞系統價值。
*   **指派命令**：
    > 「請讀取 `jobs/JOB-042-USER-Value-Proposition-UX-Implementation.md` 規劃實作三個新元件。首要條件是：`OnboardingModal` 必須依賴 LocalStorage 防擾民，且在 Modal 的按鈕中加入連結，引導家長前往你剛剛在 JOB-038 做好的『內容探討專區』。完成後寫入 JOB-042-Report.md。」
*   **注意**：這批元件都是覆蓋層 (Overlay)。開發時請遵循 `.cursorrules` 的禁止 Hardcode 規範，並沿用 `Warm Amber` 暖調配色。

---
> ⚠️ **To Cursor 的最高指令**：開工前請確認這三份 `.md` 裡面的 `驗證基準 (DoD)` 區塊是否完整。若發現任何實作技術上的衝突，請立即停止該項變更並在 Report 中呼叫 AG。
