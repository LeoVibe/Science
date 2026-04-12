*Created by Claude Code (claude-haiku-4-5) at 2026-04-05*

`last_updated`: 2026-04-06
`updated_by`: Claude Code (claude-sonnet-4-6)
`status`: ✅ **完成結案**（2026-04-06；執行計畫詳見 JOB-159-PLAN；結案報告見 JOB-153-Report.md）

# JOB-153：G4 S2 國語 全版本品質驗證與補強

**`job_type`**: `mixed`（question_prod + question_verify）
**執行者**：Cursor / AG
**預計 API 消耗**：~600~800 RPD（補題 400~600 + 盲測 200）

---

## 📌 現況評估（普查數據）

### 題庫現況 ⚠️ 嚴重不足

| 版本 | 總題數 | 每課均題數 | 問題課次 |
|:---|:---:|:---:|:---|
| 翰林 HanLin | ~180 | 15 | **L7~L12 各 1 題（接近空殼）** |
| 康軒 KangHsuan | ~184 | 15 | **L7、L10 共 0 題（完全空殼）** |
| 南一 NanYi | ~180 | 15 | **L9~L12 各 1 題** |

**目標缺口**：各版本需從約 180 題補至 360 題（12 課 × 30 題），
需新增約 **540 題**（每版本 ~180 題）。

### KL4 研究素材
- ✅ 翰林/康軒/南一 KL4 單課研究紀錄完整（72 檔）
- ✅ 考古題與討論副檔齊全
- 無需補充研究素材，可直接進行出題

### 盲測狀態
- ❌ 全部 36 個 JSON 檔均未執行盲測（`blind_evaluation` 欄位未設定）

---

## 🎯 任務目標

1. **補題**：三版本各課補至 30 題（重點：L7~L12）
2. **盲測驗證**：三版本全部 36 課，Match Rate ≥ 85%
3. **品質評估**：CQI-P ≥ 5.5（各課均值）
4. **Mismatch 處理**：確認或修正所有 Mismatch 題目

---

## 📖 執行步驟

### Step 1：題庫補強（預計 2~3 天）

優先補充以下缺口課次：

**翰林 HanLin**（目標：L1~L12 各 30 題）
```bash
# 檢查現況
node scripts/evaluate_question_quality.js \
  question/platform/G4/Chinese/S2/HanLin

# 補題（針對不足課次）
node scripts/auto_generate_questions.js \
  question/platform/G4/Chinese/S2/HanLin \
  --key Yotta --target 30 --threshold 5.5
```

**康軒 KangHsuan**（特別注意：L7、L10 完全空殼）
```bash
node scripts/auto_generate_questions.js \
  question/platform/G4/Chinese/S2/KangHsuan \
  --key Yotta --target 30 --threshold 5.5
```

**南一 NanYi**（重點：L9~L12）
```bash
node scripts/auto_generate_questions.js \
  question/platform/G4/Chinese/S2/NanYi \
  --key Yotta --target 30 --threshold 5.5
```

**補題品質卡點**：
- 每課補完後即執行 `evaluate_question_quality.js` 確認 CQI-P ≥ 5.5
- 若 CQI-P < 5.5 → 停止，回報 Claude Code 決策

### Step 2：盲測全量驗證（預計 1 天）

```bash
node scripts/run_blind_eval.js \
  question/platform/G4/Chinese/S2/HanLin --force

node scripts/run_blind_eval.js \
  question/platform/G4/Chinese/S2/KangHsuan --force

node scripts/run_blind_eval.js \
  question/platform/G4/Chinese/S2/NanYi --force
```

**驗收標準**：
- 各版本 Match Rate ≥ 85%
- 若 < 85% → 提取 Mismatch 清單，分析根因，回溯修題，重測

### Step 3：Mismatch 審視與修正

依 `question/README_驗證與盲測準則.md §2.5`：
- Mismatch > 2 題的課檔需人工審視
- 分類：AI 無法判斷（-1）/ AI 選錯（邏輯誤）/ answer_index 錯誤
- 修正後重新執行該課檔盲測

---

## ✅ 啟動 Checklist

- [ ] 已讀取 `question/README_驗證與盲測準則.md`
- [ ] 已讀取 `question/README_出題與品管準則.md`
- [ ] 已確認執行模型：Gemini-3.1-Flash-Lite（Yotta 金鑰）
- [ ] 已確認各版本題數缺口（執行前先跑 evaluate_question_quality）

---

## ✅ 驗收 Checklist

### 補題
- [ ] 翰林 L1~L12 各 ≥ 30 題（特別確認 L7~L12）
- [ ] 康軒 L1~L12 各 ≥ 30 題（特別確認 L7、L10）
- [ ] 南一 L1~L12 各 ≥ 30 題（特別確認 L9~L12）
- [ ] 補題 CQI-P 全部 ≥ 5.5

### 盲測
- [ ] 翰林 Match Rate ≥ 85%
- [ ] 康軒 Match Rate ≥ 85%
- [ ] 南一 Match Rate ≥ 85%
- [ ] 所有 Mismatch 題目已處理（confirmed 或 corrected）

### 結案
- [ ] `JOB-153-Report.md` 已產出（含三版本 Match Rate 表、Mismatch 清單、修正記錄）
- [ ] 已執行 `/pj_sync`

---

## 💲 成本預估

| 項目 | 消耗 |
|:---|:---|
| 補題（~540 題） | ~400~600 RPD |
| 盲測（~1,080 題） | ~200 RPD |
| **合計** | **~600~800 RPD** |
| **使用金鑰** | Yotta（Gemini-3.1-Flash-Lite） |
| **預計工期** | 3~4 天 |

---

## 真實回報本次對話的模型與花費

＄作業匯總：Token數:- | 花費:- | 使用模型:- | 執行者:-
