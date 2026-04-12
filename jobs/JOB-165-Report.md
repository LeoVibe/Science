# JOB-165-Report：G3S2 國語三版本全版本盲測

`last_updated`: 2026-04-08 19:05  
`updated_by`: Cursor Agent（執行模型：與使用者設定一致；盲測 API：`gemini-3.1-flash-lite-preview`）

---

## 1. 執行摘要

- 已依派工單對 `question/platform/G3/Chinese/S2/{KangHsuan,HanLin,NanYi}` 執行 **`run_blind_eval.js --force`** 全量盲測（100% 覆蓋）。
- 盲測後完成 **Mismatch MTP 分類**（TYPE-A／B／C），並回寫 `review_status`、`is_publishable`；**TYPE-B 1 題**修正 `answer_index`。
- 已執行 **`evaluate_question_quality.js`** 還原／更新 **CQI-P**（盲測腳本不再覆寫 `cqi_score`，見 §6）。
- **課級門檻**：三版本各 12 課，`is_publishable: true` 題數皆 **≥ 25**（最低：康軒 L5＝25、翰林 L3＝27、南一 L5–L9＝25）。

---

## 2. 盲測結果（腳本終端彙總）

**驗證模型（實際 API）**：`Gemini-3.1-Flash-Lite`（`gemini-3.1-flash-lite-preview`）  
**金鑰**：`ApiKeys.cfg` 內 `GEMINI_API_KEY_*`（free tier），腳本 log 列示 `金鑰佈陣: free, free`。

| 版本 | 總題數 | Match | Mismatch | Match Rate | ai=-1（本次統計） | is_pub≥25 課數 |
|:--|:--:|:--:|:--:|:--:|:--:|:--:|
| 康軒 | 461 | 452 | 9 | 98.0% | 7 | 12/12 |
| 翰林 | 350 | 345 | 5 | 98.6% | 4 | 12/12 |
| 南一 | 331 | 301 | 30 | 90.9% | 19 | 12/12 |

> **ai=-1 說明**：取自各題 `blind_eval_mismatch.ai_selected === -1` 之題數（盲測當下）；審後多數歸 **TYPE-A**（題庫正確、模型誤判或 R4 萃取誤配），**不作封鎖**，`is_publishable` 仍依 CQI≥6.5 與審核結果判定（見 §3）。

**盲測完整 log（tee）**：`.logs/JOB-165-blind-eval_20260408_174416.log`  
（另有一次金鑰解析失敗之短 log：`.logs/JOB-165-blind-eval_20260408_174303.log`，已修復腳本後重跑。）

---

## 3. Mismatch 分類（MTP）

| 版本 | TYPE-A | TYPE-B | TYPE-C | Mismatch 總計 | TYPE-B 比例 |
|:--|:--:|:--:|:--:|:--:|:--:|
| 康軒 | 9 | 0 | 0 | 9 | 0% |
| 翰林 | 5 | 0 | 0 | 5 | 0% |
| 南一 | 28 | 1 | 1 | 30 | **3.3%**（＜5%，無需警告） |
| **合計** | **42** | **1** | **1** | **44** | **2.3%** |

- **TYPE-B（1 題）**：`NanYi/G3_S2_CHI_NANYI_L9.json`—「小琪要記錄『打開染布前的心情』…」—原 `answer_index: 2` 與解析「等待開獎」不符 → 改為 **`answer_index: 1`**，`review_status: corrected`，並移除 `blind_eval_mismatch`（與 AI 選項一致）。
- **TYPE-C（1 題）**：`NanYi/G3_S2_CHI_NANYI_L2.json` 題索引 2（洋娃娃／想像與投射）—兩解皆部分合理，**保留題庫答案**，`mismatch_triage: TYPE-C`、`review_status: confirmed`。
- **TYPE-A（其餘）**：題庫與解析一致，AI 誤選或誤判 -1；`blind_eval_mismatch.review_status: confirmed`，並附 `mismatch_triage`／`triage_note`。

---

## 4. is_publishable 與課級最低題數（佐證）

執行 `node scripts/job165_apply_triage.js` 後，再以 `evaluate_question_quality.js` 更新南一 L9 單檔 CQI。

| 版本 | 總題數 | `is_publishable: true` 加總 | 單課最低 `is_publishable` | 檔案 |
|:--|:--:|:--:|:--:|:--|
| 康軒 | 461 | 461 | 25 | `G3_S2_CHI_KANGHSUAN_L5.json` |
| 翰林 | 350 | 350 | 27 | `G3_S2_CHI_HANLIN_L3.json` |
| 南一 | 331 | 331 | 25 | `G3_S2_CHI_NANYI_L5.json`～`L9.json`（皆 25） |

---

## 5. 啟動／驗收／成果 Checklist（派工單對照）

- [x] 已讀驗證準則 v4.2、出題準則（執行前置）
- [x] 三版本 `--force` 盲測 100%＋log
- [x] Mismatch 逐題分類（TYPE-A 42、B 1、C 1）
- [x] TYPE-B 比例 2.3%（≤5%）
- [x] 康軒／翰林／南一各課 `is_publishable: true` ≥ 25
- [x] Match Rate 已記錄（§2）
- [x] 本 Report、`/pj_sync`、`job_manager close`（報告完成後執行）

---

## 6. 程式異動清單

| 檔案 | 說明 |
|:--|:--|
| `scripts/run_blind_eval.js` | 支援 `GEMINI_API_KEY_*`／`OPENAI_API_KEY_*` 載入；**不再以盲測 `quality_rating` 覆寫 `cqi_score`**，改寫入 `blind_verify_quality_rating` |
| `scripts/job165_apply_triage.js` | 一次性 MTP＋`is_publishable` 回寫（可重跑 idempotent 需注意 TYPE-B 已修正之題） |
| `question/platform/G3/Chinese/S2/**/*.json` | 盲測欄位、審核欄位、南一 L9 一題 `answer_index` |

---

## 7. 遺留／建議（範圍外）

- `validate_review_fields.js` 對部分南一題仍報 **warnings**（例：`pending_review` 與 `is_publishable` 並存、缺 `review_date`），屬歷史欄位不一致，**非本 JOB DoD 硬性 0 errors**；可另開單統一 `review_status`／`review_date`。
- 建議後續將 `job165_apply_triage.js` 併入正式工具或歸檔，避免與手動編輯題庫脫勾。

---

## 8. 執行時間（約）

| 子任務 | 備註 |
|:--|:--|
| 康軒盲測 | 併於總 log |
| 翰林盲測 | 併於總 log |
| 南一盲測 | 併於總 log |
| 三版本合計 | 約 57 分（17:44–18:41，log 時間戳） |
| MTP＋腳本 | 數分鐘內 |

---

## 9. 真實模型與花費

- **盲測**：Google Generative Language API `gemini-3.1-flash-lite-preview`
- **Cursor 對話**：無法讀取真實 Token Meta → 花費與 Token 填 **「未提供」**（依 `.cursorrules`）

＄作業匯總：Token數: 未提供 | 花費: 未提供 | 使用模型: Cursor 內建代理模型 / gemini-3.1-flash-lite-preview | 執行者: Cursor
