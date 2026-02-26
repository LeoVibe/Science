# docs 目錄說明

本目錄為**內部使用**，不部署、不提供給一般使用者。依讀者與用途分為四類，**以本索引為入口**。

---

## 一、AI Agent 協作用

| 路徑 | 用途 | 讀者 |
|------|------|------|
| **[agent/CONTRACT.md](agent/CONTRACT.md)** | 題庫與前端的**單一協作契約**：路徑、檔名、JSON 格式、分工、檢查清單 | Cursor、Antigravity 等 AI 或開發者 |
| **[agent/AI_COLLABORATION_RULES.md](agent/AI_COLLABORATION_RULES.md)** | **AI 協作原則**：角色定義、協作與溝通、改版紀錄、產出與測試；可放 global rules | 所有參與開發的 AI、專案維護者 |

**使用方式**：產題庫或改前端前，以 CONTRACT 對齊規格；協作流程與原則依 AI_COLLABORATION_RULES，減少重複說明與 token。

---

## 二、開發者看

| 路徑 | 用途 | 讀者 |
|------|------|------|
| **[需求說明書.md](需求說明書.md)** | **完整**產品需求說明書（畫面、功能、流程、資料格式、檔案結構） | 實作或接手開發者、驗證用 AI |
| **[UI_UX_SPECIFICATION.md](UI_UX_SPECIFICATION.md)** | **UI/UX 設計規格書**（視覺設計系統、視圖規格、操作流程、響應式設計、動畫效果、無障礙設計） | 前端設計師、Lovable AI、介面開發者 |
| **[developer/REQUIREMENTS.md](developer/REQUIREMENTS.md)** | 需求摘要與對照 | 快速查閱 |
| **[developer/COLLABORATION.md](developer/COLLABORATION.md)** | 開發方法、多 AI 協作、省 token、使用者功能改進方向 | 專案維護者、協作方 |

---

## 三、給使用者看

- **站內**：使用者只看網站與「關於本站」彈窗，無需讀 docs。
- 本目錄無「給使用者看的文件」；若需對外說明，請更新 app 內文案或關於本站。站內文案來源可參考 **[關於本站.md](關於本站.md)**。

---

## 四、做紀錄用（record/）

| 路徑 | 用途 |
|------|------|
| **[record/DATA_ERRORS.md](record/DATA_ERRORS.md)** | 題庫錯誤清單，回報給 Antigravity 修正（**唯此為準**，勿在 docs 根目錄另建 DATA_ERRORS） |
| **[record/CHANGELOG.md](record/CHANGELOG.md)** | 修正與變更紀錄（分課、學期、抖動、無題庫 UI、手機版等） |
| **[record/CURRICULUM_COVERAGE.md](record/CURRICULUM_COVERAGE.md)** | 題庫建置進度與覆蓋狀況（來源：Antigravity） |
| **[record/架構驗證報告.md](record/架構驗證報告.md)** | 平台題庫架構驗證結果與統計 |
| **[record/antigravity-題庫修正清單.md](record/antigravity-題庫修正清單.md)** | 驗證發現之題庫問題清單（供 Antigravity 修正） |

---

## 網站與文件對齊

- **網站行為**：以 需求說明書.md 與實際上線為準。
- **題庫規格**：以 agent/CONTRACT.md 為準；前端唯讀 platform，錯誤記 **record/DATA_ERRORS.md**。
- **協作與改進**：見 developer/COLLABORATION.md、agent/AI_COLLABORATION_RULES.md。

**建議**：協作時優先引用 `agent/CONTRACT.md`，避免在對話中重複貼路徑與格式，以節省 token 並保持一致。

---

## 已統合／轉址文件（歷史）

以下文件已由 **agent/**、**developer/**、**record/** 取代，目前僅保留**轉址說明**，請改讀對應連結：

| 原檔名 | 請改讀 |
|--------|--------|
| 平台題庫規格與協作說明_for_cursor.md | [agent/CONTRACT.md](agent/CONTRACT.md)、[developer/COLLABORATION.md](developer/COLLABORATION.md)、[agent/AI_COLLABORATION_RULES.md](agent/AI_COLLABORATION_RULES.md) |
| 平台題庫規格與協作說明.md | 同上 + [record/CURRICULUM_COVERAGE.md](record/CURRICULUM_COVERAGE.md) |
| 平台題庫規格.md | [agent/CONTRACT.md](agent/CONTRACT.md)、[record/CURRICULUM_COVERAGE.md](record/CURRICULUM_COVERAGE.md) |
| antigravity-題庫規格-更新版.md | [agent/CONTRACT.md](agent/CONTRACT.md)、[agent/AI_COLLABORATION_RULES.md](agent/AI_COLLABORATION_RULES.md) |

- **DATA_ERRORS.md**（原在 docs 根目錄）：已刪除，題庫錯誤請一律寫入 **record/DATA_ERRORS.md**。
- **CURRICULUM_COVERAGE.md**（原在 docs 根目錄）：已刪除，請用 **record/CURRICULUM_COVERAGE.md**。
- **修正說明-分課與學期對應.md**、**修正說明-分課顯示與抖動問題.md**：內容已納入 **record/CHANGELOG.md**，原檔已刪除。
- **架構驗證報告.md**、**antigravity-題庫修正清單.md**：已搬至 **record/**，路徑見上表「做紀錄用」。
