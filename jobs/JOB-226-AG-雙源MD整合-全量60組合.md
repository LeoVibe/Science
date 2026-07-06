*Created by AG at 2026-05-01 15:30*

`last_updated`: 2026-05-04 22:00
`updated_by`: Claude Code (claude-opus-4-7)
`spec_version`: **v3**（B 模式 PARALLEL=4 兩 combo 並行 + canonical template v3 + watchdog 1500s + Phase 6 grep 範圍修正；三下 15/15 done 實證後補強）

> v3 變動摘要（vs v2）：①將 prompt 升級到 canonical template v3（內嵌題幹一致鐵則 + 答案區補述規則 §7.1）；②並行配置從 PARALLEL=3 單 combo 改成 PARALLEL=4 兩 combo 並行（實證 1.56× 加速）；③codex watchdog timeout 900s → 1500s（避免大檔被 kill）；④Phase 6 codex 抽樣 grep 範圍縮限到 `## 試卷` / `## 答案` 區段（避免假陽性）；⑤新增 raw 學期分類稽核前置（JOB-227 結論導入）；⑥`_integration_report.md` 改用 `JOB226_generate_reports.py` 自動產生。

# JOB-226-AG-雙源MD整合-全量60組合

**`job_type`**：`research`
（考古題素材整合，產出統一格式的雙來源整合 MD，不涉及課綱研究 KL3/KL4，亦不涉及題庫 JSON。）

---

## 📌 任務背景

JOB-225 pilot 完成 `三下_社會_南一` 24 份雙源 MD 整合，並萃取出 v2 spec（`knowledge/3_考古題/README_雙來源MD整合作業準則.md`）。本 JOB 依 v2 spec 全量推進**所有 60 個 combo**（4 學期 × 5 科目 × 3 出版社），輸出至**新標準目錄** `2_MD淬鍊文字_整合版/`（無 agent 後綴）。

---

## 🎯 任務目標

在 `knowledge/3_考古題/2_MD淬鍊文字_整合版/{學期}/{combo}/` 產出每份 logical exam group 的 final MD，總計 **60 combo ≈ 1,650-1,825 份**（三下實算 545 + 四五六下預估 ~1,280；含 JOB-225 三下_社會_南一 已依 v2 spec + canonical template v3 重做覆蓋）。

每份遵守：
1. v2 spec §2.1 — 6 個平行 H2 區段（整合摘要 / 主題命中分析 / 試卷 / 答案 / 來源追溯 / 整合判斷）
2. v2 spec §2.2 — frontmatter 必填（exam_id、char_count、integration、source_pdfs 等）
3. v2 spec §2.3 — 11 個標準 quality_flags（禁變體）
4. v2 spec §3 — 內容清洗 SOP（OCR mapping / alias dedup / 雙欄重排 / 雜訊清除）
5. v2 spec §4 — 完整度保護鐵則（不主動丟題、不腦補圖像、題數保留檢查）

---

## 📊 範圍盤點（實算 2026-05-04 重算 — JOB-227 移檔後）

> 重要前提：**Claude raw 設計上把同一份試卷的「題目」與「答案」合一成 1 份 MD**；**Codex raw 是試卷、答案各成 1 份 MD**。所以同一批 PDF，Codex 數量約為 Claude 的 1.5–2.3 倍，這是格式差異不是缺漏。

| 學期 | combo 數 | Claude 檔 | Codex 檔 | 整合版（已產） | 狀態 |
|:--|:--:|:--:|:--:|:--:|:--|
| 三下 | 15 | 539 | 474 | **545** | **15/15 done**（含 JOB-225 重做覆蓋） |
| 四下 | 15 | 200 | 468 | 0 | 0/15 pending |
| 五下 | 15 | 162 | 461 | 0 | 0/15 pending |
| 六下 | 15 | 146 | 351 | 0 | 0/15 pending |
| **合計** | **60** | **1,047** | **1,754** | **545** | 15/60 done |

> 註 1：三下兩源規模接近（Claude 539 vs Codex 474），dual_source_merged 比例高；其餘三學期 Codex 完整度高，`codex_only` 比例會升（已由 v3 canonical template 處理，5/5 combo Phase 6 PASS 實證）。
> 註 2：JOB-227 已將 4 學期 raw 中誤分類至下學期 combo 的 116 份上學期試卷移到 `_misclassified/` 備存區；本 JOB 啟動四/五/六下前重 audit 已歸零（misclassified=0），可放心啟動。

