*Created by USER at 2026-06-14 13:00*

`last_updated`: 2026-06-14 13:30
`updated_by`: Claude Code (claude-opus-4-8[1m])

# JOB-258-DEV-上版前測試計劃-SOP建立與全面驗證

**`job_type`**：`engineering`

## 📌 任務背景
近一個月 18 張 JOB 密集出題/重出/修隱形課/修回饋/數英下架，暴露多個閘門失效（假綠燈測試、過時統計、隱形課、回饋缺 id）。需建立常駐「上版前測試 SOP」並用它把最近改動全面驗證一次。設計依據見 `docs/superpowers/specs/2026-06-14-上版前測試計劃-design.md`、計劃 `docs/superpowers/plans/2026-06-14-上版前測試計劃.md`。

## 🎯 任務目標
1. 建立 `docs/上版前測試清單.md`（五層 SOP）。
2. 修「假綠燈測試」（questionLoader.test）+ 補回饋守門測試。
3. 建對帳腳本（快照/隱形課）並執行 L1–L2。
4. 18 張 JOB 逐張補驗證；前端 UI 黑箱；60 組合題庫抽檢。
5. 缺陷只記入缺口清單，不就地修。

## 🚧 任務邊界
- 只做測試/驗證 + 建 SOP；**發現缺陷只記不修**（範圍外另開單）。
- 不改規範文件（SOP 為新增）。

## ✅ 啟動 Checklist
- [x] 已讀：前端守則、通用作業準則、出題/驗證準則、ei_release
- [x] 執行模型：claude-opus-4-8[1m]（PM 親自，使用者授權）
- [x] 範圍：最近一月 18 JOB + 60 題庫組合 + 前端

## ✅ 驗收 Checklist（engineering）
- [x] SOP 文件建立：`docs/上版前測試清單.md`
- [x] 假綠燈測試修復：vitest 28/28（含 id 守門測試，已驗移除 fallback 會 FAIL）
- [x] 對帳腳本建立並執行：總數過時 0、隱形課嫌疑 1
- [x] L2 建置：tsc 0、build exit 0
- [x] 18 JOB 逐張彙整完成（見 Report）
- [x] 60 組合程式面抽檢完成（見 Report 缺口）
- [~] 前端 UI 黑箱：JOB-256 期間已實測主要流程（選課/答題/回饋200/BETA/數英擋/about），未逐項重跑

## ✅ 成果 Checklist
- [x] `docs/上版前測試清單.md`、`scripts/audit_*.mjs`、修正後 `questionLoader.test.ts`
- [x] JOB-258 Report（含缺口清單）
- [ ] 進度總表/pj_sync（結案前補）

## 真實回報
＄作業匯總：Token數:- | 花費: - | 使用模型: claude-opus-4-8[1m] | 執行者: Claude
