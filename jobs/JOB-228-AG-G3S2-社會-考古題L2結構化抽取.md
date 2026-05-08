*Created by Claude Code at 2026-05-04*

`last_updated`: 2026-05-04
`updated_by`: Claude Code (claude-opus-4-7)

# JOB-228-AG-G3S2-社會-考古題L2結構化抽取

**`job_type`**：`research`(從考古題文本反推教學重點與課綱對應,不產題、不修題庫)
**`executor`**：Codex CLI (gpt-5.4) 主跑 + Claude Code (claude-opus-4-7) 同步檢核
**`parent_jobs`**：JOB-222(108 課綱地基)、JOB-226(雙源 MD 整合)
**`pilot_only`**：是 — 本 JOB 為「五科 L2 結構化抽取」的試水,先做三下_社會 1 科 116 份;國語/自然/數學/英語另行開單

---

## 📌 任務背景(白話版)

我們要從考古題反過來看:「老師到底在教什麼、學生到底卡在哪、這些題目對應到 108 課綱哪一條」。
這個動作叫做 **L2 結構化抽取**,是 KL2(科目共通)→ KL3(年級特性)→ KL4(單課重點)三層架構的**編碼樞紐**。

目前狀態:
- ✅ 三下_社會 116 份考古題(翰林 32 + 康軒 60 + 南一 24,扣除 _integration_report.md)已轉成乾淨 MD(JOB-226 整合版,6 區段標準格式)
- ✅ 108 課綱社會領綱已抽好結構化編碼(JOB-222 Phase E:第 Ⅱ 學習階段共 35 條合法編碼)
- ❌ 但**考古題與課綱編碼還沒串連**,現在拿到一份題目沒辦法回答「這題在考哪個課綱目標」

為什麼 PM(Claude)不自己做?
- 116 份是大量重複性工作,Codex 的 throughput 與專注力比 PM 多任務切換來得高
- PM 需要保留 context 做「同步檢核 + 黃金樣本維護 + 跨任務協調」

為什麼這次先做 1 科試水?
- JOB-221 PM 亂推 12 條編碼 0/12 命中的教訓:**沒有黃金樣本與合法清單時,LLM 編碼反查會跑偏**
- 試水目的:驗證 (a) 規則式抽題對 6 區段 MD 是否可行、(b) Codex 端編碼反查的合法率、(c) 黃金樣本與 schema v1.0 是否需要修正
- 試水通過 → 國語/自然/數學/英語複製管線
- 試水失敗 → 派工單與 schema 檢討重做

---

## 🗺️ 一句話說明

把 116 份社會考古題,從「人讀的試卷」變成「電腦能查的題目資料庫」,
每題標上 108 課綱對應的編碼,讓後續 KL2/KL3/KL4 設計者能反查
「老師到底在教什麼、學生卡在哪、考過幾次」。

---

## 🚶 七步驟流程白話版(讀派工單先讀這節)

想像我們是要做一張「考古題索引卡片」,每張卡片寫:
- 題目是什麼
- 在問哪個課綱觀念(108 課綱社會編碼,例如 `Aa-Ⅱ-1` 個人在家庭的角色)
- 學生為什麼容易錯
- 考的是哪種能力(記憶 / 理解 / 應用 / 分析 / 評鑑 / 創造)

### 七個步驟

| 步驟 | 做什麼 | 誰做 | 比喻 |
|:--:|:--|:--|:--|
| **A0** | 列出「社會三下能用的 35 個課綱編碼」清單 | Claude(Python 腳本) | 先列**菜單**才能點菜 |
| **A1** | 把每份試卷拆成一題一題(題目+選項+答案) | Codex 寫腳本本地跑 | 把試卷**切成一張張小卡** |
| **A2** | 每題從 35 個編碼裡挑 1-3 個最相關的標上去 | Codex 跑(LLM 理解題意) | 給每張卡**貼分類標籤** |
| **B** | 檢查 Codex 沒有亂編編碼、沒挑錯階段 | Claude(Python 腳本) | **海關檢查**有沒有夾帶違禁品 |
| **C** | 翰林/康軒/南一 各做一份「重視哪些編碼」統計 | Codex 寫 MD | 各班級的**期末成績單** |
| **D** | 三版本一起比,看誰重視什麼、誰漏了什麼 | Codex 寫 MD | 三班**評比大會** |
| **E** | Codex 自查 + Claude 抽閱 | Codex 自查、Claude `/code-review` | **出貨前最後一道檢驗** |

### 兩個特別點(防 JOB-221 覆轍)

1. **試刀(Pilot)**:正式跑 116 份前,先由 Claude 親手做 2 份「黃金樣本」(翰林_108_文德 dual_source + 康軒_111_新北安和 codex_only)給使用者人工確認,再派 Codex 試跑 5 份對照,通過才放全量
2. **每階段檢核**:每個 Phase 結束 Claude 都要抽樣比對(數量 / 編碼合法 / reason 不空泛),不能讓 Codex 一條龍跑完無人看

### 為什麼分這麼細?

