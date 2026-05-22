*Created by Claude Code (claude-opus-4-7) at 2026-05-23 01:15*

`last_updated`: 2026-05-23 01:15
`updated_by`: Claude Code (claude-opus-4-7)

# JOB-244-AG-五下-國語-L3對齊

**`job_type`**：`research`
**`executor`**：Codex CLI gpt-5.5（Phase 1 自動對齊）+ Claude Opus 4.7（Phase 0 版本驗證 / Phase 2 普查 / Phase 4 親寫）
**`parent_jobs`**：JOB-243（spec v1.1 reuse 首次擴展，三下_國語）+ JOB-241（五下_國語 L2 抽取）

> ⚠️ **本 JOB 是 L3 對齊機制的「第二次擴展驗證」**。
> 💡 **Phase 0 版本驗證已於 JOB-243 期間預先完成**，可直接進 Phase 0.1 fork。

---

## 📌 任務背景

reuse JOB-243 全套機制做五下_國語。Phase 0 五下三版本改版年份已預先驗證：**三家都 111→112**（巧合一致，不同於三下/四下）。

### 素材狀態

| 條件 | 五下_國語 |
|:--|:--|
| L2 抽取 | ✅ JOB-241 完成 109 份 |
| KL3 主檔 | ✅ `KL3_五下_國語_研究總綱.md` |
| KL4 36 份 | ✅ 翰林 12 / 康軒 12 / 南一 12 全齊（標 113 下學期）|
| chinese_codes_legal_II.json | ✅ reuse |
| spec v1.1 | ✅ JOB-242/243 reuse |

### L2 試卷分布（109 份）

| 學年 | 翰林 | 康軒 | 南一 | 合計 |
|:--|:--|:--|:--|:--|
| 108 | 3 | 15 | 12 | 30 |
| 109 | 0 | 9 | 5 | 14 |
| 110 | 1 | 4 | 0 | 5 |
| 111 | 5 | 5 | 7 | 17 |
| 112 | 8 | 11 | 9 | 28 |
| 113 | 0 | 0 | 9 | 9 |
| 空檔 | 1 | 1 | 8 | 10 |

### ✅ Phase 0 已驗證：改版年份表

| Publisher | 五下 改版 | 證據 |
|:--|:--|:--|
| 翰林 | **111 → 112** | 111「宮崎駿的想像之泉」「羅伯特換腦袋」「美麗的溫哥華」「給女兒的一封信」舊版獨有；112 current hit=42 大幅躍升 |
| 康軒 | **111 → 112** | 111「大石頭」「湖濱散記」舊版；110「池上日記」「訊息轉發｜停看聽」「飯包哲學」舊版；112 current hit=64 |
| 南一 | **111 → 112** | 111「鬥牛圖」舊版獨有；112/113 全 current 命中（紅鼻子醫生/魔術師爸爸/穿越時空的味道等）|

新版納入試卷：

| Pub | 新版年份 | 試卷數 |
|:--|:--|:--|
| 翰林 | 112 | 8 |
| 康軒 | 112 | 11 |
| 南一 | 112-113 | 18 |
| **合計** | — | **37 份** |

---

## 🎯 任務目標

1. ~~**Phase 0** 五下_國語 三版本改版年份驗證~~（已完成）
2. **Phase 0.1** fork from JOB-243 scripts + 改五下黑名單
3. **Phase 1** Pilot 5 份 + 全量自動對齊（Codex 3 worker 並行）
4. **Phase 2** auto-verify + 批次處理
5. **Phase 3** D + E 報告
6. **Phase 4** 對齊報告 + Report

---

## 🚧 任務邊界

**只做**：五下_國語 L3 對齊（reuse spec v1.1）

**不做**：
- 修改 spec v1.1（除非五下有新發現）
- L2 抽取補修（JOB-241 範圍）
- 其他年級
- 修改規範文件

---

## 📜 輸入素材清單

### A. L2（109 份）

```
knowledge/3_考古題/3_L2_結構化抽取/五下/五下_國語_{翰林,康軒,南一}/*.json
```

### B. KL3 課綱

```
knowledge/1_課綱研究/國語/五下/KL3_五下_國語_研究總綱.md
```

### C. KL4（36 份）

```
knowledge/1_課綱研究/國語/五下/{翰林,康軒,南一}/KL4_五下_*_L*_單課研究紀錄.md
```

