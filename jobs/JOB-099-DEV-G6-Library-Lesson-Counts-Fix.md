# JOB-099：六下題庫導覽與分課題數修正

**最後更新**：2026-03-23 08:35  
**發起**：USER（bug 回報）

## 問題

1. 分課卡片顯示「0 題」：manifest 未填 `count` 且選單頁僅做 manifest-only 載入，未帶入實際題數。
2. 六下英語無題庫仍可按科目：僅依 `library_config`，無設定時全開；且 stats 未標示 G6 下英語未上架。
3. G6 自然南一實體路徑為 `NanI`，與 `NanYi` 不一致，易造成 manifest 404。

## DoD

- [x] 科目啟用 = 後台設定通過 **且** `libraryStats.publisherStats` 該組合非明確 0 單元。
- [x] G6 S2 英語三社標記 `units: 0`；自然南一 stats 鍵改為 `G6_S2_自然_南一`。
- [x] `question/platform/G6/Science/S2/NanI` 更名為 `NanYi` 並同步 public。
- [x] 分課題數由載入後題目彙總補齊（無 `count` 時）。
- [x] 目前科若不可用則自動切到第一個可用科並提示。

## 涉及檔案

`apps/v3_eidos/src/utils/libraryAvailability.ts`、`Index.tsx`、`questionLoader.ts`、`libraryStats.json`、`question/platform/G6/Science/S2/`（目錄更名）
