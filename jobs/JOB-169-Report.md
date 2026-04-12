# JOB-169-Report — G4S2 自然三版本補題盲測至上版（結案，含南一重產後最終盲測）

`last_updated`: 2026-04-10 18:45  
`updated_by`: Cursor Agent（Composer）  
**派工單**：`jobs/JOB-169-AG-G4S2-自然三版本補題盲測至上版.md`  
**執行模型**：題庫審查與腳本套用（本機 Node）；南一最終盲測 `Gemini-3.1-Flash-Lite`（欄位已寫入 JSON）。

---

## 1. 範圍與產出

| 項目 | 說明 |
|:--|:--|
| 題庫路徑 | `question/platform/G4/Science/S2/{KangHsuan,HanLin,NanYi}/` |
| manifest | `node scripts/normalize_manifest.js question/platform/G4/Science/S2` |
| 套用腳本 | `scripts/j169_phase3_apply.js`（`J169_SKIP_PATCH=1` `J169_SKIP_ORPHAN=1` 僅重算 `is_publishable`／review，**略過**舊南一 Mismatch patch 與 orphan 補索引，避免覆寫重產後題文） |

---

## 2. 南一重產與最終盲測（Phase 4）

| 項目 | 結果 |
|:--|:--|
| 重產 | 依 KL4 全檔重產 **120** 題（L1–L4 × 30），品質檢核通過後進盲測 |
| 指令 | `node scripts/run_blind_eval.js question/platform/G4/Science/S2/NanYi --force` |
| 統計 | **命中 120／失敗 0（100% Match）**；無 `blind_eval_mismatch` 需 TYPE-A/B/C 審查 |
| 驗證模型 | `Gemini-3.1-Flash-Lite`；`verifying_date`: 2026-04-10 |

---

## 3. 康軒／翰林盲測與 Mismatch（Phase 2–3 摘要）

| 版本 | Match／Mismatch（歷史執行） | Phase 4 後說明 |
|:--|:--|:--|
| 康軒 L1–L4 | 120 Match／0 Mismatch | 維持全 Match；各課 30 題可上版 |
| 翰林 L1–L4 | 116 Match／4 Mismatch | TYPE-A 2、TYPE-B 2 已於 Phase 3 處置；見下節翰林 ai=-1 |
| 南一（舊批） | 曾為大量 Mismatch | **已由重產＋本輪盲測取代**；舊 triage 不再適用新題文 |

---

## 4. Mismatch 分類（TYPE-A／B／C）— 全案累計

| 類型 | 件數 | 處置 |
|:--|:--:|:--|
| **TYPE-A**（AI 幻覺，題庫答案可採信） | 2 | `review_status: confirmed`、`is_publishable: true`（翰林 L1） |
| **TYPE-B**（原題錯誤／選項汙染） | 2 | 修正題幹／選項／`answer_index`；`review_status: corrected`（翰林 L3、L4 各 1） |
| **TYPE-C** | 0 | — |
| **南一（最終批）** | 0 | 全 Match，無需分類 |

### 翰林 TYPE-A 清單

| 檔案 | 題序（0-based） | 摘要 |
|:--|:--:|:--|
| `HanLin/G4_S2_SCI_HANLIN_L1.json` | 7 | 磁鐵隔紙吸釘：正解為複合選項「A 和 B 都對」，盲測僅選單句。 |
| `HanLin/G4_S2_SCI_HANLIN_L1.json` | 11 | 力的大小標示：課綱強調形變量測，維持答案橡皮筋伸長量（非「以上皆是」）。 |

### 翰林 TYPE-B 清單

| 檔案 | 題序（0-based） | 說明 |
|:--|:--:|:--|
| `HanLin/G4_S2_SCI_HANLIN_L3.json` | 11 | 昆蟲翅腳題選項誤植；已改四選一並設答案。 |
| `HanLin/G4_S2_SCI_HANLIN_L4.json` | 2 | 並聯亮度題選項誤植；已改題幹＋選項並設「亮度不變」。 |

