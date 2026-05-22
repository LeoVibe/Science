*Created by Claude Code (claude-opus-4-7) at 2026-05-22 21:00*

`last_updated`: 2026-05-22 21:00
`updated_by`: Claude Code (claude-opus-4-7)

# JOB-243-AG-三下-國語-L3對齊

**`job_type`**：`research`
**`executor`**：Codex CLI gpt-5.5（Phase 1 自動對齊）+ Claude Opus 4.7（Phase 0 版本驗證 / Phase 2 普查複檢 / Phase 4 親寫）
**`parent_jobs`**：JOB-242（reuse spec v1.1）+ JOB-239（三下_國語 L2 抽取）

> ⚠️ **本 JOB 是 L3 對齊機制的「首次擴展驗證」** — JOB-242 證明機制可工程化（四下_國語），本 JOB 驗證 spec v1.1 在不同年級的可 reuse 性。
> ⚠️ **複檢採普查（census），非抽樣**。

---

## 📌 任務背景（self-contained）

### 為什麼有本 JOB

JOB-242 已完成 L3 對齊機制 Pilot（四下_國語），證明：
- spec v1.1 可工程化（4 種對齊關係 + R1-R4 + 學年版本識別）
- 教育場景採普查可行（96.5% pass / 0 reject）
- 後續 JOB-243~245（國語 G3/G5/G6）可 reuse

本 JOB 是 G3-G6 國語擴展的第一步（三下_國語）。

### 素材狀態

| 條件 | 三下_國語 |
|:--|:--|
| L2 抽取 | ✅ JOB-239 完成 114 份 |
| KL3 主檔 | ✅ `KL3_三下_國語_研究總綱.md` |
| KL4 36 份 | ✅ 翰林 12 / 康軒 12 / 南一 12 全齊 |
| chinese_codes_legal_II.json | ✅ reuse（第Ⅱ階段，三下/四下 共用）|
| spec v1.1 | ✅ JOB-242 完成，直接 reuse |

### L2 試卷分布（114 份含 5 空檔）

| 學年 | 翰林 | 康軒 | 南一 | 合計 |
|:--|:--|:--|:--|:--|
| 108 | 9 | 16 | 4 | 29 |
| 109 | 1 | 10 | 4 | 15 |
| 110 | 3 | 2 | 1 | 6 |
| 111 | 6 | 7 | 3 | 16 |
| 112 | 9 | 4 | 15 | 28 |
| 113 | 6 | 0 | 4 | 10 |
| ? | 2 | 1 | 2 | 5 |

### ⚠️ 版本識別需重驗

JOB-242 確認**四下**翰林 110→111 改版，但**三下不一定同步**。Phase 0 第一步必須驗證三下三版本各自的改版年份。

---

## 🎯 任務目標

1. **Phase 0** 三下_國語 三版本改版年份驗證（內部交叉 + 網路佐證）
2. **Phase 1** Pilot 5 份新版 + 全量自動對齊（Codex 3 worker 並行）
3. **Phase 2** auto-verify + 親檢 needs_review + 寫回 verify_status
4. **Phase 3** D + E 報告產出（reuse 腳本）
5. **Phase 4** 對齊報告 + JOB-243-Report

---

## 🚧 任務邊界

**只做**：三下_國語 1 cell L3 對齊（reuse spec v1.1）

**不做**：
- 修改 spec v1.1（除非三下有新發現需升 v1.2）
- L2 抽取補修（JOB-239 範圍）
- 其他年級
- 修改規範文件

---

## 📜 輸入素材清單（精確路徑）

### A. L2 結構化抽取（114 份）

```
knowledge/3_考古題/3_L2_結構化抽取/三下/
├── 三下_國語_翰林/*.json  (~36 份)
├── 三下_國語_康軒/*.json  (~40 份)
├── 三下_國語_南一/*.json  (~33 份)
└── 三下_國語_pilot/*.json (~5 份)
```

### B. KL3 課綱研究

```
knowledge/1_課綱研究/國語/三下/KL3_三下_國語_研究總綱.md
```

### C. KL4 單課研究紀錄（36 份）

```
knowledge/1_課綱研究/國語/三下/{翰林,康軒,南一}/KL4_三下_*_L*_單課研究紀錄.md
```

### D. 合法 codes & 規格

```
knowledge/3_考古題/3_L2_結構化抽取/_meta/chinese_codes_legal_II.json
docs/L3_alignment_spec_v1.md (v1.1)
```

---

## 📖 執行步驟

