# Eidos 任務派工準則（派工生命週期）

`last_updated`: 2026-03-30 16:45  
`updated_by`: Cursor Agent  

**文件定位（第 3 層｜本專 Eidos）**：`jobs/` 派工生命週期（開案→執行→結案）、`job_type`、檔名／流水號、`job_manager.js`、**結案後 Discord 回報方法**；**單一權威**。  
通則（三段式 Checklist、Git、花費格式、語氣與 UI）→ **`docs/README_通用作業準則.md`**。

**與其他文件分工**：

| 主題 | 權威檔案 |
|:--|:--|
| 三段式 Checklist 鐵則、Git、花費格式、語氣與 UI 通則 | `docs/README_通用作業準則.md` |
| 派工／結案**欄位範本** | `jobs/_JOB-TEMPLATE.md`、`jobs/_JOB-REPORT-TEMPLATE.md` |
| 研究管線、KL3→KL4、CK／RC | `knowledge/README_研究架構總綱.md` |
| 出題／驗證 | `question/README_出題與品管準則.md`、`question/README_驗證與盲測準則.md` |

**觸發用 Skill**：`_agent/skills/pj_job/SKILL.md`（指令 **`/pj_job`**）。**不再使用** `_agent/skills/dojob`（已移除）。

---

## 一、指令與名稱統一

| 項目 | 現行 |
|:--|:--|
| **派工／開結案 Skill** | **`pj_job`** |
| **建議使用者指令** | **`/pj_job`**，或自然語「建立派工單」「結案 JOB-XXX」 |
| **已廢止** | Skill 名 **`dojob`**、指令 **`/dojob`**（舊文件提及者，視為 **`pj_job`／`/pj_job`**） |

---

## 二、派工類型 `job_type`（擇一）

派工單頂部必填：**`job_type`**：`___________`（須為下表左欄之一）。

| `job_type` | 邊界（本 JOB 只做這類事） | 規則正文（Single Source of Truth） |
|:--|:--|:--|
| **`research`** | `knowledge/` 課綱研究、KL3/KL4、盤點；**不產題庫 JSON、不跑盲測** | `knowledge/README_研究架構總綱.md` |
| **`question_prod`** | 產出／修改題庫 JSON、CQI-P、產題腳本；**不代替驗證結案** | `question/README_出題與品管準則.md` |
| **`question_verify`** | 盲測、CQI-V、Match Rate、驗證日誌；**不改題除非流程明定** | `question/README_驗證與盲測準則.md` |
| **`engineering`** | `apps/`、`backend/`、`scripts/` 程式與工具鏈；**不順便重寫題庫規格** | 依任務：`README.md`、`docs/技術設定/` 等 |
| **`docs_ops`** | 規格書、進度表、`/pj_sync` 類同步；**預設不動題庫 JSON** | `docs/README_通用作業準則.md` 與任務指名之 `docs/*.md` |
| **`mixed`** | 跨兩類以上 | **分段**標註子 `job_type` 與各段 DoD |

### 2.1 `job_type` 與領域 Skill（執行時）

| `job_type`（或 mixed 中之段） | 觸發之領域 Skill（正文仍以上表準則為準） |
|:--|:--|
| `research` | `ei_research` |
| `question_prod` | `ei_qst` |
| `question_verify` | `ei_verify` |
| `engineering`／`docs_ops` | 依任務；無單一 skill 時以派工單 DoD 為準 |

**填寫與督導 `job_type` 為 `pj_job` 於開案階段之責任**；領域 Skill **不重複定義**上表。

---

## 三、派工檔案、模板與流水號（`job_manager.js`）

### 3.1 JOB 命名格式（語意欄位）

```
JOB-{3位數}-{發起者}-{動詞}-{對象}-{範圍}.md
```

| 欄位 | 規則 | 範例 |
|:--|:--|:--|
| 編號 | 3 位數流水號 | `101`, `110` |
| 發起者 | `USER` / `AG` / `DEV` | `USER` |
| 動詞 | 補強/建置/修復/擴充/驗證/部署 | `補強` |
| 對象 | G幾+科目+出版社 | `G6S2國文翰林` |
| 範圍 | 任務邊界 | `QL1至QL4` |

**實體檔名（強制）**：新開立之正式派工單**僅得**由 `node scripts/job_manager.js create "…" USER|AG|DEV` 產生，檔名形態為：

`JOB-{NNN}-{USER|AG|DEV}-{標題}.md`

**禁止**手動新增 `JOB-NNN-派工單.md`、`JOB-NNN-結案報告.md` 等**不帶** `USER`／`AG`／`DEV` 之正式派工檔名。

