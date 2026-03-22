# JOB-085：G6 下學期國語題庫路徑對齊（統計與載入一致）

*Created by Cursor at 2026-02-27*

## 任務背景

六年級下學期國語題庫檔案已存在，但目錄為 `question/platform/G6/Chinese/{KangHsuan,NanYi,HanLin}/`，缺少與其他年級一致的 **`S2`** 層級。  
`scripts/generate_library_stats.js` 只掃描 `…/科目/S1|S2/出版社/manifest.json`，因此 **`libraryStats.json` 未含 `G6_S2_國語`**；前台 `loadQuestions` 亦使用 `…/G6/Chinese/S2/…`，路徑不一致。

## 任務詳情

1. 將 `G6/Chinese/` 下三出版社移至 `G6/Chinese/S2/`。
2. 更新 `scripts/` 內硬編碼路徑。
3. 執行 `node scripts/generate_library_stats.js` 重新產生 `apps/v3_eidos/src/data/libraryStats.json`。

## 驗收 (DoD)

- [x] `libraryStats.json` 出現 `G6_S2_國語` 及三版 `publisherStats`。
- [x] `apps/v3_eidos` `npm run build` 通過；`questionLoader.test.ts` 通過。

## 關鍵檔案

| 路徑 | 說明 |
|------|------|
| `question/platform/G6/Chinese/S2/*` | 題庫目錄（對齊 `QuestionLoader`） |
| `scripts/generate_library_stats.js` | 統計掃描（無需改邏輯，路徑已符合） |
| `apps/v3_eidos/src/data/libraryStats.json` | 前台／後台題庫總覽數據來源 |
