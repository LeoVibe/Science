# JOB-254 Report：三下國語隱形課修復與上版

`last_updated`: 2026-06-14
`updated_by`: Claude Code (claude-opus-4-8)

---

## 1. 任務摘要

| 欄位 | 內容 |
|:--|:--|
| JOB | JOB-254（job_type: question_verify）|
| 起因 | 使用者回報三下國語「行人的守護者」在正式站不見了 |
| 執行者 | Claude subagent 盲測 + claude-opus-4-8 驗收/上版 |
| 金鑰 | 訂閱制，未用任何 API key |
| 完成 | 2026-06-14 |

---

## 2. 問題診斷

使用者報「行人的守護者」消失。查證：
- 該課（翰林 L8）在 manifest+檔案**都存在**，非檔案遺失
- 但 30 題 `is_publishable=false`、`review_status=pending_review` → 前台過濾後整課隱形
- 掃描三下國語三版本，發現**共 3 課隱形**：

| 版本 | 課 | 課名 | 原狀態 |
|:--|:--|:--|:--|
| 翰林 | L8 | 行人的守護者 | 30 題盲測過、可上架 0 |
| 康軒 | L4 | 工匠之祖 | 30 題盲測過、可上架 0 |
| 康軒 | L6 | 神奇密碼 | 29 題盲測過、可上架 0 |

**根因**：JOB-165 國語盲測時這 3 課被標 `pending_review`，後續 triage 未回寫 `is_publishable`，整課卡住隱形。題目品質其實良好（QL4、CQI 8.75）。

---

## 3. 修復

Claude subagent 重新盲測 3 課（出題 vs 盲測不同 agent，符合雙盲）：

| 課 | Match Rate | 上架 |
|:--|:--|:--|
| 翰林 L8 | 30/30 (100%) | 30 |
| 康軒 L4 | 29/30 (97%) | 29 |
| 康軒 L6 | 29/29 (100%) | 29 |

- 證實答案正確（當初誤標待審），Match 題回寫 `is_publishable=true`、`review_status=confirmed`
- 康軒 L4-id26（魯班請鐵匠原因：[0]專業技術 vs [2]手受傷）依課文情節判定，保守標 pending_review，待人工確認課文（不影響該課 29/30 上架）
- source+public 同步，validate 0 error
- push d1964c79（postBuffer 已設，秒成）

---

## 4. 異動清單

- `question/platform/G3/Chinese/S2/HanLin/G3_S2_CHI_HANLIN_L8.json`
- `question/platform/G3/Chinese/S2/KangHsuan/G3_S2_CHI_KANGHSUAN_L4.json`、`L6.json`
- 對應 public 副本 3 檔
- `scripts/jobs/JOB-254/_blind/`（盲測題本+答案）

---

## 5. 結案 Checklist

- [x] README_專案發展紀錄已觸發 /pj_sync（JOB-254 記錄新增）
- [x] /pj_sync 已執行

---

## 6. 遺留問題

1. 康軒 L4-id26 待人工看課文確認正解
2. **建議全站健檢**：其他年級/科目可能也有 JOB-165 類「盲測過但 is_publishable=0」隱形課，已啟動三下/四下三科掃描

---

## 7. 模型與成本

＄作業匯總：Token數:- | 花費: 訂閱制無單次計費 | 使用模型: 盲測/驗收 claude-opus-4-8 | 執行者: AG
