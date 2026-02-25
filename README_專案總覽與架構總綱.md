# 🌐 Eidos Project 專案總覽與架構總綱

**最後更新**：2026-02-25
**核心維護者**：Antigravity (PM) & Cursor (Dev)

> **這是一切的起點。**  
> 此文件為 Eidos Project (V3 題庫平台) 的「最高層級導覽地圖」與「名詞字典」。  
> 任何新加入的協作者或 Agent，在執行任務前請務必先閱讀本總綱，確保對齊專案的共同語言。

---

## 📖 一、 專案簡介 (Overview)

Eidos Project 是一個專為國小學生設計的高互動性題庫演練系統，提供108課綱與 多個出版社授課內容所延伸的複習題目(康軒/翰林/南一) 。

*   **前端架構**：基於 Vite + React + TailwindCSS 建構的現代化 SPA (`apps/v3_eidos`)。
*   **後端與資料架構**：採用 Cloudflare Pages 部署，並利用 **「靜態 JSON 生成 (Static Assets)」** 策略，將高品質題庫預先編譯為 JSON 交由 CDN 派發，達成極致的讀取效能，取代傳統的關聯式資料庫查詢。

---

## 🏛️ 二、文件架構

為了讓「不同時期做的事，能在對應的目錄找到最高準則」，我們將專案的規範與操作手冊嚴格分為四大區塊：

| 領地位置 | 專屬核心文件 (SSOT) | 負責情境與內容 | 主要受眾 |
| :--- | :--- | :--- | :--- |
| **🏆 根目錄** | `README_專案總覽與架構總綱.md` | 專案全貌、名詞定義、目錄導覽 | 所有人 |
| **📋 `jobs/`** | `README_任務看板與派工.md` | **任務開發期**：看板、派工單規格、完工標準 | Cursor / AG |
| **🧠 `knowledge/`** | `README_出題設計準則.md` | **課綱研究期**：教育心理學、L4出題心法 | PM (AG) |
| **🗂️ `question/`** | `README_題庫格式規範.md` | **資料產出期**：純題庫數據的 JSON Schema | Dev / PM |

> **⚠️ 跨邊界協作警告**：
> 當你人在開發系統 (`apps/`)，請看 `jobs/` 裡的派工指令。當你要產出題庫 JSON，請遵守 `question/` 的結構規範。**嚴禁將程式開發規範寫在知識庫裡，也嚴禁將教育學理寫在資料夾裡。**

---

## 📚 三、 核心名詞定義字典 (Glossary)

為了極小化溝通成本，請使用以下精確的術語：

### 課程與時間標定
*   **G (Grade)**：年級。例如 `G3` (三年級)、`G4`、`G5`。
*   **S (Semester)**：學期。例如 `S1` (上學期)、`S2` (下學期)。
*   **學科代碼**：`Chinese` (國語)、`Math` (數學)、`Science` (自然)、`Social` (社會)、`English` (英語)。
*   *組合範例*：`G3_S2_Chinese_NanYi` 代表「三年級下學期國語南一版」。

### 題庫品質等級標定 (Depth)
*   **L1 (課綱關鍵字)**：AI 逕行推論，僅依據標題產出，缺乏具體教材支撐。
*   **L2 (實質課文)**：具備課文實證（需有 Curriculum Matrix 支撐），基礎內容擷取。
*   **L3 (考古題庫)**：經考古題庫比對驗證，嚴格控制選項格式與隨機性（需有實證驗證區）。
*   **L4 (中心思想)**：核心目標對齊，精修題幹與選項語意，具備極佳誘答力（需有 L4 轉化策略）。
*   **L5 (專家認證)**：經學科專家親自修撰或最終認證，為最高極致嚴密之品質（需人工 Meta 簽署）。

### 協作與工具標定
*   **AG**：指代 **Antigravity (PM)**，主要負責「分析課綱、產生知識、審查品質、下達 Git 提交 (Commit)」。
*   **Cursor**：指代 **開發 Agent (Dev)**，主要負責「讀取派工單、撰寫 `apps/` 內的程式碼、部署基礎設施 (`wrangler`)」。
*   **Manifest**：`/question` 目錄中，用於註冊該出版社「總共有哪些單元/課次」的 `manifest.json` 索引檔，前端依此繪製選單。

### Git 分支與版本守衛
*   **`main` 分支**：永遠只存放「通過所有評估腳本 (自動化測試 / L3+ 品質評分)」的高品質程式碼與題庫。
*   **`feature/*` 分支**：舉凡產出新題庫（如 `feature/g3_math_batch2`）或設計新系統畫面，都應切割特徵分支，開發完畢再 Merge 回主線。
*   **Pre-commit Hook**：任何涉及 `question/platform` 題庫 JSON 的提交動作，皆會強制觸發 `evaluate_question_quality.js --gate` 偵測。若遇格式破損或盲猜偏差 (BIAS)，Git 系統將自動拒絕寫入。

---

## 🗺️ 四、 實體目錄地圖 (Directory Map)

```text
eidosProject/
├── apps/                 # 系統前端原始碼 
│   ├── v3_eidos/         # 主力開發專案 (Vite + React)
│   └── v2_science/       # 舊版專案 (已歸檔)
│
├── jobs/                 # 任務與派工管理中心 (由 AG 控制)
│   ├── README_任務看板與派工.md   # 看板總覽
│   ├── JOB-011-xxx.md   # Cursor 開發派工單
│   └── JOB-011-Report.md # Cursor 完工報告
│
├── knowledge/            # 大腦與知識殿堂 (由 AG 維護)
│   ├── README_出題設計準則.md 
│   └── 課綱研究/          # 各年級課綱文本的分析結晶
│
├── question/             # 靜態資料庫 (純 JSON/CSV 源碼)
│   ├── README_題庫格式規範.md
│   ├── source/           # 原始 CSV 與爬蟲素材
│   └── platform/         # 餵給前端的正式標準 Json 檔
│
├── workers/              # 後端與邊緣腳本 (Cloudflare Workers, 若有)
│
└── .agent/               # Agent 的大腦認知區
    ├── workflows/        # 執行腳本 (例如 /webdev 用於約定開發紀律)
    └── brain/            # 思考過程的 Artifacts 落腳處
```

---

> **下一步**：如果你想知道現在要開發什麼，請前往 `jobs/README_任務看板與派工.md`。如果你不知道該怎麼跟這個專案互動，請呼叫 `/webdev` 工作流。
