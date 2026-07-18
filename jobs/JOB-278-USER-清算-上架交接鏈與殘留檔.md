*Created by USER at 2026-07-18*

`last_updated`: 2026-07-18
`updated_by`: Claude Code (claude-fable-5)

# JOB-278-USER-清算-上架交接鏈與殘留檔

**`job_type`**：`mixed`（子段A：`engineering` 殘留檔清理與 git 整理；子段B：`docs_ops` 懸置派工單銷案與進度文件校正）
**`任務屬性`**：O 維運
**`撰寫角色`**：把散亂的東西整理歸位的管理員——這張單要回答：搬到哪？舊的怎麼找？怎麼退回？
定義與邊界見 **`docs/README_任務派工準則.md`** 第二章。

## 📌 任務背景

2026-07-18 全專案盤點（本 session）逐項實測發現：JOB-257/259 的「上架 station 待辦」實際上已被 JOB-268/270/272 與 commit `4670b830`（2026-06-17 三下社會康軒南一上架）完成，但派工單無結案紀錄、進度彙整仍寫「staged 未覆蓋」的過期資訊；三下社會 17 個 `_new.json` staged 檔已轉正卻留在版控中；`apps/v3_eidos/public/` 有 344 個 iCloud 衝突副本回滲（JOB-275 於 7/5 清理後 13 天內再生）；另有數個 untracked 雜項檔。這些殘留使「還有哪些活單」無法直接回答，需要一次清算歸位。

## 🎯 任務目標

1. JOB-215/257/259 三張懸置派工單各有一份結案紀錄（載明被誰取代、佐證 commit/JOB），並經 `job_manager.js close` 結案；JOB-262 明確標記「開放中、暫緩（五下，非當前 G3/G4 範圍）」。
2. `question/platform/G3/SocialStudies/` 下 17 個 `_new.json` 自版控與工作目錄移除（可由 git 歷史找回）。
3. `apps/v3_eidos/public/` 下 iCloud 衝突副本清除至 0（排除 `public/history/` 正式封存），比照 JOB-275「先比對、白名單才刪」方法。
4. untracked 雜項處置完畢：JOB-277 單據/Report 與 audit trail、2 個 `_manifest` JSON 入版控（入版控前確認不含試卷內容）；`scripts/_tmp_kanghsuan_l1_extract.js` 確認為一次性腳本後移除。
5. `docs/進度彙整_題庫研發與產出.md` 三下社會列補記 6/17 上架事實，消除「staged 待決策」過期敘述。
6. 全部異動 commit（訊息經 hook 驗證）並 push；push 前列出外送檔案清單核對無敏感路徑。

## 🚧 任務邊界

本次任務只做：
- 上列 6 項目標的清理、銷案、文件校正、commit/push

本次任務不做（遇到以下情況請停止並回報，不可自行延伸）：
- 修改規範文件
- 動任何題庫題目內容（本單只刪除已確認轉正的 staged 副本與衝突副本）
- 刪除 `apps/v3_eidos/public/history/`（git 追蹤的正式封存）
- 執行 JOB-262 的實質內容（五下補題/盲測）
- 專案搬出 iCloud（另案，需使用者決策）

## 📖 執行步驟
1. 掃描並分類 `apps/v3_eidos/public/` 衝突副本（IDENTICAL/DUP_SMALLER 才刪，排除 history/）
2. `git rm` 17 個 `_new.json`；核對 mirror 端對應殘留
3. 檢視 2 個 `_manifest` JSON 內容（確認僅索引、無試卷內容）後 add；檢視 `_tmp` 腳本後移除
4. 為 JOB-215/257/259 撰寫結案紀錄（含取代佐證），`job_manager.js close`
5. 更新進度彙整三下社會列
6. 草擬 commit 訊息 → commit → push 前核對外送清單 → push
7. 產出 JOB-278-Report.md，/pj_sync，Discord 結案回報

## 📜 關鍵參考檔案
| 檔案路徑 | 用途 |
|:--|:--|
| `docs/README_任務派工準則.md` | 派工生命週期、結案管線 |
| `jobs/JOB-275-Report.md` | 衝突副本清理方法（先比對、白名單才刪） |
| `jobs/JOB-257-AG-*.md`／`JOB-259-AG-*.md`／`JOB-215-AG-*.md` | 待銷案單據 |
| `docs/進度彙整_題庫研發與產出.md` | 三下社會列過期敘述 |

## ✅ 啟動 Checklist (Pre-Flight)
- [x] 已讀取：JOB-275-Report（清理方法）、JOB-257/259/215 單據尾部（待辦清單）
- [x] 已確認前置素材：2026-07-18 盤點實測結果（三下社會正式檔 17 課 50/50 全上架、BIAS 全過；commit 4670b830）
- [x] **已確認執行模型**：claude-fable-5（Claude Code session 內建，訂閱制）
- [x] **已確認使用金鑰**：不適用
- [x] **已確認操作頻次**：不適用
- [x] 目標品質：不適用（維運單）
- [x] 已閱讀「任務邊界」並確認本次範圍

## ✅ 驗收 Checklist (Acceptance)
- [x] 衝突副本掃描為 0（public 排除 history 實測 0；全專案嚴謹樣式殘餘 2 個均屬明列保留項；刪除統計：白名單 862＋可重建目錄 3,453）
- [x] `git ls-files question/platform/G3/SocialStudies/ | grep _new` 為 0 — 實測輸出 0
- [x] JOB-215/257/259 均有結案紀錄且 close 成功 — job_manager 三張皆回報結案條件滿足
- [x] untracked 雜項為 0 — push 後 `git status --porcelain` 0 行
- [x] push 後 `git status` 乾淨、`git log origin/main..HEAD` 為 0 — 實測 `025147fc..8d0cee17` 推送成功、0 落後

## ✅ 成果 Checklist (Deliverables)
- [x] 成果統計表填寫完畢（刪除數/銷案數/commit hash）— 見 `jobs/JOB-278-Report.md`
- [x] 進度總表已同步（`docs/進度彙整_題庫研發與產出.md` 三下社會列）
- [x] 已執行 `/pj_sync`
- [x] 產出 JOB-278-Report.md，異動清單已列出所有實際修改的檔案路徑

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:- | 花費: - | 使用模型: claude-fable-5 | 執行者: Claude
