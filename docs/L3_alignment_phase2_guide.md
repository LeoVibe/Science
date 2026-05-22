*Created by Claude Code (claude-opus-4-7) at 2026-05-22 09:00*

`last_updated`: 2026-05-22 09:00
`updated_by`: Claude Code (claude-opus-4-7)
`schema_version`: 1.1
`scope`: JOB-242 Phase 2 普查複檢流程

# L3 對齊 Phase 2 — 普查複檢流程指南

> 本文件指引 Claude 對 JOB-242 Phase 1 產出的 alignment_partial_*.json 做**普查（census）**複檢。
> 普查 = 對 69 份 × 平均 30 題 ≈ 2,000+ 條 link 全部過目，不抽樣。

---

## §1. 普查範圍與目標

### 範圍

| 項目 | 數值 |
|:--|:--|
| 試卷數 | 69 份新版（_partial/ 內，已排除舊版 50 份 + unknown 矛盾 3 份）|
| 平均題數 | ~30 題/份 |
| 預估 link 總數 | ~2,000 條（含 R3 unlinked_general）|
| 預估人力 | 30-60 秒/條 × 2,000 = 17-34 小時 |
| 分批建議 | 每天 10-15 份（每份 30 min ~ 1 hr）|

### 目標

對每條 `l2_to_kl_links` 填寫 `verify_status` + 必要時 `verify_note`，最終產出 `alignment_verified.json` 含 `_verify_meta` 全局統計。

---

## §2. 工具：B_review_helper.py

### 用法

```bash
# 1. 為單份試卷產對照表
python3 scripts/jobs/JOB-242/B_review_helper.py 翰林_112_田中國小_第一次段考

# 2. 為全 69 份產對照表（一次性）
python3 scripts/jobs/JOB-242/B_review_helper.py --all

# 3. 查看當前 pending 統計
python3 scripts/jobs/JOB-242/B_review_helper.py --stats
```

### 對照表結構（`scripts/jobs/JOB-242/_review/{exam_id}.review.md`）

每份試卷產一份 review.md，含：
- 試卷 metadata + 統計（R1/R2/R3/R4/rc01 + version_match 分布）
- **逐題對照表**：題幹 + Codex 對齊結果 + KL4 課文片段 + verify_status 空欄

Claude 讀對照表逐題判定，不需要另開原 L2 / KL4 檔案。

---

## §3. verify_status 6 種分類規則

| status | 觸發條件 | verify_note 必填？|
|:--|:--|:--|
| **`pass`** | R1/R2 命中 + evidence 真實在題幹 + KL4 對應正確 | 否 |
| **`pass_with_caveat`** | 對齊合理，但 reason 偏空泛 / 可改 link 多課 | **是** |
| **`reject_high`** | R1 evidence 不在題幹中，或 lesson_title 錯（KL4 對不上）| **是** |
| **`reject_medium`** | R2 關鍵字匹配是 false positive（如「閱讀課」誤匹配閱讀題）| **是** |
| **`reject_overlinked`** | R4 多 link 中有 ≥1 條無 evidence | **是** |
| **`missed_should_link`** | 標 unlinked_general，但題幹實際引用某 KL4 課文 | **是** |

---

## §4. 普查判定流程（每條 link 走一次）

### Step 1 看 version_match

- `legacy` → **不該出現**（前置已排除），出現代表 prompt 黑名單漏抓 → `reject_high`
- `unknown` → 同上，**不該出現**
- `current` / `shared` → 繼續

### Step 2 依 match_rule 分流

```
R1_explicit_quote → 走 R1 判定
R2_title_keyword  → 走 R2 判定
R3 (general_type) → 走 R3 判定
R4_cross_lesson   → 走 R4 判定
```

### Step 3 R1 判定

**檢查 3 項**：
1. ✅ evidence 字串真實出現在 stem
2. ✅ kl3_links[].lesson_title 與 KL4 對照（review.md 已標 ✅/❌）
3. ✅ kl4_links[].kecode 與 publisher × lesson 正確（review.md 已標）

3 項全 ✅ → `pass`
任一 ❌ → `reject_high` + verify_note 說明哪項失敗

### Step 4 R2 判定

**檢查 2 項**：
1. ✅ 題幹/reason 含課程名稱 ≥3 字連續匹配（不只表面字面）
2. ✅ 沒有 disambiguation 問題（課名是否通用，易誤匹配）

特別注意 false positive：
- 「閱讀課」對齊到「閱讀測驗題」→ ❌ reject_medium
- 「向太空出發」對齊到題幹有「太空」字眼但非該課文 → ❌
- 「我愛鹿港」對齊到提到鹿港的歷史題 → 視情況 reject 或 caveat

### Step 5 R3 判定（unlinked_general）

**檢查 1 項**：
- ✅ 題幹是否真的是通用題型，沒引用任何 KL4 課文？

