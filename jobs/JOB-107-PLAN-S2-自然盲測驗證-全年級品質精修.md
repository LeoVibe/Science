*Created by AG at 2026-03-24 09:30*

`last_updated`: 2026-03-28 20:18
`updated_by`: Antigravity (Claude Opus 4.6)
`version`: 2.0（重構版）

# JOB-107-PLAN-S2-自然盲測驗證-全年級品質精修

**`job_type`**：`question_verify`
定義與邊界見 **`docs/README_任務派工準則.md`** 第二章。

---

## 📌 任務背景

JOB-106（v2.0）產出的自然科題庫需要全量盲測驗證。

### 驗證範圍

| 年級 | 預估題數 | 來源 | 重點 |
|:---:|:---:|:---|:---|
| G3 | ~360 | 現有 QL4 | 檢查即可，已有 verification 者跳過 |
| G4 | ~360 | JOB-106 Batch 1 新產 | 全量驗證 |
| G5 | ~360 | JOB-106 Batch 2 新產 | 全量驗證 |
| G6 | ~90 | 現有 QL4 | 檢查即可，已有 verification 者跳過 |

## 🎯 任務目標（DoD）

1. 全線 Match Rate ≥ 85%
2. 全線 CQI 平均 ≥ 6.5（QL4 門檻）
3. 零 QL1（BIAS）殘留
4. 所有題目 JSON 包含 `verifying_model` 與 `verification` 欄位
5. 100% 全測覆蓋
6. 自然科特有：零違反自然科學常理的情境

---

## 📖 執行步驟

### Phase 0：G3/G6 S2 自然抽檢

- [ ] G3：已有 `verification` 且 CQI ≥ 6.5 → **跳過**，否則補驗
- [ ] G6：已有 `verification` 且 CQI ≥ 6.5 → **跳過**，否則補驗

---

### Phase 1：G4 S2 全線盲測（~12 單元 / ~360 題）

#### G4 翰林版
- [ ] L1~L4 逐單元盲測 → Match Rate ___% → CQI-V ___ → QL___

#### G4 康軒版
- [ ] L1~L4 逐單元盲測

#### G4 南一版
- [ ] L1~L4 逐單元盲測

#### Phase 1 驗收
- [ ] G4 整體 Match Rate ≥ 85%
- [ ] G4 整體 CQI 平均 ≥ 6.5
- [ ] 修題迴圈完成
- [ ] JSON 回寫完成
- [ ] VAT 日誌已產出
- [ ] 同步進度總表

---

### Phase 2：G5 S2 全線盲測（~12 單元 / ~360 題）

#### G5 翰林版
- [ ] L1~L4 逐單元盲測

#### G5 康軒版
- [ ] L1~L4 逐單元盲測

#### G5 南一版
- [ ] L1~L4 逐單元盲測

#### Phase 2 驗收
- [ ] G5 整體 Match Rate ≥ 85%
- [ ] G5 整體 CQI 平均 ≥ 6.5
- [ ] 同步進度總表

---

### Phase 3：自然科專項檢核

- [ ] **科學事實複驗**：確認無違反自然科學常理的選項或情境
- [ ] **實驗推理對齊**：確認題幹中的實驗情境與 KL4 素材庫中記載的實驗步驟一致
- [ ] **迷思概念對照**：確認錯誤選項對應 KL4 中的 `commonMisconception`
- [ ] **答案分布均衡**：執行 `auto_balance_json.js`

---

### Phase 4：結案

- [ ] 全線 CQI 平均 ≥ 6.5
- [ ] 零 QL1 殘留
- [ ] 所有 JSON 已回寫驗證欄位
- [ ] VAT 日誌路徑已記錄
- [ ] 進度總表最終同步
- [ ] JOB-107-Report.md
- [ ] 花費匯總

---

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `question/README_驗證與盲測準則.md` | CQI-V、SAB（Science=10）、VAT、MTP |
| `question/README_出題與品管準則.md` | CQI-P |

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] 已讀取：`question/README_驗證與盲測準則.md`
- [ ] 已讀取：`question/README_出題與品管準則.md`
- [ ] 確認驗證模型與出題模型不同
  - 出題模型：gemini-3-flash
  - 驗證模型：________
- [ ] **已確認使用金鑰**：[金鑰：Yotta eidosFree（免費 Key）]
- [ ] 執行 CQI-P 基線跑分，確認全線 ≥ 5.5
- [ ] 驗證範圍確認：G3~G6 / 全版本 / ____ 題

## ✅ 驗收 Checklist (Acceptance)

- [ ] 全線 Match Rate ≥ 85%
- [ ] 全線 CQI 平均 ≥ 6.5
- [ ] 零 QL1
- [ ] 自然科專項 4 項通過
- [ ] 所有 JSON 含 `verifying_model` + `verification`

## ✅ 成果 Checklist (Deliverables)

- [ ] 成果表格已填寫
- [ ] 進度總表已同步
- [ ] 已執行 `/pj_sync`
- [ ] 產出 JOB-107-Report.md
- [ ] VAT 日誌路徑已記錄

---

## 📋 成果紀錄表

| 年級 | 版本 | 單元數 | 題數 | Match Rate | CQI 平均 | QL | 驗證模型 | VAT 日誌 | 執行日期 |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|:---|:---|
| G4 | 翰林 | — | — | —% | — | — | — | — | — |
| *(執行時逐行填入)* | | | | | | | | | |

---

## 🛡️ 驗證防線

- **SAB**：Science = 10 題/批
- **VAT**：`logs/blind_eval_{filename}_{timestamp}.json`
- **MTP**：TYPE-A/B/C 分流

---

## 真實回報本次對話的模型與花費
＄作業匯總 ：Token數:- | 花費: $- | 使用模型: - | 執行者: AG
