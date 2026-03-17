# 跨課測驗分層抽樣與加權演算法 (JOB-057) - 完工報告

**完工時間**: 2026-03-11

## 📊 開發成果摘要
1. 實作了「分層比例抽樣」演算法於 `src/utils/quizSampler.ts`。
2. 將 `Index.tsx` 中進階挑戰的出題邏輯替換為呼叫 `stratifiedSample`。
3. 加入錯題與未做題目的權重排序，確保最需要複習的題目優先被挑出。

## 🛠️ 變更檔案清單
- `src/utils/quizSampler.ts` (NEW)
- `src/pages/Index.tsx` (Modified)

## 🎯 驗收狀態 (DoD checked)
- [x] `utils/quizSampler.ts` 完整實作
- [x] 成功整合至 `handleStartQuiz`
- [x] 歷史錯題加權與今日去重邏輯實作完成
