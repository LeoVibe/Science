---
name: ei_web
description: 前端工程守則（Web Engineering）— 觸發器，正文在 docs/技術設定/前端開發與AI實作守則.md
---

# ei_web

**觸發**：平台開發、UI 修改、路由建置、前端重構，或 `/ei_web`。

## 唯一權威

1. `docs/網站功能規格書.md` — 設計主題與功能邏輯
2. `docs/技術設定/前端開發與AI實作守則.md` — 技術規範

## 硬閘

- [ ] 禁止 TailwindCSS 類名、禁止硬編碼色碼（使用 `var(--*)` CSS 變數）
- [ ] 禁止絕對路徑（如 `/Users/...`）
- [ ] HTML 語意化（h1~h4, ul, section）
