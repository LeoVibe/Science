# 🔬 驗證與盲測準則 (Verification & Blind Evaluation)

`last_updated`: 2026-04-08 15:30:00
`updated_by`: Claude Code (claude-sonnet-4-6)（JOB-163：驗收門檻重定義 — 題級 CQI 取代課級 Match Rate）
`version`: 4.2

**文件定位**：本文件為 Eidos 題庫**盲測驗證流程、CQI-V 計分與品質標籤 (QL)** 的**單一真相 (Single Source of Truth)**。

> [!IMPORTANT]
> - 出題階段品質（CQI-P）請見 `question/README_出題與品管準則.md`
> - 研究素材架構（KL/RM）請見 `knowledge/README_研究架構總綱.md`
> - 驗證觸發指令請見 `_agent/skills/ei_verify/SKILL.md`（該 Skill 僅為觸發器，所有規則以本文件為準）

---

## 第一章：驗證規則 (Verification Immutable Laws)

本章定義的原則為**硬性約束**，Agent 執行驗證時必須全部遵守。

### 規則一：100% 全測覆蓋

- 驗證範圍 = JOB 指定的**所有題目**，覆蓋率必須 100%
- 不得以任何理由進行抽樣（包括「題量大」「舊版產出」）
- 題量大時應拆分為多 Phase，但每 Phase 仍須全覆蓋

### 規則二：CQI-P 門檻 ≥ 5.5

- 盲測前必須先執行 `evaluate_question_quality.js`
- 全線 CQI-P 平均 < 5.5 → 退回出題階段修正，不得進入盲測

### 規則三：金鑰與模型透明

- 驗證報告必須紀錄 `verifying_model` 名稱
- 必須紀錄 API Key 帳號與等級（free/tier1/paid）
- Token 數與花費必須從真實 Meta 讀取，不得推估

---

## 第二章：盲審三步驟 (Blind Review Pipeline)

### 2.1 盲審的定義與適用性

| 術語 | 適用性 |
|:--|:--|
| 黑箱測試 | 部分符合（只測輸入→輸出） |
| **盲審 (Blind Review)** | ✅ 高度符合（不知答案，依內容品質判斷） |
| 雙盲 | 需出題/驗證為不同模型 |

### 2.2 步驟一：盲目讀取 (Blind Read)

- 提取 `scenario`, `question`, `options`
- **嚴禁**讀取 `answer_index`, `explanation`, `commonMisconception`
- 若為腳本驅動（`run_blind_eval.js`），腳本已確保僅傳遞題幹與選項

### 2.3 步驟二：驗證模型獨立推論 (LLM Inference)

驗證模型必須基於以下資訊獨立作答：
1. **R4 課綱素材**：自動注入對應年級/科目的發展綱要精華
2. **題幹與選項**：僅看到題目本身
3. **輸出格式**：預測答案索引 / 推論過程（50 字以內）/ 品質評分

### 2.4 步驟三：交叉比對 (Cross Validation)

| 比對結果 | 處理 |
|:--|:--|
| 預測 = 正解 (Match) | 題目邏輯自洽，`is_publishable: true`（需同時符合 §2.5 單題條件） |
| 預測 ≠ 正解 (Mismatch) | 標記 `review_status: "pending"`，系統提出建議正確答案，等待人工審核後決定 `is_publishable` |
| ai = -1（模型無法作答） | `is_publishable: false`（圖形題、統計圖表等純文字模型無法判讀，暫不處理） |

**Match Rate 計算**：`Match Rate = Match 題數 / 總題數 × 100%`

> **⚠️ Match Rate 為描述性指標，不作為上版封鎖條件。** 上版控制依 §2.5 單題條件與課級門檻決定。

### 2.5 單題上版條件與課級上版門檻

#### 單題 `is_publishable` 判定規則

| 情境 | 結果 |
|:--|:--|
| Match + CQI（CQI-P + CQI-V）≥ 6.5 | `is_publishable: true` |
| Mismatch → 人工審核後確認原題正確 | `is_publishable: true`（由審核者標記） |
| Mismatch → 人工審核後確認原題有誤 | 修題後重跑盲測，重新判定 |
| ai = -1（圖形題） | `is_publishable: false` |
| 未跑盲測（`blind_evaluation: false`） | `is_publishable: false` |

#### 課級唯一硬限制（上線門檻）

