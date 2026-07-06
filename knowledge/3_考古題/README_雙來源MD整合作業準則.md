# Spec：考古題雙來源 MD 整合作業準則 v2

`last_updated`: 2026-05-01 14:40
`updated_by`: Claude Code (claude-opus-4-7)
`version`: 2.0.0
`status`: Accepted（**取代 v1，作為未來新批次的主規範**）
`supersedes`: `knowledge/3_考古題/README_雙來源MD轉檔與整合規格.md`（v1，由 Codex 於 JOB-224 撰寫）

---

## 文件定位

未來 Agent 執行考古題雙源 MD 整合（將 `2_MD淬鍊文字_Claude/` + `2_MD淬鍊文字_Codex/` 兩源整合為單一高品質版本）時的**唯一執行依據**。

**讀完本檔即可執行整合**：包含格式、方法、紀律、subagent prompt 範本、驗收條件、常見陷阱。

## v2 與 v1 的差異（重要變更）

v1 反映的是 Codex 整合版的設計觀點。**JOB-225 評估**（`jobs/JOB-225-Eval-整合版比較.md`）證明 Claude 整合版在「人的可讀性」「機讀一致性」「可下游使用」三項全面勝出。本 v2 採納 Claude 整合版的格式設計，並補強 v1 缺漏。

| 項目 | v1（Codex 觀點） | v2（採用） |
|:--|:--|:--|
| 6 區段命名 | `## 整合摘要 / ## 最佳化正文（包 ### 試卷+### 答案）/ ## 來源追溯 / ## 跨來源取捨 / ## 整合判斷` | **改為 6 個平行 H2**：`## 整合摘要 / ## 主題命中分析 / ## 試卷 / ## 答案 / ## 來源追溯 / ## 整合判斷` |
| 試卷區字符 | 直接 copy raw（保留 OCR 斷字） | **必須清洗**：修字符、去 alias 重複、矯正雙欄 |
| frontmatter | 缺 `exam_id` / `char_count` | **必填**：含 `exam_id` 與 `char_count` 直接欄位 |
| topic_hits | 無 | **保留 Claude raw 的主題命中表** |
| quality_flags | Codex 內部狀態描述（`codex_paper_empty`） | **標準字典 11 個 flag**（描述整合產物狀態，不是來源狀態） |
| 完整度紀律 | 未明示 | **「不主動丟題」鐵則**（JOB-225 廣興 109 漏 4 題教訓） |
| 執行方式 | Python 腳本（規則式） | **subagent 平行 dispatch（LLM 智慧整合）+ 規則式驗收** |

## 適用範圍

**Always 適用**：
- `knowledge/3_考古題/2_MD淬鍊文字_整合版/`（標準輸出根目錄）
- 將 `2_MD淬鍊文字_Claude/` + `2_MD淬鍊文字_Codex/` 整合為單一版

**不適用**：
- `knowledge/3_考古題/健體/`
- 題庫 JSON 出題流程（`question/`）
- 課綱研究 KL3/KL4 內容本體（`knowledge/1_課綱研究/`）

---

## 一、整合策略原則

### 主源選擇

按以下優先序（每個 logical exam group 獨立判定）：

| 兩源狀態 | 主源 | quality_flag |
|:--|:--|:--|
| 兩源都有實質內容 | 試卷區較完整者（通常 Claude，因 docling 保留結構）；雙欄交錯嚴重時可採 Codex | `dual_source_merged` + `claude_primary` 或 `codex_primary` |
| 僅 Claude 有內容 | Claude | `claude_only` |
| 僅 Codex 有內容 | Codex | `codex_only` |
| 兩源皆空 | 標 `extract_failed`，記入遺留問題 | `extract_failed` |

### 答案處理

按 v1 的 5 種狀態（保留）：

