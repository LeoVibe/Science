*Created by AG at 2026-03-01 14:08*

# JOB-052-USER-English-Manifest-Robustness-and-Deployment-Verification

## 📌 任務背景
本任務旨在解決專案目前存在的技術債與潛在風險，包含：三下英文題庫的前端封閉性測試、核心邏輯的異常處理（防呆）機制驗證，以及針對部署環境（Cloudflare Pages）中日誌目錄機制的安全性檢查。

## 📖 任務詳情
1. **三下英文 Manifest 測試**：
    - 驗證 `G3/English/S2` 下三個出版社（康軒、翰林、南一）的 `manifest.json` 是否能被前端正確解析。
    - 確認科目色彩與圖標在英文視角下顯示正常。
2. **核心邏輯防呆驗證**：
    - 測試直接透過 URL 進入 `/3/Chinese/S2/HanLin/quiz` 等深層路徑時，系統是否能正確導向或補全狀態（Deep Link Guard）。
    - 模擬數據損毀或 API 失敗情境，確認 `ErrorBoundary` 是否能正確捕捉並顯示可恢復的 UI。
3. **Cloudflare 建置驗證**：
    - 確認 `.logs/` 隱藏目錄機制是否導致 CI 建置失敗（特別是權限或檔案遺失問題）。
    - 產出本地 Build 紀錄以供查驗。

## 📜 關鍵參考檔案
| 檔案路徑 | 用途說明 |
| --- | --- |
| `apps/v3_eidos/src/data/config.ts` | 英文科目路徑配置與出版社定義 |
| `apps/v3_eidos/src/data/questionLoader.ts` | 題庫加載與防呆補全邏輯 |
| `apps/v3_eidos/src/pages/Index.tsx` | 核心路由守衛與 Session 管理 |

## ✅ 驗證基準 (DoD)
- [ ] G3S2 英文三版 Manifest 全部載入成功，無 404 報錯。
- [ ] 修改網址進入 Quiz 頁面時，系統會正確引導回首選單或進入測驗。
- [ ] 主動觸發代碼 Runtime Error 時，ErrorBoundary 能正常顯示。
- [ ] `npm run build` 本地驗證通過，且日誌目錄未被排除在必要資源外。
- [ ] 產出完工報告 `JOB-052-Report.md`。
