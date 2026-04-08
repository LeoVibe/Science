# Agent Bootstrap — 任務派工準則精華

`source`: docs/README_任務派工準則.md
`purpose`: SessionStart Hook 自動注入，Agent 無需主動 Read

---

## 派工類型 job_type（擇一）

| job_type | 邊界 | 準則正文 |
|:--|:--|:--|
| `research` | knowledge/ 課綱研究、KL3/KL4；不產題、不跑盲測 | knowledge/README_研究架構總綱.md |
| `question_prod` | 產出/修改題庫 JSON、CQI-P；不代替驗證 | question/README_出題與品管準則.md |
| `question_verify` | 盲測、CQI-V、Match Rate；不改題除非流程明定 | question/README_驗證與盲測準則.md |
| `engineering` | apps/、backend/、scripts/；不重寫題庫規格 | 依任務指定 |
| `docs_ops` | 規格書、進度表、/pj_sync；預設不動題庫 JSON | docs/README_通用作業準則.md |
| `mixed` | 跨兩類以上，分段標註子 job_type 與各段 DoD | — |

## 開案四步（不可跳步）

1. **草稿先行**：在對話中產出完整草稿（job_type、目標、邊界、DoD），使用者確認後才建單
2. **流水號稽核**：`node scripts/job_manager.js next`
3. **腳本建單**：`node scripts/job_manager.js create "名稱" AG|USER|DEV [job_type]`
4. **填入草稿**：將已核准內容寫入派工單

禁止：先建空殼事後填寫、手動建 JOB-NNN 檔案、草稿未確認就建單。

## 執行階段

- 讀取派工單，確認 job_type 已填
- 無使用者明確核准，不得進入實作
- 進度寫在派工單本體或 Report，禁止在根目錄建 task.md

## 結案四步

1. 產出 `jobs/JOB-XXX-Report.md`（依 `jobs/_JOB-REPORT-TEMPLATE.md`）
2. 執行 `node scripts/job_manager.js close JOB-XXX`
3. 執行 `/pj_sync`
4. **Discord 摘要**：結案後將 Report 重點送到使用者指定頻道

## Report 品質規則（來源：通用作業準則 §8）

| 禁止 | 正確做法 |
|:--|:--|
| 「已完成所有需求」 | 列出實際完成的步驟與產出 |
| 「歷史變更，已合併」 | 列出每個修改檔案的完整路徑 |
| 「測試通過（免除補測）」 | 說明驗證方式與結果 |
| Checklist 全勾無佐證 | 每項填入實際數值 |

## 幽靈 Report 防止

- 禁止無對應派工單就產出 Report
- 禁止自動化腳本自行分配 JOB 號
- Report 由執行者撰寫，PM 不代寫

## 溝通規則（來源：通用作業準則 §8）

- 不確定怎麼做：問，不猜
- 發現矛盾規範：回報，等裁定，不自行選版本
- 任何「我覺得」「應該」的判斷：先問再做