若題幹引用 KL4 課文（即使是通用題型問法）→ `missed_should_link` + note 標明應 link 哪課

常見正確 R3：
- 注音字音字形（題幹只有單字/詞，無課文情境）
- 改錯字（純字形辨識）
- 標點符號題
- 短語仿寫
- 開放作答（情境式但無引用課文）

### Step 6 R4 判定（cross_lesson）

**檢查**：多 link 每條都要有 evidence
- 全部 link 都有 evidence → `pass`
- ≥1 條無 evidence → `reject_overlinked`

### Step 7 rc01_evidence 額外檢查

對 `rc01_evidence: true` 的 link：
- review.md 已標「rc01_quote 在題幹中: 是/否」
- 是 → 通過
- 否 → 降 caveat（pass_with_caveat） + note「rc01_quote 不在題幹中，但 lesson 對齊正確」

---

## §5. 普查產出物

### 5.1 寫回 partial JSON 的 verify_status

每完成一份試卷的普查，回填到 `_partial/alignment_partial_{exam_id}.json` 的 `l2_to_kl_links[].verify_status` 與 `verify_note`。

### 5.2 alignment_verified.json（最終）

全 69 份普查完成後，跑 `A4_merge.py` 重新合併（merge 邏輯會自動帶入 verify_status），並加 `_verify_meta`：

```yaml
_verify_meta:
  verifier: "Claude Opus 4.7"
  verified_at: ISO
  total_files_reviewed: 69
  total_questions_reviewed: <int>
  pass_count: <int>
  pass_with_caveat_count: <int>
  reject_high_count: <int>
  reject_medium_count: <int>
  reject_overlinked_count: <int>
  missed_should_link_count: <int>
  accuracy_high_confidence: <pct%>  # pass / (pass + reject_high)
  accuracy_medium_confidence: <pct%>
  overall_accuracy: <pct%>
```

### 5.3 通過門檻

| 指標 | 派工單門檻 | 預期 |
|:--|:--|:--|
| total_files_reviewed | 69（普查不抽樣）| **必達 69** |
| 無 `verify_status: "pending"` 殘留 | 0 | **必達** |
| high confidence accuracy | ≥ 90% | Pilot 實測 100%，全量目標 ≥ 95% |
| reject 條目 verify_note 完整 | 100% | **必達** |

---

## §6. 分批執行建議

### 分批策略

依「最高標準」每天分批普查 10-15 份，避免一次性吃太多 context。

每批流程：
1. **批次 setup**（5 min）：選 10 份 → 跑 `B_review_helper.py` 各產對照表
2. **逐份普查**（30 min × 10 = 5 hr）：Claude 讀 review.md → 填 verify_status → 寫回 partial JSON
3. **批次驗收**（10 min）：跑 `--stats` 看本批 pending 是否歸 0
4. **commit**：每批結束 commit 一次

### 批次優先序建議

1. **批 1 (priority high)**：5 份 pilot 已驗 → 直接用既有親檢結果回填
2. **批 2**：翰林 113 學年 5 份（最新，KL4 對應最直接）
3. **批 3**：翰林 112 學年 12 份
4. **批 4**：康軒 111+112 共 20 份
5. **批 5**：南一 111+112+113 共 22 份
6. **批 6**：unknown 推測新版 4 份（特別小心，可能誤入）
7. **批 7**：翰林 111 學年 6 份（過渡年，可能有混版）

總批數：7 批 / 預估 5-7 工作日（每天 1 批 + 驗收）

---

## §7. 常見判定難點 & SOP

### Q1：題幹同時引用多課，但 Codex 只 link 1 課

→ 看是否 R4 應該觸發。若應該 R4 但被歸 R1/R2 → `pass_with_caveat` + note「應改 R4 多 link」

### Q2：rc01_quote 不在題幹但 lesson 對齊正確

→ `pass_with_caveat` + note「rc01_quote 抓錯但 lesson 對」

### Q3：R3 unlinked_general 題幹有「鴨子/兒童節」這種廣義關鍵詞

→ 看是否真的引用課文。若只是用詞重合（例如題目談「鴨子」但與「稻間鴨」課文無關）→ 正確 R3，保持 `pass`

### Q4：版本識別衝突（current 試卷中出現 legacy 課文）

→ 嚴重 → `reject_high` + note「version_match 應為 legacy 但被標 current」+ 記錄試卷 ID 待排查

---

## §8. 與 Phase 3/4 銜接

Phase 2 結束後：
- Phase 3：Codex 依 verified 結果產 KL3 coverage report + KL4 teaching examples
- Phase 4：Claude 親寫對齊報告 + JOB-242-Report

---

## 變更紀錄

| 時間 | 變更 |
|:--|:--|
| 2026-05-22 09:00 | 初版建立（spec v1.1 Phase 2 流程文件）|
