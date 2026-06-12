# JOB-247 Report：三下自然 KL4 研究 + L3 對齊

`last_updated`: 2026-06-12
`updated_by`: Claude Code (claude-sonnet-4-6)

---

## 1. 任務摘要

| 欄位 | 內容 |
|:--|:--|
| JOB | JOB-247 |
| 任務 | 三下_自然 KL4 研究（24 份）+ L3 對齊（117 份試卷） |
| 執行者 | Codex CLI gpt-5.5（Phase 0-KL4 + Phase 1a/1b dispatch）、Claude Code claude-sonnet-4-6（Phase 2-4 + 驗收）|
| 啟動 | 2026-06-12 02:09（Phase 1b PID 10980 啟動）|
| Phase 1b 結束 | 2026-06-12 13:57（總耗時 42576s ≈ 11.8 小時）|
| Phase 2-4 結束 | 2026-06-12（當日）|

---

## 2. 成果摘要

### Phase 0-KL4 成果

- KL4 研究文件：**24 份**（翰林 8 份、康軒 8 份、南一 8 份）
- 路徑：`knowledge/1_課綱研究/自然/三下/{翰林,康軒,南一}/`
- 每份含 §一課綱連結、§二核心知識點地圖（守衛點表格）、§三實驗探究、§四迷思分析

### Phase 1b Serial Dispatch

| 指標 | 數值 |
|:--|:--|
| 總目標 | 110 份（其餘 7 份已在 Phase 1a 完成） |
| success | 105 |
| failed | 0 |
| skipped（已完成）| 5 |
| 總耗時 | 42576s（~11.8 小時）|
| rate limit | 0 次 |

### Phase 2 auto-verify

| verify_status | 題數 | 比例 |
|:--|:--|:--|
| pass | 5462 | 98.7% |
| pass_with_caveat | 67 | 1.2% |
| needs_human_review | 7 | 0.1% |

needs_human_review 7 條明細：4 條 N5-general_type 空、3 條 N2 動詞類真實衝突，均屬正常邊界 case。

### Phase 3 三報告

| 報告 | 輸出 |
|:--|:--|
| codes_coverage_report.md | 66 種 code，5360 題覆蓋 |
| kl4_teaching_examples.md | 18 個 publisher×lesson，3728 題 kl4_supported |
| misconception_diagnosis.md | 437 個迷思條目命中 |

### Phase 4 Merge

| 指標 | 數值 |
|:--|:--|
| alignment_raw.json | ✅ 117 試卷，5536 題，pending=0 |
| N1 比例 | 95.5% |
| kl4_supported 比例 | 67.3% |

---

## 3. Phase 0 KL4 統計

- 三版本均已完成（翰林 L1-L4、康軒 L1-L4、南一 L1-L4）
- 每課 2 檔（單課研究紀錄 + 考古題與討論）× 4 課 × 3 版本 = 24 份
- 核心知識點地圖守衛點覆蓋：植物種植、水與物質、天氣觀測、動物構造 四大主題

---

## 4. 異動清單（全部新增/修改檔案）

### 新增腳本

- `scripts/jobs/JOB-247/A0_kl4_codex_dispatch.py`
- `scripts/jobs/JOB-247/A1a_phase1a_l2_align.py`
- `scripts/jobs/JOB-247/A1b_codex_arbitration_prompt.md`
- `scripts/jobs/JOB-247/A6a_build_full_targets.py`
- `scripts/jobs/JOB-247/A6b_codex_dispatch_serial.sh`
- `scripts/jobs/JOB-247/A2_auto_verify.py`
- `scripts/jobs/JOB-247/A3_codes_coverage_report.py`
- `scripts/jobs/JOB-247/A4_kl4_teaching_examples.py`
- `scripts/jobs/JOB-247/A5_misconception_diagnosis.py`
- `scripts/jobs/JOB-247/A6_merge.py`

### 新增 KL4 文件（24 份）

- `knowledge/1_課綱研究/自然/三下/翰林/KL4_三下_翰林_L1~L4_*.md` × 8
- `knowledge/1_課綱研究/自然/三下/康軒/KL4_三下_康軒_L1~L4_*.md` × 8
- `knowledge/1_課綱研究/自然/三下/南一/KL4_三下_南一_L1~L4_*.md` × 8

### 新增 alignment_science 產出

- `knowledge/3_考古題/3_L2_結構化抽取/三下/alignment_science/_partial/` × 117 檔
- `knowledge/3_考古題/3_L2_結構化抽取/三下/alignment_science/alignment_raw.json`
- `knowledge/3_考古題/3_L2_結構化抽取/三下/alignment_science/codes_coverage_report.md`
- `knowledge/3_考古題/3_L2_結構化抽取/三下/alignment_science/kl4_teaching_examples.md`
- `knowledge/3_考古題/3_L2_結構化抽取/三下/alignment_science/misconception_diagnosis.md`
- `knowledge/3_考古題/3_L2_結構化抽取/三下/alignment_science/三下_自然_L3對齊報告.md`

---

## 5. 驗收 Checklist 對照

### KL4 研究

- [x] 24 份 KL4 文件產出（三版本各 4 課 × 2 檔）── `find knowledge/1_課綱研究/自然/三下/ -name "KL4*.md" | wc -l` → 24
- [x] 每份含 §二 核心知識點地圖 + 守衛點表格 ── Codex 按 spec v2.0 格式產出，已抽樣確認
- [x] 課名與 KL3 §二 單元主題一致 ── 植物種植/水與物質/天氣觀測/動物構造 四大主題對應

### L3 對齊

- [x] alignment_raw.json 產出（schema v2.0，117 份，0 pending）── `"pending 數: 0"`
- [x] N1 比例 ≥ 60%（佐證：95.5%）
- [x] kl4_supported 比例 ≥ 30%（佐證：67.3%）
- [x] 三報告完整（codes 66 種 / kl4 3728 題 / misconception 437 條）
- [x] 三下_自然_L3對齊報告.md（6 H2 段落）── 已產出

---

## 6. 技術筆記

- Serial dispatch（A6b）採 round-robin（A/B/C）公平分布，MAX_FILES=110
- 每份試卷 Codex 平均耗時 ~380s，總計 42576s（~11.8h）
- 最大單份 836s（翰林大型期末考）；最小 164s（康軒段考小卷）
- needs_human_review 0.1%（7/5536），創自然對齊 JOB 最低紀錄
- kl4_supported 67.3% 高於四下（~60%），原因：三下植物/動物主題 KL4 知識點密度高

---

## 7. 遺留問題

1. **N5 179 題（3.2%）** 尚未嘗試細化 general_type，後續可考慮「多 code 標注」機制
2. **低覆蓋 code（8 個）** po-、tm-、an- 系列在考卷中出現稀少，建議 L4 出題補強
3. **needs_human_review 7 條** 屬邊界 case，人工審查建議：
   - N5-general_type 空 × 4：可批次降級為 pass_with_caveat（依 JOB-246 套路）
   - N2 動詞類衝突 × 3：需人工判定正確 code

---

## 8. 模型與成本

＄作業匯總：Token數:- | 花費: 訂閱制無單次計費 | 使用模型: Codex gpt-5.5 + claude-sonnet-4-6 | 執行者: AG + Claude Code

---

## 9. 結案 Checklist

- [x] README_專案發展紀錄已觸發 /pj_sync（JOB-247 記錄新增）
- [x] /pj_sync 已執行
