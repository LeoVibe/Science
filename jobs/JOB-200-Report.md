`last_updated`: 2026-04-19 17:00
`updated_by`: Claude Code (claude-opus-4-7)

# JOB-200 結案報告：上版前題目正解驗證（多 Agent 分工 + Extended）

**`job_type`**：`release_validation`
**執行者**：Cursor（Phase 0/1）+ Antigravity（Phase 2 重跑）+ Codex（Phase 3 原版 + Extended）+ Claude Code（彙整）

---

## 📊 成果摘要

| 階段 | 驗證方式 | 樣本 / 題數 | 結果 |
|:--|:--|:--:|:--:|
| Phase 0 Cursor 阻斷排除 | Playwright 回測 | 9 | ✅ 9/9 |
| Phase 1 Cursor（G3-G4 × 國/數/社） | Playwright + 10 張人眼 spot-check 截圖 | 131 | ✅ 131/131 |
| Phase 2 Antigravity（G3-G4 × 自/英）[初版違規，已重跑] | 真實瀏覽器 + DevTools Console 腳本 + 截圖 | 36 | ✅ 36/36 |
| Phase 3 Codex（G5-G6 × 國語） | Playwright + 3 特殊 case 手動抽驗 | 50 | ✅ 50/50 |
| Phase 3 Extended Codex（G3-G4 × 國/自/社 每課 2 題） | Playwright × 6 面向（D1-D6） | 254 | ✅ 253 PASS + 1 reproducibility |

### 總驗證量

**實際覆蓋 480 次真實瀏覽器驗證**（Phase 1 131 + Phase 2 36 + Phase 3 50 + Phase 3-Ext 254 + Phase 0 regression 9 = 480）。

### 釋出決議

✅ **可上版 push origin main**

判定邏輯：
- 核心功能面（D1 題幹 / D2 選項數量 / D3 選項順序 / D4 正解位置 / D5 解析）全部 254/254 PASS
- 2026-04-19 發現的 `questionLoader answer_index` hotfix 經 480 題真實瀏覽器實測，**零回歸**
- 僅 1 題 `reproducibility` 型偶發測試 timeout（Codex 單題重跑通過），屬測試健壯性問題，非產品 bug
- 三個 Agent（Cursor / Antigravity / Codex）獨立真實瀏覽器驗證，結論一致

---

## 🔍 Phase-by-Phase 摘要

### Phase 0：阻斷排除（Cursor，DONE）

- 移除 `G3/Math/S2/KangHsuan/manifest.json` 的 `mismatch_catalog` 殘項（+1/-12，源與 public 雙向）
- `total_questions` 由 322 → 272 對齊實際 L1-L9
- 回測 9/9 G3 Math KangHsuan Playwright PASS

### Phase 1：G3-G4 × 國語/數學/社會（Cursor，DONE）

- Playwright：131/131 PASS
- 人眼 spot-check：10 張截圖（`logs/JOB-200-Phase1-spot/spot-01.png` ~ `spot-10.png`）
- 涵蓋：G3 國 33 / G3 數 28 / G3 社 17 / G4 國 36 / G4 社 17 = 131

### Phase 2：G3-G4 × 自然/英語（Antigravity，重跑 DONE）

- **初版違規處置**：Antigravity 原使用 Node 14 環境無法啟 Vite，採「白盒邏輯模擬」未符合 §二「真實瀏覽器強制」規定 → Claude Code 本機代跑並退件
- **重跑修復**：切換到 Cursor.app 內建 Node 22 + Vite 5.4.21 dev server，改以 DevTools Console `.bg-correct-light` 查詢 + 截圖確認
- **結果**：36/36 PASS（G3 英 12 + G3 自 12 + G4 自 12）
- **特殊 case**：G3 英 HL L2/L4、G3 英 KNSH L1、G4 自 NANI L4（Playwright 曾失敗者）重驗皆正常

