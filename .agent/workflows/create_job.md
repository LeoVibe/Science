---
description: 建立標準派工單流程 (PM Dispatch Protocol)
---

# 建立新派工單 SOP

為了確保專案紀律，**嚴禁任何 AI Agent (包含 AG 或 Cursor) 手動建立派工單 Markdown 或手動更改任務看板狀態**！
每當使用者提出新需求或發現新 Issue 時，必須執行以下唯一合法步驟：

1. **強制呼叫防呆腳本**：透過終端機執行 \`node scripts/job_manager.js create "自訂任務標題" USER\` (或 AG/DEV)。
2. **遵守系統配號**：腳本會自動分配最安全的 JOB-XXX 編號並建立好標準檔。絕對不允許手動建立檔名。
3. **完成內文撰寫**：前往腳本所產生的 \`jobs/JOB-XXX-...\` 文件，將與使用者確認的規格、DoD 與驗證基準填寫進去。
4. **結案強制審查**：當任務完成時，一樣嚴禁手動改看板！必須執行 \`node scripts/job_manager.js close JOB-XXX\`。若被腳本發現你沒寫 \`Report.md\`，將會被物理防護網擋下。

// turbo
**強制指令**：若你需要快速查詢現有看板狀態是否有幽靈任務，請執行 \`node scripts/verify_jobs.js\`。