---

## 🚧 任務邊界

### 本次任務只做：
- 將兩源 MD 依 v2 spec 整合至 `2_MD淬鍊文字_整合版/`
- 產出每 combo 的 `_index.json` 與 `_integration_report.md`
- Codex agent 抽樣驗收（每 combo 3 份）
- 進度回報（progress JSON / dashboard / Discord）

### 本次任務不做：
- 修改 v2 spec（如需修，另開 docs_ops JOB）
- 修改題庫 JSON、課綱研究 KL3/KL4
- 刪除原始來源 `2_MD淬鍊文字_Claude/` 或 `2_MD淬鍊文字_Codex/`
- 重新 OCR 影像式答案 PDF（標 `answer_empty` 留遺留問題）
- 健體目錄整合

---

## 🧪 Bake-off 證據（2026-05-01）

執行 4 策略 × 6 樣本 = 24 份對比（細節見 `knowledge/3_考古題/_bakeoff_JOB226/_bakeoff_report.md`）。**任務本質：兩源 MD 合併 + 邏輯判斷 + 格式規範化，PDF→MD 轉檔已由先前 JOB 完成**（A 策略實測 70K Claude token/份，遠低於讀 PDF 的成本，證實 agent 實際只讀兩源 MD）：

| 策略 | 8 項驗收 | flag 完整度 | Claude Token | 結論 |
|:--|:--:|:--:|:--:|:--|
| A 純 Opus | 6/6 | 5.5 | 高（~422K，~70K/份） | 詳盡但主源判斷偏離 |
| **B 純 Codex** | **6/6** | **5.8** | **0**（Codex 企業額度免費） | **採用** |
| C Codex+Opus | 6/6 | 6.0 | 雙階段 ~75K/份 | 比 B 多花 Claude token，audit 微勝但邊際效益低 |
| D Codex+Sonnet | 6/6 | 5.8 | 雙階段 ~52K/份 | 比 B 多花 Claude token，品質與 B 並列 |

**結論修正（2026-05-02）**：採 **Strategy B（純 Codex 一階段整合）** 為全量整合主流程。理由：
1. **MD 已轉檔完成**：兩源 raw MD 已存在，任務本質是「兩 MD 合併 + 邏輯判斷 + 格式規範化」，不需 PDF 重抽
2. **B 已通過 v2 spec 8 項驗收**：6/6 全綠、flag 5.8/6.0、S1 廣興 109 regression 完美通過
3. **Claude token = 0**：Codex 企業額度免費，本 JOB 對 Claude 訂閱額度零消耗
4. **Phase 5b 精修按需開啟**：Phase 5 自動驗收 fail 的檔案，才送 Sonnet subagent 精修（預估 5-15% fail rate）

> 原派工單 v1（2026-05-01）採 C 雙階段為主流程，後經 bake-off 實測 + token 分析確認：B 已足夠且零成本，雙階段在「MD 已轉好」前提下是 redundancy。本版（v2，2026-05-02）改為 B 主 + 精修按需。

---

## 🔑 Canonical Template v3 紀律（v3 必讀，三下 5/5 PASS 實證）

整合 prompt 統一改用 `knowledge/3_考古題/_canonical_prompts/_integration_prompt.md`（v3）。**禁止 inline 改寫 prompt 內容**，要修一律修 canonical template。三下實作中發現以下三條規則若不寫死，codex_only 樣本必踩雷：

### 1. §6 題幹一致鐵則（codex_only 不得改寫題幹）
- 整合版 `## 試卷` 區段的題幹文字必須與 codex raw **逐字一致**（含括號、標點、分行）
- 禁止「美化潤飾」（例：把「下列何者」改成「下面哪一個」、把「（　）」改成「(  )」）
- 反例：codex_only 樣本若 LLM 重寫題幹，phase6 codex 抽樣會比對 raw 失敗（三下英語_翰林、英語_康軒、英語_何嘉仁三 combo 因此重整合 17 份才 PASS）

### 2. §7.1 答案區補述規則（**state-aware**，v3.1）
答案區段 `## 答案` 補述句必須依 `quality_flags` + state（dual / codex_only / claude_only）共同決定主詞：

