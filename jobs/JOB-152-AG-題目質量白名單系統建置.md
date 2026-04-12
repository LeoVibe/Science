*Created by USER at 2026-04-05*
`last_updated`: 2026-04-05 08:40
`updated_by`: Claude Code (claude-haiku-4-5)

# JOB-152-AG-題目質量白名單系統建置

**`job_type`**: `system_infrastructure + data_migration`
**預計 API 消耗**：0 RPD（本地計算 + 代碼修改）

> 執行架構：USER 確認方案 → Cursor 執行三階段 → Claude Code 驗收

---

## 📌 任務背景

EIDOS 題庫為確保發佈質量，需建置「題目級審核白名單系統」：
- 所有題目預設不發佈（`is_publishable: false`）
- 只有經盲測驗證 + 人工確認正確的題目才發佈（改為 `true`）
- 後台需過濾器識別待審核題目，支持逐題審核操作

本派工為三個階段的完整系統建置。

---

## 🎯 任務目標

1. ✅ 更新所有題目 JSON 結構，添加審核欄位
2. ✅ 掃描並初始化現有題庫審核狀態
3. ✅ 開發後台過濾器（題目列表 + 逐題審核頁面）
4. ✅ 修改發佈邏輯，只發佈通過審核的題目

---

## 📖 執行範圍

### 涉及目錄
```
question/platform/G[3-6]/[Chinese/Math/English/Science/Social]/S[1-2]/*/
```

### 涉及課檔
估計 ~500+ 個課檔，~40,000+ 個題目

### 不涉及
- KL4 研究文檔（保持原樣）
- 使用者前台界面（暫不修改）

---

## 📋 Phase 1：數據結構更新（2-3 天）

### Step 1.1：更新 JSON Schema

在每個題目 JSON 中添加以下欄位：

```json
{
  "question": "...",
  "answer_index": 2,
  "cqi_score": 7.5,
  
  // ← 新增以下審核欄位
  "is_publishable": false,           // false=不發佈，true=發佈
  "review_status": "pending_review", // pending_review / confirmed / corrected / needs_rework
  "review_notes": "",                // 審核備註（人工填寫）
  "reviewer": null,                  // 審核者 ID
  "review_date": null,               // 審核時間
  
  "blind_eval_mismatch": {
    "ai_selected": 1,
    "correct_answer": 2,
    "reason": "...",
    "review_status": "confirmed"  // ← 已有，保持
  }
}
```

### Step 1.2：批量初始化現有題庫

執行掃描腳本：

```bash
node scripts/initialize_review_fields.js

邏輯：
for each question in all JSON files:
    if question.blind_evaluation == true AND question.blind_eval_mismatch.review_status == "confirmed":
        is_publishable: true
        review_status: "confirmed"
        review_date: (today)
    else:
        is_publishable: false
        review_status: "pending_review"
```

**預期結果：**
```
初始化統計：
├─ 已發佈題目（is_publishable: true）：X 題
├─ 待審核題目（is_publishable: false）：Y 題
└─ 合計：X + Y = 40,000+ 題
```

### Step 1.3：驗證數據完整性

```bash
node scripts/validate_review_fields.js

檢查：
- 所有題目都有 is_publishable 欄位
- 所有題目都有 review_status 欄位
- 邏輯一致性（已發佈題目必須有 review_date）
```

---

## 📋 Phase 2：後台過濾器開發（5-7 天）

### Step 2.1：後台查詢介面

**路由：** `/admin/review/dashboard`

**頁面元件：**
```
【G3-G6 所有科目 - 審核儀表板】

過濾條件區
┌─────────────────────────────────────┐
│ 級級選擇：[ G3 ▼ ]                  │
│ 科目：[ Chinese ▼ ]                 │
│ 版本：[ All ▼ ]                     │
│ 課檔：[ All ▼ ]                     │
│ 審核狀態：[ pending_review ▼ ]      │
│ 搜尋題號：[________]                │
│ [搜尋] [重置] [匯出清單]            │
└─────────────────────────────────────┘

統計摘要
┌─────────────────────────────────────┐
│ 總題數：270         已發佈：100      │
│ 待審核：170        需重測：30       │
└─────────────────────────────────────┘

題目列表
┌─────────────────────────────────────┐
│ [ ] | 課   | 題號 | 題文預覽 | 狀態 │
├─────────────────────────────────────┤
│ [ ] | L1   | Q1   | 圓的直... | ⏳  │
│ [ ] | L1   | Q2   | 圓心位... | ⏳  │
│ [ ] | L4   | Q5   | 25÷3... | ⏳  │
│ ...                              │
├─────────────────────────────────────┤
│ [全選] [批量操作] [上一頁][下一頁] │
└─────────────────────────────────────┘
```

### Step 2.2：逐題審核頁面

**路由：** `/admin/review/question/:questionId`

