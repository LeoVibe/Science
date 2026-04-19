# 出題與品管準則 (Production & Quality Control)

`last_updated`: 2026-04-19
`updated_by`: Claude Code (claude-opus-4-7)

**文件定位**：本文件規範 Eidos 題庫出題品質與 JSON 格式。
涵蓋 CQI-P 出題分數、JSON 格式規範與 CI 工具。

> [!IMPORTANT]
> - 題庫架構設計與命名字典，請見本文件 **第二章：全站儲存結構與 JSON 字典規範**
> - 研究素材架構（KL/RM）請見 `knowledge/README_研究架構總綱.md`
> - 盲測驗證（CQI-V）與品質標籤（QL）請見 `question/README_驗證與盲測準則.md`
> - 完整出題 SOP 請見 `_agent/skills/ei_qst/SKILL.md`
> - **國語自動補題**：課文僅自 `knowledge/課綱研究/國語/<學期>/<版本>/` 之 **KL4「單課研究紀錄」** 內 **「課文全文錄製」** 抽取；該課須另有 **KL4「考古題與討論」**。不足時腳本略過並註記 **`【資料不齊備】`**；請依 **`knowledge/課綱研究/國語/KL3_國語_研究進度_課文與索引.md`** 將該課研究檔補完整後再產題（不使用獨立 `課文原文` 說明檔或 `.txt` 備援目錄）。

---

> **⚠️ 考古題引用原則（全科目適用）**
> 考古題是**參考座標**，不是抄寫範本。出題時：
> - **禁止**原封不動照抄考古題題幹、選項或誘答結構。即便換字重排，若核心邏輯未改變仍視為抄襲。
> - **正確做法**：從考古題中理解「這一課學生容易在哪裡跌倒」，然後基於對課文的深度理解，以更精準的情境、更完整的文筆**原創設計**新題目。
> - 每道自有題目須能通過檢驗：「把考古題原檔刪除後，這道題依然站得住腳。」
> - 詳見 `knowledge/考古題原檔/README_考古題蒐集規範與來源索引.md` §一第 5-6 條。

---

## 第一章：CQI-P 出題階段品質指標（滿分 10.0）

AI 產題後立即執行 `scripts/evaluate_question_quality.js`，依以下維度計分。
`--gate` 模式以 `quality` 標籤判定阻擋：`QL1` / `QL2` / `BIAS` / `BROKEN` → exit 1；`QL3` 以上放行。單題 `cqi_score` 僅供 triage 參考，非閘門門檻。

### P-A 選項對稱性（滿分 2.0）

防堵學生利用「最長答案通常是正確的」盲猜技巧。

- **計分**：正解與其他選項長度差 ≤ 1 → 2.0；長度差略大（≤ 3）→ 0.5；其餘 0
- **全檔控管**：最長選項 = 正解的比例 > 40% → 觸發 BIAS 阻擋

**設計心法（Brain-Friendly 三原則）**：
1. **同理心投射法**：在動作後加角色「內心獨白」自然延展
2. **合理化迷思法**：設計「順常理推斷極可能的錯誤答案」
3. **語氣延展法**：使用兒童熟悉的語氣助詞自然延長

> 禁止在選項中加入半/全形空白湊長度（`evaluate_question_quality.js` 與 `auto_balance_json.js` 皆會清洗並扣分）。

### P-B 情境深度（滿分 2.0，以題幹長度判定）

| 題幹字數 | 配分 |
|:--|:--|
| ≥ 30 字 | 2.0 |
| ≥ 15 字 | 1.0 |
| < 15 字 | 0 |

降低工作記憶負荷：使用「情境標籤」（如 `【在超市時】`）或「引號對話框」可自然拉長題幹。

### P-C 認知層次（滿分 1.5）

| 層次 | taxonomy 值 | 配分 |
|:--|:--|:--|
| 推論／場景／思辨 | `inferential` / `applied` / `critical` | 1.5 |
| 記憶提取 | `literal` | 0.75 |

**跨年級動態配比**（出題階段目標，非本腳本自動驗證）：
- 低年級 (G1-G2)：`6-3-1`（嚴禁價值思辨）
- 中年級 (G3-G4)：`4-4-2` 或 `3-4-3`
- 高年級 (G5-G6)：`2-3-5` 或 `1-3-6`

### P-D 結構完整度（滿分 1.0）

- `explanation` > 10 字 → 0.5 分
- `commonMisconception` 或 `scenario` 存在 → 0.5 分

### P-E 盲測與迷思加分（滿分 3.0）

| 條件 | 配分 |
|:--|:--|
| `blind_evaluation === true`（通過盲測） | 2.0 |
| `commonMisconception` 存在（附迷思診斷） | 1.0 |

> 本維度由 `evaluate_question_quality.js` 自動讀取 JSON 欄位；盲測流程另見 `question/README_驗證與盲測準則.md`。

