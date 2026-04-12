*Created by {AG|USER} at {YYYY-MM-DD HH:mm}*

`last_updated`: {YYYY-MM-DD HH:mm}
`updated_by`: {Agent名} ({模型名})

# JOB-XXX-{ORIGIN}-{動詞}-{對象}-{範圍}

## 📌 任務背景
[為什麼要做這項任務]

## 🎯 任務目標
[完成後要達到什麼狀態]

## 📖 執行步驟
1. [具體步驟一]
2. [具體步驟二]

## 📜 關鍵參考檔案
| 檔案路徑 | 用途 |
|:--|:--|
| `question/README_出題與品管準則.md` | 出題原則 |
| `question/README_驗證與盲測準則.md` | 驗證原則 |

## ✅ 啟動 Checklist (Pre-Flight)
- [ ] 已讀取：{列出必讀文件路徑}
- [ ] 已確認前置素材 KL3/KL4 存在
- [ ] **已確認執行模型**：[模型：___________] (⚠️ 啟動前必須詢問使用者並填入，嚴禁自動執行)
- [ ] **已確認使用金鑰**：[金鑰：___________] (例: Yotta / Miaw)
- [ ] **已確認操作頻次**：[QPM：___________] (例: 1 QPM / 10 QPM)
- [ ] 目標品質：QL4

## ✅ 驗收 Checklist (Acceptance)
- [ ] CQI-P ≥ 5.5
- [ ] CQI-V Match Rate ≥ 85%
- [ ] 最終 CQI ≥ 6.5
- [ ] 內容含 scenario + explanation

## ✅ 成果 Checklist (Deliverables)
- [ ] 成果表格填寫完畢
- [ ] 進度總表已同步（`docs/進度彙整_題庫研發與產出.md`）
- [ ] 已執行 `/pj_sync`
- [ ] 產出 JOB-XXX-Report.md

## 真實回報本次對話的模型與花費
＄作業匯總 ：Token數:{真實Meta中數字} | 花費: ${換算台幣} | 使用模型: {真實Meta中的模型代碼} | 執行者: {AG|Cursor|Claude}