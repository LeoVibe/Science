# JOB-016 完工報告：後台登入審核機制（動態白名單 + Owner 許可流程）

*完成時間：2026-02-26*
*依規格 `jobs/JOB-016-Admin-Login-Approval.md` 與 `.agent/workflows/webdev.md` 開發*

---

## 一、變更摘要

- **KV 儲存**：於 `SITE_SETTINGS` 新增 key `admin_users`，儲存 JSON 陣列（email、role、status、approved_at / requested_at）。首次讀取為空時自動寫入兩位 `owner` 種子資料。
- **Workers API**：
  - `POST /api/admin/auth/request`：接收 Google ID Token，以 Google tokeninfo 驗證後查詢 KV；已核准回傳 200 + session/token，待審核/新帳號回傳 202，已拒絕回傳 403。
  - `GET /api/admin/auth/users`：需 `Authorization: Bearer <id_token>`，驗證為 owner 後回傳完整帳號清單。
  - `PATCH /api/admin/auth/users/:email`：body `{ action: "approve"|"reject"|"remove" }`，僅 owner 可呼叫；不可對 owner 執行 remove/reject。
- **前端登入**：`AdminLogin.tsx` 移除 hardcode `SUPER_ADMINS`，Google 登入後將 ID Token 送 `adminAuthRequest()`，依 200/202/403 顯示進入後台、審核中、或拒絕訊息。
- **後台帳號管理**：新增 `AdminUserManager.tsx`，於 Dashboard 新增「🔐 帳號管理」Tab（僅 `role === 'owner'` 可見），提供待審核（許可/拒絕）、已核准（owner 標記且不可操作）、已拒絕（可重新許可）。

---

## 二、變更檔案清單

| 類型 | 路徑 | 說明 |
|------|------|------|
| 後端 | `workers/api/src/index.ts` | 新增 admin_users KV、tokeninfo 驗證、POST/GET/PATCH 三支 admin auth 路由 |
| 後端 | `workers/api/wrangler.toml` | 新增 `[vars] GOOGLE_CLIENT_ID`（部署時需填入） |
| 前端 | `apps/v3_eidos/src/data/api.ts` | 新增 `adminAuthRequest`、`fetchAdminUsers`、`patchAdminUser` 與型別 |
| 前端 | `apps/v3_eidos/src/pages/AdminLogin.tsx` | 移除 SUPER_ADMINS，改呼叫 API，處理 200/202/403 與 pending/rejected 畫面 |
| 前端 | `apps/v3_eidos/src/pages/AdminDashboard.tsx` | 依 session.role 顯示「帳號管理」Tab，掛載 `AdminUserManager` |
| 前端 | `apps/v3_eidos/src/components/admin/AdminUserManager.tsx` | **新增** 待審核/已核准/已拒絕三區與許可/拒絕/移除操作 |
| 測試 | `apps/v3_eidos/src/data/api.test.ts` | **新增** admin auth API 單元測試（mock fetch） |

---

## 三、驗證方式（供 AG 最終測試）

1. **環境**  
   - Worker：於 `wrangler.toml` 或 `.dev.vars` 設定 `GOOGLE_CLIENT_ID`（與前端 VITE_GOOGLE_CLIENT_ID 一致）。  
   - 前端：設定 `VITE_GOOGLE_CLIENT_ID`、`VITE_API_URL`（指向 Worker）。

2. **登入流程**  
   - 使用**已核准** Google 帳號（或種子 owner）登入 → 應進入 `/admin`。  
   - 使用**未在名單**的 Google 帳號登入 → 應顯示「申請已送出！請等待管理者審核。」（202）。  
   - 使用**已被拒絕**的帳號登入 → 應顯示「此帳號已被管理者拒絕存取。」（403）。

3. **帳號管理（Owner）**  
   - 以 owner 登入 → 應看到「🔐 帳號管理」Tab。  
   - 待審核區：可對 pending 帳號點「✅ 許可」或「❌ 拒絕」。  
   - 已核准區：owner 顯示標記且無移除按鈕；editor 可「移除」。  
   - 已拒絕區：可「重新許可」。  
   - 以 editor 登入 → 不應看到「帳號管理」Tab。

4. **API 權限**  
   - 未帶或無效 Bearer token 呼叫 `GET/PATCH /api/admin/auth/users` → 401。  
   - 以非 owner 之核准帳號呼叫 → 403。

5. **自我保護**  
   - 對 role 為 owner 的帳號執行「拒絕」或「移除」→ API 回傳 403，前端不應可操作。

---

## 四、單元測試紀錄

於 `apps/v3_eidos` 執行：

```bash
npm run test -- --run
```

**結果（2026-02-26）：**

```
 RUN  v3.2.4
 ✓ src/test/example.test.ts (1 test)
 ✓ src/data/config.test.ts (2 tests)
 ✓ src/utils/qualityEvaluator.test.ts (5 tests)
 ✓ src/data/questionLoader.test.ts (6 tests)
 ✓ src/data/api.test.ts (6 tests)

 Test Files  5 passed (5)
      Tests  20 passed (20)
```

- `api.test.ts` 涵蓋：`adminAuthRequest` 之 200（session+token）、202（pending）、403（error）；`fetchAdminUsers` 回傳陣列與非 ok 拋錯；`patchAdminUser` approve 後回傳更新列表。

---

## 五、編譯

```bash
cd apps/v3_eidos && npm run build
```

**結果：** ✓ built in 3.40s，無錯誤。

---

## 六、DoD 對照

- [x] `AdminLogin.tsx` 中不再存在 hardcode 的 `SUPER_ADMINS` 常量，白名單完全由 KV 動態控制。
- [x] 任何 Google 帳號登入後，若不在已核准名單中，會自動以 `pending` 狀態進入待審核區。
- [x] 前端登入頁能正確顯示三種狀態：已核准（進入後台）、待審核（友善等待畫面）、被拒絕（拒絕提示）。
- [x] 主帳號 (`owner`) 可在後台「帳號管理」分頁中，看到所有 `pending` 帳號並進行許可或拒絕操作。
- [x] Owner 帳號具備自我保護機制：不可對自己或其他 Owner 執行移除或拒絕動作。
- [x] Workers API 端點有適當的權限驗證，非 Owner 無法呼叫管理 API。
- [x] 編譯 (`npm run build`) 無錯誤。

---

以上交由 AG 進行最終測試。
