---
name: doqst
description: 題庫產出防呆流水線 (Do Question) — 全自動出題引擎，從研究檢查到盲審優化一條龍
---

# 📘 題庫全自動產製引擎 (Do Question)

> **最後更新**：2026-03-21 23:05
> **更新者**：Antigravity
> **觸發時機**：當使用者呼叫 `/doqst`，或指令涉及「產出題庫」、「補題」、「出題」時執行。

當你被呼叫 `/doqst` 時，你的任務是扮演**全自動題庫產製引擎**。請嚴格依序執行以下流水線：

---

## 步驟零：自然語言解析器 (Argument Parser)

使用者可能以自然語言下達指令，你必須自動解析為結構化參數：

**範例指令：**
```
doqst 小三下 國文
doqst 小六下 數學
doqst G5S2 自然
doqst 小四下 國語 數學 自然
```

**解析規則：**

| 使用者輸入 | 解析為年級 | 使用者輸入 | 解析為科目目錄 |
|:---|:---|:---|:---|
| 小三 / G3 / 三年級 | `G3` | 國語 / 國文 / Chinese | `Chinese` |
| 小四 / G4 / 四年級 | `G4` | 數學 / Math | `Math` |
| 小五 / G5 / 五年級 | `G5` | 自然 / Science | `Science` |
| 小六 / G6 / 六年級 | `G6` | 社會 / Social | `Social` |
| | | 英語 / English | `English` |

**學期解析**：「上」→ `S1`、「下」→ `S2`、未指定 → 預設 `S2`

**路徑探索邏輯**：
1. 拼接基礎路徑 `question/platform/{年級}/{科目}/`
2. 檢查是否有 `S1` / `S2` 子目錄 → 若有，進入對應學期子目錄
3. 若無學期子目錄，直接使用該層
4. 列出所有出版社子目錄（`KangHsuan`, `HanLin`, `NanYi`）

---

## 步驟一：R1~R4 前置檢查 (Research Gate)

在出任何一題之前，**強制確認**研究素材是否就位：

1. **檢查 R3 原始素材庫**：在 `knowledge/課綱研究/{科目}/` 搜尋對應的素材庫檔案。
2. **檢查 R4 發展綱要**：搜尋對應的「發展綱要/命題矩陣」。

**判定規則：**
- ✅ **R3 + R4 皆存在** → 讀取其中的「認知配比」與「迷思清單」，注入後續 Prompt，繼續執行。
- ⚠️ **僅有 R3** → 警告使用者缺少 R4，詢問是否先補建。
- ⛔ **R3 也找不到** → **硬性阻擋**，向使用者回報：
  > ⛔ 缺少研究素材！請先執行 `/curri_research {年級} {科目}` 建立 R3/R4 後再來出題。

---

## 步驟二：盤點現況 (Inventory Scan)

掃描目標路徑下所有 JSON 題庫檔案，統計：
- 每課的現有題數
- 每課的 CQI 均分與 QG 等級
- 計算缺口（目標：每課 30 題）

執行命令（取得快速概覽）：
```bash
node scripts/evaluate_question_quality.js {目標目錄路徑}
```

---

## 步驟三：建立逐課 Checklist 並確認

對使用者輸出一份**逐課作戰計畫表**，例如：

| 出版社 | 課次 | 課名 | 現有 | CQI | 缺口 | 動作 |
|:---|:---|:---|:---|:---|:---|:---|
| 康軒 | L1 | 過故人莊 | 5 | 6.81 | 25 | 🔵 待補足 |
| 康軒 | L2 | 把愛傳下去 | 5 | 6.90 | 25 | 🔵 待補足 |
| 翰林 | L1 | 不可以翻魚 | 5 | 7.02 | 25 | 🔵 待補足 |
| ... | ... | ... | ... | ... | ... | ... |

> 💡 **使用者確認後**，Agent 才可逐課執行。若使用者指定「只做康軒」也應遵從。

---

## 步驟四：讀取規範與 Schema

