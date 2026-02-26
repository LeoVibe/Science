# 平台題庫規格與協作說明 (v1.0)

此文件定義了 Cursor 與 Antigravity 在維護題庫時必須遵循的規範，以確保資料與前端平台完美對齊。

## 🛠️ 對齊檢查表 (Alignment Checklist)

- [x] **科目命名對齊**：五年級以上「英語」科目路徑統一使用 `英文`。
- [x] **路徑驗證**：在前端選擇「五年級 → 英文 → 上學期 → 康軒」應能正常讀取 manifest.json 與題目。
- [x] **雙區同步規範**：所有改動必須先在 `questions/source` 進行，再同步至 `questions/platform`。
- [x] **Manifest 自動化**：發布前必須執行 `scripts/generate_manifests.py` 生成索引。
- [x] **錯誤處理流程**：發現錯誤應寫入 `docs/DATA_ERRORS.md`，由 Antigravity 處理。

## 📂 1. 目錄架構

```
questions/
├── source/              # 原始題庫區（真理來源）
└── platform/            # 平台發布區（供前端讀取，含 manifest.json）
```

### 路徑規範：
`questions/{區域}/G{年級}/{科目}/S{學期}/{出版社}/`

*   **科目關鍵字**：國語, 數學, 英文 (G3以上使用), 自然, 社會
*   **學期關鍵字**：S1 (上學期), S2 (下學期)

---

## 📋 2. JSON 格式要點 (Meta)

每個題庫 JSON 必須包含完整的 meta 資訊：
- `grade`: `grade_5`
- `subject`: `英文`
- `semester`: `semester_1`
- `publisher`: `kang_hsuan` / `han_lin` / `nan_yi`

---

## 🔄 3. 協作工作流

1.  **新增資料**：在 `source` 下建立 JSON。
2.  **同步發布**：
    ```bash
    cp -r questions/source/* questions/platform/
    python3 scripts/generate_manifests.py
    ```
3.  **錯誤回報**：若在平台發現題目文字、答案或解析錯誤，請更新 `docs/DATA_ERRORS.md`。
