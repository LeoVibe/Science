*Created by Cursor at 2026-02-26 23:55*  
*Last Updated at 2026-02-26 23:55 (Cursor: 補寫派工單，對齊 dojob 規範與已完成交付)*

# JOB-023：Science 子路徑一致化與歷史版本路由修復

## 任務背景

GitHub Pages 佈署於 `/Science/` 子路徑時，站內硬編碼絕對路徑造成主站與歷史版本入口 (`v1_science` / `v2_currisite`) 發生 404 或資源載入失效。  
本任務目標是以「最小改動」完成子路徑相容，確保本機 `/` 與雲端 `/Science/` 一致運作。

## 任務詳情

1. 路徑策略一致化
   - 新增 `withBase(path)` helper，統一以前端 `import.meta.env.BASE_URL` 產生站內路徑。
   - About 歷史連結、題庫載入路徑與後台品質分析題庫路徑全面改為 base-safe。

2. 歷史版入口修復
   - `public/history/v1_science/index.html` 與 `public/history/v2_currisite/index.html` 的 JS/CSS 改為相對路徑（`../v0.x/assets/...`）。
   - `public/history/v0.1/index.html`、`public/history/v0.5/index.html` 的相容橋接改為可辨識 `/Science/` 的 base-safe 跳轉。

3. 回歸測試與文件固化
   - 新增 `history-subpath.spec.ts`，覆蓋歷史入口非 404 與 About `target="_blank"` 歷史連結。
   - 補充規格文件中的 GitHub Pages 子路徑驗收 SOP。

## 關鍵參考檔案

| 路徑 | 用途 |
|---|---|
| `apps/v3_eidos/src/utils/basePath.ts` | 子路徑路徑組裝 helper |
| `apps/v3_eidos/src/components/AboutView.tsx` | 前台更版資訊歷史連結 |
| `apps/v3_eidos/src/components/AboutModal.tsx` | About Modal 歷史連結 |
| `apps/v3_eidos/src/data/questionLoader.ts` | 題庫 manifest / 題目檔載入路徑 |
| `apps/v3_eidos/src/components/admin/AdminQualityAnalyzer.tsx` | 後台題庫品質分析路徑 |
| `apps/v3_eidos/public/history/v1_science/index.html` | v1 歷史入口 |
| `apps/v3_eidos/public/history/v2_currisite/index.html` | v2 歷史入口 |
| `apps/v3_eidos/public/history/v0.1/index.html` | v0.1 相容橋接入口 |
| `apps/v3_eidos/public/history/v0.5/index.html` | v0.5 相容橋接入口 |
| `apps/v3_eidos/tests/history-subpath.spec.ts` | 子路徑回歸測試 |
| `docs/網站功能規格書.md` | 子路徑部署 SOP 與規格說明 |

## 執行規範

- 協作流程依 `.agent/workflows/webdev.md`。
- 不修改題庫資料結構（`question/platform`），僅調整路徑解析層與入口頁。
- 以最小改動優先，不重建 v1/v2 歷史介面邏輯。

## 風險與回滾策略

- 風險
  - 子路徑與根路徑行為不一致可能導致歷史頁局部可用、手動連結仍錯路徑。
  - 入口頁若仍保留絕對路徑，部署快取期間使用者可能間歇性 404。

- 回滾策略
  - 入口頁修補採獨立檔案變更，可快速回退至前一版。
  - 以 `history-subpath.spec.ts` 作為回歸守門，避免再次上線錯路徑。

## 驗證基準 (DoD)

- [x] 主站於 `/Science/` 正常進站且不出現 App 404。  
- [x] `/Science/history/v1_science/`、`/Science/history/v2_currisite/` 可載入。  
- [x] `/Science/history/v0.1/`、`/Science/history/v0.5/` 相容頁手動連結與自動跳轉為 base-safe。  
- [x] 題庫 manifest 載入路徑於子路徑部署不再 404。  
- [x] `npm run test`、`npm run build` 與 `tests/history-subpath.spec.ts` 通過。  
- [x] 規格書補齊 GitHub Pages 子路徑驗收 SOP。  

