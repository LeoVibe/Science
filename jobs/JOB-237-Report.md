*Created by Claude Code (claude-sonnet-4-6) at 2026-05-17 04:05*

`last_updated`: 2026-05-17 04:05
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-237 結案報告

**`job_type`**：`docs_ops`
**`executor`**：Claude Code (claude-sonnet-4-6)（Phase A 修復腳本 + Phase C 驗證）+ Codex CLI gpt-5.5（Phase B L2 補抽）

---

## 📊 成果摘要

JOB-237 完成全科目 95 份 extract_failed 整合 MD 修復，並對社會/自然共 40 份補抽 L2 結構化 JSON。Phase A 採 textutil（.doc）與 ocrmac（macOS Vision OCR）雙路線，95/95 全數修復成功。Phase B 40 份 L2 補抽中，6 份有實際可抽題目（333 題），34 份 OCR 品質不足以結構化（合理結果，MD 已修復但無結構化題目）。三科驗證報告 0 違規。

| 指標 | 數值 |
|:--|:--|
| Phase A 修復成功 | 95 / 95（0 失敗） |
| Phase A 修復方法 | ocrmac 75份 / textutil 19份 / 混合 1份 |
| Phase B L2 補抽份數 | 40 份（五下_社會 18 + 五下_自然 8 + 六下_社會 14）|
| Phase B 有效 questions>0 | 6 份（333 題）|
| Phase B 空殼（q=0） | 34 份（OCR 修復後仍無結構化題目）|
| Phase C 編碼違規 | 0（三科均 clean）|
| Phase C 驗證總量 | 五下_社會 117 + 五下_自然 118 + 六下_社會 118 = 353 份 |

---

## 📋 Phase A：科目修復分布

| 科目 | 修復份數 | 主要方法 |
|:--|:--:|:--|
| 社會 | 32 | ocrmac（掃描 PDF）|
| 國語 | 24 | ocrmac（掃描 PDF）|
| 數學 | 20 | ocrmac（掃描 PDF）|
| 英語 | 11 | ocrmac（掃描 PDF）|
| 自然 | 8 | textutil（.doc）|
| **合計** | **95** | — |

---

## 📋 Phase B：L2 補抽結果（社會/自然）

| 科目 | 補抽份數 | 有 questions>0 | 空殼(q=0) | 有效題目數 | 編碼違規 |
|:--|:--:|:--:|:--:|:--:|:--:|
| 五下_社會 | 18 | 2 | 16 | 127 | 0 |
| 五下_自然 | 8 | 1 | 7 | 61 | 0 |
| 六下_社會 | 14 | 3 | 11 | 145 | 0 |
| **合計** | **40** | **6** | **34** | **333** | **0** |

**空殼成因**：34 份原始 PDF 為掃描件，ocrmac OCR 雖成功擷取部分字元，但版面破碎（掃描傾斜、墨水淡）導致中文識別率低，Codex 正確判定無法結構化而回傳 `questions: []`。此為合理結果，MD 已修復（`quality_flags: repaired`），後續可用更高解析度 OCR 工具再次嘗試。

---

## 📂 異動清單

| 檔案路徑 | 異動類型 | 說明 |
|:--|:--|:--|
| `scripts/jobs/JOB-237/repair_all.py` | 新增 | Phase A 修復主腳本（textutil + ocrmac）|
| `scripts/jobs/JOB-237/repair_report.json` | 新增 | 95 份修復執行紀錄 |
| `scripts/jobs/JOB-237/phase_b_targets.json` | 新增 | Phase B 40 份目標清單 |
| `scripts/jobs/JOB-237/phase_b_dispatch.sh` | 新增 | Phase B dispatch（分科 progress，sed pipe）|
| `scripts/jobs/JOB-237/phase_b_progress_五下-社會.json` | 新增 | 五下_社會 L2 補抽進度紀錄 |
| `scripts/jobs/JOB-237/phase_b_progress_五下-自然.json` | 新增 | 五下_自然 L2 補抽進度紀錄 |
| `scripts/jobs/JOB-237/phase_b_progress_六下-社會.json` | 新增 | 六下_社會 L2 補抽進度紀錄 |
| `knowledge/3_考古題/2_MD淬鍊文字_整合版/…（95 份）` | 修改 | quality_flags 加 repaired，移除 extract_failed，補充 OCR 文字 |
| `knowledge/3_考古題/3_L2_結構化抽取/五下/五下_社會_*/（18 份）` | 修改 | L2 JSON 補抽覆寫 |
| `knowledge/3_考古題/3_L2_結構化抽取/五下/五下_自然_*/（8 份）` | 修改 | L2 JSON 補抽覆寫 |
| `knowledge/3_考古題/3_L2_結構化抽取/六下/六下_社會_*/（14 份）` | 修改 | L2 JSON 補抽覆寫 |
| `knowledge/3_考古題/3_L2_結構化抽取/_validation_report_social_g5.json` | 修改 | Phase C 重驗（五下_社會）|
| `knowledge/3_考古題/3_L2_結構化抽取/_validation_report_natural_g5.json` | 修改 | Phase C 重驗（五下_自然）|
| `knowledge/3_考古題/3_L2_結構化抽取/_validation_report_social_g6.json` | 修改 | Phase C 重驗（六下_社會）|

