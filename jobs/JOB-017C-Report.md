# 📋 JOB-017C：上線前 UAT 深度診斷報告

> **執行者**：Sonnet 4.6（Antigravity 代理）
> **診斷日期**：2026-02-26 18:45
> **診斷方式**：靜態原始碼審查（Static Code Review）+ 邏輯流程模擬
> **最高指導原則**：只看病、開處方，不動刀。本報告不含任何程式碼修改。

---

## 一、執行摘要 (Executive Summary)

本次 UAT 診斷針對 Eidos v3（`apps/v3_eidos/`）進行三大劇本的深度模擬，共發現 **11 個問題點**，其中：

| 等級 | 數量 | 概述 |
|---|---|---|
| 🟥 Critical | 2 | Admin 無真實 Token 驗證、ConfigPanel 設定無法同步前台 |
| 🟧 High | 3 | 答題進度 F5 不還原、Library Manager 關閉無前台攔截、深連結 wrong-questions 路由問題 |
| 🟨 Medium | 4 | 冷啟動年級預設不一致、科目切換 UI 顏色殘留時機、統計清除範疇不完整、answer_index 越界防呆 |
| 🟩 Low | 2 | Empty State 文案過於技術性、清除紀錄後無成功回饋動畫 |

---

## 二、問題清單 (Issue Log)

---

### 🎭 劇本 A：迷航的三年級學生

---

#### A1 — 冷啟動預設年級不一致
- **分類**：💻 系統架構面 (System)
- **嚴重性**：🟨 Medium
- **問題描述**：

  使用者首次進入根路徑 `/`，系統會依序嘗試三種還原策略：
  1. URL 參數（無）
  2. `sci_v2_user_profile`（`loadUserProfile`）
  3. `sci_v2_user_preference`（`loadUserPreference`）
  4. 若以上皆無 → 顯示 `ProfileSetup` 問卷

  問題在於：**`AdminConfigPanel` 中設定了 `DEFAULT_GRADE = 5`、`DEFAULT_SEMESTER = 2`**，但 `AdminConfigPanel.handleSave()` 是把這些值寫進 `localStorage`（個別 key），而 `Index.tsx` 的冷啟動邏輯完全不讀取這些 key。也就是說，後台 Admin 所設定的「預設年級/學期」**對前台毫無效果**，兩套系統的設定完全脫鉤。

  另外，`Index.tsx` 第 63 行預設 `grade = 3`，但 `DEFAULT_CONFIG` 在 `AdminLibraryManager.tsx` 第 55 行標注「預設開放 G3/G4/G5 下學期」—— 當前台預設年級固定為 3，與 Admin 設定意圖不符。

- **影響場景**：新使用者冷啟動時，看到的是 Grade 3 國語，與 Admin 設定的 Grade 5 意圖不同。

---

#### A2 — 科目切換後 UI 顏色殘留時機
- **分類**：💻 系統架構面 (System)
- **嚴重性**：🟨 Medium
- **問題描述**：
  
  `Index.tsx` 的 `handleSubjectChange`（第 281 行）在切換科目時會呼叫 `setView('menu')`，重新渲染 `MainMenu`。但 `theme` 變數直接來自 `SUBJECT_THEME_MAP[subject]`，在 React batch update 中 `subject` 與 `theme` 在同一個 render cycle 一起更新，理論上不會殘留。

  **但有一個邊緣案例**：若使用者點選科目時正在 loading（`loading === true`），畫面顯示 spinner（`border-t-current subject-text-${theme}`），此時 theme class 跟的是舊 state；由於 loading 先結束才回到 `menu` view，使用者在 loading 期間**約 100–300ms 內可能看到舊科目顏色的 spinner**，然後才切換到新顏色。這是 race condition 級別的視覺閃爍。

  更嚴重的潛在問題：`useEffect`（第 196 行）的 deps 包含 `view`，切換科目會觸發 `setView('menu')` → deps 改變 → **可能重新觸發 loadQuestions**，在高頻率切換下造成不必要的重複 fetch。

---

