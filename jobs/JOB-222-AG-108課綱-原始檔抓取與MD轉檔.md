*Created by Claude Code at 2026-04-30*

`last_updated`: 2026-04-30
`updated_by`: Claude Code (claude-opus-4-7)

# JOB-222-AG-108課綱-原始檔抓取與MD轉檔

**`job_type`**：`mixed`（docs_ops 蒐集 + engineering 轉檔 + research 結構化）
**`executor`**：Claude Code (claude-opus-4-7) — PM 親跑 + 視情況派 Cursor
**`parent_jobs`**: JOB-215 Phase 2 暫停（KL1/KL2 地基未補齊）

## 📌 任務背景

JOB-221 改寫 KL3 三下社會 v3.0.0 時，因 PM 直接根據訓練資料記憶生成 12 條 108 課綱
編碼，事後與官方 PDF 比對發現命中率 0/12（社會領綱第二學習階段）。根本原因是
KL1（全國小總體研究）與 KL2（分科總體研究）兩個地基層從未真正導入官方原始文件。

本任務先把地基補齊：抓五科官方課綱 + 總綱 + NAER 公開的所有相關資源 → 轉 MD →
結構化索引，之後 KL1/KL2/KL3/KL4 才有可靠錨點。

## 🎯 任務目標

1. 在 `knowledge/1_課綱研究/` 下建立 `108課綱研究成果/` 目錄含三層：
   - `1_課綱原始檔案/`（PDF / PPT 原始檔）
   - `2_課綱淬鍊文字/`（MD 轉檔 + 結構化抽取）
   - `_manifest/`（清單與齊全性報告）
2. 搬遷 `knowledge/KL1_學習框架與研究大綱.md` 到 `108課綱研究成果/` 並更新所有引用
3. 從 NAER (`https://www.naer.edu.tw/PageSyllabus?fid=52`) 抓取**所有可下載資源**：
   - 總綱 PDF + 修正令
   - 五科（國語文、英語文、數學、自然科學、社會）領域綱要 PDF
   - 對應的課程手冊 PDF（如有）
   - 議題融入手冊、實施規範等補充文件（範圍：國小階段相關）
4. 轉 MD 後放入 `2_課綱淬鍊文字/`
5. 五科各產出結構化抽取 MD（學習表現 + 學習內容 按學習階段 Ⅰ/Ⅱ/Ⅲ 分節）
6. 建 `_manifest/課綱檔案清單.json`（含 URL/SHA256/檔名/抓取時間/原始大小）
7. 寫 `_manifest/齊全性檢核報告.md`

## 🚧 任務邊界

**只做**：
- 建目錄 + 搬 KL1（含更新引用）
- NAER 國小階段相關資源**全部**抓回
- PDF → MD 轉檔
- 五科學習表現/學習內容結構化抽取
- 建立 manifest 與齊全性報告

**不做**：
- 不修改現有 KL2/KL3/KL4 內容（地基好之後另開 JOB 修）
- 不出題、不盲測、不更動題庫
- 不抓國中／高中專屬資源（純國中/高中文件略過）
- 不重寫 KL1 內容（搬遷後內容不動）

## 📖 執行步驟

### Phase A：建目錄 + 搬 KL1（PM，~30 min）

A1. 建立 `knowledge/1_課綱研究/108課綱研究成果/{1_課綱原始檔案,2_課綱淬鍊文字,_manifest}` 目錄
A2. 建立五科子目錄（在 1_原始檔案/ 與 2_淬鍊文字/ 下各建：國語文/英語文/數學/自然科學/社會）
A3. `git mv knowledge/KL1_學習框架與研究大綱.md knowledge/1_課綱研究/108課綱研究成果/`
A4. `grep -r "knowledge/KL1_" .` 找所有引用 → 更新為新路徑
A5. commit Phase A（基礎結構建立 + KL1 搬遷）

### Phase B：抓 NAER 課綱清單（PM，~1-2 hr，**stop-and-confirm**）

B1. 用 mcp__claude-in-chrome 開啟 `https://www.naer.edu.tw/PageSyllabus?fid=52`
B2. 點四個分頁分別抓：
    - 「總綱」
    - 「領域/科目課程綱要」
    - 「其他類型課綱暨實施規範」
    - 「課程手冊」
B3. 每份檔案抓：標題、PDF/PPT URL、發布日期、檔案大小
B4. 過濾出國小階段相關（不含「國中」「高中」「技高」「綜高」字樣的純高中職資源）
B5. 產出初版清單 → `_manifest/課綱檔案清單.json` (draft)
B6. **stop-and-confirm**：給使用者確認清單齊全 + 過濾邏輯正確才進 Phase C

### Phase C：批次下載（PM，~30 min）

C1. 寫 `scripts/download_curriculum_official.py`（curl with retry + SHA256）
C2. 下載到 `1_課綱原始檔案/{科目or總綱}/`
C3. 計算 SHA256 寫入 manifest
C4. 印出齊全性報告（成功 X 份、失敗 Y 份、原因）

### Phase D：MD 轉檔（PM，~30-60 min）

