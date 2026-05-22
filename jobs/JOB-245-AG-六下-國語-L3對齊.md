*Created by Claude Code (claude-opus-4-7) at 2026-05-23 02:40*

`last_updated`: 2026-05-23 04:50
`updated_by`: Claude Code (claude-opus-4-7)

# JOB-245-AG-六下-國語-L3對齊

**`job_type`**：`research`
**`executor`**：Codex CLI gpt-5.5（Phase 1）+ Claude Opus 4.7（Phase 0/2/4）
**`parent_jobs`**：JOB-242/243/244

> ⚠️ **本 JOB 完成 G3-G6 國語 L3 對齊全套**。

---

## 📌 任務背景

JOB-244 完成五下後接做六下，完成 G3-G6 國語 L3 對齊完整套件。

### 素材狀態

| 條件 | 六下_國語 |
|:--|:--|
| L2 抽取 | ✅ JOB-241 完成 84 份 |
| KL3 主檔 | ✅ |
| KL4 33 份 | ✅ 三家各 11 課（六下畢業班，非 12 課）|
| spec v1.1 | ✅ reuse |

### 改版年份判定（Phase 0）

| Publisher | 改版 | 新版年份 | 試卷 |
|:--|:--|:--|:--|
| 翰林 | 111→112 | 112-113 | 9（扣 9 空）|
| 康軒 | 無改版 | 108+ 全 | 16（扣 1 空）|
| 南一 | 108→109 | 109+ | 26（扣 5 空）|
| 合計 | — | — | **51 份** |

⚠️ 六下試卷大量引用古文/外部選文（過故人莊/小時了了/科學怪人/未走之路等），是教育現場真實樣貌。

---

## 📖 執行步驟與結果

| Phase | 開始 | 結束 | 結果 |
|:--|:--|:--|:--|
| 0 版本驗證 | 02:35 | 02:40 | 翰林 111→112 / 康軒無改版 / 南一 108→109 |
| 0.1 scripts fork | 02:40 | 02:45 | scripts/jobs/JOB-245/ + 六下黑名單 |
| 1 Pilot（5 份）| 02:48 | 03:00 | 280 題、R1=9.3%、rc01=30 |
| 1 全量 | 03:00 | 04:37 | 46 份新跑 + 5 SKIP，0 失敗 |
| 2 普查 | 04:37 | 04:45 | pass 85.2% + pass_with_caveat 14.8%、0 reject |
| 3 D/E 報告 | 04:45 | 04:48 | KL3 15/33 覆蓋（其餘 18 課試卷未用）|
| 4 結案 | 04:48 | 04:55 | 對齊報告 + Report |

**總耗時 ~2.3 hr**。

---

## ✅ 驗收 Checklist

### Phase 1
- [x] alignment_raw.json 產出（2,603 題納入對齊範圍）
- [x] kl3_to_l2_coverage（15/33 課，反映六下試卷外部選文多）
- [x] kl4_to_l2_examples（15 課碼）

### Phase 2 普查
- [x] 普查 51 份完整覆蓋
- [x] 0 reject / 0 pending
- [x] high confidence accuracy 親檢通過

### Phase 3-4
- [x] D/E 報告產出
- [x] 六下_國語_L3對齊報告.md（6 H2 段落齊）
- [x] JOB-245-Report.md

### 成果 Checklist
- [x] 進度總表同步
- [x] README_專案發展紀錄新增
- [x] 已執行 /pj_sync
- [x] 異動清單完整
- [ ] node scripts/job_manager.js close JOB-245 — 待執行
- [ ] Discord 結案回報 — 待執行
- [ ] git commit — 待執行