- **A0/B 用本地腳本不用 LLM**:這兩段是規則式工作(列清單、檢查違規),用 Python 跑零成本、可重現、不會漂
- **A1 也用腳本不用 LLM**:題號、選項符號(①②③④)是固定格式,規則就能抽,動 LLM 反而不穩
- **A2/C/D 才動 LLM**:這幾段需要理解題目意思、寫總結文,才是 LLM 的舒適區
- **檢核責任不能跟執行者重疊**:做事的(Codex)不能驗自己(Claude),驗的人(Claude)不能做事
- **116 份分批不一次跑**:先 2(黃金 dual + codex_only)→ 5(Pilot)→ 116(全量,分翰林 32 / 康軒 60 / 南一 24 三批),任何一關不過就停

讀完這節就懂大方向。下面是執行細節。

---

## 🎯 任務目標(具體、可驗證)

完成後要達到的狀態:

| # | 目標 | 驗證方式 |
|:--:|:--|:--|
| 1 | 最多 116 份題目級 JSON(翰林 32 / 康軒 60 / 南一 24 為理論上限);扣除 paper_empty / extract_failed 後實際產出 N 份(N ≤ 116);被跳過清單記錄至 `_L2_quality_report.json.skipped_files[]` | `產出 JSON 數 + skipped_files.length` = 116;且每份被跳過都有理由 |
| 2 | 每份 JSON 通過 schema v1.0 驗證 | `python scripts/jobs/JOB-228/B_validate_codes.py` 報 0 violation |
| 3 | 每題 codes_candidate 100% 在合法清單內 | 同上腳本驗 codes 屬於 35 條第 Ⅱ 階段編碼 |
| 4 | 黃金樣本 2 份(dual_source + codex_only)由 Claude 親手做、使用者人工確認 | `_golden_samples/翰林_108_文德國小_第二次段考.json` + `_golden_samples/康軒_111_新北安和國小_期中考.json` 存在且使用者簽核 |
| 5 | Pilot 5 份對照黃金樣本,schema 一致、欄位齊全、編碼合法率 ≥ 95% | Pilot 比對報告 PASS |
| 6 | 三版本各 1 份 `_L2_summary.md` 彙整 | 3 份 MD 存在且涵蓋編碼分布、命中率、低信心題清單 |
| 7 | 1 份 `三下_社會_L2_整合.md` 跨版本對比 | 該 MD 存在且涵蓋三版本編碼覆蓋率對比 |
| 8 | 自我品質報告 `_L2_quality_report.json` | 含 schema 違規數、低信心題比例、抽樣對照結果 |

---

## 🚧 任務邊界

### 本次任務只做
- 三下_社會 116 份(翰林 32 + 康軒 60 + 南一 24,扣除 _integration_report.md)
- 從 `knowledge/3_考古題/2_MD淬鍊文字_整合版/三下/三下_社會_*/` 讀整合版 MD
- 抽題 + 編碼反查 + 版本/科目彙整
- 編碼合法集合限定為「108 課綱社會領綱第 Ⅱ 學習階段」共 35 條

### 本次任務不做(遇到請停下回報)
- ❌ 改題庫 JSON(`question/platform/...`)
- ❌ 抽其他科目(國語/自然/數學/英語)— 試水通過再開單
- ❌ 抽其他年級(三上、四下等)
- ❌ 用第 Ⅰ / Ⅲ / Ⅳ / Ⅴ 階段編碼(三下對應 Ⅱ 階段)
- ❌ 修改 108 課綱研究檔(`knowledge/1_課綱研究/...`)
- ❌ 修改規範文件(CLAUDE.md、README_*.md 等)
- ❌ 改 JOB-226 整合版 MD 內容
- ❌ 自行擴充 JSON Schema 欄位(必須先回報 PM)

---

## 👥 角色分工

| 角色 | 擔當者 | 職責 |
|:--|:--|:--|
| PM / 總架構師 | Claude Code (claude-opus-4-7) | 派工、設計 schema、維護黃金樣本、同步檢核、驗收 |
| 主執行者 | Codex CLI (gpt-5.4) | Phase A1/A2/C/D/E 主要執行 |
| 同步檢核者 | Claude Code | Phase A0/B 本地腳本 + 抽樣比對 + `/code-review:code-review` |
| 最終驗收 | 使用者 | 黃金樣本人工確認、Pilot 結果裁定、全量結束結案 |

**為什麼這樣分**:
- 規則式工作(A0、B)讓 Claude 寫 Python 腳本本地跑,零 LLM 成本、可重現、可 debug
- 語意工作(A1、A2、C、D)讓 Codex 跑,throughput 高
- 檢核責任不能跟執行者重疊(避免自己改自己)

---

## 📂 前置素材確認

| 素材 | 路徑 | 狀態 |
|:--|:--|:--|
| 116 份整合版 MD(翰林 32 / 康軒 60 / 南一 24) | `knowledge/3_考古題/2_MD淬鍊文字_整合版/三下/三下_社會_{翰林,康軒,南一}/` | ✅ 已存在(JOB-226 產出) |
| 108 課綱社會結構化編碼 | `knowledge/1_課綱研究/108課綱研究成果/2_課綱淬鍊文字/社會/社會_學習重點_結構化.md` | ✅ 已存在(JOB-222 產出) |
| 整合版 MD 6 區段規範 | `knowledge/3_考古題/README_雙來源MD整合作業準則.md` | ✅ 已存在 |
| 輸出目錄 | `knowledge/3_考古題/3_L2_結構化抽取/三下/三下_社會_*/` | ❌ 待建立 |
| 黃金樣本目錄 | `knowledge/3_考古題/3_L2_結構化抽取/_golden_samples/` | ❌ 待建立 |
| 腳本目錄 | `scripts/jobs/JOB-228/` | ❌ 待建立 |