| Phase | 內容 | 執行者 | 預估 |
|:--|:--|:--|:--:|
| 0 | 三版本改版年份驗證 + 黑名單清單建立 | Claude | ~30 min |
| 0.1 | scripts/jobs/JOB-243/ fork from JOB-242 | Claude | ~5 min |
| 1.0 | Pilot 5 份新版 + Claude 親檢 | Codex + Claude | ~30 min |
| 1.1 | 全量 ~50-60 份新版 (3 worker 並行) | Codex | ~1.5 hr |
| 2 | auto-verify --all + 親檢 needs_review | Claude | ~1 hr |
| 3 | D KL3 + E KL4 報告 | Python | ~5 min |
| 4 | 對齊報告 + Report | Claude 親寫 | ~30 min |
| **總計** | — | — | **~4-5 hr** |

---

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] 三下_國語 三版本改版年份已驗證（Phase 0 產出）
- [ ] `scripts/jobs/JOB-243/` 已 fork from JOB-242
- [ ] 三下舊版黑名單已寫入 prompt template（若有改版）
- [ ] Pilot 5 份選定（新版範圍，covers 三 publisher）
- [ ] watchdog.sh 啟用
- [ ] 已確認執行模型：Codex CLI gpt-5.5 + Claude Opus 4.7
- [ ] 預算：ChatGPT 訂閱（無單次計費）

---

## ✅ 驗收 Checklist (Acceptance)

### Phase 0 規格
- [ ] 三下三版本改版年份驗證完成（含內部 + 網路證據）
- [ ] spec v1.1 §3.5 改版年份表已 update（含三下）

### Phase 1 自動對齊
- [ ] `alignment_raw.json` 產出（schema v1.1）
- [ ] `kl3_to_l2_coverage` 含 ≥ 30/36 課
- [ ] `kl4_to_l2_examples` 含 ≥ 30/36 課碼

### Phase 2 普查複檢
- [ ] `_verify_meta.total_files_reviewed == 納入試卷數`（普查）
- [ ] 無 `verify_status: "pending"` 殘留
- [ ] high confidence accuracy ≥ 90%

### Phase 3 反向產出
- [ ] `kl3_coverage_report.md` 完整
- [ ] `kl4_teaching_examples.md` 完整

### Phase 4 報告
- [ ] `三下_國語_L3對齊報告.md` 6 H2 段落齊
- [ ] `JOB-243-Report.md` 完成

---

## ✅ 成果 Checklist (Deliverables)

- [ ] 成果表格填寫完畢
- [ ] 進度總表已同步
- [ ] `docs/README_專案發展紀錄.md` 新增 JOB-243 記錄
- [ ] 已執行 `/pj_sync`
- [ ] JOB-243-Report.md 異動清單完整
- [ ] `node scripts/job_manager.js close JOB-243`
- [ ] Discord 結案回報送 chat_id `1487738477608177714`
- [ ] git commit（最終結案）

---

## ⏱️ 執行時間回報

| 子任務 / 階段 | 開始時間 | 結束時間 | 耗時 | 備註 |
|:--|:--|:--|:--|:--|
| Phase 0 版本驗證 | 2026-05-22 21:00 | 2026-05-22 21:30 | ~30 min | 翰林 111→112 / 康軒 110→111 / 南一 110→111 |
| Phase 0.1 腳本 fork | 2026-05-22 21:30 | 2026-05-22 22:00 | ~30 min | scripts/jobs/JOB-243/ 全套就緒 |
| Phase 1 Pilot | 2026-05-22 22:27 | 2026-05-22 22:39 | ~13 min | 5/5 通過、R1=22.1%、親檢 10/10 |
| Phase 1 全量 r1 | 2026-05-22 22:41 | 2026-05-22 23:16 | ~35 min | 18/45 完成後 reboot 暫停 |
| Phase 1 全量 r2 | 2026-05-22 23:41 | 2026-05-23 00:58 | ~77 min | 續跑完 27 份，45/45 全部完成 |
| Phase 2 普查 | 2026-05-23 00:58 | 2026-05-23 01:00 | ~2 min | pass 87.7% + pass_with_caveat 12.3%、0 reject |
| Phase 3 報告 | 2026-05-23 01:00 | 2026-05-23 01:02 | ~2 min | D KL3 + E KL4 報告產出 |
| Phase 4 結案 | 2026-05-23 01:02 | 2026-05-23 01:10 | ~8 min | 對齊報告 + Report |

---

## 📌 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `docs/L3_alignment_spec_v1.md` (v1.1) | reuse |
| `jobs/JOB-242-Report.md` | 經驗教訓參考 |
| `scripts/jobs/JOB-242/*` | fork 來源 |
| `docs/archive/翰林舊版四下國語_課程對應表.md` | 改版範例 |

---

## 真實回報本次對話的模型與花費

＄作業匯總：Token 數: - | 花費: -（訂閱制無單次計費）| 使用模型: Codex CLI gpt-5.5 + Claude Opus 4.7 | 執行者: Codex + Claude
