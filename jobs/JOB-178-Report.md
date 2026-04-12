# JOB-178-Report — G5S2 國語三版本盲測

`last_updated`: 2026-04-12  
`updated_by`: Cursor（執行環境：canonical repo）  
`verifying_model`: `Gemini-3.1-Flash-Lite`（與 `scripts/run_blind_eval.js` 內嵌端點一致）

---

## 1. 執行摘要

- 已於 **`question/platform/G5/Chinese/S2/{HanLin,KangHsuan,NanYi}`** 完成首次全量盲測（含 `--force`），並執行 **`evaluate_question_quality.js`**、**`j178_g5s2_chinese_apply.js`**（幽靈 mismatch 清除規則＋`is_publishable` 規則）、**`validate_review_fields.js`**（exit 0）。
- **未達派工單 DoD**：大量課次 **`is_publishable: true` 仍低於 25**；**Mismatch 未完成 TYPE-A/B/C 人工逐筆 triage**（僅機械規則回寫）。
- 派工單步驟 2 之指令路徑有誤（`Chinese G5 S2 HanLin` 非目錄），實際以 **`question/platform/G5/Chinese/S2/...`** 執行。

---

## 2. 腳本修正（`run_blind_eval.js`）

| 問題 | 修正 |
|:--|:--|
| 五下國語 R4 映射檔不存在（`KL5_S2_國語_發展綱要.md`） | 改為 `五下/KL3_五下_國語_發展綱要.md` |
| 題庫 L 序與 KL4 檔 L 序不一致時，誤用他課 KL4 | 有 `meta.title` 時：僅採用「標題相符**且**檔名課次與本 JSON 課次一致」之 KL4；否則改走課次前綴或 LLM 萃取 |
| `meta.title` 為占位（如 `L12`） | 視同無效課名，改走課次對應 KL4；`lessonLabel` 同步邏輯 |
| 標題對到他課但課次不符（例：康軒 L2 檔 `meta.title` 誤植為 L3 課名） | 不再採用該 KL4，改以課次前綴選檔 |

**康軒**：首輪盲測曾受「僅標題比對」影響導致整體 Match 偏低；已以修正後腳本對 **康軒目錄全量 `--force` 重跑**（見 `.logs/JOB-178-blind-eval-kanghsuan-rerun.log`）。  
**翰林**：占位課名之 L7／L9／L12 已補跑（`.logs/JOB-178-hanlin-placeholder-rerun.log`）。

---

## 3. 盲測 Match（敘述性指標，僅供參考）

| 版本 | 來源（本輪 log 摘要） | Match 概況 |
|:--|:--|:--|
| 翰林 | `.logs/JOB-178-blind-eval.log` 內「HanLin 目錄」結尾區段 | **356 / 635（約 56.1%）** |
| 康軒 | 首輪同 log | 187 / 510（約 36.7%，已於修正腳本前） |
| 康軒 | **重跑** `.logs/JOB-178-blind-eval-kanghsuan-rerun.log` | **223 / 510（約 43.7%）** |
| 南一 | `.logs/JOB-178-blind-eval.log` | 192 / 471（約 40.8%） |

> 單一批次 Match 波動大（模型隨機性／題幹難度），Match Rate 依 `question/README_驗證與盲測準則.md` 不作為唯一封鎖條件。

---

## 4. `is_publishable` 機械回寫結果（`j178_g5s2_chinese_apply.js`）

規則摘要：`ai_selected === -1` 或仍有未結案 `blind_eval_mismatch` → `false`；盲測完成且無 mismatch 且 **`cqi_score ≥ 6.5`** → `true` 並將原 `pending_review` 改 **`confirmed`**（其餘維持 `false`）。

### 4.1 各課可上版題數（低於 25 者列於 `lessons<25`）

執行：`node -e` 掃描 36 檔（略，見執行紀錄）。

