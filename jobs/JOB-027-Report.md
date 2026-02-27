*Created by AG at 2026-02-27 14:40*

# JOB-027: GitHub Pages `/Science/admin` 深連結 404 修復 - 完工報告

## 開發成果摘要
成功修復 SPA 在 GitHub Pages 子目錄環境（/Science/）中的深連結存取問題。現在直接造訪 `/admin` 或子路由不再回傳 404。

## 變更核心邏輯
1. **GitHub 404 Fallback**：更新 `public/404.html`，具備動態偵測 `/Science/` 基底路徑的能力，並將原始請求轉為 query param。
2. **SPA 路徑還原**：更新 `index.html` 的啟動腳本，偵測到 `__redirect` 時自動使用 `history.replaceState` 還原路由，讓 React Router 順利接管。

## 驗證紀錄
- **本地模擬**：手動造訪包含 `?__redirect=` 的路徑，確認能正確還原。
- **建置驗證**：`npm run build` 確認 `404.html` 正確輸出至 `dist/`。

## PM 驗收建議
若後續部署至 GitHub Pages，請測試由書籤或網址列直接進入 `.../Science/admin/login`，應能正常顯示登入頁而非 GitHub 404。
