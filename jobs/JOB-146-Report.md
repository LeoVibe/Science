<!--
last_updated: 2026-04-04 12:00
updated_by: Cursor (Agent)
-->

# JOB-146-Report：G3 S2 自然（HanLin／KangHsuan／NanYi）CQI-P 品質評估

**派工單**：`jobs/JOB-146-AG-G3S2-自然-品質評估.md`  
**執行方式**：本地 `node scripts/evaluate_question_quality.js`（無 API）  
**題目內容**：未修改

---

## 1. 各目錄 CQI-P：平均分、最低分

| 目錄 | 題數 | CQI-P 平均分（註） | CQI-P 最低分（各課平均中之最小值） |
|------|------|-------------------|-----------------------------------|
| `question/platform/G3/Science/S2/HanLin` | 120 | **6.37** | **6.15**（L2） |
| `question/platform/G3/Science/S2/KangHsuan` | 120 | **6.25** | **5.88**（L2） |
| `question/platform/G3/Science/S2/NanYi` | 150 | **6.33** | **5.95**（L4） |

**註**：HanLin、KangHsuan 每課 30 題，目錄平均分為四課 `avgCqi` 之算術平均。NanYi 之 L3 檔合併 60 題，目錄平均分為依題數加權：  
\((30×L1 + 30×L2 + 60×L3 + 30×L4) / 150\)。

---

## 2. 各課 CQI-P 明細與「低於 5.5」課別

### HanLin（4 檔 × 30 題）

| 課次 | 檔案 | avgCqi | 低於 5.5？ |
|------|------|--------|------------|
| L1 | `G3_S2_SCI_HANLIN_L1.json` | 6.33 | 否 |
| L2 | `G3_S2_SCI_HANLIN_L2.json` | 6.15 | 否 |
| L3 | `G3_S2_SCI_HANLIN_L3.json` | 6.40 | 否 |
| L4 | `G3_S2_SCI_HANLIN_L4.json` | 6.58 | 否 |

**低於 5.5 之課**：無。

---

### KangHsuan（4 檔 × 30 題）

| 課次 | 檔案 | avgCqi | 低於 5.5？ |
|------|------|--------|------------|
| L1 | `G3_S2_SCI_KANGHSUAN_L1.json` | 6.27 | 否 |
| L2 | `G3_S2_SCI_KANGHSUAN_L2.json` | 5.88 | 否 |
| L3 | `G3_S2_SCI_KANGHSUAN_L3.json` | 6.38 | 否 |
| L4 | `G3_S2_SCI_KANGHSUAN_L4.json` | 6.46 | 否 |

**低於 5.5 之課**：無。

---

### NanYi（L3 為單檔 60 題，其餘各 30 題）

| 課次 | 檔案 | 題數 | avgCqi | 低於 5.5？ | 備註（腳本輸出） |
|------|------|------|--------|------------|------------------|
| L1 | `G3_S2_SCI_NANYI_L1.json` | 30 | 6.37 | 否 | 檔案層級標示 QL1（研究上限） |
| L2 | `G3_S2_SCI_NANYI_L2.json` | 30 | 6.34 | 否 | 同上 |
| L3 | `G3_S2_SCI_NANYI_L3.json` | 60 | 6.50 | 否 | 同上 |
| L4 | `G3_S2_SCI_NANYI_L4.json` | 30 | 5.95 | 否 | **QL1 (BIAS)**，`biasWarning`: 選項長度偏差過大 |

**低於 5.5 之課**：無。

---

## 3. 建議：是否需要補題或修正

| 判準 | 說明 |
|------|------|
| 派工目標 | 各目錄 CQI-P 平均 ≥ **5.5**；本次三目錄加權／算術平均皆 **≥ 6.25**，且**無任何一課** avgCqi **低於 5.5**。 |
| 補題 | **無需因 CQI-P 未達 5.5 而補題**（無課別低於門檻）。 |
| 修正（可選） | **KangHsuan L2**（5.88）為三版本全體中**最低之課別平均**，若 PM 希望拉高余裕，可優先檢視該檔題幹／選項／解析之結構性品質（非本次執行）。 |
| 修正（可選） | **NanYi L4**：腳本標示 **選項長度偏差過大**（BIAS），CQI-P 仍 5.95；若產品面在意選項公平性，建議後續排程**調整選項長度分布**（屬修正而非補題）。 |
| 研究檔 | 三版本皆出現 **researchCeiling: QL1**，原因為腳本找不到「三年級下學期」對應**發展綱要**路徑；此為**研究資產／路徑對應**議題，不表示單題必須重出，但會使檔案層級 QL 被壓在 QL1，後續可由 Claude Code／知識庫維運決定是否補文件或調整對應規則。 |

---

## 4. 執行紀錄

```bash
node scripts/evaluate_question_quality.js question/platform/G3/Science/S2/HanLin
node scripts/evaluate_question_quality.js question/platform/G3/Science/S2/KangHsuan
node scripts/evaluate_question_quality.js question/platform/G3/Science/S2/NanYi
```

**結束**：2026-04-04（報告撰寫時刻以檔首 `last_updated` 為準）。

---

＄作業匯總：Token數:未提供 | 花費:未提供 | 使用模型:未提供 | 執行者:Cursor

- [x] /dosync 確認：品質評估任務，無規格文件異動
