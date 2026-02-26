# JOB-017B 上線診斷報告 (Opus 4.6)

*Created by AG at 2026-02-26 17:44*
*Last Updated at 2026-02-26 17:44 (獨立盲測完成)*

> 本報告為 JOB-017A (Gemini 3.1 Pro) 之**獨立平行診斷**，以不同的切入角度重新審閱同一批原始碼。除了重新確認 JOB-017A 已發現的問題外，本報告重點列出**新增發現**與**更深層次的建議**。

---

## 1. 問題清單 (Issue Log)

### 1.1 劇本 A：迷航的三年級學生

- **[A-1] 答題中斷狀態未持久化 (F5 後進度遺失)**
  - **分類**：💻 系統架構面 (System)
  - **嚴重性**：🟧 High (高)
  - **描述**：`storage.ts` 已定義 `saveQuizProgress`、`loadQuizProgress`、`clearQuizProgress` 完整的 CRUD API，但 `QuizView.tsx` 內部完全沒有呼叫 `saveQuizProgress`（僅在 `handleQuizFinish` 結束時會呼叫 `clearQuizProgress`），且 `Index.tsx` 開始測驗時不會嘗試恢復進度。這屬於**已完成設計但未連線**的遺漏。
  - **專家解答**：
    1. 在 `QuizView` 中新增 `useEffect`，於 `currentIndex` / `answered` 變動時呼叫 `saveQuizProgress`。
    2. 在 `Index.tsx` 的 `handleStartQuiz` 內，先呼叫 `loadQuizProgress`，若有未完成進度則彈出 Dialog（「您有未完成的測驗，是否從第 N 題繼續？」），將恢復的值傳入 `QuizView` 的 `initialIndex` / `initialScore` / `initialAnswered` props。

- **[A-2] 🆕 冷啟動預設科目硬編碼、未與 Profile 同步**
  - **分類**：👦 操作體驗面 (UX)
  - **嚴重性**：🟩 Low (低)
  - **描述**：`Index.tsx` L63-66 的 `useState` 初始值硬編碼為 `grade=3, semester=1, subject='國語', publisher='南一'`。雖然在 L93-134 的 `useEffect` 內會從 profile 覆寫，但在那個 effect 尚未執行到的第一次 render，使用者會短暫看到「3年級 國語 上學期 南一版」的 flash（若實際 profile 是 5年級數學）。
  - **專家解答**：建議將 `useState` 初始值改為 lazy initializer 形式 `useState(() => loadUserProfile()?.grade ?? 3)`，減少首幀閃爍。

- **[A-3] 🆕 雙重維護模式判斷存在不同步風險**
  - **分類**：💻 系統架構面 (System)
  - **嚴重性**：🟨 Medium (中)
  - **描述**：`App.tsx` 的 `MaintenanceGuard` 從 `localStorage.getItem('SITE_STATUS')` 判斷是否為維護模式，而 `Index.tsx` L137-146 則從 API `fetchSiteSettings()` 取得 `maintenance_mode`。這兩套判斷可能不同步：若後端 API 已解除維護模式，但 `localStorage` 仍殘留 `'Maintenance'` 值，使用者將被永久重定向到 `/maintenance` 頁且無法自行恢復。
  - **專家解答**：統一維護模式的來源——建議移除 `App.tsx` 的 `MaintenanceGuard`，完全依賴 `Index.tsx` 內 API 回傳的 `maintenance_mode`；或在 `MaintenanceGuard` 內也呼叫 API 並以 API 結果為最終判斷依據。

- **[A-4] 🆕 `fetchAndMergeUserProfile` 每次切科目都觸發 API 請求**
  - **分類**：🛠️ 前端技術面 (Tech)
  - **嚴重性**：🟨 Medium (中)
  - **描述**：`Index.tsx` L148-159 中 `fetchAndMergeUserProfile` 的 `useEffect` 依賴 `[settingsLoaded, subject]`。這意味著每次使用者切換科目（國語→數學→自然），都會對後端 `/api/profiles/` 發出 `GET` 請求。在快速連續切換時可能發出 3~5 次無意義的 API 呼叫，且回傳結果會覆蓋 `grade`/`semester`/`publisher` state，造成短暫的 UI 跳動。
  - **專家解答**：將 `subject` 從依賴陣列中移除，改為只在 mount 時執行一次；或加入 debounce / `useRef` 標記防止重複請求。