### P-J 研究支撐度（QL 天花板制）

- 無 KL4 單課研究紀錄 → 該題最高 QL1（不得上架）
- 僅有 KL4 單課研究紀錄（含課文）→ 最高 QL2
- KL4 單課研究紀錄 + 考古題與討論 → 最高 QL3
- 通過盲測（`blind_evaluation === true`）→ 升 QL4

完整 QL 定義與條件對照請見 `question/README_驗證與盲測準則.md` 第四章。

### 課次題數建議（非 CQI-P 計分項）

- **預設產題目標**：每課次以 30 題為預設規模；若派工另訂題數須於 JOB／manifest 註記。
- **上架參考**：單課 `count` < 25 時，由 PM 於釋出 Checklist 或 JOB 結案報告補述例外。
- **盲測連動**：單課是否允許上架另受 `README_驗證與盲測準則.md` §2.5（甲乙丙／不一致題數 &gt;2 整課封鎖）拘束。

> 歷史提案維度 P-E 易讀性、P-I 文化公平性、P-K 課次題數警示尚未於 `evaluate_question_quality.js` 實作；若日後補上會於此章補述並同步腳本。

---

## 第二章：全站儲存結構與 JSON 字典規範 (Architecture & Schema)

目錄、檔名與 JSON 屬性若偏離下述規範，`scripts/verify_format_consistency.js` 會在 pre-commit 階段擋下。

### 2.1 實體路徑與目錄定義 (Directory Schema)
題庫 JSON 存放路徑為以下五層架構：
`question/platform/{Grade}/{Subject}/{Semester}/{Publisher}/{Filename}`

- **Grade (年級)**：`G1`, `G2`, `G3`, `G4`, `G5`, `G6`
- **Subject (科目目錄名)**：`Chinese`, `Math`, `Science`, `SocialStudies`, `English`, `Life`（資料夾仍用全稱；JSON `meta.subject` 用短碼，見 §2.4）
- **Semester (學期)**：`S1` (上學期), `S2` (下學期)
- **Publisher (版本目錄名)**：`HanLin` (翰林), `KangHsuan` (康軒), `NanYi` (南一)（資料夾仍用 CamelCase；JSON `meta.publisher` 用全大寫，見 §2.4）

### 2.2 檔案命名規則 (File Naming)
題庫 JSON 與 manifest 的實際命名公式：

- **題庫 JSON**：`{Grade}_{Semester}_{Subject}_{Publisher}_L{N}.json`
  - 範例：`G3_S1_CHI_HANLIN_L1.json`、`G5_S2_MATH_KANGHSUAN_L10.json`
- **Manifest**：`{Grade}_{Semester}_{Subject}_{Publisher}_manifest.json`
  - 範例：`G3_S1_CHI_HANLIN_manifest.json`
- **科目短碼**：`CHI`（國語）、`MATH`（數學）、`SCI`（自然）、`SOC`（社會）、`ENG`（英語）、`LIFE`（生活）
- **版本短碼**：`HANLIN`、`KANGHSUAN`、`NANYI`
- 即便是「單元 (Unit)」，也一律映射到 `L{N}`，不使用 `U{N}`。

### 2.3 Manifest 索引檔格式
存放於各 Publisher 目錄下，命名同 §2.2：
```json
{
  "id": "G3_S1_CHI_HANLIN",
  "publisher": "HANLIN",
  "grade": "G3",
  "semester": "S1",
  "subject": "CHI",
  "items": [
    {
      "id": "L1",
      "title": "時間是什麼",
      "theme": "",
      "file": "G3_S1_CHI_HANLIN_L1.json",
      "count": 11,
      "blind_tested": 0,
      "avg_cqi": 5.27
    }
  ]
}
```

- `id` 為 manifest 唯一識別鍵（取 `{Grade}_{Semester}_{Subject}_{Publisher}`）
- `items[*]` 內可含 `theme` / `blind_tested` / `avg_cqi` 等後台統計欄位
- 以 `scripts/normalize_manifest.js` 修正格式；`scripts/verify_format_consistency.js` 於 pre-commit 驗證

### 2.4 主力 JSON 根節點字典 (Root Schema)
根節點必須包含：
1. `meta` (Object)：含 `grade`、`semester`、`subject`（短碼如 `CHI`）、`publisher`（短碼如 `HANLIN`）、`lesson`（如 `"L1"`）、`title`（中文字串）、`order`（整數）、`theme`（可選，單元主題）。
2. `questions` (Array)：所有題目物件的陣列。
3. `publisher` (String)：與 `meta.publisher` 同；舊架構相容欄位，不建議新檔重複設定。

單題屬性（如 `cqi_score`、`quality_level`）不得掛載於根節點。

### 2.5 題目物件標準字典 (Question Schema)
`questions` 陣列內的每一個物件，**至少包含**以下出題階段屬性：