**頁面元件：**
```
【審核題目】L1 Q1

基本信息
├─ 題文：圖中圓的直徑是多少公分？
├─ 選項：A) 10  B) 25  C) 5  D) 2
├─ 正確答案：A（10 公分）
├─ CQI-P 分數：7.5
└─ 盲測結果：ai = -1（無法判斷）
             原因：AI 無法看圖（視覺限制）

審核資訊
├─ 審核狀態：[ ○ pending ○ confirmed ○ needs_rework ]
├─ 審核備註：
│  ┌──────────────────────────────┐
│  │ 圓形題，需要看圖片判斷...    │
│  └──────────────────────────────┘
└─ 審核者：(自動填入當前使用者)
  審核時間：(自動填入)

操作按鈕
┌──────────────────────────────────┐
│ [✓ 確認發佈] [⟳ 需重測] [✗ 需重出] │
│ [取消] [上一道] [下一道]         │
└──────────────────────────────────┘
```

### Step 2.3：批量操作功能

**支援操作：**
```
□ 批量開啟發佈
  - 選中多道題目
  - 確認後全部改為 is_publishable: true

□ 批量標記重測
  - 批量改為 review_status: "needs_rework"

□ 匯出待審核清單
  - 下載 CSV/Excel 表格
  - 便於離線審核
```

---

## 📋 Phase 3：發佈篩選邏輯（1-2 天）

### Step 3.1：修改發佈腳本

**檔案：** `scripts/build_public_library.js`

**修改邏輯：**
```bash
# 發佈前篩選
build_public_library.js:
  for each course in all courses:
    for each lesson in course:
      export_questions = lesson.questions.filter(q => q.is_publishable == true)
      
      if export_questions.length > 0:
        generate_json(export_questions)
      else:
        skip_this_lesson()  // 無可發佈題目

report:
  ├─ G3 S2 數學翰林：220/270 題已發佈
  ├─ G3 S2 數學康軒：209/266 題已發佈
  ├─ G3 S2 數學南一：244/300 題已發佈
  └─ 合計：673/836 題已發佈
```

### Step 3.2：生成發佈統計報告

**報告檔案：** `jobs/JOB-152-Publication-Report.md`

**內容：**
```
# JOB-152 發佈統計報告

## 各版本發佈情況

| 科目 | 版本 | 原始 | 已發佈 | 待審核 | 發佈率 |
|:--|:--|:--|:--|:--|:--|
| 數學 | HanLin | 270 | 220 | 50 | 81.5% |
| 數學 | KangHsuan | 266 | 209 | 57 | 78.6% |
| 數學 | NanYi | 300 | 244 | 56 | 81.3% |

## 待審核課檔優先度

| 課檔 | 待審核數 | 主要問題 | 優先度 |
|:--|:--|:--|:--|
| L4（圓形）| 30 | AI 視覺限制 | P1 |
| L5（除法）| 15 | AI 計算限制 | P2 |
| L9（統計）| 25 | AI 視覺限制 | P1 |
```

---

## 🚧 任務邊界

### ✅ 只做：

- 添加 JSON 審核欄位
- 批量初始化現有題庫狀態
- 開發後台過濾器和審核頁面
- 修改發佈篩選邏輯

### ❌ 不做：

- 修改題目內容
- 人工審核（由 USER 稍後在後台進行）
- 前台使用者界面修改

---

## ✅ 啟動 Checklist

- [x] 執行環境確認：Node.js + React（後台框架）
- [x] 數據庫連接確認
- [x] 備份現有題庫 JSON
- [ ] 已讀取 `question/README_出題與品管準則.md`

---

## ✅ 成果 Checklist

### Phase 1：
- [ ] 所有 JSON 已添加審核欄位
- [ ] 初始化腳本執行完成
- [ ] 驗證報告：0 個欄位缺失

### Phase 2：
- [ ] 後台儀表板頁面完成
- [ ] 逐題審核頁面完成
- [ ] 批量操作功能完成
- [ ] 功能測試通過

### Phase 3：
- [ ] 發佈篩選邏輯修改完成
- [ ] 發佈統計報告生成完成
- [ ] 測試發佈（確認只發佈 is_publishable=true 的題目）

### 全體：
- [ ] `jobs/JOB-152-Report.md` 完成
- [ ] 進度表已同步（`/pj_sync`）

---

## 🔍 Claude Code 後續責任

1. 驗收三個階段完成質量
2. 確認數據初始化邏輯正確
3. 測試後台過濾器功能
4. 測試發佈篩選結果

---

## 💲 成本預估

| 項目 | 預估值 |
|:--|:--|
| **代碼行數** | ~2000-2500 行（後台 + 腳本） |
| **耗時** | 8-12 天（Phase 1: 2-3d, Phase 2: 5-7d, Phase 3: 1-2d） |
| **API 消耗** | 0 RPD（本地計算，無需 API） |
| **花費** | NT$0（內部工程） |
| **執行者** | Cursor（或 Antigravity） |

---

## 📝 參考檔案

- `question/README_出題與品管準則.md`
- `scripts/run_blind_eval.js`（參考 blind_eval 欄位結構）
- `jobs/JOB-143-Report.md`（參考審核報告格式）

---

## 真實回報本次派工單

＄作業匯總：Token數:- | 花費: $- | 使用模型: claude-haiku-4-5 | 執行者: Cursor / Antigravity
