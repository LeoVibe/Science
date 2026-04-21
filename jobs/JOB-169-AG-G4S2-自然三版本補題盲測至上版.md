*Created by Claude Code (claude-sonnet-4-6) at 2026-04-10 10:00:00*

`last_updated`: 2026-04-10 10:00:00
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-169-AG-G4S2-自然三版本補題盲測至上版

**`job_type`**: `mixed`（question_prod + question_verify）
**`executor`**: Cursor
**`verifier`**: Claude Code（PM，Cursor 完成後通知驗收）
**`depends_on`**: JOB-168（KL4 單課研究建置完成後方可啟動）

---

## 📌 任務背景

G4S2 自然三版本現有題數不足，且全數未盲測：

| 版本 | 課數 | 現有題數 | 目標 | 補題量 | 盲測狀態 |
|:--|:--:|:--|:--:|:--:|:--|
| 康軒 | 4 | L1-L4 各 15 | 各 30 | +60 | 全數未測 |
| 翰林 | 4 | L1-L4 各 15 | 各 30 | +60 | 全數未測 |
| 南一 | 4 | L1=15, L2=20, L3=15, L4=15 | 各 30 | +55 | 全數未測 |

**前置完成**：
- JOB-168：KL4 單課研究檔已建置（`knowledge/1_課綱研究/自然/四下/{康軒,翰林,南一}/`）
- R4 映射已修正（`run_blind_eval.js` Science G4/S2 → `四下_自然_發展綱要.md`）

**上版門檻**（驗證準則 v4.2）：
- 單題：Match + CQI ≥ 6.5 → `is_publishable: true`
- 課級：`is_publishable: true` 題數 ≥ 25

---

## 🎯 任務目標

1. 三版本 12 課補題至 30 題/課（+175 題）
2. 全部 360 題執行盲測
3. 各課 `is_publishable: true` ≥ 25

---

## 🚧 任務邊界

**只做：**
- 三版本補題至 30 題/課
- 全課盲測（`--force`）
- Mismatch 審查（TYPE-A/B/C）
- 更新 `is_publishable`、`review_status`
- 更新 manifest

**不做：**
- 其他科目/年級
- 修改規範文件或 KL 素材
- 修改 R4 映射（已於 JOB-168 前修正）

---

## 📖 執行步驟

### Phase 0：修正 meta.title（engineering）

康軒和翰林的 JSON meta.title 目前有誤（兩者完全相同），需依下表修正：

| 版本 | L | 現有錯誤 title | 正確 title |
|:--|:--|:--|:--|
| 康軒 | L1 | 白天和夜晚/生活中的力 | 白天和夜晚的天空 |
| 康軒 | L2 | 水的移動/有趣現象 | 水的移動 |
| 康軒 | L3 | 昆蟲大解密/變動大地 | 昆蟲家族 |
| 康軒 | L4 | 資源與利用/能源電路 | 自然資源與利用 |
| 翰林 | L1 | 白天和夜晚/生活中的力 | 生活中的力 |
| 翰林 | L2 | 水的移動/有趣現象 | 水的奇妙現象 |
| 翰林 | L3 | 昆蟲大解密/變動大地 | 變動的大地 |
| 翰林 | L4 | 資源與利用/能源電路 | 能源與電路 |

修正路徑：
- `question/platform/G4/Science/S2/KangHsuan/G4_S2_SCI_KANGHSUAN_L{1-4}.json` → `meta.title`
- `question/platform/G4/Science/S2/HanLin/G4_S2_SCI_HANLIN_L{1-4}.json` → `meta.title`

### Phase 1：補題（question_prod）

**康軒 L1-L4**：各補 15 題至 30 題（共 60 題）
**翰林 L1-L4**：各補 15 題至 30 題（共 60 題）
**南一**：L1 +15, L2 +10, L3 +15, L4 +15（共 55 題）

研究素材：
- `knowledge/1_課綱研究/自然/四下_自然_發展綱要.md`（KL3）
- `knowledge/1_課綱研究/自然/四下/{出版社}/KL4_四下_{出版社}_L{N}_{課名}_單課研究紀錄.md`（KL4，JOB-168 產出）
- `knowledge/1_課綱研究/自然/G4_S2_自然_原始研究素材庫.md`

