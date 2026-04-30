*Created by Claude Code at 2026-04-30*

`last_updated`: 2026-04-30
`updated_by`: Claude Code (claude-opus-4-7)

# JOB-221-AG-G3S2-社會-KL3改寫v3

**`job_type`**：`research`
**`executor`**：Claude Code (claude-opus-4-7) — PM 親跑（非 Cursor agent）
**`spec_doc`**: docs/superpowers/specs/2026-04-29-G3S2-social-reverse-lookup-research-design.md
**`plan_doc`**: docs/superpowers/plans/2026-04-29-G3S2-social-reverse-lookup-research.md
**`parent_jobs`**: JOB-217（基礎建設）/ JOB-218/219/220（Phase 2a 三版本反推）/ JOB-215 Phase 2b

## 📌 任務背景

JOB-218/219/220 已完成三版本（翰林30、康軒51、南一24）共 105 份考古題反推，
產出三份彙整報告。本任務由 PM（Opus 4.7）整合三份報告，對 KL3_三下_社會_研究總綱.md
做三分類改寫（v2.1.0 → v3.0.0）。

## 🎯 任務目標

依 spec §6 三分類原則改寫 KL3：
- ✅ 有佐證 → 保留並強化
- ⚠️ 無佐證 → 標注待 KL4 階段補課文驗證
- ❌ 矛盾或缺漏 → 直接修正/補入

達到 KL3 量化 DoD：字數 ≥3000、迷思矩陣 ≥10 條、學術引用 ≥3。

## 🚧 任務邊界

只做：改寫 `knowledge/1_課綱研究/社會/KL3_三下_社會_研究總綱.md`。
不做：改 KL4 / KL2（Phase 2c/2d 處理）；不出題；不改其他 KL3。

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `knowledge/1_課綱研究/社會/三下/_reports/翰林_考古題彙整報告.md` | JOB-218 產出 |
| `knowledge/1_課綱研究/社會/三下/_reports/康軒_考古題彙整報告.md` | JOB-219 產出 |
| `knowledge/1_課綱研究/社會/三下/_reports/南一_考古題彙整報告.md` | JOB-220 產出 |
| `knowledge/README_研究架構總綱.md` | v4.5 KL3 量化 DoD |
| `docs/superpowers/specs/2026-04-29-G3S2-social-reverse-lookup-research-design.md` | §6 三分類原則 |

## ✅ 啟動 Checklist (Pre-Flight)

- [x] 已讀三份 Phase 2a 報告
- [x] 已讀 KL3 v2.1.0 原版
- [x] git tag `kl3-g3s2-social-v2.1.0-backup` 建立完成
- [x] 確認執行模型：claude-opus-4-7（PM 親跑）

## ✅ 驗收 Checklist (Acceptance)

- [x] KL3 v3.0.0 字元數 ≥3,000（實際 11,378）
- [x] 迷思矩陣條目 ≥10（實際 27 條：跨版本共通 8 + 高頻 5 + 版本特色 14）
- [x] 學術引用 ≥3（實際 4：教育部 2018、翁福元 2019、鄭谷苑 2017、國教院 2020）
- [x] 三分類完整（4 保留 / 3 待補 / 11 補入）
- [x] 含 108 課綱學習表現/學習內容對應（6+6 條）
- [x] 含三版本對應細化矩陣（5 大主題）
- [x] 含 KL4 出題優先順序建議（給 Phase 2c）
- [x] 含 KL2 補強候選（給 Phase 2d）

## ✅ 成果 Checklist (Deliverables)

- [x] `knowledge/1_課綱研究/社會/KL3_三下_社會_研究總綱.md` v3.0.0 寫入
- [ ] `jobs/JOB-217-progress.tsv` 寫入 1 行（phase=2b）
- [ ] `jobs/JOB-221-Report.md` 產出
- [ ] `node scripts/job_manager.js close JOB-221`
- [ ] Discord chat_id `1487738477608177714` 結案回報

## 📊 進度摘要

<!-- progress-summary-start -->
<!-- progress-summary-end -->

## 真實回報本次對話的模型與花費

＄作業匯總：Token數:- | 花費: $- | 使用模型: claude-opus-4-7 | 執行者: Claude