---

## 📖 執行步驟(七階段)

### Phase A0:抽合法編碼清單與主題 hint(Claude 寫腳本,本地跑)

**為什麼**:給後面 LLM 編碼反查設「合法集合」邊界,防 LLM 亂推到第 Ⅲ 階段或編造編碼。

**做什麼**:
1. 寫 `scripts/jobs/JOB-228/A0_extract_legal_codes.py`:
   - 讀 `社會_學習重點_結構化.md`,正則抽「第 Ⅱ 學習階段」段落
   - 抽出所有 `{prefix}-Ⅱ-{number}` 格式的編碼(學習表現 15 + 學習內容 20 = 35 條)
   - 保留每條編碼的「同行還原文字」作為語意 hint
2. 輸出 `knowledge/3_考古題/3_L2_結構化抽取/_meta/social_codes_legal_II.json`:
   ```json
   {
     "stage": "Ⅱ",
     "subject": "社會",
     "performance": [
       {"code": "1a-Ⅱ-1", "hint": "辨別社會生活中的事實與意見"}
     ],
     "content": [
       {"code": "Aa-Ⅱ-1", "hint": "個人在家庭、學校與社會中有各種不同的角色"}
     ],
     "total": 35
   }
   ```
3. 額外產出 `topic_to_code_hints.json`:把 JOB-226 既有 YAML topic_hits(公民服務、問題改善、環境保護等)與編碼做初步對映表(人工確認後存)

**驗收**:
- 35 條編碼全數抽出,無漏無重複
- 使用者確認 hint 文字無 OCR 殘留亂字
- 主題對映表至少涵蓋 JOB-226 已標的 10 個主題

---

### Phase A1:規則式抽題(Codex 寫 Python 腳本,本地跑)

**為什麼**:題號、選項符號(①②③④)、答案符號(○ × A B C D)都是固定格式,不必動用 LLM。

**做什麼**:
0. **輸入過濾**(防 paper_empty / 半成品):
   - **權威基準是 `_index.json`(非 `_validation_report.json`)**:讀 combo 目錄下的 `_index.json`,從 `files[].quality_flags` 取得每份 exam 的品質標記
   - 輔讀 `_integration_report.md` 取 combo 級彙整資訊(僅輔助,quality_flags 以 `_index.json` 為準)
   - 跳過 `paper_empty` 或 `extract_failed` 的 exam(沒題目可抽),被跳過清單記錄至 `_L2_quality_report.json` 的 `skipped_files[]`
   - 對 `codex_only` / `claude_only` 在 JSON `_meta._inheritance.source_warning` 標記,Phase A2 對這類加強 LLM 校對(三版本實際數:翰林 2 / 康軒 9 / 南一 0,共 11 份 codex_only)
1. 寫 `scripts/jobs/JOB-228/A1_parse_questions.py`:
   - 讀整合版 MD 的 `## 試卷` 區段(必有此 H2,JOB-226 規範保證)
   - 切出大題(`### 一、是非題`、`### 二、選擇題`、`### 三、填充題`、`### 四、問答題` 等)
   - 抽每一題的:
     - `question_id`:三層格式 `Q{大題}.{中題?}.{小題?}`,例:
       - `Q1.1`(兩層:大題.子題,常見於是非/選擇)
       - `Q4.1.3`(三層:對應「四-1(3)」這類深層子題,如連連看、配合題、閱讀題子問)
     - `section`:`一、是非題`
     - `type` 七選一:
       - `true_false`(是非題)
       - `multiple_choice`(選擇題,4 選項)
       - `fill_blank`(填充題)
       - `short_answer`(簡答/問答題)
       - `matching`(連連看/配合題)
       - `chart_question`(圖表題,需配圖才能作答)
       - `reading_comp`(閱讀題,題組共用一段文字/圖)
     - `stem`:題幹文字(去除 `( )` 答案括號)
     - `options[]`:選擇題的 4 選項(從 ①②③④ 後抽)
     - `answer`:從 `## 答案` 區段對應同題號的作答符號(無則 empty)
2. 輸出每份 1 個骨架 JSON 到 `knowledge/3_考古題/3_L2_結構化抽取/三下/三下_社會_{版本}/{exam_id}.json`,先填到 `codes_candidate: []`(Phase A2 補)
3. 失敗豁免標記:
   - 純圖片題:`extract_skipped: "image_required"`
   - 答案空:`extract_skipped: "answer_empty"`(題本身仍抽)
   - 題幹斷裂:`extract_skipped: "stem_partial"`

**驗收**:
- 翰林 32 份骨架 JSON 全數產出(扣除 paper_empty 後的實際數量)
- 與 MD 原文題號集合對照,失敗率三級觸發:
  - ≤ 5% → 自動 `extract_skipped` 標記,通過
  - 5–10% → 列出檔案清單給 PM 抽閱,逐份決策
  - > 10% → 暫停 Phase A1,觸發 schema review
- 抽樣 3 份手動驗:題幹文字完整、選項數正確、答案符號對位

