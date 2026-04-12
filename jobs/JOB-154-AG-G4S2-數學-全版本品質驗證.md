*Created by Claude Code (claude-haiku-4-5) at 2026-04-05*

`last_updated`: 2026-04-05
`updated_by`: Claude Code (claude-haiku-4-5)

# JOB-154：G4 S2 數學 全版本品質驗證

**`job_type`**: `question_verify`
**執行者**：Cursor / AG
**預計 API 消耗**：~200~250 RPD（純盲測，無需補題）

---

## 📌 現況評估（普查數據）

### 題庫現況 ✅ 數量完整

| 版本 | 總題數 | 每課均題數 | 狀態 |
|:---|:---:|:---:|:---|
| 翰林 HanLin | ~300 | 30 | ✅ 完整，無需補題 |
| 康軒 KangHsuan | ~300 | 30 | ✅ 完整，無需補題 |
| 南一 NanYi | ~298 | 29.8 | ✅ 接近完整，無需補題 |

**G4 S2 數學為所有科目中題庫最完整的科目**，10 課 × 30 題，結構均衡。

### 盲測狀態
- ❌ 全部 30 個 JSON 檔均未執行盲測
- ⚠️ 參考 G3 S2 數學先例：Match Rate 僅 78.6~81.9%（低於 85% 門檻）
- **高風險預警**：G4 S2 數學可能面臨相同問題，需特別關注計算類課次

---

## 🎯 任務目標

1. **盲測驗證**：三版本全部 30 課，Match Rate ≥ 85%
2. **Mismatch 分析**：識別低分課次根因（計算誤 / 視覺限制 / 題幹歧義）
3. **修正或確認**：所有 Mismatch 題目完成 MTP 分流

> ⚠️ **注意**：若 Match Rate < 85%，需回報 Claude Code 決策（修題 or 調整門檻），
> 不得自行繼續。

---

## 📖 執行步驟

### Step 1：盲測全量執行

```bash
node scripts/run_blind_eval.js \
  question/platform/G4/Math/S2/HanLin --force

node scripts/run_blind_eval.js \
  question/platform/G4/Math/S2/KangHsuan --force

node scripts/run_blind_eval.js \
  question/platform/G4/Math/S2/NanYi --force
```

### Step 2：Match Rate 評估與分級處理

| Match Rate 結果 | 處置方式 |
|:---|:---|
| ≥ 90% | ✅ 通過，記錄結案 |
| 85%~89% | ✅ 通過，標記 Mismatch 題目 confirmed |
| 80%~84% | ⚠️ 低於門檻，提取 Mismatch，分析根因，回報 Claude Code |
| < 80% | 🚨 暫停，回報 Claude Code 決策 |

### Step 3：Mismatch 審視

預期常見根因（參考 G3 S2 數學經驗）：
- **AI 計算誤差**：除法、分數、多步計算
- **圖形/視覺題**：AI 無法判斷圖形（ai_selected = -1）
- **題幹歧義**：多種合理解釋

每個 Mismatch 題需標記：
```json
"blind_eval_mismatch": {
  "ai_selected": X,
  "correct_answer": Y,
  "reason": "說明根因",
  "review_status": "confirmed" | "corrected" | "needs_rework"
}
```

---

## ✅ 啟動 Checklist

- [ ] 已讀取 `question/README_驗證與盲測準則.md`
- [ ] 已確認執行模型：Gemini-3.1-Flash-Lite（Yotta 金鑰）
- [ ] 已了解 G3 S2 數學低分先例（預做心理準備）

---

## ✅ 驗收 Checklist

- [ ] 翰林 Match Rate ≥ 85%（或已回報 Claude Code 決策）
- [ ] 康軒 Match Rate ≥ 85%（或已回報 Claude Code 決策）
- [ ] 南一 Match Rate ≥ 85%（或已回報 Claude Code 決策）
- [ ] 所有 Mismatch 題目已完成 MTP 分流（confirmed / corrected / needs_rework）
- [ ] `JOB-154-Report.md` 已產出
- [ ] 已執行 `/pj_sync`

---

## 💲 成本預估

| 項目 | 消耗 |
|:---|:---|
| 盲測（~900 題） | ~200~250 RPD |
| **合計** | **~200~250 RPD** |
| **使用金鑰** | Yotta（Gemini-3.1-Flash-Lite） |
| **預計工期** | 1~2 天 |

---

## 真實回報本次對話的模型與花費

＄作業匯總：Token數:- | 花費:- | 使用模型:- | 執行者:-
