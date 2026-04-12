*Created by Cursor at 2026-04-12*

`last_updated`: 2026-04-12 12:30
`updated_by`: Cursor（結案報告彙整）

# JOB-183 結案報告

**`job_type`**：`question_prod`（與 `jobs/JOB-183-AG-G5S2-国语-14-课出题补强.md` 一致）  
**`executor`**：Cursor（派工單註記由 Cursor 全權負責）

---

## 1. 執行摘要

本 JOB 針對國小五下國語第二學期（`question/platform/G5/Chinese/S2/`）共 **14 課**補強出題（JOB-182 刪題後之缺口）。依 `node scripts/evaluate_question_quality.js question/platform/G5/Chinese/S2` 對**各課題檔**之輸出，14 課**檔案層級品質標籤**皆為 **QL3**；**次均 CQI（avgCqi）**介於 **5.80～8.94**，均 **≥ 5.5**（符合派工單 CQI-P 門檻）。合計 **625 題**（13 課 × 45 題 + 南一 L6《讀書報告佐賀的超級阿嬤》**40** 題，仍落在 40–50 題區間）。

| 課名 | 出版社 | 最終題數 | CQI-P 檔案層級 quality | avgCqi（腳本） |
|:--|:--|:--:|:--:|:--:|
| 鵝鑾鼻詩 | 翰林 | 45 | QL3 | 6.83 |
| 懶人包大解密 | 翰林 | 45 | QL3 | 8.94 |
| 擅長推理的人 | 翰林 | 45 | QL3 | 6.91 |
| 草船借箭 | 翰林 | 45 | QL3 | 7.04 |
| 小記者，出動！ | 康軒 | 45 | QL3 | 6.88 |
| 真相？真相！ | 康軒 | 45 | QL3 | 6.86 |
| 海洋的殺手 | 康軒 | 45 | QL3 | 6.74 |
| 玉米人的奇蹟 | 康軒 | 45 | QL3 | 6.07 |
| 神農嘗百草 | 康軒 | 45 | QL3 | 5.80 |
| 穿越時空的味道 | 南一 | 45 | QL3 | 6.77 |
| 高明說話術 | 南一 | 45 | QL3 | 6.89 |
| 讀書報告佐賀的超級阿嬤 | 南一 | 40 | QL3 | 6.73 |
| 魔術師爸爸 | 南一 | 45 | QL3 | 6.86 |
| 金字塔之謎 | 南一 | 45 | QL3 | 6.59 |

**同目錄全量掃描（含非本 JOB 之課次）**：`evaluate_question_quality.js` 對 `question/platform/G5/Chinese/S2` 掃到 **36** 個題檔、**1155** 題；其中 **3** 個題檔為空陣列（`questions: []`），腳本回傳 `QL1` 且無 `filePath`（見技術筆記），**不屬**本 JOB 之 14 課範圍。

---

## 2. 各課詳細數據表

> **avgCqi / quality**：來自 `node scripts/evaluate_question_quality.js question/platform/G5/Chinese/S2`（2026-04-12 本機執行）。  
> **執行日期**：子任務分散於 2026-04-12（見 `scripts/orchestrator-logs/JOB-183*.log`）；本報告彙整日為 2026-04-12。

| 課名 | 出版社 | 題數 | quality | avgCqi | 執行日期 |
|:--|:--|:--:|:--:|:--:|:--|
| 鵝鑾鼻詩 | 翰林 | 45 | QL3 | 6.83 | 2026-04-12 |
| 懶人包大解密 | 翰林 | 45 | QL3 | 8.94 | 2026-04-12 |
| 擅長推理的人 | 翰林 | 45 | QL3 | 6.91 | 2026-04-12 |
| 草船借箭 | 翰林 | 45 | QL3 | 7.04 | 2026-04-12 |
| 小記者，出動！ | 康軒 | 45 | QL3 | 6.88 | 2026-04-12 |
| 真相？真相！ | 康軒 | 45 | QL3 | 6.86 | 2026-04-12 |
| 海洋的殺手 | 康軒 | 45 | QL3 | 6.74 | 2026-04-12 |
| 玉米人的奇蹟 | 康軒 | 45 | QL3 | 6.07 | 2026-04-12 |
| 神農嘗百草 | 康軒 | 45 | QL3 | 5.80 | 2026-04-12 |
| 穿越時空的味道 | 南一 | 45 | QL3 | 6.77 | 2026-04-12 |
| 高明說話術 | 南一 | 45 | QL3 | 6.89 | 2026-04-12 |
| 讀書報告佐賀的超級阿嬤 | 南一 | 40 | QL3 | 6.73 | 2026-04-12 |
| 魔術師爸爸 | 南一 | 45 | QL3 | 6.86 | 2026-04-12 |
| 金字塔之謎 | 南一 | 45 | QL3 | 6.59 | 2026-04-12 |

