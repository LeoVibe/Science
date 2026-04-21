# JOB-129-AG-南一三下國語題庫全課重製

`last_updated`: 2026-03-30 14:30  
`updated_by`: Cursor Agent  

> **編號說明**：本任務曾暫標為 JOB-107，已更正為 **JOB-129**（與 repo 內 `JOB-107-PLAN-*` 自然科計畫檔區隔）。  
> **檔名**：已收斂為合規正式派工；結案見 `jobs/JOB-129-Report.md`（見 `docs/README_任務派工準則.md` 第三章 §3.4）。

---

## 一、原委

- **南一三下國語**既有題庫經評估**品質過差**（課文錯置、套話、盲測高風險等），不宜逐題修補。
- **`knowledge/` 內 KL4／KL3 研究素材無問題**，**禁止**為重產題而刪改研究檔。

---

## 二、範圍

| 納入 | 排除 |
|:---|:---|
| `question/platform/G3/Chinese/S2/NanYi/G3_S2_CHI_NANYI_L*.json`（L1–L12） | `knowledge/1_課綱研究/國語/三下/南一/**`（保留） |
| `G3_S2_CHI_NANYI_manifest.json` | 翰林、康軒三下題庫 |

---

## 三、已執行處分（2026-03-29）

- 已將 **L1–L12** 之 `questions` **清空**（`[]`），保留 `meta.title`／`theme` 等欄位以利對照課次。
- 每檔 `meta` 增註：`rebuild_status: pending_full_rebuild`、`rebuild_note`（說明研究檔保留）。
- **manifest**：各課 `count: 0`、`quality: REBUILD`；`moduleMetaData.total_questions: 0`、`shelf_blocked: true`、`rebuild_note` 說明全課待重產。

---

## 四、待辦（重產與上架）

1. 依 **`knowledge/1_課綱研究/國語/三下/南一/`** 各課 KL4「課文全文錄製」與「考古題與討論」**逐課重產**（預設目標題數見 `README_出題與品管準則.md` **P-K**）。  
   - **實務備註（2026-03-30）**：產題建議 **`gemini-2.5-flash`**；`gemini-2.0-flash` 易 **429**。續跑指令與進度見 **`jobs/JOB-129-Report.md`**。
2. 跑 `evaluate_question_quality.js`、盲測；遵守 `README_驗證與盲測準則.md` **§2.5**（整課上架管制）。
3. 更新 manifest、`shelf_blocked` 解除條件於結案報告註記（**全冊 12 課齊備後**再解除封架）。

---

## 五、驗收（DoD）

- [ ] 12 課皆 `count` ≥ 派工目標（建議 **≥25**，預設 **30**）。（**進度**：2026-03-30 已完 **L1、L2、L10–L12** 共 6 課；**L3–L9** 待補。）
- [ ] 無 `REBUILD` 占位品質標；`shelf_blocked` 經 PM 同意後移除或改 false。
- [ ] 結案報告與進度表同步。

---

## 六、關聯規範

- `question/README_出題與品管準則.md`（P-K）
- `question/README_驗證與盲測準則.md`（§2.5）
