*Created by AG at 2026-03-07 23:05*

# JOB-057-USER-Stratified-Quiz-Algorithm

## 📌 任務背景

目前「跨課測驗」的出題邏輯為**純隨機**（`shuffle` 全部題目後取前 N 題），
無法保證：

1. 每一課都被測驗到（可能某課完全沒出題）
2. 弱點題目被優先複習
3. 同一天內相同題目不重複

本任務旨在實作**分層比例抽樣 + 錯題加權**的期末最佳化演算法，
讓「跨課測驗」的出題符合**國小學習最佳化**的教育理論。

---

## 🧠 演算法設計（分層比例抽樣 + 錯題加權）

### 核心原則

> 每課都照題庫比例出題，確保沒有課被遺漏；
> 在各課的配額內，優先抽「歷史答錯次數最多」的題目。

### 演算法步驟

```
Step 1：計算各課的題目配額（分層比例）
  - 取得所有課程及各課的有效題目數
  - 配額 = Math.round(totalCount * (courseTotalQ / allTotalQ))
  - 確保每課至少分到 1 題（未達 1 題的課補足為 1）
  - 若配額總和 > N，從最大課按比例縮減

Step 2：各課配額內優先選「錯題」
  - 從 answerHistory 讀取各題的答對/答錯記錄
  - 對各課題目計算「錯誤率 = 錯誤次數 / 總作答次數」
  - 排序：先選「錯誤率 > 0 且從未答對」的題 → 再選「錯誤率 > 0」的題 → 最後隨機選

Step 3：防重複（當日去重）
  - 讀取 sessionStorage 中「今日已出現的題目 ID」
  - 優先選未出現過的題目
  - 若庫存不足，才允許重複

Step 4：隨機洗牌輸出
  - 將所有課選出的題目合併，再次洗牌避免各課題目連續出現
```

### 示意圖

```
題庫：第1課20題、第2課30題、第3課15題（共65題），測驗30題

配額分配：
  第1課 → 9題（20/65 × 30 ≈ 9）
  第2課 → 14題（30/65 × 30 ≈ 14）
  第3課 → 7題（15/65 × 30 ≈ 7）

各課內部選題順序：
  [錯誤未答對] → [曾錯過] → [未作答過] → [全答對]
```

---

## 📖 任務詳情

### 1. 建立演算法函式 `utils/quizSampler.ts`

```typescript
export function stratifiedSample(
  allQuestions: Question[],
  categories: string[],
  totalCount: number,
  answerHistory: AnswerHistory,  // 現有的 storage 結構
  sessionToday?: Set<string>     // 今日已出題 ID
): Question[]
```

### 2. 修改 `pages/Index.tsx` 的 `handleStartQuiz`

- 當 `type === '進階挑戰'` 時，呼叫 `stratifiedSample` 取代現有的純隨機邏輯
- 基本挑戰（15題）維持現有邏輯（保持簡單快速）

### 3. 建立 `sessionStorage` 的「今日出題紀錄」

- Key: `QUIZ_TODAY_${grade}_${subject}_${semester}_${publisher}_${date}`
- 每次測驗結束後更新
- 隔日自動清除（date 不同即清除）

### 4. 錯誤率計算

使用現有 `AnswerHistory` 資料結構；每題錯誤率計算公式：

```
errorRate = wrongCount / (rightCount + wrongCount)
priority = errorRate > 0 ? (1 + errorRate) : 0  // 答對過的題 priority = 0
```

---

## 🗂️ 修改檔案清單

| 檔案 | 修改類型 |
|------|---------|
| `src/utils/quizSampler.ts` | 【NEW】新增分層抽樣演算法 |
| `src/pages/Index.tsx` | 修改 `handleStartQuiz` 使用新演算法 |
| `src/utils/storage.ts` | 新增今日出題紀錄的讀寫函式 |

---

## 📜 關鍵參考

| 參考 | 說明 |
|------|------|
| `src/utils/storage.ts` → `AnswerHistory` | 現有答題紀錄結構，需理解欄位後設計加權 |
| `src/pages/Index.tsx` → `handleStartQuiz` | 現有出題入口，需在此接入新演算法 |
| `src/components/MainMenu.tsx` → `activeCats` | 已實作的「選課範圍篩選」，演算法需相容此參數 |

---

## ✅ 驗收標準 (DoD)

- [ ] `utils/quizSampler.ts` 完整實作，可獨立 unit test
- [ ] 單元測試：給定3課、各不同題數，驗證比例分配正確
- [ ] 單元測試：有 errorRate 資料時，驗證錯題優先被選中
- [ ] 整合至 `handleStartQuiz`（進階挑戰模式）
- [ ] 選課範圍（`activeCats`）功能可正確套用至演算法
- [ ] 今日出題紀錄正常寫入/讀取/隔日清除
- [ ] 產出完工報告 `JOB-057-Report.md`
