---
name: 視覺重構分 Phase 計畫
description: JOB-203 Phase 0 產物 A3 — Phase 1/2/3 分工、DoD、測試硬閘
type: docs_ops
---

`last_updated`: 2026-04-20
`updated_by`: Claude Code (claude-opus-4-7)

# 02 — Phase 分工計畫（Phase Plan）

## 文件定位

**本檔定義 Phase 1/2/3 的範圍、順序、DoD、測試硬閘與派工單規劃**。實際派工單由 PM 於使用者完成 `00-direction-gate.md` 勾選後另行開立（JOB-204 起）。

---

## 一、總覽

```
  Phase 0（本 JOB-203）         ─── 規劃 + 雛形驗證（不動 apps/）
     │
     └─▶ 使用者決策 Gate（00-direction-gate.md §3）
           │
           ├─▶ 勾 A／B ──▶ Phase 1（JOB-204）Token Migration
           │              └─▶ Phase 2（JOB-205）元件樣式重構
           │                    └─▶ Phase 3（JOB-206）Dark Mode + QA 收斂
           │
           └─▶ 勾 C     ──▶ Phase 1-C（JOB-204-C）新功能使用新 token
                           （不觸及既有 15 檔案）
```

**前置閘**：所有 Phase 1+ 派工單須在 `啟動 Checklist` 引用本檔對應章節，且 `00-direction-gate.md §3` 全部勾選。

---

## 二、Phase 1 — Token Migration（選 A／B 時）

### 2.1 範圍

- **只動 token 定義層與引用語法**，不動業務邏輯
- 目標檔案：
  - `apps/v3_eidos/src/index.css`（新 semantic token 定義 + 陰影）
  - `apps/v3_eidos/tailwind.config.ts`（新增 `boxShadow.clay*`、`borderRadius` 重寫）
  - `apps/v3_eidos/src/data/config.ts`（`PUBLISHER_THEME_COLORS` 依 §3.3 勾選處理）
  - `index.html` 或 CSS import（新字型載入）
  - `docs/網站功能規格書.md` §1.1-1.5（同步新設計系統）
- 選 α（保留科目色）時：科目色 token 值不變，僅補轉 HEX 記錄
- 選 β（重新設計科目色）時：新 6 色由 ui-ux-pro-max skill 重新產出方案，使用者二次核准
- 選 γ（取消科目色）時：移除 `--subject-*`、`subject-bg-*`、`subject-text-*`、`gradient-*` 12+18+6 = 36 條 CSS；所有引用點改用 `bg-primary` / `bg-muted` 等 semantic class

### 2.2 DoD

- [ ] `src/index.css` `:root {}` 完成新 semantic token 覆寫，保留 `.dark {}` 不變（Dark Mode 交 Phase 3）
- [ ] Clay Shadow 3 個變數在 `tailwind.config.ts` 可以 `shadow-clay` 引用
- [ ] 字型載入完成，首次 paint 無明顯 FOUT
- [ ] 規格書 §1.1-1.5 同步更新，`last_updated` 對應日期
- [ ] 全站 `grep -r "hsl(38 " apps/v3_eidos/src/` 無殘留琥珀色硬編碼
- [ ] `npm run typecheck` + `npm run build` 通過

### 2.3 測試硬閘

依 `docs/技術設定/前端開發與AI實作守則.md` + `docs/上版前驗證標準.md`：

| 層級 | 驗證 | 本 Phase 需新增 |
|:--|:--|:--|
| L1-3 | `scripts/verify_ui_data_integrity.mjs --gate` | 不需（token 不影響資料層） |
| L2-2 | `answer-integrity.spec.ts` | 需更新 fixture 截圖（若使用視覺比對）|
| L3 抽測 | 29 組合 × 3 題 | 必跑 — 視覺改版必須全組合人工 review |

**新增測試**：建議增加 `visual-regression.spec.ts`（Playwright screenshot diff）涵蓋 4 代表頁面。

### 2.4 工期估算

- 選項 A（完全替換）：5 工作天（含 L3 人工抽測）
- 選項 B（融合）：3-4 工作天
- 選項 C 不適用本 Phase（見 §五）