#### A3 — 答題中斷後 F5 重整，進度無還原
- **分類**：💻 系統架構面 (System)  
- **嚴重性**：🟧 High
- **問題描述**：

  `storage.ts` 中確實定義了 `QuizProgress` 介面（第 225 行）、`saveQuizProgress`（第 250 行）與 `loadQuizProgress`（第 235 行），且有 24 小時過期機制。**但 `QuizView.tsx` 完全沒有呼叫 `saveQuizProgress`**，也沒有在 mount 時呼叫 `loadQuizProgress` 進行還原。

  模擬流程：
  1. 使用者進入「進階挑戰（25 題）」
  2. 答到第 15 題
  3. **強制 F5**
  4. 結果：`quizQuestions` state 在 React 裡清空，`view` 回到 `'menu'`（因為 URL 沒有持久化 quiz state）
  5. 使用者需從頭開始

  `storage.ts` 的 `QuizProgress` 結構是設計好的 API，但 `QuizView` 從未使用它。這是一個**已設計但未實作的功能**，對小學生體驗影響很大。

- **Empty State**：「無題庫 📭」的提示存在（`MainMenu.tsx` 第 102 行）。但文字「尚無對應題庫 📭」對小學生過於技術性。

---

#### A4 — 成就清除：範疇不完整
- **分類**：💻 系統架構面 (System)
- **嚴重性**：🟨 Medium
- **問題描述**：

  `storage.ts` 的 `clearAllHistory()`（第 272 行）的刪除範疇：
  - ✅ 刪除所有 `history_*` key
  - ✅ 刪除所有 `progress_*` key
  - ✅ 刪除 `sci_v2_all_practice_history`

  **但以下重要 key 不在清除範圍內**：
  - ❌ `sci_v2_user_preference`（答題偏好）
  - ❌ `eidos_user_id`（匿名用戶 ID，關聯 API 答題紀錄）

  使用者按下「清除紀錄」期望完全重置，但 server-side 的答題歷程（透過 `eidos_user_id` 連結）不會被清除，用戶 ID 也不會重新生成，導致「清除」與「真正重置」之間存在語義落差。

---

### 🎭 劇本 B：嚴格的題庫品管員

---

#### B1 — JSON 容錯：空陣列與越界寬鬆
- **分類**：📚 題庫資料面 (Data)
- **嚴重性**：🟨 Medium
- **問題描述**：

  `questionLoader.ts` 的容錯機制（第 189–215 行）檢查了 `!q || typeof q.question !== 'string' || !Array.isArray(q.options)`，對 null 題目有防護。

  **但以下 edge case 未妥善處理**：

  1. **`options` 為空陣列 `[]`**：第 291 行的 `handleStartQuiz` 過濾條件是 `q.options.length >= 2`，這能避免進入 quiz，但 `QuizView` 本身不做選項長度驗證（第 177 行直接 `.map`），若繞過這道過濾（例如直接從 URL 進入 quiz view）會渲染空選項區塊而非顯示 Error Boundary。

  2. **`answer_index` 越界**：`normalizeAnswer` 函式（第 29 行）對越界 index 的處理是直接 `return 0`（最後的 fallback），不會 throw error。這表示如果 JSON 裡 `answer_index: 5` 但只有 4 個選項，系統會**靜默地把正確答案改為選項 A**，造成題目邏輯錯誤但無任何 warning。

  3. **`manifest.json` 缺少 `items` 欄位**：`manifestOnly` 模式下（第 135–143 行），若 `manifest.items` 不是陣列，`categories` 會是空陣列，MainMenu 顯示 Empty State 而非報錯，行為可接受，但沒有 console warning 協助 debug。

---

