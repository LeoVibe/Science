# JOB-097：v1 / v2 歷史版相容靜態題庫（讀取路徑與 meta 對齊）

**最後更新**：2026-03-23 14:30  
**發起**：USER  
**執行**：Cursor (Dev)

## 背景

- `v1_science` 以 `import.meta.glob('/questions/platform/**/*.json')` 編譯期打包題庫，但專案內符號連結名稱錯誤，導致實際無法載入 `question/platform`。
- `v2_currisite` 以 fetch 讀取 `question/platform`，但 URL 路徑使用中文科目／出版社資料夾名，與現行 `question/platform` 的英文目錄（如 `Science`、`KangHsuan`）不一致；且 JSON `meta` 常為 `G3`/`Science`/`KangHsuan`，與載入器原先嚴格比對的 `grade_3`／`自然`／`kang_hsuan` 不一致，題目遭整批丟棄。

## 目標

1. 修復 v1 題庫來源連結，使建置時可正確讀取並打入 bundle。
2. 調整 v2 載入器：路徑對齊 `question/platform` 目錄規則；`meta` 驗證同時接受現行平台檔常見寫法。
3. 產出「相容靜態題庫」維運說明（`question/legacy_static/README.md`）與自動驗證腳本，確認讀取規則與檔案一致。
4. 重建 v1 / v2 並同步 `apps/v3_eidos/public/history/*` 資產。

## 驗證基準 (DoD)

- [x] `apps/v1_science/questions` 為指向 `../../question` 的有效符號連結，`npm run build`（v1）可完成且 bundle 含 platform JSON（日誌或體積可佐證）。
- [x] v2 `loadQuestions` 對 `G3/自然/S1/康軒` 可取得與 `manifest.json` 一致的題數（本機以 `question/platform` 或 history 快照路徑驗證）。
- [x] `node scripts/verify_legacy_question_bank.mjs` 以離線方式通過（manifest + 首個單元檔 meta 規則）。
- [x] `apps/v3_eidos/public/history/v1_science`、`v2_currisite` 靜態資產已更新。
- [x] 產出 `jobs/JOB-097-Report.md`，並更新 `jobs/任務看板與派工.md`。

## 涉及檔案（預估）

| 路徑 | 動作 |
|------|------|
| `apps/v1_science/questions` | 符號連結修正 |
| `apps/v2_currisite/src/data/config.js` | 新增 platform 目錄對照表 |
| `apps/v2_currisite/src/data/index.js` | 路徑與 meta 相容邏輯 |
| `question/legacy_static/README.md` | 新增維運說明 |
| `scripts/verify_legacy_question_bank.mjs` | 新增驗證腳本 |

## 限制

- 不新增第二套題庫 schema；單一真相來源仍為 `question/platform`。
- 「撰寫」指維護 JSON 檔與 manifest；答題紀錄仍為瀏覽器 LocalStorage，不在本單變更儲存後端。