| flag | state=dual | state=codex_only | state=claude_only |
|:--|:--|:--|:--|
| `answer_full` | （無補述）| 同左 | 同左 |
| `answer_partial` | 「以下小題未提供答案：…」 | 同左（主詞改「Codex 源答案 PDF」）| 同左（主詞改「Claude 源答案 PDF」）|
| `answer_empty` | 「兩源答案 PDF 為空，未提供作答」 | 「**Codex 源**答案 PDF 為空（本份無 Claude 源），未提供作答」 | 「**Claude 源**答案 PDF 為空（本份無 Codex 源），未提供作答」 |
| `answer_questions_only_no_marks` | 「答案 PDF 為試題副本…」 | 主詞改「Codex 源答案 PDF」+「本份無 Claude 源」 | 主詞改「Claude 源答案 PDF」+「本份無 Codex 源」 |

**鐵則**：state ∈ {`codex_only`, `claude_only`} 的檔案，整段不得用「兩源」字眼，須改寫為「本份僅 X 源」/「本份無 Y 源」。

### 2b. §7.2 來源追溯區段
state=codex_only 時 `Claude 源 MD：（無）`；state=claude_only 時 `Codex 源 MD：（無）`。整段禁用「兩源」字眼。

### 3. §7 codex_only state 處理
當 `pre_integration_pairing.state == "codex_only"`（Claude raw 對應檔不存在）：
- 整合版仍照 6 區段格式產出
- 試卷與答案 100% 來自 codex raw（題幹禁改，見 §6）
- `## 整合摘要` 註明「本份僅有 Codex source，採單源整合；題幹與答案均來自 codex raw 原檔」
- `quality_flags` 加 `codex_only`

> Master script 必須驗證 codex CLI 已用最新 canonical prompt（v3 SHA256 比對），避免抓到舊 cache。

---

## 🏗️ 執行策略：B 純 Codex 主流程 + 失敗檔精修

### 每份 logical exam group 流程

```
Step 1 (Codex CLI，強制 -m gpt-5.4，watchdog 1500s)：
  輸入：兩源 raw MD（Claude + Codex）+ canonical template v3（含 §6 題幹一致鐵則 + §7.1 答案區補述規則），不讀 PDF
  動作：依 v2 spec + v3 canonical template 整合 6 平行 H2 + frontmatter + quality_flags
  輸出：2_MD淬鍊文字_整合版/{學期}/{combo}/{filename}.md
  Claude Token: 0；Codex Token: ~150K/份（企業額度免費）

Step 2 (Phase 5 自動驗收：scripts/JOB226_validate_combo.py)：
  動作：8 項自動檢查（YAML / 6 區段 / frontmatter / OCR / 重複 / 題數 / sha256 / char_count）
  PASS → 進 Step 4
  FAIL → 進 Step 3

Step 3 (Sonnet subagent 精修，僅 fail 檔)：
  輸入：Codex 輸出 + 兩源 MD（驗證用）+ Phase 5 fail 報告
  動作：依 fail 項目針對性修正
  Claude Token: ~28K/份（推估 5-15% fail rate → 全 JOB ~3-15M Claude token）

Step 4 (Codex agent 抽樣，每 combo 3 份)：
  動作：人工視角驗收，回報通過/不通過
```

---

## 🏗️ 4 Phase 分階段（v3 — 含三下實證後重估）

| Phase | 範圍 | combo 數 | 實際/預估檔數 | Claude Token（精修） | Codex 純跑時間（PARALLEL=4 兩 combo 並行）|
|:--|:--|:--:|:--:|:--:|:--:|
| Phase A | 三下 全部 | **15 ✅** | **545（done）** | 已實際消耗 ~1.5M | 已執行完成 |
| Phase B | 四下 全部 | 15 | **577**（pre-pair 實算）| ~0.5-1.5M | ~11.5h（1.21 分/份 × 577）|
| Phase C | 五下 全部 | 15 | ~460 | ~0.5-1.5M | ~9.3h |
| Phase D | 六下 全部 | 15 | ~350 | ~0.3-1M | ~7h |
| **剩餘合計** | | **45** | **~1,387** | **~1.3-4M** | **~28h** |

> 三下實證：B 模式 PARALLEL=4 兩 combo 並行 = **1.21 分/份**，比原規劃 PARALLEL=3 單 combo（1.89 分/份）快 **1.56×**。四/五/六下沿用 PARALLEL=4 兩 combo 並行。
> Claude token 估值大幅下降：v3 canonical template 將 Phase 5b 精修 fail rate 壓到 < 5%（三下實測）。

### 並行配置（v3 強制規範）

