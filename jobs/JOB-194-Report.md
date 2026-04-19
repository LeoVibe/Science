*Created by Claude Code at 2026-04-18*

`last_updated`: 2026-04-18
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-194 Report — G3 S2 康軒國語 L4/L6 選項長度偏差修正

## 執行摘要

**執行者**：Claude Code（使用者授權例外：使用者明確指示「請由 claude 來做」）
**執行模型**：claude-sonnet-4-6
**完成狀態**：✅ 通過

---

## ✅ 驗收 Checklist（含佐證）

| 項目 | 狀態 | 佐證數值 |
|:--|:--|:--|
| L4 `biasWarning: null` | ✅ | `biasWarning: null`（evaluate 輸出確認） |
| L6 `biasWarning: null` | ✅ | `biasWarning: null`（evaluate 輸出確認） |
| L4/L6 answer_index 與題目內容一致 | ✅ | 全新出題，逐題核對 |
| 兩檔 quality ≥ QL3 | ✅ | L4: QL3；L6: QL3 |

---

## 📊 驗證輸出

### L4 《工匠之祖》
```json
{
  "quality": "QL3",
  "avgCqi": "6.69",
  "count": 30,
  "biasWarning": null,
  "researchCeiling": "QL4",
  "answerDist": { "0": 9, "1": 7, "2": 7, "3": 7 },
  "taxCount": { "literal": 17, "inferential": 8, "applied": 5 }
}
```

### L6 《神奇密碼》
```json
{
  "quality": "QL3",
  "avgCqi": "5.75",
  "count": 29,
  "biasWarning": null,
  "researchCeiling": "QL4",
  "answerDist": { "0": 14, "1": 5, "2": 7, "3": 3 },
  "taxCount": { "literal": 15, "inferential": 11, "applied": 3 }
}
```

---

## 🔧 實際處理說明

### 問題根本原因（修正前）

Cursor 提交的初版修正僅修改 2 題選項，被 Claude 審查駁回，原因：
1. **L4 根本性內容錯誤**：Q1-Q22 全是《愛與成長的腳印》（錯誤課文），非《工匠之祖》
2. **L6 根本性內容錯誤**：全部 29 題是禮貌用語（請/謝謝/對不起），非《神奇密碼》（QR code）
3. 小幅修改屬於「指標套利」，無法解決根本性題目內容錯誤

### 解決方案

由 Claude Code 依 KL4 研究文件全數重寫：
- **L4**：30 題，全依《工匠之祖》課文（魯班→斧頭效率低→草的尖齒啟發→鐵匠鋸子→王宮完工→曲尺石磨→工匠之祖）
- **L6**：29 題，全依《神奇密碼》課文（QR code 的「回」字特徵→聽故事→美術館→感應車站→旅遊美食→生產履歷→掃碼支付）

### 選項長度偏差控制方法論

主動設計三種策略，確保 biasWarning: null：

1. **全等長選項**（約 50% 題目）：4 個選項字數相同，`isAllSameLength=true` → 不計入偏差
2. **錯誤選項刻意加長**（約 30% 題目）：某個錯誤選項加入額外描述，使正確答案非最長
3. **容許正解最長**（約 20% 題目，低於 75% 門檻）：少數題目允許正解較長

**L4 實際結果**：僅 4/30 = 13.3% 題目的正解為最長選項（門檻 75%）
**L6 實際結果**：biasWarning: null 通過

---

## 📁 修改檔案清單

| 檔案路徑 | 變更 |
|:--|:--|
| `question/platform/G3/Chinese/S2/KangHsuan/G3_S2_CHI_KANGHSUAN_L4.json` | 全數重寫，30 題《工匠之祖》 |
| `question/platform/G3/Chinese/S2/KangHsuan/G3_S2_CHI_KANGHSUAN_L6.json` | 全數重寫，29 題《神奇密碼》 |
| `apps/v3_eidos/src/data/libraryStats.json` | generate_library_stats.js 重跑 |
| `apps/v3_eidos/public/data/libraryStats.json` | 同步 src/data |

---

## ⚠️ 遺留問題

| 問題 | 優先度 |
|:--|:--|
| L6 answer_index=0 佔 48%（未超 80% 門檻，但分布偏斜） | 低 |
| L4/L6 quality QL3（blind_evaluation: false，未做盲測） | 中，可另開 question_verify JOB |

---

## 💲作業匯總

＄作業匯總：Token數:- | 花費: $- | 使用模型: claude-sonnet-4-6 | 執行者: Claude Code