---

### Phase A2:LLM 編碼反查(Codex 主跑)

**為什麼**:題目語意 → 課綱目標的對映需要理解能力,這是 LLM 的舒適區。但要嚴格約束以防亂推。

**做什麼**:
1. Codex 讀每題的 `stem` + `options` + `answer` + `topic_keywords`(從 YAML topic_hits + 題幹抽)
2. 從 `social_codes_legal_II.json` 中選 1-3 個 codes_candidate
3. 每筆 codes_candidate 必填:
   - `code`:必須在 35 條合法清單內
   - `confidence`:`high`(語意完全匹配)/ `medium`(部分匹配)/ `low`(弱關聯)
   - `reason`:≤50 字,說明為什麼選這條
   - `trace`:命中的關鍵字 / 語意片段(直接從題幹引用)
4. 同時補:
   - `topic_keywords[]`:從 YAML topic_hits + 題幹抽 2-5 個
   - `misconception_type`:`概念混淆` / `事實錯誤` / `空心知識` / `null`
   - `cognitive_level`:`記憶` / `理解` / `應用` / `分析` / `評鑑` / `創造` / `null`(Bloom 分類)

**Codex 端強制 prompt 規則**:
- ❌ 禁止編造不在合法清單的編碼
- ❌ 禁止用第 Ⅰ / Ⅲ / Ⅳ / Ⅴ 階段編碼
- ❌ 禁止 reason 寫「相關」「對應」等空泛字眼,必須引用題幹原句
- ✅ 找不到合適編碼時,留 `codes_candidate: []` 並標 `extract_skipped: "no_matching_code"`,不可硬塞

**驗收**:
- 全 116 份 JSON 補完 codes_candidate
- 編碼合法率 ≥ 95%(剩餘由 Phase B 強制踢出或降級)
- 抽樣 5 份手動驗 reason / trace 不空泛

---

### Phase B:編碼合法性驗證(Claude 寫腳本,本地跑)

**為什麼**:LLM 端就算被 prompt 約束,仍可能漏網。本地腳本是最後防線。

**做什麼**:
1. 寫 `scripts/jobs/JOB-228/B_validate_codes.py`:
   - 讀全部 116 份 JSON
   - 對每筆 codes_candidate.code 做:
     - 不在合法清單 → 踢出(記錄到 `_validation_report.json`)
     - 階段不對(出現 Ⅰ/Ⅲ/Ⅳ/Ⅴ)→ 踢出
     - 重複編碼 → 去重保留 confidence 最高者
   - schema 驗證:必填欄位齊全、type 列舉合法、confidence 列舉合法
   - 輸出統計:每份 JSON 的 violation 數、總 violation、最常見錯誤類型
2. 違規類型分級(避免自動踢出誤殺):
   - **A 類:編碼不存在**(不在 35 條合法清單)→ 必踢
   - **B 類:階段錯誤**(出現 Ⅰ/Ⅲ/Ⅳ/Ⅴ 階段編碼)→ 必踢
   - **C 類:同碼重複**(同題出現兩次相同 code)→ 去重保留 confidence 最高者
3. 違規率處理:
   - violation < 5%:自動修正(A/B 踢出 + C 去重)後通過
   - violation 5–20%:標記該檔需 Codex 重跑該題
   - violation ≥ 20%:整檔標 `manual_review_required`,回報 PM

**驗收**:
- `_validation_report.json` 產出(含 A/B/C 類各別統計)
- 全 116 份 violation 率 < 5%(自動修正後)
- 任何 manual_review_required 的檔回報並逐份處理

---

### Phase C:版本級彙整(Codex 主跑)

**為什麼**:把 35 / 61 / 24 份散落 JSON 變成一份 MD,給後續 KL2/KL3/KL4 設計者一目了然。

**做什麼**:
對每個版本(翰林 / 康軒 / 南一)產出 `_L2_summary.md`,含:
1. **編碼分布熱力圖**(表格:35 條合法編碼 × 命中題數)
2. **命中率分析**:學習表現 vs 學習內容覆蓋比例
3. **低信心題清單**:confidence=low 的所有題(exam_id + question_id + reason)
4. **未命中編碼清單**:35 條中沒被任何題命中的編碼(可能代表:考古題未涵蓋、或 LLM 反查仍漏)
5. **misconception 分布**:四類 misconception_type 的題數比例
6. **cognitive_level 分布**:Bloom 六層的題數比例

輸出位置:`knowledge/3_考古題/3_L2_結構化抽取/三下/三下_社會_{版本}/_L2_summary.md`

---

### Phase D:科目級彙整(Codex 主跑)

**為什麼**:跨版本對比可看出不同出版社教學側重的差異,KL2 設計時要避開單一版本偏見。

**做什麼**:
產出 1 份 `三下_社會_L2_整合.md`,含:
1. **三版本編碼覆蓋率對比**:每版本對 35 條編碼的命中分布並列
2. **版本特色**:每版本的高頻編碼 Top 5
3. **共同核心**:三版本都重視的編碼(命中率 ≥ 50% 的編碼)
4. **版本差異**:A 版本重視但 B/C 版本忽略的編碼
5. **整體未涵蓋編碼**:三版本都沒命中的編碼(KL2 設計時要決定是否補強)

