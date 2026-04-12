# 📋 派工單 JOB-018：UAT 綜合修復與體驗優化 (上線前 Critical Patch)

> **目標**：修復 JOB-017 系列盲測（Gemini, Opus, Sonnet, Cursor）所發現的 5 個核心共同問題與 7 個關鍵個別問題。
> **前置參考**：`jobs/JOB-017A-Report.md` ~ `jobs/JOB-017E-Report.md`

---

## 🎯 第一階段：修復 5 大共同問題 (Critical/High)

這些問題影響系統核心流程與安全性，被四位 AI 專家一致指認，必須優先處理。

### 1. 題庫開關設定未生效 (前台無攔截)
- **問題描述**：Admin 後台的 `EIDOS_LIBRARY_CONFIG` 題庫開關僅儲存於單機 localStorage，且前台完全未讀取此設定，導致已關閉的題庫仍可被存取。
- **解決方案**：
  1. **前端攔截**：在 `Index.tsx` 中新增 `isLibraryEnabled(config, grade, subject, semester, publisher)` 判斷，若該組合被關閉，則阻擋 `loadQuestions` 並呈現友善的「此題庫已關閉」Empty State。
  2. **配置同步**：將 `EIDOS_LIBRARY_CONFIG` 整合進 Cloudflare KV `SITE_SETTINGS`，透過 API `/api/admin/config` 讀寫，讓前台啟動時全域套用。

### 2. 答題中斷直接歸零 (F5 遺失進度)
- **問題描述**：`storage.ts` 雖有實作 QuizProgress 介面，但 `QuizView` 和 `Index.tsx` 完全沒呼叫，導致使用者重整網頁後進度全失。
- **解決方案**：
  1. `QuizView.tsx` 的每次作答（`doConfirm`）皆需呼叫 `saveQuizProgress()`。
  2. `Index.tsx` 的 `handleStartQuiz` 需先 `loadQuizProgress()`。若有進度則詢問「是否繼續？」，並透過 props (`initialIndex`, `initialScore`) 傳入恢復。

### 3. 深層網址空降導致白畫面/卡死
- **問題描述**：直接貼上 `/wrong` 或 `/quiz` 等需要上下文的深層網址，會因為欠缺 `sessionWrongQuestions` 或題庫資料而導致畫面全白或顯示錯誤。
- **解決方案**：
  - 增強 `Index.tsx` 路由攔截：需要 session state 的 view (`quiz`, `wrong`, `result`) 不允許直接深連結。若偵測到直接進入，則自動 fallback 導回 `menu`。

### 4. Admin 後台僅靠 SessionStorage 偽造防護
- **問題描述**：後台登入檢查僅判斷 `sessionStorage.getItem('admin_session')`，任何人可在 Console 自行寫入偽造通過，安全性極低。
- **解決方案**：
  - 建立 `RequireAdminAuth` Component，除了檢查 session 外，更名或加密驗證 token 格式；並確保所有 Admin 的寫入操作 (ConfigPanel, LibraryManager) 都有實際的 Server-side JWT/Token 驗證。

### 5. 錯誤被吞掉與缺乏 Error Boundary
- **問題描述**：`questionLoader.ts` 把所有抓檔失敗的錯誤（404, JSON 壞掉）都偷吞掉，直接回傳空陣列讓 UI 顯示「尚無題庫」，難以除錯。且整個 React App 欠缺 Error Boundary。
- **解決方案**：
  1. 在 `App.tsx` 外層包覆 `<ErrorBoundary>`，捕捉任何未預期的 Render Error 並顯示友善錯誤提示。
  2. 擴充 `questionLoader.ts` 的回傳型別，區分 `status: 'success' | 'empty' | 'error'`，根據狀態在 `MainMenu` 顯示對應的「檔案錯誤」或「尚無題庫」提示。

---

## 🕵️‍♂️ 第二階段：修復 7 個精選個別問題 (Medium/Low)

