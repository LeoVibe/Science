*Created by Claude Code (claude-haiku-4-5) at 2026-04-05*

`last_updated`: 2026-04-05
`updated_by`: Claude Code (claude-haiku-4-5)

# JOB-156：G4 S2 社會 全版本品質驗證與補強

**`job_type`**: `mixed`（question_prod + question_verify）
**執行者**：Cursor / AG
**預計 API 消耗**：~500~700 RPD（補題 400~500 + 盲測 100~200）

---

## 📌 現況評估（普查數據）

### 題庫現況 🚨 嚴重不足

| 版本 | 課數 | 總題數 | 每課均題數 | 狀態 |
|:---|:---:|:---:|:---:|:---|
| 翰林 HanLin | 6 | ~34 | **5.7** | 🚨 嚴重不足 |
| 康軒 KangHsuan | 6 | ~32 | **5.3** | 🚨 嚴重不足 |
| 南一 NanYi | 6 | ~38 | **6.3** | 🚨 嚴重不足 |

**目標缺口**：各版本需從約 35 題補至 150 題（6 課 × 25 題），
需新增約 **345 題**（每版本約 115 題）。

> 🚨 **高工作量警告**：G4 S2 社會為本次驗證中補題需求最大的科目，
> 每課現況僅 5~6 題，需補至 25 題，工作量約為自然科的 3 倍。
> 建議優先排程，避免成為瓶頸。

### KL4 研究素材
- ✅ 共用素材庫完整
- ⚠️ 若 KL4 副檔「誘答機制」分析不足，可能影響出題品質
- 建議出題前先確認各課誘答機制已記錄

### 盲測狀態
- ❌ 全部 18 個 JSON 檔均未執行盲測

---

## 🎯 任務目標

1. **補題**：三版本各課補至 25 題（需新增 ~345 題）
2. **盲測驗證**：三版本全部 18 課，Match Rate ≥ 85%
3. **CQI-P**：各課 ≥ 5.5
4. **Mismatch 處理**：確認或修正所有 Mismatch 題目

---

## 📖 執行步驟

### Step 1：KL4 素材確認（重要前置）

社會科題目需有明確的課綱依據，補題前先確認：
```bash
# 確認各課 KL4 副檔存在
find knowledge/1_課綱研究/社會/四下/ -name "KL4*.md" | sort
```

- 若 KL4 副檔缺漏 → 先回報 Claude Code，不得直接補題
- 確認後才啟動補題程序

### Step 2：分批補題（建議分三天執行）

**Day 1：翰林**
```bash
node scripts/auto_generate_questions.js \
  question/platform/G4/SocialStudies/S2/HanLin \
  --key Yotta --target 25 --threshold 5.5
```

**Day 2：康軒**
```bash
node scripts/auto_generate_questions.js \
  question/platform/G4/SocialStudies/S2/KangHsuan \
  --key Yotta --target 25 --threshold 5.5
```

**Day 3：南一**
```bash
node scripts/auto_generate_questions.js \
  question/platform/G4/SocialStudies/S2/NanYi \
  --key Yotta --target 25 --threshold 5.5
```

**補題品質卡點**：每版本補完後立即執行 CQI-P 評估，
若平均 CQI-P < 5.5 → 停止並回報。

### Step 3：盲測全量執行

```bash
node scripts/run_blind_eval.js \
  question/platform/G4/SocialStudies/S2/HanLin --force

node scripts/run_blind_eval.js \
  question/platform/G4/SocialStudies/S2/KangHsuan --force

node scripts/run_blind_eval.js \
  question/platform/G4/SocialStudies/S2/NanYi --force
```

---

## ⚠️ 風險評估

| 風險 | 機率 | 影響 | 緩解方案 |
|:---|:---:|:---:|:---|
| KL4 素材不足 | 中 | 高 | Step 1 前置確認 |
| 補題 CQI-P 低於 5.5 | 中 | 中 | 分批執行，及時回報 |
| API 配額耗盡 | 低 | 中 | 分三天執行，避免單日超量 |
| 補題題目重複性高 | 中 | 中 | 補題後人工抽查 5 題 |

---

## ✅ 驗收 Checklist

### KL4 前置
- [ ] 三版本 KL4 副檔確認存在

### 補題
- [ ] 翰林 L1~L6 各 ≥ 25 題
- [ ] 康軒 L1~L6 各 ≥ 25 題
- [ ] 南一 L1~L6 各 ≥ 25 題
- [ ] 補題 CQI-P 全部 ≥ 5.5

### 盲測
- [ ] 翰林 Match Rate ≥ 85%
- [ ] 康軒 Match Rate ≥ 85%
- [ ] 南一 Match Rate ≥ 85%

### 結案
- [ ] `JOB-156-Report.md` 已產出
- [ ] 已執行 `/pj_sync`

---

## 💲 成本預估

| 項目 | 消耗 |
|:---|:---|
| 補題（~345 題） | ~400~500 RPD |
| 盲測（~450 題） | ~100~200 RPD |
| **合計** | **~500~700 RPD** |
| **預計工期** | **4~5 天**（最長，建議優先啟動） |

---

## 真實回報本次對話的模型與花費

＄作業匯總：Token數:- | 花費:- | 使用模型:- | 執行者:-
