# JOB-166-Report：修正盲測 R4 映射（KL4 優先）與南一 L1/L2/L3/L8 重測

`last_updated`: 2026-04-09 08:40  
`updated_by`: Cursor Agent（執行模型：與使用者設定一致；盲測 API：`gemini-3.1-flash-lite-preview`）

---

## 1. 執行摘要

- 已於 `scripts/run_blind_eval.js` 新增 **G3 國語 S2（三下）** 之 **KL4 單課研究檔優先** 邏輯：路徑含 `Chinese`＋`G3`＋`S2` 且出版社資料夾為 `KangHsuan`／`HanLin`／`NanYi` 時，若存在對應 `knowledge/課綱研究/國語/三下/{康軒|翰林|南一}/KL4_三下_*_{L?}_*_單課研究紀錄.md`，則 **直接讀檔全文作為 R4 context**，**不呼叫** `extractR4Context`（省 LLM 萃取）。
- 已依派工單對南一 **L1、L2、L3、L8** 四課執行 **`run_blind_eval.js --force`**；執行 log：`.logs/JOB-166-blind-eval_20260409_073638.log`。
- 重跑後 **四課 `ai_selected: -1` 皆為 0**（L1 由 10 → 0，達派工「≤3」目標）。
- 四課合計 **1 題 Mismatch**（L2 第 3 題，0-based index 2）：AI 選 (2)、題庫 (1)，屬 **TYPE-C**（想像／投射兩解部分合理），已以 `job165_apply_triage.js` 回寫 `mismatch_triage`、`review_status: confirmed`；**TYPE-B 0 題**（本四課範圍內比例 0%）。

---

## 2. 重跑前後 `ai_selected === -1` 對照

| 課次 | 重跑前 | 重跑後 |
|:--|:--:|:--:|
| L1 | 10 | **0** |
| L2 | 2 | **0** |
| L3 | 2 | **0** |
| L8 | 3 | **0** |

（重跑前數字為重跑當下以 `grep "ai_selected": -1` 於各檔之筆數。）

---

## 3. 四課 `is_publishable: true` 題數（佐證）

| 檔案 | is_pub true / 總題 |
|:--|:--:|
| `G3_S2_CHI_NANYI_L1.json` | 30 / 30 |
| `G3_S2_CHI_NANYI_L2.json` | 28 / 28 |
| `G3_S2_CHI_NANYI_L3.json` | 30 / 30 |
| `G3_S2_CHI_NANYI_L8.json` | 25 / 25 |

皆 **≥ 25**。

---

## 4. 盲測執行面

- **驗證模型（腳本 log）**：`Gemini-3.1-Flash-Lite`
- **金鑰**：`ApiKeys.cfg` free tier（log：`金鑰佈陣: free, free`）
- **終端彙總**（四課合計）：`命中: 112 / 失敗: 1`（99.1% Match）

---

## 5. 程式異動（Phase 1 關鍵）

| 檔案 | 說明 |
|:--|:--|
| `scripts/run_blind_eval.js` | 新增 `GUO_YU_XIA_SAN_DIR`、`resolveChinesePublisherFolderZh`、`resolveLessonKeyFromFileOrMeta`、`findKl4XiaSanSingleLessonRecord`；主迴圈在 `extractR4Context` 前若解析到 KL4 檔則直接 `readFileSync` 作為 `r4Context` |

**向後相容**：非 G3／非 S2／非 `Chinese`／無出版社資料夾／無對應 KL4 檔時，行為與舊版相同（`getR4Path` + `extractR4Context`）。數學、社會、自然、英語等科目 **不觸發** KL4 分支。

---

## 6. Mismatch 審查（Phase 3）

| 分類 | 題數 | 說明 |
|:--|:--:|:--|
| TYPE-A | 0 | 本四課重跑後無新增需歸 A 之 pending |
| TYPE-B | 0 | 無修正答案 |
| TYPE-C | 1 | `G3_S2_CHI_NANYI_L2.json` questions[2]（洋娃娃／想像與投射），保留題庫 `answer_index: 1` |

---

## 7. Checklist 對照

- [x] R4 查找邏輯修正完成（見 §5）
- [x] 向後相容（僅 G3 國語 S2 + 三下 KL4 目錄；見 §5）
- [x] 重跑前後 ai=-1 對照（§2）
- [x] 四課 is_publishable ≥ 25（§3）
- [x] 本四課 TYPE-B 比例 0%（≤5%）
- [x] Mismatch 分類（§6）

---

## 8. 真實模型與花費

- **盲測**：`gemini-3.1-flash-lite-preview`（與腳本內嵌端點一致）
- **Cursor 對話**：無法讀取真實 Token Meta → 填 **未提供**

＄作業匯總：Token數: 未提供 | 花費: 未提供 | 使用模型: Cursor 內建代理模型 / gemini-3.1-flash-lite-preview | 執行者: Cursor

---

## DoD（結案勾選）

- [x] 已執行 /pj_sync 全域知識沉澱（已更新 `docs/進度彙整_題庫研發與產出.md`、`docs/README_專案發展紀錄.md`）