這些問題由各家 AI 獨立發現，專注於邊際防呆與操作體驗。

### 1. 網址與畫面靈肉分離 (Cursor 提出)
- **問題**：透過深連結進入後，API 取得的 UserProfile 覆寫了 React State，但因為程式碼的保護邏輯，網址並未跟著變動，造成網址顯示 A 科目、畫面顯示 B 科目的混亂。
- **解法**：在 `Index.tsx` 中加入 `isDeepLinked` 旗標；若本次是合法深連結啟動，則暫停 `fetchAndMergeUserProfile` 對 State 的覆寫。

### 2. 前後台預設值打架 (Sonnet 提出)
- **問題**：Admin 設定 `DEFAULT_GRADE=5`，但前台 `Index.tsx` 寫死預設為 3 年級。
- **解法**：讓 `Index.tsx` 啟動時的 lazy initializer 優先讀取 Admin 配置。

### 3. 切換科目重複觸發 API (Opus 提出)
- **問題**：`fetchAndMergeUserProfile` 的依賴陣列有 `subject`，導致每次切換科目都浪費資源呼叫一次後端 API。
- **解法**：移除 `subject` 依賴，確保 `fetchAndMergeUserProfile` 只在 App mount 時抓取一次。

### 4. 學習報告展示假數字誤導 (Opus 提出)
- **問題**：無練習紀錄時，學習報告會顯示一堆 80%、72% 的寫死假數據（MOCK_DATA），會讓小學生誤會。
- **解法**：移除 MOCK 數據，若無紀錄則顯示設計精美的 Empty State（🎒 你還沒有開始練習唷！）。

### 5. 答案索引出錯時將錯就錯 (Sonnet 提出)
- **問題**：如果題庫 JSON 把答案寫了 `answer_index: 5`，但其實只有 4 個選項，系統不會報錯，直接偷偷讓答案變成 A。
- **解法**：在 `normalizeAnswer` 加入越界檢查，若越界則 `console.warn` 警告，避免隱形錯誤。

### 6. 清除紀錄不完全 (Sonnet 提出)
- **問題**：清除紀錄只清除了答題進程，沒有清掉 `eidos_user_id` 和偏好設定。
- **解法**：擴充 `clearAllHistory()`，提示使用者是否要連同偏好設定一併清除。

### 7. 載入中顏色殘影 (Sonnet 提出)
- **問題**：科目切換稍微延遲時，Spinner 會殘留上一個科目的顏色。
- **解法**：修正 `Index.tsx` 內 `theme` 在 Loading State 時的套用時機與 CSS Transitions。

---

## 🤖 推薦實作負責人 (AI Agent 建議)

綜合考量問題的複雜度與各 AI 的特長，我強烈建議：

**🥇 指派 Opus (或由擁有超大 Context 且擅長重構模型的 GPT-4o / Claude 3.5 Sonnet 等效能型 Agent) 進行實作**

**理由如下：**
1. **牽扯範圍極廣**：這份派工單橫跨了 `Index.tsx` (1個高達500行的超複雜元件)、`storage.ts`、`QuizView.tsx`、`App.tsx` 以及數個 Admin 元件。需要具備極強的**上下文整合能力 (Context Mastery)** 才能在重構時不弄壞原有的 URL Router 同步機制。
2. **React Hooks 複雜度**：第一階段的第2點 (QuizProgress) 與 第二階段的第1/3/7點 都涉及深度調整 `useEffect` 的依賴陣列與異步狀態時序，Opus 與 Sonnet 在這方面能準確迴避 React 的反模式 (Anti-patterns)。
3. **Cursor 的解法最精準**：這份派工單很大程度採用了報告 E (Cursor) 的工程觀點，由具備強大程式修改能力的 Agent 執行最能貫徹細節。

**💡 執行建議**：
請告訴我：「`/pj_job JOB-018`」，我們就可以直接切換至 **EXECUTION** 模式，並由我幫您將這 12 個問題逐一寫入原始碼進行修復！
