*Created by {AG|USER} at {YYYY-MM-DD HH:mm}*

`last_updated`: {YYYY-MM-DD HH:mm}
`updated_by`: {Agent名} ({模型名})

# JOB-XXX-{ORIGIN}-{科目}{年級版本}-出題

**`job_type`**: `question_prod`  
**`executor`**: {AG|Cursor}

## 📌 任務背景
[為什麼出這批題目：新學期題庫 / 補強 / 特定課次缺漏]

## 🎯 任務目標
完成 {科目} {年級下學期} {版本} L{N} 共 {X} 題，達到 CQI-P ≥ 5.5 且含 scenario + explanation。

## 🚧 任務邊界

本次任務只做：
- 依 R4 發展綱要產出指定課次 JSON 題庫
- 執行 CQI-P（`scripts/evaluate_question_quality.js`）達標確認
- 更新 `manifest.json`

本次任務不做：
- 盲測驗證（另開 `question_verify` JOB）
- 修改 R3/R4 素材（除非發現明確錯誤並另報）
- 修改任何規範文件

## 📖 執行步驟
1. 讀取 `knowledge/{grade}/{subject}/{publisher}/R4-綱要.md`
2. 依 2-4-4 認知配比（記憶：理解：應用）出題
3. 逐題填入 `scenario`、`explanation`、`commonMisconception`
4. 執行 CQI-P：`node scripts/evaluate_question_quality.js {path}`
5. 修正 CQI-P < 5.5 的題目，直到全課次達標
6. 更新 `manifest.json`

## 📜 關鍵參考檔案
| 檔案路徑 | 用途 |
|:--|:--|
| `question/README_出題與品管準則.md` | 出題原則、JSON 格式規範 |
| `knowledge/{grade}/{subject}/{publisher}/R4-綱要.md` | 本次出題素材來源 |
| `_agent/API_RULES.md` | 出題 API 成本控制 |
| `_agent/skills/ei_qst/SKILL.md` | 出題 Skill 完整流程 |

## ✅ 啟動 Checklist (Pre-Flight)
- [ ] 已讀取 `question/README_出題與品管準則.md`
- [ ] R4 發展綱要已存在，路徑確認：`{填入路徑}`
- [ ] **已確認執行模型**：[模型：___________]（⚠️ 啟動前必須詢問使用者並填入）
- [ ] **已確認使用金鑰**：[金鑰：___________]
- [ ] **已確認 QPM**：[QPM：___________]
- [ ] 目標題數已確認：{課次} × {每課題數} = {總題數} 題

## ✅ 驗收 Checklist (Acceptance)
- [ ] CQI-P ≥ 5.5（每課次均達標）— 實際值：{填入各課次數值}
- [ ] 每題含 `scenario` 欄位（不為空）
- [ ] 每題含 `explanation` 欄位（正確說明為何選此答案）
- [ ] 每題含 `commonMisconception` 欄位（說明常見錯誤）
- [ ] `answer_index` 與 `explanation` 描述一致（防止系統性 answer_index 錯誤）
- [ ] `manifest.json` 已更新題數

## ✅ 成果 Checklist (Deliverables)
- [ ] 成果表格填寫完畢（中文課名 / 真實模型 / 執行日期）
- [ ] 進度總表 `docs/進度彙整_題庫研發與產出.md` 已更新 CQI-P 欄
- [ ] 已執行 `/pj_sync`
- [ ] 產出 JOB-XXX-Report.md，異動清單已列所有修改的 JSON 路徑

## ⏱️ 執行時間回報
| 子任務 / 階段 | 開始時間 | 結束時間 | 耗時（分鐘） | 備註 |
|:--|:--|:--|:--|:--|
| 出題 | HH:mm | HH:mm | - | |
| CQI-P + 修正 | HH:mm | HH:mm | - | |
| **總計** | — | — | **-** | — |

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:{真實Meta中數字} | 花費: ${換算台幣} | 使用模型: {真實Meta中的模型代碼} | 執行者: {AG|Cursor|Claude}
