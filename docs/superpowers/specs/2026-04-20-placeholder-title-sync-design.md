---
name: Placeholder Title Sync from Materials Library — Design
date: 2026-04-20
owner: Claude Code (claude-opus-4-7)
job: JOB-205 補登階段
---

# Placeholder Title Sync from Materials — Design

## 背景

JOB-205 階段 3 僅從 **KL4 per-lesson 檔名** 補了 G5 Math S2（30 課）、從**英語發展綱要 §三.1** 補了 G3 ENG S2（12 課）。使用者於 2026-04-20 19:30 質疑後，發現 PM 原盤點遺漏：其他科目的「**原始研究素材庫**」（`knowledge/1_課綱研究/{科目}/G{N}_S{M}_{科目}_原始研究素材庫.md` 與 `G{N}_S{M}_{科目}_原始研究素材庫.md` 或 `{學期}_{科目}_發展綱要.md`）其實含有三版逐課章節名，只是格式多樣。

## 目標

1. 解析所有 S2 科目素材庫的章節表，建立 `{subject, grade, semester, publisher, lesson_num} → real_title` 映射。
2. 以**多源一致 β 規則**決定寫入值，衝突時不寫入並列入告警清單。
3. 把可信 title 寫入 `question/platform/.../manifest.items[].title` 與對應 `lesson.json:meta.title`。
4. 寫入 `docs/question-audit/title-conflicts.md` 記錄所有衝突。
5. 更新 JOB-205 Report 增「補登階段」章節。

## 範圍

- **做**：G3 數/自/社 S2、G4 數 S2、G6 數/自/社 S2，共 7 組合 × 3 publisher = 21 manifest，約 125 課。
- **回溯驗證**：JOB-205 階段 3 已寫入的 G5 Math × 3（30 課），特別是已知衝突的 L5。
- **不做**：英語（使用者指示）、所有 S1、題目內容審核（屬 JOB-206）。

## 素材庫 5 種 Pattern

| 代號 | 典型檔案 | 結構特徵 |
|:--:|:--|:--|
| **A** | G3_S2_數學 / 自然 / 社會 | 三 H3 區塊（康/翰/南）各自一張 `\| U{n} \| 課名 \| ... \|` 表 |
| **B** | G4_S2_數學、G5_S2_數學 | 單一合併表 header 含三版，列為 `\| U{n} \| 康名 \| 翰名 \| 南名 \|` |
| **C** | G6_S2_數學 | 三 H3 區塊各自表，但用 `\| L{n} \| 單元名 \| ... \|`（L 而非 U）|
| **D** | G6_S2_自然、G6_S2_社會 | 三版合併矩陣，cell 內第一行 `**1. 單元名**<br/>1-1 ...<br/>1-2 ...` |
| **E** | G3_S2_英語 發展綱要 §三.1 | 條列 `- Unit 1: *課名* (說明)`（本 JOB 不用）|

## Parser 設計

### 輸入

- 指定 `{subject, grade, semester}` 參數
- 依映射表找對應素材庫 / 發展綱要檔

### 流程

```
1. 讀取檔案全文
2. 嘗試 Pattern A 判定（找「### .*康軒」「### .*翰林」「### .*南一」三個 section）
   └─ 若三個都找到且各自含 | U\d+ | 或 | L\d+ | 表 → parse，完成
3. 若 A 失敗，嘗試 Pattern B（找單表 header 含三版 + 列 | U\d+ | a | b | c |）
4. 若 B 失敗，嘗試 Pattern D（找三版矩陣，cell 抓第一行 <b>N. 名稱</b>）
5. 若全失敗，log warning，回傳空映射
```

### 輸出

`{'KANGHSUAN': {1: '分數的加減', 2: '除法', ...}, 'HANLIN': {...}, 'NANYI': {...}}`

## 多源一致 β 規則實作

對每個 (manifest, lesson_num)，收集候選值：

| 源 | 本 JOB 行為 |
|:--|:--|
| 素材庫 parse 結果 | 主候選 |
| 已存 manifest.items[i].title（若非 LN）| 次候選（僅 JOB-205 已寫入者）|
| 已存 lesson.json:meta.title（若非 LN）| 同上 |
| KL4 檔名（若有） | 加強票 |

