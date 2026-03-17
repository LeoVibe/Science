# 🧭 Eidos Project 專案總覽與開發指南

> **專案名稱**：Eidos 題庫與學習平台 (v3)  
> **最後更新**：2026-02-26  
> **這份文件的目的**：作為新進開發者、PM、與 AI 協作者的「第一篇必讀指南」，讓團隊內所有人清楚專案全貌、名詞定義、各類文件的存放位置與負責內容，避免資訊重疊與混亂。

---

## 📖 一、專案簡介 (Overview)

Eidos Project 是一個專為國小學生設計的高互動性題庫演練系統，提供108課綱與多個出版社授課內容所延伸的複習題目 (康軒/翰林/南一)。

*   **前端架構**：基於 Vite + React + TailwindCSS 建構的現代化 SPA (`apps/v3_eidos`)。
*   **後端與資料架構**：採用 Cloudflare Pages 部署，並利用 **「靜態 JSON 生成 (Static Assets)」** 策略，將高品質題庫預先編譯為 JSON 交由 CDN 派發，達成極致的讀取效能，取代傳統的關聯式資料庫查詢。

---

## 🗺️ 二、專案文檔生態系 (Documentation Map)

為了讓「不同時期做的事，能在對應的目錄找到最高準則」，所有的管理文件皆收斂於對應的目錄下。每一份文件都有其嚴格定義的「角色職責」，請勿跨界記錄。

| 檔案路徑 | 角色定位 | 核心用途 | 維護者 |
|---------|----------|----------|--------|
| [**`docs/技術設定/網站功能規格書.md`**](docs/技術設定/網站功能規格書.md) | **產品規格 (The "What")** | 記載 UI/UX 設計、視覺規範、原件行為、資料儲存邏輯。**專案 UI 的唯一真理 (Single Source of Truth)**。 | PM / AI |
| [**`docs/技術設定/後台管理架構設計.md`**](docs/技術設定/後台管理架構設計.md) | **技術架構 (The "How")** | 記載後台管理頁面的目錄劃分、路由設計、狀態管理與權限控制。 | 工程師 / AI |
| [**`docs/技術設定/前端開發與AI實作守則.md`**](docs/技術設定/前端開發與AI實作守則.md) | **開發防呆 (The "Rules")**| 約束工程師與 AI 在寫 code 時必須遵守的底線（如：嚴禁 hardcode 色碼、強制讀取規格書等）。 | Tech Lead |
| [**`docs/prj_status.md`**](docs/prj_status.md) | **當前狀態 (The "Where")** | 記載專案現在卡在哪裡、下一個待辦任務是什麼。 | PM / AI |
| [**`docs/task_history.md`**](docs/task_history.md) | **開發日誌 (The "History")**| 記載過去修復了什麼 Bug、完成了什麼里程碑（Append-only）。 | AI 自動寫 |
| [**`docs/待辦與優化項目.md`**](docs/待辦與優化項目.md) | **近期規劃 (The "Next")**| 記載後續短期內的待辦清單清單與優化項目。 | PM / AI |
| [**`docs/未來發展藍圖與願望清單.md`**](docs/未來發展藍圖與願望清單.md) | **長期願景 (The "Future")**| 記載長期的功能藍圖、研究方向與使用者願望（Wishlist）。 | PM / AI |
| [**`jobs/任務看板與派工.md`**](jobs/任務看板與派工.md) | **任務管理** | 看板總覽、派工單規格、完工標準。 | Cursor / AG |
| [**`knowledge/README_出題設計準則.md`**](knowledge/README_出題設計準則.md) | **出題設計** | 教育心理學、品質把關規範。 | PM (AG) |
| [**`question/README_題庫格式規範.md`**](question/README_题庫格式規范.md) | **資料產出** | 純題庫數據的 JSON Schema。 | Dev / PM |

> **⚠️ 跨邊界協作警告 (雙軌制架構)**：
> 1. 當你在操作特定行為（如寫網頁、產題、研究）時，請查閱 `_agent/skills/` 下的對應技能，它負責**管制流程並提供強制驗證的 Checklist**。
> 2. 當你要深入了解為什麼需要這樣驗證、背後的 UI 規格或教育學理是什麼時，請參閱本表所列的對應總綱。
> 3. **嚴禁將教學理論寫在 Skill 裡，也嚴禁將防呆 Checklist 從 Skill 中拔除。**這是保護 AI 不會發生邏輯錯亂的最高原則。

---

## 📚 三、核心名詞定義字典 (Glossary)

為了極小化溝通成本，請使用以下精確的術語：

### 課程、時間與出版社標定
*   **G (Grade)**：年級。例如 `G3` (三年級)、`G4`、`G5`。
*   **S (Semester)**：學期。例如 `S1` (上學期)、`S2` (下學期)。
*   **學科代碼**：`Chinese` (國語)、`Math` (數學)、`Science` (自然)、`Social` (社會)、`English` (英語)。
*   **出版社 (Publisher)**：`KangHsuan` (康軒)、`HanLin` (翰林)、`NanYi` (南一)。
*   *組合範例*：`G3_S2_Chinese_NanYi` 代表「三年級下學期國語南一版」。

### 品質指標 (三維度品質體系)
本專案的品質把關由源頭到產出分為三個層次：
*   **RM (Research Maturity)**：研究成熟度指標 (R0~R3)。標示課綱研究的進展，決定 AI 能產出多深的題目。
*   **CQI (Composite Quality Index)**：題目細緻度指標 (10分制)。AI 在產題時的最佳化門檻與把關依據，若平均低於 6.0 分需重啟出題。
*   **QG (Quality Gate)**：題庫嚴謹度指標 (L1~L5)。平台對外的發布標準，負責防呆與把關（例如選項分配不均會被判定為 L1）。
*   詳細評分方式請嚴格參閱 `knowledge/README_出題設計準則.md`。

