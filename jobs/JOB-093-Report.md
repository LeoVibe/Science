# JOB-093 完工報告

## 完成項目
- **根因**：`State → URL` 的 `useEffect` 在 `currentPath !== path` 時，若 `VALID_APP_PATH.test(currentPath)` 為真則直接 `return`，導致使用者在深連結（如 `/g6/chi/s2/knsh/about/deepdive`）下從頁首切換科目後，**網址仍為 chi/knsh，但 state 已為其他科**，`loadQuestions` 依 state 請求 manifest → 與靜態路徑不一致時出現 404；畫面上則出現「社會 + 翰林」與網址「chi + knsh」並存。
- **修復**：
  1. 合法題庫參數之 **URL → state** 改為 **`useLayoutEffect`**，使 Link 進入時 state 在導向同步的 `useEffect` 之前已更新。
  2. 移除 **`VALID_APP_PATH` 略過 `navigate`** 的邏輯，讓科目／出版社／年級變更後網址一定與 state 對齊。

## 修改檔案
- `apps/v3_eidos/src/pages/Index.tsx`

## 驗證
- `apps/v3_eidos`：`npm run build` 通過。

## 備註
- 無法代使用者操作本機瀏覽器；部署後請以「深連結 → 切換科目」手動驗證網址列是否同步變更。
- 無痕仍出現相同現象屬預期（非 localStorage 失效），為上述 URL/state 不同步；修復後應一致。
