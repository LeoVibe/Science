*Created by AG at 2026-03-24 09:30*

`last_updated`: 2026-03-28 20:18
`updated_by`: Antigravity (Claude Opus 4.6)
`version`: 2.0（重構版）

# JOB-105-PLAN-S2-數學盲測驗證-全年級品質精修

**`job_type`**：`question_verify`
定義與邊界見 **`docs/README_任務派工準則.md`** 第二章。

---

## 📌 任務背景

JOB-104（v2.0 重開）產出的數學題庫需要全量盲測驗證。範圍涵蓋：
- **已存在但 CQI 偏低**：G3 S2（CQI 6.42~8.47）、G4 S2（CQI 5.04~5.11）
- **JOB-104 v2.0 新擴充**：G5 S2、G6 S2

### 驗證範圍預估

| 年級 | 預估題數 | 來源 | 重點 |
|:---:|:---:|:---|:---|
| G3 | ~838 | 現有 QL4 | 檢查即可，已有 verification 者跳過 |
| G4 | ~300 | 現有 QL4 | CQI 偏低需驗證拉升 |
| G5 | ~900 | JOB-104 v2.0 新產 | 全量驗證 |
| G6 | ~900 | JOB-104 v2.0 新產 | 全量驗證 |

## 🎯 任務目標（DoD）

> [!IMPORTANT]
> 所有驗收項目皆須 100% 通過，方可結案。

1. 全線 Match Rate ≥ 85%
2. 全線 CQI 平均 ≥ 6.5（QL4 門檻）
3. 零 QL1（BIAS）殘留
4. 所有題目 JSON 包含 `verifying_model` 與 `verification` 欄位
5. 100% 全測覆蓋
6. 數學特有：零「計算矛盾」與「多重正解」殘留

---

## 📖 執行步驟

### Phase 0：G3 S2 數學抽檢

- [ ] 執行 CQI 基線跑分
- [ ] 已有 `verification` 欄位且 CQI ≥ 6.5 → **跳過**
- [ ] 若有題目缺 `verification` → 補驗

---

### Phase 1：G4 S2 全線盲測（30 單元 / ~900 題）

#### G4 翰林版（10 單元）
- [ ] L1 盲測 → Match Rate ___% → CQI-V ___ → QL___
- [ ] L2 盲測 → Match Rate ___% → CQI-V ___ → QL___
- [ ] L3 盲測 → Match Rate ___% → CQI-V ___ → QL___
- [ ] L4 盲測 → Match Rate ___% → CQI-V ___ → QL___
- [ ] L5 盲測 → Match Rate ___% → CQI-V ___ → QL___
- [ ] L6 盲測 → Match Rate ___% → CQI-V ___ → QL___
- [ ] L7 盲測 → Match Rate ___% → CQI-V ___ → QL___
- [ ] L8 盲測 → Match Rate ___% → CQI-V ___ → QL___
- [ ] L9 盲測 → Match Rate ___% → CQI-V ___ → QL___
- [ ] L10 盲測 → Match Rate ___% → CQI-V ___ → QL___

#### G4 康軒版（10 單元）
- [ ] L1~L10 逐課盲測

#### G4 南一版（10 單元）
- [ ] L1~L10 逐課盲測

#### Phase 1 驗收
- [ ] G4 整體 Match Rate ≥ 85%
- [ ] G4 整體 CQI 平均 ≥ 6.5
- [ ] 修題迴圈完成
- [ ] JSON 回寫完成
- [ ] VAT 日誌已產出
- [ ] 同步進度總表

---

### Phase 2：G5 S2 全線盲測（30 單元 / ~900 題）

#### G5 翰林版（10 單元）
- [ ] L1~L10 逐課盲測

#### G5 康軒版（10 單元）
- [ ] L1~L10 逐課盲測

#### G5 南一版（10 單元）
- [ ] L1~L10 逐課盲測

#### Phase 2 驗收
- [ ] G5 整體 Match Rate ≥ 85%
- [ ] G5 整體 CQI 平均 ≥ 6.5
- [ ] 同步進度總表

---

### Phase 3：G6 S2 全線盲測（~30 單元 / ~900 題）

