# JOB-200 Phase 3 加碼驗證報告

日期：2026-04-19

## 執行範圍

- 樣本檔：`apps/v3_eidos/tests/answer-integrity-extended.samples.json`
- 樣本總數：254
- 分布：
- G3 chi 66
- G3 sci 24
- G3 soc 34
- G4 chi 72
- G4 sci 24
- G4 soc 34

## 執行紀錄

1. 樣本檔行數確認：`wc -l apps/v3_eidos/tests/answer-integrity-extended.samples.json` = `2541`
2. 批次測試：

```bash
cd apps/v3_eidos && npx playwright test answer-integrity-extended --project=chromium --workers=4 --reporter=list 2>&1 | tee ../../logs/JOB-200-Phase3-ext-playwright.log
```

3. 批次結果：`253 passed / 1 failed (2.4m)`
4. FAIL 單題深度複驗：
- 啟動 `npm run dev`
- 真實 Chromium 開啟 `http://localhost:8080/g4/chi/s2/nani/review`
- 點擊「第12課 九蛙傳奇」
- 核對 `question/platform/G4/Chinese/S2/NanYi/G4_S2_CHI_NANYI_L12.json` 的 `questions[0]`

## 6 面向 PASS 小計

- D1 題幹文字：`254/254 PASS`
- D2 選項數量：`254/254 PASS`
- D3 選項順序：`254/254 PASS`
- D4 正解位置：`254/254 PASS`
- D5 解析：`254/254 PASS`
- D6 迷思診斷：`254/254 非 FAIL`

補充：
- 254 題樣本都有 `explanation`，因此 D5 全數有驗證基數。
- 253 題樣本有 `commonMisconception`；`ReviewView` 不強制顯示，依 spec 視為 `skip/non-fail`。
- 1 題樣本沒有 `commonMisconception`，D6 為 N/A。

## FAIL 題目逐項深度分析

### 1. `question/platform/G4/Chinese/S2/NanYi/G4_S2_CHI_NANYI_L12.json#1 ai=3`

- Playwright 批次失敗型態：`page.goto()` timeout
- 批次失敗訊息：導航到 `http://localhost:8080/g4/chi/s2/nani/review` 時，等待 `load` 超過 30 秒
- 分類：`reproducibility`

### 深度複驗結果

- URL：`http://localhost:8080/g4/chi/s2/nani/review`
- 課次：第 12 課 `九蛙傳奇`
- 題號：第 1 題
- JSON 題幹：`根據課文內容，蛙巫得到千年法力的條件是什麼？`
- JSON `answer_index`：`3`
- JSON 正解文字：`牠必須願意守護湖裡的蛙族`
- JSON `explanation`：存在
- JSON `commonMisconception`：存在

### 真實 Chromium 驗證

- 導頁成功：`goto(domcontentloaded)` 約 `1365ms`
- 實際請求成功：
- `GET /g4/chi/s2/nani/review` → `200`
- `GET /question/platform/G4/Chinese/S2/NanYi/G4_S2_CHI_NANYI_L12.json` → `200`
- D1：UI card 含題幹前 30 字，PASS
- D2：UI 有 4 個選項 row，PASS
- D3：UI 四個選項順序與 JSON `options[0..3]` 一致，PASS
- D4：綠框在第 4 個選項，對應 `answer_index = 3`，PASS
- D5：UI 顯示 `💡 文中明確提到...`，PASS
- D6：UI 未顯示 `commonMisconception`，依 spec 視為 `skip/non-fail`

### 判定

- 這不是 `data_bug`
- 這不是 `ui_display`
- 這不是 `loader_bug`
- 這是批次並行跑測時的單次導頁逾時，單題重跑通過，分類為 `reproducibility`

### 支持證據

- Playwright error-context snapshot 已顯示頁面 DOM 存在，代表頁面在 timeout 前其實已進入可見狀態，只是 `page.goto()` 等待 `load` 完成未在 30 秒內結束。
- 相同測項以單題重跑：

```bash
npx playwright test tests/answer-integrity-extended.spec.ts --project=chromium --workers=1 -g 'question/platform/G4/Chinese/S2/NanYi/G4_S2_CHI_NANYI_L12.json#1 ai=3' --reporter=list
```

結果：`1 passed (2.5s)`

## 遺留問題

- 目前唯一失敗不是資料或 UI 對應錯誤，而是 `page.goto()` 在 4 workers 批次模式下出現單次 timeout。
- `answer-integrity-extended.spec.ts` 使用 `await page.goto(url);`，預設等待 `load`。若後續想降低這類非功能性誤報，可考慮在未來改用較穩定的等待條件，例如 `domcontentloaded` 或導頁後改以關鍵 UI ready 狀態為主。但本次依禁止事項，未修改任何原始碼。
- `ReviewView` 仍未呈現 `commonMisconception`；依本 JOB 定義屬 D6 `skip/non-fail`，不是 blocking issue。

## 結論

- 254 題已全部完成真實瀏覽器驗證。
- 功能面 D1-D5 全數通過，未發現資料錯誤、選項順序錯位、正解綠框錯位或 explanation 斷鏈。
- 唯一批次 FAIL 經深度複驗後確認為 `reproducibility`，不是內容正確性問題。
