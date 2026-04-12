*Created by Claude Code (claude-sonnet-4-6) at 2026-04-08 17:15:00*

`last_updated`: 2026-04-08 17:15:00
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-165-AG-G3S2-國語三版本全版本盲測

**`job_type`**: `question_verify`
**`executor`**: Cursor
**`verifier`**: Claude Code（PM，Cursor 完成後通知驗收）

---

## 📌 任務背景

G3S2 國語三版本已完成前置作業：
- JOB-164：`evaluate_question_quality.js` 修復 + 三版本各課 CQI-P ≥ 5.5
- 南一 L5-L9 補題至各課 ≥ 25 題（本次前置補題）

三版本現況：

| 版本 | 課數 | 題數 | CQI-P | 盲測狀態 |
|:--|:--:|:--:|:--|:--|
| 康軒 | 12 | 461 | 各課 ≥ 5.5 ✅ | 需 --force 重跑（JOB-143 已過期） |
| 翰林 | 12 | 350 | 各課 ≥ 5.5 ✅ | 同上 |
| 南一 | 12 | 331 | 各課 ≥ 5.5 ✅ | 同上（L5-L9 含新補題須首次測） |

上版門檻（`question/README_驗證與盲測準則.md` v4.2，JOB-163 更新）：
- **單題**：Match + CQI ≥ 6.5 → `is_publishable: true`
- **課級唯一硬限制**：`is_publishable: true` 題數 ≥ 25 → 可上線
- **Match Rate 為參考指標，不作封鎖條件**

---

## 🎯 任務目標

三版本全課執行盲測，各課達成 `is_publishable: true` 題數 ≥ 25。

---

## 🚧 任務邊界

**只做：**
- 三版本全課盲測（`run_blind_eval.js --force`）
- Mismatch 逐題審查（TYPE-A/B/C 分類）
- TYPE-B（原題錯誤）修正 `answer_index`
- 更新各題 `review_status`、`is_publishable`
- 產出 Report

**不做：**
- 重新出題或補題
- 修改規範文件或 KL 素材
- 修改 CQI-P 分數

---

## 📖 執行步驟

### Phase 1：盲測執行

```bash
node scripts/run_blind_eval.js question/platform/G3/Chinese/S2/KangHsuan --force
node scripts/run_blind_eval.js question/platform/G3/Chinese/S2/HanLin --force
node scripts/run_blind_eval.js question/platform/G3/Chinese/S2/NanYi --force
```

**盲測模型**：`gemini-3-flash-lite`（免費額度，已核准）
**Cursor 作業模型**：`composer-2`（已核准）

### Phase 2：Mismatch 審查

依 Mismatch Triage Protocol（驗證準則 §2.4）分類：

| 類型 | 定義 | 處置 |
|:--|:--|:--|
| TYPE-A（AI 幻覺） | AI 找不到選項但正解確實存在 | `review_status: confirmed` |
| TYPE-B（原題錯誤） | AI 推論正確，原 `answer_index` 有誤 | 修正 `answer_index`，`review_status: corrected` |
| TYPE-C（待裁定） | 兩種解讀皆合理 | `review_status: confirmed`，記錄於 Report |

> ⚠️ TYPE-B 比例 > 5% → 標記警告並回報 PM，不得自行決定退回出題。

### Phase 3：is_publishable 更新

| 情境 | is_publishable |
|:--|:--|
| Match + CQI ≥ 6.5 | `true` |
| Mismatch → confirmed（AI 限制，題庫正確） | `true` |
| TYPE-B 修正後重測 Match | `true` |
| ai = -1（圖形/無法判讀） | `false` |

### Phase 4：課級確認

各課統計 `is_publishable: true` 題數，確認 ≥ 25。

---

## 📖 執行前必讀

| 文件 | 用途 |
|:--|:--|
| `question/README_驗證與盲測準則.md`（v4.2） | 盲測流程、上版門檻（JOB-163 已更新） |
| `question/README_出題與品管準則.md` | CQI 評分說明 |

---

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] 已讀取 `question/README_驗證與盲測準則.md`（v4.2，注意 §2.4-§2.5 已更新）
- [ ] 已讀取 `question/README_出題與品管準則.md`
- [ ] **Cursor 作業模型**：`composer-2`（已核准）
- [ ] **盲測 API 模型**：`gemini-3-flash-lite`（已核准）
- [ ] 確認三版本路徑與題數：
  - `question/platform/G3/Chinese/S2/KangHsuan/`（12 課，461 題）
  - `question/platform/G3/Chinese/S2/HanLin/`（12 課，350 題）
  - `question/platform/G3/Chinese/S2/NanYi/`（12 課，331 題）

---

## ✅ 驗收 Checklist (Acceptance)

> 禁止空白帶過，每項須填入實際數值，Claude Code（PM）核對。

- [ ] 三版本全課盲測 100% 覆蓋，log 存檔 — 佐證：三版本 Match/總題
- [ ] Mismatch 逐題 TYPE 分類完成 — 佐證：TYPE-A/B/C 各幾題
- [ ] TYPE-B 比例 — 佐證：___% （> 5% 須標記警告）
- [ ] 康軒各課 `is_publishable: true` ≥ 25 — 佐證：最低課次與題數
- [ ] 翰林各課 `is_publishable: true` ≥ 25 — 佐證：最低課次與題數
- [ ] 南一各課 `is_publishable: true` ≥ 25 — 佐證：最低課次與題數
- [ ] Match Rate 記錄完整（三版本各課） — 參考用

---

## ✅ 成果 Checklist (Deliverables)

- [ ] 產出 `jobs/JOB-165-Report.md`（含總表、Mismatch 分類、is_publishable 統計、異動清單）
- [ ] 盲測 log 路徑記錄於 Report
- [ ] 執行 `/pj_sync`
- [ ] 執行 `node scripts/job_manager.js close JOB-165`
- [ ] 通知 Claude Code（PM）驗收

---

## 📊 預期成果表格（Report 中填入）

### 盲測結果

| 版本 | 總題數 | Match | Mismatch | ai=-1 | Match Rate | is_pub≥25 課數 |
|:--|:--:|:--:|:--:|:--:|:--:|:--:|
| 康軒 | 461 | ___ | ___ | ___ | ___% | ___/12 |
| 翻林 | 350 | ___ | ___ | ___ | ___% | ___/12 |
| 南一 | 331 | ___ | ___ | ___ | ___% | ___/12 |

### Mismatch 分類

| 版本 | TYPE-A | TYPE-B | TYPE-C | TYPE-B 比例 |
|:--|:--:|:--:|:--:|:--:|
| 康軒 | ___ | ___ | ___ | ___% |
| 翻林 | ___ | ___ | ___ | ___% |
| 南一 | ___ | ___ | ___ | ___% |

---

## ⏱️ 執行時間回報

| 子任務 | 開始 | 結束 | 耗時 | 備註 |
|:--|:--|:--|:--|:--|
| 康軒盲測 | HH:mm | HH:mm | - | |
| 翻林盲測 | HH:mm | HH:mm | - | |
| 南一盲測 | HH:mm | HH:mm | - | |
| Mismatch 審查 | HH:mm | HH:mm | - | |
| **總計** | — | — | **-** | — |

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:{真實Meta中數字} | 花費: ${換算台幣} | 使用模型: composer-2 / gemini-3-flash-lite | 執行者: Cursor