---

## 5. `ai_selected: -1`（嚴格不可上版）

腳本規則：`blind_eval_mismatch.ai_selected === -1` → **`is_publishable: false`**（不得改 true），**即使**頂層 `review_status` 已為 `corrected`。

| 檔案 | 題序（0-based） | 說明 |
|:--|:--:|:--|
| `HanLin/G4_S2_SCI_HANLIN_L3.json` | 11 | TYPE-B 已改選項與答案；盲測區塊仍留 `ai_selected: -1` → 不可上版 |
| `HanLin/G4_S2_SCI_HANLIN_L4.json` | 2 | 同上（並聯亮度題） |

> 後續若重跑盲測該題並取得 Match，可刪除 `blind_eval_mismatch` 後再依規則開放 `is_publishable`。

---

## 6. `is_publishable` 規則（實作，`j169_phase3_apply.js`）

| 條件 | 結果 |
|:--|:--|
| `blind_eval_mismatch.ai_selected === -1` | `false` |
| `answer_index` 無效（`-1`／`null`）或 `options` 為空 | `false` |
| `blind_evaluation !== true` | `false` |
| 有 `blind_eval_mismatch` 且頂層 `review_status` 為 `confirmed`／`corrected`（且非上述 ai=-1） | `true` |
| 無 `blind_eval_mismatch` 且盲測完成 | `true`；`pending_review` → `confirmed` |

---

## 7. 各課 `is_publishable: true` 題數（結案統計）

| 版本 | L1 | L2 | L3 | L4 |
|:--|:--:|:--:|:--:|:--:|
| **康軒** | 30 | 30 | 30 | 30 |
| **翰林** | 30 | 30 | **29** | **29** |
| **南一** | 30 | 30 | 30 | 30 |

- **課級門檻**：各課 **≥ 25** — 全數達標。  
- **合計可上版題數**：**358**（360 − 2 題翰林 ai=-1 不可上版）。

---

## 8. 異動清單（高層次）

- `question/platform/G4/Science/S2/NanYi/*.json`：重產題組、最終盲測欄位、`is_publishable`／`review_status`／`review_notes`（南一 Match 結案句）。
- `question/platform/G4/Science/S2/*/*_manifest.json`：`normalize_manifest.js` 重算。
- `scripts/j169_phase3_apply.js`：新增 `J169_SKIP_ORPHAN=1` 略過 orphan 補索引；`setPublishableAll` 納入 **ai_selected=-1** 閘門；南一 Match 之 `review_notes` 專用文案。

---

## 9. 驗證

- `node scripts/run_blind_eval.js question/platform/G4/Science/S2/NanYi --force` — 120/120 Match。
- `J169_SKIP_PATCH=1 J169_SKIP_ORPHAN=1 node scripts/j169_phase3_apply.js` — 已執行。
- `node scripts/normalize_manifest.js question/platform/G4/Science/S2` — 通過。

---

## 10. 遺留問題（建議 PM）

1. **翰林 L3／L4 各 1 題**仍為 `ai_selected: -1`：可排 **重測該單題** 或人工裁定後清除 mismatch 再設 `is_publishable`（現依規則維持 false）。  
2. **TYPE-B 比例（舊南一批次）**：已因重產結案；若需歷史稽核可對照 git 舊版。

---

## 11. 指令回報

- 盲測主控台：`run_blind_eval.js` 輸出「命中: 120 / 失敗: 0 (100.0%)」。

---

## 驗收標準 (DoD)

- [x] 南一 `--force` 盲測完成  
- [x] Mismatch／ai=-1 規則與 `is_publishable` 一致化  
- [x] 各課可上版題數 ≥ 25  
- [x] `normalize_manifest`  
- [x] Report 與 `/pj_sync`  
- [x] `job_manager.js close JOB-169`

---

## 真實回報本次對話的模型與花費

＄作業匯總：Token 數: 未提供 | 花費: 未提供 | 使用模型: Composer（Cursor）
