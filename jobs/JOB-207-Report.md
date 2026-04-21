*Created by Claude Code at 2026-04-21*

`last_updated`: 2026-04-21
`updated_by`: Claude Code (claude-opus-4-7)

# JOB-207 結案報告

**`job_type`**：`research`（跨科全站基礎建設）
**`executor`**：Claude Code（使用者 2026-04-21 授權一條龍執行）

## 📊 成果摘要

JOB-207 延伸自 JOB-206 的 β+ 補償路徑實踐，建立**標準化「考古」目錄結構**取代原 `knowledge/3_考古題/`，導入**三軌設計**（原始 / 淬煉 / 索引），並完成**重要規則修訂**：原檔永久保存（取代舊「解析完成即刪」）。以 G3 社會南一為完整 pilot 跑通 PDF → MD + `_index.json` pipeline，同步遷移既有 JOB-172 + 本 session 早期的所有資產，並更新 7 個現役規範與腳本的引用路徑。

| 指標 | 數值 |
|:--|:--|
| 新建腳本 | 2（`job207_download_batch.py` + `job207_distill_to_md.py`）|
| 新 MD 產出 | **49 份**（G3 三下_社會 14 + 三下_國語 12 + 三下_數學 8 + G4 四下_國語 6 + 四下_社會 9）|
| 新下載 PDF | **25 份**（G3 三下_社會 三個 Drive 成功；2 個 Drive 被 rate-limit 待重試）|
| 搬遷 PDF | **51 份**（`_test_10/` → `原始/G{3,4}/` 含重命名） |
| 新 `_index.json` | 4 份（4 個資料夾）|
| 引用更新 | 7 個現役檔案（+ 3 處細節修正）|

## 📋 逐階段成果

| Phase | 動作 | 結果 |
|:--:|:--|:--|
| 0 | 目錄規範定案、建 README、更新 .gitignore | ✅ `knowledge/3_考古題/` 三軌結構 + 10 章 README |
| 1 | 遷移 _test_10 51 PDF + 拆 JOB-172 的 2 份聚合 JSON + 搬索引 | ✅ 51 PDF rename + 9 MD |
| 1.5 | 重下載 G3 社會南一 5 個 Drive 的 PDF | ⚠️ 3 成功 25 PDF；2 被 rate-limit（第二+第三次段考） |
| 2 | `scripts/job207_download_batch.py` | ✅ 含限速 + retry 骨架，dry-run 驗證通過 |
| 3 | `scripts/job207_distill_to_md.py` | ✅ PDF → MD + `_index.json`，跑過 4 個資料夾 |
| 4 | G3 社會南一 pilot | ✅ 25 PDF → 14 MD + 1 `_index.json` |
| 5 | 更新 7 檔引用 + 3 處細節修正 | ✅ 規範一致 |
| 6 | commit + Report + close | 🟡 進行中 |

## 📂 異動清單

| 檔案路徑 | 異動類型 | 說明 |
|:--|:--|:--|
| `.gitignore` | 修改 | 新增 `knowledge/3_考古題/原始/` + `淬煉/**/*.md` ignore，例外保留 `_index.json` |
| `knowledge/3_考古題/README.md` | 新增 | 10 章全新規範（三軌結構、新 Rule 7 永久保存、α/β+ 對齊、遷移紀錄） |
| `knowledge/3_考古題/_manifest/` | 新增 | 6 份索引檔（Drive + PDF + tcool + JOB-172 download report + 米蘭清單 + 遷移對照） |
| `knowledge/3_考古題/原始/G{3,4}/{三下_國語,三下_數學,三下_社會,四下_國語}/` | 新增 | 76 份 PDF（51 遷移 + 25 新下載，含重命名） |
| `knowledge/3_考古題/淬煉/G{3,4}/{4 個子目錄}/` | 新增 | 49 份 MD + 4 份 `_index.json`（只有 `_index.json` 進 git） |
| `scripts/job207_download_batch.py` | 新增 | 批次下載工具（限速、retry、--dry-run） |
| `scripts/job207_distill_to_md.py` | 新增 | 淬煉 pipeline（PDF → MD + 主題分析 + 索引聚合） |
| `scripts/job207_list_all_pdfs.py` | 修改 | 路徑 `考古題原檔` → `考古` |
| `knowledge/README_研究架構總綱.md` | 修改 | 附錄引用新路徑 + 新 README 檔名 |
| `knowledge/5_學習議題研究/無課文情境的考古題補償研究法.md` | 修改 | 5 處路徑更新 + 3 處規則修正（保留原 PDF 取代刪除） |
| `knowledge/1_課綱研究/國語/README_KL4單課建置與複製準則.md` | 修改 | 路徑更新 |
| `docs/README_通用作業準則.md` | 修改 | 路徑更新 |
| `question/README_出題與品管準則.md` | 修改 | 路徑更新 |
| `knowledge/1_課綱研究/社會/三下/南一/KL4_三下_南一_L5_打造幸福的家園_考古題與討論.md` | 修改 | 路徑更新 + 歷史事實註記（PDF 已於 JOB-207 補回） |
| `jobs/JOB-207-USER-*.md` | 新增 | 派工單 |