### 2.5 預計派工單

`JOB-204-USER-視覺重構-Phase1-Token-Migration.md`（由 PM 於 Gate 勾選後開立）

---

## 三、Phase 2 — 元件樣式重構（選 A／B 時）

### 3.1 範圍

逐一將 15 個影響檔案的視覺細節更新為 Claymorphism 規範：

| 批次 | 元件 | 主要異動點 |
|:--|:--|:--|
| B1 | `MainMenu.tsx` | 科目 pill 改 clay-shadow、挑戰按鈕改 clay 雙層、分課卡改圓角放大 |
| B1 | `QuizView.tsx` | 選項卡改 `rounded-2xl` + clay-shadow-sm、答對 shake 動畫、✓/✕ 圖示強化 |
| B1 | `ResultView.tsx` | 分數區改大圓角 panel、stats grid 改 clay stat |
| B1 | `LearningReportView.tsx` | 圓環進度改 clay 雙層、出版社 pill 改 clay-shadow |
| B2 | `AboutView.tsx`、`WrongQuestionsView.tsx`、`ReviewView.tsx`、`StatisticsView.tsx` | 跟隨 B1 元件樣式 |
| B2 | `QuestionFeedback.tsx`、`InsightDrawer.tsx`、`OnboardingModal.tsx` | Overlay / Drawer 改 clay shadow |
| B3 | `admin/*.tsx`、`pages/AdminDashboard.tsx` | 後台同步（低優先） |

### 3.2 DoD

- [ ] 4 個代表頁面（MainMenu / QuizView / ResultView / LearningReportView）視覺與雛形 (`prototypes/ui-v2/`) 對齊度 ≥ 90%
- [ ] 所有互動狀態（hover/active/focus/disabled）皆套用 clay 規範
- [ ] 無 JSX 硬編碼色碼（遵守 `docs/技術設定/前端開發與AI實作守則.md` 硬閘 #1）
- [ ] 新文案或互動若偏離 `docs/網站功能規格書.md §二 元件規格`，同步更新規格書
- [ ] L3 人工抽測 29 組合 × 3 題（依 `docs/上版前驗證標準.md`）全綠

### 3.3 測試硬閘

- L1-3 / L2-1 / L2-2 全通過
- L3 抽測含 Lighthouse Accessibility ≥ 95（重點驗 Claymorphism 的陰影對比與色彩對比）
- Playwright 視覺回歸（若 Phase 1 已新增）全綠

### 3.4 工期估算

- 選項 A：7-10 工作天
- 選項 B：5-7 工作天

### 3.5 預計派工單

`JOB-205-USER-視覺重構-Phase2-元件樣式重構.md`

---

## 四、Phase 3 — Dark Mode + QA 收斂（選 A／B 時）

### 4.1 範圍

- Dark Mode token 設計（若 `00-direction-gate.md §3.4` 選 1，延後本階段；選 2 則併入 Phase 1）
- 視覺回歸自動化整合進 CI
- 既有規格書 drift（見 `01-token-mapping.md §十`）一次性修正
- 無障礙最終驗證：螢幕閱讀器 NVDA + VoiceOver 實測

### 4.2 DoD

- [ ] `.dark {}` 完成 Claymorphism Dark token
- [ ] 所有 4 個代表頁面 Dark Mode 可用，對比度 ≥ 4.5:1
- [ ] Playwright 視覺回歸進 CI，PR 自動跑
- [ ] 規格書 + 程式碼零 drift（grep 雙向驗證）
- [ ] 發布前 L3 全組合抽測（依上版前驗證標準）

### 4.3 測試硬閘

- 全部 L1 / L2 / L3 通過
- `job_type: release_validation` 派工單同步開立

### 4.4 工期估算

3-5 工作天

### 4.5 預計派工單

`JOB-206-USER-視覺重構-Phase3-DarkMode-與-QA收斂.md`

---

## 五、Phase 1-C — 僅新功能使用（選 C 時）

### 5.1 範圍

