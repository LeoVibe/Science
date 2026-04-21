*Created by Claude Code (claude-sonnet-4-6) at 2026-04-10 09:00:00*

`last_updated`: 2026-04-10 09:00:00
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-167-AG-G3S2-數學社會補題盲測至上版

**`job_type`**: `mixed`（question_prod + question_verify）
**`executor`**: Cursor
**`verifier`**: Claude Code（PM，Cursor 完成後通知驗收）

---

## 📌 任務背景

G3S2 剩餘兩科未達課級上版門檻（每課 `is_publishable: true` ≥ 25）：

| 科目 | 版本 | 課次 | 現有題數 | 目標 | 缺口 |
|:--|:--|:--|:--:|:--:|:--:|
| 數學 | 康軒 | L3 | 30（6 題未盲測） | 盲測 | 盲測 6 題 |
| 社會 | 康軒 | L2 | 19 | 30 | +11 |
| 社會 | 康軒 | L3 | 19 | 30 | +11 |
| 社會 | 康軒 | L4 | 19 | 30 | +11 |
| 社會 | 康軒 | L5 | 19 | 30 | +11 |
| 社會 | 康軒 | L6 | 19 | 30 | +11 |
| 社會 | 南一 | L1 | 21 | 30 | +9 |
| 社會 | 南一 | L2 | 21 | 30 | +9 |
| 社會 | 南一 | L3 | 21 | 30 | +9 |
| 社會 | 南一 | L4 | 21 | 30 | +9 |
| 社會 | 南一 | L5 | 21 | 30 | +9 |

**補題合計**：社會 100 題（康軒 55 + 南一 45）
**盲測合計**：數學 6 題 + 社會全課（含既有 + 新補）

---

## 🎯 任務目標

1. 社會兩版本共 10 課補題至 30 題/課
2. 數學康軒 L3 的 6 題 + 社會全課執行盲測
3. 各課達成 `is_publishable: true` ≥ 25

---

## 🚧 任務邊界

**只做：**
- 社會康軒 L2-L6、南一 L1-L5 補題至 30 題
- 數學康軒 L3 盲測（6 題未測）
- 社會兩版本全課盲測
- Mismatch 審查（TYPE-A/B/C）
- 更新 `is_publishable`、`review_status`
- 更新 manifest

**不做：**
- 其他科目（國語/自然已達標）或其他版本
- 修改規範文件或 KL 素材
- 修改 CQI-P 分數

---

## 📖 執行步驟

### Phase 1：社會補題（question_prod）

**康軒 L2-L6**：各補 11 題至 30 題（共 55 題）
**南一 L1-L5**：各補 9 題至 30 題（共 45 題）

研究素材：
- `knowledge/1_課綱研究/社會/三下_社會_發展綱要.md`
- `knowledge/1_課綱研究/社會/G3_S2_社會_原始研究素材庫.md`

出題要求：
- 依 `question/README_出題與品管準則.md` 規範
- 新題必須設定：`blind_evaluation: false`、`is_publishable: false`、`review_status: pending_review`
- 含 `scenario`（非空）、`explanation`、`commonMisconception`

補題完成後執行：
```bash
node scripts/evaluate_question_quality.js question/platform/G3/SocialStudies/S2/KangHsuan
node scripts/evaluate_question_quality.js question/platform/G3/SocialStudies/S2/NanYi
```
確認各課 CQI-P ≥ 5.5。

### Phase 2：盲測（question_verify）

依序執行，每版本完成後確認 log 正常再跑下一個：

```bash
# 1. 數學康軒 L3（僅 6 題未盲測，不加 --force）
node scripts/run_blind_eval.js question/platform/G3/Math/S2/KangHsuan/G3_S2_MATH_KANGHSUAN_L3.json

# 2. 社會康軒（含新補題，--force 全課重跑）
node scripts/run_blind_eval.js question/platform/G3/SocialStudies/S2/KangHsuan --force

# 3. 社會南一（含新補題，--force 全課重跑）
node scripts/run_blind_eval.js question/platform/G3/SocialStudies/S2/NanYi --force
```

**盲測模型**：`gemini-3-flash-lite`（免費額度，已核准）

### Phase 3：Mismatch 審查

依 Mismatch Triage Protocol 分類：

| 類型 | 處置 |
|:--|:--|
| TYPE-A（AI 幻覺） | `review_status: confirmed`，`is_publishable: true` |
| TYPE-B（原題錯誤） | 修正 `answer_index`，`review_status: corrected` |
| TYPE-C（待裁定） | `review_status: confirmed`，記錄於 Report |

> ⚠️ TYPE-B 比例 > 5% → 標記警告並回報 PM。

### Phase 4：is_publishable 更新 + manifest

