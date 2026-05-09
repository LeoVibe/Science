# 📋 Eidos 專案發展紀錄

`last_updated`: 2026-05-04
`updated_by`: Claude Code (claude-opus-4-7)（pj_sync：JOB-226 結案——四/五/六下完成，全 60 combo 終態 45 done + 15 partial + 0 pending，累計 2,117 份；canonical template v3.1 升級 + Phase 5c 字眼修補新增）

---

## 一、更版說明 (Release Notes)

> ⚠️ 此區由人工進行最終文字修飾，Agent 不主動修改。

### v1.5 (2026-04-18)
- 小三下 國語、自然、社會題庫更新，用500題以上考古題，重新校正題幹與選項之適配度，確認題意與學習意涵
- 新增小四下 自然、社會題庫，重塑進行前期學習路徑定義，完成900題以上，全新題庫，並完成雙盲測試

### v1.4 (2026-03-24)
- 全站規範文件重構 v6：建立 KL/RM/QL/CQI-P/CQI-V 新體系
- 文件從 11 份精簡至 6 份
- Skill 系統重整為 ei_/pj_ 雙分類
- 三段式 Checklist 鐵則寫入全域規範

### v1.3 (2026-03-22)
- G6S2 全科題庫補齊與品質精修
- 前台導覽邏輯升級
- Cloudflare Pages 部署穩定化

---

## 二、近期重大變動彙整 (Job Changelog)

> 此區由 `/pj_sync` 觸發，掃描 `jobs/` 派工單歸納近期改動。

### 2026-05-09
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-228 | **三下社會考古題 L2 結構化抽取 109 份完成（codex 全自動序列跑 14h 43min）**：延續 JOB-226 雙源 MD 整合產物，將三下_社會 三版本（翰林 30 / 康軒 57 / 南一 22）整合 MD 由 codex 抽取為 schema v1.0 結構化 JSON，每題含 `codes_candidate[]`（從 35 條 108 課綱第 Ⅱ 階段合法編碼選 1-3 條）。Phase 5 + 黃金 2 + Pilot 5 共 **116 份 / 6530 題 / 10048 codes / 全量驗證零違規**（A_illegal=0 / B_wrong_stage=0 / C_duplicate=0）。技術里程碑：(a) **長時批次五元件骨架運作良好** — progress.json + dispatch.sh（含 25 min watchdog + Layer 1 驗證）+ dashboard.py + continuous_loop.sh + ScheduleWakeup/Discord 60min 自動回報；(b) **codex CLI 訂閱模式 model 限制經驗** — 不能硬指定 `-m gpt-5/gpt-4.1/gpt-5-codex`（API-only model 在 ChatGPT 帳號被擋），需用預設綁定 model（gpt-5.5），已存 memory；(c) **dispatch.sh resume 預設 bug 修復** — 改為自動 resume + `--fresh` 旗標明示重置，避免覆寫既有 progress；(d) **三版本 _L2_summary.md + 全科目整合 MD** — 翰林（編碼覆蓋 29/35）/ 康軒（34/35 最廣）/ 南一（30/35），認知層次三版本皆健康（記憶 21-26%、高層認知 46-47%）；(e) **spot check 13 次中 3 個 false positive** — codex spot check「≥5 字題幹片段」標準偏嚴，與 rank 6 PASS 的「實地觀察」（4 字）邊界值不一致，Claude meta-review 確認非真品質問題（建議下次調整 ≥3 字）。產出：109 份 JSON + `_validation_report.json` + 三份 `_L2_summary.md` + `三下_社會_L2_整合.md` + `_L2_quality_report.json`。見 `jobs/JOB-228-Report.md` | 🟢 DONE |

### 2026-05-08
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-226 | **雙源 MD 整合全量收工（60 combo / 2,117 份 / 4 學期）**：延續 JOB-225 pilot 與 Phase A 三下 15/15 完成，本次以 `JOB226_master_auto.sh` + `JOB226_combo_full_pipeline.sh` 雙層自動骨架完成四/五/六下 45 combo 共 1,572 份整合，全 60 combo 累計 **2,117 份**（覆蓋率 98.65%）。終態 **45 done + 15 partial + 0 pending**。技術里程碑：(a) **canonical template v3 → v3.1** — 執行中發現 F8 失敗模式（單源檔誤用「兩源」字眼，21/23 份命中），緊急升級 §7.1 為 state-aware 表格（dual / codex_only / claude_only 三態各自措辭）+ §7.2 來源追溯主詞規則 + 加單源檔禁用「兩源」鐵則；(b) **Phase 5c 規則式字眼修補** — 寫 `JOB226_fix_single_source_phrasing.py` 將舊版產出批次救回，修補成本從 ~80K token/份 變 0 token/份；(c) **Phase 6 retry 機制** — r1 FAIL 自動跑 Phase 5c + r2，仍 FAIL 標 partial 不無限重試；(d) **40.5 小時 master_auto 自動跑** — 2026-05-05 03:24 啟動 → 2026-05-06 19:53 EXIT，PARALLEL=4 兩 combo 並行 + watchdog 1500s。Partial 失敗模式分類：F-Phase5+6 雙 fail 5 個、F-Phase6 only 5 個、F-Phase5 only 4 個、F-dispatch 漏 1 個。遺留：15 partial 由 JOB-227（後續開單）依本 Report §技術筆記 8 提供的優先序處理。見 `jobs/JOB-226-Report.md` | 🟢 DONE |

### 2026-05-04
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-227 | **Raw MD 學期分類稽核與修補（三下範圍）**：JOB-226 三下_英語_康軒 phase6 抽樣發現「上學期試卷被分到下學期 combo」（codex_only 樣本 frontmatter 標三下、正文寫 110 學年度上）。寫稽核腳本 `JOB227_audit_raw_semester.py` 掃 1054 份三下 raw MD（claude+codex），找出 **42 份 misclassified**（英語_何嘉仁 26、英語_康軒 15、國語_康軒 1）。實際移檔 41 raw + 28 整合版到 `_misclassified/三下_誤分類_上學期/` 備存區（國語_康軒 1 份檔名標下學期但內容引用「第一學期」屬 false positive 排除）。受影響的 done combo 重 finalize + 重抽 phase6 雙 PASS（英語_何嘉仁 48→34 PASS、英語_康軒 39→25 PASS partial→done）。**三下達 15/15 done，partial 歸零**。技術發現：phase6 隨機抽樣對「分類錯誤」偵測能力有限（英語_何嘉仁原 phase6 PASS 但內含 14 份上學期），需獨立稽核機制。遺留：四/五/六下 raw（claude 529 + codex 1334）尚未稽核、ambiguous 25 份 + unknown 89 份待人工抽查、raw 抓取 pipeline 根因待新 JOB 處理。見 `jobs/JOB-227-Report.md` | 🟢 DONE |
| JOB-226（Phase A） | **三下雙源 MD 整合全跑（15 combo / 571 份）**：延續 JOB-225 pilot，將三下 15 個 combo（社會 3 / 自然 3 / 國語 3 / 數學 3 / 英語 3 含何嘉仁）共 571 份 logical exam 整合完成。技術里程碑：(a) **Strategy B canonical template v3** — `_canonical_prompts/_integration_prompt.md` 內嵌 gold reference + 「題幹一致鐵則」（codex_only 來源不得改寫題幹），對應 `_methodology_record.md` §8.10 補記；(b) **PARALLEL=4 兩 combo 並行模式** — 比 PARALLEL=3 單 combo 快 1.56×（249 份 / 5 hours = 1.21 分/份）；(c) **完整流水線** — pair → dispatcher v2 → finalize（Phase 5 round 1/2 + Phase 5b codex 修補）→ Phase 4 _index.json → Phase 6 codex 抽樣（強制 codex_only 樣本）→ progress 標 done；(d) **17 份 codex_only 重整合修補** — 修 v3 規則前已產生的 5 個 combo 之 codex_only 樣本題幹改寫 bug，全部 rc=0 重寫 + 5/5 樣本 PASS。Phase A 為 JOB-226 的三下範圍，後接 Phase B 完成四/五/六下（見 2026-05-08 條目）| 🟢 三下 PHASE 完成 |