在產出任何 JSON 之前，強制讀取：
1. **題庫格式與緩存規範**：`question/README_題庫格式規範.md`
2. **題庫數據理型**：`shared/forms/題庫數據理型.md`
3. **出題設計準則**：`question/README_出題設計準則.md`

---

## 步驟五：逐課自動產製 (Auto Generation)

> ⚠️ **成本警示**：開始產製前，強制確認符合 `_agent/API_RULES.md` 的金鑰分級與 1500 RPD 免費額度。核心原則包含：結案必須統計 Token、優先消耗 Gemini 免費額度。

對 Checklist 中標記為「待補足」的每一課，執行：

// turbo
```bash
node scripts/auto_generate_questions.js {該課的 JSON 檔案路徑}
```

**產製規則：**
- 呼叫 Gemini API 依據 R4 發展綱要的認知配比與迷思清單產出題目
- 每次最多生成 10 題（避免 API Rate Limit）
- 自動洗牌 `answer_index` 確保分佈均勻

**🚫 猜題防呆機制檢核表 (Anti-Guessing Audit)：**
> 產出 JSON 前，逐項檢查：
- [ ] **選項等長原則**：正確與錯誤選項的文字長度、結構高度一致
- [ ] **零常識作答**：必須依賴閱讀文本才能作答
- [ ] **引經據典的誘答**：誘答基於 R4 的學生迷思，嚴禁隨意湊數
- [ ] **語氣中立化**：各選項語氣分配平均

---

## 步驟六：品質閘門 (Quality Gate)

// turbo
```bash
node scripts/evaluate_question_quality.js {目標目錄路徑}
```

**判定規則：**
- **L1 (BIAS)** → 格式損壞或長度失衡，**立刻修正並重跑**
- **CQI < 6.0** → 題目太簡陋，加長情境後重新產出
- **全部通過** → 進入步驟七

---

## 步驟七：盲審驗證、分類複查與差異化修正 (Blind Eval → Review → Remediate)

> 📎 此步驟整合自原 `/blind-eval` 流程，升級為「四層品質管控」機制。
> ⚠️ **成本管控**：執行前強制確認 `_agent/API_RULES.md` 之金鑰分級與 1500 RPD 免費額度。

### 7-0：研究素材預載 (R4 Context Injection) — v5.0 新增
**適用條件**：當對應年級/學期/科目的 R4 發展綱要存在且內容完善時，**強制啟用**。

**執行邏輯**：
1. 自動定位 `knowledge/課綱研究/{科目}/` 中對應的發展綱要檔案。
2. 以正則表達式提取目標課次的「實質課文大意」、「考古題對照」與「整合思考歷程」。
3. 將提取的教學素材注入盲測 Prompt，AI 角色從「學生」升級為「資深審題專家」。
4. 批次處理改為 **10 題一組** (同課次)，減少請求次數且保持推理深度。

> 💡 **效益**：AI 不僅驗證「邏輯是否合理」，更能驗證「是否符合 R4 教學研究的命題方向」。
> 若 R4 素材不存在或不完整，則回退至 7-A 的純盲測模式。

### 7-A：盲審驗證 (Blind Evaluation)
```bash
node scripts/run_blind_eval.js {目標目錄路徑}
```
**腳本會為每一題（或每 10 題一批）執行以下動作：**
- **v5.0 模式**：以「資深審題專家」身份，對照 R4 素材審查題目品質與教學對齊度
- **v3.0 模式（降級）**：以「剛讀過課文的學生」身份推理作答
- 記錄使用的 AI 模型 (`verifying_model`) 與消耗 Token 數
- ✅ Match → 標記 `blind_evaluation: true`，清除任何舊 mismatch 紀錄
- ❌ Mismatch → 在題目中存入 `blind_eval_mismatch` 欄位，包含：
  - `ai_selected`：AI 選的選項
  - `correct_answer`：設計的標準答案
  - `ai_reasoning`：AI 的推理說明（一句話）
  - `quality_rating`：⭐1-3 品質評級 (v5.0 專屬)
  - `r4_alignment`：R4 對齊評語 (v5.0 專屬)
  - `review_status: "pending"`：待人工分類