| answer_status | 觸發條件 | 整合版正文做法 |
|:--|:--|:--|
| `available` | 有明確答案鍵（如 `( O ) 2`、`①ˇ`、`1.③`、答案表格） | 保留答案內容 |
| `partial_answer` | 部分題型有答案，部分無 | 保留有的部分，註明缺哪些 |
| `source_without_key` | 答案檔有內容但無作答符號（疑似試題重排） | 寫明「答案 PDF 為試題副本，無作答符號」 |
| `ambiguous_answer_source` | 答案內容混雜，無法穩定辨識 | 寫明原因，不硬塞 |
| `missing_answer` | 答案 PDF 為影像式或抽取失敗 | 寫「答案 PDF 為影像式，待 OCR」 |

---

## 二、格式規範（強制）

### 2.1 Canonical Final MD Format（6 個平行 H2 區段）

```yaml
---
# (frontmatter 詳見 §2.2)
---

# 三下 社會 南一｜大園國小 108 學年度 第三次段考    <- H1 主標題

## 整合摘要                                       <- 區段 1
（一段話：試卷狀態、答案狀態、整合處理摘要）

## 主題命中分析                                   <- 區段 2
| 主題類別 | 命中次數 | 涉及關鍵字 |
|:--|:--:|:--|
| ... | ... | ... |
（從 Claude raw frontmatter.topic_hits 複製；若無則寫「（兩源皆未提供）」）

## 試卷                                          <- 區段 3
（清洗後正文）

## 答案                                          <- 區段 4
（清洗後正文 / 缺漏說明）

## 來源追溯                                      <- 區段 5
- 試卷 PDF：`knowledge/3_考古題/1_原始檔/{學期}/{combo}/{filename}.pdf`
- 答案 PDF：`knowledge/3_考古題/1_原始檔/{學期}/{combo}/{filename}.pdf`

## 整合判斷                                      <- 區段 6
- 完整度：完整 / 試卷完整答案缺 / 殘缺
- 可信度：高 / 中 / 低 + 原因
- 注意事項：（給後續 Agent 的提醒）
```

**所有 6 個區段必須以 H2（`##`）出現，順序固定，缺一不可。**

### 2.2 Frontmatter 必填欄位（YAML schema）

```yaml
publisher: 南一                                  # 出版社
academic_year: 108                               # 學年度（int 或 string）
source_school: 大園國小                          # 學校
exam_type: 第三次段考                            # 考次（第一/二/三次段考、期中考、期末考）
semester: 三下                                   # 學期
subject: 社會                                    # 科目
combo: 三下_社會_南一                            # 組合 ID
exam_id: 南一_108_大園國小_第三次段考            # logical exam group 唯一識別
integration:                                     # 整合資訊（巢狀）
  method: "Claude PM 規則 + Claude Code 整合"     # 必填
  llm_model: "claude-opus-4-7"                   # 必填
  integrated_date: 2026-05-01                    # 必填（ISO date）
  sources:                                       # 必填，至少 1 筆
    - agent: claude
      char_count: 5598
      tool: docling
    - agent: codex
      char_count: 1874
      tool: pdfplumber
quality_flags:                                   # 必填（從 §2.3 標準字典中選）
  - paper_full
  - answer_empty
  - ocr_corrected
  - dual_source_merged
  - claude_primary
topic_hits:                                      # 主題命中（從 Claude raw 複製，無則 {}）
  社區營造: 24
  公民服務: 18
char_count: 2918                                 # 整合版正文非空白字數（重算，非沿用）
source_pdfs:                                     # 必填，至少 1 筆，含 sha256
  - filename: 南一_108_大園國小_第三次段考_試卷.pdf
    kind: 試卷                                   # 試卷 / 答案
    sha256: 9a563f5460b021330f013b6f2faf343b5104894eaf70c66ecb36f9ee737764a8
    aliases:
      - 縣立大園國小 三年級 108 下學期 社會領域 社會 第三次段考 期末考 南一 試卷.pdf
  - filename: 南一_108_大園國小_第三次段考_答案.pdf
    kind: 答案
    sha256: 371366cb72cbf9d423f86de9050d939c01db98cd0fce2aca6c866a1b2df38b8a
    aliases: []
```

