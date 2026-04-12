*Created by Claude Code at 2026-04-12*

`last_updated`: 2026-04-12
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-184-AG-G5S2-社會-三版本出題

**`job_type`**: `question_prod`
**`executor`**: Cursor（全權負責，包括選擇出題模型）

---

## 📌 任務背景

G5S2 社會科 KL4 單課研究已於 JOB-180 建置完成（翰林 L1–L6、康軒 L1–L5、南一 L1–L5，共 32 檔）。現有題庫極少（翰林 4 題、康軒 16 題、南一 4 題），需全面出題建置。

---

## 🎯 任務目標

為以下 16 課出題，每課 40–50 題（合計 ~640–800 題），達到：
- ✅ CQI-P ≥ 5.5（quality QL3+）
- ✅ 每題含 `scenario`、`explanation`、`commonMisconception`
- ✅ 與 KL4 課綱研究充分對應
- ✅ 準備供後續盲測驗證

---

## 📋 出題課程（16 課）

### 翰林（6 課）
- L1《日治下的臺灣》
- L2《追求民主之路》
- L3《多元文化的盛會》
- L4《各地家鄉的風采》
- L5《臺灣經濟的展望》
- L6《幸福社會的藍圖》

### 康軒（5 課）
- L1《臺灣近代化的過程》
- L2《日治時期的臺灣》
- L3《追求自由與民主》
- L4《多元社會與文化》
- L5《守護家園與傳承》

### 南一（5 課）
- L1《落地生根家鄉情》
- L2《勢力競逐新天地》
- L3《建設家鄉新家園》
- L4《工作與生活》
- L5《永續家園》

---

## 🚧 任務邊界

**本次任務只做**：
- 讀取 KL4 單課研究（研究紀錄 + 考古題與討論）
- 依 KL4 研究素材出題（40–50 題/課）
- 逐題填入 `scenario`、`explanation`、`commonMisconception`
- 執行 CQI-P 達標確認（CQI-P ≥ 5.5）
- 更新 `manifest.json`

**本次任務不做**：
- 盲測驗證（另開 question_verify JOB）
- 修改 KL4 素材
- 修改任何規範文件

---

## 📖 執行步驟

### Phase 1: 準備
1. 讀取 `knowledge/課綱研究/社會/五下/[版本]/KL4_五下_[版本]_L*_[課名]_單課研究紀錄.md`
2. 讀取 `knowledge/課綱研究/社會/五下/[版本]/KL4_五下_[版本]_L*_[課名]_考古題與討論.md`
3. 確認課文主題、學習目標、KL4 考點

### Phase 2: 出題
4. **基於 KL4 研究**出題 40–50 題/課
5. 遵循認知配比（G5 高年級）：
   - 直接提取 (20%)：事實、定義、細節定位
   - 直接推論 (30%)：根據線索推斷
   - 詮釋整合 (30%)：跨段落整合、因果關係
   - 評估批判 (20%)：史料評估、論證、影響評價
6. 逐題填入：
   - `scenario`：題目情境/引導
   - `explanation`：為何此答案正確
   - `commonMisconception`：常見迷思
   - `answer_index`：與 explanation 一致性檢查
   - `is_publishable`: false
   - `review_status`: pending_review
   - `reviewer`: null
   - `review_date`: null
   - `review_notes`: ""

### Phase 3: 品管
7. 執行 CQI-P：`node scripts/evaluate_question_quality.js question/platform/G5/Social/S2/[版本]`
8. 修正 quality < QL3 的課次
9. 重複執行直到全課達標

### Phase 4: 結案
10. 更新 `manifest.json`
11. 產出 `jobs/JOB-184-Report.md`（出題統計、CQI-P 最終值）

---

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `knowledge/課綱研究/社會/五下/翰林/KL4_*.md` | 翰林出題素材（研究紀錄 + 考古題） |
| `knowledge/課綱研究/社會/五下/康軒/KL4_*.md` | 康軒出題素材 |
| `knowledge/課綱研究/社會/五下/南一/KL4_*.md` | 南一出題素材 |
| `question/README_出題與品管準則.md` | 出題原則、JSON 格式規範、認知配比 |
| `_agent/API_RULES.md` | 出題 API 成本控制 |

---

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] 已讀取 `question/README_出題與品管準則.md`
- [ ] 已讀取 KL4 課綱研究素材（16 課全數確認路徑可用）
- [ ] **已確認執行模型**：[模型選擇由 Cursor 決定]
- [ ] **已確認使用金鑰**：[Cursor 自主配置]
- [ ] **已確認 QPM**：[Cursor 自主評估]
- [ ] 目標題數已確認：16 課 × 40–50 題 = ~640–800 題

## ✅ 驗收 Checklist (Acceptance)

- [ ] 翰林 6 課全數出題完成（L1–L6）
- [ ] 康軒 5 課全數出題完成（L1–L5）
- [ ] 南一 5 課全數出題完成（L1–L5）
- [ ] 每課題數：40–50 題（實際值：_____）
- [ ] CQI-P ≥ 5.5（quality QL3+，每課均達標）— 實際值：各課填入
- [ ] 每題含 `scenario` 欄位（不為空）
- [ ] 每題含 `explanation` 欄位（清晰說明為何選此答案）
- [ ] 每題含 `commonMisconception` 欄位（說明常見錯誤）
- [ ] `answer_index` 與 `explanation` 描述一致
- [ ] `validate_review_fields.js` → 0 errors
- [ ] `manifest.json` 已更新題數

## ✅ 成果 Checklist (Deliverables)

- [ ] 16 課全數出題完成，JSON 檔案已產出
- [ ] 所有課次 CQI-P ≥ 5.5，修正循環完成
- [ ] `manifest.json` 已更新題數
- [ ] `jobs/JOB-184-Report.md` 已產出（含出題統計、CQI-P 最終值、異動清單）
- [ ] `docs/進度彙整_題庫研發與產出.md` 已更新 CQI-P 欄
- [ ] 已執行 `/pj_sync`

---

## ⏱️ 執行時間回報

| 子任務 / 階段 | 開始時間 | 結束時間 | 耗時（分鐘） | 備註 |
|:--|:--|:--|:--|:--|
| Phase 1–2 出題 | — | — | — | |
| Phase 3 CQI-P + 修正 | — | — | — | |
| Phase 4 結案 | — | — | — | |
| **總計** | — | — | **—** | — |

---

## 真實回報本次對話的模型與花費

＄作業匯總：Token數: — | 花費: — | 使用模型: [Cursor 自主決定] | 執行者: Cursor