```bash
# 啟動兩 combo 並行整合（每 combo 內 4 個 codex 並行 = 同時 8 個 codex 執行緒）
PARALLEL=4 bash scripts/JOB226_dispatch_combo.sh "{COMBO_A}"  > logs/A.log 2>&1 &
PARALLEL=4 bash scripts/JOB226_dispatch_combo.sh "{COMBO_B}"  > logs/B.log 2>&1 &
wait
```

### Watchdog 配置（v3 從 900s 改 1500s）

`scripts/JOB226_codex_watchdog.sh`：

```bash
TIMEOUT="${1:-1500}"   # v2 是 900；三下數學_翰林等大檔 codex rc=137 後改 1500
# 監聽 codex exec process，無進度 1500s 後 SIGKILL
```

> v2 用 900s，三下實作中發現「數學_翰林」等較大檔（>50K char raw）會被 watchdog 提前 kill（rc=137），改 1500s 後零誤殺。

### 每個 combo 內部執行步驟（v3）

1. **配對**（Phase 1）：`scripts/JOB226_pair_combo.py` 對齊兩源 `_index.json` → 產 `_pre_integration_pairing.json`
2. **Codex 並行 dispatch**（Phase 2）：每批 4 個 codex CLI（`-m gpt-5.4`，watchdog 1500s）並行整合，輸入只讀兩源 MD + canonical template v3
3. **整合落地**（Phase 3）：Codex 直接寫檔至 `2_MD淬鍊文字_整合版/{學期}/{combo}/{filename}`
4. **漏檔回掃**（Phase 3b，v3 新增）：dispatcher 結束後重跑 Phase 1 比對輸出 vs 配對清單，缺檔重 dispatch（防 F6 漏 1 份問題）
5. **產 `_index.json`**（Phase 4）：`scripts/JOB226_build_combo_index.py`
6. **自動驗收**（Phase 5）：`scripts/JOB226_validate_combo.py` 跑 8 項自動檢查；fail 檔列表進 Phase 5b
7. **精修按需**（Phase 5b，僅 fail 檔）：Sonnet subagent 針對 Phase 5 fail 項目修正，重跑 Phase 5 直至 PASS
7b. **單源檔字眼修補**（Phase 5c，v3.1 新增 — F8 對策）：`python3 scripts/JOB226_fix_single_source_phrasing.py --combo {COMBO}` 規則式替換 codex_only / claude_only 檔內誤用的「兩源」字眼為「Codex 源」/「Claude 源」+「本份無 Y 源」（不耗 codex token）
8. **Codex agent 抽樣**（Phase 6）：每 combo 抽 3 份（含 1 份 codex_only），**只對照兩源 MD**檢核，grep 範圍限縮 `## 試卷` / `## 答案` 段
9. **產 combo report**（Phase 7，v3 改用自動產生）：`python3 scripts/JOB226_generate_reports.py --combo {COMBO}`，從 `_index.json` + `_validation_report.json` + progress.json 抓 stats 自動寫 `_integration_report.md`，內容含規模統計、quality_flags 分布、Phase 5/6 結果、Token/時間紀錄
10. **更新 progress**（Phase 8）：寫入 `JOB-226-progress.json` 對應 combo 的 status/codex_sample_pass/integrated_count/last_attempt

### Progress 狀態判定（v3 明確化）

| status | 條件 |
|:--|:--|
| `pending` | 還沒啟動 |
| `in_progress` | Phase 1-7 任一階段執行中 |
| `done` | Phase 5 全綠 + Phase 6 PASS + `_integration_report.md` 已產生 |
| `partial` | Phase 5 全綠 + Phase 6 PASS，但 integrated_count < expected_count（有漏檔已記入 error_note 但暫不阻擋）|
| `failed` | Phase 5 fail 且 5b 也無法修復；或 Phase 6 連續 2 次抽樣 fail |

---

## 🛠️ 五元件架構（依 `docs/長時任務執行範本.md`）

### ① Progress State — `jobs/JOB-226-progress.json`
- 60 列，每 combo 1 列
- 欄位：`combo`、`semester`、`subject`、`publisher`、`expected_count`、`integrated_count`、`status`（pending/in_progress/done/partial/failed）、`last_attempt`、`error_note`、`codex_sample_pass`、`token_used`、`phase`
- 每個 subagent 完成立即寫入