**寫入決策**：
- 若所有非空候選值**完全一致** → 寫入
- 若有 ≥2 個一致 且另外 1 個不同 → 採多數票但寫入 `conflicts` 清單備查
- 若所有候選彼此不同（全衝突）→ 不寫入，全部列衝突清單
- 若只有 1 個候選（素材庫唯一源）→ 直接寫入（暫時接受單源，vision 驗證可後補）

## 衝突清單格式

`docs/question-audit/title-conflicts.md`:

```md
# Manifest title-sync 衝突清單

`last_updated`: 2026-04-20 HH:MM
`來源 JOB`: JOB-205 補登階段

## 衝突項目

### G5_S2_MATH_HANLIN_L5（已知）
- 現存 manifest.items[].title: 「整數小數除以整數」（來源：KL4 檔名）
- 素材庫 pattern B U5: 「多邊形與扇形」
- **推測原因**：素材庫早於 KL4 研究，可能初版課目順序後來修訂
- **建議**：保留 KL4 值不動（題庫題目已對應該主題），素材庫改名同步（Phase 2 手動）
- **狀態**：保留現值，待人工裁決

...（其他衝突）
```

## Vision 驗證（事後抽驗）

- `knowledge/source/` 含 4 張 G3 三下圖：
  - `三下數學_康軒.jpg` → 驗證 G3 Math KANGHSUAN
  - `三下自然_康軒.jpg` → 驗證 G3 SCI KANGHSUAN
  - `三下社會_翰林.jpg`、`三下社會_翰林2.jpg` → 驗證 G3 SOC HANLIN
- 用 Read tool（supports jpg）讀圖 → 人工比對 parser 輸出
- 結果寫入 `docs/question-audit/material-vs-textbook-verification.md`

## WebSearch 觸發（僅衝突）

**不需要**主動 WebSearch。只有：
- G5 Math HanLin L5（已知衝突）需裁決 → 查翰林五下數學官方目錄

預期 WebSearch 次數：**≤ 1 次**

## Commit 策略

- 在 `job-205-placeholder-fix` branch 追加（JOB-205 已 close 但 branch 活著，符合「不浮濫派工」原則）
- 單一 commit：`feat(data): JOB-205 補登 G3/G4/G6 數自社 title 從素材庫 parse`
- 更新 `jobs/JOB-205-Report.md` 追加「補登階段」章節

## 驗收

- `verify_no_placeholder_title.mjs` 開放範圍 placeholder manifest 從 27 降至 ≤ 3（剩英語 S2 × 3）
- `docs/question-audit/title-conflicts.md` 若有衝突已列
- L1-3 `verify_ui_data_integrity.mjs --gate` 0 違規
- Build 通過

## 已識別風險

| 風險 | 緩解 |
|:--|:--|
| Parser 格式判錯（未落入 5 種 pattern）| 先 dry-run，失敗組合手動記錄 + 列遺留 |
| G5 Math HanLin L5 衝突擴散（可能其他課也有）| 回溯驗證 G5 Math 30 課全部，列衝突 |
| 素材庫本身有 typo 或排序錯誤 | 衝突清單人工審閱；vision 驗證抽樣 |
| manifest items.length 與素材庫課數不一致 | parser 按 lesson_num 對應，多的標「L{n} 超出素材庫」；少的略過 |

## 測試策略

1. `--dry-run` 模式先跑，print 所有 `(manifest, lesson_num, oldTitle, newTitle, conflict_yn)`
2. 人工抽看 5-10 對確認正確後 `--write`
3. 跑 `verify_no_placeholder_title.mjs` 驗證 placeholder 下降
4. 跑 `verify_ui_data_integrity.mjs --gate`
5. Build check

## 不做（邊界）

- ❌ 動題目內容（scenario / question / explanation）
- ❌ 改題庫 is_publishable
- ❌ 改 KL4 研究檔案
- ❌ 動 UI 元件
- ❌ 產生新的「研究」檔（只消費現有素材庫）
- ❌ 改英語 manifest（使用者明示不處理）

## 開工順序

1. 建 `scripts/job205_sync_title_from_materials.mjs`（Parser + Sync + Conflict Report）
2. Dry-run 全 7 組合 + 回溯 G5 Math
3. 抽樣人工驗收
4. Write 模式實寫
5. Vision 讀 3 張 G3 jpg 驗證
6. 跑 verify scripts
7. Build
8. 更新 JOB-205 Report
9. Commit
