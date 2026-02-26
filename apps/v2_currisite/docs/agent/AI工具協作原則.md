# AI 工具協作原則（可放 global rules）

**用途**：開發流程中，所有 AI 工具（如 Cursor、Antigravity 等）的**角色定義、協作方式、改版紀錄、產出與測試**的共通原則。可複製至專案規則或 Cursor global rules 使用。

**版本**: 1.0 | **更新**: 2026-02-18

---

## 一、角色定義

| 工具／角色 | 負責範圍 | 不負責 |
|------------|----------|--------|
| **Cursor** | 前端程式（Vue、路由、UI、讀取 platform 題庫）；唯讀 `public/questions/platform/`；題庫錯誤記入 `docs/record/DATA_ERRORS.md`；依 `docs/agent/CONTRACT.md` 讀取 manifest 與 JSON | 不直接修改題庫 JSON；不代 Antigravity 定義題庫格式 |
| **Antigravity** | 產出與維護 `public/questions/platform/` 下目錄、manifest、單課題庫 JSON；格式與路徑符合 `docs/agent/CONTRACT.md` | 不修改前端程式 |
| **其他 AI／開發者** | 依任務引用 CONTRACT 或 REQUIREMENTS；改版時更新 CHANGELOG；產出與註解以中文描述為準 | 不偏離契約與文件分類約定 |

角色邊界以 **docs/agent/CONTRACT.md** 為準；若有新增工具，請在本節與 CONTRACT 中同步補上。

---

## 二、協作與溝通方法

### 2.1 單一規格來源

- **題庫與前端對齊**：只以 **docs/agent/CONTRACT.md** 為準。路徑、檔名、JSON 結構、分工、檢查清單皆在此份。
- 對話或任務說明中**引用契約條目**（例如「依 CONTRACT §1 路徑」「CONTRACT 檢查清單第 2 項未過」），避免重複貼整段規格，以節省 token 並保持一致。

### 2.2 錯誤回報格式

- 題庫錯誤（路徑錯誤、缺 manifest、meta 缺欄、答案與選項不一致等）**只記錄在** `docs/record/DATA_ERRORS.md`。
- 格式建議：**路徑**、**問題描述**、**建議修正**（可選）。由 Antigravity 依此檔修正，不需從長對話中撈脈絡。

### 2.3 需求與實作對照

- 完整需求：**docs/需求說明書.md**。
- 快速對照與摘要：**docs/developer/REQUIREMENTS.md**。
- 協作方法與改進方向：**docs/developer/COLLABORATION.md**。
- 新功能或行為變更前，先對齊需求說明書與 CONTRACT，再實作。

---

## 三、改版與修正紀錄

- **每次改版或行為變更**（含前端 UI、路由、題庫路徑/格式、無題庫顯示、手機版選單等），都應在 **docs/record/CHANGELOG.md** 留下簡短紀錄。
- **格式**：每條標註 **版本號**（與站內「關於本站」對齊，如 v0.7.0）與 **日期時間**（YYYY-MM-DD HH:mm），方便 Cursor 與 Antigravity 對齊釋出與回溯。
- 紀錄內容建議：**版本**、**日期時間**、**類別**（前端／題庫／文件）、**簡短描述**（做了什麼、修了什麼問題）。
- 不要求每筆 commit 都寫，但同一輪交付或「可對外說明的一次變更」應有一筆 CHANGELOG。

---

## 四、產出規範

- **語言**：產出以**中文**為主（註解、文件、CHANGELOG、commit 訊息、錯誤描述、給使用者的文案）。
- **風格**：以**描述式、說明清楚**為準；避免僅列關鍵字而無脈絡。程式註解可簡短，但文件與紀錄應讓人能讀懂「做了什麼、為什麼」。
- **對外文案**：站內使用者看到的文字（按鈕、標題、空狀態、關於本站）以繁體中文、語意完整為準。

---

## 五、測試建議

- **建置**：改動後至少確保 `npm run build` 通過。
- **本機 smoke**：手動或簡單自動化驗證：選擇年級／科目／學期／出版社 → 載入題庫 → 分課列表與題數正確 → 進入練習、答題、下一題、正確／錯誤回饋正常；無題庫時顯示單一空狀態「題庫建置中」。
- **手機版**：在窄寬度下檢查頂部科目按鈕、漢堡選單（年級／學期／出版社／科目／功能皆為點選）、分課與答題流程可操作。
- **題庫端**：Antigravity 交檔前依 CONTRACT 檢查清單自檢（路徑、檔名、manifest、meta、answer 與 options）；若有專案內驗證腳本（如 validate、test-load），建議執行後再交付。
- **回歸**：若專案有既有測試腳本，改動相關邏輯時應跑過一輪，再更新 CHANGELOG。

---

## 六、文件分類與路徑（對照表）

| 分類 | 路徑 | 用途 |
|------|------|------|
| **AI Agent 協作** | docs/agent/CONTRACT.md | 單一契約：路徑、檔名、JSON、分工、檢查清單（給 Cursor / Antigravity 對齊用） |
| **AI Agent 協作** | docs/agent/AI_COLLABORATION_RULES.md | 本文件：角色、協作、改版、產出、測試原則（可放 global rules） |
| **開發者** | docs/developer/REQUIREMENTS.md | 需求摘要與對完整說明書的引用 |
| **開發者** | docs/developer/COLLABORATION.md | 開發方法、多 AI 協作、省 token、使用者功能改進方向 |
| **紀錄** | docs/record/DATA_ERRORS.md | 題庫錯誤回報（給 Antigravity） |
| **紀錄** | docs/record/CHANGELOG.md | 修正紀錄（分課與學期、抖動、無題庫 UI、手機版等） |
| **紀錄** | docs/record/CURRICULUM_COVERAGE.md | 題庫覆蓋與建置進度（可自 Antigravity 複製） |
| **索引** | docs/README.md | 說明四類文件：誰看、放哪裡、怎麼用 |

---

## 七、放進 Global Rules 的建議

- 將本文件（或其中第一～五節）複製到 **Cursor 的 global rules**（例如 `.cursor/rules` 或使用者全域規則），可讓所有專案內的 AI 對話預設遵守：角色邊界、以 CONTRACT 為準、錯誤記 DATA_ERRORS、改版寫 CHANGELOG、產出用中文描述、測試建議。
- 若僅限本專案：在專案根目錄的規則或 `docs/README.md` 中註明「AI 協作依 docs/agent/AI_COLLABORATION_RULES.md」，並在 COLLABORATION 中引用本文件即可。
