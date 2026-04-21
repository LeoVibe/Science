*Created by AG at 2026-03-24 16:35*

`last_updated`: 2026-03-24 17:15
`updated_by`: Antigravity (Claude Sonnet 4)

# JOB-113-AG-整合-全站深度去重與JSON格式正規化

## 📌 任務背景
在完成 JOB-112 的「目錄結構」統一後，使用者進一步發現單一目錄下存在「同課多檔」與「JSON 內容格式歧異」的深層資料問題。例如 G5 國語康軒版下，同時並存 `Chi_L1.json`（標準格式）與 `U1.json`（變形格式：將單題欄位如 `difficulty`, `correctAnswer` 散落在根目錄，並包含內部 `questions` 陣列）。此問題將導致前後端讀取崩潰與題庫重複計算。

## 🔍 問題解構 (Anomalies)
本次盤點發現全站資料有以下嚴重架構與資料損毀問題：
1. **同課多檔與異名並存**：如 `Chi_L1.json`、`U1.json`、`Sci1_昆蟲的一生.json` 與 `L1_U1.json` 並存，導致同課多次被載入。
2. **越界孤島檔案 (Orphan JSONs)**：如 `Math/S2/HL_NI_Core.json` 等脫離底層單元結構目錄的檔案。
3. **多重變形 JSON (Malformed Schemas)**：
   - 類型 A：標準格式 `{ "meta": {...}, "questions": [...] }`
   - 類型 B：純陣列 `[{...}, {...}]` (JOB-112 暫未處理)
   - 類型 C：單題混雜陣列，根目錄攜帶 `concept`, `correctAnswer` 等屬性，同時包含 `questions` 陣列（如 G5 康軒 U1.json）。
   - 類型 D：答案屬性命名差異（如 `answer_index` vs `correctAnswer`）。

## 🎯 任務目標
1. **全面正規化 (Normalization)**：掃描全站所有 JSON，強制將所有變形結構內的有效「題目物件」抽取出來，統一轉換為標準的 `{ taxonomy, scenario, question, options, answer_index, explanation, commonMisconception, quality_level, cqi_score }`。
2. **深度合併與去重 (Merge & Deduplication)**：若同一目錄下有多個檔案對應至同一課次（如 L1），腳本須讀取所有檔案的題目，進行去重（比對 `question` 題幹文字），並合併至單一標準檔案 `L{N}_課名.json`。
3. **清除舊檔 (Cleanup)**：合併完成後，刪除原有造成混亂的舊名稱檔案（如 `Chi_L*`, `U*`, `Math_U*` 等）。
4. **重建索引 (Manifest)**：執行完畢後重新生成淨化版的 `manifest.json` 與全站品質統整點數。

## ⚙️ 自動化執行腳本規劃 (Data Pipeline)
整個重構與規範化將由一連串的客製 Python 工具完成：
1. **階段零：全站特徵掃描 (`/tmp/scan_all_questions.py`)**：掃描全站檔名變異（如 `M4_`, `Sci_`）與所有用過的 JSON keys，以制訂《出題品管準則》的單一真理字典。
2. **階段一：強制孤鳥撲殺 (`/tmp/normalize_questions_v2.py: kill_orphans`)**：強制巡邏五層目錄架構，刪除所有未在 `Publisher` 層級內的 JSON 檔案。
3. **階段二：暴力的正則單元擷取與抽取 (`normalize_questions_v2.py: get_lesson_id`)**：無論前綴是 `M4`, `Life2` 還是 `Chi_L1`，只要鎖定第一組數字，直接映射強制轉為純粹的 `L{N}`。同時，將舊屬性 `correctAnswer` 映射回標準 `answer_index`，並過濾掉不合法的屬性。
4. **階段三：同課合併去重**：針對所有判斷屬於同一 `L{N}` 的陣列進行 `question` 的字串比對去重，並競選出最長的「具中文語意」標題（蓋掉 `U1` 或 `Exp` 等無意義標題）。
5. **階段四：統計更新 (`/tmp/update_stats.py`, `scripts/rebuild_manifest.py`)**：重建網頁目錄並更新到所有追蹤文件。
6. **階段五：全域大重構與 Meta 擴充 (2026-03-26 重啟)**：
   - 撰寫 `extract_r3_metadata.py` 讀取 `knowledge/1_課綱研究/國語/` 取出真實 `title` 與 `theme`。
   - 撰寫 `rename_and_inject.py` 將全站 652 份 JSON 更名為 `G{N}_S{N}_{SUB}_{PUB}_L{N}.json` 絕對扁平化命名，並注射 Meta 屬性。
   - 更新重組指令，於 `manifest.json` 中加入課文基本資訊。
