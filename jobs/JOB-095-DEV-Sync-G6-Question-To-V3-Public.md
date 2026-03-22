# JOB-095-DEV-Sync-G6-Question-To-V3-Public

## 背景
`question/platform/G6` 僅在 repo 根目錄，未進 `apps/v3_eidos/public/`，Cloudflare Pages 建置後無六年級 manifest → 正式站 `/g6/...` 出現 404。

## 作法
- 同步 G6 至 `public/question/platform/G6` 並納入版控。
- `apps/v3_eidos` 增加 `prebuild` 執行 `scripts/sync_v3_public_g6_question.mjs`，避免再次漏部署。

## DoD
- [x] `dist/question/platform/G6/Chinese/S2/NanYi/manifest.json` 建置後存在。
- [x] `npm run build` 通過。
