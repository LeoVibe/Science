# JOB-164-Report：G3S2 國語三版本 CQI-P 補強

`last_updated`: 2026-04-08 18:30  
`updated_by`: Cursor Agent（執行模型：**composer-2**，使用者已核准）  
`job_ref`: `jobs/JOB-164-AG-G3S2-國語三版本CQI補強至QL4.md`

---

## 1. 摘要

- **Phase 1**：修正 `evaluate_question_quality.js` 之研究檔定位——題庫 `meta.subject` 為 `CHI` 時已能對應「國語」目錄；改為**遞迴**搜尋 `knowledge/1_課綱研究/國語/` 下之 `*發展綱要*.md`；**三下國語**無獨立 KL3 發展綱要時，改採 `KL4_三下_國語_原始研究素材庫.md` 作為研究支撐檢查依據。派工單所述舊版 **`gradeCN is not defined`**：目前程式第 65 行已使用 `gradeShort`，本次於 `subjectMap` 區段加註說明以免回歸。
- **Phase 2～3**：三版本全課重新跑分；清除 **BIAS**（選項長度偏差）；康軒補強過短解析；翰林 **78** 題 `explanation` 長度 ≤10 字之欄位，統一擴寫為符合結構完整度之敘述。
- **Phase 4**：執行 `node scripts/normalize_manifest.js question/platform/G3/Chinese/S2`，同步三版本 `G3_S2_CHI_*_manifest.json` 之統計（題數未變，**康軒 461、翰林 350、南一 272** 題；與派工單預估題數不同處以本 repo 實際檔案為準）。
- **盲測**：未執行（依派工單範圍排除）。**規範文件**：未修改。

---

## 2. 啟動 Checklist（Pre-Flight）— 實填

| 項目 | 狀態／內容 |
|:--|:--|
| 已讀 `question/README_出題與品管準則.md` | 是 |
| 已讀 `question/README_驗證與盲測準則.md`（v4.2） | 是 |
| `evaluate_question_quality.js` 國語路徑／研究檔 bug | 已修：遞迴搜尋＋三下 KL4 fallback；`gradeCN` 註記澄清 |
| 執行模型 | **composer-2**（使用者核准） |
| 金鑰 | 本 JOB 未呼叫付費 LLM API；CQI-P 為腳本規則計分 |
| 題庫路徑 | `question/platform/G3/Chinese/S2/{KangHsuan,HanLin,NanYi}/` |

---

## 3. 驗收 Checklist（Acceptance）— 實填

| 項目 | 佐證 |
|:--|:--|
| 國語路徑執行 `evaluate_question_quality.js` 不拋錯 | 下節「指令輸出摘要」；三版本 `exit 0` |
| 康軒各課 CQI-P 平均 ≥ 5.5 | 最低 **L11 8.33**（12 課皆 ≥5.5） |
| 翰林各課 CQI-P 平均 ≥ 5.5 | 最低 **L2 7.97**（12 課皆 ≥5.5） |
| 南一各課 CQI-P 平均 ≥ 5.5 | 最低 **L12 8.59**（12 課皆 ≥5.5） |
| 每題 `scenario` 非空、`explanation`、`commonMisconception` | 腳本掃描三版本：`empty scenario=0`，`explanation≤10字=0` |
| `answer_index` 與 `explanation` 一致性 | 本次僅 `auto_balance_json.js` 已內建替換「正確答案為(X)」字樣；未改動正解邏輯；抽樣閱讀無矛盾 |

---

## 4. 指令輸出摘要（驗收佐證）

```text
$ node scripts/evaluate_question_quality.js question/platform/G3/Chinese/S2/KangHsuan
# exit 0；summary.totalQuestions=461；qualityDist「QL1 (BIAS)」=0

$ node scripts/evaluate_question_quality.js question/platform/G3/Chinese/S2/HanLin
# exit 0；summary.totalQuestions=350；qualityDist「QL1 (BIAS)」=0

$ node scripts/evaluate_question_quality.js question/platform/G3/Chinese/S2/NanYi
# exit 0；summary.totalQuestions=272；qualityDist「QL1 (BIAS)」=0

$ node scripts/test_golden_cases.js
# 全部 PASS
```

---

## 5. 各課 CQI-P 對照表（補強前 → 補強後）

> **補強前**為腳本修復研究路徑後、內容補強／`auto_balance` 前之一輪跑分（與本 Report 同一支 `evaluate_question_quality.js`）。**補強後**為最終跑分。

### 5.1 康軒（KangHsuan）

