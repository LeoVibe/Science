*Created by Claude Code (claude-opus-4-7) at 2026-05-23*

`last_updated`: 2026-05-23
`updated_by`: Claude Opus 4.7（Phase 4 親寫）

# JOB-245-Report：六下_國語 L3 對齊（G3-G6 國語 L3 對齊全套完成）

---

## 一、任務摘要

| 項目 | 數值 |
|:--|:--|
| 執行 JOB | JOB-245-AG-六下-國語-L3對齊 |
| job_type | `research` |
| 執行者 | Codex CLI gpt-5.5（Phase 1）+ Claude Opus 4.7（Phase 0/2/4） |
| 資料範圍 | 六下_國語，翰林/康軒/南一 |
| 最終納入對齊 | **51 份試卷 / 2,962 題**（含 unknown 359；current 範圍 2,603 題） |
| 執行期間 | 2026-05-23 02:35 ~ 04:55 |
| 總耗時 | ~2.3 hr |

JOB-245 為 G3-G6 國語 L3 對齊**最後一個 cell**：
- 完成 G3-G6 國語全套 L3 對齊（共 180 試卷 / 8,439 題）
- 發現六下試卷大量使用古文/外部選文（教育現場真實樣貌）
- version_match=unknown 機制正確處理「不在 KL4 33 課內」的素材

---

## 二、成果摘要

| 指標 | 數值 |
|:--|:--|
| 試卷數 | **51**（翰林 9 + 康軒 16 + 南一 26）|
| 題目數（含 unknown）| 2,962 |
| 題目數（current 範圍）| 2,603 |
| 對齊到 KL3 課次 | **200 題（7.7%）** |
| unlinked_general | 2,403（92.3%）|
| R1 顯式引用 | 166 |
| R2 課名關鍵字 | 10 |
| R3 通用題型 | 2,403 |
| R4 跨課 | 66 |
| rc01_evidence 命中 | **184**（92.0% of linked — 三個 cell 最高）|
| KL3 覆蓋 | **15/33 課**（45.5%）|

### verify_status 分布

| status | 題數 | 比例 |
|:--|:--|:--|
| pass | 2,525 | 85.2% |
| pass_with_caveat | 437 | 14.8% |
| reject | **0** | 0% |
| needs_human_review | **0** | 0% |

---

## 三、Phase 0 六下版本驗證

| Publisher | 改版分界 | 證據 |
|:--|:--|:--|
| 翰林 | **111 → 112** | 111「上書救父——緹縈」舊版獨有；112+ current 命中 |
| 康軒 | **無改版** | 108-112 全 current 命中 |
| 南一 | **108 → 109** | 108「漁歌子」舊版獨有；109+ current 命中 |

**三家改版年份各自不同**（不同於三下/四下/五下任一模式）。

---

## 四、六下特殊發現

**六下試卷大量使用外部選文**（單一試卷常多 3-5 篇）：
- 古典詩詞：過故人莊、清平樂村居、春、漁歌子
- 古文選讀：小時了了、楊氏之子
- 外國文學：科學怪人、巨人的階梯、未走之路（Robert Frost）
- 自編：把愛傳下去、愛搗亂的動物、大自然的規則

codex 對 359 條題目正確標 `version_match=unknown` + `verify_note: 課名 XXX 不在 KL4 33 課內，疑為外部選文`，**未誤對齊到 KL4** — 機制正確處理。

KL3 覆蓋 15/33 課（45.5%）— 三個 cell 最低，但這是六下試卷的真實樣貌（外部選文比例最高），不是機制失敗。

---

## 五、異動清單

