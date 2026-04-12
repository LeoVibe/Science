---
description: (已整合) 盲審驗證現已納入 ei_qst Skill 步驟七，請改用 /ei_qst 指令
---

# /blind-eval → 已整合至 /ei_qst

> **last_updated**: 2026-03-24 11:30
> **updated_by**: Antigravity (Gemini-2.5-Pro)

盲審驗證與誘答品質優化流程已整合進 `ei_qst` Skill 的步驟七。
若需獨立執行盲測，請使用 `/ei_verify`。

## 使用方式

請改用以下指令：

```
/ei_qst      ← 出題＋自動盲審一條龍
/ei_verify   ← 僅對已完成題庫執行盲測
```

📎 完整規範請參閱：
- `_agent/skills/ei_qst/SKILL.md`（出題）
- `_agent/skills/ei_verify/SKILL.md`（驗證）
