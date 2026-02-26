*Created by Cursor at 2026-02-27 00:21*  
*Last Updated at 2026-02-27 00:21 (Cursor: 完成 JOB-024 完工報告)*

# JOB-024 完工報告：v2 Currisite 題庫路徑相容修復

## 開發成果摘要

- 完成 `v2_currisite` 題庫載入路徑修復：由既有 `questions/platform` 改為優先讀取 `question/platform`。
- 保留 `questions/platform` fallback，確保舊本機環境仍可運作。
- 重建 v2 靜態資產並同步到 `apps/v3_eidos/public/history/v0.5/assets`。
- 更新 `v2_currisite` 歷史入口檔案引用新 JS 資產，避免入口仍載入舊邏輯。
- 全程未修改 `question/platform/**` 題庫檔案與規範。

## 變更檔案清單

| 檔案 | 變更類型 | 說明 |
|---|---|---|
| `apps/v2_currisite/src/data/index.js` | Update | 題庫載入改為 `question/platform` 優先 + `questions/platform` fallback |
| `apps/v3_eidos/public/history/v2_currisite/index.html` | Update | 更新 script 引用至新 build 資產 |
| `apps/v3_eidos/public/history/v0.5/assets/index-Clxn2igX.js` | Add | 新版 v2 JS bundle（包含路徑修復） |
| `jobs/JOB-024-v2-Currisite-Question-Path-Compatibility-Fix.md` | Add/Update | 新增派工單並完成 DoD |

## 單元測試與建置紀錄

- `apps/v2_currisite`
  - `npm run build` ✅ 通過
  - build 產物：`dist/assets/index-Clxn2igX.js`

- `apps/v3_eidos`
  - `npm run test` ✅ 通過（24 tests）
  - `npm run build` ✅ 通過

## 驗證紀錄

- 路徑可用性驗證（正式站）：
  - `https://leovibe.github.io/Science/questions/platform/G3/Chinese/S2/KangHsuan/manifest.json` → `404`
  - `https://leovibe.github.io/Science/question/platform/G3/Chinese/S2/KangHsuan/manifest.json` → `200`
- 證實根因為 v2 仍走 `questions/platform`；修復後已改優先讀取正確路徑。

## PM 驗收建議

1. 開啟 `https://leovibe.github.io/Science/history/v2_currisite/`。
2. 切到有題庫組合（例如 `3年級 / 國語 / 下學期 / 康軒`）。
3. 確認不再顯示「此科目的題庫正在建置中」。
4. 點擊「基本挑戰」並確認可進入答題流程。
5. 若使用者反饋仍看到舊畫面，請先清快取（Ctrl/Cmd+Shift+R）再驗證。