輸出位置:`knowledge/3_考古題/3_L2_結構化抽取/三下/三下_社會_L2_整合.md`

---

### Phase E:自我品質檢查 + 抽樣驗收

**為什麼**:Codex 自己對自己做最後一次掃描,再交 Claude 抽閱。

**做什麼**:
1. Codex 自查:
   - schema 驗證再跑一次
   - 每版本隨機抽 5 份檢視 codes_candidate.reason 是否引用題幹原句
   - 統計低信心題(confidence=low)比例(目標 ≤ 30%)
   - 寫 `_L2_quality_report.json`
2. Claude 抽閱(同步檢核 SOP §11):
   - 黃金樣本一致性比對
   - 隨機抽 3 份做 `/code-review:code-review`
   - 對 Codex 寫的腳本(A1/C/D)做 `/code-review:code-review`

---

## 🥇 黃金樣本流程(Pilot 前必做)

### 候選樣本(2 份,涵蓋 dual_source + codex_only 兩種邊界)

| 類別 | 樣本 | 為什麼選 |
|:--|:--|:--|
| **A 黃金(dual_source)** | `翰林_108_文德國小_第二次段考` | dual + paper_full + answer_full,題型豐富(是非/選擇/填充/問答),作為「資料完整時的標準」 |
| **B 邊界(codex_only)** | `康軒_111_新北安和國小_期中考` | codex_only(無 claude 校對交叉驗證),是 JOB-226 漂移最嚴重的類型;康軒共 9 份 codex_only,本樣本可校準此類別 |

備選(若主候選有問題):`翰林_109_成功國小_第一次段考`(dual)、`翰林_113_未知國小_期中考`(codex_only)

### 流程
1. Claude 親手做兩份樣本的 Phase A1+A2 完整 JSON
2. 把 JSON 拿給使用者人工確認(checklist 見下)
3. 使用者 LGTM → 存 `knowledge/3_考古題/3_L2_結構化抽取/_golden_samples/{exam_id}.json`
4. 後續 Codex 全量跑時,這 2 份是「assert 必須一致」的測試樣本

### 黃金樣本人工確認 Checklist(交給使用者逐項勾)

- [ ] 35 條合法編碼 hint 文字無 OCR 殘留亂字(如「-、」「哪 - 個」)
- [ ] 每題 codes_candidate 的 confidence 分布合理(不全是 high,有 medium/low 的差異)
- [ ] reason 欄位確實引用題幹原句(不是「相關」「對應」這類空泛詞)
- [ ] topic_keywords 跟題目語意相符(不是天外飛來的詞)
- [ ] misconception_type 非 null 時,misconception_evidence 有具體錯誤選項描述
- [ ] cognitive_level 不全是「理解」(分布有差異)
- [ ] 兩份樣本(dual_source + codex_only)皆通過上述 6 項才算 LGTM

### Pilot(試刀 5 份)
- 翰林 1 份(dual_source) + 康軒 2 份(含 1 份 codex_only) + 南一 2 份
- Codex 跑完 → Claude 比對 2 份黃金樣本 schema/欄位/編碼合法性
- Pilot PASS(schema 一致 + 編碼合法率 ≥ 95% + reason 不空泛)→ 放 116 份全量
- Pilot FAIL 處理:
  - 失敗點集中在 schema → 修派工單或 schema 後重 Pilot
  - 失敗點分散看不出規律 → 觸發 dual_run 一致性檢查(2 個獨立 codex session 跑同一份 pilot,比對 codes_candidate 一致率;< 80% 一致則表示 schema/prompt 模糊,需修正)
  - Pilot 預設不啟用 dual_run,僅在 FAIL 後觸發以節省 token

---

## 📋 JSON Schema v1.0(題目級)

```json
{
  "exam_id": "翰林_108_內安國小_第一次段考",
  "publisher": "翰林",
  "academic_year": 108,
  "exam_type": "第一次段考",
  "subject": "社會",
  "semester": "三下",
  "_meta": {
    "extracted_at": "2026-05-04T10:23:45+08:00",
    "extractor": "JOB-228-pipeline-v1.0",
    "schema_version": "v1.0",
    "source_md_sha256": "...",
    "_inheritance": {
      "integration_quality_flags": ["paper_full", "answer_empty", "codex_only"],
      "phase6_pass": "PASS",
      "source_warning": null
    }
  },
  "questions": [
    {
      "question_id": "Q1.1",
      "section": "一、是非題",
      "type": "true_false",
      "stem": "愛惜資源不分年紀,每個人都可以為環境保護盡心力。",
      "options": [],
      "answer": "○",
      "topic_keywords": ["環境保護", "資源珍惜", "公民責任"],
      "misconception_type": null,
      "misconception_evidence": null,
      "cognitive_level": "理解",
      "codes_candidate": [
        {
          "code": "Cb-Ⅱ-1",
          "confidence": "high",
          "reason": "題幹『環境保護』『每個人都可以盡心力』指公共事務參與",
          "trace": "命中關鍵字: 環境保護 / 盡心力"
        }
      ],
      "extract_skipped": null
    }
  ],
  "_summary": {
    "total_questions": 28,
    "by_type": {"true_false": 10, "multiple_choice": 18, "fill_blank": 0, "short_answer": 0},
    "by_code_count": {"0": 2, "1": 18, "2": 6, "3": 2},
    "extract_skipped_count": 0,
    "low_confidence_count": 3
  }
}
```

