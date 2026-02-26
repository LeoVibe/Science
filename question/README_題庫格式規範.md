# 🗂️ README：題庫格式與緩存規範 (Data Guidelines)

**最後修訂時間：** 2026-02-26 12:20
**存放路徑：** `question/README_題庫格式規範.md`
**目的：** 本目錄純粹存放 JSON 與 CSV 題庫數據。此文件規範 `eidosProject` 題庫服務層如何定義 JSON 結構與管理緩存。

---

## 1. 存取策略與資源路徑 (Access Pattern & Routing)
本平台採用 **「靜態 JSON 生成 (Static Assets)」** 策略。所有題庫在編譯期即轉為靜態 JSON 交由 CDN 派發，達成零冷啟動。

*   **前台存取路徑定義**：`/question/platform/{grade}/{subject}/{semester}/{publisher}/{lesson_file}.json`
*   *(範例：`/question/platform/G3/Science/S1/KangHsuan/Sci_U1.json`)*

---

## 2. 索引檔規範 (Manifest Registry)
每個出版社配置一個 `manifest.json`，供前端動態產生單元選單。
**位置**：`/question/platform/{grade}/{subject}/{semester}/{publisher}/manifest.json`

### 2.1 結構定義（嚴格遵循單一格式）

**⚠️ 核心工程精神：從源頭解決 (Single Source of Truth) **
所有生成的 `manifest.json` 必須**強制完全一致**，禁止依賴前端城市碼的相容性或容錯（Fallback）機制來處理名稱變異（如 `units` / `items` 或 `name` / `title` 混用）。這會導致專案難以維護且容易產生「改A壞B」的連鎖效應。

**強制標準格式 (Items Array + Title)：**
```json
{
  "publisher": "翰林",
  "grade": "G5",
  "semester": "S2",
  "subject": "Chinese",
  "items": [
    { "id": "L1", "title": "讀首情詩給大地", "file": "Chi_L1.json" },
    { "id": "L2", "title": "聽！那是什麼聲音？", "file": "Chi_L2.json" }
  ]
}
```
*註：陣列名稱一律為 `items`，單元名稱一律為 `title`，檔案名稱一律為 `file`。*

---

## 3. 題目檔格式 (Question File Formats)

前端 `questionLoader` 依下列優先順序辨識單一題目檔的結構；**任一格式符合即會載入**。

| 格式 | 辨識條件 | 答案欄位 | 說明 |
|------|----------|----------|------|
| **A** | `data.meta` 且 `data.questions` 陣列 | 題目內 `answer` | 舊版單元檔，有 meta 包裝 |
| **A'** | `data.questions` 陣列且**無** `data.meta` | 題目內 **`answer_index`**（0-based） | 國語 AG 產出：頂層 `lesson_id`、`lesson_title` |
| **B** | 單一題物件：`data.question` | `correctAnswer` | L4 單題一檔 |
| **C** | `data` 為題陣列 | `correctAnswer` | 一檔多題陣列 |

### 💡 格式 A'（主力）欄位對齊範例

若為「一課一檔、多題」且無 meta 包裝，必須採用 **`answer_index`**（0-based 整數）：

```json
{
  "publisher": "翰林",
  "grade": "G5",
  "semester": "S2",
  "subject": "Chinese",
  "lesson_id": "L1",
  "lesson_title": "讀首情詩給大地",
  "questions": [
    {
      "question": "題幹文字",
      "options": ["選項A", "選項B", "選項C", "選項D"],
      "answer_index": 1,
      "explanation": "解析",
      "scenario": "情境描述（選填）",
      "commonMisconception": "迷思診斷（選填）"
    }
  ]
}
```

---

## 4. 緩存機制 (Caching Strategy)
*   **JSON Assets (`*.json`)**: `public, max-age=3600, stale-while-revalidate=86400`
*   **Manifest (`manifest.json`)**: `no-cache` (確保前端能即時取得最新章節)

---

## 5. 題庫統計表維護規範 (Inventory Tracking)

每個年級目錄下必須維護一份統計檔以利追蹤：
*   **位置**：`/question/platform/{grade}/題庫統計表.md`

### 6.2 更新時機
- **新增單元**: 每次完成新題庫開發並同步至 `platform` 後。
- **結構調整**: 修改目錄結構或重新對齊課程大綱後。
- **前端數據同步**: 同時更新 `/apps/v3_eidos/src/data/libraryStats.json` 以確保後台介面數據顯示同步。
- **定期稽核**: 每次發布重大版本前。


### 5.2 內容格式
參考 `codex/題庫統計表_legacy.md` 格式，包含：整體摘要、詳細清單及更新紀錄。

---

## 6. 前端 UI 狀態同步 (UI State Synchronization)

後台管理介面（Admin）的題庫清單**依賴靜態設定檔 `libraryStats.json`**，而非動態掃描。
每次產出題庫後，**必須同步修改**：
- **路徑**：`apps/v3_eidos/src/data/libraryStats.json`
- **更新內容**：
  1. `stats["G{N}_S{X}_{Subject}"].count`: 該科目學期整體的總單元數。
  2. `stats["...].depth`: 該科目的預設品質等級（如 `L4`）。
  3. `publisherStats["G{N}_S{X}_{Subject}_{Publisher}"].units`: 該版本的具體單元數。
  4. `publisherStats["..."].questions`: 該版本的總題目數。
  5. `publisherStats["..."].quality`: 該版本的品質宣稱（如 `L4`）。

---

## 7. 🔁 自動化工具觸發節點 (CI Automation)

本專案透過 **Git Pre-commit Hook** (`.git/hooks/pre-commit`) 自動執行品質防護。

### 自動觸發（每次 `git commit`）

| 節點 | 腳本 | 觸發條件 | 失敗行為 |
|------|------|----------|----------|
| **節點 1** 品質評分回歸 | `scripts/test_golden_cases.js` | 每次提交 | 拒絕 commit |
| **節點 2** Manifest 格式驗證 | `scripts/verify_format_consistency.js` | `question/` 有異動時 | 拒絕 commit |

### 手動工具（新增題庫後執行，不自動觸發）

| 工具 | 用途 | 指令 |
|------|------|------|
| `auto_balance_json.js` | 打散選項順序 + 補齊選項長度 | `node scripts/auto_balance_json.js question/platform/...` |
| `normalize_manifest.js` | 強制修正 manifest 格式為唯一標準 | `node scripts/normalize_manifest.js` |
| `evaluate_question_quality.js` | 評估題庫品質等級 (L1-L5) | `node scripts/evaluate_question_quality.js question/platform/...` |
| `generate_library_stats.js` | 重新產出後台統計資料 | `node scripts/generate_library_stats.js` |

---

## 8. 📋 新增題庫標準作業流程 (SOP)

```sh
# 1. 打散選項 + 消除 BIAS
node scripts/auto_balance_json.js question/platform/[科目路徑]

# 2. 正規化所有 manifest（若有違規欄位自動修正）
node scripts/normalize_manifest.js

# 3. 驗證品質（全數 L4+）
node scripts/evaluate_question_quality.js question/platform/[科目路徑]

# 4. 更新後台統計
node scripts/generate_library_stats.js

# 5. 提交（會自動觸發 Hook 雙節點保護）
git add .
git commit -m "feat: 新增 [...] 題庫"
```

> **注意**：若 hook 回報格式違規，執行 `node scripts/normalize_manifest.js` 修正後重新提交。