### 2026-05-01
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-224 | **三下社會南一雙來源 MD 整合 pilot（Codex 路徑 + 比較分析 + v1 spec）**：使用 `scripts/JOB224_integrate_pilot.py` 四階段流水線（配對／LLM 整合／機械回填／自動驗收）並行產出兩種風格的整合版（`2_MD淬鍊文字_整合版_claude/` 與 `2_MD淬鍊文字_整合版_Codex/`），透過 6 份高分歧樣本人工判讀 + 4 維度比較分析（完整度／可讀性／機讀一致性／幻覺風險）驗證雙來源整合可行性。整合方法論固化為 v1 spec（`README_雙來源MD轉檔與整合規格.md`），後續被 JOB-225 萃取的 v2 spec（`README_雙來源MD整合作業準則.md`）取代。整合產物與 v1 spec 於 2026-05-01 14:25 由使用者清理（pilot 收斂）。執行者：Codex (GPT-5) 整合腳本與產物，Claude Code (claude-opus-4-7) PM 規劃 + 比較分析 + Report 代撰。比較分析原檔 `JOB-224-整合版Claude_vs_Codex_比較分析.md` 已整併進 Report §五。見 `jobs/JOB-224-Report.md` | 🟢 DONE |
| JOB-225 | **三下社會南一考古題雙源 MD 整合（pilot）**：將 `2_MD淬鍊文字_Claude/` 與 `2_MD淬鍊文字_Codex/` 兩源的三下社會南一 24 份 logical exam group 整合為單一份高品質 MD，產出於新目錄 `2_MD淬鍊文字_整合版_claude/三下/三下_社會_南一/`。整合策略：**Claude PM 規劃 + 24 個 subagent（claude-opus-4-7）平行 dispatch**，每個 subagent 獨立 context 處理 1 份檔案，主對話僅做編排與驗收。整合方法處理三類兩源缺陷：(a) Claude docling 的 OCR 字符斷裂（「哪 - 個」→「哪一個」、「之-」→「之一」，多份各 30-60 處）、(b) Claude 的 alias 重複輸出（同 sha256 不同檔名各列一次）、(c) Codex pdfplumber 的雙欄交錯題號錯亂。產出統一 6 區段格式（整合摘要/主題命中分析/試卷/答案/來源追溯/整合判斷），24/24 通過自動驗證（6 區段齊、frontmatter 必填欄位齊、OCR 紅旗 0 hits、無重複試卷區塊）。`_index.json` 含 quality_flag 分布統計：paper_full 24/24、ocr_corrected 23/24、dual_source_merged 21/24、answer_full 12/24、answer_empty 12/24、claude_only 3/24。Subagent token 加總 1,274,562（訂閱額度，無台幣計費）。遺留問題：12 份答案 PDF 為影像式待 OCR、quality_flags 命名需標準化、其他 60 個 combo 待後續推進。見 `jobs/JOB-225-Report.md` | 🟢 DONE |

### 2026-04-30
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-220 | **三下社會南一考古題反推（階段2a）**：讀取 24 份南一三下社會考古題 MD（108-112 學年、11 所學校），逐一分類（L1-L4+探究L5/ambiguous）並深度分析。產出《南一_考古題彙整報告.md》16886字，含五課各5子節深度分析（出題方向統計、跨年度頻率、誘答機制、迷思矩陣≥6條）、達標檢核（全課 RM2，L4 β+警戒：來源集中勝利111）、PM 建議（KL3 補強3處：探究方法123/地名四分類/L2邊界）。JOB-217-progress.tsv 寫入 L1-L4+探究L5 五行進度記錄。commit `af70e64`。見 `jobs/JOB-220-Report.md` | 🟢 DONE |
| JOB-219 | **三下社會康軒考古題反推（階段2a）**：讀取 51 份康軒三下社會考古題 MD，逐一分類（L1-L6/ambiguous）並深度分析。產出《康軒_考古題彙整報告.md》19253字，含六課各5子節深度分析（出題方向統計、跨年度頻率、誘答機制、迷思矩陣≥5條）、達標檢核（全課 RM2 keep，無β+）、PM 建議（KL3 改寫方向 + 台灣各地特產清單補強）。發現1份誤入的三上學校生活試卷（海佃108）已排除。JOB-217-progress.tsv 寫入 L1-L6 六行進度記錄。commit `de2248f`。見 `jobs/JOB-219-Report.md` | 🟢 DONE |
| JOB-217 | **G3S2 社會反推研究基礎建設（JOB-215 Phase 2 五元件外殼）**：建立三件基礎設施 — `jobs/JOB-217-progress.tsv`（12欄 tab 分隔，供 9個JOB 追蹤進度）、`scripts/JOB-217-progress-dashboard.sh`（三類統計：phase/publisher×status/最新5筆）、`scripts/orchestrator-logs/` 確認存在。smoke test 通過（空 tsv 顯示「尚無資料」）。依 JOB-214 五元件範本建立，progress_sync pre-commit hook 自動掛接。Phase 2a（三版本考古題反推）待啟動。見 `jobs/JOB-217-Report.md` | 🟢 DONE |
| JOB-215 | **研究架構總綱升版（v4.4→v4.5）+ B-path 反推法設計**：Phase 1 — `README_研究架構總綱.md` 增補四章（研究流程程序/歷史卡點 KP-01~06/量化 DoD/執行者分工）；新建 `_JOB-TEMPLATE-research-KL3/KL4.md`；舊模板廢棄加標注。Phase 2 — B-path（無課文，反推法）方法論設計：spec 556行（`2026-04-29-G3S2-social-reverse-lookup-research-design.md`）、plan 1614行 26 Tasks（`2026-04-29-G3S2-social-reverse-lookup-research.md`），涵蓋 Phase 0/2a/2b/2c/2d 嚴格阻塞流水線，目標 34 個 KL4 雙檔 RM3 + KL3 v2 + KL2 新章節。執行方案 3（inline PM + 外部 Cursor agent）。Phase 3（比較分析）待後續開 JOB。見 `jobs/JOB-215-Report.md`（待結案） | 🟡 IN PROGRESS |

