*Created by Claude Code (claude-sonnet-4-6) at 2026-04-10 19:00:00*

`last_updated`: 2026-04-10 19:00:00
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-171-AG-G4S2-社會三版本補題盲測至上版

**`job_type`**: `mixed`（question_prod + question_verify）
**`executor`**: Cursor
**`verifier`**: Claude Code（PM）
**`depends_on`**: JOB-170（KL4 單課研究建置完成後方可啟動）

---

## 📌 任務背景

G4S2 社會三版本題數嚴重不足（各課僅 5-11 題），且全數未盲測：

| 版本 | 課數 | 現有總題數 | 處置 |
|:--|:--:|:--:|:--|
| 康軒 | 6 | 32（各課 5-6） | 補題至 30 題/課 |
| 翰林 | 6 | 34（各課 5-7） | 補題至 30 題/課 |
| 南一 | 6 | 38（各課 5-11） | **全部重產**（現有題品質存疑、課名不符） |

**meta.title 問題**：三版本 JSON 共用同一組課名，不符實際課程結構。需依 JOB-170 確認的正確課名修正。

**正確課名對照**：

| L | 康軒 | 翰林 | 南一 |
|:--|:--|:--|:--|
| L1 | 家鄉的產業（上） | 家鄉老故事 | 家鄉的地形與生活 |
| L2 | 家鄉的產業（下） | 家鄉的山與海 | 家鄉的氣候與生活 |
| L3 | 家鄉的人口與交通（上） | 家鄉的水資源 | 家鄉的產業與創新 |
| L4 | 家鄉的人口與交通（下） | 家鄉的新商機 | 家鄉的人口與交通 |
| L5 | 家鄉風情畫（上） | 家鄉新願景 | 家鄉的多元文化 |
| L6 | 家鄉風情畫（下） | 歡迎來到我的家鄉 | 想像家鄉的樣子 |

---

## 🎯 任務目標

1. 修正三版本 meta.title
2. 康軒/翰林補題至 30 題/課，南一全部重產 30 題/課
3. 全部盲測，各課 `is_publishable: true` ≥ 25

---

## 🚧 任務邊界

**只做：**
- meta.title 修正
- 康軒/翰林補題 + 南一全部重產
- 全課盲測 + Mismatch 審查
- is_publishable 更新 + manifest

**不做：**
- 其他科目/年級
- 修改規範文件或 KL 素材

---

## 📖 執行步驟

### Phase 0：修正 meta.title

依上方正確課名對照表修正所有 18 個 JSON 的 `meta.title`。

### Phase 1：補題/重產（question_prod）

**康軒 L1-L6**：各補至 30 題（現有 5-6 題，每課約補 24-25 題，共 ~148 題）
**翰林 L1-L6**：各補至 30 題（現有 5-7 題，每課約補 23-25 題，共 ~146 題）
**南一 L1-L6**：**清空 questions 陣列（保留 meta），全部重產 30 題/課（共 180 題）**

**出題關鍵要求**（自然南一教訓）：
- ⚠️ **逐課讀 KL4 單課研究檔**，嚴格按該課主題出題
- ⚠️ **禁止跨課混題**（如「產業」課不得出現「交通」內容）
- ⚠️ **禁止是非題**，必須四選一（options 恰好 4 項）
- 新題設定：`blind_evaluation: false`、`is_publishable: false`、`review_status: pending_review`
- 含 `scenario`（非空）、`explanation`、`commonMisconception`

研究素材：
- KL4：`knowledge/課綱研究/社會/四下/{康軒,翰林,南一}/KL4_四下_{出版社}_L{N}_{課名}_單課研究紀錄.md`（JOB-170 產出）
- KL3：`四下_社會_發展綱要.md` + `G4_S2_社會_原始研究素材庫.md`

補題後執行：
```bash
node scripts/evaluate_question_quality.js question/platform/G4/SocialStudies/S2/KangHsuan
node scripts/evaluate_question_quality.js question/platform/G4/SocialStudies/S2/HanLin
node scripts/evaluate_question_quality.js question/platform/G4/SocialStudies/S2/NanYi
node scripts/auto_balance_json.js question/platform/G4/SocialStudies/S2
```

### Phase 2：盲測（question_verify）

```bash
node scripts/run_blind_eval.js question/platform/G4/SocialStudies/S2/KangHsuan --force
node scripts/run_blind_eval.js question/platform/G4/SocialStudies/S2/HanLin --force
node scripts/run_blind_eval.js question/platform/G4/SocialStudies/S2/NanYi --force
```

**盲測模型**：`gemini-3-flash-lite`（免費額度，已核准）

### Phase 3：Mismatch 審查 + is_publishable + 收尾

- TYPE-A/B/C 逐題分類
- ai=-1 → `is_publishable: false`（嚴格執行）
- Match + CQI ≥ 6.5 → `is_publishable: true`
- TYPE-B > 5% → 標記警告回報 PM
- 南一若 Match Rate < 70% → 立即回報 PM，不自行處理
- normalize_manifest + Report + /pj_sync + close

---

## 📖 執行前必讀

| 文件 | 用途 |
|:--|:--|
| `question/README_出題與品管準則.md` | 出題原則、四選一規範 |
| `question/README_驗證與盲測準則.md`（v4.2） | 盲測流程、上版門檻 |
| JOB-170 產出的 KL4 檔案 | 單課研究素材 |

---

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] **前置確認**：JOB-170 已完成，KL4 檔案已存在
- [ ] 已讀取出題準則 + 盲測準則
- [ ] **Cursor 作業模型**：`composer-2`（已核准）
- [ ] **盲測 API 模型**：`gemini-3-flash-lite`（已核准）

---

## ✅ 驗收 Checklist (Acceptance)

### 補題驗收
- [ ] 康軒 L1-L6 各 30 題
- [ ] 翰林 L1-L6 各 30 題
- [ ] 南一 L1-L6 各 30 題（全部重產）
- [ ] meta.title 修正完成（18 個 JSON）
- [ ] 三版本各課 CQI-P ≥ 5.5
- [ ] 全部四選一（無是非題）
- [ ] 無跨課混題

### 盲測驗收
- [ ] 三版本各課 `is_publishable: true` ≥ 25
- [ ] ai=-1 → is_publishable: false（0 違規）
- [ ] TYPE-B 比例 ≤ 5%
- [ ] Match Rate 記錄

---

## ✅ 成果 Checklist (Deliverables)

- [ ] 產出 `jobs/JOB-171-Report.md`
- [ ] 執行 `/pj_sync`
- [ ] 執行 `node scripts/job_manager.js close JOB-171`
- [ ] 通知 Claude Code（PM）驗收

---

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:{真實Meta中數字} | 花費: ${換算台幣} | 使用模型: composer-2 / gemini-3-flash-lite | 執行者: Cursor