### 7-B：人工複查分類 (Human Review)

**先執行** 複查報告產出腳本：
```bash
node scripts/generate_review_report.js {目標目錄路徑}
```
此腳本會掃描所有 `review_status: "pending"` 的題目，產出一份 Markdown 複查清單。

**人工審閱每一題 ❌，並分類：**

| 分類 | 判斷依據 | 處置 |
|:---|:---|:---|
| `distractor_success` | AI 的推理「聽起來合理但是錯的」，說明誘答吸引力高 | **保留原題**，更新 `review_status` |
| `question_issue` | AI 的選項「確實有道理」，或題目本身有歧義 | **標記修正**，交由 7-C 處理 |

**❌ 比率觸發閾值：**
- Match Rate ≥ 70%：品質達標，完整執行 7-D 結算即可
- Match Rate 50-70%：中等，優先對 `question_issue` 類執行重寫
- Match Rate < 50%：嚴重問題，**整批重新出題**比個別修正更有效率

### 7-C：差異化修正 (Targeted Remediation)

**僅對 `review_status: "question_issue"` 的題目執行：**

// turbo
```bash
node scripts/rewrite_distractors.js {出版社目錄1} {出版社目錄2} ...
```
> ⚠️ 腳本只會處理標記為 `question_issue` 的題目，**不動** `distractor_success` 的優質誘答。

修正後對相同題目重跑步驟 7-A，確認 ✅。

### 7-D：選項均衡化與最終品質結算
// turbo
```bash
node scripts/auto_balance_json.js {目標目錄路徑}
node scripts/evaluate_question_quality.js {目標目錄路徑}
```
確認：
- `blind_eval_mismatch` 之 `review_status: "pending"` = 0（全部已分類）
- `question_issue` 類型全部重測通過
- `L1 (BIAS)` = 0，CQI ≥ 6.5

---

## 步驟八：收尾同步與回報

1. 同步數據：`node scripts/sync_stats.js`
2. 更新 `manifest.json`（若有新課次）
3. 更新 `docs/進度彙整_全站研發與題庫產出.md`（節二：R3＝發展綱要、R4＝原始研究素材庫，`YYYY-MM-DD <a href="../knowledge/課綱研究/…" style="text-decoration: none; color: inherit">🔗</a>`；三社欄兩行與 `generate_library_stats` 對齊）

**完工品質檢核清單 (Mandatory Checklist)：**
- [ ] 是否已杜絕荒謬誘答？品質符合 R1-R4 教學定義？
- [ ] 全站進度表是否已更新題數？
- [ ] JSON 結構完整且所有必填欄位齊全？
- [ ] 是否準備好呼叫 `/dosync`？

向使用者回報：
> ✅ **出題流水線執行完畢！**
> - 處理範圍：`{年級} {學期} {科目}`
> - 出版社：`{列表}`
> - 總題數：`{數量}`
> - CQI 平均分數：`{分數}`
> - QG 等級：`{L1~L5}`
> - 盲審 Match Rate：`{百分比}`

---

## 📎 腳本速查表

| 腳本 | 功能 | 使用時機 |
|:---|:---|:---|
| `auto_generate_questions.js` | LLM 自動出題 | 步驟五 |
| `evaluate_question_quality.js` | CQI v2 品質評分 | 步驟六、七-D |
| `run_blind_eval.js` | 盲測引擎 v5.0 (含 R4 素材注入) | 步驟七-0、七-A |
| `generate_review_report.js` | Mismatch 複查報告產出 | 步驟七-B |
| `rewrite_distractors.js` | 誘答重寫 | 步驟七-C |
| `auto_balance_json.js` | 選項打散 | 步驟七-D |
| `sync_stats.js` | 數據同步 | 步驟八 |
