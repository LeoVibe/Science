*Created by Claude Code (claude-haiku-4-5) at 2026-04-05*

`last_updated`: 2026-04-05
`updated_by`: Claude Code (claude-haiku-4-5)

# JOB-157：G4 S2 英語 全版本品質驗證與結構重整

**`job_type`**: `mixed`（question_prod + question_verify）
**執行者**：Cursor / AG
**預計 API 消耗**：~400~500 RPD（重整 + 補題 300~400 + 盲測 100）

---

## 📌 現況評估（普查數據）

### 題庫現況 🚨 結構性失衡（優先處理）

| 版本 | 課數 | 總題數 | 問題描述 |
|:---|:---:|:---:|:---|
| 翰林 HanLin | 4 | 92 | 🚨 **L3 占 83.7%（77題）；L1/L2/L4 各僅 5 題** |
| 康軒 KangHsuan | 4 | 92 | 🚨 同上，結構相同 |
| 南一 NanYi | 4 | 92 | 🚨 同上，結構相同 |

**課別分佈（三版本一致）**：
| 課次 | 現況題數 | 目標題數 | 缺口 |
|:---:|:---:|:---:|:---:|
| L1 | 5 | 25 | **-20** |
| L2 | 5 | 25 | **-20** |
| L3 | 77 | 25 | **+52（超標）** |
| L4 | 5 | 25 | **-20** |

> 🚨 **結構性問題**：L3 題數嚴重超標（77 題）且 L1/L2/L4 嚴重不足（各 5 題）。
> 需要先「拆分 L3」或「補強 L1/L2/L4」再進行盲測。
> **建議方案**：優先補充 L1/L2/L4，L3 暫時保留 77 題（不刪除）。
> 此策略風險最低，避免誤刪已驗證內容。

### KL4 研究素材
- ✅ 共用素材庫完整

### 盲測狀態
- ❌ 全部 12 個 JSON 檔均未執行盲測
- ⚠️ L3（77 題）執行盲測耗時較長，需獨立安排

---

## 🎯 任務目標

1. **補題**：L1/L2/L4 各版本各課補至 25 題（不修改 L3）
2. **盲測驗證**：三版本全部 4 課，Match Rate ≥ 85%
3. **CQI-P**：各課 ≥ 5.5
4. **結構決策**：回報 Claude Code 關於 L3 長期處理方案

---

## 📖 執行步驟

### Step 1：補強 L1/L2/L4（優先執行）

```bash
# 翰林：補 L1/L2/L4 至各 25 題
node scripts/auto_generate_questions.js \
  question/platform/G4/English/S2/HanLin/G4_S2_ENG_HANLIN_L1.json \
  --key Yotta --target 25 --threshold 5.5

node scripts/auto_generate_questions.js \
  question/platform/G4/English/S2/HanLin/G4_S2_ENG_HANLIN_L2.json \
  --key Yotta --target 25 --threshold 5.5

node scripts/auto_generate_questions.js \
  question/platform/G4/English/S2/HanLin/G4_S2_ENG_HANLIN_L4.json \
  --key Yotta --target 25 --threshold 5.5

# 康軒/南一 同樣操作
```

### Step 2：盲測全量執行

```bash
# 翰林（注意：L3 有 77 題，耗時較長）
node scripts/run_blind_eval.js \
  question/platform/G4/English/S2/HanLin --force

node scripts/run_blind_eval.js \
  question/platform/G4/English/S2/KangHsuan --force

node scripts/run_blind_eval.js \
  question/platform/G4/English/S2/NanYi --force
```

### Step 3：L3 長期方案決策

盲測完成後，回報 Claude Code 以下決策：
- **方案 A**：保留 L3 現狀（77 題），未來自然淘汰（新平台不顯示超標題目）
- **方案 B**：將 L3 多餘題目（52 題）拆分為 L3a/L3b
- **方案 C**：依 is_publishable 篩選，只發布前 25 題

---

## ⚠️ 風險評估

| 風險 | 機率 | 影響 | 緩解方案 |
|:---|:---:|:---:|:---|
| L3 結構問題影響整體 Match Rate | 中 | 低 | L3 分開計算 Match Rate |
| 補題後 L3 與 L1/L2/L4 風格不一致 | 低 | 中 | 補題前閱讀 L3 範例題 |
| L3 盲測耗時過長 | 低 | 低 | 單獨執行 L3 盲測 |

---

## ✅ 驗收 Checklist

### 補題
- [ ] 翰林 L1/L2/L4 各 ≥ 25 題
- [ ] 康軒 L1/L2/L4 各 ≥ 25 題
- [ ] 南一 L1/L2/L4 各 ≥ 25 題
- [ ] 補題 CQI-P ≥ 5.5

### 盲測
- [ ] 翰林 Match Rate ≥ 85%（L3 單獨記錄）
- [ ] 康軒 Match Rate ≥ 85%
- [ ] 南一 Match Rate ≥ 85%

### 決策
- [ ] L3 長期方案已回報 Claude Code

### 結案
- [ ] `JOB-157-Report.md` 已產出
- [ ] 已執行 `/pj_sync`

---

## 💲 成本預估

| 項目 | 消耗 |
|:---|:---|
| 補題 L1/L2/L4（~180 題） | ~300~400 RPD |
| 盲測（~276 題 × 3 版本） | ~100 RPD |
| **合計** | **~400~500 RPD** |
| **預計工期** | 3~4 天 |

---

## 真實回報本次對話的模型與花費

＄作業匯總：Token數:- | 花費:- | 使用模型:- | 執行者:-
