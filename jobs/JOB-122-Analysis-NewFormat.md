*Prepared by Claude Code at 2026-04-05*

# JOB-122 規範更新分析（參考 JOB-147 最新格式）

---

## 📊 對比分析表

| 項目 | JOB-147（英文品質評估） | JOB-122 原版（國語研究） | 建議新版 JOB-122 |
|:--|:--|:--|:--|
| **job_type** | `question_prod` | 混雜（research + production）| `research_verification + content_production` |
| **API 消耗** | 0 RPD（本地計算） | 無 | 2500-3000 RPD |
| **執行架構** | 單向：派工→腳本→Report→Claude Code決策 | 龐大敘述 | 雙階段：驗證→決策→擴充 |
| **目錄清單** | 明確（3 版本，題數統計） | 籠統（G3-G6 無數字） | 明確（G3-G6 ~48 課，階段一先驗證） |
| **執行步驟** | 具體命令列表 | 敘述型、無命令 | 具體命令 + 決策卡點 |
| **任務邊界** | 清楚（只做/不做） | 無 | 明確分列（只做：驗證/出題/盲測；不做：重寫KL4/模型調整） |
| **Checklist** | 分層（啟動/成果）| 單層、龐大 | 分層（啟動/階段一/階段二） |
| **後續責任** | Claude Code 決策點明確 | 模糊 | Claude Code：審視階段一→決定進階段二 |
| **成本透明** | Token + 花費 + 模型 + 執行者 | 無 | 完整預估 |

---

## 🔧 **JOB-122 新版框架（完整版）**