### 2026-04-29
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-214 | **長時任務進度回報範本制定**：把 JOB-209 跑出來的「五元件回報法」（dashboard + loop wrapper + ScheduleWakeup + Discord + per-task timeout）抽象成可重用範本。產出 `docs/長時任務執行範本.md`（七章節含失敗模式對照表）+ `scripts/templates/`（progress_dashboard.py / continuous_loop.sh / wakeup_prompt.md 三個骨架）+ CLAUDE.md/README.md 索引。設計為 SOP + 拷貝骨架而非框架套件，新任務 30 分鐘內可套上開跑。失敗模式對照表 10 條皆來自 JOB-209 真實遭遇。見 `jobs/JOB-214-Report.md` | 🟢 DONE |
| JOB-216 | **四下/五下/六下考古題 PDF 全批轉 MD（45 組合，2,529 份）**：四波次執行 — W1 數學+社會 18 組合（pdfplumber，6 路並行）、W2 國語 9 組合（docling，豎排文字修正，3 路串行批次）、W3 自然 9 組合（pdfplumber+OCR）、W4 英語 9 組合（pdfplumber+OCR，含何嘉仁版）。最終產出：45/45 組合 DONE、351 份 MD。長時任務五元件全套上線（`JOB216_progress.json` + `JOB216_dashboard.py` + `JOB216_resume.sh` + ScheduleWakeup 每 60 分鐘喚醒 + Discord 回報）。關鍵事件：Mac 低電量強制 Safe Sleep → 進程完整保存/恢復；Cursor agent 因睡眠網路斷線離線，備援 shell 腳本接力完成 W3/W4；發現並修正 `--engine v6`→`--engine pdfplumber` CLI flag 錯誤（W3/W4 全部 18 路重跑）。commit `a627f09`。見 `jobs/JOB-216-AG-四五六下考古題PDF全批轉MD-45組合2529份.md` | 🟢 DONE |
| JOB-209 | **米蘭考古題分批下載完成**：跨 6 天完成 704 個 Drive 資料夾下載任務。**排除「健體（全學期）」16 個資料夾後達標率 100%（10,506/10,506 PDF）；含健體 99.7%（10,591/10,625）**。1_原始檔/ 內共 10,663 PDF + 1,070 其他格式 = 11,733 檔。建構並驗證的可重用基礎設施：`exam_download_runner.py`（gdown CLI + Playwright 範圍選取備援 + 25min/drive 硬 timeout）、`rescan_manifest.py`（virtual scroll 解 50 截斷）、`retry_missing_drives.py`（manifest 比對 retry，不降級 partial）、`progress_dashboard.py` + `continuous_*_loop.sh`（長時批次任務範本，由 JOB-214 抽象化）。順帶完成：派工準則 §6 寫入 Discord 預設頻道（`eidos_派工與回報`/`1487738477608177714`）、CLAUDE.md §3.5 Discord 互動規範、目錄結構整理（年級層 G→中文學期、健體獨立到 `健體/`）。見 `jobs/JOB-209-Report.md`（214 行正式報告）+ `jobs/JOB-209-Report.md.history-bak`（599 行歷程詳情）| 🟢 DONE |

### 2026-04-28
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-213 | **考古題目錄重構（G→學期層）+ 三下社會科初轉檔 + 掃描 PDF OCR 補強**：Phase A — `1_原始檔/` 和 `2_MD淬鍊文字/` 頂層從年級目錄（G1~G6）重構為 12 個學期目錄（一上~六下）；15 個健體目錄（103 個實體檔案）搬至 `knowledge/3_考古題/健體/` 獨立存放；~150 個科目資料夾完成搬移。Phase B — `job207_distill_to_md.py` CLI 參數 `--grade`/`--semester_subject` → `--semester`/`--subject`，路徑與 frontmatter 全面更新；`README.md` §一、§二同步；4 個 `_index.json` path 欄位修正。Phase C — 三下社會翰林 30 份 MD + 康軒 51 份 MD 完成轉檔，`_index.json` 共 104 筆。補登 OCR — 28 份掃描 PDF 經 ocrmac（Apple Vision）全數提取成功（avg 3176 字/份），21 份 MD char_count 從 0~88 提升至 3842~9470，`extraction_method: ocrmac` 加入 frontmatter。見 `jobs/JOB-213-Report.md` | 🟢 DONE |
| JOB-212 | **KL2-KL4 規範治理 + 三下社會研究骨架**：Phase A — `README_研究架構總綱.md` v4.4 新增 KL3 命名規範、課名清單必要產出、KL4 大檔禁止規則；出題準則新增附錄 A 圖片依賴分類。Phase B — 25 個 KL3 從 `*_發展綱要` 重命名為 `KL3_*_研究總綱`；`run_blind_eval.js` R4_MAPPING 全 22 條路徑更新。Phase C — 三下社會 KL3 補課名清單；建立翰林版 12 個 KL4 RM0 空殼（6課×2）。Phase D1 — 自然 01_五下生物 合併、刪 iCloud 副本 × 3。Phase D2（國語年度素材庫 ~180 課）遞延下次。commit `3c9896a`（44 files）。見 `jobs/JOB-212-Report.md` | 🟢 DONE（D2 遞延） |
| JOB-211 | **斷點恢復子系統試行（JOB-210 子任務）**：於 G3 自然三上翰林 **Sci_HanLin_L1** 試行路徑 1（happy path）— 30 題、CQI-P 均 **9.46**，合併 **commit `61cea1f`**；路徑 5 底層 **llm_retry** 實測 **503／429／ENOTFOUND** 三類錯誤皆命中 **spec §7.1** 退避序列 **1s／4s／9s**。遺留：路徑 2／3／4 未試行；`run_blind_eval` 未納入本次 PM 範圍；目錄級 `auto_generate` 與 progress-config `lessons` 範圍不同步，L1 完成後須手動中止或改單檔呼叫。見 `jobs/JOB-211-Report.md` | 🟢 DONE |

