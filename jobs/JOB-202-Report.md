`last_updated`: 2026-04-20 12:30
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-202 Report — 前端守則與 ei_web SKILL 硬閘同步重構

**執行者**：Claude Code（claude-sonnet-4-6）（使用者授權例外——事後補單登記）
**執行日期**：2026-04-20
**job_type**：docs_ops

---

## 📊 成果摘要

將 `docs/技術設定/前端開發與AI實作守則.md` 從 66 行精簡至 45 行，刪除與 CLAUDE.md §3 重複的通用紀律條款、以及過度具體的 Tailwind class 名（屬規格書範圍）。同步修正 `_agent/skills/ei_web/SKILL.md` 第一條硬閘「禁止 TailwindCSS 類名」與專案實況矛盾的問題（實際技術棧為 Tailwind + shadcn/ui）。執行 `/pj_audit` 稽核 5 項皆 PASS。

---

## 📂 異動清單

| 檔案路徑 | 異動類型 | 說明 |
|:--|:--|:--|
| `docs/技術設定/前端開發與AI實作守則.md` | 修改 | 全面改寫：三區塊結構（硬閘 / 工作流程 / 測試硬閘），刪除 SOP 5 具體 class 名、SOP 7 通用清潔程式碼；測試層級由錯誤的 L1/L2/L3 改為精確對應 L1-3/L2-1/L2-2（與 `docs/上版前驗證標準.md` 命名一致） |
| `_agent/skills/ei_web/SKILL.md` | 修改 | 硬閘第 1 條：「禁止 TailwindCSS 類名、禁止硬編碼色碼」→「禁止在 JSX 硬編碼色碼（用 Tailwind semantic class 或 CSS 變數）」；硬閘第 3 條補上 `aria-label` |
| `jobs/JOB-202-USER-重構-前端守則與ei-web-硬閘同步.md` | 新增 | 事後補單（本派工單） |
| `jobs/JOB-202-Report.md` | 新增 | 本結案報告 |

---

## ✅ Checklist 對照結果

### 驗收 Checklist（由 `/pj_audit` 佐證，全部 PASS）

- [x] 技術棧宣告 Tailwind + shadcn/ui 與 `apps/v3_eidos/package.json:86` 一致（tailwindcss@3.4.17 + class-variance-authority + clsx + tailwind-merge）
- [x] `PUBLISHER_THEME_COLORS` 仍存在於 `apps/v3_eidos/src/data/config.ts:36`
- [x] `--subject-*` CSS 變數被 6 個元件實際使用（AboutView / QuizView / MainMenu / ResultView / LearningReportView / Index）
- [x] 測試硬閘 3 檔案實際存在：
  - `scripts/verify_ui_data_integrity.mjs`
  - `apps/v3_eidos/src/data/questionLoader.test.ts`
  - `apps/v3_eidos/tests/answer-integrity.spec.ts`
- [x] ei_web SKILL ↔ 守則 無矛盾；L 層級命名與 `docs/上版前驗證標準.md` 完全一致

### 成果 Checklist

- [x] 異動檔案清單已列出所有實際修改路徑
- [x] 已執行 `/pj_sync`（2026-04-20）
- [x] `docs/README_專案發展紀錄.md` 已更新（JOB-202 列入 2026-04-20 區段）

---

## 🔄 同步確認

- [x] `docs/README_專案發展紀錄.md` 已更新
- [ ] `docs/進度彙整_題庫研發與產出.md`：本 JOB 為 docs_ops 不涉題庫，不適用
- [ ] `apps/v3_eidos/src/data/libraryStats.json`：本 JOB 為 docs_ops 不涉題庫，不適用

---

## ⚠️ 遺留問題

- **紀律事件**：本 JOB 為事後補單登記，執行順序不合規（先動再建單）。使用者已明確允諾以補單方式留下稽核痕跡。**未來所有規範檔修改必須嚴守「先建 docs_ops 派工單 → 再動檔案」**。
- JOB-202 違規成因已記錄於派工單「稽核紀律備註」區塊，供未來 PM 引以為鑑。

---

## 🔧 技術筆記

1. **測試層級命名陷阱**：原守則把 `verify_ui_data_integrity.mjs` / `questionLoader.test.ts` / `answer-integrity.spec.ts` 分別標為 L1 / L2 / L3，實際依 `docs/上版前驗證標準.md` 應為 L1-3 / L2-1 / L2-2（L3 是人工瀏覽器抽測）。重構時一併更正，並在表後加指向上版前驗證標準的註記，避免未來 agent 誤判。

2. **redirector 不動原則**：`.claude/skills/ei_web/SKILL.md` 是純指向 `_agent/skills/ei_web/SKILL.md` 的 redirector，無實質規則內容，本次不動。如需升級 ei_web 規則一律只改 `_agent/` 下的真實 SKILL.md。

3. **規格書邊界**：具體 class 名（`transition-all`、`backdrop-blur-*`）、互動 timing 規格屬 `docs/網站功能規格書.md` 範圍，不應污染守則；本次重構一併移除以清晰分工。

---

## 🔍 驗收確認

| 欄位 | 內容 |
|:--|:--|
| 驗收者 | user |
| 驗收時間 | 2026-04-20（對話中確認「立刻修正」+ 執行 /pj_audit 後 5/5 PASS） |
| 驗收結果 | 通過 |
| 退回原因 | 無 |

---

## ⏱️ 執行時間回報

| 子任務 / 階段 | 開始時間 | 結束時間 | 耗時（分鐘） | 備註 |
|:--|:--|:--|:--|:--|
| 讀取規範 + 規劃 | - | - | - | session 壁鐘時間不可取 |
| 改寫守則 + ei_web | - | - | - | 同上 |
| /pj_audit 稽核 | - | - | - | 同上 |
| 修正 L 層級錯誤 | - | - | - | 同上 |
| 補單登記 + Report | - | - | - | 同上 |
| **總計** | — | — | **-** | 時間戳不可取，填 `-` 依 CLAUDE.md §3.2「禁止推估或捏造」 |

---

＄作業匯總：Token數:- | 花費: $- | 使用模型: claude-sonnet-4-6 | 執行者: Claude Code
