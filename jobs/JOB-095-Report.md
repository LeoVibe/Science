# JOB-095 完工報告

- 根因：Vite 只打包 `public/`，G6 題庫僅在 `question/platform/G6`，正式站請求 manifest 404。
- 處置：rsync／納入 `public/question/platform/G6`；新增 `prebuild` 同步腳本。
- 驗證：本地 `npm run build` 後 `dist/.../G6/.../manifest.json` 存在。
