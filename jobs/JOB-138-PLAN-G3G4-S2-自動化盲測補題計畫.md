`last_updated`: 2026-04-03 16:40
`updated_by`: Claude Code (claude-haiku-4-5)
`status`: plan_only
`progress_state`: 暫停中

# JOB-138-G3G4-S2-自動化盲測補題計畫與進度報告

**統一報告檔案** - 匯總所有子項目的狀態、進度、失敗清單。Orchestrator 自動維護此檔。

---

## 執行範圍

| 年級 | 學期 | 科目 | 出版社 | 課次數 |
|---|---|---|---|---|
| G3 | S2 | Chinese / Math / Science / SocialStudies / English | HanLin / KangHsuan / NanYi | 12×5 = 60 |
| G4 | S2 | Chinese / Math / Science / SocialStudies / English | HanLin / KangHsuan / NanYi | 12×5 = 60 |

**總計：248 個子任務**  
**執行順序：G3 全部完成 → G4**

---

## 執行規則（Orchestrator 依此做所有決策，不詢問使用者）

### 任務分類規則

Orchestrator 掃描目錄後，依以下規則決定每個檔案的任務類型：

| 條件 | 任務類型 | 說明 |
|---|---|---|
| JSON 不存在，或題數 = 0 | `question_prod` | 重新出題 |
| 題數 1–9 | `question_prod` | 題數不足，補強 |
| 題數 ≥ 10，且無盲測 Report | `question_verify` | 執行盲測 |
| 題數 ≥ 10，有盲測 Report 且 Match Rate ≥ 85% | `skip` | 已達標，跳過 |
| 題數 ≥ 10，有盲測 Report 但 Match Rate < 85% | `question_prod` + `question_verify` | 重產後再驗 |

### 結果處理規則

| 結果 | Orchestrator 動作 |
|---|---|
| `question_prod` 成功，CQI-P ≥ 5.5 | 標記 done，接著排入 `question_verify` |
| `question_prod` 成功，CQI-P < 5.5 | 標記 needs_retry，排入佇列末端，最多重試 1 次 |
| `question_verify` 成功，Match Rate ≥ 85% | 標記 done |
| `question_verify` 成功，Match Rate < 85% | 標記 needs_rework，記錄，繼續不停 |
| 任何任務：Claude 無回應或 timeout | 標記 failed，記錄原因，繼續下一個 |
| 任何任務：Report 未產出 | 標記 failed，記錄，繼續下一個 |

**不詢問使用者。不等待確認。遇到問題記錄並繼續。**

### 各科目目標題數

| 科目 | 目標題數 / 課 |
|---|---|
| Chinese | 20 |
| Math | 20 |
| Science | 20 |
| SocialStudies | 20 |
| English | 15 |

---

---

## 整體進度

**Orchestrator 自動維護此區塊**（每完成 10 個任務更新一次）

### 總體進度

```
進度：1 / 30 完成 | done: 1 | needs_rework: 0 | failed: 0 | skip: 0
```

---

## G3 S2 各科進度

| 科目 | HanLin | KangHsuan | NanYi |
|---|---|---|---|
| Chinese | ✅ done | ⏳ pending | ⏳ pending |
| Math | ⏳ pending | ⏳ pending | ⏳ pending |
| Science | ⏳ pending | ⏳ pending | ⏳ pending |
| SocialStudies | ⏳ pending | ⏳ pending | ⏳ pending |
| English | ⏳ pending | ⏳ pending | ⏳ pending |

---

## G4 S2 各科進度

| 科目 | HanLin | KangHsuan | NanYi |
|---|---|---|---|
| Chinese | ⏳ pending | ⏳ pending | ⏳ pending |
| Math | ⏳ pending | ⏳ pending | ⏳ pending |
| Science | ⏳ pending | ⏳ pending | ⏳ pending |
| SocialStudies | ⏳ pending | ⏳ pending | ⏳ pending |
| English | ⏳ pending | ⏳ pending | ⏳ pending |

---

## 統計摘要

| 項目 | 數量 |
|---|---|
| G3 完成 | 0/180 |
| G4 完成 | 0/180 |
| **總完成** | **0/360** |

---

## 需返工清單（Match Rate < 85%）

目前無。

---

## 失敗清單

目前無。

---

## 完成後動作

全部任務完成後，Orchestrator 執行：
1. 更新本檔「需返工清單」及「失敗清單」
2. 計算各科達標率
3. 發送完成通知（若設定了 Discord）