### 3.2 模板
- 派工範本：`jobs/_JOB-TEMPLATE.md`
- 結案範本：`jobs/_JOB-REPORT-TEMPLATE.md`

### 3.3 進度真相來源（防呆）
- **唯一真相**：**本檔（任務派工準則）所述管線**＋**派工單本體**＋**`jobs/JOB-XXX-Report.md`**；舊有 `jobs/任務看板與派工.md` 已廢止，若檔案不存在不得視為阻擋條件。
- **先模後動**：生成任何派工單前，強制讀取模板
- **無模板不產出**

### 3.5 幽靈 Report 防止（禁止事項）

**定義**：「幽靈 Report」= 有 `JOB-NNN-Report.md` 但無對應正式派工單（條件 A：`JOB-NNN-USER|AG|DEV-*.md`）的 Report 檔案。

**禁止行為**（違者需刪除幽靈檔案）：
1. **禁止自動化腳本自行分配 JOB 號**：orchestrator、batch 腳本等自動化工具**不得**自行用 `getNextJobNumber()` 或任何非 `job_manager.js` 方式分配 JOB 號碼。
2. **禁止在無對應派工單的情況下產出 Report**：Report 的存在必須以正式派工單（條件 A）為前提。
3. **禁止手動建立 Report**：所有 Report 必須由**接單執行者**（Cursor / Gemini / Claude）在執行完任務後撰寫，不得由派工者（Claude Code）代寫。

**正確流程**：
```
Claude Code
  ↓ node scripts/job_manager.js create "..." AG  (建立正式派工單)
  ↓ 派工單填寫完整後交給 Cursor
Cursor
  ↓ 執行腳本（補題 / 盲測）
  ↓ 撰寫 jobs/JOB-NNN-Report.md
Claude Code
  ↓ 審視 Report 內容（驗收 Checklist）
  ↓ node scripts/job_manager.js close JOB-NNN
```

**稽核指令**：`node scripts/verify_jobs.js`（列出所有幽靈 Report）

### 3.4 單號正則、流水號聯集與腳本多重驗證（與 `job_manager.js` 雙向對齊）

以下正則為 **`scripts/job_manager.js`** 內常數之**文字化權威**；若修改腳本分類規則，**必須**同步更新本節。

| 條件 | 用途 | 正則（JavaScript 字面值） |
|:--|:--|:--|
| **A｜合規正式派工** | `create` 產出之檔名必須通過；**同一單號不得有兩份** | `/^JOB-(\\d{3})-(USER\\|AG\\|DEV)-.+\\.md$/` |
| **B｜計畫檔 PLAN** | 佔用流水號，與自然科／全年級計畫對齊 | `/^JOB-(\\d{3})-PLAN-.+\\.md$/` |
| **C｜結案 Report** | 結案防呆；建議新案優先 `JOB-NNN-Report.md`，長檔名 `JOB-NNN-…-Report… .md` 仍相容 | `/^JOB-(\\d{3})-Report.*\\.md$/i` **或** `/^JOB-(\\d{3})-.+-Report.*\\.md$/i` |
| **D｜舊式派工（待收斂）** | 曾見 `JOB-NNN-標題.md` 無 `USER/AG/DEV`；**新開立禁止**，漸進改寫 | （由腳本以「非 A/B/C 且符合 `JOB-(\\d+)-`」推斷，見程式註解） |
| **E｜已占用單號聯集** | 決定**下一號** = `max(聯集) + 1` | `/^JOB-(\\d+)-/` 擷取首段數字（不含 `JOB-AG-00…` 特例） |

**強制指令**：

1. **開單前**：`node scripts/job_manager.js next`（或 `audit`）— 列印 A～E 分類統計、目前最大已用單號、**建議下一號**；若條件 A 偵測到**同號多份合規派工**，**exit code 1**。  
2. **開單**：`node scripts/job_manager.js create "…" USER|AG|DEV` — 內含與 `next` 相同之稽核（同號衝突時中止）。  
3. **下一號驗算**：腳本於稽核結尾比對 `next === max(占用聯集)+1`（佔位聯集為空時下一號為 `001`）。

**結案檔名**：優先 `jobs/JOB-NNN-Report.md`；內文得自訂標題（`#`），無需與檔名逐字相同。

**舊檔**：`jobs/` 內既有不符合條件 A 之檔名，**不強制**於單次 MR 全數更名，但**不得再新增**同型態檔名；遇編修時漸進改為條件 A。

---

## 四、階段一：開案（Dispatch）

