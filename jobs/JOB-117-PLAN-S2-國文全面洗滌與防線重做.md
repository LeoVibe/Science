# JOB-117-PLAN-S2-國文全面洗滌與防線重做
`last_updated`: 2026-03-27 16:00
`updated_by`: Claude 3.7 Sonnet

## 📌 任務背景與目的 (Background & Purpose)
基於 JOB-116 之全面品質檢討，確認先前以 JOB-102 產出之國文題庫存在「內容污染」與「題幹截斷」等結構性缺陷（特別是南一 G3 L4 等單元）。
本次任務（JOB-117）將**徹底落實 v4.0 出題與品管準則**，透過 TCG (主題相關度閘門) 自動掃描污染題目，進行洗滌、重做與 V6.1 版本的盲測試驗。

## 🎯 執行策略與範圍 (Strategy & Scope)

### Phase 1：先導測試 (Pilot Test) - 南一版 G3 國文 L1-L12
以此作為防線機制的練兵場，驗證自動化剔除與重產流程是否順暢。
1. **TCG 掃描與標記**：執行開發腳本掃描 G3 南一版 L1-L12，自動偵測出與課綱主題偏離過大的題目。
2. **污染單元全量重產**：針對 TCG 標出大面積污染的單元（已知含 L4），直接進行整檔清空重產。
3. **V6.1 嚴格盲審**：使用 `run_blind_eval.js` 搭配 `BATCH_SIZE=10` 對所有重做/洗滌後的題目進行盲核。

### Phase 2：擴展批次重做 (Batch Roll-out) - 全年級 S2 L1-L6
在 Phase 1 確認防線有效後，將此三步驟套用至所有版本與年級：
- 範圍：G3, G4, G5, G6 下學期 國語科
- 課次：L1 ~ L6 (各版前六課)
- 目標：確保持續擴產的這批核心課次 100% 符合 QL4 品質，無內容污染。

---

## 💡 執行細節與報告要求 (Execution & Reporting)

1. **腳本開發**：
   - 首先需撰寫獨立的 `scan_tcg_pollution.js` (或於現有腳本增強)，用以計算 `meta.title`/`meta.theme` 與各題目的詞彙重疊度。
   - 若重疊度異常低，自動記錄。

2. **缺陷報告與記錄 (Error Tracking)**：
   - 執行時，必須詳細捕捉被 TCG 標記的「錯誤題目」（如 L4 中的森林、夕陽等題目），保留「污染前」與「修正後」的差異紀錄。
   - 將這些發現寫入本派工單之成果報告 (JOB-117-Report.md) 中。

3. **雙重審核 (Double Checks)**：
   - 所有產出必須再次經過 `evaluate_question_quality.js` 確定 `CQI-P >= 5.5`。
   - BATCH=10 盲測後，Match Rate 必須達 85% 以上，且提供日誌檔。

## 📋 工作勾選單 (Task Checklist)

- [ ] 開發 `scripts/scan_tcg_pollution.js` 或增強現有過濾器。
- [ ] 執行 Phase 1 掃描 (南一 G3 國文 L1-L12)。
- [ ] 確定 Phase 1 高污染單元清單，執行單元重產。
- [ ] 執行 Phase 1 盲審 (Batch=10)。
- [ ] 撰寫 Phase 1 發現與缺陷明細。
- [ ] (後續) 展開至 Phase 2 全年級。

<＄作業匯總 ：Token數:0 | 花費: $0 | 使用模型: Claude 3.7 Sonnet | 執行者: AG>
