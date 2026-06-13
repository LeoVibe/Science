# JOB-250 Report：三下自然 南一題庫重出（含溶解 KL4 反推 + 113 結構對齊）

`last_updated`: 2026-06-14
`updated_by`: Claude Code (claude-opus-4-8)

---

## 1. 任務摘要

| 欄位 | 內容 |
|:--|:--|
| JOB | JOB-250（job_type: mixed）|
| 任務 | 南一三下自然重出，含 Phase A 溶解 KL4 反推 + Phase B 4 課出題 |
| 執行者 | Codex CLI gpt-5.5（訂閱制）＋ Claude Code claude-opus-4-8（PM 驗收）|
| 金鑰 | 訂閱制，全程未用任何 API key |
| 完成 | 2026-06-14（含 L4 重跑）|

---

## 2. 南一結構釐清（本 JOB 關鍵）

南一三下是三版本最複雜的，現有題庫與課綱結構性錯位。經查證（manifest 課名 + 113 官方評量卷實證）：

- **現有題庫 L3 內容錯置**：manifest 標題「天氣特派員」（天氣），但內容塞了動物題
- **南一 113 真實結構**：L1 種菜（植物）/ L2 溫度物質（水）/ L3 天氣特派員（**天氣**）/ L4 廚房中的科學（**溶解**）—— **無動物課**
- 113 兩次評量動物題 0；動物為現有 L3 錯置/舊版殘留
- 依使用者裁定「對齊現行 113 版」「考古題反推」執行

---

## 3. 成果

### Phase A：溶解課 KL4 反推（research）

- 用南一溶解考古題（113 第二次評量溶解 27 題、108 各校第二次段考、「融化/溶解混用」迷思）反推
- 產出：`KL4_三下_南一_廚房中的科學_單課研究紀錄.md`（194 行、20 章節）+ `_考古題與討論.md`（253 行、21 章節）
- §二知識點地圖涵蓋：溶解概念、溶解 vs 融化區辨、溶解與溫度、質量守恆、可逆性，含守衛點

### Phase B：4 課出題

| 課 | 主題 | KL4 來源 | 題數 | CQI-P |
|:--|:--|:--|:--|:--|
| L1 種菜好好玩 | 植物 | 南一 KL4 L1 | 50 | 7.17 |
| L2 溫度影響物質的變化 | 水/三態 | 南一 KL4 L2 | 50 | 7.20 |
| L3 天氣特派員 | **天氣**（原動物→改天氣）| 南一 KL4 L4 天氣 | 50 | 7.20 |
| L4 廚房中的科學 | **溶解** | Phase A 新建溶解 KL4 | 50 | 7.14 |

共 200 題。全課 quality=QL3、認知配比 4:4:2、biasWarning=null、完全重複 0、validate 0 errors。

### L3/L4 對齊 113

- L3 內容由「動物」改為「天氣」（氣溫測量/百葉箱/雨量），對齊 113
- L4 維持「溶解」（砂糖/食鹽溶解、可溶性比較、含溫度條件）
- 棄用現有 L3 動物題（113 無動物課）

---

## 4. 技術事件：L4 codex hang 處置

- L4 首次出題時 codex 卡在 reasoning（xhigh）17.5 分鐘無輸出（其他課 5-7min），判定 hang
- 處置：kill 卡住進程 → 用 xhigh 預設重跑（加 900s timeout 防再卡）→ 成功（50 題，CQI-P 7.14）
- **未修改全域 config**（曾嘗試降 reasoning 加速，被權限攔截，撤回，改以重跑解決）

---

## 5. 異動清單

- `knowledge/1_課綱研究/自然/三下/南一/KL4_三下_南一_廚房中的科學_{單課研究紀錄,考古題與討論}.md`（Phase A 新建）
- `question/platform/G3/Science/S2/NanYi/G3_S2_SCI_NANYI_L{1-4}.json`（各 50 題，L3 改天氣）
- `..._manifest.json`（count 50×4、blind_tested=0、QL3、avg_cqi）
- `scripts/jobs/JOB-250/`（phase_a_kl4.sh、gen_prompts.py、dispatch.sh、_prompts/、_logs/）

---

## 6. 品質狀態

- 新題 `blind_evaluation=false`、`is_publishable=false`、QL3、`review_status=pending`
- 未盲測，blind_tested 歸 0；需另開 question_verify 升 QL4 上架
- authoring_model：真實 gpt-5.5（200 題）

---

## 7. 結案 Checklist

- [x] README_專案發展紀錄已觸發 /pj_sync（JOB-250 記錄新增）
- [x] /pj_sync 已執行

---

## 8. 驗收 Checklist 對照

- [x] Phase A 溶解 KL4 雙檔產出（194/253 行，非空殼）
- [x] 4 課各 50 題（共 200 題）
- [x] 各課 CQI-P ≥ 5.5（7.14-7.20）
- [x] validate 0 errors（南一自然 4 檔）
- [x] L3 內容=天氣、L4 內容=溶解（對齊 113，棄動物）
- [x] 無 BIAS、無重複、達 QL3

---

## 9. 遺留問題

1. 三下自然三版本（康軒/翰林/南一）重出完成，均未盲測 QL3，需另開 question_verify 升 QL4 上架。
2. 南一 113 結構（無動物課）依 manifest 課名 + 113 考卷推定；若後續取得南一實體課本目錄可再核實。
3. 南一現有 KL4 L3 動物研究（JOB-247 產出）113 版未使用，保留備查。

---

## 10. 模型與成本

＄作業匯總：Token數:- | 花費: 訂閱制無單次計費 | 使用模型: Codex gpt-5.5（訂閱制）+ claude-opus-4-8 | 執行者: AG + Claude Code