出題要求：
- 依 `question/README_出題與品管準則.md` 規範
- 新題：`blind_evaluation: false`、`is_publishable: false`、`review_status: pending_review`
- 含 `scenario`（非空）、`explanation`、`commonMisconception`
- 認知層次配比 4-4-2（中年級 G4）

補題後執行 CQI-P 確認：
```bash
node scripts/evaluate_question_quality.js question/platform/G4/Science/S2/KangHsuan
node scripts/evaluate_question_quality.js question/platform/G4/Science/S2/HanLin
node scripts/evaluate_question_quality.js question/platform/G4/Science/S2/NanYi
```

### Phase 2：盲測（question_verify）

```bash
node scripts/run_blind_eval.js question/platform/G4/Science/S2/KangHsuan --force
node scripts/run_blind_eval.js question/platform/G4/Science/S2/HanLin --force
node scripts/run_blind_eval.js question/platform/G4/Science/S2/NanYi --force
```

**盲測模型**：`gemini-3-flash-lite`（免費額度，已核准）

### Phase 3：Mismatch 審查 + is_publishable 更新

| 類型 | 處置 |
|:--|:--|
| TYPE-A（AI 幻覺） | `review_status: confirmed`，`is_publishable: true` |
| TYPE-B（原題錯誤） | 修正 `answer_index`，`review_status: corrected` |
| TYPE-C（待裁定） | `review_status: confirmed`，記錄於 Report |

> ⚠️ TYPE-B > 5% → 回報 PM。

### Phase 4：manifest 更新

```bash
node scripts/normalize_manifest.js question/platform/G4/Science/S2
```

---

## 📖 執行前必讀

| 文件 | 用途 |
|:--|:--|
| `question/README_出題與品管準則.md` | 出題原則、JSON 格式、CQI-P |
| `question/README_驗證與盲測準則.md`（v4.2） | 盲測流程、上版門檻 |
| `knowledge/1_課綱研究/自然/四下_自然_發展綱要.md` | KL3 課綱 |
| JOB-168 產出的 KL4 檔案 | 單課研究素材 |

---

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] **前置確認**：JOB-168 已完成，KL4 檔案已存在
- [ ] 已讀取 `question/README_出題與品管準則.md`
- [ ] 已讀取 `question/README_驗證與盲測準則.md`（v4.2）
- [ ] **Cursor 作業模型**：`composer-2`（已核准）
- [ ] **盲測 API 模型**：`gemini-3-flash-lite`（已核准）
- [ ] 確認題庫路徑與現有題數

---

## ✅ 驗收 Checklist (Acceptance)

### 補題驗收
- [ ] 康軒 L1-L4 各 30 題 — 佐證：各課實際題數
- [ ] 翰林 L1-L4 各 30 題
- [ ] 南一 L1-L4 各 30 題
- [ ] 三版本各課 CQI-P ≥ 5.5 — 佐證：最低課次與分數

### 盲測驗收
- [ ] 康軒各課 `is_publishable: true` ≥ 25 — 佐證：最低課次與題數
- [ ] 翰林各課 `is_publishable: true` ≥ 25
- [ ] 南一各課 `is_publishable: true` ≥ 25
- [ ] TYPE-B 比例 ≤ 5%
- [ ] Match Rate 記錄（參考用）

---

## ✅ 成果 Checklist (Deliverables)

- [ ] 產出 `jobs/JOB-169-Report.md`
- [ ] 盲測 log 路徑記錄於 Report
- [ ] 執行 `/pj_sync`
- [ ] 執行 `node scripts/job_manager.js close JOB-169`
- [ ] 通知 Claude Code（PM）驗收

---

## ⏱️ 執行時間回報

| 子任務 | 開始 | 結束 | 耗時 | 備註 |
|:--|:--|:--|:--|:--|
| 補題 | HH:mm | HH:mm | - | |
| CQI-P 確認 | HH:mm | HH:mm | - | |
| 康軒盲測 | HH:mm | HH:mm | - | |
| 翰林盲測 | HH:mm | HH:mm | - | |
| 南一盲測 | HH:mm | HH:mm | - | |
| Mismatch 審查 | HH:mm | HH:mm | - | |
| **總計** | — | — | **-** | — |

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:{真實Meta中數字} | 花費: ${換算台幣} | 使用模型: composer-2 / gemini-3-flash-lite | 執行者: Cursor
