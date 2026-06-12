*Created by Claude Code (claude-sonnet-4-6) at 2026-06-12*

`last_updated`: 2026-06-12
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-247-AG-三下-自然-KL4研究+L3對齊

**`job_type`**：`research`
**`executor`**：Codex CLI gpt-5.5（KL4 研究 + L3 dispatch）+ Claude Code claude-sonnet-4-6（驗收 + Phase 4）
**`parent_jobs`**：JOB-246（四下_自然 L3 對齊 spec v2.0 Pilot）
**`upstream_spec`**：`docs/superpowers/specs/2026-05-23-natural-science-l3-alignment-design.md`（v2.0）

> ⚠️ 本 JOB 新增 Phase 0-KL4：三下_自然 無 KL4 子目錄，需先補做 24 份 KL4 文件，再執行 L3 對齊。

---

## 📌 任務背景

JOB-246 完成四下_自然 L3 對齊 Pilot，驗證 spec v2.0 可行。
三下_自然 L2 已完整抽取（117 份 / 5,536 題），但缺 KL4 研究文件。
本 JOB 補做 KL4 + 執行 L3 對齊，完成三下_自然全套交付物。

### 素材狀態

| 條件 | 狀態 |
|:--|:--|
| L2 抽取 | ✅ 117 份（翰林 13 / 康軒 58 / 南一 46），5,536 題 |
| KL3 | ✅ `knowledge/1_課綱研究/自然/KL3_三下_自然_研究總綱.md` |
| KL4 | ❌ 尚無 → Phase 0-KL4 新建 24 份 |
| spec v2.0 | ✅ reuse JOB-246 |

---

## 🎯 任務目標

1. 產出三下_自然三版本 KL4 研究文件（各 4 課 × 2 檔案 = 24 份）
2. 依 spec v2.0 三審制完成 117 份試卷 L3 對齊
3. 產出 alignment_raw.json + 三報告 + 三下_自然_L3對齊報告.md

---

## 🚧 任務邊界

**只做**：
- 三下_自然 KL4 文件（三版本各 4 課）
- 三下_自然 L3 對齊（117 份）

**不做**：
- 五下/六下自然（後續另開 JOB）
- 修改 spec v2.0 或 KL3
- 任何題庫 JSON 修改

---

## 📖 執行步驟

### Phase 0-KL4：三下_自然 KL4 研究（Codex 產出）

**三下_自然 單元對照表**（依 KL3 §二）：

| 主題 | 翰林 | 康軒 | 南一 |
|:--|:--|:--|:--|
| 植物種植與生長 | L1 | L1 | L1 |
| 水與物質變化 | L2 | L2 | L2 |
| 天氣觀測與解析 | L3 | L4 | L4 |
| 動物的構造與適應 | L4 | L3 | L3 |

**產出路徑**：`knowledge/1_課綱研究/自然/三下/{翰林,康軒,南一}/`
**每課 2 檔**：`KL4_三下_{版本}_L{N}_{課名}_單課研究紀錄.md` + `_考古題與討論.md`
**共 24 份**

**Codex prompt 範本**：參考 `knowledge/1_課綱研究/自然/四下/翰林/KL4_四下_翰林_L1_生活中的力_單課研究紀錄.md` 格式

**每份必含**：
- §一 課綱連結與學習總目標（對應 codes）
- §二 核心知識點地圖（含守衛點表格）
- §三 實驗與探究活動
- §四 迷思分析（從 KL3 §二 守衛點擴充）

### Phase 0-Analysis：L2 codes_candidate 預覽

```bash
cd /path/to/eidosProject
python3 scripts/jobs/JOB-246/A0_phase0_l2_analysis.py
# 修改 BASE='knowledge/3_考古題/3_L2_結構化抽取/三下' SUBJECT='自然'
```

### Phase 1a：Python L2 → codes 對齊

```bash
python3 scripts/jobs/JOB-247/A1a_phase1a_l2_align.py
```
（仿 JOB-246 A1a，更新 UNIT_THEMES 為三下四主題）

### Phase 1b：Codex 全量 dispatch（117 份）

```bash
bash scripts/jobs/JOB-247/A6b_codex_dispatch_serial.sh
```
（仿 JOB-246 A6b，TARGET = 117 份）

### Phase 2-4：verify + 三報告 + merge + 對齊報告

```bash
python3 scripts/jobs/JOB-246/A2_auto_verify.py   # 改路徑為三下
python3 scripts/jobs/JOB-246/A3_codes_coverage_report.py
python3 scripts/jobs/JOB-246/A4_kl4_teaching_examples.py
python3 scripts/jobs/JOB-246/A5_misconception_diagnosis.py
python3 scripts/jobs/JOB-246/A6_merge.py
```

---

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `docs/superpowers/specs/2026-05-23-natural-science-l3-alignment-design.md` | spec v2.0 |
| `knowledge/1_課綱研究/自然/KL3_三下_自然_研究總綱.md` | 三下單元主題 + 迷思守衛點 |
| `knowledge/1_課綱研究/自然/四下/翰林/KL4_四下_翰林_L1_生活中的力_單課研究紀錄.md` | KL4 格式範本 |
| `scripts/jobs/JOB-246/` | 全套 Python 腳本（reuse） |
| `jobs/JOB-246-Report.md` | JOB-246 技術筆記（注意 3-level QID / stream-json 修正）|

---

## ✅ 啟動 Checklist (Pre-Flight)

- [x] 已讀取 KL3_三下_自然_研究總綱.md
- [x] 已確認 L2 素材：117 份，5,536 題
- [x] KL4 尚無，Phase 0-KL4 新建
- [x] spec v2.0 已 commit（JOB-246）
- [x] 已確認執行模型：Codex CLI gpt-5.5（KL4 + dispatch）+ claude-sonnet-4-6（驗收）
- [x] 已確認使用金鑰：ChatGPT Plus 訂閱（Codex）+ Claude Pro 訂閱（Claude Code）

## ✅ 驗收 Checklist (Acceptance)

### KL4 研究

- [x] 24 份 KL4 文件產出（三版本各 4 課 × 2 檔）── find 實測 24 份
- [x] 每份含 §二 核心知識點地圖 + 守衛點表格 ── 抽樣確認
- [x] 課名與 KL3 §二 單元主題一致 ── 四大主題對應

### L3 對齊

- [x] alignment_raw.json 產出（schema v2.0，117 份，0 pending）── pending=0
- [x] N1 比例 ≥ 60%（佐證：95.5%）
- [x] kl4_supported 比例 ≥ 30%（佐證：67.3%）
- [x] 三報告完整（codes 66 種 / kl4 3728 題 / misconception 437 條）
- [x] 三下_自然_L3對齊報告.md（6 H2 段落）── 已產出

## ✅ 成果 Checklist (Deliverables)

- [x] `knowledge/1_課綱研究/自然/三下/` KL4 24 份
- [x] `knowledge/3_考古題/3_L2_結構化抽取/三下/alignment_science/` 全套產出
- [x] `jobs/JOB-247-Report.md`
- [ ] 進度總表已同步（`docs/進度彙整_題庫研發與產出.md`）
- [x] 已執行 `/pj_sync`
- [ ] `node scripts/job_manager.js close JOB-247`
- [ ] Discord 結案回報

## 真實回報本次對話的模型與花費

＄作業匯總：Token數:- | 花費: 訂閱制無單次計費 | 使用模型: Codex gpt-5.5 + claude-sonnet-4-6 | 執行者: AG
