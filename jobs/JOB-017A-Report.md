# JOB-017A 上線初診報告 (Gemini 3.1 Pro)

*Created by AG at 2026-02-26 16:53*

## 1. 問題清單 (Issue Log)

### 1.1 劇本 A：迷航的三年級學生
經過原始碼檢視 `src/App.tsx`、`src/pages/Index.tsx` 與 `src/components/QuizView.tsx` 以及 `src/utils/storage.ts`，發現以下問題：

- **[A-1] 答題中斷狀態未持久化 (F5 後進度遺失)**
  - **分類**：💻 系統架構面 (System)
  - **嚴重性**：🟧 High (高)
  - **描述**：`QuizView.tsx` 內控制答題進度的狀能（`currentIndex`, `score`, `answered`, `sessionWrong` 等）僅儲存於 React Hook 的記憶體中。雖然 `storage.ts` 有實作 `saveQuizProgress` 與 `loadQuizProgress`，但在 `QuizView` 答題過程 (`handleNext`, `doConfirm`) 並沒有觸發儲存，且 `Index.tsx` 進入 `quiz` 視圖時也沒有嘗試載入與恢復先前的進度。若學生在作答數十題中途不小心按下 `F5` 或重整頁面，進度將完全清空。
  - **專家解答**：建議在 `QuizView` 中實作 `useEffect`，監聽 `currentIndex` 與 `answered` 變化，定期呼叫 `storage.saveQuizProgress`。在 `Index.tsx` 觸發 `handleStartQuiz` 之前，先檢查是否存在未完成的進度，若有則跳出詢問 Dialog (「您有未完成的測驗，是否繼續？」)，同意的話將進度傳入 `QuizView` 的 `initialIndex`, `initialScore`, `initialAnswered` Props。

- **[A-2] 無題庫時的 Empty State**
  - **分類**：👦 操作體驗面 (UX)
  - **嚴重性**：🟨 Medium (中)
  - **描述**：當 `loadsQuestions` 取得空陣列後，`Index.tsx` 若處於 `quiz` 視圖且無題目，在 `Index.tsx` 中目前並無看見顯式阻擋邏輯 (僅在 `handleStartQuiz` 時 if (`!isLoaded`) return)，若使用者直接存取 `/:grade/:subject/:semester/:publisher/quiz`，可能會進入空畫面的 `QuizView`。
  - **專家解答**：應在 `Index.tsx` 內部渲染 `QuizView` 之前，加入 Empty State 防錯檢查。如果 `quizQuestions.length === 0`，應顯示明顯提示（如 "目前這個單元還沒有題目唷～"）並附上返回首頁的按鈕，而非直接載入。

### 1.2 劇本 B：嚴格的題庫品管員
- **[B-1] 路由深連結 (Deep Linking) 狀態還原失敗**
  - **分類**：💻 系統架構面 (System)
  - **嚴重性**：🟧 High (高)
  - **描述**：在無痕視窗或直接貼上 `/g3/math/s1/nan_yi/wrong` 深層路由時，`Index.tsx` 會將 `view` 設為 `wrong-questions` 並掛載 `WrongQuestionsView`。然而，`WrongQuestionsView` 接收的 `questions` props 來源是 State 中的 `sessionWrongQuestions`（預設為空陣列 `[]`）。這意味著使用者透過深連結進入錯題本時，永遠只會看到「🎉 沒有錯題！」，而不會載入 `storage.ts` 中累積的歷史錯題。
  - **專家解答**：`wrong-questions` 應該區分「本次測驗錯題 (Session)」與「歷史累積錯題 (Accumulated)」。若透過深連結直接進入（非剛考完試），應從 `getAccumulatedWrongQuestions` 獲取錯題而非依賴 `sessionWrongQuestions` State；或考慮將這兩個視圖整合至 `learning-report` (統計與錯題總攬) 下處理。

- **[B-2] 缺乏全域級與 API 級的 Error Boundary**
  - **分類**：🛠️ 前端技術面 (Tech)
  - **嚴重性**：🟨 Medium (中)
  - **描述**：`data/questionLoader.ts` 對於 JSON 屬性缺失（如沒有 `options` 或越界 `answer`）有一定的容錯處理（如自動補上、或 `is_active !== false` 條件），甚至整個 fetch 失敗會回傳 `empty` 物件。但前端完全缺乏 React Error Boundary 組件；若在渲染 `QuizView` 期間因資料異常引發 JS Exception，整個網頁會變成白畫面。
  - **專家解答**：建議在 `App.tsx` 最外層加上一組 `<ErrorBoundary fallback={<CrashFallback />} />`，且在 `Index.tsx` 也針對 `questionLoader.ts` 回傳空陣列的情況（`loaded.questions.length === 0` && 不為載入中），實作統一的 Empty/Error State 頁面，提示「載入題庫失敗或尚無題目可供練習」。

### 1.3 劇本 C：手忙腳亂的後台 Owner
- **[C-1] 後台路由權限攔截僅作表面防護**
  - **分類**：💻 系統架構面 (System)
  - **嚴重性**：🟧 High (高)
  - **描述**：`AdminDashboard.tsx` 依賴 `sessionStorage.getItem('admin_session')` 直接判斷是否導向登入頁，雖然有 `ownerOnly` 的判定，但任何人只要在 Browser Console 輸入 `sessionStorage.setItem('admin_session', JSON.stringify({role: 'owner'}))` 即可繞過前端防護並看到所有的標籤頁（包含系統管理）。雖然實際 CRUD 呼叫仍會被後端驗證 `admin_token` 所阻擋（如 `AdminUserManager.tsx` 拿不到正確資料），但 UX 上不應該讓未授權者能看到後台介面。
  - **專家解答**：建議在 `AdminDashboard.tsx` 及 `App.tsx` 的 Admin 路由層級，加入一組 `RequireAdminAuth` Guard Component，並且在該 Guard 內部使用 `admin_token` 打一次後端的 `/api/admin/verify` (若有) 來驗證 token 的有效性，確保只有真正持有合法 Server Session 的人才能進入 `AdminDashboard`。

- **[C-2] Library Manager 設定儲存欠缺遠端同步確認**
  - **分類**：System
  - **嚴重性**：🟨 Medium (中)
  - **描述**：`AdminLibraryManager.tsx` 內 `handleSave` 僅將全站開放進度存入 `localStorage.setItem('EIDOS_LIBRARY_CONFIG')` 並等待3秒後狀態取消。如果這是「全站設定」，僅存在發布者的單機 localStorage，表示其他前端或訪客電腦並不會吃到這份設定變更。這是以「單機開發」取代了真正的「雲端設定」模式。
  - **專家解答**：需整合像是 Cloudflare KV (已有類似 `SITE_SETTINGS` 機制) 作為全站大表。當 `AdminLibraryManager.tsx` 發出儲存指令時，必須呼叫 `api.bumpSiteSettings(config)` 等 API 發送到後端，並由全站 `App.tsx` 啟動時發 `fetchSiteSettings()` (或是包含在內) 統一更新前端的本地 `EIDOS_LIBRARY_CONFIG`，才能達到全域連動之效。