> 範圍裁減（使用者 2026-04-30 指示）：MD 轉檔**只跑核心五科**主檔，加上總綱主檔，共 **11 筆**。
> 排除：發布令（行政公文短）、公播版簡報 PDF/PPTX（與主檔內容重複）。
> 補充文件 PDF（54 筆）只下載不轉 MD，需要時再單檔轉。

D1. 用 docling 批次轉 PDF → MD（環境：`pdf2md/.venv`，社會領綱已驗證可行）
D2. 輸出到 `2_課綱淬鍊文字/{科目or總綱}/{原檔名}.md`
D3. 抽樣檢查 5 份確認無亂碼（每份至少 ≥10,000 字元）
D4. 預定 11 筆：總綱(111學年度) ×1 + 五科(領綱主檔+課程手冊) ×10

### Phase E：結構化抽取（PM，~1-2 hr）

E1. 對五科 MD 各抽出「學習表現」與「學習內容」二大表
E2. 按學習階段（Ⅰ/Ⅱ/Ⅲ）分節
E3. 產出 `2_課綱淬鍊文字/{科目}/{科目}_學習重點_結構化.md`
E4. 寫 `_manifest/齊全性檢核報告.md`

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `https://www.naer.edu.tw/PageSyllabus?fid=52` | NAER 課綱主頁（JS 動態載入） |
| 已驗證社會領綱 URL：`https://www.naer.edu.tw/upload/1/16/doc/819/...社會領域.pdf` | URL 模式參考 |
| 已下載樣本：`f1836e71-.../webfetch-1777535234949-m9nvct.pdf`（社會領綱 172頁 3.5MB） | Phase D 對齊驗證 |
| `scripts/job207_distill_to_md.py` | docling 批次轉檔工具（JOB-216 W2 已驗證） |
| `knowledge/KL1_學習框架與研究大綱.md` | 待搬遷 |

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] 已讀 `docs/README_通用作業準則.md` §三段式 Checklist
- [ ] 已確認 mcp__claude-in-chrome 可用
- [ ] 已驗證 docling 在環境中可運作（JOB-216 W2 紀錄）
- [ ] 確認執行模型：claude-opus-4-7
- [ ] 已讀本 JOB 範圍與邊界

## ✅ 驗收 Checklist (Acceptance)

- [ ] `knowledge/1_課綱研究/108課綱研究成果/` 三層結構建立完成
- [ ] KL1 搬遷成功，`grep -r "knowledge/KL1_" .` 無殘留舊路徑
- [ ] NAER 國小階段資源**全數抓回**（總綱 + 五科領綱 + 課程手冊 + 補充文件）
- [ ] 每份**核心五科+總綱**PDF 對應 1 份 MD（字元數 ≥10,000）— 11 筆
- [ ] 五科各 1 份結構化抽取 MD（含學習表現 + 學習內容 按 Ⅰ/Ⅱ/Ⅲ 分節）
- [ ] 抽樣 5 條編碼比對官方原文 100% 一致（含已知正解：1a-Ⅱ-1「辨別社會生活中的事實與意見」）
- [ ] `_manifest/課綱檔案清單.json` 含每份 URL/SHA256/檔名/抓取時間/大小
- [ ] `_manifest/齊全性檢核報告.md` 完成

## ✅ 成果 Checklist (Deliverables)

- [ ] `jobs/JOB-222-Report.md` 產出
- [ ] `node scripts/job_manager.js close JOB-222`
- [ ] `/pj_sync` 已執行
- [ ] Discord chat_id `1487738477608177714` 結案回報

## 📌 後續延伸 JOB（記入遺留問題）

| 編號 | 任務 | 觸發條件 |
|:--|:--|:--|
| JOB-{未定} | KL1 + KL2 重做（濃縮核心意涵 + 服務定位 + 讓孩子做題有意義）| 本 JOB 結案後 |
| JOB-{未定} | KL3 三下社會 v3.0.0 編碼修正（依官方原文重對）| KL2 重做後 |
| JOB-{未定} | KL3/KL4 全面巡查並修正 108 課綱編碼 | KL2 重做後 |
| JOB-215 Phase 2c/2d | KL4 三版本產出 + KL2 補強 | 上述全部完成後 |

## 📊 進度摘要

<!-- progress-summary-start -->
- 2026-04-30 16:03 — Phase A 完成：建三層目錄＋KL1 搬遷
- 2026-04-30 16:14 — Phase B 完成：抓 NAER 100 筆連結，過濾後保留 84 筆（國小相關）
- 2026-04-30 16:15 — Phase C 完成：84 筆全下載成功，286.5 MB / 57 秒，零失敗
- 2026-04-30 20:16 — Phase D 完成：11/11 docling 轉檔成功（總綱+五科×2，總長 3h58m，最小 82,071 chars）
- 2026-04-30 20:35 — Phase E 完成：五科結構化抽取（國語文 132/152、英語文 264/114、數學 131、自然 50/351、社會 81/161），社會抽樣 7/7 命中官方
<!-- progress-summary-end -->

## 真實回報本次對話的模型與花費

＄作業匯總：Token數:- | 花費: $- | 使用模型: claude-opus-4-7 | 執行者: Claude