### 2026-04-27
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-210 | **G5S2 三 Agent 流水線前置基礎建設**：依 spec v1.0.0 + plan 14 個 task 建立基礎設施。新增 6 項檔案：`.cursor/rules/karpathy-guidelines.mdc`（Karpathy 四原則 IDE 護欄，alwaysApply: true）、`jobs/g5s2_results.tsv`（autoresearch 風格量化軌跡，12 欄 tab 分隔）、`scripts/g5s2_tsv_monitor.sh`（PM 監控腳本）、`scripts/check_dual_blind_consistency.js` + 測試 + fixture（L2 雙盲 MTP 分流，TDD 5/5 綠）。三 SKILL 升級加入「自主迴圈條款」段：`ei_research`（+6 行）、`ei_qst`（+7 行，含 `--qpm 2 --conservative` 預設值避免 JOB-184 API 限流卡住）、`ei_verify`（+6 行，雙盲必跑 Gemini Flash + Claude Haiku 兩 model）。執行中發現補強：`.gitignore` 加白名單放行 `.cursor/rules/*.mdc` 與 `tests/*` 子檔（部分翻案 aae5338 + 0eb622f 個人設定排除，沿用「公開派工紀律進 git，個人 settings/worktrees 維持本機」原則）。Cursor Rules UI 人工驗證待使用者完成。下一步：使用者啟動階段 1 KL4 補強 9 單派工 brainstorming。執行者：Claude Code（claude-opus-4-7）。見 `jobs/JOB-210-Report.md` | 🟢 DONE |

### 2026-04-22
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-134 | **追溯補建派工單**：G3 S2 翰林版國語 L5/L8 盲測補做（Gemini-2.5-Pro，2026-04-03 完成，L5=100%、L8=96.7%）。本次補建 `JOB-134-AG-翰林三下國語-L5-L8-盲測補做.md` 使派工機制完整。見 `jobs/JOB-134-AG-翰林三下國語-L5-L8-盲測補做-Report.md` | 🟢 DONE |
| JOB-176 | **追溯補建派工單**：南一四下社會 KL4 考古題蒐集（Claude Code，2026-04-11 完成，L1=12/L2=12/L3=17/L6=6 題）。本次補建 `JOB-176-AG-南一四下社會-KL4考古題蒐集.md` 使派工機制完整。見 `jobs/JOB-176-Report.md` | 🟢 DONE |
| — | **`verify_jobs.js` 比對邏輯修正**：原本以 Report 完整 stem 比對派工單前綴，導致 JOB-105/122/132/152/200 等 11 個假陽性錯誤；改為以 `JOB-NNN[A-Z]*` 號碼前綴比對，修正後 `✅ 未發現 Report 與派工單明顯脫鉤`。 | 🟢 DONE |
| JOB-208 | **前台 is_publishable 過濾斷鏈修復**：前台過濾邏輯 `!== false` → 嚴格 `=== true`，防止 `is_publishable: false` 或未設定題目出現在題組；後台管理員 AdminUnitCuration 品質未通過題 toggle 一律 disabled + 顯示「禁止上線」；新增 `adminMode` 參數讓後台可載入全題供審閱。3 檔修改：`config.ts`、`questionLoader.ts`、`AdminUnitCuration.tsx`（commit de6c612）。見 `jobs/JOB-208-Report.md` | 🟢 DONE |
| JOB-187 | **上版前測試基礎建設強化（結案為廢案）**：`release_gate.sh`、`about.spec.ts`、`error-boundary.spec.ts` 均未建立；使用者確認以 JOB-188 直接實測取代本 JOB 工程基礎。見 `jobs/JOB-187-Report.md` | 🟢 DONE（廢案，以 JOB-188 結案） |

### 2026-04-21
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-207 | **考古題全站存檔與淬煉 MD 目錄建立**：延伸 JOB-206 β+ 補償實踐，重構考古題資產（舊 `knowledge/3_考古題/` → 新 `knowledge/3_考古題/` 三軌：原始/淬煉/_manifest）。新建 10 章 README（含新 Rule 7「原始檔永久保存」取代舊「解析即刪」）、2 個 pipeline 腳本（`job207_download_batch.py` + `job207_distill_to_md.py`）、G3 社會南一 Pilot 完成（25 PDF → 14 MD + `_index.json`；另 3 資料夾共 49 MD + 4 index）。51 份 _test_10 PDF 重命名遷移；JOB-172 聚合 JSON 拆 9 MD。全站 11,704 PDF 清單已備（等後續每週批次下載）。7 個現役規範路徑更新。遺留：G3 社會南一 2 Drive 被 rate-limit 待重試、舊目錄待清理、其他科目 `SUBJECT_KEYWORDS` 待補。執行者：Claude Code（授權一條龍）。見 `jobs/JOB-207-Report.md` | 🟢 DONE |
| JOB-206 | **G3 SOC NanYi L5「打造幸福的家園」全課重出上架**：anti-hallucination D-驗證發現原 30 題錯放（70% 跨情境品德題、30% 探究方法論），與正確課名「打造幸福的家園（自主探究與行動計畫）」主題不符。使用者裁決整課刪除重出。一次做完 spot fix（manifest title 補正 + 30 題降活 + libraryStats 同步）+ KL4 雙檔研究（單課研究紀錄 + 考古題與討論，β 方案以三下發展綱要實證情境為主）+ Claude-Opus-4.7 出題 30 題（taxonomy 3-11-10-6、答案分佈 8-8-7-7 均衡）+ Gemini-3.1-Flash-Lite 盲測 30/30 Match（100%）+ QL4 上架（avgCqi **9.19**）。libraryStats 重算：G3 社會 南一 units 4→5、題數 120→150、cqi 8.11→8.32。米蘭老師 G3 南一 Drive × 5 登錄於 KL4 考古題討論檔。JOB-206 原 117 檔 scenario 審查改列遺留，建議另開 JOB。執行者：Claude Code（使用者授權例外）。見 `jobs/JOB-206-Report.md` | 🟢 DONE |