## ✅ Checklist 對照

### 啟動 Checklist
- [x] 已讀 `knowledge/README_研究架構總綱.md`
- [x] 已讀 `knowledge/5_學習議題研究/無課文情境的考古題補償研究法.md`
- [x] 米蘭老師 G1-G6 全站 Drive 清單（704 × 11,704 PDF）
- [x] 使用者 Q1-Q3 決策確認

### 驗收 Checklist
- [x] `knowledge/3_考古題/` 三軌結構完整建立
- [x] Phase 1 遷移：51 PDF + 2 JSON 拆 9 MD + 索引搬完
- [x] Phase 1.5 重下載 25 PDF（⚠️ 42 目標中成功 25；17 被 rate-limit 待重試）
- [x] Phase 2 `scripts/job207_download_batch.py` 可執行（dry-run 驗證）
- [x] Phase 3 `scripts/job207_distill_to_md.py` 可執行
- [x] Phase 4 Pilot：G3 社會南一 14 MD + `_index.json`
- [x] Phase 5：grep `knowledge/3_考古題` 現役檔全改完；歷史 JOB md 保留引用
- [x] `.gitignore` 更新

### 成果 Checklist
- [x] `knowledge/3_考古題/README.md` 新規範
- [x] 2 個新腳本可用
- [x] G3 社會南一 14 MD + 4 `_index.json`（跨 4 資料夾）
- [x] 已執行 /pj_sync 全域知識沉澱
- [x] `jobs/JOB-207-Report.md`（本檔）

## 🔄 同步確認
- [x] `docs/進度彙整_題庫研發與產出.md` — JOB-207 未改題庫統計，無須更新（僅基礎建設）
- [x] `docs/README_專案發展紀錄.md` 加 JOB-207 DONE 條目於 2026-04-21 區塊
- [x] `.gitignore` 調整完成（`_index.json` 允許進 git）

## ⚠️ 遺留問題

1. **G3 社會南一「第二次段考」+「第三次段考」2 個 Drive 被 Google rate-limit（共失去 ~17 份 PDF）**
   - 現狀：`_manifest/pdf_manifest_G1_G6.json` 已知這 2 個 Drive 的 PDF 清單
   - 建議處理：等 1-2 小時 Google 限流解除後，用 `scripts/job207_download_batch.py --grade G3 --subject 社會 --semester 下學期 --publisher 南一 --exam_types 第二次段考 第三次段考` 補下
   - 優先度：中

2. **舊目錄 `knowledge/3_考古題/` 尚未清理**
   - 現狀：內容已全部複製到新結構；舊目錄保留於 .gitignore 內不影響版控
   - 建議處理：確認新結構穩定（可能執行 1-2 週）後，人工執行 `rm -rf knowledge/3_考古題/` 清除
   - 優先度：低