**必填驗證**：所有頂層欄位（含 `integration` 子欄位 method/llm_model/integrated_date/sources）皆不可空。`quality_flags` 與 `source_pdfs` 必須非空陣列。

### 2.3 quality_flags 標準字典（11 個，禁止變體）

| flag | 觸發條件 | 互斥組 |
|:--|:--|:--|
| `paper_full` | 試卷正文有實質內容（>500 非空白字） | A |
| `paper_partial` | 試卷正文殘缺（如僅有部分大題） | A |
| `paper_empty` | 試卷兩源皆抽取失敗 | A |
| `answer_full` | 答案區有完整作答符號（如答案表格） | B |
| `answer_partial` | 部分題型有答案 | B |
| `answer_empty` | 答案兩源皆空（影像式 PDF） | B |
| `answer_questions_only_no_marks` | 答案檔有內容但無作答符號（試題重排） | B |
| `dual_source_merged` | 兩源都有實質內容，已合併 | C |
| `claude_only` | 僅 Claude 有實質內容 | C |
| `codex_only` | 僅 Codex 有實質內容 | C |
| `claude_primary` / `codex_primary` | 雙源都有時，標明主源 | D（與 dual_source_merged 並用） |
| `ocr_corrected` | 修正了 OCR 字符斷裂（任意處） | E |
| `columns_reordered` | 矯正了雙欄交錯題號 | F |
| `alias_dedup` | 去除了 alias 重複輸出（**唯一命名**，禁用 `claude_alias_dedup`、`claude_alias_duplicate_removed` 等變體） | G |
| `extract_failed` | 兩源皆無內容 | H |

**互斥組規則**：A、B、C 三組各擇一；D-H 視實際情況加標。

---

## 三、內容清洗 SOP（強制，不可跳過）

### 3.1 OCR 字符修正 mapping

Claude 源 docling 抽取常見字符斷裂，必修：

| 錯誤模式 | 正確 | 出處（典型） |
|:--|:--|:--|
| `哪 - 個` / `哪-個` | 哪一個 | 雙欄 PDF 邊界字元 |
| `哪 - 種` / `哪-種` | 哪一種 | 同上 |
| `哪 - 項` / `哪-項` | 哪一項 | 同上 |
| `之-` | 之一 | 同上 |
| `-、是非題` | 一、是非題 | 大題標題首字 |
| `-、選擇題` | 一、選擇題 | 同上 |
| `不 同` | 不同 | 字之間多餘空格 |
| `了 解` | 了解 | 同上 |
| `怎 麼` | 怎麼 | 同上 |
| `鄉 村` | 鄉村 | 同上 |
| `都 市` | 都市 | 同上 |
| `不 完善` / `不 發達` | 不完善 / 不發達 | 同上 |
| `美 濃` / `閒 置` | 美濃 / 閒置 | 同上 |
| `為 鄉` / `應 對` | 為鄉 / 應對 | 同上 |
| 其他「單字 + 空格 + 單字」中文片段 | 回攏 | docling 字元邊界 |

**規則**：subagent 拿到兩源後，先對 Claude 源試卷區跑這個 mapping。

### 3.2 alias 重複輸出去除

Claude raw 的特徵：同一份 PDF（同 sha256）若有多個檔名 alias，會被輸出多次。

**判定**：search 整份檔案，若同一段試卷大題標題（如 `## 一、是非題`）出現 ≥ 2 次 → 是 alias 重複。

**處理**：保留**第一份**，刪除後續重複；在 `aliases[]` 中保留所有檔名供追溯。

### 3.3 雙欄交錯重排

Codex pdfplumber 對雙欄 PDF 有題號錯亂，如：
```
( )1. 題目 A
( )3. 題目 B    <- 應為左欄第 2 題
( )2. 題目 C    <- 應為右欄第 1 題
```

**處理**：依題號 1, 2, 3... 重排。重排後標 `columns_reordered`。

### 3.4 雜訊清除