#### G6 翰林版
- [ ] L1~L10 逐課盲測

#### G6 康軒版
- [ ] L1~L10 逐課盲測

#### G6 南一版
- [ ] L1~L10 逐課盲測

#### Phase 3 驗收
- [ ] G6 整體 Match Rate ≥ 85%
- [ ] G6 整體 CQI 平均 ≥ 6.5
- [ ] 同步進度總表

---

### Phase 4：數學科專項檢核

> [!CAUTION]
> 數學科需額外進行以下專項驗證。

- [ ] **計算正確性複驗**：各年級抽查 10 題，手動驗算確認答案無誤
- [ ] **多重正解排查**：掃描所有 Mismatch 題目，確認無兩個以上合理答案
- [ ] **陷阱選項對齊**：確認錯誤選項對應 KL4 素材庫中 `commonMisconception` 記載的迷思
- [ ] **數值陷阱檢查**：無「明顯規律可猜」的選項排列（遞增/遞減）
- [ ] **答案分布均衡**：執行 `auto_balance_json.js` 確認 answer_index 分布均勻

---

### Phase 5：結案

- [ ] 全線 CQI 平均 ≥ 6.5 確認
- [ ] 零 QL1 殘留確認
- [ ] 所有 JSON 已回寫驗證欄位
- [ ] 所有 VAT 日誌路徑已記錄
- [ ] 進度總表最終同步
- [ ] JOB-105-Report.md
- [ ] 花費匯總

---

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `question/README_驗證與盲測準則.md` | CQI-V、SAB 批次（Math=5）、VAT、MTP |
| `question/README_出題與品管準則.md` | 數學防猜機制 |
| `_agent/skills/ei_verify/SKILL.md` | 驗證觸發器 |

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] 已讀取：`question/README_驗證與盲測準則.md`
- [ ] 已讀取：`question/README_出題與品管準則.md`
- [ ] 確認驗證模型與出題模型不同
  - 出題模型：gemini-3-flash
  - 驗證模型：________（待確認，需不同於出題模型）
- [ ] **已確認使用金鑰**：[金鑰：Yotta eidosFree（免費 Key）]
- [ ] 執行 CQI-P 基線跑分，確認全線 ≥ 5.5
- [ ] 驗證範圍確認：G3~G6 / 全版本 / ____ 題（100% 全測）

> [!WARNING]
> **雙盲問題**：出題與驗證均使用 gemini-3-flash 時不符合雙盲原則。
> 建議方案：報告中標註「⚠️ 單盲提示」，或改用不同模型。

## ✅ 驗收 Checklist (Acceptance)

- [ ] 全線 Match Rate ≥ 85%
- [ ] 全線 CQI 平均 ≥ 6.5
- [ ] 零 QL1 (BIAS)
- [ ] 數學專項檢核 5 項全通過
- [ ] 所有 JSON 含 `verifying_model` + `verification`

## ✅ 成果 Checklist (Deliverables)

- [ ] 成果表格已填寫
- [ ] 進度總表已同步
- [ ] 已執行 `/pj_sync`
- [ ] 產出 JOB-105-Report.md（v2.0 追記）
- [ ] 所有 VAT 日誌路徑已記錄

---

## 📋 成果紀錄表

| 年級 | 版本 | 單元數 | 題數 | Match Rate | CQI 平均 | QL | 驗證模型 | VAT 日誌 | 執行日期 |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|:---|:---|
| G4 | 翰林 | 10 | 300 | —% | — | — | — | — | — |
| *(執行時逐行填入)* | | | | | | | | | |

---

## 🛡️ 驗證防線機制

### SAB 科目自適應批次
- **Math = 5 題/批**（JOB-115 實證：Batch > 10 會觸發幻覺）

### VAT 驗證稽核軌跡
- 每批次產出 `logs/blind_eval_{filename}_{timestamp}.json`

### MTP Mismatch 分流
- TYPE-A：AI 幻覺 → `resolved`
- TYPE-B：原題錯誤 → `original_flaw` + 修題
- TYPE-C：待人工裁定 → `manual_review`

---

## 真實回報本次對話的模型與花費
＄作業匯總 ：Token數:- | 花費: $- | 使用模型: - | 執行者: AG