| 情境 | is_publishable |
|:--|:--|
| Match + CQI ≥ 6.5 | `true` |
| Mismatch → confirmed | `true` |
| TYPE-B 修正後重測 Match | `true` |
| ai = -1 | `false` |

更新 manifest：
```bash
node scripts/normalize_manifest.js question/platform/G3/Math/S2
node scripts/normalize_manifest.js question/platform/G3/SocialStudies/S2
```

---

## 📖 執行前必讀

| 文件 | 用途 |
|:--|:--|
| `question/README_出題與品管準則.md` | 出題原則、JSON 格式 |
| `question/README_驗證與盲測準則.md`（v4.2） | 盲測流程、上版門檻 |
| `knowledge/1_課綱研究/社會/三下_社會_發展綱要.md` | 社會三下課綱 |
| `knowledge/1_課綱研究/社會/G3_S2_社會_原始研究素材庫.md` | 社會三下原始素材 |

---

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] 已讀取 `question/README_出題與品管準則.md`
- [ ] 已讀取 `question/README_驗證與盲測準則.md`（v4.2）
- [ ] 已讀取 `knowledge/1_課綱研究/社會/三下_社會_發展綱要.md`
- [ ] **Cursor 作業模型**：`composer-2`（已核准）
- [ ] **盲測 API 模型**：`gemini-3-flash-lite`（已核准）
- [ ] 確認題庫路徑與現有題數：
  - `question/platform/G3/Math/S2/KangHsuan/` L3: 30 題（6 未盲測）
  - `question/platform/G3/SocialStudies/S2/KangHsuan/` L2-L6: 各 19 題
  - `question/platform/G3/SocialStudies/S2/NanYi/` L1-L5: 各 21 題

---

## ✅ 驗收 Checklist (Acceptance)

> 每項須填入實際數值，Claude Code（PM）核對。

### 補題驗收
- [ ] 社會康軒 L2-L6 各 30 題 — 佐證：各課實際題數
- [ ] 社會南一 L1-L5 各 30 題 — 佐證：各課實際題數
- [ ] 社會兩版本各課 CQI-P ≥ 5.5 — 佐證：最低課次與分數

### 盲測驗收
- [ ] 數學康軒 L3 `is_publishable: true` ≥ 25 — 佐證：實際數字
- [ ] 社會康軒 L1-L6 各課 `is_publishable: true` ≥ 25 — 佐證：最低課次與題數
- [ ] 社會南一 L1-L5 各課 `is_publishable: true` ≥ 25 — 佐證：最低課次與題數
- [ ] Mismatch 逐題 TYPE 分類完成 — 佐證：TYPE-A/B/C 各幾題
- [ ] TYPE-B 比例 ≤ 5%
- [ ] Match Rate 記錄（參考用）

---

## ✅ 成果 Checklist (Deliverables)

- [ ] 產出 `jobs/JOB-167-Report.md`
- [ ] 盲測 log 路徑記錄於 Report
- [ ] 執行 `/pj_sync`
- [ ] 執行 `node scripts/job_manager.js close JOB-167`
- [ ] 通知 Claude Code（PM）驗收

---

## 📊 預期成果表格（Report 中填入）

### 補題結果

| 版本 | 課次 | 補前 | 補後 | 新增 |
|:--|:--|:--:|:--:|:--:|
| 社會康軒 | L2-L6 | 各 19 | 各 30 | 各+11 |
| 社會南一 | L1-L5 | 各 21 | 各 30 | 各+9 |

### 盲測結果

| 科目/版本 | 總題 | Match | Mismatch | ai=-1 | Match Rate | is_pub≥25 課數 |
|:--|:--:|:--:|:--:|:--:|:--:|:--:|
| 數學康軒 L3 | 6 | ___ | ___ | ___ | ___% | ___/1 |
| 社會康軒 | ___ | ___ | ___ | ___ | ___% | ___/6 |
| 社會南一 | ___ | ___ | ___ | ___ | ___% | ___/5 |

---

## ⏱️ 執行時間回報

| 子任務 | 開始 | 結束 | 耗時 | 備註 |
|:--|:--|:--|:--|:--|
| 社會補題 | HH:mm | HH:mm | - | |
| CQI-P 確認 | HH:mm | HH:mm | - | |
| 數學盲測 | HH:mm | HH:mm | - | |
| 社會康軒盲測 | HH:mm | HH:mm | - | |
| 社會南一盲測 | HH:mm | HH:mm | - | |
| Mismatch 審查 | HH:mm | HH:mm | - | |
| **總計** | — | — | **-** | — |

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:{真實Meta中數字} | 花費: ${換算台幣} | 使用模型: composer-2 / gemini-3-flash-lite | 執行者: Cursor
