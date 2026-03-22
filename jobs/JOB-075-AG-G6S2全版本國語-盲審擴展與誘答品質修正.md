# JOB-075-AG-G6S2全版本國語-盲審擴展與誘答品質修正

**建立時間：** 2026-03-21 13:50  
**建立模型：** Antigravity-Agent  
**來源：** USER (依據 JOB-073 結案報告指示)  
**優先級：** 高  
**狀態：** 🔵 待處理

---

## 一、任務背景與目的

依據前案（JOB-073）針對「G6 S2 康軒國語」進行之 CQI v2 盲審實測結論，雖然盲測 Match 率高達 100%，但也確實驗證了目前高品質 L4 題庫存在的兩大潛在風險：
1. **誘答設計荒謬（鑑別度不足）**：錯誤選項往往過於直白、偏離常理（例如出現「外星人」、「豪華別墅」等）。
2. **選指偏差 (Position Bias)**：自動生成的 `answer_index` 高度集中（如連續出現 index 1），引發學生盲答僥倖心理。

為全面提升國小六年級下學期國語題庫之真實鑑別度，本次派工將「盲審驗證」擴大至**全版本**（康軒、翰林、南一），並針對上述缺失進行全盤修正。

---

## 二、處理範圍

目標目錄：
- `question/platform/G6/Chinese/KangHsuan/` (已完成部分盲側，需進行第二階段誘答修正與選項打散)
- `question/platform/G6/Chinese/HanLin/` (需進行盲測驗證、誘答修正、選項打散)
- `question/platform/G6/Chinese/NanI/` (需進行盲測驗證、誘答修正、選項打散)

---

## 三、預期結果清單 (Expected Outcomes Checklist)

### 階段一：翰林與南一盲審驗證擴增
- [ ] 執行翰林版全目錄盲審推論，並將驗證結果（`authoring_model`, `verifying_model`, `verification`, `blind_evaluation_note`）寫入 JSON。
- [ ] 執行南一版全目錄盲審推論，並將驗證結果寫入 JSON。
- [ ] 執行 `evaluate_question_quality.js` 結算翰林與南一的 CQI v2 分數。

### 階段二：全版本誘答品質優化
- [ ] 制定 Prompt 模板：引導 AI 將荒謬誘答替換為「具有合理情境但核心錯誤的迷思誘答」，以提升測驗鑑別度。
- [ ] 對康軒、翰林、南一三個版本的題庫執行誘答優化。

### 階段三：確保選項機率公平性
- [ ] 調用 `auto_balance_json.js` 對全版本 JSON 執行選項打散，避免 `L1 (BIAS)` 選項集中警告。
- [ ] 再次執行 `evaluate_question_quality.js` 確認所有檔案無 BIAS 警告，並結算最終成績。

### 階段四：收尾
- [ ] 撰寫 JOB-075-Report.md 詳述修正前後的品質變化。
- [ ] 執行 `/dosync` 文件全域同步。
