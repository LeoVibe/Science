---
description: (已整合) 盲審驗證現已納入 doqst Skill 步驟七，請改用 /doqst 指令
---

# /blind-eval → 已整合至 /doqst

> **last_updated**: 2026-03-21 23:05
> **updated_by**: Antigravity

盲審驗證與誘答品質優化流程已整合進 `doqst` Skill 的步驟七。

## 使用方式

請改用以下指令，盲審會自動在出題流程的尾端執行：

```
doqst 小六下 國語
```

若您只想對「已完成的題庫」單獨執行盲審（跳過出題階段），
請直接跟 Agent 說：

```
對小六下國語執行盲審驗證
```

Agent 會參照 `doqst/SKILL.md` 的步驟七獨立執行。

📎 完整規範請參閱 `_agent/skills/doqst/SKILL.md`
