# JOB-199 Report — 補盲測：G3 國語康軒 L4/L6、G4 社會南一 L6

`completed`: 2026-04-18
`executor`: Claude Code（使用者授權例外）

---

## 執行摘要

對 3 個缺少盲測紀錄的檔案執行 `run_blind_eval.js`（模型：`gemini-3.1-flash-lite-preview`），使 G3 下國語康軒 與 G4 下社會南一 升級至 QL4。重新生成 `libraryStats.json`。

---

## 盲測結果

| 檔案 | 題數 | 命中 | Match Rate |
|:--|:--:|:--:|:--:|
| G3_S2_CHI_KANGHSUAN_L4.json | 20 | 20 | **100%** |
| G3_S2_CHI_KANGHSUAN_L6.json | 29 | 29 | **100%** |
| G4_S2_SOC_NANYI_L6.json | 28 | 28 | **100%** |

模型：`Gemini-3.1-Flash-Lite`（免費額度）

---

## QL 升級驗證

| 科目 | 執行前 | 執行後 | QL4% | 總題數 |
|:--|:--:|:--:|:--:|:--:|
| G3 下 國語 康軒 | QL3 | **QL4** | 100% | 442 |
| G4 下 社會 南一 | QL3 | **QL4** | 100% | 178 |

---

## 修改檔案

| 檔案 | 變更 |
|:--|:--|
| `G3_S2_CHI_KANGHSUAN_L4.json` | 各題 `blind_evaluation: true` 寫入 |
| `G3_S2_CHI_KANGHSUAN_L6.json` | 各題 `blind_evaluation: true` 寫入 |
| `G4_S2_SOC_NANYI_L6.json` | 各題 `blind_evaluation: true` 寫入 |
| `apps/v3_eidos/{src,public}/data/libraryStats.json` | 重新生成，19 科目 57 publisherStats |

---

## 驗收 Checklist

- [x] L4、L6 兩檔 Match Rate 均 100%，超過 ≥85% 門檻
- [x] G4 SOC NanYi L6 Match Rate 100%，超過 ≥85% 門檻
- [x] G3 下 國語 康軒 升至 QL4（QL4% = 100%）
- [x] G4 下 社會 南一 升至 QL4（QL4% = 100%）
- [x] `libraryStats.json` 重新生成（src + public 兩份）
- [x] 已執行 /pj_sync 全域知識沉澱

＄作業匯總：Token數:- | 花費:$- | 使用模型: gemini-3.1-flash-lite-preview | 執行者: Claude Code（使用者授權例外）
