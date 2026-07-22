*Created by USER at 2026-07-22*

`last_updated`: 2026-07-22
`updated_by`: Claude Code (claude-opus-4-8)

# JOB-282-USER-G5國語4課BIAS重鑄

**`job_type`**：`mixed`（子段A：`question_prod` 誘答重鑄；子段B：`question_verify` 雙盲驗證）
**`任務屬性`**：P 生產
**`撰寫角色`**：做出一批能用的題目的出題者——這張單要回答：這批做完了沒？品質過了沒？
定義與邊界見 **`docs/README_任務派工準則.md`** 第二章。

## 📌 任務背景

JOB-281（2026-07-19）過程中發現 4 課（G5 康軒 L1、翰林 L2/L4/L6）「正解嚴格唯一最長」比例 42.1%~58.8%，超過 40% 硬門檻，成因是正解本身結構性偏長（與 JOB-281 處理的插字問題無關）。這 4 課由 JOB-178（2026-04-12）僅憑盲測 Match Rate＋CQI 自動結案，當時尚無 BIAS 門檻規則（該規則由 JOB-272 引入）。2026-07-22 重新核實現況與 JOB-281 發現時一致。

## 🎯 任務目標

4 課共 106 題誘答加長，BIAS 全數降至 ≤40%；雙盲驗證 Match Rate ≥85% 後維持 `is_publishable=true` 上架。

## 🚧 任務邊界

本次任務只做：
- 4 個檔案內共 106 題（詳見下表）的誘答文字加長與雙盲驗證
- 沿用 JOB-277 已驗證流程：只加長誘答文字，不改 `answer_index`、不改正解語意
- 更新對應 manifest；用 JOB-280 新增的 `--write`/dryRun 機制重算 CQI，避免全站誤寫

本次任務不做（遇到以下情況請停止並回報，不可自行延伸）：
- 修改規範文件
- 動這 4 個檔案以外的其他課次
- 改動正解文字（除非驗證發現正解本身有內容缺陷，屆時停止並回報，不可自行擴大範圍重出）

## 📋 範圍（4 檔，106 題）

| 課次 | BIAS現況 | 題數 |
|:--|--:|--:|
| G5_S2_CHI_KANGHSUAN_L1.json | 42.1%（16/38） | 16 |
| G5_S2_CHI_HANLIN_L2.json | 50.8%（30/59） | 30 |
| G5_S2_CHI_HANLIN_L4.json | 55.6%（30/54） | 30 |
| G5_S2_CHI_HANLIN_L6.json | 58.8%（30/51） | 30 |

## 📖 執行步驟
1. 逐檔列出 BIAS 目標題目清單（唯讀計算）
2. 重鑄：只加長誘答文字使不再是「正解嚴格唯一最長」，不改正解
3. 唯讀複驗全課 BIAS ≤40%
4. 雙盲驗證（洗牌選項盲測 + 官方 Match Rate 判準 ≥85%）
5. 通過即維持上架；未過則標 pending 並記錄原因
6. 更新 manifest；用 `--write` 精確指定這 4 檔重算 CQI
7. 同步 public 鏡像；`git diff` 核對範圍；commit + push

## 📜 關鍵參考檔案
| 檔案路徑 | 用途 |
|:--|:--|
| `jobs/JOB-277-Report.md` | 重鑄＋雙盲驗證方法論（今日稍早已驗證） |
| `jobs/JOB-280-Report.md` | dryRun/--write 用法，避免全站誤寫 |
| `jobs/JOB-281-Report.md` | 本次 BIAS 缺口的發現紀錄 |
| `question/README_出題與品管準則.md` | BIAS 40% 門檻 |
| `question/README_驗證與盲測準則.md` | Match Rate ≥85% 判準 |

## ✅ 啟動 Checklist (Pre-Flight)
- [x] 已讀取：JOB-277/280/281 Report、上述準則
- [x] 已確認前置素材：106 題清單已由唯讀腳本重新核實（2026-07-22，與 JOB-281 發現一致）
- [x] **已確認執行模型**：claude-opus-4-8（Claude Code session 內建，訂閱制）
- [x] **已確認使用金鑰**：不適用
- [x] **已確認操作頻次**：不適用
- [x] 目標品質：QL4
- [x] 已閱讀「任務邊界」並確認本次範圍

## ✅ 驗收 Checklist (Acceptance)
- [x] 4 課 BIAS 全數 ≤40% — 實際全數 0.0%（42.1%/50.8%/55.6%/58.8% → 0.0%，PM 獨立複驗，非採信 agent 自報）
- [x] 雙盲驗證 Match Rate ≥85% — 105/106=99.1%（每課個別皆≥93.8%，1題未命中經核實為盲測格式限制非題目缺陷，同JOB-276先例）
- [x] `evaluate_question_quality.js` 4 個檔案執行 0 crash — 4/4 成功，quality 全 QL4
- [x] `git diff --name-only -- question/platform/` 確認除這 4 檔外無其他非預期異動 — 精確4檔
- [x] 最終 CQI ≥6.5 — 8.48~8.90

## ✅ 成果 Checklist (Deliverables)
- [x] 成果表格填寫完畢 — 見 `jobs/JOB-282-Report.md`
- [x] 進度總表：本次屬既有上架題庫BIAS修正，QL維持不變（原QL1 BIAS實為系統顯示異常，修正後正式登記QL4），暫不寫入節二表格
- [x] 已執行 `/pj_sync`
- [x] 產出 JOB-282-Report.md，異動清單已列出所有實際修改的檔案路徑
- [x] commit + push

## ⚠️ 範圍外重大發現（需另案處理，詳見 Report）
judge 覆核意外揭露：3/4 檔（翰林L2/L4/L6，共87/90題）的題目內容與實際課文完全無關（測驗捏造情節），規模達JOB-273等級，非本單BIAS調整可修復。已停止擴大範圍，如實記入 Report 呈報使用者。

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:{真實數字} | 花費: - | 使用模型: claude-opus-4-8 | 執行者: Claude