### 1.2 劇本 B：嚴格的題庫品管員

- **[B-1] 路由深連結 (Deep Linking) 狀態還原不完整**
  - **分類**：💻 系統架構面 (System)
  - **嚴重性**：🟧 High (高)
  - **描述**：直接以 URL 進入 `/g3/mat/s2/nani/wrong`，`view` 會被設為 `wrong-questions`，但 `WrongQuestionsView` 接收的 props 是 React state 中的 `sessionWrongQuestions`（預設 `[]`），導致永遠顯示「🎉 沒有錯題！」。同理，直接存取 `/quiz` 路徑時 `quizQuestions` 為空，`QuizView` 的 `current` 為 `undefined` 而返回 `null`（白畫面）。
  - **專家解答**：需區分「有上下文的 view」和「可獨立進入的 view」。`quiz`、`result`、`wrong-questions` 都屬於「必須有前置操作才能進入」的頁面，deep link 直接進入時應 fallback 到 `menu` 並顯示 toast 提示；或從 `localStorage` 的累積錯題恢復 `wrong-questions` 的內容。

- **[B-2] 🆕 `handleStartQuiz` 內部的 React 反模式**
  - **分類**：🛠️ 前端技術面 (Tech)
  - **嚴重性**：🟨 Medium (中)
  - **描述**：`Index.tsx` L290-301 在 `setLoaded(prev => { ... setQuizQuestions(...); setView('quiz'); return prev; })` 中，將其他 state 更新嵌套在 `setLoaded` 的 updater function 內。此做法依賴 React 的 batching 行為：在 React 18+ Concurrent Mode 下通常是安全的，但在 React Strict Mode 開發環境中 updater function 會被呼叫兩次，導致 quiz 題目被 shuffle 兩次，且 `logActivity` 被重複呼叫。
  - **專家解答**：重構為先 `await ensureQuestionsLoaded()` 取得結果，再順序呼叫各 setter，不要在 `setLoaded` updater 內做副作用操作。

- **[B-3] 缺乏全域 React Error Boundary**
  - **分類**：🛠️ 前端技術面 (Tech)
  - **嚴重性**：🟨 Medium (中)
  - **描述**：整個應用程式缺少 React Error Boundary。若任何元件（特別是 `QuizView` 或 `LearningReportView`）在渲染時因資料異常觸發 JS Exception，整個頁面將白屏且使用者無任何錯誤提示。
  - **專家解答**：在 `App.tsx` 外層包裹 `<ErrorBoundary>`，fallback 可顯示友善的「系統出了一點小狀況，請重新整理頁面」畫面，並附上「回到首頁」按鈕。

### 1.3 劇本 C：手忙腳亂的後台 Owner

- **[C-1] 後台路由權限攔截僅為前端表面防護**
  - **分類**：💻 系統架構面 (System)
  - **嚴重性**：🟧 High (高)
  - **描述**：`AdminDashboard.tsx` L77-82 僅檢查 `sessionStorage.getItem('admin_session')` 是否存在即放行，攻擊者可在 Console 手動設置偽造 session。雖然後續 API 呼叫受 `admin_token` 保護，但整個後台 UI 都會被完整呈現（含帳號管理等敏感頁面的空殼）。
  - **專家解答**：建議新增 `RequireAdminAuth` wrapper component，使其在 mount 時以 `admin_token` 呼叫後端的 verify endpoint 做一次 server-side 驗證。驗證失敗則強制導回 `/admin/login`。