> **核心原則：草稿先行（Draft-First）**  
> 派工單在進入檔案系統之前，**必須已在對話中完成草稿並獲得使用者明確核准**。  
> 禁止「先建空殼、事後填寫」——此模式導致內容品質無從事先審查。

### §4.0 草稿對話（強制，腳本建單前）

PM（Claude Code）**於對話中**產出完整草稿，涵蓋以下欄位（缺一不可方可建單）：

| 欄位 | 說明 |
|:--|:--|
| **`job_type`** | 從第二章六類擇一，若 mixed 需標注子段 |
| **任務背景** | 為什麼要做，觸發條件 |
| **任務目標** | 完成後的可驗證狀態（禁用「提升品質」等抽象句） |
| **任務邊界** | 本次做什麼 / 不做什麼（明列排除項） |
| **執行步驟** | 具體步驟，可讓接手人立即執行 |
| **DoD（驗收基準）** | 帶數字或指令輸出的可勾選清單 |
| **執行模型 / API Key** | 確認使用哪個模型、哪把 Key |

使用者以 **「確認」「開始」「LGTM」** 等明確回應後，方可進入下一步。  
**禁止**在草稿未確認前執行腳本或建立任何 JOB 檔案。

### §4.1 流水號稽核（強制，草稿確認後）

執行：`node scripts/job_manager.js next`  
確認輸出之**建議下一號**與分類 A～E 無異常（同號多份合規派工時腳本 exit 1）。細則見 **第三章 §3.4**。

### §4.2 腳本建單（強制）

於專案根目錄執行：

```
node scripts/job_manager.js create "任務名稱" [USER|AG|DEV] [job_type]
```

`job_type` 為可選第四參數，指定後自動套用對應模板（未指定使用通用模板）：

| job_type | 模板 | 適用情境 |
|:--|:--|:--|
| `question_prod` | `_JOB-TEMPLATE-question_prod.md` | 出題 / CQI-P |
| `question_verify` | `_JOB-TEMPLATE-question_verify.md` | 盲測 / Match Rate |
| `research` | `_JOB-TEMPLATE-research.md` | KL3/KL4 課程研究 |
| 未指定 | `_JOB-TEMPLATE.md` | engineering / docs_ops / mixed |

範例：`node scripts/job_manager.js create "G3S2-社會-全版本盲測" AG question_verify`

**禁止**手動建立 `JOB-XXX` 檔名或竄改編號流水；`create` 前腳本會再次跑與 `next` 相同之稽核。

### §4.3 將草稿內容寫入派工單

開啟腳本產生之 `jobs/JOB-XXX-....md`，**將已核准之草稿欄位逐一填入**，而非重新起草。  
**必須包含**：任務背景、目標、執行步驟、`job_type`、DoD（可勾選 Expected Outcomes）。  
**缺 `job_type` 或缺可勾選之驗收清單者，視為不完整，不得進入執行階段。**

### §4.4 模型與 API 成本確認

- 涉及**大規模 LLM** 或高頻 API：**強制**閱讀並遵守 `_agent/API_RULES.md`。  
- 模型選擇：**必須**符合專案根目錄 `README.md`「專案最高運作原則」（免費 Key 優先、**執行前明確詢問使用者並獲得核准**、據實回報）；**禁止**擅自指定或推斷模型層級。

### §4.5 變更追溯

新增或修改之 Markdown／JSON 應具 `last_updated`／`updated_by`（格式見 `docs/README_通用作業準則.md` **第六章**）。

---

## 五、階段二：執行（Execution）

### §5.0 委派 Cursor 執行（多 Agent 機制）

**Claude Code 主動呼叫 Cursor CLI**，而非「告知使用者去開 Cursor」。以下為標準指令：

| 場景 | 指令 |
|:--|:--|
| **單一 JOB**（最常用） | `cursor agent --print --yolo --workspace . "請讀取並執行派工單：jobs/JOB-XXX-*.md" > scripts/orchestrator-logs/JOB-XXX-cursor-output.log 2>&1 &` |
| **批量任務**（跨科目/年級） | `node scripts/orchestrator.js` |
| **批量 dry-run**（先預覽） | `node scripts/orchestrator.js --dry-run` |
| **批量從指定任務繼續** | `node scripts/orchestrator.js --from G4-SocialStudies-HanLin` |

**選擇依據**：
- 單一 JOB → 直接 `cursor agent` 呼叫，傳入派工單路徑
- 跨科目/年級批量 → `scripts/orchestrator.js`（自動掃描、分配 JOB 號、記錄 state）