| 檔案路徑 | 異動類型 | 說明 |
|:--|:--|:--|
| `scripts/jobs/JOB-245/A1_align_prompt_template.md` | 新增 | 六下黑名單（翰林「上書救父——緹縈」、南一「漁歌子」、康軒無）|
| `scripts/jobs/JOB-245/A2_pilot_dispatch.sh` | 新增 | Pilot 5 份（翰林無 113，調整為 翰林 112 ×2 + 康軒 112 + 南一 112+113）|
| `scripts/jobs/JOB-245/A3_full_dispatch.sh` | 新增 | 全量 3 worker |
| `scripts/jobs/JOB-245/A4_merge.py` | 新增 | merge |
| `scripts/jobs/JOB-245/B/C/D/E_*.py` | 新增 | 普查 / 報告 |
| `scripts/jobs/JOB-245/watchdog.sh` | 新增 | 監控 |
| `scripts/jobs/JOB-245/_full_targets_*.json` | 新增 | 51 份（翰林 9 + 康軒 16 + 南一 26）|
| `scripts/jobs/JOB-245/_empty_l2_files.json` | 新增 | 10 空檔記錄 |
| `knowledge/3_考古題/3_L2_結構化抽取/六下/alignment/_partial/*.json` | 新增 | 51 partial |
| `knowledge/3_考古題/3_L2_結構化抽取/六下/alignment/alignment_raw.json` | 新增 | 合併輸出 |
| `knowledge/3_考古題/3_L2_結構化抽取/六下/alignment/kl3_coverage_report.md` | 新增 | 15 課 |
| `knowledge/3_考古題/3_L2_結構化抽取/六下/alignment/kl4_teaching_examples.md` | 新增 | 15 課碼 |
| `knowledge/3_考古題/3_L2_結構化抽取/六下/alignment/六下_國語_L3對齊報告.md` | 新增 | Phase 4 對齊報告 |
| `jobs/JOB-245-AG-六下-國語-L3對齊.md` | 新增 | 派工單 |
| `jobs/JOB-245-Report.md` | 新增 | 本檔 |

---

## 六、驗收 Checklist 對照

### Phase 1
- [x] alignment_raw.json 產出（2,603 題納入對齊）
- [x] kl3_to_l2_coverage — 15/33（試卷外部選文比例最高的 cell）
- [x] kl4_to_l2_examples — 15

### Phase 2 普查
- [x] 普查 51 份（全部試卷）
- [x] 0 reject / 0 pending
- [x] auto-verify 邊界 case 已批次處理

### Phase 3-4
- [x] D KL3 覆蓋報告 / E KL4 教學示例 / 六下對齊報告 / JOB-245-Report

### 成果 Checklist
- [x] 進度總表同步
- [x] README_專案發展紀錄新增
- [x] 已執行 /pj_sync
- [x] 異動清單完整
- [ ] `node scripts/job_manager.js close JOB-245` — 待執行
- [ ] Discord 結案回報 — 待執行
- [ ] git commit — 待執行

---

## 七、G3-G6 國語 L3 對齊全套統計（JOB-242/243/244/245）

| Cell | JOB | 試卷 | 題目 | KL3 覆蓋 | pass% | pass_with_caveat% |
|:--|:--|:--|:--|:--|:--|:--|
| 四下 | 242 | 54 | 2,360 | 35/36 | 96.5% | 3.5% |
| 三下 | 243 | 45 | 1,794 | 36/39 | 87.7% | 12.3% |
| 五下 | 244 | 30 | 1,682 | 36/36 | 91.2% | 8.8% |
| 六下 | 245 | 51 | 2,603 | 15/33 | 85.2% | 14.8% |
| **合計** | — | **180** | **8,439** | **122/144** | **平均 90.2%** | **平均 9.8%** |

**🎯 里程碑**：G3-G6 國語 L3 對齊全套完成，spec v1.1 機制經 180 試卷 / 8,439 題驗證跨年級可規模化。

---

## 八、遺留問題（範圍外）

| 議題 | 應對 |
|:--|:--|
| 自然/社會 cells 機制設計（無 RC-01）| 仍待 brainstorming（spec v2.0 樞紐：單元主題 / 能力指標）|
| 六下翰林 L1-L9/L11 命題趨勢分析 | 非阻塞 |
| spec v1.2：外部選文白名單 + lesson 字段規範 | 待評估 |

---

## 九、模型與成本

| 階段 | 模型 | 成本 |
|:--|:--|:--|
| Phase 0/2/4 | Claude Opus 4.7 | Claude Pro 訂閱 |
| Phase 1 自動對齊（Pilot 5 + 全量 46 = 51 次 codex）| Codex CLI gpt-5.5 | ChatGPT Plus 訂閱 |
| Phase 3 報告 | Python 腳本 | — |

＄作業匯總：Token 數: - | 花費: -（訂閱制無單次計費）| 使用模型: Codex CLI gpt-5.5 + Claude Opus 4.7 | 執行者: Codex + Claude