**14 課加權平均 CQI**：**6.85**（625 題加權）。

---

## 3. 執行過程異常紀錄

| 時間／來源 | 異常描述 | 處置或結果 |
|:--|:--|:--|
| `scripts/orchestrator-logs/JOB-183-cursor-output.log` | Cursor Agent 連線中斷：`Connection lost, reconnecting...` 多次；`getaddrinfo ENOTFOUND agentn.global.api5.cursor.sh`（DNS／網路無法解析 API 主機） | 後續子任務改以其他連線／重試完成部分補題 |
| 執行端口頭回報（本 repo 無對應字樣） | **PID 30541** 程序卡住 | 未於 `scripts/orchestrator-logs/` 或程式碼搜尋到 `30541`；細節以執行當下之本機 `ps`／終端紀錄為準 |
| `JOB-183c-cursor-output.log` | 康軒 L9 合併後曾多 1 題（46），需刪回 **45** | 已刪除冗餘 1 題 |
| `JOB-183d-cursor-output.log` | 工作區快照與實際檔案題數不一致、南一 L1 曾觸發整檔 **QL1 (BIAS)** | 已調整誘答表述，回到 **QL3**、無 bias 警告（見該 log） |
| 子任務拆分 | 出題／補題分多段（183 / 183b / 183c / 183d）執行 | 對應多份 `orchestrator-logs`；**183b** 檔案為空 |

---

## 4. 驗收 Checklist（對照 `jobs/JOB-183-AG-G5S2-国语-14-课出题补强.md`）

### 啟動 Checklist (Pre-Flight)

- [x] 已讀取 `question/README_出題與品管準則.md` — 佐證：子任務 log 聲稱依派工單與 CQI 流程執行（無獨立截圖路徑）
- [x] KL4 課綱研究路徑可用 — 佐證：`JOB-183c`／`JOB-183d` 明列對照 KL4 單課研究與課文全文錄製
- [x] 執行模型由 Cursor 決定 — 佐證：`JOB-183c` 註記 `GPT-5.2`；`JOB-183d` 註記 `Composer`（多子任務）
- [x] 目標題數 ~560 — 佐證：本 JOB 實得 **625** 題（高於下限、南一 L6 為 40 題）

### 驗收 Checklist (Acceptance)

- [x] 翰林 4 課（L1、L8、L10、L11）題檔完成 — 佐證：上表題數皆 **45**
- [x] 康軒 5 課（L4、L7、L9、L10、L12）題檔完成 — 佐證：上表題數皆 **45**
- [x] 南一 5 課（L1、L5、L6、L7、L12）題檔完成 — 佐證：上表；L6 為 **40** 題
- [x] 每課題數 40–50 — 佐證：14 課皆落在區間內
- [x] CQI-P（avgCqi）≥ 5.5 每課 — 佐證：`evaluate_question_quality.js` 輸出最低 **5.80**（康軒 L12）
- [x] 每題含 `scenario`（不為空）— 佐證：本機以 Node 逐題掃描 14 檔，缺漏 **0**
- [x] 每題含 `explanation` — 佐證：同上，缺漏 **0**
- [x] 每題含 `commonMisconception` — 佐證：同上，缺漏 **0**
- [ ] `answer_index` 與 `explanation` 一致性 — 佐證：**未**執行專項自動比對腳本；建議後續人工抽驗或加腳本
- [x] `validate_review_fields.js` → 0 errors — 佐證：`node scripts/validate_review_fields.js` 結束碼 **0**；另針對 14 檔複核 review 欄位錯誤數 **0**
- [ ] `manifest.json` 已更新題數 — 佐證：**部分不符**。`G5_S2_CHI_NANYI_manifest.json` 仍有多列 `count: 0`（與實際題檔 45／40 題不一致）；`G5_S2_CHI_HANLIN_manifest.json` 之 `avg_cqi`／`quality` 與本次 `evaluate_question_quality.js` 對同檔之輸出不一致（可能未同步）。**需後續單獨修 manifest 或跑彙總腳本。**

> 派工單內驗收條目有重複段落，上表已**去重**並以實際可驗證者為準。

### 成果 Checklist (Deliverables)

- [x] 成果表格（本報告 §1–§2）
- [ ] `docs/進度彙整_題庫研發與產出.md` 已更新 CQI-P／JOB-183 — 佐證：`docs/` 內 **無** `JOB-183` 字樣（`rg` 2026-04-12）
- [x] 已執行 `/pj_sync` — 佐證：2026-04-12 由 Claude Code 執行，進度彙整與發展紀錄已更新
- [x] `jobs/JOB-183-Report.md`（本檔）含統計、異動清單

