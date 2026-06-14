*Created by Claude Code (claude-opus-4-8) at 2026-06-14*

`last_updated`: 2026-06-14
`updated_by`: Claude Code (claude-opus-4-8)

# JOB-259-AG-三下四下品質稽核與資料面修復

**`job_type`**：`mixed`（question_verify 稽核 + 資料校正 + BIAS 平衡）
**`executor`**：內容校正驗證 Claude → 上架 station 接手部分項目
**`model`**：稽核 claude-opus-4-8、BIAS 平衡 Codex gpt-5.5（訂閱制，未用 API）

> ⚠️ 本 session 只做內容校正驗證。資料面修復已 commit（f566509b），四下社會 BIAS 平衡輸出 `_new.json` 暫存待上架。

---

## 1. 三下四下 三面稽核結果（國·自·社）

| 面向 | 結果 |
|:--|:--|
| 資料面（validate 欄位）| ✅ 修復後 0 error |
| 品質面（QL/CQI/BIAS）| ⚠️ 發現三下社會 6 課 + 四下社會 4 課 BIAS（已處理）|
| 數字面（manifest 一致）| ✅ 修復後一致 |

---

## 2. 資料面修復（已 commit f566509b）

| 項目 | 修復 |
|:--|:--|
| 國語康軒 L4 manifest | count 49→30（過時校正）|
| 自然康軒 L1 id32 | review_status pending→pending_review |
| review_status 不一致 | 60 題（is_publishable=true→confirmed）|
| review_date 缺失 | 補 600 題 |

→ validate 國自社三下四下 **0 error**（排除並發中的三下社會）

---

## 3. 四下社會 4 課 BIAS 平衡（_new 待上架）

### 問題
四下社會 4 課系統性 BIAS（正解總是最長選項）：翰林 L1/L4/L6、康軒 L5

### 解法
Codex 平衡選項長度（**嚴格不改 answer_index/question/語意，只調長度**）。驗證：

| 課 | evaluate | BIAS（最長=正解）| 答案/題幹 |
|:--|:--|:--|:--|
| 翰林 L1 | QL4 cqi 9.19 bias=None | 87%→**0%** | 未改 |
| 翰林 L4 | QL4 cqi 9.18 bias=None | 97%→**0%** | 未改 |
| 翰林 L6 | QL4 cqi 9.37 bias=None | 83%→**0%** | 未改 |
| 康軒 L5 | QL4 cqi 9.25 bias=None | 83%→**0%** | 未改 |

成果在 `_new.json`：
```
question/platform/G4/SocialStudies/S2/HanLin/G4_S2_SOC_HANLIN_L1_new.json (L4,L6)
question/platform/G4/SocialStudies/S2/KangHsuan/G4_S2_SOC_KANGHSUAN_L5_new.json
```

---

## 4. 給上架 station 的待辦

- [ ] 四下社會 4 課用 `_new.json` 覆蓋對應正式檔（BIAS 已消除，答案未變，題數不變 30/課，manifest 免改）
- [ ] 資料面修復（f566509b）已 commit，需 push 上線
- [ ] 連同 JOB-257（三下社會 6 課新題 + 五下社會 10 課）一併上架

---

## ✅ 本 session 完成

- [x] 三下四下三面稽核
- [x] 資料面修復（validate 0 error，commit f566509b）
- [x] 四下社會 4 課 BIAS 平衡 + 驗證（_new，答案題幹未改）

## 真實回報

＄作業匯總：Token數:- | 花費: 訂閱制無單次計費 | 使用模型: claude-opus-4-8 稽核 + Codex gpt-5.5 BIAS平衡 | 執行者: AG