| 課次 | 補強前 CQI-P | 補強後 CQI-P | 補強題數（約） |
|:--:|:--:|:--:|:--:|
| L1 | 8.08 | 9.03 | 0 |
| L2 | 7.67 | 8.71 | 0 |
| L3 | 8.26 | 9.05 | 2（補齊 `scenario` 非空） |
| L4 | 7.57 | 8.73 | 全檔選項平衡（BIAS 清除） |
| L5 | 8.05 | 9.07 | 0 |
| L6 | 6.97 | 8.16 | 全檔選項平衡（BIAS 清除） |
| L7 | 7.78 | 8.63 | 0 |
| L8 | 7.92 | 8.56 | 1（擴寫過短 `explanation`） |
| L9 | 7.67 | 8.78 | 0 |
| L10 | 7.67 | 8.57 | 0 |
| L11 | 7.29 | 8.33 | 0 |
| L12 | 7.56 | 8.49 | 0 |

### 5.2 翰林（HanLin）

| 課次 | 補強前 CQI-P | 補強後 CQI-P | 補強題數（約） |
|:--:|:--:|:--:|:--:|
| L1 | 7.95 | 8.70 | 若干題擴寫解析 |
| L2 | 7.01 | 7.97 | 同上 |
| L3 | 7.14 | 8.23 | 同上 |
| L4 | 7.76 | 8.71 | 同上 |
| L5 | 7.28 | 8.28 | 同上 |
| L6 | 7.38 | 8.33 | 同上 |
| L7 | 7.68 | 8.70 | 同上 |
| L8 | 6.83 | 8.10 | 全檔平衡＋若干題擴寫解析 |
| L9 | 6.71 | 8.05 | 同上 |
| L10 | 7.78 | 8.87 | 同上 |
| L11 | 8.22 | 8.91 | 同上 |
| L12 | 6.95 | 8.25 | 同上 |

**註**：翰林共 **78** 題 `explanation` 原 ≤10 字，已批次擴寫（多集中於 L11、L12 等檔）。

### 5.3 南一（NanYi）

| 課次 | 補強前 CQI-P | 補強後 CQI-P | 補強題數（約） |
|:--:|:--:|:--:|:--:|
| L1 | 7.49 | 8.64 | 全檔選項平衡（BIAS 清除） |
| L2 | 7.46 | 8.59 | 0 |
| L3 | 8.58 | 9.18 | 0 |
| L4 | 8.12 | 9.35 | 全檔選項平衡（BIAS 清除） |
| L5 | 8.42 | 9.36 | 0 |
| L6 | 8.00 | 9.13 | 0 |
| L7 | 8.66 | 9.41 | 0 |
| L8 | 8.25 | 9.25 | 0 |
| L9 | 8.52 | 9.27 | 0 |
| L10 | 8.05 | 8.80 | 0 |
| L11 | 7.80 | 8.65 | 0 |
| L12 | 7.69 | 8.59 | 0 |

---

## 6. 異動檔案清單（完整路徑）

### 6.1 腳本

- `scripts/evaluate_question_quality.js`（研究檔遞迴搜尋、三下國語 fallback、`gradeCN` 註記）
- `scripts/auto_balance_json.js`（支援**單一 JSON 檔**為參數，避免 `ENOTDIR`）

### 6.2 題庫 JSON（`question/platform/G3/Chinese/S2/…`）

- `KangHsuan/G3_S2_CHI_KANGHSUAN_L1.json`～`L12.json`（全 12 檔曾跑 `auto_balance`；**L3** 另手動補 2 題 `scenario`）
- `HanLin/G3_S2_CHI_HANLIN_L1.json`～`G3_S2_CHI_HANLIN_L12.json`（共 12 檔；其中含 78 題解析擴寫與／或平衡）
- `NanYi/G3_S2_CHI_NANYI_L1.json`
- `NanYi/G3_S2_CHI_NANYI_L4.json`

### 6.3 Manifest（normalize 後）

- `KangHsuan/G3_S2_CHI_KANGHSUAN_manifest.json`
- `HanLin/G3_S2_CHI_HANLIN_manifest.json`
- `NanYi/G3_S2_CHI_NANYI_manifest.json`

---

## 7. 遺留問題

- 派工單背景所述題數（467／481／395）與本 repo `question/platform` 實際總題數（461／350／272）不一致；若以題數為 KPI，建議 PM 另開盤點 JOB 確認是否另有題庫路徑或尚未匯入之檔案。
- 檔案級 `quality_level`（QL3／QL4）與單題 `cqi_score` 之聚合規則仍可能造成「單課平均已高但檔案標為 QL3」；本 JOB 驗收以**各課平均 CQI-P ≥ 5.5**為準。

---

## 8. 成果 Checklist

- [x] 本 Report 已產出
- [x] 含對照表、補強摘要、異動清單
- [x] 已執行 /pj_sync 全域知識沉澱（已更新 `docs/進度彙整_題庫研發與產出.md`、`docs/README_專案發展紀錄.md`；本任務無 UI 變更故未改規格書）
- [x] `node scripts/job_manager.js close JOB-164`（於本輪 pj_sync 更新文件後執行）
- [ ] 請 PM（Claude Code）依本 Report 驗收

---

## 9. 真實花費（本輪 Cursor 對話）

＄作業匯總：Token數: 未提供 | 花費: 未提供 | 使用模型: composer-2 | 執行者: Cursor