- **不動現有 15 個檔案**（`apps/v3_eidos/src/` 原有元件維持 warm amber）
- 新建檔案可使用 Claymorphism token
- 引入策略：在 `src/styles/claymorphism.css` 定義獨立命名空間（e.g. `.clay-*` 前綴），或使用 CSS Layer（`@layer claymorphism`）
- 新功能範圍由使用者於當下派工單決定（本 JOB 不預設）

### 5.2 DoD

- [ ] 新功能檔案獨立使用 clay token，不污染全站
- [ ] 既有頁面 L3 抽測結果與本 JOB 前無差異（視覺不變）
- [ ] 規格書 §一 保留 warm amber 記載，新增 §？ 標注「新功能使用 Claymorphism」邊界
- [ ] 若新 / 舊視覺在同頁共存（如 AppHeader 框架 + 新 widget），須明確列出過渡策略

### 5.3 工期估算

隨新功能派工同步交付，不單獨排程

---

## 六、Phase 0（本 JOB-203）完工 DoD

此區列出**本 JOB** 的最終完工條件（與派工單 `驗收 Checklist` 對齊）：

### 規劃文件

- [x] `docs/visual-redesign/00-direction-gate.md` 建立（含現況速覽、三選項、使用者勾選欄）
- [x] `docs/visual-redesign/01-token-mapping.md` 建立（含 semantic / 科目 / 回饋 / sidebar / 出版社 / 陰影 / 字型 / 圓角 / 使用統計 / drift 清單）
- [x] `docs/visual-redesign/02-phase-plan.md` 建立（本檔）
- [ ] `docs/visual-redesign/03-prototype-review.md` 空表建立（Step 5 產出）

### 雛形網站

- [ ] `prototypes/ui-v2/` 獨立 Vite 專案可跑（Step 4 產出）
- [ ] 4 代表頁面實作完成
- [ ] README.md 含啟動指令 + 頁面清單 + 設計對照

### 隔離性驗證（強制）

- [ ] `git status apps/` 零變更
- [ ] `git status docs/網站功能規格書.md` 無變更
- [ ] `git status _agent/` 零變更
- [ ] `prototypes/ui-v2/` 內無 import 指向 `apps/v3_eidos/`

### 截圖

- [ ] Before 截圖於 `docs/visual-redesign/screenshots/before/`（Step 1 選做、Step 5 必做）
- [ ] After 截圖於 `docs/visual-redesign/screenshots/after/`（Step 5 必做）

### Report

- [ ] `jobs/JOB-203-Report.md` 依 `jobs/_JOB-REPORT-TEMPLATE.md`
- [ ] 異動檔案清單限於 `prototypes/ui-v2/` + `docs/visual-redesign/`
- [ ] 現行 token 清單 + 建議值（可引用 `01-token-mapping.md`）
- [ ] 使用者需勾選項（本檔 `00-direction-gate.md` §3）

---

## 七、依賴與風險

### 7.1 外部依賴

| 依賴 | 來源 | 風險 |
|:--|:--|:--|
| Google Fonts — Baloo 2 / Iansui / Noto Sans TC | Google CDN | 單一 CDN 依賴，已有 fallback |
| shadcn/ui | npm | 非視覺性依賴，不影響 Phase 1 |
| ui-ux-pro-max skill | `~/.claude/plugins/cache/` | 僅 Phase 1 β 選項重新產科目色時使用 |

### 7.2 風險

1. **CLS/FOUT**：新字型載入首次可能位移，Phase 1 驗收需觀察
2. **使用者熟悉感**：warm amber 已上線一段時間，A 選項風險最高
3. **規格書 drift**：`01-token-mapping.md §十` 的 3 筆不一致若拖到 Phase 2 才修，會造成 migration 誤差
4. **Dark Mode 複雜度**：Claymorphism 的 inset highlight 在 Dark Mode 需重配（白 → 淡灰），Phase 3 工期需預留
5. **執行者切換成本**：若 Phase 1+ 由 Cursor 執行（非 Claude Code 繼續），派工單需附完整雛形對照 + token 表 + DoD，避免誤解

---

## 八、變更紀錄

| 日期 | 版本 | 變更 | 執行者 |
|:--|:--|:--|:--|
| 2026-04-20 | v1.0 | 初版（JOB-203 Step 2 產出） | Claude Code (claude-opus-4-7) |