### 2026-04-20
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-206 | **題目 scenario 規範與錯放題目審查**：JOB-204 §4 + JOB-205 延伸。Subagent 抽樣 5 檔 183 題揭露錯放率達 66%（C2 52% + C3 14%），G5 HanLin L4 滿修女採訪記 >90% 錯放（童話內容佔滿）、G3 HanLin L2 還差一點 0 題正確。外推 117 檔可能影響 2,600-4,900 題。前期研究 `docs/question-audit/JOB-206-前期研究.md` 已產出，後續階段 1-3 待使用者核准付費 LLM 審核預算。| 🟡 OPEN（前期研究完成） |
| JOB-205 | **JOB-184 批次建檔事故修復（防破窗 + placeholder 清理）+ 補登階段**：追查 `eccb974` mega-commit（標記 JOB-184 但實際涵蓋 5-6 個 JOB 的 4422 檔變更），定位三層防線崩壞。階段 2 防破窗：`repair_manifests.js:63`、`auto_generate_questions.js:80`、`job184_g5s2_social_orchestrator.js:147` 三處 fallback 改 throw；`verify_ui_data_integrity.mjs` 加 D-INT-5 規則；新增 `verify_no_placeholder_title.mjs`。階段 1 事故文件：`docs/技術設定/JOB-184-批次建檔事故分析.md` 含盤點疏漏修正章節。階段 3 補 title：G5 Math × 3 publisher（KL4）+ G3 ENG × 3（發展綱要）= 42 課。**補登階段**（使用者質疑後）：brainstorming skill 產出設計文件，新 `scripts/job205_sync_title_from_materials.mjs` 通用 parser 支援 5 種素材庫 pattern，補 G3 數/自/社/G4 Math/G6 數/自/社 **110 課**；衝突 19 筆寫入 `docs/question-audit/title-conflicts.md`；vision 驗證 3 張 G3 jpg 與素材庫 **100% 一致**。Placeholder 最終 27→10 manifest（剩英語 + G6 Math 衝突 + G3 社會 NanYi 邊界）。見 `jobs/JOB-205-Report.md` | 🟢 DONE |
| JOB-204 | **視覺清晰化 A+B+C 與字型試行**：JOB-203 Phase 0 三輪雛形後鎖定「不換色系、不動結構」方針；本 JOB 交付 14 項元素級改動——A1/A2 `--foreground`/`--muted-foreground` 對比度升至 AAA/AA、A3 題目字重 semibold；B1 選項 A/B/C/D badge 從純文字升級 28×28 方形底、B2 hover 邊框 /50 → /70、B3 答對/錯選加 ✓/✕ 色盲友善圖示；C1 `--wrong` 粉 → 正紅、C2-C4 分課卡題數 pill 放大與前綴微調；D1-D4 字型試行（標題 Iansui + 數字 Baloo 2，body 仍 Nunito）；E1-E3 `docs/網站功能規格書.md §1.1 §1.4` 同步。L1-3 0 違規 + L2-1 8/8 + Build 通過；L2-2 既有測試 sample 問題列遺留。發現 G5 南一 L4「縣官審石頭」10/12 題 scenario 不符，全站掃描 117 檔可疑，列 JOB-206 獨立處理；42 manifest title 佔位符列 JOB-205。見 `jobs/JOB-204-Report.md` | 🟢 DONE |
| JOB-203 | **視覺重構-全站 Claymorphism 導入-Phase0 規劃與獨立雛形站**：使用者透過 `ui-ux-pro-max` skill（v2.5.0，全域安裝）確定採用 Claymorphism 風格 + Learning Blue 調色盤。本 Phase 0 將產出三份規劃文件（方向決策閘 / token 映射 / Phase 計畫）+ 在 `prototypes/ui-v2/` 建立獨立 Vite 雛形站（4 個代表頁面），**絕對不碰 `apps/v3_eidos/`**。執行者：Claude Opus（claude-opus-4-7）。 | 🟡 OPEN |
| JOB-202 | **前端守則與 ei_web SKILL 硬閘同步**：`docs/技術設定/前端開發與AI實作守則.md` 從 66 行精簡至 45 行（刪除 SOP 5 具體 class 名、SOP 7 通用清潔程式碼等與 CLAUDE.md 重複項）；測試層級表由錯誤的 L1/L2/L3 改為精確對應 L1-3/L2-1/L2-2；同步修正 `_agent/skills/ei_web/SKILL.md` 第一條硬閘「禁止 TailwindCSS 類名」（與專案實際技術棧 Tailwind + shadcn/ui 矛盾）。`/pj_audit` 稽核 5/5 PASS。**本單為事後補單登記**，已留下紀律痕跡供未來引以為鑑。見 `jobs/JOB-202-Report.md` | 🟢 DONE |

### 2026-04-19
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-201 | **AboutView 題庫設定連動修正**：修復 admin 後台 `library_config` 對前台「題庫總覽」tab 完全無效的問題。`AboutView` 改接受 `libraryConfig` prop（來源：`Index.tsx` 從 `/api/settings` 取得），移除獨立 localStorage 讀取；`Index.tsx` 傳入 prop；subjects 過濾邏輯改為 allowlist（subjects dict 有設定時，只顯示 `enabled === true`）。本機瀏覽器驗證：G5 S2 僅顯示國語、G4 S2 僅顯示國語＋數學，與 admin 設定一致。見 `jobs/JOB-201-Report.md` | 🟢 DONE |

### 2026-04-18
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-199 | **補盲測：G3 國語康軒 L4/L6 + G4 社會南一 L6**：對三檔執行 `run_blind_eval.js`（Gemini-3.1-Flash-Lite，免費額度）；L4 20題 100%、L6 29題 100%、SOC L6 28題 100%，全部 Match Rate 100%。G3 下國語康軒升 QL4（442/442）、G4 下社會南一升 QL4（178/178）。重新生成 `libraryStats.json`。見 `jobs/JOB-199-Report.md` | 🟢 DONE |
| JOB-198 | **全量重評 + backup 排除 + 限已開放科目統計**：對 380 檔已開放科目（G3-G6 × S2）執行 canonical QL 重評，更新所有題目的 `quality_level` 欄位；`generate_library_stats.js` 新增 `OPEN_GRADE_SEMESTERS` 與 `isBackupDir()` 過濾；新增 `scripts/batch_reevaluate_all.js` 批次腳本。最終 57 個 publisherStats：QL4 × 16、QL3 × 8、QL1 × 33。英語、G4/G5 數學、G5 自然/G6 自然社會數學因無 KL4 per-lesson 雙檔結構判為 QL1（實際狀況誠實反映）。見 `jobs/JOB-198-Report.md` | 🟢 DONE |
| JOB-197 | **QL 定義 canonical 整合**：建立 QL Single Source of Truth 於 `question/README_驗證與盲測準則.md` §4，整合五系統（KL/RM/CQI-P/CQI-V/QL）關係；統一 7 份文件與 UI 用語；重構 `evaluate_question_quality.js` 每題 QL 判定（改為檢查 KL4 單課研究紀錄+考古題與討論是否存在 + `blind_evaluation===true`），檔級 QL 門檻由 80% 升至 90%；UI 文案改為「{QL4} 代表 該題庫有 90% 的題目達到 {QL4} 以上的標準」。遺留：題目 JSON 的 `quality_level` 欄位未全量重評，英語因無 KL4 per-lesson 結構若重跑會降級。見 `jobs/JOB-197-Report.md` | 🟢 DONE |
| JOB-196 | **QL 定義重構 + 全科統計更新**：重新定義題庫品質等級計算邏輯——每題以 `blind_evaluation===true` 判定 QL4、`quality_level≥QL3` 判定 QL3、`≥QL2` 判定 QL2；科目等級改為「全科累積比例 ≥ 90%」取代舊版「單課最高值 ≥ 80%」。更新 `scripts/generate_library_stats.js`（新增 `getQuestionQLevel()`、`computeSubjectQL()`）並重新生成 src/public 兩份 `libraryStats.json`。產出升級分析表：G3 S2 國語康軒（差 15 題）、G4 S2 社會南一（差 11 題）最接近 QL4。見 `jobs/JOB-196-Report.md` | 🟢 DONE |
| JOB-195 | **G3 國語 S2 重寫三檔 Cursor 獨立驗證**：對翰林 L8《行人的守護者》、康軒 L4《工匠之祖》、康軒 L6《神奇密碼》執行 `evaluate_question_quality.js`（三檔 `biasWarning: null`；檔級 L8=QL4 avgCqi 9.30、L4/L6=QL3 avgCqi 6.69／5.75）；依 KL4 對讀並每檔抽查 ≥10 題，確認課文對應與 `answer_index`／`explanation` 一致；**未修改**題庫 JSON；盲測未於本 JOB 執行。見 `jobs/JOB-195-Report.md` | DONE |
| JOB-194 | **G3 康軒國語 S2 L4《工匠之祖》30 題、L6《神奇密碼》29 題全數重寫**：發現原題根本性內容錯誤（L4 含 22 題《愛與成長的腳印》，L6 全為禮貌用語），由 Claude Code 依 KL4 研究文件全數重寫；主動設計三種等長選項策略確保 `biasWarning: null`；L4 正解最長比 13.3%，L6 亦通過；兩檔均 QL3、`biasWarning: null`；已跑 `generate_library_stats.js`。見 `jobs/JOB-194-Report.md` | 🟢 DONE |
| JOB-193 | **G3 翰林國語 S2 L8《行人的守護者》重出 30 題**：依 KL4 單課與考古討論重寫 `G3_S2_CHI_HANLIN_L8.json`；`evaluate_question_quality.js` 檔級 **QL4**、**biasWarning: null**、單題 QL4×30；`review_status=pending_review` 待另開盲測；已跑 `generate_library_stats.js` 並同步 `public/data/libraryStats.json`。見 `jobs/JOB-193-Report.md` | 🟢 DONE |
| JOB-191 | **explanation 元評論句型清除**：以 JOB-190 Phase 2 產出（743 筆命中、350 題）為輸入，建立 `scripts/clean_explanation_artifacts.js`（11 條 sentence-level 正規表達式 + 二次標點清理）；實際執行清除 80 個 JSON 檔，成功清除 **165 題**、標記 review_needed **83 題**（explanation 全為元評論、需人工補寫）、102 題未命中。三道安全機制：dry-run 預覽、review_needed 保護、執行紀錄 `logs/clean_explanation_2026-04-17T18-04-59.json`。開發過程修正 3 個 bug（批判性思考過廣、孤立句點殘留、review 門檻過高）。見 `jobs/JOB-191-Report.md` | 🟢 DONE |
| JOB-192 | **review_needed explanation 補寫（83 題）**：依 `logs/clean_explanation_2026-04-17T18-04-59.json` 清單，補寫 34 個 JSON 檔內 83 題之 `explanation`（學科向解析、對齊 `answer_index`）；附 `jobs/JOB-192-explanations.json` + `scripts/apply_job192_explanations.mjs` 供重現；逐檔執行 `evaluate_question_quality.js` 通過。見 `jobs/JOB-192-Report.md` | 🟢 DONE |