> **每課 `is_publishable: true` 題數 ≥ 25 → 該課可上線**

- 低於 25 題：該課不得上架，需補題或補強
- Match Rate 無論高低，不構成課級封鎖條件
- 舊版「Mismatch > 2 → 整課不得上架」規則**已廢止**（JOB-163，2026-04-08）

---

## 第三章：CQI-V 驗證階段品質指標（滿分 4.0）

盲測完成後計算，回寫 JSON。
**最終 CQI = CQI-P + CQI-V**（滿分 10.0）

### V-F 課綱對齊度（滿分 1.5）

| 條件 | 配分 |
|:--|:--|
| 對應課次在 KL4 發展綱要中有記錄 | 0.75 |
| 題幹含該矩陣記載的核心關鍵字 ≥ 1 | 0.75 |

### V-G 認知配比（滿分 0.5）

全檔 taxonomy 配比與年級建議值偏移量 ≤ 30% → 每題加 0.5 分

### V-H 誘答鑑別度（滿分 2.0）

| 盲測結果 | 配分 | 說明 |
|:--|:--|:--|
| Match（AI 答對）且無爭議 | 1.0 | 題目邏輯自洽 |
| Mismatch 但原答案確實合理 | 2.0 | 高鑑別度獎勵（誘答極強） |
| Mismatch 且原答案有瑕疵 | 0.0 | 需人工介入 |

---

## 第四章：CQI 上架規則與 QL 品質標籤

### 4.1 上架門檻

```
最終 CQI = CQI-P(6.0) + CQI-V(4.0) = 滿分 10.0
上架門檻：CQI ≥ 6.5
```

> CQI-P 滿分 6.0 仍不夠上架（< 6.5）→ 強制「不通過驗證就不能上架」。

### 4.2 CQI → QL 自動對應

| CQI 範圍 | QL |
|:--|:--|
| < 4.0 或觸發 BIAS | QL1 |
| 4.0 ~ 5.4 | QL2 |
| 5.5 ~ 6.4 | QL3 |
| 6.5 ~ 8.4 | QL4（可上架） |
| 8.5+ 且 expert verified | QL5 |

### 4.3 QL 對照表（對外品質標籤）

| 等級 | 名稱 | 品質依據 | 細部描述 |
|:--|:--|:--|:--|
| **QL1** | 課綱基礎 | 僅依課綱關鍵字 | 僅依據課綱與關鍵字產出題庫，學習目標不夠精準。 |
| **QL2** | 課文歸納 | 實質課文歸納 | 能具體歸納課程內容與精髓，建構快速複習基礎。 |
| **QL3** | 考古參考 | 考古題庫參考 | 收納外部經驗，凸顯學習目標與題數配重，並把關選項文字清晰度。 |
| **QL4** | 深思與盲測 | 題目精修與複合盲測 | 用不同的 Agent 進行盲測，**100% 全題庫覆蓋**，每一題都模擬真實孩童作答，以精修題幹、選項文字，確保能引發思考，啟發與記憶並重。 |
| **QL5** | 專家認證 | 有專家認證 | 經過多層次邏輯檢查，教師審閱與使用者回饋，確保教學與思考的嚴密。(未來期待) |

---

## 第五章：驗證 JOB 標準化模板 (Standardized Verification Job Template)

> [!IMPORTANT]
> 所有驗證類型的派工單（JOB）**必須包含**以下六大區塊，缺少任一區塊視為派工單不合規。

### 5.1 區塊 A：任務背景與目的

必須明確記載：
- 上游 JOB 編號（如 JOB-104）
- 驗證範圍（科目、年級、學期、版本）
- 題庫總題數（精確數字）

### 5.2 區塊 B：驗收標準 (DoD - Definition of Done)

必須包含以下**全部項目**：

```markdown
## 🎯 驗收標準 (DoD)
> [!IMPORTANT]
> 所有驗收項目皆須 100% 通過，方可結案。

1. 每課 `is_publishable: true` 題數 ≥ 25（課級唯一硬限制）
2. 全線 CQI 平均 ≥ 6.5（QL4 門檻）
3. 零 QL1（BIAS）題目殘留
4. 所有題目 JSON 包含 `verifying_model` 與 `blind_evaluation` 欄位
5. 100% 全測覆蓋（禁止抽樣）；ai=-1 題目記錄但不計入 Match Rate 分母
6. Mismatch 題目完成人工審核（`review_status: confirmed` 或 `corrected`）
7. 進度總表即時同步
> **注意**：Match Rate ≥ 85% 已不作為 DoD 硬條件（JOB-163，2026-04-08）。Match Rate 仍應記錄於 Report 作為品質參考指標。
```