### 欄位說明
| 欄位 | 必填 | 列舉值 / 格式 | 說明 |
|:--|:--:|:--|:--|
| `question_id` | ✅ | `Q{大題}.{中題?}.{小題?}` 兩或三層 | 例:`Q1.1`(是非)、`Q2.5`(選擇)、`Q4.1.3`(連連看/閱讀題子問對應「四-1(3)」) |
| `type` | ✅ | true_false / multiple_choice / fill_blank / short_answer / matching / chart_question / reading_comp | 限七選一 |
| `stem` | ✅ | 字串 | 題幹文字,去 `( )` 答案括號 |
| `options[]` | 視 type | 陣列 | 選擇題必有 4 選項,其他可空 |
| `answer` | 條件 | 字串 | 答案符號或文字;空字串表 answer_empty |
| `topic_keywords[]` | ✅ | 字串陣列 2-5 個 | 從 YAML topic_hits + 題幹抽 |
| `misconception_type` | ✅ | 概念混淆 / 事實錯誤 / 空心知識 / null | 限四選一含 null |
| `misconception_evidence` | 條件 | 字串 ≤ 80 字 或 null | misconception_type 非 null 時必填,引用具體錯誤選項描述 |
| `cognitive_level` | ✅ | Bloom 六層 / null | 記憶 / 理解 / 應用 / 分析 / 評鑑 / 創造 / null,範例見下節 |
| `codes_candidate[]` | ✅ | 陣列 0-3 個 | 找不到合適編碼可空陣列 |
| `codes_candidate[].code` | ✅ | 必在 35 條合法清單 | 如 `Aa-Ⅱ-1` |
| `codes_candidate[].confidence` | ✅ | high / medium / low | |
| `codes_candidate[].reason` | ✅ | ≤50 字 | 必引用題幹原句 |
| `codes_candidate[].trace` | ✅ | 字串 | 命中關鍵字 |
| `extract_skipped` | 條件 | image_required / answer_empty / stem_partial / no_matching_code / null | |

### cognitive_level 社會科範例(防 LLM 全標「理解」)

| 層級 | 社會科題型範例 |
|:--|:--|
| 記憶 | 「公所主管由誰選出?」(事實回憶) |
| 理解 | 「下面哪一個是政府的工作?」(辨識基本概念) |
| 應用 | 「老師發現家暴情境,應通報哪個單位?」(情境判斷) |
| 分析 | 「為什麼里民大會比公投更適合處理鄰里小事?」(比較推理) |
| 評鑑 | 「以下三種公民參與方式,哪一個對社區改善最有效?說明理由」 |
| 創造 | 「設計一個讓社區資源回收率提升的方案」(三下少見) |

### misconception_evidence 範例

| misconception_type | misconception_evidence |
|:--|:--|
| 概念混淆 | 錯誤選項『資源回收屬衛生所工作』→ 學生混淆衛生所/清潔隊職權 |
| 事實錯誤 | 錯誤選項『鄉長由縣長指派』→ 學生不知道鄉長是民選 |
| 空心知識 | 錯誤選項『公投是天天可以做的事』→ 學生背過「公投」但不知頻次 |

---

## 🛡️ 編碼合法性三道防線

| 防線 | 位置 | 機制 |
|:--:|:--|:--|
| **1** | Codex prompt | 把 35 條合法清單直接塞進 prompt,禁止編造不在清單的編碼 |
| **2** | Phase B 本地腳本 | 違規編碼自動踢出,違規率 ≥ 5% 標記重跑 |
| **3** | Phase E 抽閱 | Claude 隨機抽 5 份做 `/code-review:code-review` |

---

## 👁️ Claude 同步檢核 SOP

| 階段 | 動作 | 失敗條件 |
|:--|:--|:--|
| A0 結束 | 把 35 條合法編碼清單給使用者眼驗 | 漏抽、亂字、hint 對不上 |
| A1 結束 | 抽 3 份比對 questions[] 數量 vs MD 題號集合 | 差集 > 5% |
| A2 結束 | 抽 5 份做編碼合法性 100% 掃描 + 黃金樣本一致性 | 合法率 < 95% 或黃金樣本不一致 |
| B 結束 | 跑 schema validator | 任何必填欄位缺失 |
| C/D 結束 | 抽閱版本/科目彙整 MD | 編碼分布表錯誤、跨版本對比漏項 |
| E 結束 | 對腳本 + 抽 3 份 JSON 做 `/code-review:code-review` | review 標記重大問題 |

每階段檢核完成才允許下一階段啟動,禁止 Codex 跨階段並行。

---

## 🚀 Codex 派工指令(最終版預估)

### Token 預估(派工前必填預算)

JOB-226 實測每份整合版 MD 約 **150-400K token**(翰林 Report l66-67 / 康軒 Report l91-93)。
JOB-228 每份要做抽結構 + 編碼反查 + reason/trace 撰寫,token 用量略高於 JOB-226:

| 指標 | 預估 |
|:--|:--|
| 每份題目級 JSON | 200-500K token(包含讀 MD + 抽題 + 編碼反查 + 寫 JSON) |
| 116 份單次跑 | 23M-58M token(會超出單次 session 上限) |
| **必須分批** | 三批分版本(翰林 32 / 康軒 60 / 南一 24),每批單獨 session |
| 每批 token | 翰林 6.4-16M / 康軒 12-30M / 南一 4.8-12M |

