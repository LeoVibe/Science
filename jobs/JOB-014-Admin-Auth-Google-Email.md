# JOB-014: Eidos 後台登入與 Google 帳號審核機制

*Created by Cursor at 2026-02-24 15:00*
*Last Updated at 2026-02-25 17:31 (Antigravity 補充撰寫紀錄)*

## 任務背景

Eidos 後台目前僅有簡易的帳號密碼模擬登入，缺乏與實際管理者 Google 帳戶的關聯，也沒有清楚的審核／白名單機制。  
PM 期望：

- 後台品牌統一為 **Eidos**，不再顯示「ScienceQuest」字樣。
- 後台登入以 **Google 帳號 Email** 為主體，並有明確的「白名單／審核機制」，目前最高權限管理者固定為兩位：
  - `yotta0280@gmail.com`
  - `miaw.shih@gmail.com`

本任務先在前端實作「以 Google Email 為識別、搭配白名單的登入機制」，後續實際 OAuth 驗證交由 Cloudflare Workers 延伸。

---

## 任務詳情

### A. 後台品牌字樣統一為 Eidos

- **影響範圍**：`apps/v3_eidos` 內所有與「後台管理」相關的文字。
- **具體調整**：
  1. `AdminLogin.tsx`：
     - 將標題／副標從「後台管理系統 / ScienceQuest 管理員登入」改為 **「Eidos 後台管理 / Eidos 管理員登入」**。
  2. `AdminDashboard.tsx`：
     - 頂部標題使用「Eidos 後台管理」作為後台主品牌。
  3. 其餘殘留於 v3 前端中的 `ScienceQuest` 字樣，一律更新為以 **Eidos** 為主（如瀏覽器標題與關於本站 Modal）。

> 註：v2 與歷史文件中提到 ScienceQuest 可保留做歷史紀錄，僅現行 v3 UI 以 Eidos 為準。

### B. 後台登入機制：Google Email 白名單

- **檔案**：`apps/v3_eidos/src/pages/AdminLogin.tsx`
- **需求**：
  1. 介面改為以 **Google 帳號 Email** 為唯一輸入欄位（移除傳統帳號／密碼）。
  2. 內建一組最高權限白名單（Owner）：
     - `yotta0280@gmail.com`
     - `miaw.shih@gmail.com`
  3. 使用者輸入 Email 後：
     - 若欄位空白 → 顯示錯誤「請輸入 Google 帳號 Email」。
     - 若 Email 不在白名單中 → 顯示錯誤「此帳號尚未通過 Eidos 後台審核，請向管理者申請權限。」。
     - 若 Email 在白名單中 → 建立前端 Session，導向 `/admin`。
- **實作細節**：
  - 在 `AdminLogin.tsx` 頂部定義：
    ```ts
    const SUPER_ADMINS = ['yotta0280@gmail.com', 'miaw.shih@gmail.com'] as const;
    ```
  - 登入成功時於 `sessionStorage` 寫入：
    ```ts
    {
      email: <lowercased-email>,
      role: 'owner',
      provider: 'google'
    }
    ```
    並同時保留舊的 `admin_token`（例如 `btoa(email)`）以維持相容。
  - 頁面註記：「驗證機制：以 Google Email 白名單綁定 Eidos 後台權限（完整 OAuth 將由 Cloudflare Workers 實作）」。

### C. 後台路由的登入保護

- **檔案**：`apps/v3_eidos/src/pages/AdminDashboard.tsx`
- **需求**：
  - 若使用者尚未登入（`sessionStorage` 中沒有 `admin_session`），存取 `/admin` 或 `/admin/:tab` 時應自動導回 `/admin/login`。
- **實作方式**：
  - 在 `AdminDashboard` component 內使用 `useEffect` 檢查：
    ```ts
    useEffect(() => {
      const session = sessionStorage.getItem('admin_session');
      if (!session) navigate('/admin/login', { replace: true });
    }, [navigate]);
    ```
  - 保留登出邏輯清除 `admin_token` / `admin_session` 並導回登入頁。

### D. 未來擴充：真正的 Google OAuth 串接（規劃占位）

- 目前先以 **Email 白名單 + 前端 Session** 實作概念版登入。
- 後續可在 Cloudflare Workers 中：
  - 串接 Google Identity / OAuth 2.0，取得 ID Token。
  - 在 Worker 驗證 token 並簽發自家 Session Token（再回寫前端）。
  - 管理者白名單改存於 D1 / KV，由 PM 維護。

> 本任務僅完成前端白名單與登入體驗，實際 OAuth 部分建議另開 `JOB-0XX` 由後端／Workers 專責。

---

## 關鍵參考檔案

| 類型 | 路徑 | 用途 |
|------|------|------|
| 總綱 | `README_專案總覽與架構總綱.md` | 品牌命名（Eidos）、角色分工、workflow 參照 |
| 任務看板 | `jobs/README_任務看板與派工.md` | JOB 命名與 Report 規則 |
| 前端路由 | `apps/v3_eidos/src/App.tsx` | `/admin` 與 `/admin/login` 路由定義 |
| 後台登入 | `apps/v3_eidos/src/pages/AdminLogin.tsx` | 登入 UI 與 Google Email 白名單登入 |
| 後台主畫面 | `apps/v3_eidos/src/pages/AdminDashboard.tsx` | 後台 Tab 管理與登入保護 |

---

## 執行規範

- 開發流程依 `.agent/workflows/webdev.md`：
  - 先閱讀任務單與總綱。
  - 僅修改與本任務直接相關之檔案。
  - 完成後執行 `npm run build` 確認無錯誤。
  - 回報時需更新對應 `JOB-014-Report.md`，描述變更內容與驗證方式。

---

## 驗證基準 (DoD)

- [ ] 後台所有顯示品牌名稱的文案，均統一為「Eidos」（不再出現 ScienceQuest）。
- [ ] 在 `/admin/login` 只需輸入 Google Email 即可登入，不再要求傳統密碼。
- [ ] 僅 `yotta0280@gmail.com` 與 `miaw.shih@gmail.com` 能成功登入並進入 `/admin`。
- [ ] 未登入造訪 `/admin` / `/admin/:tab` 時，會自動被導向 `/admin/login`。
- [ ] 編譯（`npm run build`）無錯誤，TS / ESLint 均通過。***
