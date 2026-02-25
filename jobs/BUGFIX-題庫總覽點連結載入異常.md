# BUGFIX：題庫總覽點連結後有時看不見分科內容

**問題編號：** 題庫總覽連結載入  
**發現／回報：** 從題庫總覽點選分科後，隨機出現「看不見分科題庫內容」；直接複製連結開啟則正常。有時載入仍偏慢。  
**相關派工：** JOB-011（題庫總覽 UI）、導覽與返回路徑修正。

---

## 現象

- **操作：** 在 `/about/library`（題庫總覽）點擊某科某社的連結（例如 G3 自然 S2 康軒 → `/g3/sci/s2/knsh/review`）。
- **問題：** 有時畫面沒有切到對應題庫（仍顯示上一組或空白），或載入很慢。
- **對照：** 直接貼上同一連結到網址列開啟，則多數可正常顯示。

---

## 原因

1. **State → URL 的 effect 覆寫了連結目標**  
   `Index.tsx` 中有一個「State → URL」同步 effect：依目前 state（grade, subject, semester, publisher, view）算出 path 並 `navigate(path, { replace: true })`。  
   使用者點題庫總覽的 `<Link>` 時：
   - React Router 先把 URL 改成新路徑（例如 `/g3/sci/s2/knsh/review`）。
   - 同一輪或下一輪，state 仍是舊的（例如還在 G5 翰林 about）。
   - State → URL effect 用舊 state 算出舊 path，發現 `currentPath !== path`，就執行 `navigate(path)`，**把網址又改回舊路徑**。
   - 結果使用者看到的還是上一組題庫或 about 頁，造成「點連結卻看不見分科內容」。

2. **載題時序**  
   若 URL 沒被覆寫，URL→State effect 會把 state 更新成新組合並觸發載題；若 URL 被覆寫，就不會載到正確題庫，或需再次手動點一次／貼連結才會對。

3. **「有時很慢」**  
   可能與載題時機、網路或 manifest/題目檔大小有關；本 bugfix 主要解決「點連結後被導回錯的 path」的問題。

---

## 修復方式（程式）

**檔案：** `apps/v3_eidos/src/pages/Index.tsx`

1. **常數（已存在）：**  
   `VALID_APP_PATH = /^\/g\d\/[^/]+\/s\d\/[^/]+\/[^/]+(\/[^/]+)?$/`  
   用來判斷目前 pathname 是否為「合法題庫／app 路徑」（如 `/g3/sci/s2/knsh/review` 或 `/g5/chi/s2/hlm/about/library`）。

2. **State → URL effect 中，在 `navigate` 前加上守衛：**
   - 若 `currentPath !== path`（state 算出來的路徑與目前 URL 不同），**先檢查** `VALID_APP_PATH.test(currentPath)`。
   - 若為 `true`，表示目前 URL 已是合法路徑（多半是使用者剛點 Link 的結果），**不要用 state 覆寫**，直接 `return`，讓 URL→State 的 effect 依目前 URL 更新 state 並觸發載題。
   - 僅在「目前 URL 不是合法路徑」時才執行 `navigate(path, { replace: true })`。

**程式片段：**

```ts
const currentPath = window.location.pathname;
if (currentPath !== path) {
  if (VALID_APP_PATH.test(currentPath)) return; // 使用者剛點題庫總覽 Link，不覆寫 URL
  navigate(path, { replace: true });
}
```

**注意：** 若此段 `return` 被移除或漏合併，bug 會再現（點連結後仍被導回錯的 path）。派工或合併時請確認此判斷存在。

---

## 派工回報紀錄

- **修復日期：** 2026-02-24（初次）、再次補上判斷 2026-02-25。
- **狀態：** 已於 `Index.tsx` 補回「合法路徑不覆寫」判斷，題庫總覽點連結後不應再被 State→URL 蓋掉網址。
- **驗證建議：**  
  1. 開啟題庫總覽（例如 `/g3/sci/s2/knsh/about/library`）。  
  2. 點擊任一科任一家出版社的「xx 題 Lx」連結。  
  3. 確認網址維持在該 review 路徑且畫面顯示對應分科題庫；多點幾組不同年級/科/社交叉測試。  
  4. 若仍遇「有時很慢」，可再查載題邏輯或網路／資源大小，與本 bug 為不同面向。