### 2026-04-16
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-190 Phase 2 | **explanation 元評論關鍵字深度掃描**：補強 Phase 1 頻率分析的盲區（盲測機制從不驗收 explanation，低頻分散模板在 ≥5 門檻下不可見）。新增 `scripts/scan_explanation_artifacts.mjs`，以 12 類正規表達式掃描 654 個 JSON / 12,980 題；命中不重複題數 **350 題** / 743 筆紀錄。重災科目：G3/Chinese/S2（390 筆）、G4/Chinese/S2（125 筆）。輸出 `explanation_元評論_關鍵字掃描.md/.json`，作為 JOB-191 清除腳本精確輸入。見 `jobs/JOB-190-Report.md` | 🟢 DONE |

### 2026-04-15
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-190 Phase 1 | **全科三欄位高頻片段分析**：掃描 653 個題庫 JSON / 12,930 題，對 `question`/`scenario`/`explanation` 三欄位進行句號+逗號雙重分割頻次分析；輸出各欄位 Top 100 榜（含分科子榜）及 JOB-128 舊案 36 個模式對照（殘留 0 個）；285 片段全數加入 🔴/🟡/🟢 判斷欄（🔴20/🟡18/🟢247）。腳本 `scripts/analyze_field_segments.mjs` 已產出。見 `jobs/JOB-190-Report.md` | 🟢 DONE |
| JOB-189 | **全庫 AI 評註殘留清除**：掃描 653 個題庫 JSON，修改 243 檔（兩輪執行）、7,621+ 個選項；AI 評註殘留從 2,124 個降至 **0 個**；清除模式涵蓋尾綴型（4 種）、嵌入型、括號型重複評註（4 種）、前綴垃圾、尾部全形空白共 10+ 種規則；腳本 `scripts/clean_option_artifacts.js` 已產出（含 dry-run 模式）；另重建兩個 `libraryStats.json`（src/data: 98 組合；public/data: 658 檔 12,980 題）。遺留：G5 翰林 L4 Q28「標記」「物件」後綴待後續 JOB 處理。見 `jobs/JOB-189-Report.md` | 🟢 DONE |

### 2026-04-13（JOB-188 補充）
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-186 | **G4S2 數學選擇題設計指引建立（KL3 研究）**：三版本課名對照（康/翰/南各 ~10 單元）、各單元適性分類（選擇題 vs 圖形封存）、範例題框架；修正範例答案 2 處錯誤；`G4_S2_數學_選擇題設計指引.md` + `G4_S2_數學_原始研究素材庫.md` 建立。見 `jobs/JOB-186-Report.md` | 🟢 DONE |
| JOB-185 | **G3S2 數學選擇題設計指引建立（KL3 研究）**：三版本課名對照（11 個核心主題）、各單元適性分類（圓/面積等圖形操作封存）、範例題框架；`G3_S2_數學_選擇題設計指引.md` + `G3_S2_數學_原始研究素材庫.md` 建立。見 `jobs/JOB-185-Report.md` | 🟢 DONE |
| JOB-188 §A | **上版前題庫抽樣驗證**：29 個開放組合 × 3 題 = 87 題全部抽驗。D1 格式 100%、D2 欄位 100%、D3 答案可信 100%、D4 文字品質 72.4%（63/87）。發現系統性問題：24 題含 AI 出題評註殘留（「這點在分析單元核心時非常關鍵」等），涉及 13 個組合，社會科（G3/G4 三版本）最嚴重。另發現 `libraryStats.json` 資料不完整（totalIndexed=15，實際 12,930 題）。§B 瀏覽器驗證因擴充套件未連線待後續執行。見 `jobs/JOB-188-Report.md`、`docs/reports/JOB-188-題庫抽樣驗證報告.md` | 🟡 §A DONE，§B 待補 |