### 分批派工(三批,每批單獨 session)

```bash
# 第 1 批:翰林 32 份
codex exec -m gpt-5.4 --skip-git-repo-check --full-auto \
  "$(cat jobs/JOB-228-codex-task-prompt.md) batch=翰林" \
  > scripts/orchestrator-logs/JOB-228-batch-翰林.log 2>&1 &

# 第 2 批:康軒 60 份(等翰林批通過 PM 抽閱才啟動)
codex exec -m gpt-5.4 --skip-git-repo-check --full-auto \
  "$(cat jobs/JOB-228-codex-task-prompt.md) batch=康軒" \
  > scripts/orchestrator-logs/JOB-228-batch-康軒.log 2>&1 &

# 第 3 批:南一 24 份(等康軒批通過才啟動)
codex exec -m gpt-5.4 --skip-git-repo-check --full-auto \
  "$(cat jobs/JOB-228-codex-task-prompt.md) batch=南一" \
  > scripts/orchestrator-logs/JOB-228-batch-南一.log 2>&1 &
```

### 續跑契約(checkpoint)

`jobs/JOB-228-progress.json` 結構(仿 JOB-226-progress.json):

```json
{
  "job_id": "JOB-228",
  "batches": [
    {
      "order": 1, "publisher": "翰林", "total": 32,
      "completed": 0, "skipped": 0, "failed": 0,
      "status": "pending|running|done|paused",
      "checkpoint": {
        "last_exam_id": null,
        "completed_exam_ids": []
      },
      "started_at": null, "completed_at": null,
      "token_used": 0
    },
    { "order": 2, "publisher": "康軒", "total": 60, "...": "..." },
    { "order": 3, "publisher": "南一", "total": 24, "...": "..." }
  ]
}
```

**Codex 端規則**:
- 每完成 1 份就 update `progress.json` 的 `completed_exam_ids`
- session 中斷或 token 超限 → Claude 重派同 batch,Codex 從 `checkpoint.completed_exam_ids` 接續
- 一個 batch 完整跑完才更新 `status="done"`

### 參數說明

- `-m gpt-5.4`:固定 gpt-5.4(gpt-5.5 在 Eidos 環境會 hang,JOB-226 已驗證)
- `--full-auto`:無交互
- `--skip-git-repo-check`:避免 codex 對 git 狀態誤判
- log 重導向 → 事後檢驗

**派工 prompt 模板**:另寫 `jobs/JOB-228-codex-task-prompt.md`(在 Pilot 前準備),需在 prompt 中明確要求 Codex 讀 `progress.json.checkpoint` 接續

---

## 📊 風險評估

| 風險 | 機率 | 影響 | 緩解 |
|:--|:--:|:--:|:--|
| Codex 編碼亂推(編造 / 跨階段) | 中 | 高 | 三道防線 + 黃金樣本對照 |
| 規則式抽題在某些 MD 失效(題號不規則) | 中 | 中 | Phase A1 失敗豁免標記 + 手動處理 |
| LLM token 爆量(116 份一次跑) | 低 | 中 | 三批分版本派工 + 進度可中斷 |
| 黃金樣本選錯(題型太單一) | 低 | 高 | 已選翰林_108_文德題型最豐富 |
| schema v1.0 設計不夠(欄位漏項) | 中 | 中 | Pilot 5 份試刀後 review schema、必要時 v1.1 |
| topic_hits prior 對映誤導 | 低 | 低 | 主題對映表先給使用者眼驗 |

---

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `docs/README_通用作業準則.md` | 三段式 Checklist、角色分工、花費格式 |
| `docs/README_任務派工準則.md` | 派工生命週期、`job_type`、開結案管線 |
| `knowledge/README_研究架構總綱.md` | KL/RM 階段定義 |
| `knowledge/3_考古題/README_雙來源MD整合作業準則.md` | JOB-226 6 區段 MD 規範 |
| `knowledge/1_課綱研究/108課綱研究成果/2_課綱淬鍊文字/社會/社會_學習重點_結構化.md` | 35 條第 Ⅱ 階段合法編碼來源 |
| `jobs/JOB-220-AG-G3S2-社會-南一-考古題反推.md` | 反推方法前例(人工分類) |
| `jobs/JOB-221-Report.md` | 亂推 0/12 教訓案例 |
| `jobs/JOB-226-codex-sample-prompt.md` | Codex 派工 prompt 模板 |
| `jobs/JOB-226-progress.json` | 進度結構 |
| `scripts/orchestrator-logs/JOB-226-*.log` | Codex CLI 啟動參數 |

---

## ✅ 啟動 Checklist (Pre-Flight)
> 每一項打勾前必須確實完成,不得預先全部打勾。

