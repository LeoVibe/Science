# JOB-167-Report — G3S2 數學／社會補題、盲測、Mismatch 審查、上版欄位

`last_updated`: 2026-04-10  
`updated_by`: Cursor Agent（執行 Phase 3 與結案）  
**對應派工單**：`jobs/JOB-167-AG-G3S2-數學社會補題盲測至上版.md`  
**執行模型**：`composer`（對話）／盲測模型依派工單：`gemini-3-flash-lite`（Phase 2，使用者已核准）

---

## 1. 補題結果（Phase 1，摘要）

| 版本 | 課次 | 說明 |
|:--|:--|:--|
| 社會康軒 | L2–L6 | 各課補至 30 題（各 +11） |
| 社會南一 | L1–L5 | 各課補至 30 題（各 +9） |

佐證：`node scripts/evaluate_question_quality.js` 各課 `count: 30`（康軒 L1 為既有較大題組 49 題，不在本次「補至 30」範圍外強制刪減）。

---

## 2. 盲測結果（Phase 2）

- **執行方式**：依派工單 `run_blind_eval.js`（數學 L3 單檔；社會康軒／南一目錄 `--force`）。
- **Log**：倉庫內 `.logs/` 未見 `JOB-167-*` 專屬檔名；Phase 2 已由 PM／執行者宣告檢核通過，本 Report 不另附檔路徑。

### 2.1 Match／Mismatch 概況（Phase 3 實測 JSON）

| 範圍 | 總題（約） | Mismatch 題數 | 備註 |
|:--|:--:|:--:|:--|
| 社會康軒 L1–L6 | 199 | 2 | L1、L4 各 1 |
| 社會南一 L1–L5 | 150 | 1 | L1 |
| 數學康軒 L3 | 30 | 8 | 皆已標 `blind_eval_mismatch` |

---

## 3. Mismatch 分類（TYPE-A／B／C）

### 3.1 社會（康軒 L1–L6、南一 L1–L5）

| 檔案 | 情境摘要 | 分類 | 處置 |
|:--|:--|:--|:--|
| `G3_S2_SOC_KANGHSUAN_L1.json` | 公園刻樹／通報管理員 vs 勸阻陌生人 | **TYPE-A** | `blind_eval_mismatch.review_status: confirmed`，`mismatch_triage`／`triage_note`；維持 `answer_index` |
| `G3_S2_SOC_KANGHSUAN_L4.json` | 公車讓座：引導空位 vs 默默讓座 | **TYPE-A** | 同上 |
| `G3_S2_SOC_NANYI_L1.json` | 博愛座：協調讓座 vs 自己讓座 | **TYPE-A** | 同上 |

- **TYPE-B**：0 題 → 比例 0%（&lt; 5% 門檻）。
- **TYPE-C**：0 題（社會範圍內）。

### 3.2 數學康軒 L3（8 題）

| 分類 | 題數 | 說明 |
|:--|:--:|:--|
| **TYPE-A** | 7 | 植樹索引錯誤、人數漏算、找零索引錯誤、AI 回傳 -1 等，題庫鍵與解析一致 |
| **TYPE-C** | 1 | 「80 本上櫃／空位」題：解析與選項語意易歧義，維持鍵並記錄待後續修題 |

- **TYPE-B**：0 題。

---

## 4. `is_publishable` 統計（Phase 3 完成後）

規則實作重點：

- **社會**：`composer-2` 新補題或原 `pending_review` 且已盲測通過者 → 一律 `is_publishable: true`；其餘舊題 Match 依 **CQI-P ≥ 6.5**；Mismatch 經 triage 後 → `true`。
- **數學 L3**：Mismatch 題維持可上架；另補齊 6 題曾 `blind_evaluation: true` 但未回寫 `is_publishable` 者（CQI ≥ 6.5）→ `true`。

### 4.1 各課 `is_publishable: true` 題數

| 版本 | 課次 | is_publishable=true |
|:--|:--|:--:|
| 社會康軒 | L1 | 49 |
| 社會康軒 | L2 | 30 |
| 社會康軒 | L3 | 30 |
| 社會康軒 | L4 | 30 |
| 社會康軒 | L5 | 30 |
| 社會康軒 | L6 | 30 |
| 社會南一 | L1 | 30 |
| 社會南一 | L2 | 29 |
| 社會南一 | L3 | 30 |
| 社會南一 | L4 | 30 |
| 社會南一 | L5 | 29 |
| 數學康軒 | L3 | 30 |

**南一 L2、L5**：各 1 題舊題 CQI-P **6.25**（略低於 6.5）、盲測 Match，依派工單門檻維持 `is_publishable: false`（該兩課仍 **29 ≥ 25** 課級門檻）。

---

## 5. 異動清單（程式／資料）

| 項目 | 路徑或指令 |
|:--|:--|
| Phase 3 批次腳本 | `scripts/job167_phase3_apply.js`（新建） |
| 社會 JSON | `question/platform/G3/SocialStudies/S2/KangHsuan/G3_S2_SOC_KANGHSUAN_L*.json`、`NanYi/G3_S2_SOC_NANYI_L*.json` |
| 數學 JSON | `question/platform/G3/Math/S2/KangHsuan/G3_S2_MATH_KANGHSUAN_L3.json` |
| Manifest | `node scripts/normalize_manifest.js question/platform/G3/Math/S2`；`node scripts/normalize_manifest.js question/platform/G3/SocialStudies/S2` |
| 驗證 | `node scripts/validate_review_fields.js`（通過；他科既有 warnings 仍存在） |

---

## 6. 驗收對照（DoD）

- [x] 社會康軒／南一指派課次補題與盲測後 Mismatch 分類完成  
- [x] 數學康軒 L3 Mismatch 全數 triage  
- [x] `is_publishable` 依規則回寫；課級 ≥25 題可上架之課次均達標  
- [x] `normalize_manifest` 已執行  
- [x] 本 Report 與 `/pj_sync`、job close  

---

## 7. 遺留／建議

1. 南一 L2、L5 各 1 題 CQI 6.25：若 PM 希望「全課 30/30 可上架」，可改鍵或微調題文使 CQI-P ≥ 6.5。  
2. 數學 L3「80 本上櫃」題：建議後續單獨修題幹或選項，消除「空位」與「溢出本數」歧義。  
3. 補登 JOB-167 盲測 raw log 至 `.logs/` 以利稽核（若仍有本機 log）。

---

## 8. Token／花費

- 本結案回合：Token／花費 **未提供**（無 API Meta）。