| 雜訊 | 處理 |
|:--|:--|
| 空 code fence（` ``` ` 直接接 ` ``` `） | 刪除 |
| `<!-- image -->` 純佔位區塊 | 刪除 |
| `[EMPTY_EXTRACT]` / `[EXTRACT_ERROR]` | 刪除（僅出現於試卷/答案區的話） |
| LaTeX 殘片（`$\_{...}$`、`$_{裡：}$`） | 刪除佔位、保留文字 |
| 翻頁提示（`【背面還有試題】`） | 刪除 |

---

## 四、完整度保護鐵則（從 JOB-225 學到的教訓）

### 鐵則 1：不主動丟題

**❌ 錯誤行為**（JOB-225 廣興 109 第一次案例）：
- raw 標頭「是非題：每題 1 分，共 25 分」
- raw 實際列出 29 題（題號 1-29）
- LLM 為了「符合 25 分標頭」主動刪除 4 題（21、26、27、28）

**✅ 正確行為**：
- 保留 raw 列出的所有題目
- 在「整合判斷」區註明「raw 標頭 25 分但實列 29 題，已全保留供下游核實」
- **寧可保留疑似題（標 `paper_partial` + 註解），不主動丟題**

### 鐵則 2：拼接還原 vs 幻覺生成的界線

**✅ 合理拼接還原**（不算幻覺）：
- raw 因雙欄/換行斷字（如「以物易物是古時候人們的」+ 另一行/欄「交易方式」）
- LLM 把斷字拼接回完整原句

**❌ 幻覺生成**（必須避免）：
- 兩源 raw 都完全沒有的字串、題目、選項
- 從上下文「猜出」的內容
- 「補完」原本就缺漏的選項或答案

### 鐵則 3：圖像題不腦補

| 場景 | 處理 |
|:--|:--|
| 圖表題、連連看、配對題 | 保留題目敘述，圖片內容寫「（圖像題，原檔為示意圖無文字內容）」 |
| 只有部分選項是文字、其他是圖 | 文字部分保留，圖片部分標「（圖示）」 |
| 連連看左右對應 | 文字側保留，配對關係若 raw 沒明示 → 標「待人工核對」 |

### 鐵則 4：題數保留檢查

整合完成後，subagent 自我檢查：
- raw（兩源任一較完整者）的「( )N. 」題號集合
- 整合版的「( )N. 」題號集合
- 兩集合差集 → 應為空，否則回頭修正

---

## 五、執行流程 SOP

### Phase 0：Pre-Flight（必做）

1. 讀本檔（v2）
2. 讀 `knowledge/3_考古題/README.md`
3. 確認兩源目錄存在 + `_index.json` 對齊
4. 確認標準輸出根目錄 `2_MD淬鍊文字_整合版/{學期}/{combo}/` 為空或可覆蓋

### Phase 1：盤點配對

```python
# 對齊 logical exam group
# 兩源 _index.json 比對 filename 集合
# 對 dual / claude_only / codex_only 分類
```

產出 `_pre_integration_pairing.json`：含每份 logical exam group 的兩源狀態。

### Phase 2：subagent 平行 dispatch（推薦執行方式）

採 dispatching-parallel-agents 機制：
- 每份 logical exam group 一個 subagent
- 每批 5 份平行（避免 rate limit）
- 主對話僅做編排與驗收

**subagent prompt 模板**：見 §六。

### Phase 3：整合落地

每份 subagent 完成後，將整合 .md 寫入 `2_MD淬鍊文字_整合版/{學期}/{combo}/{filename}.md`。

### Phase 4：產出 _index.json

```python
# 解析每份整合版 frontmatter
# 統計 quality_flag 分布
# 列 source_pdfs 對應原始 PDF
```

### Phase 5：自動驗收

跑以下批量檢查（**必須 100% 通過**）：

```python
# 檢查 1: YAML 解析
# 檢查 2: 6 區段齊全
# 檢查 3: frontmatter 必填欄位齊全（含 integration 子欄位）
# 檢查 4: OCR 紅旗 grep（試卷區應 0 hits）
# 檢查 5: 試卷無重複（同 ## 大題標題出現 ≤ 1 次）
# 檢查 6: 題數保留（raw 題號集合 ⊆ 整合版題號集合）
# 檢查 7: source_pdfs[] 與原始檔 sha256 對得上
# 檢查 8: char_count = 實算 body 非空白字數
```