### 2026-04-12
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-179 | G5S2 自然 KL4 單課研究建置：三版本（翰林/康軒/南一）各 4 課，雙檔/課 = 24 檔；每課 12 道考古題 / 2 來源達標；康軒 L11 確認廢棄殘留（待另開清理 JOB）；WebFetch 受限，考古題依課綱知識點建立並標注 tcool.cc ID 供後續驗證 | 🟢 DONE |
| JOB-180 | G5S2 社會 KL4 單課研究建置：翰林 L1-L6（12 檔）+ 康軒 L1-L5（10 檔）+ 南一 L1-L5（10 檔）= 32 檔；每課 12 題 / 3-4 來源；考古題來源：勝利國小段考卷、大直/和順/東光國小（全國中小學題庫網）等真實考卷 | 🟢 DONE |
| JOB-181 | G5S2 數學 KL4 單課研究建置：三版本 L1-L10 = 60 檔；翰林課名確認（L1 數的十進位結構 → L10 線對稱圖形）；視覺圖形題 10 課標注（體積/容積/線對稱/統計圖等），供後續盲測 triage 參考 | 🟢 DONE |
| JOB-178 | G5S2 國語三版本盲測（`question/platform/G5/Chinese/S2`）：全量 `--force` 完成；`run_blind_eval.js` 修正五下國語 R4 路徑、KL4 依 `meta.title` 與課次對齊；康軒曾誤配 KL4 已重跑；`j178_g5s2_chinese_apply.js` 回寫 `is_publishable`；多課未達每課 25 題可上版、大量 Mismatch 待人工 triage。見 `jobs/JOB-178-Report.md` | 🟡 未達 DoD（待 triage／補題） |
| JOB-182 | G5S2 國語 KL4 相關性刪題：KL4 研究比對確認 14 課脫節，刪除 455 題，保留 22 課 559 題。見 `jobs/JOB-182-Report.md` | 🟢 DONE |
| JOB-183 | G5S2 國語 14 課重出題補強：翰林 L1/L8/L10/L11、康軒 L4/L7/L9/L10/L12、南一 L1/L5/L6/L7/L12；共 625 題，全課 QL3（avgCqi 5.80–8.94）；manifest 未完全同步（遺留）。見 `jobs/JOB-183-Report.md` | 🟢 DONE |
| JOB-184 | **G5S2 社會三版本全量出題完成**：HanLin 補題至 L1-L5（L2 BIAS 修正，L4/L5 補充至 45 題各）共 165 題，CQI-P 全課 ≥5.5（平均 6.84–7.27）；康軒 L1-L5 全課 225 題，CQI-P 7.07–7.27（平均 7.17）；南一 L1-L5 全課 225 題，CQI-P 7.07–7.25（平均 7.17）；品管：BIAS 平衡已執行，欄位驗收 0 errors；待盲測驗證（CQI-V）與上架決策。見 `jobs/JOB-184-Report.md` | 🟢 全量出題 DONE |

### 2026-04-11
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-102~109 結案 | G3S2 全科目最終清理：backup/U1-U5（翰林社會廢棄舊版 150 題）刪除；自然/社會共 9 題 mismatch 完成 triage（3 幽靈清除 + 6 TYPE-A）；**數學 154 題視覺圖形封存**（is_publishable=false、TYPE-C）—— AI 文字盲測無法處理，待後續視覺盲測能力建置；部分數學課次 pub < 25 為已知限制；G3S2 國語 JOB-103 虛假彙報問題已由 JOB-165 修復確認（verifying_date=2026-04-08）；見 `jobs/JOB-102-109-Report.md` | 🟢 DONE |
| JOB-177 | 翰林四下社會 L3 KL4 補強：從已下載大華國小期中考（mockId=20000123）選取「自來水輸送系統」+「水資源主要來源」2 題補入，L3 由 8 達 **10 題**；翰林版 L1-L6 全課 KL4 達標 | 🟢 DONE |
| JOB-171 | G4S2 社會三版本：`meta.title` 修正；康軒／翰林補題、南一重產各 30 題／課；KL4 注入 `auto_generate_questions.js`；`auto_balance`＋盲測（Gemini-3.1-Flash-Lite）；`job171_phase3_g4s2_social_publish`；南一 L6 全部重產（28 題 100% Match）補完；可上版題數康軒 174／翰林 177／南一 175（L6 共 28 題）；三版本全課 ≥25 達標；見 `jobs/JOB-171-Report.md` | 🟢 DONE |
| JOB-176（非正式）| 南一四下社會 KL4 考古題補強：tcool.cc mock quiz 抓取廣興國小（112下 mockId=17921，18題）+ 東光國小（113下 mockId=20001081，19題）；分類回填 L1（12題/3來源✅）、L2（12題/3來源✅）、L3（17題/3來源✅）；另抓廣興112下期末2（mockId=18229，19題）+ 東光113下期末2 Q17 補強 L6 至 6 題（3來源）；全掃 tcool.cc period=3/4 共 8+1 頁確認無更多南一社會四下 mock，L6 屬低出題頻率單元（6題為可達上限）；翰林四下 L2 已於前次達標（13題）一併確認 | 🟢 DONE |
| JOB-175（非正式）| 多 Agent 執行機制補寫：CLAUDE.md §3.3、派工準則 §5.0、Bootstrap L1 角色分工表 + 多 Agent 摘要區塊、orchestrator.js 注解補齊；修正「多 Agent 呼叫方式只藏在程式碼」的文件缺失；JOB-171 cursor agent 已背景啟動（PID 83202） | 🟢 DONE |
| JOB-174 | JOB-167~173 遺留項目彙整收尾：KL4 考古題門檻 8→10 同步、Hook 摘要加入文件設計原則、JOB-168/170/172/173 補結案 | 🟢 DONE |
| JOB-173 | Agent 文件設計原則研究：研究 Claude Code 源碼分析/Spec Kit/Andrew Ng 4 來源，產出通用作業準則第九章（§10.1-10.7 七項原則）+ 跨專案通用研究報告（`0_AI_Project/`） | 🟢 DONE |
| JOB-172 | 考古題蒐集方法探索：突破 tcool.cc 403（mock quiz 法）、擴充至 4 來源管道、Production Gate 升級 ≥10/≥2、課次分類準則、智財保護條文 | 🟢 DONE |
| JOB-170 | G4S2 社會 KL4 單課研究建置：三版本 6 課 × 雙檔 = 36 檔；考古題真實性重做 | 🟢 DONE |

### 2026-04-10
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-169 | G4S2 自然：南一 120 題依 KL4 重產後 <code>run_blind_eval.js …/NanYi --force</code> 全 Match；<code>j169_phase3_apply</code> 納入 <code>ai_selected=-1</code> 閘門（翰林 L3／L4 各 1 題不可上版，其餘課級仍 ≥25）；<code>normalize_manifest</code>；見 `jobs/JOB-169-Report.md` | 🟢 DONE |
| JOB-167 | G3S2 數學康軒 L3／社會康軒與南一補題後盲測、Mismatch triage（社會 3 TYPE-A；數學 L3 7×TYPE-A、1×TYPE-C）、<code>is_publishable</code> 與 manifest；見 `jobs/JOB-167-Report.md` | 🟢 DONE |
| JOB-168 | G4S2 自然 KL4 單課研究建置：三版本 4 課 × 雙檔 = 24 檔；另修正 `run_blind_eval.js` R4 映射（自然/社會/數學共 16 處）；見 `jobs/JOB-168-Report.md` | 🟢 DONE |

### 2026-04-09
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-166 | 盲測 R4：G3 國語 S2 優先讀取 `knowledge/1_課綱研究/國語/三下/*/KL4_*_單課研究紀錄.md`（略過 LLM 萃取）；南一 L1/L2/L3/L8 `--force` 重測，ai=-1 由 17 歸零（四課合計）；1 題 TYPE-C；見 `jobs/JOB-166-Report.md` | 🟢 DONE |

