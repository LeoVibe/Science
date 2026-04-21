*Created by Claude Code (claude-sonnet-4-6) at 2026-04-06*

`last_updated`: 2026-04-06
`updated_by`: Claude Code (claude-sonnet-4-6)
`status`: ⬜ 待執行

# JOB-159-PLAN：G4 S2 國語 L7~L12 補題 × 盲測 × Mismatch 審視完整品控

**`job_type`**: `mixed`（question_prod + question_verify）
**執行者**：Cursor / AG（出題 + 盲測） → Claude Code（Mismatch 審視 + 結案）
**預計 API 消耗**：~550~750 RPD（補題 350~500 + 盲測 200~250）
**前置派工**：本文件取代 JOB-153（因 JOB-158-Report 判斷錯誤導致 JOB-153 被誤廢，詳見下方事件說明）

---

## ⚠️ 事件背景：為何需要本 PLAN

### JOB-158-Report 判斷錯誤的根本原因

| 項目 | 內容 |
|:--|:--|
| 錯誤聲明 | 「G4 S2 國語實際已 100% 完成（549 題全數 blind_evaluation=true、is_publishable=true），JOB-153 不應執行。」 |
| 錯誤來源 | JOB-152（白名單系統建置）於批量初始化時，對**所有現有題目**統一寫入 `blind_evaluation=true` + `is_publishable=true`，包含 L7~L12 的占位題（每課 0~1 題）。 |
| 數字誤讀 | 「549 題全部通過驗證」— 數字正確，但 L7~L12 占位題本身根本不是合格國語題目（例：L7 唯一一題為「台灣的國球是？」，與四下國語課程毫無關聯）。 |
| 教訓 | **`blind_evaluation=true` 不等於題目品質合格。白名單初始化只建立欄位，不驗證題目內容。驗收前必須同時確認題數分布是否達標。** |

---

## 📊 現況普查（2026-04-06 實測）

### 各課題數完整表

| 課次 | HanLin | KangHsuan | NanYi | 目標 | 缺口（最大） |
|:---:|:---:|:---:|:---:|:---:|:---:|
| L1 | 30 ✅ | 30 ✅ | 30 ✅ | 30 | 0 |
| L2 | 30 ✅ | 30 ✅ | 30 ✅ | 30 | 0 |
| L3 | 30 ✅ | 30 ✅ | 30 ✅ | 30 | 0 |
| L4 | 30 ✅ | 30 ✅ | 24 ⚠️ | 30 | 6 |
| L5 | 30 ✅ | 30 ✅ | 30 ✅ | 30 | 0 |
| L6 | 30 ✅ | 30 ✅ | 30 ✅ | 30 | 0 |
| L7 | 1 🚨 | 0 🚨 | 1 🚨 | 30 | 30 |
| L8 | 1 🚨 | 1 🚨 | 1 🚨 | 30 | 29 |
| L9 | 1 🚨 | 1 🚨 | 1 🚨 | 30 | 29 |
| L10 | 1 🚨 | 0 🚨 | 1 🚨 | 30 | 30 |
| L11 | 1 🚨 | 1 🚨 | 1 🚨 | 30 | 29 |
| L12 | 0 🚨 | 1 🚨 | 1 🚨 | 30 | 30 |
| **合計** | **185** | **184** | **180** | **360** | — |

**全站現況：549 / 1080 題（50.8%）**

### 各版本補題缺口

| 版本 | 需補課次 | 缺口題數 |
|:--|:--|:---:|
| HanLin | L7~L12（各 29~30 題）| **175 題** |
| KangHsuan | L7~L10（30/29/29/30）、L11~L12（29/29） | **176 題** |
| NanYi | L4（6 題）+ L7~L12（各 29 題）| **180 題** |
| **合計** | | **531 題** |

### 研究素材確認