- [ ] 已讀取 `docs/README_通用作業準則.md` 三段式 Checklist
- [ ] 已讀取 `docs/README_任務派工準則.md` job_type 與生命週期
- [ ] 已讀取 `knowledge/3_考古題/README_雙來源MD整合作業準則.md` 6 區段規範
- [ ] 已讀取 `knowledge/1_課綱研究/108課綱研究成果/2_課綱淬鍊文字/社會/社會_學習重點_結構化.md`
- [ ] 已確認 116 份來源 MD 存在(翰林 32 / 康軒 60 / 南一 24,扣除 _integration_report.md)
- [ ] 已確認 codex_only 樣本數(翰林 2 / 康軒 9 / 南一 0,共 11 份需邊界校準)
- [ ] **已確認執行模型**:[模型:___________](⚠️ 啟動前詢問使用者)
- [ ] **已確認使用金鑰**:[金鑰:___________]
- [ ] **已確認操作頻次**:[QPM:___________]
- [ ] 已閱讀「任務邊界」並確認本次範圍
- [ ] Phase A0 已完成且使用者確認 35 條合法編碼
- [ ] 黃金樣本已產出且使用者人工確認
- [ ] Pilot 5 份已通過

## ✅ 驗收 Checklist (Acceptance)
> 每一項需提供佐證(數字、指令輸出、截圖),不得僅靠自我判斷打勾。

- [ ] 116 份題目級 JSON 全數產出(實際數量:___ / 116)
- [ ] schema 驗證 0 violation(實際違規數:___)
- [ ] 編碼合法率 ≥ 95%(實際:___%)
- [ ] 黃金樣本一致性比對 PASS(差異點:___)
- [ ] Pilot 5 份對照黃金樣本 PASS(PASS / FAIL:___)
- [ ] 三版本各 1 份 `_L2_summary.md` 產出
- [ ] 1 份 `三下_社會_L2_整合.md` 產出
- [ ] `_L2_quality_report.json` 產出,低信心題比例 ≤ 30%(實際:___%)
- [ ] Claude 抽 3 份做 `/code-review:code-review` 無重大問題

## ✅ 成果 Checklist (Deliverables)
> 每一項需在 Report 中有對應的實際內容。不得用「已完成」「如上」「見程式碼」等抽象詞代替。

- [ ] `jobs/JOB-228-Report.md` 產出,異動清單列出所有實際修改檔案
- [ ] 進度總表已同步(`docs/進度彙整_題庫研發與產出.md`)
- [ ] 已執行 `/pj_sync`
- [ ] `node scripts/job_manager.js close JOB-228`
- [ ] Discord chat_id `1487738477608177714` 結案回報

---

## 📌 後續延伸 JOB(已記入遺留問題)

| 編號 | 任務 | 觸發條件 |
|:--|:--|:--|
| JOB-{未定} | 三下_國語 L2 結構化抽取(複製本 JOB 管線) | 本 JOB Pilot 通過後 |
| JOB-{未定} | 三下_自然 L2 結構化抽取 | 同上 |
| JOB-{未定} | 三下_數學 L2 結構化抽取 | 同上 |
| JOB-{未定} | 三下_英語 L2 結構化抽取 | 同上 |
| JOB-{未定} | 其他年級複製管線 | 三下五科全部完成後 |
| JOB-{未定} | KL2 五科重做(用 L2 產物做地基B) | 五科 L2 全部完成後 |

---

## 📊 進度摘要

<!-- progress-summary-start -->
- 2026-05-04 — JOB-228 派工單草擬完成,待使用者審閱與其他 agent review
- 2026-05-04 — 採納 reviewer 9.5/10 條建議完成修訂(數字 120→118、加 codex_only 黃金樣本、schema 加 _inheritance/misconception_evidence、A1 失敗率三級、B 違規 A/B/C、cognitive_level 範例、Pilot dual_run 為 fallback)
- 2026-05-05 — 採納第二輪 codex review 4 條 H/M 完成 v3 修訂(數字 118→116、A1 改讀 _index.json、schema type 4→7、question_id 三層、目標表第 4 條黃金 1→2 份、目標表第 1 條增 skipped_files 條款、派工指令加分批契約 + token 預估 + checkpoint);Phase 0 清理 iCloud 副本完成 commit 1853f5f
- 2026-05-05 — Phase 1 完成:派工單修 4 條 H/M + 漏改 + 數字(commit 747f57f);Phase 2 完成:翰林文德 50 題黃金樣本(b64b300) + 康軒新北安和 48 題黃金樣本(0f587fe);兩份共 98 題、171 條編碼全通過合法清單驗證;發現並修正 Ae-Ⅱ-1 OCR 錯位陷阱(OBS-8)
- 2026-05-06 — Phase 4 框架完成:codex prompt 模板 + dispatch 腳本 + 5 份目標清單(commit 7a8d37e);Phase 4 卡點:codex CLI 0.121 + ChatGPT 帳號擋 gpt-5-codex/gpt-5.5/gpt-5;使用者裁決選 C 路徑由 Claude 親手做;5 份 Pilot 完成(commit 0bed352)、325 題 433 條編碼全 PASS
- 2026-05-08 — 使用者改選 B 路徑(升級 codex CLI 後派 codex 跑剩下 109 份);本 session 暫停;產出 jobs/JOB-228-RESUME-CHECKLIST.md 與 scripts/jobs/JOB-228/_full_targets.json(109 份目標),供下一個 session 接續
<!-- progress-summary-end -->

---

## 真實回報本次對話的模型與花費

＄作業匯總:Token數:- | 花費: $- | 使用模型: claude-opus-4-7 | 執行者: Claude
