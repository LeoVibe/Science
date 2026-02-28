# JOB-015-DEV-DEV-Google-OAuth-Backend30*
*Last Updated at 2026-02-25 17:31 (Antigravity 補充撰寫紀錄)*

## 任務背景

`JOB-014` 已定義並部分實作 Eidos 後台的「Google 帳號審核機制」，目前前端以 Google Email 白名單與簡易 Session 模擬登入。  
然而，**真正的身分驗證必須由 Google OAuth / ID Token 驗證來完成**，避免僅憑「輸入某個 Email 字串」就被當成管理者。

本任務的目標是：在 Cloudflare Workers / 後端層串接 Google OAuth，**確保只有 Google 已驗證為 `yotta0280@gmail.com` 或 `miaw.shih@gmail.com` 的使用者，才能登入 Eidos 後台**。

---

## 任務詳情

### A. 建立 Google OAuth 後端端點

- **路徑建議**：`workers/api/src/routes/admin_auth.ts` 或現有 Worker 中新增 `/api/admin/google-oauth/callback`。
- **需求**：
  1. 串接 Google Identity / OAuth 2.0（支援 Web 應用程式）。
  2. 收到前端傳來的 Google Credential（ID Token）或由 Google Redirect 帶回的 Code 後：
     - 向 Google 公開端點驗證 ID Token 真偽（或交換 Code 取得 ID Token）。
     - 解析出 Email、Email 驗證狀態（`email_verified`）與基本 Profile。
  3. 僅當：
     - `email_verified === true`，且
     - `email` 為 `yotta0280@gmail.com` 或 `miaw.shih@gmail.com`
     時，才視為通過後台最高權限驗證。

### B. 後端 Session / Token 簽發

- **需求**：
  1. 驗證通過後，由 Worker 簽發一個 **Eidos 後台專用 Session Token**，內容至少包含：
     - `sub`：Google 使用者 ID 或自家 user id
     - `email`：Google 回傳的 Email（小寫）
     - `role`：`owner`
     - `provider`：`google`
     - `exp`：過期時間
  2. Token 建議使用：
     - 簽名的 JWT，或
     - 隨機 Session ID + KV / D1 存放 Session 資料。
  3. 將此 Token 回傳給前端（可放在 JSON 回傳或 Set-Cookie，依專案現況選擇），前端再寫入 `sessionStorage` / Cookie。

### C. 與前端 JOB-014 的協作介面

- **前端（JOB-014）責任**：
  - 使用 Google JS SDK / Identity Service 觸發登入，取得 Credential / Code。
  - 將 Credential / Code POST 給本任務實作的 Worker 端點。
  - 若 Worker 回傳「驗證通過 + 後台 Session Token」，則建立前端 `admin_session`，並導向 `/admin`。
  - 若 Worker 回傳 4xx / 403，顯示「尚未通過 Eidos 後台審核」等錯誤。

- **後端（JOB-015）責任**：
  - 專責與 Google 溝通並驗證 Token 真偽。
  - 僅認可兩個 Email：
    - `yotta0280@gmail.com`
    - `miaw.shih@gmail.com`
  - 簽發 Eidos 後台專用 Session Token 並回傳給前端。

### D. 權限與擴充規劃

- 目前先將兩位最高權限帳號的 `role` 固定為 `owner`。
- 後續可在 D1 / KV 中維護更多角色：
  - `owner`：完整後台權限。
  - `editor`：僅能調整題庫設定，不可變更全局參數。
  - `viewer`：僅能觀看統計與品質分析。
- `JOB-015` 需預留擴充空間（如在 Token 中加入 `roles: string[]` 欄位），但本次實作僅需確保兩位 owner 的流程通暢。

---

## 關鍵參考檔案

| 類型 | 路徑 | 用途 |
|------|------|------|
| 總綱 | `README_專案總覽與架構總綱.md` | 角色分工、品質與安全性總體方向 |
| 任務看板 | `jobs/README_任務看板與派工.md` | JOB 命名規範與 Report 流程 |
| 前端登入 | `jobs/JOB-014-Admin-Auth-Google-Email.md` | 前端登入 UI 與 Email 白名單規格 |
| App 路由 | `apps/v3_eidos/src/App.tsx` | `/admin` 相關路由與保護邏輯 |
| Workers | `workers/` 下現有腳本 | 確認是否已有 API / Auth 共用 util |

---

## 執行規範

- 開發流程遵守 `.agent/workflows/webdev.md`：
  - 明確標註本任務編號 `JOB-015` 於相關 commit。
  - 僅修改與 Google OAuth / 後台 Auth 相關的 Workers / 設定檔與必要前端串接碼。
  - 完成後執行必要的 build / 部署前檢查。
- 若需調整 `JOB-014` 的前端介面或參數格式，需同步更新該 JOB 規格與 Report。

---

## 驗證基準 (DoD)

- [ ] 可使用實際 Google 帳號登入流程，並由 Worker 驗證 ID Token 真偽。
- [ ] 僅當 Google 回傳的 Email 為 `yotta0280@gmail.com` 或 `miaw.shih@gmail.com` 時，Worker 才簽發 Eidos 後台 Session Token。
- [ ] 非白名單帳號登入時，前端收到 Worker 的 4xx / 403 回應，並顯示適當錯誤訊息。
- [ ] Workers 端程式碼有適當的錯誤處理與日誌紀錄，避免洩漏敏感資訊（如完整 Token）。
- [ ] 更新 `JOB-015-Report.md`，說明實作方式、變更檔案清單與建議驗證步驟。***