- **翰林**：L2、L3、L4、L6 等課達標；**L5、L7–L12、L10、L11** 等多課 **publishable &lt; 25**。
- **康軒**：**多數課次 publishable &lt; 25**（題檔總題數亦不均，如 L6 僅 9 題）。
- **南一**：L3、L6、L7 等部分達標；**L1、L2、L4、L5、L8、L9、L10–L12** 等 **publishable &lt; 25**。

**三版本合計可上版題數（機械規則）約**：翰林 274 + 康軒 212 + 南一 155 = **641 / 1616**。

---

## 5. 品質闸門與驗證指令

| 項目 | 結果 |
|:--|:--|
| `evaluate_question_quality.js question/platform/G5/Chinese/S2` | 已執行（輸出存 `.logs/JOB-178-eval.json`） |
| `validate_review_fields.js` | **0 errors**（全庫 walk 仍有其他年級 **warnings**，與本 JOB 無關） |
| 幽靈 mismatch（`ai_selected === correct_answer`） | 本輪統計 **0 筆**（清除邏輯已內建於 `j178`） |

---

## 6. `normalize_manifest`

- 已對 **`apps/v3_eidos/public/question/platform/G5/Chinese/S2/{HanLin,KangHsuan,NanYi}/manifest.json`** 執行 `normalize_manifest.js`（更新 `items[].count` 等）。
- **說明**：根目錄 **`question/platform/G5/Chinese/S2`** 使用 **`G5_S2_CHI_*_manifest.json`** 命名，`normalize_manifest.js` 僅掃描檔名 **`manifest.json`**，故**未**自動正規化該批檔名；盲測與 `is_publishable` 僅寫入 **`question/platform/...`**。若前台部署依賴 `apps/v3_eidos/...` 之獨立題檔，需另開同步／派工。

---

## 7. 文件同步（`/pj_sync`）

- 已更新：`docs/進度彙整_題庫研發與產出.md`（G5S2「國文」列題數／可上版數／備註）、`docs/README_專案發展紀錄.md`（JOB-178 列）。

---

## 8. 遺留與建議後續

1. **Mismatch 人工 triage**（TYPE-A/B/C）與必要時 **修正 `answer_index` 或題幹**；高 Mismatch 課次建議檢查 **題文與教材／KL4 是否一致**。  
2. **補齊 `meta.title` 占位**（翰林 L7、L9、L12 等），並對疑義課次 **重跑盲測**（可僅針對單檔 `--force`）。  
3. **課級門檻**：未達每課 **≥25** 可上版者，依準則需 **補題或修題** 後再驗證。  
4. **派工單指令勘誤**：建議將 `run_blind_eval.js` 範例改為  
   `node scripts/run_blind_eval.js question/platform/G5/Chinese/S2/HanLin --force`  
   （以此類推）。

---

## 9. 真實回報（本對話）

＄作業匯總：Token數: 未提供 | 花費: 未提供 | 使用模型: 未提供 | 執行者: Cursor

API 帳戶／QPM：請由執行者本機 `ApiKeys.cfg`／Google Cloud 後台查閱；本 Report 無法讀取真實 Token Meta。

---

## 10. 驗收 Checklist 對照（派工單）

| 項目 | 狀態 |
|:--|:--|
| 翰林 Match ≥85%（各課） | **未驗收**（且準則已載明 Match 為描述性指標；實測多課批次波動大） |
| 康軒／南一同上 | 同上 |
| 全部 Mismatch triage 完畢 | **否** |
| 幽靈 mismatch 清除 | **已實作並執行**（本資料集為 0 筆） |
| 各課 publishable ≥25 | **否**（見 §4） |
| `validate_review_fields.js` → 0 errors | **是**（errors=0） |

**結論**：本 JOB 以「盲測管線修復＋全量首測＋機械回寫」為主成果；**結案 DoD 尚未滿足**，建議後續開 **補 triage／修 meta／補題** 之子任務。