| 鍵名 (Key) | 型別 | 說明與規範 |
|:---|:---|:---|
| `id` | String | 題目唯一碼（可選／由系統生成） |
| `taxonomy` | String | 認知層次分類（如 `inferential`、`literal`、`applied`） |
| `scenario` | String | 題幹情境或引文描述 |
| `question` | String | 實際問句 |
| `options` | Array | 必須為精確的四個選項字串陣列 `["A", "B", "C", "D"]` |
| `answer_index` | Integer | 正確答案索引值，必為 `0, 1, 2, 3`（不使用 `correctAnswer`） |
| `explanation` | String | 詳細的答題解析 |
| `commonMisconception` | String | 易混淆迷思診斷 |
| `quality_level` | String | 品質標籤，如 `QL4`、`QL1` 等 |
| `cqi_score` | Number | 品質評核得分 |
| `topic` | String | （可選）概念子主題 |

驗證階段由 `run_blind_eval.js`、`validate_review_fields.js` 追加的屬性（允許並使用）：

| 鍵名 | 型別 | 說明 |
|:---|:---|:---|
| `authoring_model` | String | 出題使用的模型代碼 |
| `blind_evaluation` | Boolean | 通過盲測後為 `true` |
| `verifying_model` | String | 盲測使用的模型代碼 |
| `verifying_date` | String | 盲測日期 |
| `is_publishable` | Boolean | 後台上架旗標 |
| `review_status` | String | `pending_review` / `approved` 等 |
| `review_notes` | String | 審核備註 |
| `reviewer` | String | 審核者 |
| `review_date` | String | 審核日期 |

### 2.6 前台緩存與數據同步機制
- JSON Assets：`public, max-age=3600, stale-while-revalidate=86400`
- Manifest：`no-cache`
每次產題或結構異動後，必須跑腳本更新 `apps/v3_eidos/src/data/libraryStats.json` 以同步全站數據。

---

## 第三章：CI 自動化工具

### 自動觸發（每次 git commit）

| 腳本 | 用途 | 失敗行為 |
|:--|:--|:--|
| `test_golden_cases.js` | 品質評分回歸 | 拒絕 commit |
| `verify_format_consistency.js` | Manifest 格式驗證 | 拒絕 commit |

### 手動工具速查

| 工具 | 用途 | 指令 |
|:--|:--|:--|
| `auto_balance_json.js` | 打散選項 + 消除 BIAS | `node scripts/auto_balance_json.js question/platform/...` |
| `normalize_manifest.js` | 修正 manifest 格式 | `node scripts/normalize_manifest.js` |
| `evaluate_question_quality.js` | 評估品質 CQI-P | `node scripts/evaluate_question_quality.js question/platform/...` |
| `auto_generate_questions.js` | 國語等補題（國語依 KL4 雙檔＋課文全文錄製，見上方註） | 參數見 `_agent/skills/ei_qst/SKILL.md`；遇 **429** 可加 **`--conservative`**（較低 QPM、較長檔間／批次間／429 等待，429 採指數退避） |
| `batch_chinese_s2_generate.js` | **國語 S2 批次**：G3～G6 × 三出版社目錄依序呼叫上列腳本；預設先跑 `verify_chinese_kl4_prereq.js`；`--` 後參數與單包產題相同 | `node scripts/batch_chinese_s2_generate.js --grades G4 --publishers HanLin -- --key Yotta --model <負責人指定> --qpm 10 --target 30`；`--dry-run` 只列指令；`--prereq-only` 僅檢查 |
| `run_blind_eval.js` | 執行 QL4 盲測驗證 | `node scripts/run_blind_eval.js` |
| `generate_library_stats.js` | 重產後台統計 | `node scripts/generate_library_stats.js` |

> 完整 SOP 請見 `_agent/skills/ei_qst/SKILL.md`

---

## 第四章：出題心法

### 4.1 命題防呆總綱
1. **隱蔽性誘答**：陷阱只能存在於選項邏輯設計，不能污染題幹情境
2. **語境絕對自然**：題幹必須符合真實生活
3. **角色切換**：構思題幹 = 說故事的生活家；設計選項 = 教育心理分析師

### 4.2 猜題防呆機制
- 選項等長原則（被腳本嚴格檢驗）
- 零常識作答（不看文本不能答）
- 引經據典的誘答（基於 KL3 中記載的迷思）
- 語氣中立化

### 4.3 統整活動出題
- **跨課文比較**：拿該單元多篇一起比
- **單元核心價值歸納**：測驗是否看出編者安排意圖

### 4.4 題庫審查漏斗
1. 每題 JSON 含 `is_active` 布林值 → 前台只載入 `is_active !== false`
2. 廣泛生成 → 後台專家精選上架/下架
3. 未來支援學生作答回饋修正