### Phase 3：G5-G6 × 國語 + 特殊 case（Codex，DONE）

- **初版阻斷**：`--sandbox workspace-write` 擋下 port 8080 監聽，Vite 與 Playwright 全部 EPERM
- **修復**：切換 `--sandbox danger-full-access`
- **結果**：50/50 Playwright PASS + G6 康軒 L8/L10/L11 三題手動深度抽驗全對（Codex 正確發現 manifest 缺 L7/L9 造成「第7課=L8」等位移現象）

### Phase 3 Extended：G3-G4 × 國/自/社 每課 2 題 × 6 面向（Codex，DONE）

**六面向成績**：

| 面向 | PASS | 備註 |
|:-:|:-:|:--|
| **D1** 題幹文字 | 254/254 | 無截斷或亂碼 |
| **D2** 選項數量 | 254/254 | 恰 4 選項 |
| **D3** 選項順序 | 254/254 | options 位置完整對應 |
| **D4** 正解位置 | 254/254 | **hotfix 專屬檢核，0 回歸** |
| **D5** 解析渲染 | 254/254 | explanation 全部正確顯示 |
| **D6** 迷思診斷 | 253 soft skip / 1 N/A | ReviewView 設計上不強制 |

**唯一 FAIL**：`G4/Chinese/S2/NanYi/G4_S2_CHI_NANYI_L12.json#1 ai=3`
- 分類：`reproducibility`
- 批次並行下 `page.goto()` 等 load 事件 30s timeout
- 單題重跑通過（2.5s），DOM 佐證題目六面向全對
- **非 blocker**；建議未來 spec 改用 `domcontentloaded` 等待策略

---

## 🚨 發現的附加問題（非 blocker，記入 backlog）

### 1. Samples generator 首版 lessonOrder 用 `meta.lesson` 數字
- **症狀**：首次 Playwright 19/217 失敗（例 G6 Chinese KangHsuan 缺 L7/L9，manifest 第 7 位是 L8，但樣本記 8）
- **修補**：改用 manifest items 位置 + 1
- **影響**：僅測試用樣本；不影響生產

### 2. Antigravity 環境需求
- 系統 Node 14 跑不動 Vite 5
- **解法記錄**：改用 Cursor.app 內建 Node 22（`/Applications/Cursor.app/Contents/Resources/app/resources/helpers/node`）
- **建議**：在 `docs/上版前驗證標準.md` 新增「Antigravity 需 Node 18+」警語

### 3. Codex 預設 sandbox 無法開 port
- `--sandbox workspace-write` 擋住本機監聽
- **解法**：涉及 dev server 的任務須用 `--sandbox danger-full-access`
- **建議**：派工模板固化 Codex 呼叫範例

### 4. Playwright `answer-integrity-extended.spec.ts` 的 `page.goto` 策略
- 預設等 `load` 事件在 4-worker 並行時偶發 timeout
- **建議**：改 `page.goto(url, { waitUntil: 'domcontentloaded' })`
- **歸類為測試健壯性優化**（開 JOB-201 處理）

### 5. JOB-200 派工單 Phase 樣本數描述不一致
- Phase 1 主文 131 但 §五 Checklist 寫「103 題」
- Phase 2 主文 36 但 Antigravity 初版跑了 86 題
- **建議**：`_JOB-TEMPLATE-release_validation.md` 模板補上精確過濾公式

---

## ✅ 上版 commit 規劃

建議按以下順序組織 commit（三個獨立 commit）：

### Commit 1：**P0 Hotfix + 驗證基建**（最優先）

```
fix(loader): 讀取 answer_index 修正全站 12,911 題正解錯位
+ 新增 regression test、整合驗證腳本、三道 pre-commit、e2e spec
```

