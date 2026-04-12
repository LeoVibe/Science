*Created by Cursor Agent at 2026-03-29*

`last_updated`: 2026-03-29 15:30  
`updated_by`: Cursor Agent  
`version`: 1.0  

# JOB-124：國語下學期 G3～G6 全出版社批次產題編排

**`job_type`**：`scripts`（編排出題管線，不取代 KL4 研究責任）

## 背景

執行者需以**同一套** `auto_generate_questions.js` 行為，對 **G3～G6、國語 S2、康軒／翰林／南一** 逐出版社目錄補題；手動重複執行易漏目錄或參數不一致。

## 目標

- 新增 **`scripts/batch_chinese_s2_generate.js`**：依年級／出版社列舉 `question/platform/G#/Chinese/S2/<Publisher>`，預設先跑 **`verify_chinese_kl4_prereq.js`**，再依序呼叫補題腳本。
- 子程序參數透過 **`--` 之後**原樣轉發，與單目錄產題一致（模型、金鑰、QPM、batch、threshold、target、pattern）。
- **`question/README_出題與品管準則.md`** 手動工具表增列本腳本與用法。

## DoD（驗收）

- [x] 腳本可列出 12 個目錄（G3～G6 × 3），`--dry-run` 不呼叫 API。
- [x] 預設會執行 verify；verify 失敗時預設**不**進入產題（除非 `--skip-verify`）。
- [x] `--prereq-only` 僅檢查後結束。
- [x] 文件已更新；與 **README 模型透明化**一致：**執行產題前須由負責人指定 `--model`／`--key` 等**，腳本不自動宣稱授權。

## 關聯派工

- **JOB-102**：國語 S2 實際題數與 CQI 驗收仍以該單為準；本 JOB 僅提供批次編排工具。

## Report

- 完工後填寫 `jobs/JOB-124-Report.md`（若僅工具交付，可簡述執行過與建議指令範例）。