#### B2 — 深連結：wrong-questions 頁無法冷啟動
- **分類**：💻 系統架構面 (System)
- **嚴重性**：🟧 High
- **問題描述**：

  `App.tsx` 的路由定義（第 35–38 行）包含 `/:grade/:subject/:semester/:publisher/:view` 格式，`VIEW_URL_MAP`（`Index.tsx` 第 33 行）有映射：
  ```
  'wrong' → 'wrong-questions'
  'stats' → 'learning-report'
  ```

  模擬無痕模式直接開啟深層路徑：
  - `/g5/chi/s2/ky/stats` → ✅ 可進入 `learning-report` view，但 `wrongQuestions` 來自 `getAccumulatedWrongQuestions()`，因為沒有 localStorage 歷史，會顯示空的錯題本（行為正確）
  - `/g5/chi/s2/ky/wrong` → ⚠️ **進入 `wrong-questions` view，但 `sessionWrongQuestions` 是空陣列**（第 461 行），因為這個 state 只有在 `handleQuizFinish` 後才有值，直接跳轉會渲染一個空的「本次錯題檢視」頁，且「返回」按鈕指向 `result` view（`setView('result')`），但 `result` view 的 `resultScore/resultTotal` 皆為 0，造成**畫面顯示「0/0分」的空結果頁**。這是一個明確的流程錯誤。
  - `/g5/chi/s2/ky/quiz` → ⚠️ 進入 `quiz` view，但 `quizQuestions` 為空，`QuizView` 第 130 行 `if (!current) return null`，會**靜默渲染空白**，使用者看到空頁面無任何引導。

---

### 🎭 劇本 C：後台 Owner

---

#### C1 — Admin 權限：sessionStorage 可輕易偽造
- **分類**：💻 系統架構面 (System)
- **嚴重性**：🟥 Critical
- **問題描述**：

  `AdminDashboard.tsx` 第 77–82 行的登入保護：
  ```tsx
  const session = sessionStorage.getItem('admin_session');
  if (!session) {
    navigate('/admin/login', { replace: true });
  }
  ```

  **問題**：這個保護僅檢查 `admin_session` key 是否存在。只要在瀏覽器 Console 輸入：
  ```js
  sessionStorage.setItem('admin_session', JSON.stringify({ role: 'owner' }))
  ```
  即可完全繞過登入、且獲得 `owner` 權限，直接存取 `/admin/system/users`（帳號管理）。

  `AdminUserManager.tsx` 等敏感元件**沒有任何二次驗證**（如 Bearer Token 到 API）。所有管理操作僅靠 localStorage/sessionStorage 的 client-side 判斷保護，屬於 **Security by Obscurity**。

  > **注意**：若 Admin 功能純為 Demo 展示用途，此問題嚴重性可降為 Medium。但若上線後有真實管理操作（如寫入 Cloudflare KV），此為 Critical。

---

#### C2 — Library Manager 開關：前台無攔截邏輯
- **分類**：🛠️ 前端技術面 (Tech)
- **嚴重性**：🟧 High
- **問題描述**：

  `AdminLibraryManager.tsx` 第 108–112 行：
  ```tsx
  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    // ...
  };
  ```

  後台關閉某個題庫組合（例如關閉 G5 下學期國語康軒版），設定儲存於 `localStorage['EIDOS_LIBRARY_CONFIG']`。

  **前台「完全沒有任何地方讀取 `EIDOS_LIBRARY_CONFIG`」**（經全域搜尋確認）。`Index.tsx` 的加載邏輯、`MainMenu.tsx` 的渲染、`questionLoader.ts` 的 fetch 都不讀此 key。

  這導致：
  1. 後台關閉題庫 → 前台使用者仍可正常進入並答題
  2. Library Manager 的開關設定**完全無效**，對前台行為零影響

  這是功能邏輯錯誤（High），不只是 UI 問題。

---

#### C3 — ConfigPanel 設定無法同步前台（含誤導文案）
- **分類**：🛠️ 前端技術面 (Tech)
- **嚴重性**：🟥 Critical
- **問題描述**：

  `AdminConfigPanel.tsx` 第 86–93 行的 `handleSave`：
  ```tsx
  const handleSave = () => {
    config.forEach(item => {
      localStorage.setItem(item.key, item.value);
    });
  };
  ```

  儲存完後 UI 顯示「✅ 已儲存至 KV」，但**實際上只是寫進 localStorage**，並未寫入 Cloudflare KV（這需要 API call）。文案嚴重誤導 Admin 以為設定已經全站生效。

  實際上：
  - `SITE_STATUS = Maintenance` → `App.tsx` 的 `MaintenanceGuard` 確實有讀取此 localStorage key（第 15 行）✅，這個功能有效
  - `DEFAULT_GRADE`、`DEFAULT_SEMESTER`、`DEFAULT_SUBJECT` → 前台 `Index.tsx` 完全不讀這些 key ❌
  - `MAX_QUIZ_QUESTIONS` → `MainMenu.tsx` 的 quiz count 是 hardcode `25`，不讀此 key ❌

  換言之，只有 `SITE_STATUS` 半有效（僅限同一瀏覽器），其他設定對任何使用者都完全無效。

