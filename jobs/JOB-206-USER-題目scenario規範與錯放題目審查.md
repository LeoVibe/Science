*Created by USER at 2026-04-20 18:15*

`last_updated`: 2026-04-20 18:15
`updated_by`: Claude Code (claude-opus-4-7)

# JOB-206-USER-題目 scenario 規範與錯放題目審查

**`job_type`**：`question_verify`（含 scenario 欄位規範制定 + 117 檔可疑題目內容審查）
**`executor`**：待定（subagent 前期研究，實作階段由 Claude Code 或 Cursor 承接）
**`model_approval`**：前期研究不動主題庫，僅讀取分析；階段 2 LLM 審核若需付費 API 另詢核准

**狀態**：🟡 **預開中**（subagent 進行前期研究中 → JOB-205 結案後深化實作）

---

## 📌 任務背景

JOB-204 Report §4 + JOB-205 事故分析延伸發現：題目 `scenario` 欄位與該課 `title` 主題不符。

### 現象

**G5 南一 L4「縣官審石頭」** 題庫 12 題中：
- 題 11、12：內容講縣官趙大老爺審案 ✓
- 題 1-10：scenario 為「雨後的彩虹」「老樹的回憶」「小溪的歌聲」「太陽公公的笑容」——與「縣官審石頭」完全無關

### 初步全站掃描結果

- 篩選規則：真實 title（非 LN 佔位符）+ scenario 排除 `【...】` 情境前綴 + unique 主題級 scenario ≥ 3
- 結果：**117 / 439 檔可疑**（26.6%）
- Top 10 可疑檔 scenario 與 title 共字交集為 0（強烈異常）

### 問題三分類

1. **scenario 寫成考點分類**（例：「全篇主旨感悟」「修辭手法的效果分析」）— 題目未必錯放，scenario 欄位誤用
2. **scenario 引用其他課文**（例：G3 康軒 L2 下雨的時候出現《大象的煩惱》）— **明確錯放**
3. **scenario 為具象主題名詞**（例：G5 南一 L4 太陽公公的笑容）— **極可能錯放**

### 與 JOB-205 邊界

- JOB-205：僅處理 42 placeholder manifest 的 title 修復
- **本 JOB 問題涵蓋有真實 title 的國語等 manifest**（如 G5 南一 L4 title 正確但題目錯放）
- 因此**與 JOB-184 batch 建檔事故同源但範圍不同**，獨立處理

---

## 🎯 任務目標（待 JOB-205 結案後深化）

### 階段 0｜前期研究（Subagent 可平行執行）

- 抽樣 5-10 個 Top suspect 檔案，讀取實際題目內容
- 逐題目對照 title，判定屬於「考點誤用/錯放/具象誤用」哪一類
- 量化三類比例
- 評估 scenario 規範三方案（A/B/C）可行性
- 輸出研究報告：`docs/question-audit/JOB-206-前期研究.md`

### 階段 1｜scenario 欄位規範制定（docs_ops）

- 更新 `question/README_出題與品管準則.md` scenario 章節
- 定義規範（基於階段 0 結論擇一）：
  - **方案 A**：scenario 必為「情境前綴」格式 `【在...時】...`，不得為主題/考點
  - **方案 B**：scenario 可空（未填視為通用題目）
  - **方案 C**：兩層 scenario（situation_prefix + cognitive_tag 分欄）
- 向後相容策略

### 階段 2｜117 檔逐檔審查（question_verify）

- LLM 輔助：對每檔抽樣 N 題 + title，判斷「是否為該課主題題目」
- 分類處理：
  - 整檔題目都符合 title → scenario 修正為規範格式（或清空）
  - 部分題目錯放 → 錯放題目標 `is_active: false`
  - 整檔都錯放 → 整檔降活 + 列重出清單
- 自動化腳本 `scripts/job206_audit_scenario.mjs`
- 結果列入 `docs/question-audit/JOB-206-審查結果.md`

### 階段 3｜重出或修補（question_prod，視階段 2 結果）

- 確認錯放的題目從 KL4 重新出題
- 無 KL4 研究（G3/G6 等）的錯放題目 → 列遺留轉研究 JOB

---

## 🚧 任務邊界

### 本 JOB 做

- Scenario 欄位規範文字化
- 117 可疑檔審查（LLM 或人工）
- 錯放題目降活 / 重出
- 對應 manifest 的 blind_tested / count 等統計數據更新

### 本 JOB 絕對不做

- ❌ Placeholder manifest title 修復（屬 JOB-205）
- ❌ 全新的 KL4 研究（屬獨立研究 JOB）
- ❌ 動 `apps/v3_eidos/` UI 元件
- ❌ 修改 scenario / question 欄位前未經 LLM 或人工核對的盲改

---

## 📖 執行步驟

1. **階段 0（立即，subagent 執行）**：抽樣研究 + 三方案評估 → 產出 `docs/question-audit/JOB-206-前期研究.md`
2. JOB-205 結案後，使用者審閱階段 0 研究 → 選定規範方案
3. 細化階段 1 規範正式文字 → 使用者核准 → 寫入 `question/README_出題與品管準則.md`
4. 使用者核准階段 2 付費 LLM API 預算（若需）
5. 批次 LLM 審查 117 檔 → 產出審查結果表
6. 逐檔處理（降活 / 重出 / 修正 scenario）
7. L1-3 + L2-1/2-2 驗證
8. Commit + Report + Close

---

## ⏱️ 預估時程

| 階段 | 預估 |
|:--|:--:|
| 0 前期研究（subagent）| 20-30 分鐘 |
| 1 規範制定 | 30 分鐘 |
| 2 LLM 審查 117 檔 | 30-60 分鐘 |
| 3 重出 / 修補 | 視階段 2 結果（30 分鐘 - 2 小時）|
| **總計** | **2-3.5 小時** |

---

## ⚠️ 預開狀態說明

此派工單目前狀態：
- ✅ 背景與根因已記錄
- ✅ 高階目標已列
- ✅ 任務邊界已定
- 🟡 階段 0 前期研究：**即將由 subagent 執行**
- ⚪ 階段 1-3：等 JOB-205 結案 + 階段 0 研究完成後深化

**Subagent 階段 0 完成後**需要：
1. 使用者審閱 `docs/question-audit/JOB-206-前期研究.md`
2. 選定 scenario 規範 A/B/C 方案
3. Claude Code 或 Cursor 承接階段 1-3 實作
4. 完整 Checklist 三段式補齊

---

## 真實回報本次對話的模型與花費

＄作業匯總：Token數:- | 花費: $- | 使用模型: - | 執行者: -（預開狀態）
