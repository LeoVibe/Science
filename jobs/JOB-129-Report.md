# JOB-129 結案報告：南一三下國語題庫清空與依 KL4 重產

`last_updated`: 2026-03-30 14:30  
`updated_by`: Cursor Agent  

> **編號說明**：本任務曾暫標為 JOB-107，已更正為 **JOB-129**（與 repo 內 `JOB-107-PLAN-*` 自然科計畫檔區隔）。  
> **派工單**：`jobs/JOB-129-AG-南一三下國語題庫全課重製.md`

---

## 狀態總覽

| 階段 | 狀態 |
|:---|:---|
| 階段一（清空與封鎖） | ✅ 已完成（2026-03-29） |
| 階段二（依 KL4 全課重產） | ⏳ **部分完成**：**6／12 課**已達每課 **30 題**；**L3–L9** 尚為 **0 題**，需續跑產題 |

---

## 階段二執行紀錄（2026-03-30）

### 產題設定

| 項目 | 值 |
|:---|:---|
| 金鑰標籤 | `Yotta`（`ApiKeys.cfg` 內對應帳戶；使用者允許付費／非免費額度） |
| 模型 | **`gemini-2.5-flash`**（**勿**用 `gemini-2.0-flash`：實測連續 **429**；`gemini-1.5-flash` 於 v1beta 回 **404**） |
| 曾用參數（前半完課） | `--qpm 8 --batch 8 --target 30 --threshold 5.0` |
| 續跑建議（降 429） | `--conservative --qpm 2 --batch 4`（見下方指令） |
| KL4 前置 | `node scripts/verify_chinese_kl4_prereq.js G3` ✅ 通過 |
| 品質複驗 | `node scripts/evaluate_question_quality.js question/platform/G3/Chinese/S2/NanYi` 已執行（有題之檔已寫回 CQI） |

### 逐課題數（目標每課 30）

| 課次 | 題數 | 備註 |
|:---|---:|:---|
| L1 | 30 | ✅ |
| L2 | 30 | ✅ |
| L3 | 0 | 待續跑 |
| L4 | 0 | 待續跑 |
| L5 | 0 | 待續跑 |
| L6 | 0 | 待續跑 |
| L7 | 0 | 待續跑 |
| L8 | 0 | 待續跑 |
| L9 | 0 | 待續跑 |
| L10 | 30 | ✅ |
| L11 | 30 | ✅ |
| L12 | 30 | ✅ |

**合計**：**150／360** 題；`G3_S2_CHI_NANYI_manifest.json` 已同步 `count`／`avg_cqi`／`moduleMetaData.total_questions`，**`shelf_blocked: true`**（全冊未齊前維持封架）。

### API 限制說明

Google Generative Language API 於本機連續呼叫時仍頻繁回 **429**（與金鑰是否標為「付費」無必然對應，屬**專案／模型配額與速率**問題）。已嘗試降低 **QPM**、**batch**、**`--conservative`**；**L3** 起仍易在單課多批次中途觸發 429。建議：**離峰時段**再執行下方續跑指令，或於 Google AI Studio 確認專案配額／計費方案。

### 續跑指令（僅會補 **題數未滿 30** 之檔，已滿者會跳過）

於專案根目錄：

```bash
node scripts/auto_generate_questions.js question/platform/G3/Chinese/S2/NanYi \
  --key Yotta \
  --model gemini-2.5-flash \
  --conservative \
  --qpm 2 \
  --batch 4 \
  --target 30 \
  --threshold 5.0
```

日誌（可追加）：`.logs/JOB-129-nanyi-generate.log`

**全冊皆達 30 題後**請再執行：

1. `node scripts/evaluate_question_quality.js question/platform/G3/Chinese/S2/NanYi`
2. 依派工 DoD 更新 manifest **`shelf_blocked`**（須 PM 同意）、並視需要跑盲測（`README_驗證與盲測準則.md` §2.5）。

---

## 階段一（歷史紀錄）

| 項目 | 說明 |
|:---|:---|
| 清空範圍 | `G3_S2_CHI_NANYI_L1.json`～`L12.json` 曾清空為 `[]` |
| 研究檔 | **未**變更 `knowledge/課綱研究/國語/三下/南一/`（派工要求保留） |

---

## 關聯路徑

- 題庫：`question/platform/G3/Chinese/S2/NanYi/`
- 研究：`knowledge/課綱研究/國語/三下/南一/`

---

## 結案同步（供 `job_manager.js close`）

- [ ] 階段二 **12 課全數 ≥25～30 題**、盲測／上架策略依準則處理後，再勾選並執行 /dosync
