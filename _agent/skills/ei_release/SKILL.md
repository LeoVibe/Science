---
name: ei_release
description: 上版前全站測試（Release Gate）— 觸發器，推送生產環境前執行
---

# ei_release

**觸發**：推送 Cloudflare Pages 前，或 `/ei_release`。

## Checklist

- [ ] `npm run test` 全數通過
- [ ] `npm run build` 成功產出 dist
- [ ] `generate_library_stats.js` 已執行、About 頁數據一致
- [ ] 選課→答題→結算流程正常
- [ ] 後台登入與 `/api/settings` API 正常
- [ ] Cloudflare Build 設定對齊（Branch, Build Command）