```markdown
*Created by USER at 2026-03-26*
`last_updated`: 2026-04-05
`updated_by`: Claude Code (claude-haiku-4-5)

**job_type**: `research_verification + content_production`
**預計 API 消耗**：2500-3000 RPD（Gemini-3.1-Flash-Lite）

> 執行架構：USER 定義範圍 → Antigravity/Cursor 執行驗證（階段一）→  
> Claude Code 審視決策點 → Antigravity/Cursor 執行擴充（階段二）→ Report

---

## 📌 任務背景

G3-G6 S2 國語科研究層因前次（JOB-116）出現大規模網址失效（~30%）、
編碼轉義錯誤、引用不穩定等品質問題。本任務分兩階段重建：

1. **驗證階段**：確認既有 KL4 檔案完整性 ✅
2. **擴充階段**：基於完整 KL4，進行題庫出題與驗證

---

## 🎯 任務目標

1. 確保 G3-G6 S2 國語 KL4 雙檔完整性 ≥ 95%（缺漏率 ≤ 5%）
2. G3 S2 題庫擴充至 25+ 題/課（三版本全部）
3. 新增題目 CQI-P ≥ 5.5，blind_eval Match Rate ≥ 85%

---

## 📖 執行範圍

### 階段一：研究驗證（KL4 檔案盤點）

**掃描範圍：**
- G3-G6 S2 國語（共 ~48 課）
- KL3 + KL4 雙檔完整性檢查

**驗證項目：**
- 主檔（文本分析、語法、考古題）存在且有效
- 副檔（誘答分析、學生迷思）存在且完整
- 所有 URL 連結有效（角括號包裹，防碼）

**預期交付：**
- `jobs/JOB-122-Verification-Report.md`
  - 完整課次清單（G3-G6 各級各課）
  - 缺漏課次清單 + 網址失效統計
  - 修復建議清單

### 階段二：題庫擴充（待階段一 ≤5% 缺漏通過）

**執行範圍（首批）：**
- G3 S2 國語三版本（翰林/康軒/南一）
- 12 課 × 3 版本 = 36 課

**出題原則：**
1. 每課以 KL4 副檔「誘答機制」為依據進行出題
2. 目標：各課現況 20~25 題 → 擴充至 25+ 題
3. 新增題目命名：`[原課號]-ext-[編號]`（如 L1-ext-01）

**品質卡點：**
- 每 10 新題執行 blind_eval
- Match Rate < 85% → 識別 mismatch 題目 → 回溯修題 → 重測
- CQI-P < 5.5 → 停止出題，報告使用者決策

**預期交付：**
- `jobs/JOB-122-Production-Report.md`
  - 新增題數統計（版本/課別）
  - 盲測結果彙整（Match Rate、Mismatch 清單）
  - 修題過程記錄

---

## 📋 執行步驟

### 階段一：研究驗證（Antigravity Agent）

1. 讀取 `knowledge/README_研究架構總綱.md`
2. 掃描 `knowledge/課綱研究/國語/[G3-G6]/[版本]/KL*` 目錄結構
3. 對每課進行檔案存在性 + 連結可達性檢查：
   ```bash
   # 偽代碼
   for each grade (G3-G6):
       for each semester (S1, S2):
           for each publisher (翰林, 康軒, 南一):
               for each lesson (L1-L12):
                   check existence: KL3_*.md && KL4_*.md
                   validate all URLs in KL4 副檔
                   report: {status: ok|missing|url_broken, ...}
   ```
4. 生成驗證報告 + 缺漏清單

### 階段二：題庫擴充（Cursor/Antigravity Agent）

*（此階段待階段一通過後啟動，由 Claude Code 發起）*

1. 選定 G3 S2 為首批（翰林第一）
2. 開啟 `question/platform/G3/Chinese/S2/HanLin/` 各課 JSON
3. 參照 KL4 副檔「誘答機制」部分，進行出題：
   ```bash
   # 對於每課的 12-30 個已有題目，基於 KL4 指導補充 5-10 題
   node scripts/ai_question_gen.js --kl4_ref knowledge/課綱研究/國語/三下/翰林/KL4_*.md \
       --output question/platform/G3/Chinese/S2/HanLin/G3_S2_CHI_HANLIN_L1-ext.json \
       --target_count 25
   ```
4. 每 10 新題後執行盲測驗證：
   ```bash
   node scripts/run_blind_eval.js question/platform/G3/Chinese/S2/HanLin --force
   ```
5. 若 Match Rate < 85%：
   - 提取 Mismatch 題目清單
   - 識別問題根因（計算/理解/誘答邏輯）
   - 回溯修改題目或選項
   - 重新執行盲測
6. 產出最終報告

---

## 🚧 任務邊界（Critical）

### ✅ 只做：

- **驗證 KL4 檔案完整性**：檔案存在性、URL 有效性
- **基於 KL4 副檔進行出題**：遵循「誘答機制」邏輯
- **執行盲測驗證**：Match Rate 監控、Mismatch 識別
- **修改題目與標籤**：更新 review_status、answer_index、CQI-P
- **進度記錄與報告**：生成驗證報告、產出報告

### ❌ 不做：

- **重寫或重建 KL4 檔案本體**：如需超大幅修改，由 USER 決策後另發派工
- **模型權重調整、自定義參數**：使用 Gemini-3.1-Flash-Lite 預設配置
- **CQI-P < 5.5 的題目進入版本**：需停止並報告，待修正派工後再行
- **手工細部編輯**：應盡量自動化處理，僅例外題目人工介入

---

## ✅ 啟動 Checklist

- [x] 執行模型確認：Gemini-3.1-Flash-Lite（Yotta 金鑰）
- [x] 課程範圍確認：G3-G6 S2（階段一）→ G3 S2（階段二）
- [ ] 已讀取 `knowledge/README_研究架構總綱.md`
- [ ] 已讀取 `question/README_出題與品管準則.md`

---

## ✅ 成果 Checklist（階段一）

- [ ] `jobs/JOB-122-Verification-Report.md` 已產出
  - 完整課次清單（G3-G6 各級）
  - 缺漏課次清單 + 失效 URL 統計
  - 修復建議與優先度排序
- [ ] 缺漏率 ≤ 5%（決策卡點：通過→進階段二，失敗→需補完）
- [ ] 進度表已同步（`/pj_sync`，狀態：awaiting_stage2_decision）

---

## ✅ 成果 Checklist（階段二，待階段一通過）

- [ ] `jobs/JOB-122-Production-Report.md` 已產出
  - 新增題數統計表（版本 × 課別）
  - 盲測結果彙整（各課 Match Rate、Mismatch 清單）
  - 修題過程記錄（哪些題修改了、原因、驗證後結果）
- [ ] 所有新題 CQI-P ≥ 5.5 ✅
- [ ] 所有課檔 blind_eval Match Rate ≥ 85% ✅
- [ ] 進度表已同步（`/pj_sync`，狀態：completed）

---

## 🔍 Claude Code 後續責任

1. **階段一後決策**：
   - 審視驗證報告
   - 確認缺漏率 ≤ 5%
   - YES → 發動階段二派工；NO → 要求補完後再行

2. **階段二期間監督**：
   - 定期審視盲測結果
   - CQI-P < 5.5 或 Match Rate < 85% 時決策：
     - 修題（指定須改項目）
     - 或跳過此課（標記為 `pending_revision`）
   - 確認所有課檔通過後結案

---

## 💲 成本預估

| 項目 | 預估值 |
|:--|:--|
| **Token 數** | ~500K-800K（階段一 ~150K，階段二 ~350-650K） |
| **花費（台幣）** | ~NT$150-200 |
| **使用模型** | Gemini-3.1-Flash-Lite（Yotta） |
| **執行者** | Antigravity（AG）或 Cursor |
| **預計耗時** | ~40-60 小時（分兩週執行） |

---

## 📝 格式與規範參考

- **驗證報告格式**：參考 `JOB-143-Report.md §2 彙整表`
- **出題命名規範**：參考 `question/README_出題與品管準則.md §命名規範`
- **Mismatch 分析**：參考 `JOB-143-Report.md §4-5 審視紀錄`

```