### ② Worker — 雙層
- **內層**：codex CLI（`-m gpt-5.4`，Phase 2）— 處理 1 份 logical exam group，並行 3 份一批
- **內層備援**：claude-sonnet-4-6 subagent（Phase 5b）— 僅在 Phase 5 fail 時針對性精修
- **外層**：主對話迭代 combo → 每 combo 跑 Python 配對 + dispatch codex 並行 + Phase 5 驗收 + 失敗檔送 Sonnet
- per-task timeout：codex 單檔 ≤ 15min hard 超時

### ③ Dashboard — `scripts/JOB226_dashboard.py`
- 讀 `JOB-226-progress.json`
- 顯示：醒目時間戳 + 4 phase × 15 combo 矩陣 + 完成度% + 近 60min 增量 + 預估剩餘

### ④ Loop Wrapper — ScheduleWakeup 驅動（非 shell wrapper）
- 因為 worker 是主對話內 LLM dispatch，不是獨立 background process
- 改用 ScheduleWakeup 每 60 分鐘喚醒主對話 → 跑 dashboard → 接續下一 combo

### ⑤ Wakeup + Discord
- ScheduleWakeup 60min 一次
- Discord 每 phase 完成回報一次（4 次） + 全結案總結（1 次）
- 異常情況（fail rate > 5% / token 超預估 130%）即時 DM 取得處置

---

## 🤝 Codex Agent 抽樣機制（Phase 6）

每個 combo 整合完成後（Phase 5 / 5b 通過），主對話呼叫 codex CLI 抽樣：

```bash
bash scripts/JOB226_phase6_codex_sample.sh {COMBO}
```

> 注意：codex 預設 model 已切到 `gpt-5.5`（與 0.121.0 CLI 不相容易 hang），必須加 `-m gpt-5.4` 強制鎖定。

**抽樣涵蓋三類樣本**（v3 強制）：
- A 類：dual_source_merged + answer_full（最常見）
- B 類：dual_source_merged + answer_empty（驗答案區補述規則）
- C 類：codex_only / claude_only（驗 §6 題幹一致鐵則）— **每 combo 至少 1 份 C 類**

**Codex 回報通過** → 主對話進下一 combo
**Codex 回報不通過** → 主對話讀 log，依問題類型決定：
- 修補同 combo 失敗檔案（重 dispatch codex Phase 2 或 Sonnet Phase 5b）
- 卡點寫入 `error_note`，移到下一 combo（不阻擋整體進度）

**Codex 抽樣 prompt 模板**：`jobs/JOB-226-codex-sample-prompt.md`
**Codex 抽樣封裝腳本**：`scripts/JOB226_phase6_codex_sample.sh`

### Phase 6 grep 範圍規則（v3 — 三下假陽性教訓）

phase6 prompt 中所有 grep 檢查必須 **僅在 `## 試卷` / `## 答案` 區段內執行**，**排除 `## 整合摘要` 段**。

理由：`## 整合摘要` 會引用 raw 池中的 OCR 錯字與 mapping example（例：「將「哪 - 個」修正為「哪一個」」），若 grep 全文會命中此引用造成假陽性。三下數學_康軒因此 grep 命中後手動排除，浪費 30 分鐘。

具體規則寫進 `jobs/JOB-226-codex-sample-prompt.md`：
> 「OCR 紅旗檢查：僅在 `## 試卷` 與 `## 答案` 區段內 grep `哪 - 個|之-|-、是非|-、選擇`；`## 整合摘要` 段落允許作為 OCR mapping 範例引用，不視為 fail。」

### 已知失敗模式對照表（v3 — 三下實作累積）

| # | 失敗模式 | Root cause | 對策 |
|:--|:--|:--|:--|
| F1 | codex_only 樣本題幹被改寫 | LLM 自動「美化」題幹 | canonical template v3 §6 題幹一致鐵則寫死 |
| F2 | answer_empty 樣本答案區無說明 | prompt 沒明確規範補述 | canonical template v3 §7.1 必填補述表 |
| F3 | watchdog kill 大檔（rc=137） | timeout 900s 太短 | 改 1500s |
| F4 | grep 假陽性命中整合摘要 OCR mapping | grep 範圍未限縮 | grep 限制 `## 試卷` / `## 答案` 段 |
| F5 | master script `PASS$` 行尾錨點漏抓「PASS（註解）」 | regex 過嚴 | 改 `^PASS\\b` 或 `PASS[^A-Z]` |
| F6 | combo 在 dispatcher 結束後仍有 1 份漏整合 | dispatcher batch 邊界 race condition | dispatcher 結束後跑 `JOB226_pair_combo.py` 重新比對，找漏檔重 dispatch |
| F7 | 三下英語_康軒 phase5 fail：上學期試卷混入 | raw 學期分類 bug | JOB-227 已修；本 JOB Phase 0 加 audit 前置 |
| F8 | 單源檔（codex_only / claude_only）誤用「兩源」字眼，phase6 抽樣判 FAIL | canonical template v3 §7.1 補述句寫死「兩源答案 PDF 為空」沒考慮 state | template 升 v3.1 加 state-aware 補述句；新增 `JOB226_fix_single_source_phrasing.py` Phase 5c post-processor 規則式修補（不耗 codex） |