| 素材 | 路徑 | 狀態 |
|:--|:--|:---:|
| KL3 四下國語發展綱要 | `knowledge/1_課綱研究/國語/四下/KL3_四下_國語_發展綱要.md` | ✅ 完整 |
| KL4 原始研究素材庫 | `knowledge/1_課綱研究/國語/四下/KL4_四下_國語_原始研究素材庫.md` | ✅ 完整（三版本 L1~L12 全課文索引） |

**KL3 + KL4 齊全，可直接進行出題，無需補充研究素材。**

---

## 🎯 任務目標

1. **清除占位題**：刪除 L7~L12 的無效占位題目
2. **補題**：三版本各課補至 30 題（CQI-P ≥ 5.5）
3. **盲測驗證**：三版本全部 36 課，Match Rate ≥ 85%
4. **Mismatch 審視**：所有 Mismatch 題目逐題分類，確認或修正
5. **結案**：`blind_evaluation=true` + `is_publishable=true` 欄位僅保留真正品質合格的題目

---

## 📖 執行步驟（嚴謹品控版）

### Phase 0：前置清理（Cursor 執行）

**目標**：刪除 L7~L12 所有占位題，為補題建立乾淨起點。

```bash
# 確認占位題範圍（執行前先確認）
node scripts/query_questions.js \
  question/platform/G4/Chinese/S2/HanLin \
  --lesson L7,L8,L9,L10,L11,L12 \
  --show-count

# 清除占位題（若無現成腳本，人工刪除各課 JSON 的 questions 陣列至空陣列）
# 參考：scripts/remove_g5s2_chinese_placeholder_questions.js（改寫 G4/Chinese/S2 路徑）
```

**驗收**：HanLin L7~L12、KangHsuan L7~L12、NanYi L4（24→0）、L7~L12 題數歸零。

> ⚠️ 清除前必須備份：`cp -r question/platform/G4/Chinese/S2 /tmp/g4_chinese_s2_backup_$(date +%Y%m%d)`

---

### Phase 1：補題（Cursor 出題 × AG 輔助）

**執行順序**：翰林 → 康軒 → 南一（每版本完成後回報 CQI-P，確認後再跑下一版本）

#### 翰林（HanLin）— 175 題缺口

目標課次：L7~L12（各 30 題）

| 課次 | 課名 | 目標 | 備註 |
|:---:|:---|:---:|:---|
| L7 | 棒球英雄夢 | 30 題 | 主題：追求夢想與團隊運動 |
| L8 | 夢幻全壘打 | 30 題 | 主題：棒球比賽精彩瞬間 |
| L9 | 單車遊日月潭 | 30 題 | 主題：旅遊記敘與自然景觀 |
| L10 | 孫悟空三借芭蕉扇 | 30 題 | 主題：西遊記經典情節 |
| L11 | 最後一片葉子 | 30 題 | 主題：經典翻譯文學·希望 |
| L12 | 閱讀課 | 30 題 | 主題：對閱讀經驗的省思 |

```bash
node scripts/auto_generate_questions.js \
  question/platform/G4/Chinese/S2/HanLin \
  --key Yotta --target 30 --threshold 5.5 \
  --lesson L7,L8,L9,L10,L11,L12
```

#### 康軒（KangHsuan）— 176 題缺口

目標課次：L7~L12（各 30 題）

| 課次 | 課名 | 目標 | 備註 |
|:---:|:---|:---:|:---|
| L7 | 未來的模樣 | 30 題 | 主題：職業想像與未來展望 |
| L8 | 小黑的新發現 | 30 題 | 主題：觀察力與好奇心 |
| L9 | 向太空出發 | 30 題 | 主題：火箭/太空科學與夢想 |
| L10 | 小青蛙想看海 | 30 題 | 主題：克服困難與冒險精神 |
| L11 | 窗前的月光 | 30 題 | 主題：自然美感描述 |
| L12 | 如來佛的手掌心 | 30 題 | 主題：西遊記古典文學 |

```bash
node scripts/auto_generate_questions.js \
  question/platform/G4/Chinese/S2/KangHsuan \
  --key Yotta --target 30 --threshold 5.5 \
  --lesson L7,L8,L9,L10,L11,L12
```