7. **階段六：Manifest 絕對化與一鍵上架檢核 (Phase 6)**：
   - 將所有 `manifest.json` 更名為 `G{N}_S{N}_{SUB}_{PUB}_manifest.json`。
   - 撰寫 `verify_and_build.js`，統合 CQI/QL 評分、盲測狀態 (`blind_evaluation`) 檢查與 Manifest 構建功能。這支腳本將成為未來上版前 (Release Gate) 的單一核可通道。

## ✅ 驗收 Checklist (Acceptance)

### 前期目錄清理階段 (Phase 1-4)
- [x] 修訂 `question/README_出題與品管準則.md` 確立 L{N} 檔名與字典屬性。
- [x] 所有目錄下的檔案命名僅留存 `L{N}_課名.json` 格式，`Sci_`, `M4_` 等縮寫前綴與 `U1` 等舊命法已完全絕跡。
- [x] 跨站孤鳥確認肅清：`Math/S2/` 目錄下的無版本定義檔案（如 `HL_NI_Core`）已強制刪除。
- [x] 抽查 G5 國語康軒：確認 `Chi_L1.json` 與 `U1.json` 皆已合併，且題幹無重複。
- [x] 執行 `evaluate_question_quality.js` 不報解析錯誤，總檔案數量從原本 800+ 縮編至 633 檔。
- [x] 撰寫前期結案報告 `JOB-113-Report.md`。

### 全域命名大重構與 Meta 擴充 (Phase 5 - 完工)
- [x] 全站 JSON 更名為絕對標準格式 (如 `G6_S2_CHI_HANLIN_L1.json`)。
- [x] 將 `title`（中文課名）與 `theme`（文體/主題）成功注射入所有 JSON 檔的 `meta` 區域。
- [x] 修改並執行 `rebuild_manifest.py`，使 `manifest.json` 成功抓取並呈現 `title` 與 `theme`。
- [x] 同步修改並確認 `evaluate_question_quality.js` 能以新檔名架構正常計算全站跑分。
- [x] 更新 `README_出題與品管準則.md`，將此絕對命名標準定為唯一的最高階規範。

### Manifest 絕對化與統一上架檢核 (Phase 6 - 執行中)
- [ ] 將各目錄的 `manifest.json` 變更為 `G{N}_S{N}_{SUB}_{PUB}_manifest.json` 絕對格式。
- [ ] 撰寫 `scripts/verify_and_build.js` (上架前品質檢核與構建腳本)，功能涵蓋：
    - 掃描所有 JSON，產出 CQI 與 QL 分佈。
    - 統計哪些題目具備 `blind_evaluation: true`。
    - 檢查是否有屬性缺失 (如少 `theme` 或 `title`)。
    - 動態生成新的絕對化 `manifest.json` 並更新全站 `libraryStats.json`。
- [ ] 更新 `README_驗證與盲測準則.md` 與 `README_出題與品管準則.md`，宣告這支新腳本的用法。
- [ ] 執行最終結案，更新最終版 `JOB-113-Report.md`。

---
> ⚠️ **[任務狀態] 2026-03-26：進入 Phase 6 終極階段**
> 因應使用者對架構防呆與 CI 流程的絕佳建議，113 專案進入 Phase 6，將索引檔絕對化並打造全能上架掃描器。
---