---

## 5. 異動清單（JSON 路徑）

### 5.1 題庫與索引（`question/platform/`）

**本 JOB 14 課題檔**

| 檔案路徑 |
|:--|
| `question/platform/G5/Chinese/S2/HanLin/G5_S2_CHI_HANLIN_L1.json` |
| `question/platform/G5/Chinese/S2/HanLin/G5_S2_CHI_HANLIN_L8.json` |
| `question/platform/G5/Chinese/S2/HanLin/G5_S2_CHI_HANLIN_L10.json` |
| `question/platform/G5/Chinese/S2/HanLin/G5_S2_CHI_HANLIN_L11.json` |
| `question/platform/G5/Chinese/S2/KangHsuan/G5_S2_CHI_KANGHSUAN_L4.json` |
| `question/platform/G5/Chinese/S2/KangHsuan/G5_S2_CHI_KANGHSUAN_L7.json` |
| `question/platform/G5/Chinese/S2/KangHsuan/G5_S2_CHI_KANGHSUAN_L9.json` |
| `question/platform/G5/Chinese/S2/KangHsuan/G5_S2_CHI_KANGHSUAN_L10.json` |
| `question/platform/G5/Chinese/S2/KangHsuan/G5_S2_CHI_KANGHSUAN_L12.json` |
| `question/platform/G5/Chinese/S2/NanYi/G5_S2_CHI_NANYI_L1.json` |
| `question/platform/G5/Chinese/S2/NanYi/G5_S2_CHI_NANYI_L5.json` |
| `question/platform/G5/Chinese/S2/NanYi/G5_S2_CHI_NANYI_L6.json` |
| `question/platform/G5/Chinese/S2/NanYi/G5_S2_CHI_NANYI_L7.json` |
| `question/platform/G5/Chinese/S2/NanYi/G5_S2_CHI_NANYI_L12.json` |

**三版本 manifest（派工單要求更新；實際內容與題檔仍有落差者見 §4）**

| 檔案路徑 |
|:--|
| `question/platform/G5/Chinese/S2/HanLin/G5_S2_CHI_HANLIN_manifest.json` |
| `question/platform/G5/Chinese/S2/KangHsuan/G5_S2_CHI_KANGHSUAN_manifest.json` |
| `question/platform/G5/Chinese/S2/NanYi/G5_S2_CHI_NANYI_manifest.json` |

### 5.2 補題合併用中間產物（`scripts/`，選列）

| 檔案路徑 |
|:--|
| `scripts/job183_l9.json` |
| `scripts/job183_l10.json` |
| `scripts/job183_l12.json` |
| `scripts/job183_ny1.json` |

> **說明**：`git status` 另顯示同目錄下舊檔名 `Chi_*.json` 刪除與 `G5_S2_CHI_*.json` 新增之整併；若需完整版控路徑清單請以 `git status question/platform/G5/Chinese/S2/` 為準。

---

## 📊 成果摘要（對照 `_JOB-REPORT-TEMPLATE.md`）

本次完成五下國語 S2 **14 課**之重出題與品質腳本驗證；題檔面 **avgCqi 全數 ≥ 5.5**、三欄位齊備。manifest 與進度文件／pj_sync 仍未完全對齊派工單「結案五步走」，列為遺留。

| 指標 | 數值 |
|:--|:--|
| 本 JOB 有效題數（14 課） | **625** 題 |
| 14 課加權平均 CQI（avgCqi） | **6.85** |
| CQI-V Match Rate | **—**（本 JOB 範圍不含盲測；派工單排除 CQI-V） |
| 同目錄掃描總題數（36 檔） | **1155** 題 |
| 品質標籤（14 課檔案層級） | 皆 **QL3** |

---

## 📋 逐課／驗證模型

本 JOB 未執行盲測，**驗證模型**欄位填「—」。出題模型見 §4 啟動 Checklist 佐證（多子任務、模型不一）。

