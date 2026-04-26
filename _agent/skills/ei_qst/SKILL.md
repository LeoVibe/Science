---
name: ei_qst
description: 題庫產出（CQI-P）— 觸發器，正文在 question/README_出題與品管準則.md
---

# ei_qst

**觸發**：出題、補題、擴充 `question/platform`，或 `/ei_qst`。

## 唯一權威

1. `question/README_出題與品管準則.md` — CQI-P、JSON 格式、品質指標
2. `question/README_驗證與盲測準則.md` — QL 標籤、盲測流程

## 硬閘

- [ ] KL3/KL4 研究素材已齊備（缺則先開 `job_type: research`，不硬產 JSON）
- [ ] 國語：KL4 單課含「課文全文錄製」，已對照 KL3 索引
- [ ] 模型與金鑰由使用者確認（免費 Key 優先，禁止自行指定）
- [ ] 產題後跑 `evaluate_question_quality.js` 確認 CQI-P ≥ 5.5

## 自主迴圈條款（G5S2 流水線啟用）

- 每課產題完即 git commit、寫一行至 `jobs/g5s2_results.tsv`
- 標準指令含 `--qpm 2 --conservative`（避免 JOB-184 API 限流卡住）
- CQI-P < 5.5 → retry ≤ 3，仍失敗則 manual_review；429 自動降頻、連 5 次 crash 停下
- KL4 雙檔缺 → 退件 Research agent，不就地補做