**Log 與監控**：
```bash
# 背景執行（推薦，避免 terminal 阻塞）
cursor agent --print --yolo --workspace . "..." \
  > scripts/orchestrator-logs/JOB-XXX-cursor-output.log 2>&1 &
echo "PID: $!"

# 監控進度
tail -f scripts/orchestrator-logs/JOB-XXX-cursor-output.log

# 確認 Report 是否產出
ls -la jobs/JOB-XXX-Report.md
```

**完成判定**：Cursor 執行完畢後**必須產出** `jobs/JOB-XXX-Report.md`，否則視為失敗。

---

1. **讀取派工單**  
   鎖定 `jobs/JOB-XXX-....md`，確認 **`job_type` 已填**，並依第二章表載入對應準則全文或指定章節。

2. **任務規模分級（輔助判斷）**  
   - **API-Heavy**：標題或內容含 `Eval`／`Generation`／`Scan`，或預期 API 呼叫明顯偏高 → **必讀** `_agent/API_RULES.md`。  
   - **Feature**：新頁面、新 API、共用核心、跨模組資料流，或標題含 `Feature`／`Refactor`／`Epic` → **建議**先讀專案根 `README.md` 校準架構。  
   - **Hotfix**：單點文案、單一函式 Bug、不影響架構 → 可略過通讀 `README.md`（仍須遵守派工 DoD）。

3. **施工進度與計畫檔（與根目錄規範對齊）**  
   - **預設**：進度與待辦寫在**派工單本體**、**`jobs/JOB-XXX-Report.md`**，或派工單**明文指定**之路徑（如 `docs/`、`jobs/` 下之計畫檔）。  
   - **禁止**：在 **repository 根目錄** 新增 **`task.md`**、**`task_*.md`**、**`implementation_plan.md`** 等作為本專案主進度表（與 `.cursor/rules/root-task-files.mdc` 一致；細節亦請遵循根目錄 `README.md` 若另有載明者）。

4. **動碼許可**  
   無使用者明確核准（LGTM／允准／開始執行）前，**不得**進入實作變更（與 `docs/README_通用作業準則.md` **第一章 §1.3** 一致）。

---

## 六、階段三：結案（Close）

1. 產出 **`jobs/JOB-XXX-Report.md`**（依 `jobs/_JOB-REPORT-TEMPLATE.md`），**`job_type`** 與開案派工單一致。  
2. 執行結案腳本：`node scripts/job_manager.js close JOB-XXX`。  
3. 重大變動：**更新** `docs/README_專案發展紀錄.md`（若適用）。  
4. **花費、時間與模型回報**：依 `docs/README_通用作業準則.md` **第五章**格式（含 §5.3 執行時間回報）；**禁止**虛構 Token／金額／時間。  
5. **全站文件同步**：執行 `/pj_sync`（舊名 `/dosync` 已廢棄，統一使用 `/pj_sync`）。
6. **Discord 結果同步（強制）**：任務**結案**（Report 已定稿）後，須將本次 **`jobs/JOB-XXX-Report.md` 重點摘要**送到使用者指定之 Discord 頻道。  
   - **概念**：結案＝報告已定稿；Discord＝把摘要送到使用者可收通知的頻道，與對話視窗分離。  
   - **Cursor／MCP**：啟用 **`user-discord-relay`** 時，以工具 **`send_message`** 送出；參數 **`channelId`**（頻道 ID）、**`message`**（摘要正文，≤2000 字）。呼叫前依 MCP 目錄讀取該工具 **schema**，勿臆測參數。  
   - **環境變數**：可設定 **`DISCORD_CHANNEL_ID`** 供 Agent／腳本讀取預設頻道（實際呼叫仍以 `channelId` 為準）。  
   - **無法呼叫 relay**（未啟用 MCP、缺頻道 ID 等）：於對話中產出**可一鍵複製貼上 Discord** 的摘要，並請使用者補齊頻道資訊後再送。

---

## 七、稽核與幽靈任務

- **派工流水號／下一號**：`node scripts/job_manager.js next`（見 **第三章 §3.4**）。  
- **Report 與派工對齊**：`node scripts/verify_jobs.js`。

---

## 八、快速指令對照

| 行為 | 指令或動作 |
|:--|:--|
| 新開派工 | 先 `node scripts/job_manager.js next`，再 `node scripts/job_manager.js create "名稱" USER\|AG\|DEV` |
| 進入執行 | **`/pj_job JOB-XXX`** 或「開始執行 JOB-XXX」並讀派工單 |
| 結案 | 完成 Report + `job_manager.js close`（若有）+ 更新發展紀錄 + 花費列 + **Discord（第六章 §6）** |
| 稽核 | `node scripts/verify_jobs.js` |