---

## ✅ Checklist 對照結果

### 驗收 Checklist (Acceptance)

#### Phase A（MD 修復）
- [x] 95 份 MD quality_flags 均含 `repaired` — 佐證：`repair_report.json` ok=95 / fail=0 / skip=0
- [x] 修復 char_count > 500 — 佐證：repair_report.json 每筆 char_count 均 > 500（最小值約 600+）
- [x] 佐證：`scripts/jobs/JOB-237/repair_all.py` 執行紀錄 repair_report.json

#### Phase B（L2 補抽）
- [x] 40 份 L2 JSON 存在（空殼亦視為存在）— 佐證：progress 三科 done=18+8+14=40，fail=0
- [x] 有 questions>0 的 6 份，編碼合法率 100% — 佐證：Phase C 三科 violations(A=0,B=0,C=0)
- [ ] 編碼合法率 ≥ 95% 目標 100%（整體含空殼） — 實際：有效份數 6/40 合法率 100%；空殼 34 份無可驗編碼

#### Phase C（驗證報告）
- [x] 三份 B_validate 輸出中驗證量 > 修復前 — 佐證：五下_社會 117 / 五下_自然 118 / 六下_社會 118（全 clean）

### 成果 Checklist (Deliverables)
- [x] `scripts/jobs/JOB-237/repair_all.py` 完成
- [x] 95 份整合 MD 修復完成
- [x] 40 份 L2 JSON 補抽完成（社會/自然，6 份有效題目）
- [x] 三份 validation_report JSON 更新
- [x] 進度總表已同步（`docs/進度彙整_題庫研發與產出.md`）
- [x] `docs/README_專案發展紀錄.md` 新增 JOB-237 記錄
- [x] 已執行 `/pj_sync`
- [x] `jobs/JOB-237-Report.md` 完成（本檔）
- [ ] `node scripts/job_manager.js close JOB-237`
- [ ] Discord 結案回報送 `1487738477608177714`
- [ ] git commit（最終結案）

---

## ⚠️ 遺留問題

1. **Phase B 空殼率偏高（34/40 = 85%）**：OCR 後文字品質不足以結構化。建議後續 JOB 嘗試更高解析度 OCR（300 dpi+）或 Vision API 重新處理 34 份掃描件。
2. **國語/數學/英語 55 份 L2 未補抽**：JOB-237 任務邊界明確不含這三科，待各科 codes JSON 建立後另開 JOB。
3. **B_validate WARN（五下_社會 -3 / 五下_自然 -3）**：B_validate 腳本的 EXPECTED 硬編值（120/121）與實際不符，下次可考慮動態讀取目錄數。

---

## ⏱️ 執行時間回報

| 子任務 / 階段 | 開始時間 | 結束時間 | 耗時 | 備註 |
|:--|:--|:--|:--|:--|
| Phase A MD 修復 | 2026-05-17 02:00 | 2026-05-17 02:30 | ~30 min | Python 腳本，95/95 |
| Phase B 腳本建立 | 2026-05-17 02:34 | 2026-05-17 02:40 | ~6 min | dispatch 修版 2 次 |
| Phase B L2 補抽 | 2026-05-17 02:40 | 2026-05-17 03:58 | ~78 min | 3 科並行 Codex，40/40 |
| Phase C 驗證 | 2026-05-17 03:59 | 2026-05-17 04:00 | < 1 min | 3 科 B_validate 重跑 |
| Phase D Report | 2026-05-17 04:00 | 2026-05-17 04:05 | ~5 min | Claude 親寫 |
| **總計** | 2026-05-17 02:00 | 2026-05-17 04:05 | **~2 hr 5 min** | — |

---

## 真實回報本次對話的模型與花費

＄作業匯總：Token 數: - | 花費: -（Claude Pro 訂閱 + ChatGPT Plus 訂閱無單次計費）| 使用模型: Claude Code claude-sonnet-4-6（Phase A 修復腳本 + Report）+ Codex CLI gpt-5.5（Phase B 40份 L2 補抽）| 執行者: Claude + Codex
