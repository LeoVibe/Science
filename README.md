# Eidos 專案 — 國小生課後複習平台

`last_updated`: 2026-04-08 13:01:26
`updated_by`: Claude Code (claude-opus-4-6)

Eidos 是為國小學生設計的高互動性題庫演練系統，以108 課綱為核心、涵蓋一到六年級各科的各科題目
，並以三大出版社（康軒／翰林／南一）課文為基礎，設計考題，英文科因各校選擇較為分歧，僅部分試題。
若要了解更多介紹可參考 [`docs/README_產品介紹.md`](docs/README_產品介紹.md)。

---

## 一、Agent 資訊分層取用架構

本專案使用三階段機制確保 Agent 啟動時先取得必要規範與執行準則：

| 層級 | 內容 | 機制 | 保證程度 |
|:--|:--|:--|:--|
| **L0 硬注入** | 角色定義、關鍵規則、文件索引 |README.md CLAUDE.md / .cursorrules（工具保證載入） | 100% 在 context |
| **L1 軟注入** | 通用準則 + 派工準則精華摘要 | SessionStart Hook 自動讀檔注入 context | 100% 在 context |
| **L2 按需查閱** | 完整準則正文（出題、盲測、研究等） | Agent 執行特定任務時依下方索引 Read | 靠 L0/L1 引導 |

**設計原理**：L0 和 L1 不依賴 Agent 自覺——內容直接注入 context。L2 仰賴 Agent 在正確時機查閱，靠 L0 的索引表和 L1 的精華摘要引導。

各工具設定檔位置：

| AI 工具 | 設定檔（L0） | Hook 設定（L1） |
|:--|:--|:--|
| Claude Code | `CLAUDE.md` | `.claude/settings.json` → SessionStart |
| Cursor | `.cursorrules` + `.cursor/rules/*.mdc` | — |
| Antigravity | `GEMINI.md`（未來） | — |

---

## 二、新對話第一件事

**先讀規範，再做事。沒讀完不准動手。**

| 順序 | 文件 | 為什麼要讀 |
|:--:|:--|:--|
| 0 | **本檔 README.md** | 專案身份、運作原則、品管流水線、文件地圖 |
| 1 | `docs/README_通用作業準則.md` | 三段式 Checklist、角色分工、花費格式、任務邊界 |
| 2 | `docs/README_任務派工準則.md` | 派工生命週期、job_type、開結案管線、Discord 回報 |

依任務性質追加：

| 任務性質（job_type） | 追加讀取 |
|:--|:--|
| 課綱研究 `research` | `knowledge/README_研究架構總綱.md` |
| 出題 `question_prod` | `question/README_出題與品管準則.md` |
| 盲測 `question_verify` | `question/README_驗證與盲測準則.md` |
| 前端工程 `engineering` | `docs/技術設定/前端開發與AI實作守則.md` |
| 大規模 API 呼叫 | `_agent/API_RULES.md` |

---

## 三、運作原則

### 3.1 任務紀律

| 原則 | 具體要求 |
|:--|:--|
| 只做派工單內的事 | 範圍外問題記入 Report「遺留問題」欄，不自行處理 |
| 先草稿後建單 | 對話中完成完整草稿，使用者說「確認」後才用腳本建單 |
| 禁止修改規範文件 | 除非派工單明確指定 `job_type: docs_ops` 且目標含規範修改 |
| 無法完成就停止 | 明確說明「步驟 N 無法完成，原因是 ___」，禁止假裝完成或模糊帶過 |
| 無許可不動手 | 無使用者明確許可（LGTM / 允准），禁止進入執行階段 |

### 3.2 模型與成本

| 原則 | 具體要求 |
|:--|:--|
| 免費 Key 優先 | 預設 Google AI Studio 免費額度。需付費模型時，**執行前詢問使用者並取得核准**，禁止自行決定 |
| 模型透明 | 派工單與 Report 必填真實模型代碼（如 `gemini-3.1-flash`）。禁止填「AI」「LLM」等模糊稱呼 |
| 據實回報 | Token 數與花費從真實 Meta 讀取。無法取得填 `-`，**禁止推估或捏造** |
| 禁止擅自選模型 | 不得建議「某模型適合某情境」，除非引用官方文檔且僅作為選項供使用者決定 |


---

## 四、題庫品管流水線

Eidos 的每道題目經過四階段品管。各階段細節見對應準則檔：

