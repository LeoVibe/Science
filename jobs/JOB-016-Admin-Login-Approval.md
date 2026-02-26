# JOB-016: 後台登入審核機制 — Google 帳號許可與管理

*Created by Antigravity at 2026-02-25 23:43*
*Last Updated at 2026-02-25 23:43*

## 任務背景

`JOB-014` 與 `JOB-015` 已完成 Eidos 後台的 Google OAuth 登入串接。目前白名單直接**寫死 (hardcode)** 於 `AdminLogin.tsx` 中的 `SUPER_ADMINS` 陣列，僅允許兩組固定 Email 登入後台。

然而，隨著協作人員的增加，PM 需要一套**動態的登入審核機制**：
- 任何人都可以透過 Google 帳號「申請」進入後台。
- 主帳號 (Owner) 可於後台介面中「**許可**」或「**拒絕**」這些申請。
- 被許可的帳號才能正式存取後台功能；未經審核的帳號只會看到「等待審核中」的提示。

---

## 任務詳情

### A. 帳號儲存機制 (KV / D1)

- **儲存位置**：使用既有的 Cloudflare KV namespace `SITE_SETTINGS`（已綁定於 `workers/api/wrangler.toml`）。
- **KV Key 設計**：
  - `admin_users`：儲存一份 JSON 陣列，記錄所有已知的後台帳號：
    ```json
    [
      { "email": "yotta0280@gmail.com", "role": "owner", "status": "approved", "approved_at": "2026-02-25T23:43:00Z" },
      { "email": "miaw.shih@gmail.com", "role": "owner", "status": "approved", "approved_at": "2026-02-25T23:43:00Z" },
      { "email": "new_user@gmail.com", "role": "editor", "status": "pending", "requested_at": "2026-02-26T10:00:00Z" }
    ]
    ```
  - `status` 值定義：`approved`（已許可）、`pending`（待審核）、`rejected`（拒絕）。
  - `role` 值定義：`owner`（最高權限，不可被降級或移除）、`editor`（經審核通過的管理者）。
- **初始化**：首次部署時，需自動將兩位主帳號以 `owner` + `approved` 寫入 KV，確保不因遷移而造成鎖死。

### B. Workers API 新增端點

於 `workers/api/src/index.ts` 新增以下路由：

| 方法 | 路徑 | 說明 | 權限 |
|:---|:---|:---|:---|
| `POST` | `/api/admin/auth/request` | 新帳號申請登入（Google OAuth 驗證後觸發） | 任何已驗證 Google 帳號 |
| `GET` | `/api/admin/auth/users` | 取得所有帳號清單（含 pending） | 僅限 `owner` |
| `PATCH` | `/api/admin/auth/users/:email` | 更新帳號狀態（approve / reject / remove） | 僅限 `owner` |

**`POST /api/admin/auth/request` 流程**：
1. 前端將 Google ID Token 傳到 Worker。
2. Worker 驗證 Token 真偽與 `email_verified`。
3. 查詢 KV `admin_users`：
   - 若該 email 已存在且 `status === 'approved'` → 回傳 `200` + 簽發 session。
   - 若該 email 已存在且 `status === 'pending'` → 回傳 `202`（告知前端「審核中」）。
   - 若該 email 已存在且 `status === 'rejected'` → 回傳 `403`。
   - 若該 email 不存在 → 新增一筆 `pending` 記錄，回傳 `202`。

**`PATCH /api/admin/auth/users/:email` 流程**：
1. 驗證呼叫者為 `owner`。
2. 接收 body `{ "action": "approve" | "reject" | "remove" }`。
3. 更新 KV 中對應帳號的 `status`。
4. 不可對 `owner` 角色的帳號執行 `remove` 或 `reject`（自我保護）。

### C. 前端登入流程改造

- **檔案**：`apps/v3_eidos/src/pages/AdminLogin.tsx`
- **改動**：
  1. 移除 `SUPER_ADMINS` hardcode 常量。
  2. Google OAuth 完成後，將 ID Token `POST` 至 `/api/admin/auth/request`。
  3. 根據 Worker 回應：
     - `200` (approved) → 建立 session, 導向 `/admin`。
     - `202` (pending) → 顯示友善畫面：「✅ 申請已送出！請等待管理者審核。」
     - `403` (rejected) → 顯示錯誤：「此帳號已被管理者拒絕存取。」

### D. 後台新增「帳號管理」Tab

- **檔案**：新增 `apps/v3_eidos/src/components/admin/AdminUserManager.tsx`
- **掛載點**：在 `AdminDashboard.tsx` 的 Tab 系統中新增一個「👥 帳號管理」分頁，**僅限 `owner` 角色可見**。
- **介面需求**：
  1. **待審核區 (Pending)**：卡片式列出所有 `status === 'pending'` 的 Gmail 帳號，每張卡片附帶「✅ 許可」與「❌ 拒絕」按鈕。
  2. **已核准區 (Approved)**：列出所有已通過審核的帳號與角色。Owner 帳號以特殊標記顯示且不可操作。
  3. **已拒絕區 (Rejected)**：列出被拒絕的帳號，可重新切換為「許可」。

---

## 關鍵參考檔案

| 類型 | 路徑 | 用途 |
|:---|:---|:---|
| 前置任務 | `jobs/JOB-014-Admin-Auth-Google-Email.md` | 前端白名單登入規格（將被本任務取代） |
| 前置任務 | `jobs/JOB-015-Google-OAuth-Backend.md` | Google OAuth 後端設計 |
| 前端登入 | `apps/v3_eidos/src/pages/AdminLogin.tsx` | 目前的 Google OAuth 登入頁 |
| 後台主畫面 | `apps/v3_eidos/src/pages/AdminDashboard.tsx` | Tab 系統掛載點 |
| Workers API | `workers/api/src/index.ts` | 現有 KV 操作範例 (`SITE_SETTINGS`) |
| Workers 設定 | `workers/api/wrangler.toml` | KV namespace 綁定 |
| 任務看板 | `jobs/README_任務看板與派工.md` | 派工規範與 Report 規則 |

---

## 執行規範

- 開發流程依 `.agent/workflows/webdev.md`。
- 僅修改與本任務直接相關之檔案。
- 完成後執行 `npm run build` 確認無錯誤。
- 回報時更新 `jobs/JOB-016-Report.md`，描述變更內容與驗證方式。

---

## 驗證基準 (DoD)

- [ ] `AdminLogin.tsx` 中不再存在 hardcode 的 `SUPER_ADMINS` 常量，白名單完全由 KV 動態控制。
- [ ] 任何 Google 帳號登入後，若不在已核准名單中，會自動以 `pending` 狀態進入待審核區。
- [ ] 前端登入頁能正確顯示三種狀態：已核准（進入後台）、待審核（友善等待畫面）、被拒絕（拒絕提示）。
- [ ] 主帳號 (`owner`) 可在後台「帳號管理」分頁中，看到所有 `pending` 帳號並進行許可或拒絕操作。
- [ ] Owner 帳號具備自我保護機制：不可對自己或其他 Owner 執行移除或拒絕動作。
- [ ] Workers API 端點有適當的權限驗證，非 Owner 無法呼叫管理 API。
- [ ] 編譯 (`npm run build`) 無錯誤。
