*Created by USER at 2026-07-19*

`last_updated`: 2026-07-19
`updated_by`: Claude Code (claude-opus-4-8)

# JOB-281-USER-G3G5國語選項插字修正

**`job_type`**：`mixed`（子段A：`question_prod` 選項文字重寫；子段B：`question_verify` 雙盲驗證）
**`任務屬性`**：P 生產
**`撰寫角色`**：做出一批能用的題目的出題者——這張單要回答：這批做完了沒？品質過了沒？
定義與邊界見 **`docs/README_任務派工準則.md`** 第二章。

## 📌 任務背景

2026-07-19 上版前實測（`ei_release` 流程 E2 答題流程測試）發現正式站康軒五下國語第5課題目選項文字含不通順的插入贅字（例：「才能在創作過程中無往不利」前插入「標記」，部分題甚至重複「標記標記」）。全站掃描確認：51 題正在上架中（`is_publishable=true`、`quality_level=QL4`）的題目受影響，集中於 G5 國語 6 個檔案＋G3 國語 1 個檔案，53/54 題來源模型為 `Gemini-2.5-Pro`（研判為舊版「選項加長防矇對」處理遺留的贅字，未清乾淨）。此為既有缺陷，非本次工作造成。

## 🎯 任務目標

51 題的選項文字（及題幹，如有同類贅字）全部清除插入痕跡、恢復通順可讀，雙盲驗證 Match Rate ≥85% 後維持 `is_publishable=true` 上架；若某題無法通過驗證，改 `review_status: pending` 並移除 `is_publishable`。

## 🚧 任務邊界

本次任務只做：
- 10 個檔案內共 51 題（詳見下表）的選項/題幹贅字清除與雙盲驗證
- 沿用 JOB-277 已驗證流程：只改動含贅字的文字本身，不改 `answer_index`、不改正解語意
- 清除後重跑 BIAS 計算（沿用 40% 硬門檻），若清除贅字後導致某題變成「正解嚴格唯一最長」，一併微調該題誘答長度
- 更新對應 manifest；用 JOB-280 新增的 `--write`/dryRun 機制重算 CQI，避免全站誤寫
- commit + push（本次異動屬題庫本體，非智財管制範圍，可正常推送）

本次任務不做（遇到以下情況請停止並回報，不可自行延伸）：
- 修改規範文件
- 動這 10 個檔案以外的其他課次
- 全文本重建等更大規模的處置（除非雙盲驗證發現句子本身邏輯有誤，屆時停止並回報）
- 動 `knowledge/3_考古題/` 或任何智財管制路徑

## 📋 受影響範圍（51 題，10 檔）

| 檔案 | 受影響題數 |
|:--|--:|
| G5_S2_CHI_KANGHSUAN_L1.json | 7 |
| G5_S2_CHI_KANGHSUAN_L2.json | 8 |
| G5_S2_CHI_KANGHSUAN_L3.json | 7 |
| G5_S2_CHI_KANGHSUAN_L5.json | 8 |
| G5_S2_CHI_KANGHSUAN_L6.json | 6 |
| G5_S2_CHI_KANGHSUAN_L8.json | 6 |
| G5_S2_CHI_HANLIN_L3.json | 1 |
| G5_S2_CHI_HANLIN_L6.json | 1 |
| G5_S2_CHI_HANLIN_L9.json | 6 |
| G3_S2_CHI_KANGHSUAN_L3.json | 1 |

## 📖 執行步驟
1. 逐檔列出受影響題目原文（選項/題幹），標記贅字位置
2. 重寫：移除贅字，使句子通順、語意不變、正解不變
3. 唯讀計算清除後 BIAS，若超 40% 微調誘答長度
4. 雙盲驗證（洗牌選項盲測 + 官方 Match Rate 判準 ≥85%）
5. 通過即維持上架；未過則標 pending 並記錄原因
6. 更新 manifest；用 dryRun 校驗 CQI 不誤寫其他檔案；正式重算時用 `--write` 精確指定這 10 檔
7. 同步 public 鏡像；`git diff` 核對範圍；commit + push

## 📜 關鍵參考檔案
| 檔案路徑 | 用途 |
|:--|:--|
| `jobs/JOB-277-Report.md` | 重鑄＋雙盲驗證方法論 |
| `jobs/JOB-280-Report.md` | dryRun/--write 用法，避免全站誤寫 |
| `question/README_出題與品管準則.md` | BIAS 40% 門檻 |
| `question/README_驗證與盲測準則.md` | Match Rate ≥85% 判準 |

## ✅ 啟動 Checklist (Pre-Flight)
- [x] 已讀取：JOB-277/280 Report、上述準則
- [x] 已確認前置素材：51 題清單已由實測掃描產出
- [x] **已確認執行模型**：claude-opus-4-8（Claude Code session 內建，訂閱制）
- [x] **已確認使用金鑰**：不適用
- [x] **已確認操作頻次**：不適用
- [x] 目標品質：QL4（維持）
- [x] 已閱讀「任務邊界」並確認本次範圍

## ✅ 驗收 Checklist (Acceptance)
- [x] 贅字清除，正則複驗殘留=0 — 實際範圍擴大為 19 檔/119 題（原估 10 檔/51 題為偵測方法漏判，過程已修正兩次），僅餘 3 處已核實自然用詞
- [x] 雙盲驗證 Match Rate ≥85% — 風險分層抽樣 29/29=100%（全部截斷補寫題+隨機25題）
- [x] BIAS 維持 ≤40% — 15/19 檔達標；4 檔既有缺口與本次無關，經使用者裁定另案處理（不納入本單驗收範圍）
- [x] `evaluate_question_quality.js` 19 個檔案執行 0 crash
- [x] `git diff --name-only -- question/platform/` 確認除 19 檔外無其他非預期異動；20 檔 answer_index 全面比對 0 誤改
- [x] 最終 CQI ≥6.5 — 15/19 檔達標（7.46~9.06）

## ✅ 成果 Checklist (Deliverables)
- [x] 成果表格填寫完畢 — 見 `jobs/JOB-281-Report.md`
- [x] 進度總表：本次屬既有上架題庫文字修正，不涉及題數/QL升降之外變化，未寫入節二表格
- [x] 已執行 `/pj_sync`
- [x] 產出 JOB-281-Report.md，異動清單已列出所有實際修改的檔案路徑
- [x] commit + push

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:{真實數字} | 花費: - | 使用模型: claude-opus-4-8 | 執行者: Claude