---

## 📖 執行步驟

### Phase 0：Pre-Flight（主對話一次性執行）
1. 確認 v3 spec、JOB-225 / JOB-227 教訓、canonical template v3 已讀
2. 建立 `2_MD淬鍊文字_整合版/` 標準輸出根目錄（已存在則 skip）
3. 建立基礎設施：
   - `jobs/JOB-226-progress.json`（60 列；三下 15 列已 done）
   - `jobs/JOB-226-codex-sample-prompt.md`（Codex 抽樣模板，v3 含 grep 範圍規則）
   - `scripts/JOB226_pair_combo.py`、`scripts/JOB226_build_combo_index.py`、`scripts/JOB226_validate_combo.py`、`scripts/JOB226_dashboard.py`、`scripts/JOB226_codex_watchdog.sh`、`scripts/JOB226_generate_reports.py`
4. 跑 dashboard 確認進度（三下 15/15 done，四/五/六下各 0/15 pending）

### Phase 0b：Raw 學期分類稽核前置（v3 新增 — JOB-227 結論導入）

啟動每學期 Phase 之前，必須先確認該學期 raw 池學期分類乾淨：

```bash
python3 scripts/JOB227_audit_and_move_all_semesters.py  # 已加白名單三下，可重跑安全
# 確認輸出：Claude/{學期}: 0、Codex/{學期}: 0
```

JOB-227 已在 2026-05-04 完成 4 學期 audit + 移檔（116 raw + 28 整合版到 `_misclassified/`），重 audit 已歸零。本 JOB 啟動四/五/六下前**重跑一次**確認沒有後續混入。**若有 misclassified > 0，立即停止並回報，不啟動整合**。

### Phase A：三下 15 combo（✅ 已完成 2026-05-04）

執行順序（從 dual 比例高、規模適中起步）：
1. 三下_社會_南一（原 JOB-225 範圍，重做覆蓋） ✅
2. 三下_社會_翰林 ✅、三下_社會_康軒 ✅
3. 三下_自然_翰林 ✅、三下_自然_南一 ✅、三下_自然_康軒 ✅
4. 三下_國語_南一 ✅、三下_國語_翰林 ✅、三下_國語_康軒 ✅
5. 三下_數學_翰林 ✅、三下_數學_康軒 ✅、三下_數學_南一 ✅
6. 三下_英語_翰林 ✅、三下_英語_康軒 ✅、三下_英語_何嘉仁 ✅

**最終結果**：15/15 done、545 份整合版、Phase 5 全綠率 100%、Phase 6 codex 抽樣 15/15 PASS。

### Phase A 累積經驗（v3 重要 — 影響 B/C/D 配置）

| # | 經驗 | 對 B/C/D 的影響 |
|:--|:--|:--|
| E1 | B 模式 PARALLEL=4 兩 combo 並行 = 1.21 分/份（vs PARALLEL=3 單 combo 1.89 分/份） | B/C/D 沿用 PARALLEL=4 兩 combo 並行配置 |
| E2 | codex_only 樣本若 inline prompt 無「題幹一致鐵則」必踩雷（英語 3 combo 重做 17 份） | canonical template v3 已寫死，B/C/D 必須引用 v3 |
| E3 | watchdog 900s 對大檔（>50K char）會誤殺 | timeout 改 1500s，B/C/D 沿用 |
| E4 | Phase 6 codex 抽樣 grep 全文會命中整合摘要的 OCR mapping 引用 → 假陽性 | grep 範圍限縮 `## 試卷` / `## 答案` 段 |
| E5 | dispatcher batch 邊界偶爾漏 1 份 | dispatcher 結束後跑 pair_combo.py 比對，找漏檔重 dispatch |
| E6 | raw 學期分類錯（英語_何嘉仁、英語_康軒 集中 75 份）導致 dual_source 錯配 | JOB-227 已全 4 學期清理；Phase 0b 啟動前 audit |
| E7 | 9 份 _integration_report.md 缺漏 | 改用 `JOB226_generate_reports.py` 自動產生，B/C/D 強制執行 |