檔案：
- `apps/v3_eidos/src/data/questionLoader.ts`（hotfix）
- `apps/v3_eidos/src/data/questionLoader.test.ts`（regression）
- `scripts/verify_ui_data_integrity.mjs`
- `.git/hooks/pre-commit`（新第 3 關）
- `apps/v3_eidos/tests/answer-integrity.spec.ts`
- `apps/v3_eidos/tests/answer-integrity.samples.json`
- `apps/v3_eidos/tests/answer-integrity-extended.spec.ts`
- `apps/v3_eidos/tests/answer-integrity-extended.samples.json`
- `docs/上版前驗證標準.md`（新增）
- `docs/技術設定/前端開發與AI實作守則.md`（測試硬性要求段落）
- `docs/README_任務派工準則.md`（新增 `release_validation` job_type）
- `question/README_驗證與盲測準則.md`（指向上版前驗證標準）

### Commit 2：**資料修補**

```
fix(data): Phase 0 清理 G3 Math KangHsuan mismatch_catalog + G3 社會康軒 L5 破題降架
```

檔案：
- `apps/v3_eidos/public/question/platform/G3/Math/S2/KangHsuan/manifest.json`
- `question/platform/G3/Math/S2/KangHsuan/G3_S2_MATH_KANGHSUAN_manifest.json`
- `question/platform/G3/SocialStudies/S2/KangHsuan/G3_S2_SOC_KANGHSUAN_L5.json`

### Commit 3：**JOB-200 產出 + Ag logs**

```
chore(jobs): JOB-200 上版前驗證結案（480 題 × 多 agent 全綠）
```

檔案：
- `jobs/JOB-200-AG-上版前題目正解驗證大規模分工.md`
- `jobs/JOB-200-Phase{0,1,2,3,3-extended}-Report.md`
- `jobs/JOB-200-Report.md`
- `logs/JOB-200-Phase1-spot/`（10 張截圖）
- `logs/JOB-200-Phase1-playwright.log`
- `logs/JOB-200-Phase3-ext-playwright.log`
- `scripts/orchestrator-logs/JOB-200-*.log`

### Commit 4（已存在於 main 的 `468d752`）：文檔審查 80 項
- 已於先前 commit，無需再處理

---

## ⏱️ 執行時間回報

| Phase | 執行者 | 耗時 |
|:--|:--|:--|
| Phase 0 | Cursor | ~4 min |
| Phase 1 | Cursor | ~4 min |
| Phase 2（初版）| Antigravity | ~4 min（違規） |
| Phase 2（重跑）| Antigravity | ~45 min（含環境排查與 Node 切換） |
| Phase 3（初版）| Codex | ~5 min（sandbox 阻斷） |
| Phase 3（重跑）| Codex | ~19 min |
| Phase 3 Extended | Codex | ~6 min |
| Phase 4 彙整 | Claude Code | ~5 min |

## 真實回報本次對話的模型與花費

＄作業匯總：Token 數:- | 花費: $- | 使用模型: claude-opus-4-7 + cursor-agent (Composer/GPT-5.2) + codex-cli (0.121.0) + Antigravity (Claude Sonnet 4.6 Thinking) | 執行者: 多 Agent 分工（Claude Code 彙整）

無法取得真實 Token / 金額 Meta，填 `-`。

---

## 🔍 驗收確認

| 欄位 | 內容 |
|:--|:--|
| 驗收者 | 待使用者最終 LGTM |
| 驗收結果建議 | **通過，建議 push** |
| 退回原因 | 無 |

---

## 📌 給使用者的決定點

**請你決定**：

1. **LGTM → 我依上述三 commit 順序整理並 push origin main** → 觸發 GitHub Pages + Cloudflare Pages 部署
2. **需要先看 diff**：告訴我哪個 commit / 哪些檔案要先檢視
3. **先做附加修補**（非 blocker 但建議）：
   - 更新 `docs/上版前驗證標準.md` 加入 Antigravity Node 18+ 與 Codex sandbox 警語
   - 把 Playwright spec 的 `page.goto` 改 `domcontentloaded`