---

## 三、嚴重性總表

| # | 問題 | 分類 | 嚴重性 |
|---|---|---|---|
| A1 | 冷啟動預設年級與 Admin 設定脫鉤 | 💻 System | 🟨 Medium |
| A2 | 科目切換 loading 期間顏色閃爍 + 重複 fetch 風險 | 💻 System | 🟨 Medium |
| A3 | **QuizProgress 儲存從未實作**，F5 後進度全失 | 💻 System | 🟧 High |
| A4 | clearAllHistory 未清除 user_id 與 preference | 💻 System | 🟨 Medium |
| B1 | answer_index 越界靜默 fallback（邏輯錯題） | 📚 Data | 🟨 Medium |
| B2 | 深連結 `/wrong` 進入後 Back 指向空 result | 💻 System | 🟧 High |
| B3 | 深連結 `/quiz` 冷啟動渲染空白頁 | 💻 System | 🟧 High |
| C1 | **sessionStorage 偽造可完全繞過 Admin 保護** | 💻 System | 🟥 Critical |
| C2 | **EIDOS_LIBRARY_CONFIG 前台完全不讀取** | 🛠️ Tech | 🟧 High |
| C3 | **ConfigPanel 文案誤導「已儲存至 KV」但實為 localStorage** | 🛠️ Tech | 🟥 Critical |
| D1 | 空題庫 Empty State 文案對小學生不友善 | 👦 UX | 🟩 Low |
| D2 | 清除紀錄後無視覺回饋 | 👦 UX | 🟩 Low |

---

## 四、專家解答 (Proposed Solutions)

---

### 🔺 C1：Admin 權限保護（Critical）

**建議方案 A（最小改動）**：在 `AdminLogin` 產生一個 HMAC token，儲存於 `sessionStorage`，`AdminDashboard` 的保護邏輯改為驗證 token 格式而非只做 null check。

**建議方案 B（正確做法）**：所有 Admin 寫入操作（LibraryManager.save、ConfigPanel.save）需透過 Cloudflare Worker API 加上 `Authorization: Bearer {token}` header 驗證。前台的 session 完全只控制 UI，所有真實操作依賴 backend 授權。

---

### 🔺 C3：ConfigPanel 文案與功能分離（Critical）

**立即改動**：將儲存按鈕文案改為「💾 儲存至本機（僅限此瀏覽器）」，移除「已儲存至 KV」的誤導文字。

**中期計畫**：為真正需要全站生效的 config（`DEFAULT_GRADE` 等）建立 Cloudflare Worker API endpoint，`handleSave` 改為 `fetch('/api/admin/config', { method: 'POST', body: ... })`。

---

### 🔺 A3：QuizProgress 還原（High）

`QuizView.tsx` 已有 `initialIndex`、`initialScore`、`initialAnswered` props，只差呼叫端（`Index.tsx`）傳入還原資料。

**修復步驟**：
1. 在 `QuizView` 的 `doConfirm` callback 中，每次答題後呼叫 `saveQuizProgress()`
2. 在 `Index.tsx` 的 `handleStartQuiz` 中，先 `loadQuizProgress()` 取得進度，若存在則詢問使用者「繼續上次進度？」，並以 initialIndex/initialScore/initialAnswered 傳入 QuizView
3. 完成 quiz 後 `handleQuizFinish` 已有 `clearQuizProgress()`，呼叫時機正確 ✅