#### 南一（NanYi）— 180 題缺口

目標課次：L4（補至 30）+ L7~L12（各 30 題）

| 課次 | 課名 | 目標 | 備註 |
|:---:|:---|:---:|:---|
| L4 | 蝶之生 | 30 題（補 6 題）| 主題：蝴蝶成長史 |
| L7 | 不一樣的母親花 | 30 題 | 主題：台灣特色花卉與象徵 |
| L8 | 屋頂上的野貓 | 30 題 | 主題：動物觀察與都會生態 |
| L9 | 用一公斤愛嘉明湖 | 30 題 | 主題：環境保護與無痕山林 |
| L10 | 想像與發明 | 30 題 | 主題：創意發想與科學改善 |
| L11 | 小事物 大驚奇 | 30 題 | 主題：對平凡事物的細微觀察 |
| L12 | 九蛙傳奇 | 30 題 | 主題：地標故事與氣候警示 |

```bash
node scripts/auto_generate_questions.js \
  question/platform/G4/Chinese/S2/NanYi \
  --key Yotta --target 30 --threshold 5.5 \
  --lesson L4,L7,L8,L9,L10,L11,L12
```

#### Phase 1 品質卡點

- 每版本每課補完後即執行 `evaluate_question_quality.js` 確認 CQI-P ≥ 5.5
- 若 CQI-P < 5.5 → **停止，回報 Claude Code 決策，不得繼續下一課**
- CQI-P 達標後方可進入 Phase 2 盲測

---

### Phase 2：盲測驗證（Cursor 執行）

**對象**：三版本全 36 課（包含 L1~L6 已有題目亦需重新盲測，因 JOB-152 的批量初始化並未實際執行盲測邏輯）

#### 執行指令

```bash
# 翰林 — 全 12 課
node scripts/run_blind_eval.js \
  question/platform/G4/Chinese/S2/HanLin --force

# 康軒 — 全 12 課
node scripts/run_blind_eval.js \
  question/platform/G4/Chinese/S2/KangHsuan --force

# 南一 — 全 12 課
node scripts/run_blind_eval.js \
  question/platform/G4/Chinese/S2/NanYi --force
```

#### 盲測驗收標準

| 指標 | 門檻 | 未達標時 |
|:--|:--|:--|
| 各版本整體 Match Rate | ≥ 85% | 提取 Mismatch 清單 → Phase 3 |
| 各課 Match Rate | ≥ 80%（課次下限）| 標記為高風險課次，優先審視 |

> 📌 **注意**：L1~L6 的現有題目（已有 `blind_evaluation=true`）使用 `--force` 強制重測，以取得真實盲測數據，覆蓋 JOB-152 的批量初始化值。

---

### Phase 3：Mismatch 審視（Claude Code 執行）

**執行者**：Claude Code（非 Cursor）— 此步驟需要人工語意判斷。

Cursor 完成盲測後，回報以下資料供 Claude Code 審視：

```
1. 三版本各課 Match Rate 表
2. 全站 Mismatch 題目清單（JSON 格式，含 question_stem + model_answer + ai_answer）
3. 任何 CQI-P < 5.5 的課次標記
```

#### Mismatch 分類準則

依 `question/README_驗證與盲測準則.md §2.5`：

| 類型 | 判斷標準 | 處置 |
|:--|:--|:--|
| **A. answer_index 錯誤** | AI 選的答案確為正確答案，但 `answer_index` 填錯 | 修正 `answer_index`，標記 `corrected` |
| **B. 題幹/選項邏輯問題** | AI 選錯，但能判斷是題目有誤 | 修正題幹或選項，重新出題 |
| **C. AI 能力限制** | 題目需視覺、計算、罕見文化知識，AI 無法判斷 | 標記 `review_status: confirmed`，保留原答案 |
| **D. 爭議題** | 多個選項均可辯論 | 修改選項使答案唯一，重出 |

