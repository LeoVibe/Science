# JOB-132 結案報告：翰林三下 L5《茶鄉鹿谷》課文回寫與題庫整檔重撰

`last_updated`: 2026-03-30 12:00  
`updated_by`: Cursor Agent  

> **編號說明**：本報告原檔名為 `JOB-104-G3-HanLin-L5-…-Report.md`，與 **`JOB-104-PLAN-*`（數學）** 同號重複；已改編 **JOB-132**。執行內容與結案事實不變。  
> **派工單**：`jobs/JOB-132-AG-G3-HanLin-L5-茶鄉鹿谷-課文與題庫重撰.md`

## 背景

- 原部落格／摘錄來源與教材正文不一致；使用者提供《茶鄉鹿谷》（王郁軒）全文作為單一證據。
- `G3_S2_CHI_HANLIN_L5.json` 曾與課文嚴重脫節（錯套他課內容），本次 **30 題全數重寫**。

## 完成項目

| 項目 | 說明 |
|:---|:---|
| KL4 單課 | `knowledge/.../KL4_三下_翰林_L5_茶香鹿谷_單課研究紀錄.md` — RC-01 全文錄製、結構與字詞表對齊新文 |
| KL4 考古 | `knowledge/.../KL4_三下_翰林_L5_茶香鹿谷_考古題與討論.md` — 條件／五階工序／課名案例更新 |
| KL3 索引 | `KL3_國語_研究進度_課文與索引.md` — L05 表列與錨點改為《茶鄉鹿谷》並移除舊摘錄 |
| 素材庫 | `KL4_三下_國語_原始研究素材庫.md` — 翰林 L5 一行說明更新 |
| 題庫 | `question/.../G3_S2_CHI_HANLIN_L5.json` — 30 題；`blind_evaluation: false`；正解位置已輪替避免 BIAS |
| manifest | `G3_S2_CHI_HANLIN_manifest.json` — L5 `title`／`theme`／`avg_cqi` 同步 |

## 品質腳本

- 已執行 `node` 載入 `scripts/evaluate_question_quality.js` 之 `evaluateFile`：**avgCqi 5.28**、檔級 **QL1**（腳本對「三年級下學期」發展綱要路徑判定為找不到，屬既有限制）、無答案位置 BIAS。

## 待辦（建議）

- 依 `question/README_驗證與盲測準則.md` **重跑盲測**，通過後再設 `blind_evaluation: true` 並補 `verifying_*`。
- 可選：跑 `evaluate_question_quality.js` 全目錄掃描以更新其他 manifest 聚合（本次僅手改 L5 一筆）。
