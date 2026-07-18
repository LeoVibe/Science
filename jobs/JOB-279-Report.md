*Created by Claude at 2026-07-18*

`last_updated`: 2026-07-18
`updated_by`: Claude Code (claude-fable-5)

# JOB-279 結案報告

**`job_type`**：`mixed`（question_verify 遺留題裁定與修正驗證 + docs_ops 台帳記錄）
**`executor`**：Claude

## 📊 成果摘要

G3/G4 三組遺留事項全數收斂。證據整理後由使用者於 2026-07-18 裁定，依裁定執行：

| 遺留事項 | 實測證據 | 使用者裁定 | 執行結果 |
|:--|:--|:--|:--|
| 三下國語翰林 L10《飛行員和小王子》4 題＋L11《畫龍點睛》4 題 pending | 8 題全為**文本錯位**廢題（L10 考「聆聽自然」與劇本課文無關；L11 考《巨人的花園》情節與本課無關，其中 1 題題幹破損含英文殘字） | 直接刪除 | 8 題刪除（備份 `jobs/_goal-work/JOB279/removed_8_mismatched.json`），L10 定案 31 題／L11 定案 33 題全上架，翰林三下國語 404/404 收斂 |
| 三下自然康軒 L1 idx32 盲測歧義題 | 題幹「這可修正哪種想法？」語意歧義：標記正解為『正確想法（葉菜可採）』，自然語感應選『被修正的錯誤想法（必等結果）』，盲測者因此 Mismatch | 修題幹＋正解後重盲測 | 題幹明確化為考「錯誤想法」、正解改「必等結果」、explanation 同步改寫；單題盲測 **MATCH（high confidence）**；`review_status=confirmed`、上架，康軒 L1 回到 50/50 |
| 四下國語 KL4 淬鍊遺留 4 課（翰林L3/L7、南一L2/L5）的本機 `_new` 重做檔 | `verify_kl4.py` 全部 **FAIL**（疑似虛構/未標註來源、bootstrap 空殼殘留、題目未扣課文），與 JOB-263「連 2 次 FAIL」紀錄一致 | 接受維持 RM1（現行題庫 36/36 課 QL4 不受影響，僅研究資產完備性缺口） | 不轉正；4 個 FAIL 草稿移入 `knowledge/1_課綱研究/國語/四下/_failed_drafts/` 本機隔離（KL4 考古檔屬 gitignore 範圍），台帳記錄於此 |

## 📂 異動清單

| 檔案路徑 | 異動類型 | 說明 |
|:--|:--|:--|
| `question/platform/G3/Chinese/S2/HanLin/G3_S2_CHI_HANLIN_L10.json` | 修改 | 刪 4 題錯位廢題，35→31 題（全上架），avgCqi 8.80 |
| `question/platform/G3/Chinese/S2/HanLin/G3_S2_CHI_HANLIN_L11.json` | 修改 | 刪 4 題錯位廢題，37→33 題（全上架），avgCqi 9.07 |
| `question/platform/G3/Chinese/S2/HanLin/G3_S2_CHI_HANLIN_manifest.json` | 修改 | L10/L11 count/blind_tested/avg_cqi/quality 校正（原 29/29 過期值 → 31/33、QL4） |
| `question/platform/G3/Science/S2/KangHsuan/G3_S2_SCI_KANGHSUAN_L1.json` | 修改 | idx32 題幹/正解/explanation 修正＋定案上架（50/50），avgCqi 9.20 |
| `apps/v3_eidos/public/question/platform/`（對應檔） | 同步 | `sync_v3_public_questions.mjs` |
| `apps/v3_eidos/{public,src}/data/libraryStats.json` | 重產 | 翰林三下國語 404/404 cqi 9.09、康軒三下自然 200/200 |
| `knowledge/1_課綱研究/國語/四下/_failed_drafts/`（4 檔） | 本機搬移 | FAIL 草稿隔離，避免再被誤認為可用重做檔 |
| `docs/進度彙整_題庫研發與產出.md` | 修改 | 三下國語/自然列數字與 JOB-279 處置補記 |
| `jobs/_goal-work/JOB279/*` | 新增 | 裁定材料、刪題備份、修正前後對照、單題盲測集/答案 |

## ⚠️ 遺留問題

1. **四下國語 KL4 淬鍊 4 課維持 RM1**（使用者裁定接受）：未來若重出四下國語題目，這 4 課（翰林 石虎兄妹/棒球英雄夢、南一 看戲/活出生命奇蹟）缺考古題參考素材，屆時需先補做淬鍊（照 JOB-263 標準）。
2. `evaluateFile()` 寫回副作用第 5 次觸發（本次 265 檔，已還原）。dryRun 修正的 engineering JOB 仍未開——**5 個 JOB 連續踩雷，建議列為下一張 engineering 單**。

## ✅ 成果 Checklist (Deliverables)
- [x] 裁定與處置對照表填寫完畢
- [x] 進度總表已同步（`docs/進度彙整_題庫研發與產出.md` 三下國語/自然列）
- [x] 已執行 `/pj_sync` 全域知識沉澱（2026-07-18，進度彙整＋專案發展紀錄）
- [x] 產出 JOB-279-Report.md，異動清單已列出所有實際修改的檔案路徑

## 🔍 驗收確認
| 欄位 | 內容 |
|:--|:--|
| 驗收者 | Claude Code（PM）＋使用者（三項裁定本人做成） |
| 驗收時間 | 2026-07-18 |
| 驗收結果 | 通過（佐證：刪題後兩課題數 31/33 實掃；單題盲測由獨立 subagent 對洗牌選項作答 MATCH；libraryStats 重產後翰林 404/404、康軒自然 200/200） |
| 退回原因 | 無 |

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:38,407（單題盲測 subagent；主迴圈無法取得填-） | 花費: -（Claude Code session 訂閱額度內） | 使用模型: claude-fable-5 | 執行者: Claude
