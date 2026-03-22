# JOB-096-DEV-G6-NanYi-Path-And-Library-Nav-UX

## 背景
- G6 自然／社會南一路徑為 `NanI`、`數學` 目錄誤為 `Mathematics`，與 `PUBLISHER_PLATFORM_PATH`（NanYi）、`SUBJECT_PLATFORM_PATH`（Math）不一致 → manifest 404。
- 南一社會缺 `manifest.json`；南一數學單檔題組缺 manifest。
- 後台 `library_config` 關閉題庫時，頁首科目仍可按 → 需反灰禁用。

## DoD
- [x] G6 靜態路徑與 loader 一致；南一自然／社會／數學 manifest 可載入。
- [x] 未開放題庫之科目 pill 反灰、`disabled`、附 title。
- [x] `npm run build` 通過。
