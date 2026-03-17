*Created by Cursor at 2026-02-27 00:58*  
*Last Updated at 2026-02-27 00:56 (Cursor: 完成修復、建置與驗證)*

# JOB-027：GitHub Pages `/Science/admin` 深連結 404 修復

## 任務背景

正式站直接開啟 `https://leovibe.github.io/Science/admin` 或 `/Science/admin/login` 時，GitHub Pages 回傳伺服器 404，導致無法進入後台。  
此問題屬於 SPA 在靜態主機上的深連結回退機制缺失，非後台程式邏輯錯誤。

## 任務詳情

1. 新增 GitHub Pages fallback 頁
   - 建立 `apps/v3_eidos/public/404.html`。
   - 當使用者直打深連結時，將原始路徑轉為 query（如 `?__redirect=...`）導回 `/Science/` 入口。

2. 入口頁還原真實路徑
   - 在 `apps/v3_eidos/index.html` 加入啟動前腳本。
   - 若偵測 `__redirect`，以 `history.replaceState` 還原原始路徑，讓 React Router 正常接管。

3. 驗證 admin 深連結
   - 驗證 `/Science/admin`、`/Science/admin/login` 不再是 GitHub 404。
   - 保持既有首頁與歷史版本路徑行為不變。

## 關鍵參考檔案

| 路徑 | 用途 |
|---|---|
| `apps/v3_eidos/index.html` | SPA 啟動前路徑還原 |
| `apps/v3_eidos/public/404.html` | GitHub Pages 深連結 fallback |
| `apps/v3_eidos/src/App.tsx` | admin 路由定義（驗證用） |
| `.github/workflows/deploy.yml` | 部署流程 |

## 執行規範

- 協作流程依 `.agent/workflows/webdev.md`。
- 不調整後台權限邏輯與 API 驗證，僅修補靜態主機深連結路由。
- 保持 `/Science/` 子路徑部署策略與現有環境參數機制一致。

## 驗證基準 (DoD)

- [ ] `https://leovibe.github.io/Science/admin` 不再回 GitHub 404（待部署後線上驗證）。  
- [ ] `https://leovibe.github.io/Science/admin/login` 不再回 GitHub 404（待部署後線上驗證）。  
- [x] 首頁與既有路由（含歷史入口）不受影響。  
- [x] `npm run test`、`npm run build` 通過。  
- [x] 產出 `jobs/JOB-027-Report.md` 完工報告。  