### Phase B-D：四下 / 五下 / 六下（v3 配置）

依執行順序逐一推進。**啟動每學期前必跑 Phase 0b raw audit**。

**執行順序建議**（從規模較小、單源比例高的 combo 起步，漸進到大檔）：
1. 自然 / 社會（小檔，dual 比例中等）
2. 國語（中檔）
3. 數學 / 英語（大檔，codex_only 比例高，最考驗 v3 紀律）

**重要差異**：四/五/六下 Codex 數量是 Claude 的 2.3-2.8×（因 Claude 試卷+答案合一），所以 `codex_only` 比例會明顯高於三下。**v3 canonical template §6 + §7.1 是過關關鍵**。

### 結案
1. 產 `JOB-226-Report.md`（4 phase 統計 + 遺留問題）
2. `node scripts/job_manager.js close JOB-226`
3. `/pj_sync`
4. Discord 結案回報

---

## 📜 關鍵參考檔案（v3）

| 檔案路徑 | 用途 |
|:--|:--|
| `knowledge/3_考古題/README.md` | 考古題目錄結構與 SOP |
| `knowledge/3_考古題/README_雙來源MD整合作業準則.md` | **v2 spec，本 JOB 主規範（規範本身仍 v2，prompt 升 v3）** |
| `knowledge/3_考古題/_canonical_prompts/_integration_prompt.md` | **v3 canonical template，Step 1 主整合 prompt（取代 bakeoff template）** |
| `knowledge/3_考古題/_canonical_prompts/_methodology_record.md` | 整合方法論紀錄（含 §8.10 codex_only 修補實錄） |
| `jobs/JOB-225-Report.md` | pilot 結案報告（含教訓） |
| `jobs/JOB-227-Report.md` | raw 學期分類稽核教訓 + 全 4 學期清理紀錄 |
| `knowledge/3_考古題/_bakeoff_JOB226/_bakeoff_report.md` | 4 策略 bake-off 證據與決策依據（v1 → v2） |
| `docs/長時任務執行範本.md` | 五元件架構 |
| `docs/README_任務派工準則.md` | 派工生命週期 |

---

## ✅ 啟動 Checklist (Pre-Flight，v3)

- [ ] 已讀取：`knowledge/3_考古題/README.md`
- [ ] 已讀取：`knowledge/3_考古題/README_雙來源MD整合作業準則.md`（v2 spec）
- [ ] 已讀取：`knowledge/3_考古題/_canonical_prompts/_integration_prompt.md`（**canonical template v3**，含 §6 題幹一致鐵則 + §7.1 答案區補述規則）
- [ ] 已讀取：`knowledge/3_考古題/_canonical_prompts/_methodology_record.md`（含三下實作教訓 §8.10 codex_only 修補）
- [ ] 已讀取：`jobs/JOB-225-Report.md`（pilot 教訓）+ `jobs/JOB-227-Report.md`（raw 學期分類稽核教訓）
- [ ] 已讀取：`docs/長時任務執行範本.md`
- [ ] **已確認主流程模型**：codex CLI 0.121.0（`-m gpt-5.4` 強制鎖定，`model_reasoning_effort=high`，企業額度免費）
- [ ] **已確認備援精修模型**：claude-sonnet-4-6 subagent（僅 Phase 5b fail 檔）
- [ ] **已確認金鑰**：Claude Code subscription（精修按需），Codex CLI 企業額度
- [ ] **已確認並行配置**：PARALLEL=4 兩 combo 並行（共 8 codex execution threads），watchdog timeout 1500s
- [ ] 已建立基礎設施（progress.json / Python 腳本 / Codex prompt 模板 / canonical template v3 / `JOB226_generate_reports.py`）
- [ ] 已建立目標目錄 `2_MD淬鍊文字_整合版/`
- [ ] **已確認 Phase 0b raw audit 通過**：`python3 scripts/JOB227_audit_and_move_all_semesters.py` 對目標學期顯示 misclassified=0
- [ ] 取得使用者 LGTM 開始執行

