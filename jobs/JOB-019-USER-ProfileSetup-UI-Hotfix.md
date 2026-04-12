*Created by Cursor at 2026-02-26 20:25*  
*Last Updated at 2026-02-26 20:25 (Cursor: 依 JOB-019-020 計畫建立正式派工單)*

# JOB-019：ProfileSetup UI 與 G3 國語翰林載入 Hotfix

## 任務背景

目前有三個直接影響使用者體驗與可用性的問題需要優先修復：

1. `學習與使用設定` 中清除紀錄區塊仍顯示冗長說明文案。  
2. 各科清除按鈕為單欄長列表，版面過長。  
3. 三年級國語下學期（翰林版）題庫載入失敗，前台顯示 JSON parse error（`Unexpected token '<'`）。

此工單定位為「立即可上線的 hotfix」，先處理使用者可見問題與資料映射錯誤。

## 任務詳情

1. 調整設定頁文案與版面（`ProfileSetup.tsx`）
   - 移除清除學習紀錄區塊中的文案：  
     `僅清除本機顯示的紀錄（三年級），後台統計不受影響。`
   - 將各科清除按鈕改為雙欄排列（兩排/多排 grid），縮短垂直高度。
   - 維持既有確認流程與清除邏輯，不變更功能語意。

2. 修正 G3 國語 S2 翰林 manifest 映射
   - 檢查並修正 `question/platform/G3/Chinese/S2/HanLin/manifest.json` 中錯誤檔名。
   - 目前已知錯誤映射：
     - `QL3_用膝蓋跳舞的女孩.json` 應改為 `Chi_QL3.json`
     - `L6_月世界.json` 應改為 `Chi_L6.json`
   - 確保前台路徑 `/g3/chi/s2/hlm` 可成功載入。

3. 驗證與回歸
   - 前台手動驗證設定頁排版與文案。
   - 前台手動驗證 G3 國語翰林載入成功，不再出現 parse error。
   - 執行 `apps/v3_eidos` 的測試與建置確認未回歸。

## 關鍵參考檔案

| 路徑 | 用途 |
|---|---|
| `apps/v3_eidos/src/components/ProfileSetup.tsx` | 設定頁 UI、清除區塊版面與文案 |
| `question/platform/G3/Chinese/S2/HanLin/manifest.json` | 翰林題庫單元與檔名映射 |
| `apps/v3_eidos/src/data/questionLoader.ts` | 題庫載入邏輯（必要時僅做訊息排查，不做大改） |
| `docs/網站功能規格書.md` | UI 規格唯一真理，確認版面調整不違規 |
| `docs/前端開發與AI實作守則.md` | 禁止硬編碼與 UI 修改 SOP |

## 執行規範

- 協作流程依 `.agent/workflows/webdev.md`。
- 僅修改本工單影響範圍檔案，不擴散至無關模組。
- 不得新增一次性根目錄除錯檔案。
- 若調整 UI 行為超出既有規格，需同步更新 `docs/網站功能規格書.md`。

## 驗證基準 (DoD)

- [ ] `ProfileSetup` 清除區塊已移除指定文案。  
- [ ] 各科清除操作為雙欄（grid）排版，頁面高度顯著縮短。  
- [ ] `/g3/chi/s2/hlm` 不再出現 `Unexpected token '<'`，題庫可正常載入。  
- [ ] `npm run test`（於 `apps/v3_eidos`）通過。  
- [ ] `npm run build`（於 `apps/v3_eidos`）通過。  
- [ ] 產出 `jobs/JOB-019-Report.md`，包含變更檔案、測試結果、驗收步驟。  