### 2026-04-08
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-162 | **發展綱要檔名統一簡稱與腳本修復**：knowledge/ 下 19 個發展綱要檔名從長格式（G3_S2、三年級下學期）統一為簡稱（三下）；`evaluate_question_quality.js` 路徑匹配邏輯重構（458 行）；`test_golden_cases.js` 預期值修正（L4→QL4、L3→QL2）。見 `jobs/JOB-162-Report.md` | 🟢 DONE |
| JOB-161 | **規範文件三層注入架構重整**：新建 SessionStart Hook（`.claude/settings.json`）自動注入通用/派工精華摘要（L1 軟注入）；建立 `docs/_agent_bootstrap_通用.md` + `docs/_agent_bootstrap_派工.md`；重寫 `README.md` 三層架構置頂；新增 `docs/README_產品介紹.md`；調整 `CLAUDE.md` 寫死 15 條關鍵規則；修正 `.cursorrules` 廢棄引用。見 `jobs/JOB-161-Report.md` | 🟢 DONE |
| JOB-165 | G3S2 國語三版本全量盲測（`run_blind_eval.js --force`）、MTP 分類 44 題、TYPE-B 1 題修正答案、課級 `is_publishable`≥25 全達標；`run_blind_eval.js` 金鑰解析與避免覆寫 `cqi_score`；見 `jobs/JOB-165-Report.md` | 🟢 DONE |
| JOB-164 | G3S2 國語三版本：`evaluate_question_quality.js` 研究檔遞迴搜尋＋三下 `KL4_三下_國語_原始研究素材庫.md` fallback；`auto_balance_json.js` 支援單檔、消 BIAS；翰林 78 題擴寫過短解析、康軒 L8 擴寫解析；各課 avgCqi≥5.5；`normalize_manifest`；見 `jobs/JOB-164-Report.md` | 🟢 DONE |

### 2026-04-06
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-160 | 準則規範文件整體重構（第五次）：套用 prompts.ts 四原則（分散強化/快取邊界/薄層觸發/多層防禦）；新建 CLAUDE.md 自動載入指令集；9 份 Skill 瘦身為指針式（平均 50→18 行）；通用作業準則新增 §1.0 角色分工表；R3/R4 術語統一為 KL3/KL4；audit+pj_audit 合併 | 🟢 DONE |
| JOB-153 | G4 S2 國語全版本補題 × 盲測 × Mismatch 審視：三版本各 360 題（1080 / 1080）補齊，CQI-P ≥ 5.5，221 題 Mismatch 全數處理；同步修正 `run_blind_eval.js` R4_MAPPING 路徑；補救 JOB-158-Report 誤判 | 🟢 DONE |
| JOB-152→JOB-158 事件 | 白名單批量初始化（JOB-152）導致 `blind_evaluation=true` 不代表真實盲測通過；建立「批量欄位初始化後必附題數分布稽核」準則；詳見 `JOB-159-事件備忘錄-白名單初始化誤判.md` | 📌 已建檔 |

### 2026-03-30
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-133 | 三層規範架構：`README_通用作業準則.md`（第 2 層通則）＋`README_任務派工準則.md`（第 3 層派工／Discord／流水號）；刪除 `README_專案作業準則`／`README_專案任務準則`；全庫引用、根 `README`、`.cursorrules`、`job_manager` 註解與 §2.4→第三章 §3.4 對齊 | 🟢 DONE |

### 2026-03-28
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-123 | 規範與腳本對齊：題庫／知識管線稽核（README、作業準則、KL3 索引、ei_qst／ei_research、job_manager／verify_jobs） | 🟢 DONE |
| JOB-114 | 全站重構後文件結構二次稽核 (規範文件 v6 定案) | 🟢 DONE |
| JOB-115 | 題庫重構複核與多源題庫正規化收斂 (v3 格式統一) | 🟢 DONE |
| JOB-116 | 國文品質量產驗證與底層邏輯修補 (G3-G6 L1-L6) | 🟢 DONE |
| JOB-122 | 國語科研究階段重建 (由原 JOB-118 拆分) | 🟢 DONE |
| JOB-119 | 設計國語科 KL3 與 KL4 研究範本 (雙檔架構/認知調適) | 🟢 DONE |
| JOB-118 | 建立全域模型計價與物理防呆腳本 | 🟢 DONE |
| JOB-121 | `dojob` 併入 `pj_job`；新建 `docs/README_任務派工準則.md`；模板與引用對齊 | 🟢 DONE |
| JOB-120 | 三下國語 15 課正式課次研究紀錄與考古題補完 (QL4) | 🟢 DONE |

### 2026-03-29
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-130 | 派工單流水號稽核與檔名準則收斂：`job_manager.js` 新增 `next`/`audit`、開單前多重驗證；關鍵決策：正式派工僅得由 `create` 指令產出 | 🟢 DONE |
| JOB-131 | 社會/自然占位類字串掃描驗證：確認 SocialStudies=0、Science=0，無須清除 | 🟢 DONE |

### 2026-03-22
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-098 | 全站品質審計與管線對齊 | 🟢 DONE |
| JOB-099 | 六下題庫導覽與分課題數修正 | 🟢 DONE |
| JOB-100 | 六下社會/自然題數補齊 | 🟢 DONE |

### 2026-03-21
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-072/073 | CQI v2 七維度重構 + G6S2 康軒國語盲測 (100% Match)；關鍵決策：題庫驗證正名「盲審驗證」，Position Bias 問題促成 `auto_balance_json.js` | 🟢 DONE |
| JOB-074 | G3S2 南一版自然 U4 補強：由 4 題增補至 30 題（CQI 8.25 / QL4） | 🟢 DONE |

### 2026-03-20
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-066 | G6S2 自然科 R3/R4 建立；關鍵決策：探究實作占比≥30%、嚴格區分熱效應/磁效應場景 | 🟢 DONE |
| JOB-064 | G6S2 社會科 R3/R4 建立；關鍵決策：史地因果+公民決策占比↑、情境標籤強制引入 | 🟢 DONE |
| JOB-062 | G6S2 國語科 QL4 題庫完結，作為高年級品質標竿 | 🟢 DONE |

> 📊 題庫進度詳見 → [進度彙整_題庫研發與產出.md](進度彙整_題庫研發與產出.md)

---

## 三、技術債與優化候選

### P0（高優先）
- [ ] Cloudflare Wrangler v4 升級與相容驗證
- [ ] 後端 API 正式完成來源遷移（移除委派入口）
- [ ] 部署與維運文件統一

### P1（中優先）
- [ ] 管理後台路由切分與懶載入強化
- [ ] 題庫資料快取策略優化
- [ ] 錯誤監控與告警補強

### P2（低優先）
- [ ] UI 微動效與互動細節提升
- [ ] 長期技術債巡檢節奏化
