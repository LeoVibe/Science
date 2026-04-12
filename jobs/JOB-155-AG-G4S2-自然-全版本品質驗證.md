*Created by Claude Code (claude-haiku-4-5) at 2026-04-05*

`last_updated`: 2026-04-05
`updated_by`: Claude Code (claude-haiku-4-5)

# JOB-155：G4 S2 自然 全版本品質驗證與補強

**`job_type`**: `mixed`（question_prod + question_verify）
**執行者**：Cursor / AG
**預計 API 消耗**：~250~350 RPD（補題 150~200 + 盲測 100）

---

## 📌 現況評估（普查數據）

### 題庫現況 ⚠️ 題數偏少

| 版本 | 課數 | 總題數 | 每課均題數 | 狀態 |
|:---|:---:|:---:|:---:|:---|
| 翰林 HanLin | 4 | ~60 | 15 | ⚠️ 每課 15 題，需補至 25 題 |
| 康軒 KangHsuan | 4 | ~60 | 15 | ⚠️ 每課 15 題，需補至 25 題 |
| 南一 NanYi | 4 | ~65 | 16 | ⚠️ 每課約 16 題（L2 達 20 題） |

**目標缺口**：各版本需從 ~60 題補至 100 題（4 課 × 25 題），
需新增約 **120 題**（每版本約 40 題）。

> 📌 **G4 自然注意事項**：G4 自然僅 4 課（非 12 課），每課目標調降為 25 題（非 30 題），
> 因課次結構與其他科目不同。

### KL4 研究素材
- ✅ 共用素材庫完整
- 可直接進行出題

### 盲測狀態
- ❌ 全部 12 個 JSON 檔均未執行盲測

---

## 🎯 任務目標

1. **補題**：三版本各課補至 25 題
2. **盲測驗證**：三版本全部 12 課，Match Rate ≥ 85%
3. **CQI-P**：各課 ≥ 5.5
4. **Mismatch 處理**：確認或修正所有 Mismatch 題目

---

## 📖 執行步驟

### Step 1：題庫補強

```bash
# 檢查現況
node scripts/evaluate_question_quality.js \
  question/platform/G4/Science/S2/HanLin
node scripts/evaluate_question_quality.js \
  question/platform/G4/Science/S2/KangHsuan
node scripts/evaluate_question_quality.js \
  question/platform/G4/Science/S2/NanYi

# 補題（目標每課 25 題）
node scripts/auto_generate_questions.js \
  question/platform/G4/Science/S2/HanLin \
  --key Yotta --target 25 --threshold 5.5

node scripts/auto_generate_questions.js \
  question/platform/G4/Science/S2/KangHsuan \
  --key Yotta --target 25 --threshold 5.5

node scripts/auto_generate_questions.js \
  question/platform/G4/Science/S2/NanYi \
  --key Yotta --target 25 --threshold 5.5
```

### Step 2：盲測全量執行

```bash
node scripts/run_blind_eval.js \
  question/platform/G4/Science/S2/HanLin --force

node scripts/run_blind_eval.js \
  question/platform/G4/Science/S2/KangHsuan --force

node scripts/run_blind_eval.js \
  question/platform/G4/Science/S2/NanYi --force
```

### Step 3：Mismatch 審視

自然科 Mismatch 常見根因（參考 G3 S2 自然 99%+ 先例）：
- 自然科 AI 理解能力較強，預期 Match Rate 應高（≥ 95%）
- 若低於 90% 需特別調查

---

## ✅ 驗收 Checklist

### 補題
- [ ] 翰林 L1~L4 各 ≥ 25 題
- [ ] 康軒 L1~L4 各 ≥ 25 題
- [ ] 南一 L1~L4 各 ≥ 25 題
- [ ] 補題 CQI-P 全部 ≥ 5.5

### 盲測
- [ ] 翰林 Match Rate ≥ 85%
- [ ] 康軒 Match Rate ≥ 85%
- [ ] 南一 Match Rate ≥ 85%
- [ ] 所有 Mismatch 已處理

### 結案
- [ ] `JOB-155-Report.md` 已產出
- [ ] 已執行 `/pj_sync`

---

## 💲 成本預估

| 項目 | 消耗 |
|:---|:---|
| 補題（~120 題） | ~150~200 RPD |
| 盲測（~300 題） | ~100 RPD |
| **合計** | **~250~350 RPD** |
| **預計工期** | 2~3 天 |

---

## 真實回報本次對話的模型與花費

＄作業匯總：Token數:- | 花費:- | 使用模型:- | 執行者:-