| 階段 | 做什麼 | 關鍵指標 | 準則檔 |
|:--|:--|:--|:--|
| **KL1→KL4 研究** | 從兒童認知發展到單課素材深掘 | RM0→RM3 成熟度 | `knowledge/README_研究架構總綱.md` |
| **CQI-P 出題** | 依 KL4 素材產題、格式驗證、品質評分 | CQI-P ≥ 5.5 方可進入盲測 | `question/README_出題與品管準則.md` |
| **CQI-V 盲測** | 獨立模型盲審、Match Rate、誘答鑑別 | Match Rate ≥ 85% | `question/README_驗證與盲測準則.md` |
| **QL 上架** | CQI = CQI-P + CQI-V，標籤 QL1→QL5 | CQI ≥ 6.5 = QL4 可上架 | 同盲測準則 §4 |

---

## 五、規範文件索引

| 用途 | 文件 |
|:--|:--|
| 作業通則（Checklist、Git、花費、許可） | [`docs/README_通用作業準則.md`](docs/README_通用作業準則.md) |
| 派工與結案（job_type、開結案、Discord） | [`docs/README_任務派工準則.md`](docs/README_任務派工準則.md) |
| 研究架構 KL / RM | [`knowledge/README_研究架構總綱.md`](knowledge/README_研究架構總綱.md) |
| 出題 CQI-P、JSON Schema | [`question/README_出題與品管準則.md`](question/README_出題與品管準則.md) |
| 盲測 CQI-V、QL 標籤 | [`question/README_驗證與盲測準則.md`](question/README_驗證與盲測準則.md) |
| 題庫進度彙整 | [`docs/進度彙整_題庫研發與產出.md`](docs/進度彙整_題庫研發與產出.md) |
| 專案發展紀錄 | [`docs/README_專案發展紀錄.md`](docs/README_專案發展紀錄.md) |
| 前端 UI/UX 規格 | [`docs/網站功能規格書.md`](docs/網站功能規格書.md) |
| 前端開發守則 | [`docs/技術設定/前端開發與AI實作守則.md`](docs/技術設定/前端開發與AI實作守則.md) |
| 模型價格速查 | `../Model_Price.json`（上層 `0_AI_Project/`，未版控） |
| 產品介紹（家長/教師） | [`docs/README_產品介紹.md`](docs/README_產品介紹.md) |

---

## 六、技術環境

### 系統架構

| 層 | 技術 |
|:--|:--|
| 前端 | Vite + React + TailwindCSS (`apps/v3_eidos`) |
| 資料交付 | Cloudflare CDN，題庫預編譯為靜態 JSON |
| 後端 | Cloudflare Worker API (`backend/`) |

### 目錄結構

```
/eidosProject
├── apps/                  # 前端原始碼
├── backend/               # Cloudflare Worker
├── docs/                  # 規格、準則、日誌
├── jobs/                  # 派工單與 Report
├── knowledge/             # KL1-KL4 研究知識庫
├── question/              # 題庫（platform/ 上架 JSON、source/ 素材）
├── scripts/               # 自動化腳本
└── _agent/                # AI Agent 技能（skills/）
```

### Agent 技能索引

| 分類 | 技能 | 指令 | 用途 |
|:--|:--|:--|:--|
| 本站 | ei_research | `/ei_research` | 課程研究建置 |
| 本站 | ei_qst | `/ei_qst` | 題庫出題與品管 |
| 本站 | ei_verify | `/ei_verify` | 盲測驗證 |
| 本站 | ei_release | `/ei_release` | 上版前全站驗證 |
| 本站 | ei_web | — | 前端工程守則 |
| 通用 | pj_job | `/pj_job` | 派工生命週期 |
| 通用 | pj_sync | `/pj_sync` | 結案文檔同步 |
| 通用 | pj_audit | `/pj_audit` | 規格庫巡檢 |

### 術語速查

| 縮寫 | 全名 | 說明 |
|:--|:--|:--|
| G3 / G6 | Grade 3 / 6 | 年級 |
| S1 / S2 | Semester 1 / 2 | 上學期 / 下學期 |
| KL1-KL4 | Knowledge Layer | 研究素材層次（地基→藍圖→規劃→材料） |
| RM0-RM3 | Research Maturity | 研究成熟度（骨架→素材→考古→透析） |
| QL1-QL5 | Quality Label | 品質標籤（課綱基礎→專家認證） |
| CQI-P | Production Quality | 出題品質分（滿分 6.0） |
| CQI-V | Verification Quality | 驗證品質分（滿分 4.0） |
| CK-01~06 | Checklist Items | KL3 素材庫交付驗收條件 |

---

## 七、版控與 GitHub

| 項目 | 內容 |
|:--|:--|
| GitHub 組織 | [LeoVibe](https://github.com/LeoVibe) |
| canonical origin | `https://github.com/LeoVibe/Science.git` |
| 部署環境 | 見 [`docs/Cloudflare-Pages-與正式站環境變數.md`](docs/Cloudflare-Pages-與正式站環境變數.md) |