---

## 📖 執行步驟

| Phase | 內容 | 執行者 | 預估 |
|:--|:--|:--|:--:|
| 0 | 三版本改版年份驗證 **已完成** | Claude | — |
| 0.1 | scripts/jobs/JOB-244/ fork from JOB-243 | Claude | ~10 min |
| 1.0 | Pilot 5 份新版 | Codex + Claude | ~25 min |
| 1.1 | 全量 ~37 份新版 (3 worker 並行) | Codex | ~1.0 hr |
| 2 | auto-verify + 批次降級 | Claude | ~10 min |
| 3 | D + E 報告 | Python | ~5 min |
| 4 | 對齊報告 + Report | Claude 親寫 | ~30 min |
| **總計** | — | — | **~2.3 hr** |

---

## ✅ 啟動 Checklist

- [x] 五下_國語 三版本改版年份已驗證
- [ ] `scripts/jobs/JOB-244/` 已 fork from JOB-243
- [ ] 五下舊版黑名單已寫入 prompt template
- [ ] Pilot 5 份選定（新版範圍）

---

## ✅ 驗收 Checklist

### Phase 1 自動對齊
- [ ] `alignment_raw.json` 產出（schema v1.1）
- [ ] `kl3_to_l2_coverage` 含 ≥ 30/36 課
- [ ] `kl4_to_l2_examples` 含 ≥ 30/36 課碼

### Phase 2 普查
- [ ] `_verify_meta.total_files_reviewed == 納入試卷數`
- [ ] 無 `verify_status: "pending"` 殘留
- [ ] high confidence accuracy ≥ 90%

### Phase 3 反向
- [ ] `kl3_coverage_report.md` 完整
- [ ] `kl4_teaching_examples.md` 完整

### Phase 4 報告
- [ ] `五下_國語_L3對齊報告.md` 6 H2 段落齊
- [ ] `JOB-244-Report.md` 完成

---

## ✅ 成果 Checklist

- [ ] 成果表格填寫完畢
- [ ] 進度總表已同步
- [ ] `docs/README_專案發展紀錄.md` 新增 JOB-244 記錄
- [ ] 已執行 `/pj_sync` 全域知識沉澱
- [ ] JOB-244-Report.md 異動清單完整
- [ ] `node scripts/job_manager.js close JOB-244`
- [ ] Discord 結案回報送 chat_id `1487738477608177714`
- [ ] git commit（最終結案）

---

## ⏱️ 執行時間回報

| 子任務 / 階段 | 開始時間 | 結束時間 | 耗時 | 備註 |
|:--|:--|:--|:--|:--|
| Phase 0 版本驗證（JOB-243 期間預跑）| 2026-05-23 00:25 | 2026-05-23 00:30 | ~5 min | 三家 111→112 一致 |
| Phase 0.1 腳本 fork | 2026-05-23 01:15 | 2026-05-23 01:20 | ~5 min | scripts/jobs/JOB-244/ + 五下黑名單 |
| Phase 1 Pilot（5 份）| 2026-05-23 01:12 | 2026-05-23 01:24 | ~12 min | 289 題、R1=13.1%、rc01=32 |
| Phase 1 全量 | 2026-05-23 01:25 | 2026-05-23 02:19 | ~54 min | 25 份新跑、0 失敗 |
| Phase 2 普查 | 2026-05-23 02:20 | 2026-05-23 02:25 | ~5 min | pass 91.2% + pass_with_caveat 8.8%、0 reject |
| Phase 3 報告 | 2026-05-23 02:25 | 2026-05-23 02:30 | ~5 min | D + E 報告 |
| Phase 4 結案 | 2026-05-23 02:30 | 2026-05-23 02:35 | ~5 min | 對齊報告 + Report |

---

## 📌 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `docs/L3_alignment_spec_v1.md` (v1.1) | reuse |
| `jobs/JOB-243-Report.md` | 經驗教訓參考 |
| `scripts/jobs/JOB-243/*` | fork 來源 |

---

## 真實回報本次對話的模型與花費

＄作業匯總：Token 數: - | 花費: -（訂閱制無單次計費）| 使用模型: Codex CLI gpt-5.5 + Claude Opus 4.7 | 執行者: Codex + Claude
