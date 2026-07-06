*Created by AG at 2026-05-01 10:00*

`last_updated`: 2026-05-01 10:00
`updated_by`: Claude Code (claude-opus-4-7)

# JOB-224-AG-整合-三下社會南一雙來源MD-整合版_Claude

**`job_type`**：`research`
（考古題素材整合，產出統一格式的雙來源整合 md，不涉及課綱研究 KL3/KL4，亦不涉及題庫 JSON。）

## 📌 任務背景

`knowledge/3_考古題/` 目前並存兩套 MD 淬鍊文字目錄：
- `2_MD淬鍊文字_Claude/`：Claude Code 抽取（job207_distill_to_md.py）
- `2_MD淬鍊文字_Codex/`：Codex 抽取（JOB223_distill_to_md.py）

兩 agent 對同批原始檔（PDF/DOC）抽取結果差異大。已實測：
`三下_社會_南一/南一_108_大園國小_第一次段考.md`：
- Claude 版：試卷有 100+ 行完整題目
- Codex 版：`[EMPTY_EXTRACT]` + `soffice timeout`（quality_flags 五項）

舊 pilot（`2_MD淬鍊文字_最終整合/_pilot_comparison_report.md`）給的「Codex backbone」結論在社會 .doc 重災區明顯不適用。本 JOB 改採「動態擇優 + LLM 全文整合 + 機械欄位回填」方法，先在 `三下_社會_南一` 驗證可行性，未來再依結果決定是否全量推廣。

## 🎯 任務目標

在 `knowledge/3_考古題/2_MD淬鍊文字_整合版_Claude/三下/三下_社會_南一/` 產出 unique logical exam group 的 final md 集合，每份均：
1. 採用六段固定結構（frontmatter / 整合摘要 / 最佳化正文 / 來源追溯 / 跨來源對照 / 整合判斷）
2. 正文採動態擇優（quality_flags、non_ws_chars 為依據），由 Claude Opus 4.7 全文整合
3. frontmatter 與 source trace 經腳本自動回填校正，sha256 / filename / source path 100% 對應原始來源
4. 字元數對應原始來源（容差 ±10%）
5. 附 `_integration_manifest.json`（機讀）+ `_integration_report.md`（人讀統計）

## 🚧 任務邊界

本次任務只做：
- 來源範圍：`2_MD淬鍊文字_Claude/三下/三下_社會_南一/` ∪ `2_MD淬鍊文字_Codex/三下/三下_社會_南一/`
- 輸出範圍：`2_MD淬鍊文字_整合版_Claude/三下/三下_社會_南一/`
- 撰寫整合腳本：`scripts/JOB224_integrate_pilot.py`（階段 A 配對、階段 C 回填、階段 D 驗收）
- 階段 B 整合：Claude Code 主對話用 Opus 4.7 逐份處理

本次任務不做（遇到以下情況請停止並回報，不可自行延伸）：
- 修改規範文件
- 處理其他學期、其他出版社、其他科目
- 修改 `2_MD淬鍊文字_Claude/`、`2_MD淬鍊文字_Codex/` 任何來源檔
- both_empty 案例不嘗試重新抽取（不在本 JOB 範圍）
- 不變更舊 `2_MD淬鍊文字_最終整合/` 目錄（保留作為對照）

## 📖 執行步驟

### 階段 A：配對與分析（腳本 `scripts/JOB224_integrate_pilot.py --stage a`）

1. 讀取兩邊 `_index.json`、`_doc_index.json`（如存在），合併建立 unique logical exam group 清單
2. 配對策略：
   - 主鍵：來源原始檔 sha256 集合的交集
   - 副鍵：(publisher, academic_year, source_school, exam_type)
3. 每組標記 `integration_status`：
   - `both_have_content`：兩邊都有非空正文
   - `claude_only_has_content`：Claude 有、Codex 空（典型 .doc timeout 案例）
   - `codex_only_has_content`：Codex 有、Claude 空
   - `both_empty`：兩邊都空（標記後跳過階段 B）
   - `claude_only_exists`：Codex 完全沒有此檔
   - `codex_only_exists`：Claude 完全沒有此檔
4. 輸出：`_pre_integration_pairing.json`（給階段 B 取用）

### 階段 B：LLM 全文整合（Claude Opus 4.7 逐份）

對每個 logical exam group（跳過 both_empty）：
1. Read Claude 版 + Codex 版兩份 md 全文
2. 用本派工單規定的 prompt template 在主對話內由 Claude Code（Opus 4.7）產出 final md：
   - frontmatter（含 grade、semester、subject、publisher、academic_year、source_school、exam_type、available_agents、integration_status、quality_flags）
   - `## 整合摘要`
   - `## 最佳化正文`（含 `### 試卷` / `### 答案`，依擇優結果）
   - `## 來源追溯`（list 所有原始來源檔 + sha256 + 抽取方法）
   - `## 跨來源對照`（兩邊正文差異與取捨理由）
   - `## 整合判斷`（後續 Agent 快速判讀的決策摘要）
3. Write 到 `2_MD淬鍊文字_整合版_Claude/三下/三下_社會_南一/{publisher}_{year}_{school}_{exam_type}.md`

