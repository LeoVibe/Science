# JOB-045 完工報告：動態出題指南 (Dynamic Curriculum Guidelines)

*Completed by Cursor at 2026-02-28*

## 開發成果摘要

### 1. 測驗主選單右上方「本科出題指南」
- 於 `MainMenu.tsx` 卡片**右上方**新增按鈕「📖 本科出題指南」，樣式為 `bg-primary/10`、`border-primary/20`，符合規格書語義色。
- 點擊後以 **Drawer** 自右側滑出 `SubjectGuideDrawer`，呈現該科專屬出題原則。
- **資料層**：新增 `src/data/subjectGuideContent.ts`，提供 `getSubjectGuideContent(grade, subject)`，目前內建附錄測試文案「三年級國語出題指南」（4-4-2、長文本降載、拒絕截搭題）；其餘年級/科目回傳預留結構，保留未來依參數讀取 CMS/API 的彈性。

### 2. 首登導覽 (OnboardingModal) 動態調整
- **情境 A（已選定年級）**：傳入 `hasChosenGrade={!!loadUserProfile()?.setupComplete}`、`grade={grade}`，Modal 內動態顯示「📌 {年級}年級適用的出題策略」區塊，並說明「到各科測驗頁後，點擊右上方『本科出題指南』可查看該科命題心法」。
- **情境 B（未設定年級）**：顯示通用提示「請先選擇年級與學期，之後可在各科測驗頁右上方查看『本科出題指南』」。
- **導引流向**：按鈕文案改為「👉 前往出題指南」，`onGoToDeepDive` 更名為 `onGoToGuide`，仍導向關於頁 `deepdive` 分頁；總綱內容改為使用 `CROSS_SUBJECT_GUIDE`（大腦友善同理心投射、迷思誘答診斷）與規格一致。

### 3. 名詞與入口統一為「出題指南」
- About 分頁「🔬 研究深探」改為「📖 出題指南」；該 Tab 區塊標題改為「出題指南」。
- `InsightDrawer` 內文「關於 → 研究深探」改為「關於 → 出題指南」。

## 變更檔案清單

| 檔案 | 變更類型 |
|------|----------|
| `apps/v3_eidos/src/data/subjectGuideContent.ts` | 新增：單科/跨科指南文案與 getSubjectGuideContent() |
| `apps/v3_eidos/src/components/SubjectGuideDrawer.tsx` | 新增：本科出題指南 Drawer |
| `apps/v3_eidos/src/components/MainMenu.tsx` | 修改：右上方「本科出題指南」按鈕、SubjectGuideDrawer 開關與內容注入 |
| `apps/v3_eidos/src/components/OnboardingModal.tsx` | 修改：hasChosenGrade/grade 連動、出題指南總綱、前往出題指南按鈕與文案 |
| `apps/v3_eidos/src/pages/Index.tsx` | 修改：OnboardingModal 傳入 onGoToGuide、hasChosenGrade、grade |
| `apps/v3_eidos/src/components/AboutView.tsx` | 修改：deepdive Tab 標籤與區塊標題改為「出題指南」 |
| `apps/v3_eidos/src/components/InsightDrawer.tsx` | 修改：「研究深探」→「出題指南」文案 |

## 驗證基準 (DoD) 對應

- [x] 各科測驗主選單頁面（如 G3 國語）右上方出現「本科出題指南」按鈕。
- [x] 點擊該按鈕可正確展開單科指南 Drawer，三年級國語以附錄測試文案顯示（4-4-2、長文本降載、拒絕截搭題）。
- [x] 首登 Modal 連結路徑與文案已依「出題指南」名詞更新，並依 hasChosenGrade/grade 動態顯示年級策略與導引。
- [x] 已產出 `JOB-045-Report.md`。

## 單元測試紀錄

- `npm run build`：通過。
- `npm run test`：24 個測試全數通過。

## PM 驗收建議

1. **本科出題指南**：進入任一年級/科目測驗主選單（如 G3 國語），確認右上方有「📖 本科出題指南」按鈕；點擊後右側滑出 Drawer，G3 國語應顯示三段落（4-4-2、長文本降載、拒絕截搭題）；關閉後再開其他科目，應有預留文案或通用說明。
2. **首登 Modal**：清除 `hasSeenValueOnboarding` 後重整。若已完成設定（有年級），Modal 應出現「📌 X年級適用的出題策略」；若未完成設定，應出現「請先選擇年級與學期…」。點「前往出題指南」應跳轉至關於 → 出題指南分頁。
3. **名詞一致**：關於頁分頁列與內容區塊應為「📖 出題指南」；專家悄悄話 Drawer 內應為「關於 → 出題指南」。
