# JOB-001a: 快捷鍵與自動跳題 UX 修正 (Hotfix \u0026 Polish)

## 📌 任務背景
使用者回報快捷鍵功能未如預期。經 Antigravity 審閱，發現原實作存在 `stateRef` 時序延遲，且手動跳題會與自動跳題定時器衝突。

## 📖 修正規格 (Antigravity 已執行的熱修復)
1.  **快捷鍵重構**：將 `onKeyDown` 從依賴 `ref` 改為直接依賴 React `state` 選項與確認狀態，確保 100% 同步。
2.  **定時器清理**：在 `handleNext` 中主動清除 `autoAdvanceTimerRef`，防止雙重跳題。
3.  **邏輯收斂**：自動跳題現在統一呼叫 `handleNext` 函數，確保邏輯一致。

## 🎨 請 Cursor 補齊的 Polish 項目
1.  **按鍵視覺反饋**：當使用者按下 A/B/C/D 鍵時，對應的選項按鈕應有短暫的「Active/被點擊」視覺效果（如：縮放或背景色閃動），讓使用者感知到按鍵被接收。
2.  **快捷鍵開關檢查**：未來應確認此功能是否正確受 `profiles` 中的 `shortcut_enabled` 參數控制（目前前端尚未完全綁定 API 數據）。

## 💬 指令範本 (請直接複製貼上給 Cursor)
> 「Antigravity 已經幫我處理了 `QuizView.tsx` 的快捷鍵邏輯熱修復。
> 
> 請你接手完成最後的打磨 (Polish)：
> 1. 當使用者按下鍵盤 A-D 鍵時，在對應的選項按鈕上加入短暫的 `scale-95` 或顏色反饋動畫，讓體感更真實。
> 2. 確保測驗頁下方的按鈕提示 `(或按 A\u2013D)` 在 `shortcut_enabled` 為 false 時消失（暫時可先從 `getAutoAdvanceDelayMs` 讀取 mock 邏輯測試）。
> 
> 完成後請更新 `jobs/README.md` 並在此任務單回報。」

## 📈 實作結果 (由 Cursor 填寫)
* [x] **按鍵視覺反饋** — 按下 A–D 時對應選項按鈕短暫 `scale-[0.98]` + `ring-2 ring-primary/50`（150ms），體感明確。
* [x] **快捷鍵開關** — 測驗頁依 `shortcutEnabled`（來自 profile.shortcut_enabled / API）註冊鍵盤事件；為 false 時不顯示「(或按 A–D)」；ProfileSetup 新增「使用 A–D 快捷鍵答題」勾選並同步 API。

---
*Created by Antigravity at 2026-02-23 10:05*  
*Last Updated: 2026-02-23 (Cursor 與 JOB-003 一併完成)*
