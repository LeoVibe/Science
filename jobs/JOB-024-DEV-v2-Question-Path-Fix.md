*Created by Cursor at 2026-02-27 00:10*  
*Last Updated at 2026-02-27 00:20 (Cursor: 完成修復、資產同步與測試驗證)*

# JOB-024：v2 Currisite 題庫路徑相容修復（不改題庫檔案與規範）

## 任務背景

使用者回報 `v2_currisite/` 在明明有題庫的科目仍顯示「此科目的題庫正在建置中」，導致無法填答。  
需在不改動 `question/platform` 題庫資料與既有規範前提下，修復 v2 載入路徑相容。

## 任務詳情

1. 問題定位
   - 確認 v2 載入器目前使用路徑是否與正式站一致。
   - 驗證 `/Science/questions/platform/...` 與 `/Science/question/platform/...` 的實際可用性。

2. 最小改動修復
   - 調整 `apps/v2_currisite/src/data/index.js` 題庫基底路徑：
     - 主要讀取 `question/platform`
     - 保留 `questions/platform` 作為 fallback（兼容舊環境）
   - 不修改任何 `question/platform/**` 題庫 JSON。

3. 輸出與部署對齊
   - 重建 `apps/v2_currisite` 靜態資產並同步到歷史入口使用的 `history/v0.5/assets`。
   - 更新 `apps/v3_eidos/public/history/v2_currisite/index.html` 的 JS/CSS 檔名引用。

## 關鍵參考檔案

| 路徑 | 用途 |
|---|---|
| `apps/v2_currisite/src/data/index.js` | v2 題庫載入路徑與 manifest 讀取 |
| `apps/v2_currisite/vite.config.js` | v2 build base 設定 |
| `apps/v3_eidos/public/history/v2_currisite/index.html` | v2 歷史入口資產引用 |
| `apps/v3_eidos/public/history/v0.5/assets/*` | v2 實際部署資產 |
| `jobs/任務看板與派工.md` | 派工狀態同步 |

## 執行規範

- 協作流程依 `.agent/workflows/webdev.md`。
- 嚴禁改動 `question/platform/**` 題庫檔與格式規範。
- 以最小改動達成「有題庫即可填答」。

## 驗證基準 (DoD)

- [x] `v2_currisite` 中有題庫的組合可進入填答，不再顯示建置中。  
- [x] `question/platform/**` 無檔案變更。  
- [x] `npm run build`（v2）可通過，且歷史入口引用檔名正確。  
- [x] 至少驗證一組實際有題庫組合可載入題目（例如 G3 國語 S2 康軒）。  
- [x] 產出 `jobs/JOB-024-Report.md` 完工報告。  