- **[C-2] 🆕 Library Manager 設定僅存於本機 localStorage**
  - **分類**：💻 系統架構面 (System)
  - **嚴重性**：🟧 High (高)
  - **描述**：`AdminLibraryManager.tsx` 的 `handleSave` 只執行 `localStorage.setItem('EIDOS_LIBRARY_CONFIG', ...)`。這表示題庫的開關設定**僅對管理者自己的瀏覽器生效**，其他所有使用者（訪客）的瀏覽器不會讀到這份設定。`ProfileSetup.tsx` 雖然有讀取 `EIDOS_LIBRARY_CONFIG` 來禁用按鈕，但每個使用者本機的 localStorage 中根本不會有這個 key，因此題庫開關機制對所有訪客等同無效。
  - **專家解答**：必須將 `EIDOS_LIBRARY_CONFIG` 整合進 Cloudflare KV 的 `SITE_SETTINGS` 機制。`AdminLibraryManager` 儲存時呼叫 API 寫入遠端；前台的 `Index.tsx` / `ProfileSetup.tsx` 在 `fetchSiteSettings()` 回傳時一併取得 library config 並寫入前端 localStorage 作為 cache。

- **[C-3] 🆕 後台 Dashboard 統計數字為硬編碼假資料**
  - **分類**：👦 操作體驗面 (UX)
  - **嚴重性**：🟩 Low (低)
  - **描述**：`AdminDashboard.tsx` L138-141 的 `QuickStat` 顯示「註冊人數 1,247」「總答題數 38,459」「題庫組合 42」，這些數字全是寫死的（無 API 來源）。上線後若管理者看到這些假數字，可能造成決策上的誤導。
  - **專家解答**：應從後端 API 取得實時統計數據（D1 query count），或在數字旁邊標註「模擬資料」標籤（如 `LearningReportView` 的做法）。

### 1.4 跨劇本通用問題

- **[X-1] 🆕 `LearningReportView` 的 MOCK 假數據容易誤導使用者**
  - **分類**：👦 操作體驗面 (UX)
  - **嚴重性**：🟨 Medium (中)
  - **描述**：`LearningReportView.tsx` L31-45 在無真實練習紀錄時，會顯示硬編碼的 `MOCK_PRACTICE_HISTORY`（含 80%、72% 等成績）和 `MOCK_CAT_STATS`（含各課正確率）。雖然右上角有「模擬資料」標籤，但對小學生而言可能不會注意到，誤以為自己已有作答歷史。
  - **專家解答**：建議在無真實數據時，顯示一個明確的 Empty State（如「🎒 你還沒有開始練習唷！去做幾道題目吧！」），而非展示看起來很真實的假數據。MOCK 數據僅應保留給開發或 demo 模式。

---

## 2. 嚴重性分級總表

| 編號 | 問題 | 分類 | 嚴重性 |
|:---|:---|:---|:---:|
| A-1 | 答題進度未持久化 (F5 遺失) | System | 🟧 High |
| A-2 | 冷啟動預設值硬編碼閃爍 | UX | 🟩 Low |
| A-3 | 雙重維護模式判斷不同步 | System | 🟨 Medium |
| A-4 | 切科目觸發重複 API 請求 | Tech | 🟨 Medium |
| B-1 | 深連結狀態還原不完整 | System | 🟧 High |
| B-2 | `handleStartQuiz` React 反模式 | Tech | 🟨 Medium |
| B-3 | 缺乏全域 Error Boundary | Tech | 🟨 Medium |
| C-1 | 後台權限僅前端表面防護 | System | 🟧 High |
| C-2 | Library 設定僅存本機 localStorage | System | 🟧 High |
| C-3 | 後台統計數字硬編碼假資料 | UX | 🟩 Low |
| X-1 | MOCK 假數據誤導小學生 | UX | 🟨 Medium |

---

## 3. 與 JOB-017A 報告之差異比較

| 項目 | JOB-017A 已覆蓋 | 本報告新增/深化 |
|:---|:---:|:---:|
| A-1 答題進度未持久化 | ✅ | 新增修復策略細節 |
| A-2 冷啟動閃爍 | — | 🆕 |
| A-3 雙重維護模式 | — | 🆕 |
| A-4 API 過度請求 | — | 🆕 |
| B-1 深連結還原 | ✅ | 擴充 quiz/result 情境 |
| B-2 React 反模式 | — | 🆕 |
| B-3 Error Boundary | ✅ | — |
| C-1 後台權限 | ✅ | — |
| C-2 Library 僅存本機 | ✅ | 深化影響範圍分析 |
| C-3 後台假數據 | — | 🆕 |
| X-1 MOCK 假數據 | — | 🆕 |