```tsx
// Index.tsx handleStartQuiz 建議加入：
const savedProgress = loadQuizProgress(grade, subject, semester, publisher);
if (savedProgress && savedProgress.type === type) {
  // 顯示 toast 詢問是否繼續
  // 傳入 initialIndex={savedProgress.currentIndex} 等
}
```

---

### 🔺 C2：EIDOS_LIBRARY_CONFIG 前台整合（High）

在 `Index.tsx` 的題庫加載前（或 `MainMenu.tsx` 渲染前）加入一個 `isLibraryEnabled(grade, subject, semester, publisher)` 函式，讀取 `EIDOS_LIBRARY_CONFIG`，若組合未啟用則顯示特定的「此題庫尚未開放」訊息，並替換當前的「尚無對應題庫」Empty State。

```ts
// 建議在 utils/libraryConfig.ts 新增：
export function isLibraryEnabled(grade, subject, semester, publisher): boolean {
  const raw = localStorage.getItem('EIDOS_LIBRARY_CONFIG');
  if (!raw) return true; // 未設定時全開放
  const config = JSON.parse(raw);
  const sub = config?.grades?.[grade]?.semesters?.[semester]?.subjects?.[subject];
  return sub?.enabled && sub?.publishers?.includes(publisher);
}
```

---

### 🔺 B2：深連結 wrong-questions 防呆（High）

在 `Index.tsx` 的 URL→State sync（第 104–106 行）中，加入對 `wrong` 和 `quiz` view 的特殊處理：若透過深連結直接進入這些需要 session state 的 view，自動導向 `menu`：

```tsx
const v = vp ? VIEW_URL_MAP[vp] : 'menu';
// 需要 session state 的 view，不允許直接深連結
const SESSION_ONLY_VIEWS: View[] = ['quiz', 'wrong-questions', 'result'];
setView(SESSION_ONLY_VIEWS.includes(v) ? 'menu' : (v || 'menu'));
```

---

### 🔺 B1：answer_index 越界警告（Medium）

在 `normalizeAnswer` 函式最後的 fallback 路徑加入 console.warn，幫助資料人員快速定位問題 JSON：

```ts
const num = parseInt(str);
if (!isNaN(num)) {
  if (q.options && num >= q.options.length) {
    console.warn(`[QuestionLoader] answer_index ${num} out of bounds for options.length ${q.options.length}`);
    return 0;
  }
  return num;
}
```

---

### 🔺 D1：Empty State 文案（Low）

`MainMenu.tsx` 第 37 行由 `⚠️ 尚無題庫` 改為：
```
📭 這個組合的題目還在準備中，請先選擇其他科目或出版社！
```

第 102 行由 `尚無對應題庫 📭` 改為：
```
題目還在路上，敬請期待 🚀
```

---

## 五、行動優先順序建議

```
🔴 上線前必修（Critical）
  1. [C1] Admin 登入保護加入 token 驗證，至少移除純 sessionStorage 偽造漏洞
  2. [C3] 修改 ConfigPanel 儲存文案，移除「已儲存至 KV」誤導說明

🟠 上線後第一週修（High）
  3. [C2] 整合 EIDOS_LIBRARY_CONFIG 到前台過濾邏輯
  4. [A3] 實作 QuizProgress 還原（QuizView 呼叫 saveQuizProgress）
  5. [B2+B3] 深連結 quiz/wrong view 導向 menu

🟡 第一個月修（Medium）
  6. [B1] answer_index 越界 console.warn
  7. [A4] clearAllHistory 增加清除 eidos_user_id 選項
  8. [A1] Index.tsx 冷啟動讀取 Admin 設定的 DEFAULT_GRADE
  9. [A2] 切換科目時同步取消舊的 loadQuestions

🟢 版本疊代處理（Low）
  10. [D1] Empty State 文案優化
  11. [D2] 清除紀錄後加入成功動畫回饋
```

---

*報告完整度：涵蓋所有三大劇本（A/B/C）共 11 個問題，包含嚴重性評估與程式碼層級修復建議。*
*Generated by Antigravity (Sonnet 4.6 slot) at 2026-02-26 18:45*
