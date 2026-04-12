# JOB-017E 上線前 UAT 診斷報告 (Cursor)

*對應派工單：`jobs/JOB-017E-UAT-Cursor.md`*  
*執行原則：不修改任何程式碼，只做觀察與開處方*

---

## 一、問題清單 (Issue Log)

### 1. URL 與 Profile 狀態不同步（深連結邊界）

- **類型**：💻 System  
- **嚴重度**：🟧 High  
- **觀察**：
  - 透過深連結進入，例如 `/g3/chi/s2/nani/about/library` 時，`Index.tsx` 會先依 URL 解析 `grade/subject/semester/publisher/view` 並設 state。
  - 之後 `fetchSiteSettings` 完成、`fetchAndMergeUserProfile` 被觸發後，會用後端 profile 的 `grade/semester/publisher` 覆寫現有 state（QL148–QL159 左右）。
  - `State → URL` 的 effect 為了避免覆寫合法的題庫 URL，有 `if (VALID_APP_PATH.test(currentPath)) return;`，導致畫面 state 已被 profile 改掉，但網址列仍停留在原本的深連結組合。
- **風險**：
  - 使用者實際在「profile 對應的組合」答題，卻以為自己還在深連結指定的科目/出版社；回上一頁或重新整理時，容易迷失。
- **建議解法（程式層級）**：
  1. 新增一個例如 `isDeepLinked` 的 flag，代表「本次啟動時 URL 已成功解析為合法題庫路徑」：
     - 當 `gp/sp/semp/pp` 全部合法時設為 `true`。
     - 若 `isDeepLinked === true`，則 `fetchAndMergeUserProfile` 只把 merged profile 存進 localStorage，不再改動 `grade/semester/publisher` state。
  2. 或反向處理：視 URL 為最高優先權：
     - 若 URL 合法，就完全跳過 `fetchAndMergeUserProfile` 的 state 覆寫，只執行 `saveUserProfile`。
  3. 如要維持「profile 可改動 URL」的行為，建議拿掉 `VALID_APP_PATH` 的 early return，改為統一由 state 推動 URL，避免「畫面 A / URL B」的雙軌狀態。

---

### 2. 後台關閉題庫後，前台仍可透過 URL 直接進入

- **類型**：💻 System + 📚 Data  
- **嚴重度**：🟧 High  
- **觀察**：
  - 後台 `AdminLibraryManager` 把組合關閉或移除出版社時，只是更新 `localStorage.EIDOS_LIBRARY_CONFIG`。
  - 受 LibraryConfig 影響的目前主要有：
    - `ProfileSetup`：限制可選出版社。
    - `AboutView` 的 Library tab：決定題庫總覽中哪些格子可點。
  - 但 `Index.tsx` 內的路由與 `loadQuestions` 並沒有讀取 `EIDOS_LIBRARY_CONFIG`：
    - 只要 URL 符合 `VALID_APP_PATH`，就照 `grade/subject/semester/publisher` 組出 `/question/platform/...` 載題。
    - 使用者可以手動改網址或透過舊書籤繼續玩「後台已關閉」的題庫。
- **風險**：
  - Owner 以為在後台關閉的題庫仍然可被使用，削弱管理信任感。
- **建議解法（程式層級）**：
  1. 在 `Index.tsx` 加入「LibraryConfig gate」流程：
     - 初始時讀出 `localStorage.EIDOS_LIBRARY_CONFIG`，解析成 `LibraryConfig`。
     - 檢查目前 `grade/semester/subject/publisher`：
       - 年級是否 enabled。
       - 學期是否 enabled。
       - 該科目是否 enabled。
       - `publishers` 是否包含目前出版社。
     - 若任一條件未通過：
       - 不呼叫 `loadQuestions`。
       - 顯示明確 empty state：「此題庫已由管理員關閉」；或導回 AboutView Library tab 並提示可用組合。
  2. `ProfileSetup`／`getPublisherForSubject` 讀取 profile 時，若發現某 key 指向已被關閉的出版社，應 fallback 到同科目/學期的第一個可用出版社，並同步寫回 profile + API。

---

### 3. 題庫載入錯誤全部被「當成空題庫」吞掉

- **類型**：🛠️ Tech  
- **嚴重度**：🟨 Medium  
- **觀察**：
  - `questionLoader.loadQuestions` 內，只要遇到任何錯誤（manifest 404、CSV/JSON fetch 失敗、JSON 結構異常），最後都會回傳 `empty`（questions 為空、categories 為空）。
  - 前台在 `Index.tsx` 只根據 `loaded.questions.length` 決定顯示「尚無題庫」。UI 無法區分「真的沒有題庫」與「檔案錯誤導致載入失敗」。
- **風險**：
  - 實際上有題庫，但因單一檔案錯誤整組失效；PM 只看到「尚無題庫」，不容易發現資料異常。
- **建議解法（程式層級）**：
  1. 擴充 `LoadedQuestions` 型別：
     