3. **國語/數學/英語等科目 `SUBJECT_KEYWORDS` 尚未填寫**
   - 現狀：`scripts/job207_distill_to_md.py` 只有社會的主題關鍵字，其他科目的淬煉 MD 沒有主題命中分析
   - 建議處理：每個科目依其 KL3 發展綱要提取關鍵字補入腳本（各科 15-30 分鐘）
   - 優先度：中（每批次下載前補對應科目）

4. **全站 11,704 PDF 下載為長期任務**
   - 現狀：_manifest 已備 metadata；本 JOB 僅抓 G3 社會南一 25 PDF + 前 session 51 PDF
   - 建議處理：每週 1-2 批次 `job207_download_batch.py` 按（年級 × 科目 × 版本）推進
   - 優先度：低（長期背景工作）

5. **JOB-172 拆出 8 份 MD 的檔名部分含「未知國小」**
   - 現狀：`knowledge/3_考古題/淬煉/G4/四下_社會/` 有 8 份因 raw text 片段學校名推不出，以 `未知國小{idx}` 保留
   - 建議處理：若日後有需要，可從 JOB-172 原始腳本 log 回溯學校名
   - 優先度：低

## 🔧 技術筆記

### 關鍵發現

1. **gdown `skip_download=True` 是秘密武器**：可純取得 Drive 內 file list，無需下載 PDF。JOB-207 spike 用此功能在 ~76 分鐘內盤點全站 11,704 PDF metadata。

2. **Google Drive rate-limit 無法硬上**：連續抓 ≥ 4 個 Drive 開始無聲失敗（返回 0 PDF 但 HTTP 200）。限速 30s/Drive + 每批 3 休 5 分鐘是穩定設定。

3. **PDF 檔名 parser 的 edge cases**：米蘭老師 Drive 內檔名不完全標準，如 `111下-勝利國小-社三中卷.pdf` 需要特殊 regex。本 JOB 的 parser 覆蓋 80% 情況，剩餘 edge cases 人工後處理可接受。

4. **聚合 JSON 拆 MD 的限制**：JOB-172 的「8 份聚合」JSON 中 text 片段不足以推出所有元數據（學校名常缺），拆出來的 MD 要能接受「未知國小{idx}」作為 placeholder。

### 給下個接手者

- **擴充其他科目的淬煉支援**：修改 `scripts/job207_distill_to_md.py` 的 `SUBJECT_KEYWORDS`，依 KL3 發展綱要列出每科主題關鍵字。
- **rate-limit 重試**：寫 shell script 排程每日 1-2 次跑失敗 Drive 的 retry。
- **淬煉 MD 的品質提升**：目前 MD 是「raw text + metadata」；未來可補「題目切片」（自動切成 Q1/Q2/...），需要 regex 規則識別題型編號。
- **全站推廣順序**：建議優先順序「社會 > 自然 > 國語 > 數學 > 英語 > 生活 > 健體」（與 β+ 補償需求對齊）。

## 🔍 驗收確認

| 欄位 | 內容 |
|:--|:--|
| 驗收者 | user（執行者為 Claude Code，不得自驗收） |
| 驗收時間 | 待填 |
| 驗收結果 | 待填 |
| 退回原因 | 待填 |

## ⏱️ 執行時間回報

| 子任務 / 階段 | 時間（概略） | 備註 |
|:--|:--|:--|
| Phase 0 目錄規範 + README 撰寫 | ~30 分 | 10 章新 README |
| Phase 1 遷移 51 PDF + 2 JSON 拆 | ~20 分 | Python script |
| Phase 1.5 重下載 25 PDF | ~8 分 | 5 Drive 串行含限速 |
| Phase 2 下載腳本 | ~25 分 | |
| Phase 3 淬煉 pipeline | ~30 分 | 含主題關鍵字規則設計 |
| Phase 4 Pilot（4 資料夾驗證） | ~10 分 | |
| Phase 5 更新引用 | ~15 分 | |
| Phase 6 Report + commit | ~15 分 | 本階段 |
| **總計** | **~2.5 小時** | 比預估 4 小時快 |

## 真實回報本次對話的模型與花費

＄作業匯總：Token數:- | 花費: $- | 使用模型: Claude-Opus-4.7 | 執行者: Claude
