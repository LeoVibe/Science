*Created by Claude Code (PM) at 2026-04-22 — 追溯補建（原任務執行於 2026-04-11）*

`last_updated`: 2026-04-22
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-176-AG：南一四下社會 KL4 考古題蒐集

**`job_type`**: `research`
**`executor`**: Claude Code（AG）

## 📌 任務背景

G4 S2 社會南一版 KL4 考古題尚未建立，後續出題需要足夠的考古題基礎（每課 ≥10 題、≥2 來源）。

## 🎯 任務目標

透過 tcool.cc mock quiz 法，蒐集南一四下社會 L1/L2/L3/L6 的 KL4 考古題，達到每課 ≥10 題（L6 為低出題頻率課次，盡力蒐盡）。

## 🚧 任務邊界

本次任務只做：
- 抓取 tcool.cc 相關學校考卷（period=3/4）
- 分類寫入各課 `KL4_四下_南一_LN_*.md`
- 同步更新 `docs/進度彙整_題庫研發與產出.md`

本次任務不做：
- 出題（另開 `question_prod` JOB）
- 修改題庫 JSON
- 修改規範文件

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `knowledge/README_研究架構總綱.md` | KL4 架構定義 |
| `knowledge/1_課綱研究/社會/四下/南一/` | 目標知識庫路徑 |

## ✅ 驗收標準

- L1/L2/L3 各課 ≥10 題、≥2 不同來源
- L6 已蒐盡 tcool.cc 可用來源
- 各課 KL4 檔案更新完成

---

> **追溯說明**：本派工單依 JOB-176-Report（2026-04-11）補建，工作已完成（L1=12、L2=12、L3=17、L6=6 題）。