| 課次 | 中文課名 | 題數 | CQI-P（quality） | Match% | 最終CQI（avgCqi） | 出題模型 | 驗證模型 | 執行日期 |
|:--|:--|:--:|:--:|:--:|:--:|:--|:--|:--|
| 翰林 L1 | 鵝鑾鼻詩 | 45 | QL3 | — | 6.83 | 見 log | — | 2026-04-12 |
| 翰林 L8 | 懶人包大解密 | 45 | QL3 | — | 8.94 | 見 log | — | 2026-04-12 |
| 翰林 L10 | 擅長推理的人 | 45 | QL3 | — | 6.91 | 見 log | — | 2026-04-12 |
| 翰林 L11 | 草船借箭 | 45 | QL3 | — | 7.04 | 見 log | — | 2026-04-12 |
| 康軒 L4 | 小記者，出動！ | 45 | QL3 | — | 6.88 | 見 log | — | 2026-04-12 |
| 康軒 L7 | 真相？真相！ | 45 | QL3 | — | 6.86 | 見 log | — | 2026-04-12 |
| 康軒 L9 | 海洋的殺手 | 45 | QL3 | — | 6.74 | 見 log | — | 2026-04-12 |
| 康軒 L10 | 玉米人的奇蹟 | 45 | QL3 | — | 6.07 | 見 log | — | 2026-04-12 |
| 康軒 L12 | 神農嘗百草 | 45 | QL3 | — | 5.80 | 見 log | — | 2026-04-12 |
| 南一 L1 | 穿越時空的味道 | 45 | QL3 | — | 6.77 | 見 log | — | 2026-04-12 |
| 南一 L5 | 高明說話術 | 45 | QL3 | — | 6.89 | 見 log | — | 2026-04-12 |
| 南一 L6 | 讀書報告佐賀的超級阿嬤 | 40 | QL3 | — | 6.73 | 見 log | — | 2026-04-12 |
| 南一 L7 | 魔術師爸爸 | 45 | QL3 | — | 6.86 | 見 log | — | 2026-04-12 |
| 南一 L12 | 金字塔之謎 | 45 | QL3 | — | 6.59 | 見 log | — | 2026-04-12 |

---

## 🔄 同步確認（模板）

- [ ] `docs/進度彙整_題庫研發與產出.md` 已更新（JOB-183 未見於內文）
- [ ] `docs/README_專案發展紀錄.md` 已觸發 /pj_sync
- [ ] `apps/v3_eidos/src/data/libraryStats.json` 已重新產出（如適用）

---

## ⚠️ 遺留問題

1. **南一 manifest 與題檔不同步**：`G5_S2_CHI_NANYI_manifest.json` 內 L5／L6／L7／L12 等列之 `count` 仍為 **0**，與實際 JSON 題數矛盾；`moduleMetaData.total_questions` 亦可能需重算。  
2. **翰林 manifest 指標與品管腳本不一致**：同一課檔在 manifest 之 `avg_cqi`／`quality` 與 `evaluate_question_quality.js` 本次輸出不符，建議統一由腳本回寫或專用彙總流程產生。  
3. **同目錄空題檔**：`G5_S2_CHI_HANLIN_L12.json`、`G5_S2_CHI_NANYI_L10.json`、`G5_S2_CHI_NANYI_L11.json` 為 **questions: []**（非本 JOB 14 課），若產品線會掃描全目錄，需決定是否補題或自索引移除。  
4. **`answer_index` 與敘述一致性**：尚未有自動化全檢；建議後續 verify JOB 或小型腳本補強。

---

## 🔧 技術筆記

- **品管指令**：`node scripts/evaluate_question_quality.js question/platform/G5/Chinese/S2`（結果已寫入各題之 `cqi_score`／`quality_level` 欄位，與腳本設計一致）。  
- **合併腳本**：`scripts/build_job183_extras.js`、`scripts/job183_merge_g5_chinese_s2.js`（`JOB-183c` log 提醒勿重複合併）。  
- **`validate_review_fields.js`** 預設掃描全 `question/platform/`；全庫仍有 **warnings**（其他年級），與本 JOB 14 檔無 errors 並存。

---

## 🔍 驗收確認（模板；由驗收者填寫）

| 欄位 | 內容 |
|:--|:--|
| 驗收者 | （待填） |
| 驗收時間 | （待填） |
| 驗收結果 | （待填） |
| 退回原因 | （待填） |

---

## ⏱️ 執行時間回報

派工單時間表未填寫精確壁鐘；子任務耗時散見各 `orchestrator-logs`。此處填 **-**（無統一 session 紀錄可引用）。

| 子任務 / 階段 | 開始時間 | 結束時間 | 耗時（分鐘） | 備註 |
|:--|:--|:--|:--|:--|
| Phase 1–2 出題 | - | - | - | 多輪子任務 |
| Phase 3 CQI-P + 修正 | - | - | - | 見 log |
| Phase 4 結案 | - | - | - | 本報告彙整 |
| **總計** | — | — | **—** | — |

---

## 6. 花費回報

依專案規範：無 API／Cursor 真實 Token Meta 可讀取時填 **-**，禁止推估。

＄作業匯總：Token數: - | 花費: - | 使用模型: 子任務混用（例：`GPT-5.2`、`Composer`—見 `scripts/orchestrator-logs/JOB-183c-cursor-output.log`、`JOB-183d-cursor-output.log`）| 執行者: Cursor
