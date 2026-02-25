---
description: 題庫格式規範 — 產出或修改題庫 JSON 前必讀，統一 AG/Cursor 格式
---

# 📘 題庫格式規範 Workflow (2026-02-24)

> **觸發時機**：凡涉及「產出題庫 JSON」、「修改題目檔」、「建立/更新 manifest.json」的任何操作，必須先閱讀此 workflow，確認格式後再進行。

---

## Step 0：參照規範文件

在動手之前，必須先確認以下兩份檔案的最新內容：

1. **題庫格式與緩存規範** → `question/README_題庫格式規範.md`
2. **題庫數據理型 (Schema)** → `shared/forms/題庫數據理型.md`

// turbo
使用 `view_file` 工具將上述兩份檔案完整讀入，確認目前版本的 field name、結構與注意事項。

---

## Step 1：確認目標格式

目前平台前端 `questionLoader` 支援四種格式（A / A' / B / C），**不可自行發明新格式**。

| 格式 | 辨識條件 | 答案欄位 | 適用情境 |
|------|----------|----------|----------|
| **A** | `data.meta` 且 `data.questions` 陣列 | 題目內 `answer`（文字全匹配） | 舊版單元檔（自然/社會等） |
| **A'** | `data.questions` 陣列且**無** `data.meta` | `answer_index`（0-based 整數） | **國語 AG 產出**（推薦格式） |
| **B** | 單一題目物件 `data.question` + `data.options` | `correctAnswer` 或 `answer` | L4 單題一檔 |
| **C** | `data` 為題目陣列 | 每題 `correctAnswer` 或 `answer` | 一檔多題陣列 |

### ⚠️ 關鍵規則
- **同一產出管道（同科目、同出版社）內，答案欄位名稱必須統一**。不可混用 `answer_index` 與 `answer`。
- **格式 A'** 為目前主要推薦格式（一課一檔、多題、0-based answer_index）。
- 若需使用其他格式，請事先在此 workflow 內或 `README_題庫格式規範.md` 中登記。

---

## Step 2：確認路徑結構

```
question/platform/{Grade}/{Subject}/{Semester}/{Publisher}/{file}.json
question/platform/{Grade}/{Subject}/{Semester}/{Publisher}/manifest.json
```

- `Grade`：`G3`, `G4`, `G5` 等
- `Subject`：`Chinese`, `Math`, `Science`, `Social`, `English`
- `Semester`：`S1`（上學期）, `S2`（下學期）
- `Publisher`：`KangHsuan`（康軒）, `NanYi`（南一）, `HanLin`（翰林）

---

## Step 3：manifest.json 格式

manifest 支援兩種寫法，新產出**優先使用格式二**：

**格式二（推薦）**：
```json
{
  "publisher": "翰林",
  "grade": "G5",
  "semester": "S2",
  "subject": "Chinese",
  "items": [
    { "id": "L1", "title": "讀首情詩給大地", "path": "Chi_L1.json" }
  ]
}
```

**格式一（舊版）**：
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

---

## Step 4：題目檔 JSON 格式（格式 A' 範本）

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

### 欄位檢查清單
- [ ] `answer_index` 為 0-based 整數（0 = 第一個選項）
- [ ] `options` 恰好 4 個選項
- [ ] `question` 不含選項文字
- [ ] `explanation` 非空
- [ ] 頂層 `grade`, `semester`, `subject`, `publisher`, `lesson_id`, `lesson_title` 齊全

---

## Step 5：產出後驗證與品質閘門

// turbo
產出 JSON 後，務必執行以下「品質門檻 (Quality Gate)」檢核：

1. **運行閘門稽核**：
   ```bash
   node scripts/evaluate_question_quality.js --gate {file_path}
   ```
2. **攔截與糾正**：
   - 若顯示 `❌ [Quality Gate]`，代表該單元 **不合格**。
   - **自糾正程序**：AI 必須檢查報錯原因。重點檢查 `answer_index` 分佈是否發生「連續 B (index 1)」的嚴重偏差，並重新參考研究紀錄產出。
3. **數據同步**：
   - 稽核通過後，執行 `node scripts/sync_stats.js` 同步後台數據。

4. **其餘手動檢核**：
   - 確認 `manifest.json` 中的 `path` 與實際檔名一致。
   - 更新對應年級的 `question/platform/{Grade}/題庫統計表.md`。

---

## Step 6：常見錯誤提醒

| 錯誤類型 | 說明 |
|---------|------|
| `answer` vs `answer_index` 混用 | 同一管道只能擇一，格式 A' 請用 `answer_index` |
| `answer_index` 超出索引 | 必須在 `0` 到 `options.length - 1` 之間 |
| manifest `path` 與檔名不符 | `Chi_L1.json` 必須實際存在 |
| 科目英文名不一致 | 務必使用 `Chinese` / `Math` / `Science` / `Social` / `English` |
| 出版社英文名不一致 | 務必使用 `KangHsuan` / `NanYi` / `HanLin` |
