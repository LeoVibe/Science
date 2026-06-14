# JOB-255 Report：三下四下三科健檢與隱形課修復

`last_updated`: 2026-06-14
`updated_by`: Claude Code (claude-opus-4-8)

---

## 1. 任務摘要

| 欄位 | 內容 |
|:--|:--|
| JOB | JOB-255（job_type: question_verify）|
| 起因 | JOB-254 修復國語隱形課後，使用者要求全面健檢三下/四下三科 |
| 執行者 | Claude subagent 盲測 + claude-opus-4-8 |
| 完成 | 2026-06-14 |

---

## 2. 健檢範圍與方法

掃描 G3+G4 × 國語/自然/社會 × 三版本正式檔（排除 staged `_new.json`），判定：
- 🔴 隱形課（盲測過但 is_publishable=0）
- ⚪ 未盲測（blind=0 且 pub=0）
- 🟡 課級不足（pub<25）

---

## 3. 健檢結論

**三下/四下三科正式檔非常健康，僅 1 課隱形**：

| 年級 | 科目 | 版本 | 課 | 問題 |
|:--|:--|:--|:--|:--|
| G4 | 社會 | 南一 | L6 想像家鄉的樣子 | 28 題盲測過、可上架 0（誤標待審）|

其他三下四下三科課次全部正常上架。

**順帶發現**（不擋 gate）：21 處 D-INT-5 manifest title 佔位符 warning（G4 英語等，JOB-205 已知，不影響顯示）。

---

## 4. 修復：G4 社會南一 L6

- Claude subagent 重新盲測：**Match 28/28 (100%)** → 答案確認正確（誤標待審）
- 回寫 is_publishable=28/28、review_status=confirmed、validate 0 error
- source+public 同步，push 440faacd 上版

---

## 5. 異動清單

- `question/platform/G4/SocialStudies/S2/NanYi/G4_S2_SOC_NANYI_L6.json` + public 副本
- `scripts/jobs/JOB-255/_blind/`

---

## 6. 結案 Checklist

- [x] README_專案發展紀錄已觸發 /pj_sync（JOB-255 記錄新增）
- [x] /pj_sync 已執行

---

## 7. 遺留問題

1. **隱形課根因建議**：JOB-254+255 共修復 4 課（國語 3+社會 1）JOB-165 時代「盲測過但 is_publishable=0」遺留。建議未來對 G5/G6 同樣健檢（本 JOB 範圍限 G3/G4）。
2. 21 處 manifest title 佔位符（JOB-205 範疇，另處理）。

---

## 8. 模型與成本

＄作業匯總：Token數:- | 花費: 訂閱制無單次計費 | 使用模型: claude-opus-4-8 | 執行者: AG