### 5.3 區塊 C：Pre-Flight Checklist（開工前必檢）

```markdown
### Pre-Flight Checklist
- [ ] 強制讀取：`question/README_驗證與盲測準則.md`
- [ ] 強制讀取：`question/README_出題與品管準則.md`
- [ ] 確認驗證模型與出題模型不同（填入具體模型名稱）
  - 出題模型：________
  - 驗證模型：________
- [ ] 金鑰確認：________（帳號名稱 / 等級 / 末四碼）
- [ ] 執行 CQI-P 基線跑分，確認全線 ≥ 5.5
- [ ] 驗證範圍確認：______ 年級 / ______ 版本 / ______ 題（100% 全測）
```

### 5.4 區塊 D：逐年級/版本 Checklist

**所有年級與版本都必須逐一列出，不得省略任何項目。**

模板格式：
```markdown
### Phase N：G{X} 全線盲測（{M} 單元 / {N} 題）

#### G{X} 翰林版（{K} 單元）
- [ ] L1 盲測 → Match Rate ___ % → CQI-V ___ → QL ___
- [ ] L2 盲測 → ...(逐課列出)

#### G{X} 康軒版（{K} 單元）
- [ ] L1~L{K} 逐課盲測

#### G{X} 南一版（{K} 單元）
- **規則一：100% 全測** (NO Sampling)
  所有產出的題目必須全數通過驗證，不得使用抽測。
- **規則二：Match Rate ≥ 85%**
  驗證模型與出題模型的答案一致性必須達標。
- **規則三：CQI-V ≥ 6.5**
  每一題的最終驗證得分必須達到 QL4 (Deep Thinking) 的門檻。
 
### 驗證操作禁令
- **不得抽測**：每單元 1 課 25 題，全測。
- **不得手動改分**：僅接受 `/ei_verify` 腳本產出結果。若某年級題量大，應拆分為多個 Phase 執行，但每個 Phase 仍須 100% 覆蓋。

### 5.5 區塊 E：成果紀錄表

標準格式（所有驗證 JOB 統一）：

```markdown
| 年級 | 版本 | 單元數 | 題數 | Match Rate | CQI 平均 | QL | 驗證模型 | 執行日期 |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|:---|
| G3 | 翰林 | 10 | 300 | __% | __ | __ | [模型名] | YYYY-MM-DD |
```

### 5.6 區塊 F：結案與同步

```markdown
### 結案 Checklist
- [ ] 全線 CQI 平均 ≥ 6.5 確認
- [ ] 零 QL1 (BIAS) 殘留確認
- [ ] 所有 JSON 已回寫 `verifying_model` 與 `verification` 欄位
- [ ] `docs/進度彙整_題庫研發與產出.md` 最終同步
- [ ] 撰寫 JOB 結案報告
- [ ] 花費匯總（真實 Token 數 / 金額 / 模型名稱）
```

---

## 第六章：JSON 驗證欄位定義

### 6.1 必填欄位

| 欄位 | 類型 | 說明 | 範例 |
|:--|:--|:--|:--|
| `blind_evaluation` | Boolean | 是否已完成盲測 | `true` |
| `verifying_model` | String | 驗證模型名稱 | `"Gemini-3-Flash"` |
| `verifying_date` | String | 驗證日期 | `"2026-03-26"` |
| `cqi_score` | Number | CQI 品質分 (0.0-10.0) | `7.5` |
| `quality_level` | String | QL 品質標籤 | `"QL4"` |

### 6.2 條件欄位（Mismatch 時必填）

| 欄位 | 類型 | 說明 |
|:--|:--|:--|
| `blind_eval_mismatch.ai_selected` | Integer | AI 預測的答案索引 |
| `blind_eval_mismatch.correct_answer` | Integer | 正確答案索引 |
| `blind_eval_mismatch.ai_reasoning` | String | AI 推論理由 |
| `blind_eval_mismatch.review_status` | String | `"pending"` / `"resolved"` / `"manual_review"` |

### 6.3 設計理由

- `authoring_model`：強調「著作」而非「生成」
- `verifying_model`：強調「驗證」帶有客觀流程意涵
- 兩者分離設計，支援「先出題、後驗證」的跨階段工作流

---

## 第七章：驗證工具速查 (Verification Tools Reference)

### 7.1 盲測引擎

```bash
# 對整個目錄執行盲測
node scripts/run_blind_eval.js <目錄路徑>