### Phase 6：人工抽樣

每批至少抽 3 類各 1 份（≥ 3 份）：
- 1 份「dual + answer_full」
- 1 份「dual + answer_empty」
- 1 份「claude_only / codex_only」

對照原始 PDF 或最完整 raw md，確認：
- 試卷題目無漏（題號完整）
- 字符乾淨無 OCR 斷字
- 答案處理正確（available 必有作答符號、empty 必有缺漏說明）

若批次 > 50 份：每類至少抽 3 份。

### Phase 7：產 Report

每批落地後，產出 `_integration_report.md`，含：
- 統計（quality_flag 分布、答案狀態）
- 高風險清單（需人工複查的檔案）
- Token 與成本紀錄

---

## 六、Subagent Prompt 範本（標準）

> 將下列模板存於 `scripts/JOB{NNN}_subagent_prompt_template.md`，每次 dispatch 時動態替換變數。

```
你是 Eidos 專案 JOB-{NNN} 的雙源 MD 整合 subagent。請先 Read 本檔取得方法論：
`knowledge/3_考古題/README_雙來源MD整合作業準則-v2.md`

## 本次任務（一份 logical exam group）

- exam_id: {{exam_id}}
- 兩源檔案：
  - Claude 源：`knowledge/3_考古題/2_MD淬鍊文字_Claude/{學期}/{combo}/{filename}`
  - Codex 源：`knowledge/3_考古題/2_MD淬鍊文字_Codex/{學期}/{combo}/{filename}`

## 已知狀態（pre-integration metadata）

- Claude char_count: {{c_chars}}
- Codex char_count: {{x_chars}}
- 兩源狀態: {{dual / claude_only / codex_only / both_empty}}

## 工作流程

1. Read 兩源檔案
2. 分析（按 §三 SOP）
3. 清洗（OCR 字符 mapping、去 alias 重複、矯正雙欄、雜訊清除）
4. 套用「完整度保護鐵則」（§四）：**不主動丟題**、不腦補圖像題
5. 重算 char_count
6. 寫成 6 區段平行 H2 格式（§2.1）
7. 落地至 `knowledge/3_考古題/2_MD淬鍊文字_整合版/{學期}/{combo}/{filename}`

## 輸出要求

- 嚴格遵守 frontmatter schema（§2.2 必填欄位）
- quality_flags 從標準字典 11 個中選（§2.3，禁止變體）
- 6 區段平行 H2，順序固定

## 紀律（不可違反）

- 不憑空生成 raw 沒有的內容（§四鐵則 2）
- 不主動丟 raw 列出的題目（§四鐵則 1）
- 圖像題不腦補（§四鐵則 3）
- quality_flags 命名遵守標準字典

## 完成回報（≤200 字）

1. 寫檔路徑
2. 最終 char_count
3. quality_flags
4. 主源（claude / codex / dual）
5. 修正動作摘要：字符 N 處、去重 N 次、雙欄重排 N 題
```

---

## 七、Token 與成本估算

依 JOB-225 pilot 實測：
- 24 份 dual_source_merged subagent 平均 53,000 tokens/份
- 全量擴展約 60 combo × 平均 30 份 ≈ 1800 份 → 約 95M tokens（Claude Code 訂閱額度）

**規劃建議**：
- 一次跑 1 個 combo（24-50 份），分批 5 份平行
- 每完成 1 個 combo 暫停人工抽樣再進下一批
- 訂閱額度估算：每 10 個 combo 約 16M tokens

---

## 八、常見陷阱與案例（JOB-225 真實案例）

### 案例 1：標頭與題數不符（廣興 109 第一次）

- raw 標頭「是非題：共 25 分」
- raw 實列 29 題
- ❌ Claude LLM 主動丟 4 題重編為 1-25
- ✅ 正確做法：保留 29 題，標 `paper_partial`，整合判斷區註明「標頭 25 分與實列 29 題不符，全保留待原 PDF 核實」