### 協作與工具標定
*   **AG (Antigravity)**：指代 PM Agent，主要負責「分析課綱、產生知識、審查品質、下達 Git 提交」。
*   **Cursor**：指代開發 Agent (Dev)，主要負責「讀取派工單、撰寫 `apps/` 內的程式碼、部署基礎設施」。
*   **Manifest**：`/question/platform/` 目錄中，用於註冊該出版社「總共有哪些單元/課次」的 `manifest.json` 索引檔。

### Git 分支與版本守衛
*   **`main` 分支**：永遠只存放「通過所有評估腳本 (自動化測試 / L3+ 品質評分)」的高品質程式碼與題庫。
*   **`feature/*` 分支**：舉凡產出新題庫或設計新系統畫面，都應切割特徵分支，開發完畢再 Merge 回主線。
*   **Pre-commit Hook**：任何涉及 `question/platform` 題庫 JSON 的提交動作，皆會強制觸發 `evaluate_question_quality.js --gate` 偵測。

---

## 🤖 四、團隊專屬 AI Skills (協作自動化指令)

為了讓文檔生態系永保常新與維持開發紀律，我們在 `_agent/skills/` 下封裝了四大專用的 AI 指令 (Slash Command)：

### 🚀 `/dojob` (專案開工與任務派發)
* **使用時機**：當接到新任務，或準備收尾結單時。
* **觸發行為**：
  - **開案**：AI 會掃描待辦清單或讀取指定派工單，自動更新 `prj_status.md` 為進行中，並建立展開的 `task.md` 計畫，完成開工對齊。
  - **結案**：他只管「單一任務的生與死」。他會檢查是否產出了 `Report.md`，並強制呼叫 `job_manager.js close` 來收尾。

### 📘 `/doqst` (題庫產出防呆流水線)
* **使用時機**：處理任何與「產出/修改題庫 JSON」相關的任務時。
* **觸發行為**：AI 會化身嚴格品管，強制先讀取格式 Schema。產出 JSON 後自動在終端機跑評估腳本。若品質分數 (CQI < 6.0) 過低或觸發 L1 防呆，將自動攔截打回重練。

### 🔄 `/dosync` (全域文檔知識沉澱)
* **使用時機**：每張工單做完，**準備呼叫 `dojob` 結案之前**必做。
* **觸發行為**：他不管任務流水號，只管「全站規格」。AI 會根據這次的開發，去劃掉 `prj_status.md` 裡的技術債、將新的 UI 決策更新入 `網站功能規格書.md`，並在 `task_history.md` 追加全域變更日誌。

### 🔍 `/audit` (規格庫巡檢與除舊佈新)
* **使用時機**：定期大保養，或感覺規格書與程式碼開始脫節時。
* **觸發行為**：AI 會化身 QA，拿著《網站功能規格書》去比對 `src/` 裡的程式碼。找出「顏色對不上」、「元件不見了」等矛盾，列出報告請 PM 定奪，然後一次性抹平技術債。

---

## 📂 五、實體專案目錄地圖 (Directory Map)

```text
/eidosProject
├── apps/                 # 系統前端原始碼 (Vite + React)
│   ├── v3_eidos/         # 主力開發專案 UI (含本身的 end-to-end tests)
│   └── v2_science/       # 舊版專案 (已歸檔)
│
├── backend/              # 後端服務專案
│   └── api/              # Cloudflare Worker API（D1/KV）
│
├── docs/                 # 專案管理與規格文件集 (詳見上方 Map)
├── jobs/                 # 任務與派工管理中心 (由 AG 控制)
├── knowledge/            # 大腦與知識殿堂 (由 AG 維護，放課綱分析)
├── question/             # 靜態資料庫 (純 JSON 源碼與格式規範)
│   ├── source/           # 原始 CSV 與爬蟲素材
│   └── platform/         # 餵給前端的正式標準 JSON 檔
│
├── scripts/              # Node.js 批次腳本 (轉檔、統計、品質校驗 evaluate)
├── shared/               # 跨專案共用模板區 (archives/forms/instruments)
├── tests/                # 獨立的題庫驗證 Golden Cases (非前端 E2E)
└── _agent/               # Agent 的專案級設定區 (Skills 定義)
```

> 🤝 **歡迎加入 Eidos 開發！請隨時保持文件與程式碼的同步。**

---

## 🧱 六、根目錄檔案使用規範 (Root Files Policy)

- **根目錄禁止放置臨時任務／Checklist 檔案**，例如：`task.md`、`task_*.md`、`tasks.md` 等。
- 所有與任務相關的內容（包含 checklist、執行步驟、DoD）一律寫入對應的 `jobs/JOB-XXX-*.md` 或 `jobs/JOB-XXX-Report.md` 中。
- 若發現歷史遺留的根目錄任務檔，僅作為過往紀錄參考，不得複製此模式繼續新增。

---

## 🛡️ 七、AI Agent 工作路徑規範 (AI Workspace Policy)

> **核心原則：確保「正式工作目錄」為變更的唯一真理，避免於背景影子目錄作業。**

1.  **正式工作空間**：專案根目錄（即包含 `.git/` 與 `README.md` 的實體區域）。
2.  **影子區塊警告**：若偵測到當前路徑包含 `.cursor/worktrees/`，代表處於 Cursor 內部並行分析區。
3.  **AI 行為限制**：
    *   執行任何 Terminal 指令或檔案讀寫前，必須確認處於「正式工作空間」。
    *   若 Agent 處於 Worktree 狀態，須主動提醒使用者，並確保變更同步回主專案。
    *   **更新時間**：2026-02-28 19:30
