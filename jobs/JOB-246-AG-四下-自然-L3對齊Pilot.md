*Created by Codex CLI (gpt-5.5) at 2026-05-24*

`last_updated`: 2026-05-24
`updated_by`: Codex CLI (gpt-5.5)

# JOB-246-AG-四下-自然-L3對齊Pilot

**`job_type`**：`research`
**`executor`**：Codex CLI gpt-5.5（Task 2/3/4/5/7/8/9 subagent）+ Claude general-purpose subagent（Task 6.5 三審）+ Claude Opus 4.7（整合驗收）
**`parent_jobs`**：JOB-242~245（G3-G6 國語 L3 對齊全套）
**`upstream_spec`**：`docs/superpowers/specs/2026-05-23-natural-science-l3-alignment-design.md`（v2.0）
**`implementation_plan`**：`docs/superpowers/plans/2026-05-23-natural-science-l3-alignment-pilot-plan.md`

> ⚠️ 本 JOB 為 spec v2.0（自然版 L3 對齊）首次 Pilot 驗證。
> 採三審制：Python L2 預判 → Codex 抽查 → Claude subagent 仲裁。

---

## 📌 任務背景

JOB-242~245 已完成 G3-G6 國語 L3 對齊（180 試卷 / 8,439 題 / 平均 90.2% pass / 0 reject）。
自然無 RC-01 課文，需 spec v2.0 新機制驗證。本 JOB 對四下自然 118 試卷做 Pilot。

### 素材狀態

| 條件 | 四下_自然 |
|:--|:--|
| L2 抽取 | ✅ 118 份 |
| KL3 | ✅ KL3_四下_自然_研究總綱.md |
| KL4 12 課 | ✅ 三家各 12 課完整 |
| spec v2.0 | ✅ docs/superpowers/specs/2026-05-23-natural-science-l3-alignment-design.md |

---

## 🎯 任務目標

依 implementation plan 執行 Task 1-10：
1. Phase 0：L2 codes_candidate 預覽分析
2. Phase 1a：Python 規則套用（全 6000 題）
3. Phase 1b：Codex 抽查（~30% 邊界）
4. Phase 1c：Claude subagent 三審（~10% 衝突）
5. Phase 2：auto-verify 普查
6. Phase 3：三大反向報告（codes 覆蓋 / KL4 教學 / 迷思診斷）
7. Phase 4：對齊報告 + Report + 結案

---

## 🚧 任務邊界

**只做**：四下自然 L3 對齊 Pilot（reuse spec v2.0）
**不做**：三下/五下/六下自然 / 社會（後續另開 JOB）

---

## ✅ 啟動 Checklist
- [ ] spec v2.0 已 commit
- [ ] implementation plan 已 commit
- [ ] L2 / KL3 / KL4 素材確認完整
- [ ] scripts/jobs/JOB-246/ 目錄就緒

## ✅ 驗收 Checklist

### Phase 1
- [ ] alignment_raw.json 產出（schema v2.0）
- [ ] codes_coverage_report.md 完整
- [ ] kl4_teaching_examples.md 完整
- [ ] misconception_diagnosis.md 完整

### Phase 2 普查
- [ ] 普查 118 份 0 reject 0 pending
- [ ] N1 比例 ≥ 60%
- [ ] kl4_supported 比例 ≥ 30%

### Phase 4 報告
- [ ] 四下_自然_L3對齊報告.md（6 H2 段落齊）
- [ ] JOB-246-Report.md

## ✅ 成果 Checklist
- [ ] 進度總表已同步
- [ ] README_專案發展紀錄新增
- [ ] /pj_sync 已執行
- [ ] node scripts/job_manager.js close JOB-246
- [ ] Discord 結案回報
- [ ] git commit
