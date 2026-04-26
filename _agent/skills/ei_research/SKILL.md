---
name: ei_research
description: 課綱與單課研究（KL3/KL4）— 觸發器，正文在 knowledge/README_研究架構總綱.md
---

# ei_research

**觸發**：新學期/版本課程研究、單課文本整理，或 `/ei_research`。

## 唯一權威

`knowledge/README_研究架構總綱.md` — 執行前必讀全文。
國語索引：`knowledge/1_課綱研究/國語/KL3_國語_研究進度_課文與索引.md`。

## 硬閘

- [ ] 已讀取研究架構總綱當前版本
- [ ] 本階段只做 KL3/KL4 研究素材，不寫出題 prompt、不定 JSON 題型
- [ ] KL4 單課須含「課文全文錄製」（RC-01），否則 ei_qst 無法抽取

## 自主迴圈條款（autoresearch 風格，G5S2 流水線啟用）

- 每課完成 KL4 雙檔即 git commit、寫一行至 `jobs/g5s2_results.tsv`
- 考古題 < 10 或來源 < 2 → 標 β+ 並降 QL 上限至 QL3，繼續推進
- KL4 完全缺檔或連 3 課 crash → 停下等 PM；其餘狀況 NEVER STOP 直到範圍內全綠
