---
name: pj_job
description: 派工生命週期（開案→執行→結案）— 觸發器，正文在 docs/README_任務派工準則.md
---

# pj_job

**觸發**：`/pj_job`、建立/執行/結案派工、任務進度查詢。
**廢止**：`dojob`/`/dojob` 已合併於本 Skill。

## 唯一權威

`docs/README_任務派工準則.md` — 執行前必讀全文。
本 Skill 不重複該檔內容；增刪只改權威檔。

## 硬閘（開案順序，不可跳步）

- [ ] 已讀取任務派工準則當前版本
- [ ] 草稿已在對話中產出，使用者已明確核准
- [ ] `node scripts/job_manager.js next` 已執行
- [ ] `node scripts/job_manager.js create` 已執行（禁止手動建檔）
- [ ] 大規模 API 呼叫前已讀 `_agent/API_RULES.md`
