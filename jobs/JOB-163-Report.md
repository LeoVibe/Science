# JOB-163 結案報告：驗收門檻重定義 — 題級 CQI 取代課級 Match Rate

`last_updated`: 2026-04-08 15:30:00
`updated_by`: Claude Code (claude-sonnet-4-6)

**`job_type`**: `docs_ops`
**`executor`**: Claude Code（使用者授權）
**`status`**: ✅ 完成

---

## 執行摘要

將盲測驗收門檻從「全線 Match Rate ≥ 85%（課級）」改為「每課 `is_publishable: true` 題數 ≥ 25（題級聚合）」。核心目的：圖形題、計算複雜題因 AI 能力限制造成的 Mismatch，不應封鎖同課其他正確題目的上版資格。

---

## 異動內容

### `question/README_驗證與盲測準則.md`（v4.1 → v4.2）

| 節次 | 修改前 | 修改後 |
|:--|:--|:--|
| §2.4 | Match/Mismatch 二元處理 | 新增 ai=-1 分支（is_publishable=false） |
| §2.5 | 課級規則：Mismatch > 2 → 整課不得上架 | 廢止舊規；新增單題四條件 + 課級唯一硬限制（≥ 25 題） |
| §5.2 DoD | 「全線 Match Rate ≥ 85%」 | 改為「每課 is_publishable ≥ 25」，Match Rate 降為參考指標 |

---

## 新規則定義

### 單題 `is_publishable` 判定

| 情境 | 結果 |
|:--|:--|
| Match + CQI ≥ 6.5 | `is_publishable: true` |
| Mismatch → 人工審核確認正確 | `is_publishable: true` |
| Mismatch → 人工審核確認有誤 | 修題後重測 |
| ai = -1（圖形題） | `is_publishable: false` |
| 未跑盲測 | `is_publishable: false` |

### 課級唯一硬限制

> 每課 `is_publishable: true` 題數 ≥ 25 → 可上線

---

## 數學上線狀態驗證（JOB-163 附帶執行）

| 版本 | 可發佈題數 | 全課達標 |
|:--|:--:|:--|
| 翰林 | 270/270 | ✅ 全部 9 課 |
| 康軒 | 266/266 | ❌ L3 僅 24 題（題數不足，非本 JOB 範圍） |
| 南一 | 300/300 | ✅ 全部 10 課 |

---

## 遺留問題

1. **康軒 L3 缺 1 題**：24 題全數可發佈但不足 25，需另立 `question_prod` JOB 補 1 題
2. **國語 CQI 偏低**：三版本 CQI 均在 QL3（cqi_score=3），尚未達 QL4 門檻，需另立補強 JOB
3. **evaluate_question_quality.js 腳本 bug**：國語評估時拋出 `gradeCN is not defined`（第 65 行），影響品質驗證，需另立修復 JOB
4. **JOB-152 初始化邏輯待更新**：`blind_evaluation=true → is_publishable=true` 邏輯不完整，未區分 Match/Mismatch/ai=-1，系統層修正另立 JOB

---

## Checklist

### 啟動
- [x] 讀取規範文件（驗證準則、通用準則）

### 驗收
- [x] §2.5 Match Rate 硬門檻條文已廢止
- [x] 單題 is_publishable 四條件清楚定義
- [x] 課級硬限制寫為「≥ 25 題」
- [x] 文件版本 4.1 → 4.2，last_updated 含日期時分秒

### 成果
- [x] JOB-163-Report.md 產出
- [x] 數學三版本可發佈題數驗證完成（翰林/南一全課達標，康軒 L3 缺 1 題記錄於遺留問題）

---

＄作業匯總：Token數:- | 花費: $- | 使用模型: claude-sonnet-4-6 | 執行者: Claude Code
