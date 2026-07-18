*Created by Claude at 2026-07-18*

`last_updated`: 2026-07-18
`updated_by`: Claude Code (claude-fable-5)

# JOB-278 結案報告

**`job_type`**：`mixed`（子段A：`engineering` 殘留檔清理與 git 整理；子段B：`docs_ops` 懸置派工單銷案與進度文件校正）
**`executor`**：Claude

## 📊 成果摘要

2026-07-18 盤點所發現的「上架交接鏈斷裂」與殘留檔問題一次清算完畢：三張懸置派工單（JOB-215/257/259）補結案紀錄並結案（各附「被誰取代」的實測佐證）；17 個已轉正的三下社會 `_new.json` staged 檔自版控移除；全專案 iCloud 同步衝突副本清除 4,315 個；untracked 雜項歸位；進度彙整三下社會列的過期敘述（「staged 未覆蓋待決策」）補記 6/17 上架事實並對齊現行數字。連同 JOB-277 成果共 3 個 commit 推送遠端，push 前完成外送清單敏感路徑掃描（0 命中）。

| 項目 | 數值 |
|:--|:--|
| 懸置派工單銷案 | 3 張（JOB-215/257/259，close 成功） |
| `_new.json` 移除 | 17 檔（git rm，可由歷史找回） |
| 衝突副本刪除 | 4,315 個（白名單 IDENTICAL/DUP_SMALLER 862＋可重建目錄內殘餘 3,453） |
| 清理後全專案殘餘 | 2 個（`.env 2.local` 值有差異保留待人工、`.claude/scheduled_tasks 2.lock` 邊界外不動） |
| untracked 雜項 | 2 個考古題索引 manifest 入版控（確認無試卷內容）；1 個一次性腳本刪除 |
| commit / push | `646e9017`（JOB-277）＋`8d0cee17`（本單）＋`e8fbdc82`（先前 docs）→ origin/main，push 後 0 落後、工作目錄 0 殘餘 |

## 📂 異動清單

| 檔案路徑/範圍 | 異動類型 | 說明 |
|:--|:--|:--|
| `question/platform/G3/SocialStudies/S2/{HanLin,KangHsuan,NanYi}/*_new.json`（17 檔） | git rm | JOB-252 staged 檔，內容已於 commit `4670b830`（康軒/南一）與 JOB-270（翰林）轉正 |
| `apps/v3_eidos/{dist,playwright-report}/`、`apps/v1_science/dist/`、`apps/v3_eidos/src/`（5 檔） | 本機刪除 | 衝突副本；dist/playwright-report 為 gitignore 可重建產物（dist 建議下次 build 全量重建） |
| `knowledge/3_考古題/_manifest/{JOB223_source_manifest,pdf_manifest_G1_G6}.json` | git add | 索引 manifest（掃描確認無題幹/選項/答案欄位），與同目錄既有追蹤慣例一致 |
| `scripts/_tmp_kanghsuan_l1_extract.js` | 刪除 | 一次性盲測輔助腳本，功能已被 JOB-277 工具鏈取代 |
| `jobs/JOB-215-Report.md`、`JOB-257-Report.md`、`JOB-259-Report.md` | 新增 | 銷案紀錄（取代佐證＋實測數據） |
| `docs/進度彙整_題庫研發與產出.md` | 修改 | 三下社會列：三欄數字對齊 libraryStats（300/300/250、CQI 9.03~9.19）＋上架事實補記 |
| `docs/README_專案發展紀錄.md` | 修改 | 2026-07-18 段落（JOB-277/278） |

## ✅ Checklist 對照結果

### 驗收 Checklist (Acceptance)
- [x] 衝突副本掃描為 0（排除 history/）— 實際：嚴謹樣式全專案殘餘 2 個且均屬明列保留項（`.env 2.local` 值有差異待人工裁定；`.claude/scheduled_tasks 2.lock` 為 JOB-275 邊界外項目）
- [x] `git ls-files question/platform/G3/SocialStudies/ | grep _new` = 0 — 實際輸出 0
- [x] JOB-215/257/259 均有結案紀錄且 close 成功 — job_manager 三張皆回報「結案條件已滿足」
- [x] untracked 雜項為 0 — push 後 `git status --porcelain` 輸出 0 行
- [x] push 後 `git log origin/main..HEAD` 為 0 — 實際輸出 0

### 成果 Checklist (Deliverables)
- [x] 成果統計表填寫完畢（刪除數/銷案數/commit hash）
- [x] 進度總表已同步（三下社會列）
- [x] 已執行 `/pj_sync`
- [x] 產出 JOB-278-Report.md，異動清單已列出所有實際修改的檔案路徑

## ⚠️ 遺留問題

1. **`apps/v3_eidos/.env 2.local` 與 `.env.local` 鍵同值異**：需使用者確認哪份值正確後手動刪除舊檔（未動）。
2. **JOB-262 維持開放、暫緩**：五下品質補齊（自然補題／國語盲測／社會翰林盲測），非當前 G3/G4 優先範圍。
3. **衝突副本根因未除**：專案仍在 iCloud 同步路徑（`~/Documents`），副本會持續再生（本次為 JOB-275 後 13 天內再累積 4,300+）。搬出 iCloud 需使用者決策（技術篇 P0 #3），涉及 hook 內寫死的絕對路徑。
4. **範圍外發現**：`apps/v2_currisite/dist/` 有 436 個 git 追蹤的衝突副本（屬技術篇 P2 #5「v2 dist 建置產物進版控」問題的一部分，本單未動）。

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:- | 花費: -（Claude Code session 訂閱額度內） | 使用模型: claude-fable-5 | 執行者: Claude
