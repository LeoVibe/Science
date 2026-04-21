*Created by USER at 2026-04-20 18:15*

`last_updated`: 2026-04-20 23:00
`updated_by`: Claude Code (claude-opus-4-7)

# JOB-206-USER-題目 scenario 規範與錯放題目審查

**`job_type`**：`mixed`（`question_verify` 規範制定 + `question_prod` L5 重出 + `research` KL4 前置）
**`executor`**：Claude Code（使用者 2026-04-20 授權 PM 直接執行以加速上架盤點）
**`model_approval`**：前期研究不動主題庫，僅讀取分析；階段 2 LLM 審核 / 階段 3 重出若需付費 API 另詢核准

**狀態**：🟢 **進行中**（2026-04-20：G3 SOC NanYi L5 已完成 spot fix 降活；重出與 117 檔審查範圍擴展一次做完）

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

## 🚨 2026-04-20 範圍擴充：G3 SOC NanYi L5 完整重出

### 事發過程

本 session anti-hallucination D-驗證時發現：G3 SOC NanYi L5 的 manifest title 是占位符 `"L5"`，30 題實算分佈為：
- **Q1-Q21（70%）**：跨情境品德/公民素養題（讓座、節水、媒體識讀、衝突解決…）
- **Q22-Q30（30%）**：探究方法論題（探究核心精神、利害關係人、指標、反思）

比對 `knowledge/1_課綱研究/社會/G3_S2_社會_原始研究素材庫.md:32-39`：南一三下社會目錄為 U1-U4 + **探究單元「打造幸福的家園」**（自主探究與行動計畫）。結論：

- L5 正確課名 = **打造幸福的家園**（不是「不存在」，也不是「某現有課名」）
- 30 題全數錯放（即使 Q22-Q30 方法論題也尚待驗證是否符合該課定位）
- 需全檔重出

### 使用者決策（2026-04-20）

> 「結論就是這一整課都有問題，可以整個刪除，重新出題，用正確的課文來進行重新的出題。這個任務請放到 JOB-206 一起進行。」  
> 「階段 2 屬『出題/盲測』全部流程一次都在 206 做完，我要準備上盤點上線。」

因此本 JOB 範圍擴充為：**一次做完 G3 SOC NanYi L5 的 KL4 研究 → 重出 30 題 → 盲測 → 重上架**，不拆成多個 JOB。

### 階段 1 spot fix 已完成（Claude Code, 2026-04-20）

| 動作 | 狀態 |
|:--|:--:|
| manifest L5 title `"L5"` → `"打造幸福的家園"` | ✅ |
| manifest L5 count 30→0、quality QL4→pending、加 `_job206_note` | ✅ |
| manifest moduleMetaData total_questions 150→120、blind_tested 150→120 | ✅ |
| `G3_S2_SOC_NANYI_L5.json` 30 題全數 `is_active: false` + `_job206_review_note` | ✅ |
| `libraryStats.json` stats.G3_S2_社會.count 17→16；publisherStats.G3_S2_社會_南一 units 5→4、questions 150→120、qlTotal 150→120 | ✅ |

### 階段 2-5 已完成（Claude Code, 2026-04-20 ~ 21）

| 階段 | 動作 | 結果 |
|:--:|:--|:--|
| **2A 研究** | 建 KL4 雙檔（單課研究紀錄 + 考古題與討論） | ✅ `knowledge/1_課綱研究/社會/三下/南一/` 下兩檔完成 |
| **2B 素材** | 米蘭老師 G3 南一 Drive × 5 登錄（期中/期末/三段考） | ✅ 登錄於 `knowledge/3_考古題/README_考古題蒐集規範與來源索引.md` |
| **3 出題** | 30 題（inferential 11 + applied 10 + critical 6 + literal 3），全 QL3 | ✅ CQI-P 通過；biasWarning null；答案分佈 8/8/7/7 均衡 |
| **4 盲測** | Gemini-3.1-Flash-Lite 10-in-1 batch × 3 | ✅ **30/30 Match（100%）**，遠超 85% 門檻 |
| **5 上架** | manifest 回復 count 30、quality QL4、avgCqi 9.19；libraryStats 重算 | ✅ G3 社會 南一 units 5、questions 150、cqi 8.11→8.32 |

### 關鍵品質數據（L5 驗收）

| 指標 | 值 |
|:--|:--:|
| 題數 | 30（3 + 11 + 10 + 6 = literal/inferential/applied/critical）|
| CQI-P（avgCqi）| **9.19** |
| CQI-V Match Rate | **100%**（30/30）|
| quality | **QL4** 全部 |
| 出題模型 | Claude-Opus-4.7 |
| 盲測模型 | Gemini-3.1-Flash-Lite（免費 key）|

### β 方案保留條款

本 JOB 階段 2A 採 β 方案（以三下社會發展綱要實證情境為主要研究素材，真實段考題待補）。上架後應規劃：
- 2 週內由人工下載米蘭老師 G3 南一 Drive PDF（5 個連結已登錄）
- 用 tcool.cc 20 份考卷索引補充第二批研究題（需 Chrome 工具）
- 完成後可升 RM3 研究成熟度

### 米蘭老師 G3 素材補登

已確認 `melances.com/grade3/` 涵蓋 G3 社會科三版本（翰林/康軒/南一）上下學期考古題（Google Drive）。JOB-172 僅登錄 grade4，本 JOB 補登 grade3 南一 5 個 Drive 連結。

- 參照：`jobs/JOB-172-AG-考古題蒐集方法探索與來源擴充.md:189` 的 grade4 模式
- 登錄位置：`knowledge/3_考古題/README_考古題蒐集規範與來源索引.md` §二 來源 B

---

## 🎯 任務目標（scenario 規範 + L5 重出，一次做完）

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

## ⚠️ 狀態說明（2026-04-21 更新）

此派工單目前狀態：
- ✅ 背景與根因已記錄
- ✅ 高階目標已列（含 G3 L5 重出範圍擴充）
- ✅ 任務邊界已定
- ✅ **G3 SOC NanYi L5 全流程完成**（spot fix + KL4 雙檔研究 + 30 題重出 + 盲測 100% + 重上架 QL4）
- ✅ 階段 2A 前置研究（KL4 三下 南一 L5）：已建單課研究紀錄 + 考古題與討論雙檔
- ✅ 階段 2B 米蘭老師 G3 素材補登：5 個 Drive 連結登錄完成
- ✅ 階段 3 出題：30 題全 QL3，Claude-Opus-4.7 出題
- ✅ 階段 4 盲測：Match Rate 30/30 (100%)，Gemini-3.1-Flash-Lite
- ✅ 階段 5 上架：manifest QL4、avgCqi 9.19；libraryStats cqi 8.32
- ⚪ 117 檔 scenario 審查：原計畫維持，另起階段與 L5 切分

---

## 真實回報本次對話的模型與花費

＄作業匯總：Token數:- | 花費: $- | 使用模型: - | 執行者: -（預開狀態）
