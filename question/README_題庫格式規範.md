# 🗂️ README：題庫格式與緩存規範 (Data Guidelines)

**最後修訂時間：** 2026-02-24
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

### 3.2 結構定義（兩種格式皆支援）

**格式一：units + file（舊版／數學等）**
```json
{
  "grade": "G3",
  "semester": "S1",
  "subject": "Science",
  "publisher": "KangHsuan",
  "units": [
    { "id": "Sci_U1", "order": 1, "title": "多采多姿的植物", "file": "Sci_U1.json" }
  ]
}
```

**格式二：items + path（國語 AG 產出）**
```json
{
  "publisher": "翰林",
  "grade": "G5",
  "semester": "S2",
  "subject": "Chinese",
  "items": [
    { "id": "L1", "title": "讀首情詩給大地", "path": "Chi_L1.json" },
    { "id": "L2", "title": "聽！那是什麼聲音？", "path": "Chi_L2.json" }
  ]
  ]
}
```

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
