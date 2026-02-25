# JOB-003: 前端 API 串接整合 (API Integration)

## 📌 任務目標
將 `apps/v3_eidos` 前端專案與 `workers/api` (JOB-001 已完成) 進行正式對接。從純 `localStorage` 存取模型轉向 「API 為主，Local 為輔」 的持久化架構。

## 📖 實作規格
### 1. 建立 API 配置
* **Endpoint**：在 `src/data/config.ts` 或新建立的 `src/data/api.ts` 中定義 API 伺服器位址（開發環境建議為 `http://localhost:8787`）。
* **跨域處理**：確保請求標頭包含後端要求的內容。

### 2. 改造 storage.ts
* **非同步化**：目前的 `loadUserProfile` 與 `saveUserProfile` 是同步的。需額外建立 `fetchUserProfile` 與 `syncUserProfile` 異步函式。
* **邏輯**：
  * 當使用者登入/進入時，優先從 API `/api/profiles/:userId` 拉取 `base_year` 與 `UX 參數`。
  * 設定變更時，除了寫入 `localStorage`，需同步 `PATCH` 或是 `PUT` 到 API。

### 3. 全站設定 (KV) 顯示
* **維護模式**：在 `App.tsx` 或進入點讀取 `/api/settings`。若 `maintenance_mode` 為 true，顯示全螢幕維護畫面。
* **公告顯示**：將 API 傳回的 `announcement` 顯示在首頁 (Index.tsx) 的明顯位置。

### 4. 題庫啟動控制
* **邏輯**：根據 API 返回的 `api_version` 或指定的單元列表控管題目顯示。

## 💬 指令範本 (請直接複製貼上給 Cursor)
> 「我們已經建置好了 Cloudflare Worker 後端 (JOB-001)，現在請你協助將 `apps/v3_eidos` 前端與其串接。
> 
> 需求如下：
> 1.  修改 `src/utils/storage.ts`，新增非同步 API 調用邏輯。
> 2.  當使用者修改個人設定（如：年級、出版社偏好、跳題延遲）時，除了存入 `localStorage`，也要 `PUT` 到我們的 API `/api/profiles/:userId`。
> 3.  在進入網站時，優先讀取 `/api/settings`。如果 `maintenance_mode` 是開啟的，請顯示一個美觀的維護中頁面；如果有 `announcement`，請在首頁顯示。
> 4.  請確保在 `npm run dev` 環境下能正確處理跨域。
> 
> 完成後請更新 `jobs/README.md` 並在 `COLLABORATION.md` 回報串接結果。」

## 📈 實作結果 (由 Cursor 填寫)
* [x] **API 配置** — `src/data/api.ts`：`getApiBaseUrl()`（`VITE_API_URL` 或 `http://localhost:8787`）、`fetchSiteSettings()`、`fetchUserProfile(userId)`、`syncUserProfile(userId, profile)`。
* [x] **storage 非同步** — `getOrCreateUserId()`、`fetchAndMergeUserProfile(userId)`（進入時拉取並合併至 localStorage）、`syncUserProfileToApi(userId)`（設定變更時 PUT）；`UserProfile` 新增 `shortcut_enabled`、`theme`；`isShortcutEnabled()`。
* [x] **全站設定** — 進入時 `fetchSiteSettings()`；`maintenance_mode === true` 時全螢幕維護頁；`announcement` 於首頁主選單上方顯示。
* [x] **個人設定同步** — `handleProfileSave` 寫入 localStorage 後呼叫 `syncUserProfileToApi(getOrCreateUserId())`；ProfileSetup 新增「使用 A–D 快捷鍵答題」選項並寫入 profile／API。
* [x] **JOB-001a 快捷鍵視覺** — QuizView 受 `shortcutEnabled` 控制；A–D 按下時對應選項短暫 `scale-[0.98]` + `ring-2 ring-primary/50`；`shortcut_enabled === false` 時不顯示「(或按 A–D)」。

---
*Created by Antigravity at 2026-02-23 10:45*  
*Last Updated: 2026-02-23 (Cursor 串接完成)*