## ✅ 驗收 Checklist (Acceptance)
> 每一項需提供佐證（指令輸出、檔案數、Codex 回報），不得僅靠自我判斷打勾。

### Per-combo 驗收（每 combo 完成時驗）
- [ ] **Phase 5 自動檢查 100% 通過**：8 項全綠（YAML / 6 區段 / frontmatter / OCR 紅旗 / 試卷無重複 / 題數保留 / sha256 / char_count）
- [ ] **題數保留**：raw 題號集合 ⊆ 整合版題號集合（hard fail）
- [ ] **quality_flags 標準化**：僅使用 11 個字典 flag
- [ ] **OCR 紅旗 0 hits**：grep `哪 - 個|之-|-、是非|-、選擇` 該 combo 範圍 = 0
- [ ] **Codex 抽樣 3 份通過**：log 顯示 PASS

### 全 JOB 驗收（結案時驗，v3 — 對齊三下實算 + Claude 合一檔）
- [ ] 60/60 combo 完成（status ∈ {done, partial}；partial 容許但需 error_note 說明漏檔原因）
- [ ] 整合版總檔數 ≥ **1,650 份**（容差 ±5%；三下 545 + 四五六下預估 ~1,280，總計 ~1,825 邏輯題卷數，容差 1,650-2,000）
- [ ] OCR 紅旗整體掃描 = 0（grep 限縮 `## 試卷` / `## 答案` 段）
- [ ] 4 phase 共 4 次 Discord 回報已送（Phase A 已送 2026-05-04）
- [ ] Codex 抽樣總計 ≥ 180 份通過（每 combo 3 份，含 1 份 codex_only）
- [ ] **status=failed 數量 = 0**（任何 failed 都需主對話修復後再結案）
- [ ] **status=partial 比例 ≤ 10%**（超過則進一步調查 dispatcher 漏檔 root cause）

## ✅ 成果 Checklist (Deliverables)
> 每一項需在 Report 中有對應的實際內容。

- [ ] `2_MD淬鍊文字_整合版/{三下,四下,五下,六下}/` 目錄結構齊全
- [ ] 60 個 `_index.json` 產出
- [ ] 60 個 `_integration_report.md` 產出（v3：以 `JOB226_generate_reports.py` 自動產生）
- [ ] `jobs/JOB-226-progress.json`（最終 status ∈ {done, partial} 數 = 60；done ≥ 54，partial ≤ 6）
- [ ] `scripts/JOB226_*.py` + `JOB226_codex_watchdog.sh` + `JOB226_dispatch_combo.sh` 完整
- [ ] `knowledge/3_考古題/_canonical_prompts/_integration_prompt.md`（v3）已 freeze（SHA256 鎖定）
- [ ] `jobs/JOB-226-codex-sample-prompt.md` 存在（v3 含 grep 範圍規則）
- [ ] `jobs/JOB-226-Report.md`（總結報告，含 4 phase 統計、F1-F7 失敗模式發生次數、累積經驗）
- [ ] `node scripts/job_manager.js close JOB-226`
- [ ] `/pj_sync` 完成
- [ ] Discord 結案回報（chat_id=1487738477608177714）

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:{訂閱額度} | 花費: $- | 使用模型: codex CLI gpt-5.4（主流程，免費）+ claude-sonnet-4-6（Phase 5b 精修按需）+ codex CLI gpt-5.4（Phase 6 抽樣）| 執行者: Codex (主整合+抽樣) + Claude (PM+orchestration+精修)

---

## 🚦 遺留問題追蹤（執行中持續更新）

預期遺留：
1. 影像式答案 PDF 仍待 OCR（v2 spec §一答案處理已涵蓋，標 `answer_empty`）
2. 部分 combo 兩源皆空（`extract_failed`）需後續重抽取
3. 圖像題（連連看 / 圖表辨識）僅保留題幹
4. JOB-225 三下_社會_南一 24 份已被本 JOB 重做覆蓋（含廣興 109 漏 4 題修正）✅
5. raw 池中 ambiguous（4 學期合計 ~87 份）+ unknown（~306 份）— JOB-227 列為遺留，本 JOB 不處理
6. raw pipeline 「上學期試卷誤入下學期 combo」根因（英語_何嘉仁 + 英語_康軒 集中）— JOB-227 §7.6 列為遺留，建議獨立 JOB 處理
7. claude raw 在四/五/六下檔數較少（合一檔設計，不是缺漏） — 已釐清，不處理