### 案例 2：合理拼接還原（大園 109 第二次）

- Claude raw：「以物易物是古時候人們的」（斷尾）
- Codex raw：「交易方式」分散在另一欄
- ✅ Claude 整合版拼接為「以物易物是古時候人們的交易方式」 — **不是幻覺，是合理還原**

### 案例 3：quality_flags 命名變體（24 份統計）

JOB-225 中發現 13 種 flag 變體：
- `claude_alias_dedup` / `alias_dedup` / `claude_alias_duplicate_removed` 三者語意相同
- ✅ v2 規定：統一用 `alias_dedup`，禁用變體

### 案例 4：答案 PDF 是試題重排（田中 108 第一次）

- 答案 docx 內容是試題重複貼一遍，無作答符號
- ❌ subagent 標 `answer_full` 是錯的
- ✅ 正確：標 `answer_questions_only_no_marks`，整合判斷區註明

---

## 九、Boundaries

### Always

- 同時讀 Claude + Codex 兩源
- 保留 source_files 與 sha256
- 標明 answer_status / quality_flags
- 產出 _integration_report.md
- 高風險樣本人工抽查

### Ask First

- 覆蓋既有正式整合版
- 修改正式輸出根目錄命名
- 改動本 spec（必須 docs_ops job_type 派工）
- 將 `source_without_key` 改判 `available`

### Never

- 不留 `[EMPTY_EXTRACT]` / `[EXTRACT_ERROR]` 在 final 正文
- 不憑空補答案、補題目、補選項
- 不主動丟 raw 列出的題目
- 不刪除原始來源檔
- 不省略 6 個區段任一個
- 不使用 quality_flags 字典外的變體名稱

---

## 十、Success Criteria（批次完成的 DoD）

100% 通過 §五 Phase 5 的 8 項自動檢查 + Phase 6 的人工抽樣達標 + 產出完整 `_integration_report.md`。

---

## 十一、Open Questions（待後續決議）

1. 是否將「題數保留檢查」（§五 Phase 5 檢查 6）改為 hard fail（任一漏題就阻擋落地）？
2. 是否在 quality_flags 加入 `paper_extra_questions`（raw 列出的題數多於標頭分數時使用）？
3. 是否在 `_integration_report.md` 固定附「漏題候選人工複核名單」？
4. 全量擴展時是否要記錄每份的「整合處理時間」供效能分析？

---

## 附錄 A：執行命令範例

### 標準批次（推薦：subagent 平行）

```bash
# Phase 0-1: 盤點
node scripts/job_manager.js next  # 取 JOB 編號
# 在派工單中填寫整合範圍（如：四下_自然_翰林）

# Phase 2-3: subagent 平行（在 Claude Code session 內執行）
# 主對話派 5 個 subagent 平行處理 5 份檔案

# Phase 4: 產 _index.json
python3 scripts/JOB{NNN}_build_index.py --combo 四下_自然_翰林

# Phase 5-7: 自動驗收 + 人工抽樣 + Report
python3 scripts/JOB{NNN}_validate.py --combo 四下_自然_翰林
```

### 規則式整合（v1 沿用，作為 fallback）

```bash
# 若 LLM 整合不可用時
python3.11 scripts/JOB224_integrate_pilot.py \
  --stage all \
  --sub 四下 \
  --combo 四下_自然_翰林 \
  --output-root-name 2_MD淬鍊文字_整合版
```

---

## 附錄 B：本 spec 與 JOB-225 的關係

- JOB-225（已結案）：pilot 三下_社會_南一 24 份，驗證了 LLM subagent 平行整合的方法論
- JOB-225-Eval（已產出）：對比 Claude 整合版 vs Codex 整合版（v1 spec 的產物），發現 v1 缺漏
- 本 v2 spec：吸收 JOB-225 經驗，作為**未來新批次的標準依據**

未來執行整合任務的 Agent，**只需讀本 v2 即可**，不需另外讀 JOB-225 報告。
