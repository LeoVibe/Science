*Created by Claude Code at 2026-04-30*

`last_updated`: 2026-04-30
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-219-AG-G3S2-社會-康軒-考古題反推

**`job_type`**：`research`
**`executor`**：Cursor (model: claude-sonnet-4-6)
**`spec_doc`**: docs/superpowers/specs/2026-04-29-G3S2-social-reverse-lookup-research-design.md
**`plan_doc`**: docs/superpowers/plans/2026-04-29-G3S2-social-reverse-lookup-research.md
**`parent_jobs`**: JOB-217（基礎建設）/ JOB-215 Phase 2

> Dispatched at 2026-04-30 13:55, PID=39675, log=scripts/orchestrator-logs/JOB-219-康軒-反推.log

## 📌 任務背景

JOB-213 已將康軒 51 份考古題轉成 MD（`knowledge/3_考古題/2_MD淬鍊文字/三下/三下_社會_康軒/`）。
本任務由 Cursor agent 讀全部 51 份 → 按課歸類 → 淬鍊每課出題方向，產出
《康軒 三下社會 考古題彙整報告》供 Phase 2b PM 改寫 KL3 用。

## 🎯 任務目標

完成《康軒 三下社會 考古題彙整報告》達 B 完整版 DoD：
- 字數 ≥ 5,000
- 逐題分類表完整（51 份 MD 所有題目，每題標 lesson）
- 6 課（L1-L6）逐課深度分析
- 每課迷思矩陣 ≥ 5 條
- 達標檢核：每課題數 / 來源學校數明確

## 🚧 任務邊界

只做：讀 51 份康軒 MD → 寫一份彙整報告。
不做：改 KL3 / KL4（後續階段）；不動翰林/南一 MD；不出題。

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `knowledge/3_考古題/2_MD淬鍊文字/三下/三下_社會_康軒/` | 51 份 MD 來源 |
| `knowledge/1_課綱研究/社會/KL3_三下_社會_研究總綱.md` | 康軒 6 課課名清單 |
| `knowledge/3_考古題/README.md` | 考古題鐵律 + 課次分類準則 |
| `knowledge/README_研究架構總綱.md` | v4.5 量化 DoD |
| `docs/superpowers/specs/2026-04-29-G3S2-social-reverse-lookup-research-design.md` | §4 詳細指示 |

## 📖 執行步驟（Agent 自主迴圈）

```
必讀：
  1. docs/superpowers/specs/2026-04-29-G3S2-social-reverse-lookup-research-design.md（§4 是詳細指示）
  2. knowledge/1_課綱研究/社會/KL3_三下_社會_研究總綱.md（康軒 6 課課名）
  3. knowledge/3_考古題/README.md（課次分類準則）
  4. ls knowledge/3_考古題/2_MD淬鍊文字/三下/三下_社會_康軒/ 確認 51 份

自主迴圈（for 每課 L1~L6）：
  1. 讀當批 MD，每題標 lesson（明確 / ambiguous）
  2. 寫第三節該課深度分析（5 子節：題目清單/出題方向統計/跨年度頻率/誘答機制/迷思矩陣≥5條）
  3. 追加一行至 jobs/JOB-217-progress.tsv：
     <git_commit>\t2a\tSocial\tKangHsuan\t<lesson>\t-\t-\t-\t<RM>\t<status>\t<desc>\t<ts>
     status 值：keep / β+_keep（題數<5）/ manual_review / crash

直到 6 課全完 → 產出完整報告 → git commit → 寫整體彙整
```

報告章節結構（spec §4.2）：
1. 概覽（總題數/各課題數分布/來源學校數）
2. 逐題分類表（全 51 份 MD 所有題，每題含：題號/課次/信心度/來源）
3. 逐課深度分析（L1-L6 各課，5 子節）
4. 達標檢核（每課：題數/來源數/RM 狀態/α 或 β+）
5. 給 PM 的建議（KL3 需補強的迷思方向）

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] 已讀 spec §2.2 B 路徑、§4 階段 2a 詳細設計
- [ ] 已讀 KL3 康軒 6 課課名清單（確認 L1-L6 課名）
- [ ] 已 ls 確認 51 份 MD 存在

## ✅ 驗收 Checklist (Acceptance)

- [ ] 報告字數 ≥ 5,000（`wc -m`）
- [ ] 逐題分類表覆蓋 51 份 MD 所有題目
- [ ] L1-L6 六課皆有獨立深度分析節
- [ ] 每課迷思矩陣 ≥ 5 條
- [ ] 達標檢核明確（每課題數 + 來源學校數 + RM 狀態）
- [ ] β+ 標記課次有「來源稀缺警告」說明

## ✅ 成果 Checklist (Deliverables)

- [ ] `knowledge/1_課綱研究/社會/三下/_reports/康軒_考古題彙整報告.md` 產出
- [ ] `jobs/JOB-217-progress.tsv` 寫入 6 行（每課一行，L1-L6）
- [ ] `jobs/JOB-219-Report.md` 產出
- [ ] `node scripts/job_manager.js close JOB-219`
- [ ] Discord chat_id `1487738477608177714` 結案回報

## 退件條件（停下回報 PM，不繼續）

- 某課題數 < 3 → 標 β+_keep + 報告寫「來源稀缺警告」
- MD 讀失敗連 5 次 → crash 停下
- 課次信心 < 60% 題目占比 > 40% → manual_review

## 📊 進度摘要

<!-- progress-summary-start -->
<!-- progress-summary-end -->

## 真實回報本次對話的模型與花費

＄作業匯總：Token數:- | 花費: $- | 使用模型: claude-sonnet-4-6 | 執行者: Cursor