### 階段 C：機械欄位回填校正（腳本 `--stage c`）

對每份 final md：
1. 從原始來源檔（Claude 與 Codex frontmatter）建立 ground truth 表
2. 比對 final md frontmatter 的：sha256 / filename / source path / publisher / academic_year / source_school / exam_type
3. 任一欄位不符 ground truth → 自動以原值覆蓋
4. 輸出校正 diff log：`_3C_strict_recovery.log`

### 階段 D：驗收檢查（腳本 `--stage d`）

對所有 final md 執行：
1. frontmatter YAML 合法性
2. 六段結構完整性（六個 H2 標題依序存在）
3. sha256 100% 對應原始來源
4. 無空 code fence、無截斷標記（`...`、`[truncated]`、`[EMPTY_EXTRACT]` 等）
5. 字元數對應原始來源（容差 ±10%）
6. 產出 `_integration_manifest.json` + `_integration_report.md`

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `README.md` | 專案背景 |
| `docs/README_通用作業準則.md` | 三段式 Checklist、模型核准、邊界守則 |
| `docs/README_任務派工準則.md` | research 邊界、結案管線 |
| `knowledge/3_考古題/README.md` | 考古題資料夾結構 |
| `knowledge/3_考古題/2_MD淬鍊文字_最終整合/_pilot_comparison_report.md` | 舊 pilot 結論（作為對照與反證依據） |
| `scripts/JOB223_integrate_final_pilot.py` | 舊 pilot 腳本（作為腳本架構參考） |

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] 已讀取：README.md、通用作業準則、任務派工準則、考古題 README、舊 pilot report
- [ ] 已列出三下_社會_南一 完整檔案清單（兩邊 + sha 對應表，存於階段 A 輸出）
- [ ] **已確認執行模型**：claude-opus-4-7（1M context）— 使用者於本 JOB 對話核准
- [ ] **已確認使用金鑰**：N/A（Claude Code 主對話內建，非 API key 配額）
- [ ] **已確認操作頻次**：N/A（主對話逐份處理，無 QPM 限制）
- [ ] 確認輸出目錄 `2_MD淬鍊文字_整合版_Claude/三下/三下_社會_南一/` 不存在或為空
- [ ] 完成 `scripts/JOB224_integrate_pilot.py` 階段 A、C、D 三段
- [ ] 設計 LLM prompt template（階段 B）

## ✅ 驗收 Checklist (Acceptance)

> 本 JOB 不適用 CQI（非出題/盲測任務）。改用本任務專用的整合品質指標：

- [ ] final md 數量 = unique logical exam group 數量｜佐證：__ 份 / __ 份預期
- [ ] integration_status 分布｜both_have __ ／ claude_only_has_content __ ／ codex_only_has_content __ ／ both_empty __
- [ ] sha256 100% 對應原始來源｜階段 D-3 通過率 __/__
- [ ] filename 100% 對應原始來源｜階段 C 回填後重驗 __/__
- [ ] source path 100% 對應原始來源｜階段 D 驗證 __/__
- [ ] 六段結構 100% 完整｜階段 D-2 通過率 __/__
- [ ] 0 空 code fence｜違規數 __
- [ ] 0 截斷標記殘留｜違規數 __
- [ ] 字元數容差 ±10%｜違規清單 __/__
- [ ] `_integration_manifest.json` 行數 = final md 數｜佐證 __ / __
- [ ] 3C-strict 自動回填觸發次數記錄完整｜`_3C_strict_recovery.log` 行數 __

## ✅ 成果 Checklist (Deliverables)

- [ ] `scripts/JOB224_integrate_pilot.py`（階段 A、C、D）
- [ ] `2_MD淬鍊文字_整合版_Claude/三下/三下_社會_南一/{*.md}`
- [ ] `2_MD淬鍊文字_整合版_Claude/三下/三下_社會_南一/_pre_integration_pairing.json`
- [ ] `2_MD淬鍊文字_整合版_Claude/三下/三下_社會_南一/_integration_manifest.json`
- [ ] `2_MD淬鍊文字_整合版_Claude/三下/三下_社會_南一/_integration_report.md`
- [ ] `2_MD淬鍊文字_整合版_Claude/三下/三下_社會_南一/_3C_strict_recovery.log`
- [ ] `jobs/JOB-224-Report.md`，異動清單列出所有實際修改的檔案路徑
- [ ] **使用者親自抽樣驗收 3 份**（1 份 both_have、1 份 claude_only_has_content、1 份 codex_only_has_content 或 codex_only_exists）— 此項由使用者打勾
- [ ] `node scripts/job_manager.js close JOB-224`
- [ ] `/pj_sync`
- [ ] Discord 結案回報（`1487738477608177714`）

## ⚠️ Self-execution 風險揭露

本 JOB Claude Code 同時擔任 PM 與執行者，自我驗收可信度較低。所有驗收 Checklist 佐證均為腳本實跑數值（非主觀判斷）；**使用者親自抽樣驗收為最終把關**，不可省略。

## 真實回報本次對話的模型與花費

＄作業匯總：Token數:- | 花費: $- | 使用模型: claude-opus-4-7 | 執行者: Claude

（結案時填入真實 Meta；無法取得時填 `-`，禁止推估。）
