*Created by Claude Code (claude-opus-4-8) at 2026-06-14*

`last_updated`: 2026-06-14
`updated_by`: Claude Code (claude-opus-4-8)

# JOB-264-AG-五下-國語-KL4考古題淬煉

**`job_type`**：`research`（KL4 考古題與討論補實）
**`executor`**：Codex CLI gpt-5.5（訂閱制，禁用 API key）+ Claude Code 驗收
**`parent_jobs`**：JOB-263（四下國語 KL4 考古題淬煉，方法與 DoD 範本）

> ⚠️ **執行方法、DoD、考古題真實性規範完全同 JOB-263**，本單僅學期與素材路徑不同。必讀 `knowledge/README_研究架構總綱.md`。

---

## 📌 背景

五下國語 36課（翰林12+康軒12+南一12） 的 KL4「考古題與討論」檔為機械 bootstrap 空殼（平均 627 字、含「待補」、無真實考古題）。單課研究紀錄已 RM1，考古題與討論未達 RM2。需淬煉真實考古題達 RM2/RM3。

## 🎯 目標

五下國語 36課（翰林12+康軒12+南一12） 的考古題與討論檔補實，每課達 KL4 RM2 DoD（≥10 真題+≥2 來源+≥3000 字+誘答分析）。

## 📖 執行步驟（同 JOB-263）

每課 Codex 讀三素材 → 產出考古題與討論：
1. `KL4_五下_{版本}_L{N}_{課名}_單課研究紀錄.md`
2. `knowledge/1_課綱研究/國語/五下/KL3_五下_國語_研究總綱.md`
3. `knowledge/3_考古題/3_L2_結構化抽取/五下/五下_國語_L2_整合.md`

格式照三下範本（每課 ≥10 題+誘答分析+來源）。**Pilot 1 課經 Claude 驗收後批量。**

## ✅ DoD（同 JOB-263）

- [ ] 每課 ≥10 真實考古題+來源標註、誘答分析 ≥30 字/題
- [ ] ≥2 來源、每課 ≥3000 字、迷思討論 ≥2 條
- [ ] 無 bootstrap/待補殘留、達標標記
- [ ] 禁止自編題冒充真實（KP-01）

## ✅ 成果 Checklist

- [ ] 36課（翰林12+康軒12+南一12） 考古題與討論補實達 RM2
- [ ] `jobs/JOB-264-Report.md`
- [ ] /pj_sync + close + Discord

## 真實回報

＄作業匯總：Token數:- | 花費: 訂閱制無單次計費 | 使用模型: Codex gpt-5.5 訂閱制 | 執行者: AG
