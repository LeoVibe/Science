# JOB-045 & JOB-046 整合完工報告：出題原則視覺重構與動態整合

*Completed by Antigravity (PM) at 2026-02-28 21:50*

## 第一部分：開發成果摘要

本次任務將 **JOB-045 (邏輯整合)** 與 **JOB-046 (視覺重構)** 合併執行，達成「邏輯動態化」與「設計精緻化」的雙重目標。

### 1. 視覺重構：內嵌式「出題原則」簡介區塊 (JOB-046) 
- **移除大按鈕**：刪除原本位於測驗主選單右上方突兀的「本科出題指南」按鈕。
- **標題下方嵌入**：在科目標題下方新增一個極簡、優雅的「出題原則」簡介區塊。
  - 樣式採用 `bg-muted/30` 柔和背景，搭配 `💡` 圖示與感性預覽文字。
  - 具備 Hover 特效與「👉 詳看命題心法」引導文案，點擊即可滑出側邊詳細欄。
- **職人級感性文案**：針對三年級五大科目注入專屬的教育哲學文案（如：國語的「語境推論」、數學的「算用合一」）。

### 2. 動態邏輯與名詞正名 (JOB-045 & JOB-046)
- **全面正名**：將全站「出題指南」正式更名為「出題原則」，包含：
  - `SubjectPrincipleDrawer` (原 SubjectGuideDrawer)
  - `subjectPrincipleContent` (原 subjectGuideContent)
  - Onboarding Modal、About 頁面分頁、與專業悄悄話內的相關名詞。
- **動態 Onboarding**：修正 `OnboardingModal` 邏輯，當使用者選定年級時，會精準推送「📌 X年級適用的出題策略」，並導引至標題下方的簡介區塊。

---

## 第二部分：變更檔案清單

| 檔案 | 狀態 | 變更說明 |
|------|------|----------|
| `apps/v3_eidos/src/components/MainMenu.tsx` | [MODIFY] | 視覺重構：移除按鈕，改為標題下方的內嵌簡介區塊。 |
| `apps/v3_eidos/src/components/SubjectPrincipleDrawer.tsx` | [NEW] | 從 `SubjectGuideDrawer.tsx` 重命名並修正 UI 文案。 |
| `apps/v3_eidos/src/data/subjectPrincipleContent.ts` | [NEW] | 從 `subjectGuideContent.ts` 重命名，注入三年級五科大量感性文案。 |
| `apps/v3_eidos/src/components/OnboardingModal.tsx` | [MODIFY] | 正名為「出題原則」，並優化導引文字。 |
| `apps/v3_eidos/src/pages/Index.tsx` | [MODIFY] | 向下相容 Prop 正名與路徑導引。 |
| `apps/v3_eidos/src/components/AboutView.tsx` | [MODIFY] | Tab 標籤與內文標題正名為「出題原則」。 |

---

## 第三部分：驗收檢查清單 (DoD)

- [x] **視覺規範**：`MainMenu` 右上方已無按鈕，改為標題下方的簡介區塊。
- [x] **名詞一致**：全站搜尋「出題指南」均已替換為「出題原則」。
- [x] **感性注入**：三年級國語顯示「從閱讀中找回主動權」、數學顯示「算用合一」等專屬文案。
- [x] **動態連動**：Onboarding Modal 顯示之年級策略與當前 Profile 一致。
- [x] **穩定性**：`npm run build` 通過，無 Lint 錯誤。

---

## 第四部分：給使用者的建議

1. **感官測試**：請進入「三年級國語」或「三年級數學」主頁，體驗標題下方那個帶點隨機簡介感的區塊，是否感覺比以前的大按鈕更專業、更有「教育品牌」的重量感？
2. **名詞查核**：您可以點擊「關於」頁面，確認 Tab 是否已更新為「📖 出題原則」。

**任務結案狀態：建議轉為 🟢 DONE**
