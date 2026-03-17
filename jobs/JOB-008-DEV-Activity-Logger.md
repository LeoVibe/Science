# Eidos 後台優化與使用者行為軌跡派工單

**最後修訂時間：** 2026-02-24
**目標：** 修正後台題庫狀態顯示（解決全部 0 單元問題）、建立後台分頁路由（URL對應）、優化後台 Tab 排序與命名，並針對「無登入機制的使用者軌跡 (User Activity Log)」進行雙端儲存機制研究與派工。

---

## 🔍 前期研究與架構設計結論

### 1. 關於 `libraryStats.json` 呈現全 0 單元的問題
您提到的「全部是空的，`libraryStats.json` 好像沒有作用」，是因為先前的解析器與統計產出腳本，並未完全掃描最新的目錄格式與 `manifest.json`。導致畫面上讀到的都是 `0單元0題 [L1]`。這需要透過 Cursor 執行全局腳本檢測，並重新編譯統計檔案，讓 JSON 與實際存在的題庫能一致。

### 2. 後台路由與 Tab 排序優化
目前的 `AdminDashboard.tsx` 是使用前端的 React State `[tab, setTab]` 來切換畫面，所以在 URL 永遠只有 `/admin`。
我們將改用 React Router 的 `<Route path="/admin/:tab">` 來接管，這樣您可以直接透過 `/admin/library` 或 `/admin/config` 進入特定頁籤。預設未帶參數時會導向最左側的 `/admin/library`。

### 3. 無帳號機制的「使用者登入與追蹤」架構 (User Tracking without Auth)
因為平台不強制註冊，我們將採用 **Device ID (裝置識別碼)** 策略：
- **識別方式**：當使用者初次造訪前端，自動由程式配發一組唯一的 UUID（例如 `device_a1b2c3`），並永久寫入瀏覽器的 `localStorage` 中。
- **紀錄行為**：我們只需要在關鍵節點（例如：進入學習畫面、載入某單元題庫等）自動寫入 Log。
- **資料結構 (Log Schema)**：
  ```json
  {
    "deviceId": "a1b2c3...",
    "timestamp": "2026-02-24T12:00:00Z",
    "action": "view_lesson",
    "details": { "grade": "G5", "subject": "Chinese", "publisher": "HanLin", "lesson": "L1" }
  }
  ```
- **儲存與同步**：
  1. **本機 (Local)**：存在 IndexedDB 或 `localStorage` 的陣列中。
  2. **雲端 (Cloudflare)**：未來/後續透過 Cloudflare Workers + KV (或 D1) 開發輕量的 API 接收這些行為軌跡。
  3. **後台呈現**：
     - **使用統計 (Insights)**：以 `deviceId` 分群，計算它們的「初次使用日、最後活動時間、總活躍天數」。
     - **行動管理 (Action Logs)**：直接將所有的行為軌跡以時間軸/清單由新到舊列出，呈現「某個裝置在何時讀了什麼內容」。

---

## 📋 派工與執行計畫 (Task Assignment)

以下是針對我們與 Cursor 之間的分工提案，分為兩大部分：

### 第 1 階段：由 AG (我) 立即執行的框架調整
- [ ] 修改 `App.tsx` 加入 `/admin/:tab` 子路由配置，支援網址列直達分頁功能。
- [ ] 調整 `AdminDashboard.tsx`：
  - 將 📚 題庫管理 移至最左側並設為進入點 (`/admin/library`)
  - 再來是 ⚙️ 全局參數 (`/admin/config`)
  - 將 👥 使用者數據 改名為 **「👥 使用統計」** (`/admin/insights`)
  - 將 🧪 題庫驗證 改名為 **「🧪 行動管理」** (`/admin/actions`)，並移除該頁面的舊測試版按鈕。
- [ ] 更新這個階段到 `task.md` 與 `walkthrough.md`。

---

### 第 2 階段：由 Cursor 執行的深度檢測與追蹤機制實作
*(請在接下來的對話將這些需求交接給 Cursor 處理，並可隨時參照 `/question-bank` workflow)*

**任務一：全局 JSON 題庫檢測與重新生成統計表**
- [ ] **全盤掃描**：撰寫或修改掃描腳本，巡補 `question/platform` 目錄下所有實際存在的 Markdown 或 JSON 檔案。
- [ ] **格式驗證**：確保所有的 JSON 結構皆符合 `question/題庫API與格式規範.md` 中的格式，特別是 `answer_index` 與選項數量的匹配。
- [ ] **重建 `libraryStats.json`**：讓腳本生成包含真實題目數與單元數量的 `/Apps/v3_eidos/src/data/libraryStats.json`，讓後台題庫管理介面不再顯示「0單元0題」。

**任務二：實作前端「活動軌跡 (Activity Logger)」儲存系統**
- [ ] **Device ID 生產**：在首次啟動網站或進到 `ProfileSetup` 時配發 UUID。
- [ ] **攔截與埋點**：在 `Index.tsx` 中（或者負責載入題目 JSON 的元件裡），埋設使用者的讀取記錄。
- [ ] **建立雙向儲存類別**：實作 `ActivityLogger.ts` 負責：
  - 格式化並儲存紀錄至 `localStorage`。
  - 保留 `syncToCloudflare()` 的 API 預留口（或直接串聯已建立的 Worker KV）。

**任務三：後台管理「使用統計」與「行動管理」視圖接水**
- [ ] 取代 `AdminUserInsights.tsx` (使用統計)：從軌跡資料中聚合出不重複的 Unique Device，算出初訪時間與活躍天數列表。
  - [ ] 替換 `AdminTestRunner.tsx` (行動管理)：顯示一覽無遺的操作紀錄陣列清單（哪一天、哪個裝置、看了哪科哪版哪冊）。

---

## 💬 提供給 Cursor 的指令 (Prompt)

請複製以下方框內容，直接丟給 Cursor：

```text
Cursor 你好，
我需要你接手完成 Eidos 後台優化與「使用者無帳號活動軌跡 (Activity Logger)」的開發任務。
AG 已經規劃好了詳細的執行步驟和架構設計，請你閱讀 `/jobs/JOB-008-Activity-Logger.md`。

閱讀完畢後，請依序幫我：
1. 更新解析腳本與 `libraryStats.json`，解決目前後台題庫清單「全 0 單元」的問題。
2. 針對「首次進入的使用者」配發 Device ID 並寫入 localStorage。
3. 在前端實際載入特定題庫供閱讀/測驗時埋點，記錄這個 Device 看了哪些內容。
4. 將「使用統計」與「行動管理」兩個後台分頁 (AdminUserInsights, AdminTestRunner) 套上實際依賴於 Device Log 的畫面清單。

請留意我們題庫的路徑已經有 `/question-bank` workflow 規範。準備好即可開始寫代碼！
```
