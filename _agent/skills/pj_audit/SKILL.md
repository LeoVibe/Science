---
name: pj_audit
description: 規格庫巡檢（Audit Docs）— 比對程式碼與規格書，找出矛盾並更新
---

# pj_audit

**觸發**：定期維護、覺得文件與程式碼脫節，或 `/pj_audit`。
**合併說明**：原 `audit` Skill 已合併至此（JOB-160）。

## 執行步驟

1. 讀取 `docs/網站功能規格書.md` + 掃描 `src/` 核心 UI
2. 交叉比對：樣式/色碼、元件行為、API 欄位、Storage Key
3. 彙整矛盾清單，詢問使用者：以程式碼為準 or 以規格書為準
4. 獲指示後修改對應檔案