- Mismatch 超過 3 題的課次 → 全課逐題審視
- 修正後重新執行該課盲測，確認 Match Rate 回升

---

### Phase 4：結案驗收

Cursor 完成 Phase 1~2 後，Claude Code 確認以下全部通過方可結案：

#### 補題驗收

- [ ] HanLin L7~L12 各 ≥ 30 題，CQI-P ≥ 5.5
- [ ] KangHsuan L7~L12 各 ≥ 30 題，CQI-P ≥ 5.5
- [ ] NanYi L4 ≥ 30 題、L7~L12 各 ≥ 30 題，CQI-P ≥ 5.5
- [ ] 全站合計：三版本各 360 題（共 1,080 題）

#### 盲測驗收

- [ ] HanLin Match Rate ≥ 85%（各課 ≥ 80%）
- [ ] KangHsuan Match Rate ≥ 85%（各課 ≥ 80%）
- [ ] NanYi Match Rate ≥ 85%（各課 ≥ 80%）
- [ ] 全站 Mismatch 題目已全部分類處理（`confirmed` 或 `corrected`）
- [ ] 無任何題目殘留 `review_status: pending_review`（Phase 3 遺漏風險）

#### 欄位一致性驗收

- [ ] 執行 `node scripts/validate_review_fields.js question/platform/G4/Chinese/S2`
- [ ] 無 JSON 格式錯誤，無缺失必要欄位
- [ ] `blind_evaluation=true` 的題目均具備真實盲測數據（非批量初始化值）

#### 結案文件

- [ ] `JOB-159-Report.md` 已產出（含三版本 Match Rate 表、Mismatch 統計、修正記錄）
- [ ] 已執行 `/pj_sync` 同步進度

---

## 💲 成本預估

| 項目 | 課次數 | 題數 | API 消耗 |
|:--|:---:|:---:|:---:|
| Phase 0 清除占位題 | — | — | 0 RPD |
| Phase 1 補題（翰林） | 6 課 | ~175 題 | ~130~175 RPD |
| Phase 1 補題（康軒） | 6 課 | ~176 題 | ~130~175 RPD |
| Phase 1 補題（南一） | 7 課 | ~180 題 | ~135~180 RPD |
| Phase 2 盲測（全 3 版本 × 36 課） | 108 課次 | ~1,080 題 | ~200~250 RPD |
| **合計** | | **531 題補 + 1,080 題驗** | **~595~780 RPD** |
| **使用金鑰** | | | Yotta（Gemini-3.1-Flash-Lite） |

---

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `knowledge/1_課綱研究/國語/四下/KL3_四下_國語_發展綱要.md` | 三版本 L7~L12 課程主題與命題導引 |
| `knowledge/1_課綱研究/國語/四下/KL4_四下_國語_原始研究素材庫.md` | 三版本全課文索引 |
| `question/README_出題與品管準則.md` | 出題原則、CQI-P 計算方式 |
| `question/README_驗證與盲測準則.md` | 盲測流程、Mismatch 分類準則 §2.5 |
| `docs/README_任務派工準則.md` | 派工生命週期、開結案管線 |

---

## ✅ 啟動 Checklist（Pre-Flight）

- [ ] 已讀取 KL3 + KL4 四下國語素材（三版本 L7~L12 課文確認）
- [ ] 已確認執行模型：Gemini-3.1-Flash-Lite（Yotta 金鑰）
- [ ] 已確認操作頻次：QPM ≤ 2（避免配額超限）
- [ ] 已備份現有 JSON：`cp -r question/platform/G4/Chinese/S2 /tmp/g4_chinese_s2_backup_YYYYMMDD`
- [ ] 已清除 L7~L12 占位題（Phase 0 完成）
- [ ] 已與 Claude Code 確認：**L1~L6 盲測使用 `--force` 強制重測**（覆蓋 JOB-152 初始化值）

---

## 💬 真實回報本次對話的模型與花費

＄作業匯總：Token數:- | 花費:- | 使用模型:- | 執行者:-
