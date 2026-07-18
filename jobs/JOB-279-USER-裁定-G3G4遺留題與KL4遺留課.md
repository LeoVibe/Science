*Created by USER at 2026-07-18*

`last_updated`: 2026-07-18
`updated_by`: Claude Code (claude-fable-5)

# JOB-279-USER-裁定-G3G4遺留題與KL4遺留課

**`job_type`**：`mixed`（子段A：`question_verify` 遺留題裁定與修正驗證；子段B：`docs_ops` 台帳記錄）
**`任務屬性`**：V 驗證（＋D 決策：三項處置由使用者裁定）
**`撰寫角色`**：檢查別人做的東西過不過關的審核者——這張單要回答：這些遺留主張通過檢驗了嗎？
定義與邊界見 **`docs/README_任務派工準則.md`** 第二章。

## 📌 任務背景

2026-07-18 全專案盤點後，G3/G4 範圍（使用者裁定：只做國語/自然/社會）殘留三組懸而未決事項：三下國語翰林 L10/L11 共 8 題 `pending` 待人工複核、三下自然康軒 L1 一題盲測歧義 `pending_review`、四下國語 KL4 考古題淬鍊 4 課連兩次 FAIL 遺留（本機存在未驗證的 `_new` 重做檔）。本單將證據整理呈使用者裁定後執行處置。

## 🎯 任務目標

1. 8 題 pending 與 1 題歧義題各有明確終局（上架／刪除／修正），不再掛 pending。
2. KL4 遺留 4 課的 `_new` 檔經 `verify_kl4.py` 驗證有明確結論（轉正或不轉正），處置經使用者裁定。
3. 異動範圍的 manifest／libraryStats／public 鏡像同步，進度彙整對齊。

## 🚧 任務邊界

本次任務只做：上列三組遺留的驗證、裁定呈報、依裁定執行處置與同步。
本次任務不做：修改規範文件；重做 KL4 淬鍊（若裁定要重做則另開單）；動三組遺留以外的任何題目。

## ✅ 啟動 Checklist (Pre-Flight)
- [x] 已讀取：pending 題現況（python 實掃）、JOB-263 verify_kl4.py、JOB-271/253 相關紀錄
- [x] 已確認前置素材：9 題完整題目內容與 review_notes、4 個 _new 檔存在
- [x] **已確認執行模型**：claude-fable-5（Claude Code session 內建，訂閱制）
- [x] **已確認使用金鑰**：不適用
- [x] **已確認操作頻次**：不適用
- [x] 目標品質：QL4（修正題）
- [x] 已閱讀「任務邊界」並確認本次範圍

## ✅ 驗收 Checklist (Acceptance)
- [x] 三項處置均有使用者裁定紀錄 — 2026-07-18 AskUserQuestion：①8 題直接刪除 ②歧義題修題幹＋正解後重盲測 ③KL4 接受維持 RM1
- [x] 8 題刪除後兩課題數仍 ≥30 — L10 31 題／L11 33 題，全數 is_publishable
- [x] 歧義題修正後單題盲測 MATCH — 修正後正解「必等結果」，盲測 MATCH（high confidence），康軒自然 L1 回到 50/50 上架
- [x] verify_kl4.py 對 4 個 _new 檔有明確輸出 — 全部 FAIL（虛構/未標註來源、空殼、未扣課文），不轉正
- [x] `git diff` 範圍核對 — 恰為 3 題庫檔＋2 manifest（另 SCI manifest 值無變化無 diff）；generate_library_stats 副作用 265 檔已全數還原

## ✅ 成果 Checklist (Deliverables)
- [x] 裁定與處置對照表填寫完畢 — 見 `jobs/JOB-279-Report.md`
- [x] 進度總表已同步（三下國語／自然列）
- [x] 已執行 `/pj_sync`
- [x] 產出 JOB-279-Report.md，異動清單已列出所有實際修改的檔案路徑

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:38,407（單題盲測 subagent；主迴圈無法取得填-） | 花費: -（訂閱制無單次計費） | 使用模型: claude-fable-5 | 執行者: Claude