# 對單一檔案執行盲測
node scripts/run_blind_eval.js <檔案路徑>

# 指定模型（透過 --model 參數）
node scripts/run_blind_eval.js <目錄路徑> --model=gemini-3-flash
```

**行為說明**：
- 自動從 `ApiKeys.cfg` 載入 API 金鑰（依 free → tier1 → paid 順序）
- 依科目自動選擇批次大小（見第 7.5 章 SAB 機制），自動注入 R4 課綱素材
- 已盲測的題目（`blind_evaluation: true`）會自動跳過
- 結果即時回寫至 JSON 檔案
- 執行完畢自動產出稽核日誌（見第 7.5 章 VAT 機制）

### 7.2 品質評分

```bash
# 掃描並評分
node scripts/evaluate_question_quality.js <目錄路徑>

# 品質閘門模式（不合格則 exit 1）
node scripts/evaluate_question_quality.js <目錄路徑> --gate
```

### 7.3 選項打散（消除 BIAS）

```bash
node scripts/auto_balance_json.js <檔案或目錄路徑>
```

### 7.4 修題迴圈上限

同一題修正不超過 3 次，超過則標記為 `review_status: "manual_review"` 轉人工。

---

## 第 7.5 章：驗證防線機制

> [!IMPORTANT]
> 以下三道防線由腳本自動執行，用以解決 JOB-103/105 暴露的系統性問題。

### 防線 5：SAB 科目自適應批次 (Subject-Adaptive Batch Size)

| 科目 | 批次大小 | 理由 |
|:--:|:--:|:--|
| **Math** | 5 | 數學推論需完整計算空間，Batch > 10 會觸發幻覺(JOB-115實證) |
| **Chinese** | 10 | 閱讀理解需適度上下文，但不宜過多 |
| **Science / SocialStudies** | 10 | 知識型題目容錯較高 |

- **執行方式**：`run_blind_eval.js` 根據 `meta.subject` 自動選擇批次大小
- **覆寫**：可透過 `--batch_size=N` 參數手動覆寫（需在報告中說明理由）

### 防線 6：VAT 驗證稽核軌跡 (Verification Audit Trail)

| 項目 | 內容 |
|:--|:--|
| **產出位置** | `logs/blind_eval_{filename}_{timestamp}.json` |
| **內容** | 每個批次的原始 API 回應摘要、token 用量、各題判定結果、使用的模型與金鑰 |
| **用途** | JOB Report 中的 Match Rate 數據必須附上對應的日誌檔路徑作為佐證 |
| **解決的問題** | JOB-103 虛假彙報——文件宣稱 100% 但無法提供執行證據 |

### 防線 7：MTP Mismatch 分流協議 (Mismatch Triage Protocol)

當 `blind_eval_mismatch` 發生時，依以下邏輯分流：

| 分類代碼 | 條件 | 處理 |
|:--:|:---|:---|
| **TYPE-A (AI 幻覺)** | AI reasoning 中出現「找不到選項」但選項中確實存在正解 | 自動標記為 `resolved`，不計入品質扣分 |
| **TYPE-B (原題錯誤)** | AI 計算/推論正確，原 `answer_index` 不合理 | 標記為 `original_flaw`，進入人工修題佇列 |
| **TYPE-C (待人工裁定)** | 兩種解讀皆有道理，無法自動判定 | 標記為 `manual_review`，附上 AI reasoning 供人工參考 |

- Match Rate 應拆分報告：`真實 Match Rate = (Match + TYPE-A) / 總數`
- 品質告警：`TYPE-B 比例 > 5%` → 退回出題階段重產

---

## 附錄：CQI v2 設計理由追溯

> 📦 原始設計理由詳見歷史文件 `docs/reports/CQI-v2-設計理由追溯.md`

主要演化動機：CQI v1 是「工程品質指標」（格式防呆），CQI v2 將其融合為「教學品質指標」，
新增易讀性、課綱對齊、認知配比、誘答鑑別度、文化公平性與研究支撐度六大維度，
並拆分為 CQI-P（出題即跑分）與 CQI-V（盲測後計算）兩階段。
