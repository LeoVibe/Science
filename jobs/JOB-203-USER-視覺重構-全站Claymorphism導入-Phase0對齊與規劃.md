*Created by USER at 2026-04-20 12:00*

`last_updated`: 2026-04-20 12:20
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-203-USER-視覺重構-全站Claymorphism導入-Phase0規劃與獨立雛形站

**`job_type`**：`docs_ops`（Phase 0 為規劃 + 獨立雛形建置，嚴禁碰既有服務程式碼；engineering 落地在 Phase 1+ 另開派工）
**`executor`**：Claude Opus（claude-opus-4-7）
**`model_approval`**：使用者已於 2026-04-20 明確指定「因視覺重構屬複雜任務，改用 Claude Opus 執行」，符合 CLAUDE.md §3.2「付費模型執行前取得核准」要求。

---

## 📌 任務背景

Eidos 現行 UI 使用 **warm amber** 主題（見 `docs/技術設定/前端開發與AI實作守則.md` 原 SOP 5 殘留描述）。2026-04-20 對話中，使用者透過已安裝於全域 `~/.claude/plugins/cache/ui-ux-pro-max-skill/` 的 `ui-ux-pro-max` skill（v2.5.0）針對 Eidos 兒童教育場景獲得設計系統建議：

**Claymorphism + Learning Blue 調色盤**

skill 推理引用：資料庫 `ui-reasoning.csv` 對風格「Claymorphism (Mobile)」直接標注「Best For: **Children education apps**, teen social products, creative tools」。

初版視覺預覽已生成單檔：`eidosProject/test/design_preview_claymorphism.html`（untracked，使用者已選項 A 保留作參考）。

**2026-04-20 使用者調整**：JOB-203 應擴展範圍。不僅是規劃文件，而是**先完整做出新版 UI/UX 的雛形網站**——獨立於 `apps/v3_eidos/`，不動既有服務任何畫面與程式碼。雛形網站驗證後，才進 Phase 1+ 把設計落地回主專案。

---

## 🎯 任務目標

### 產出 A：規劃文件（三份）

存於 `docs/visual-redesign/`：

1. **`00-direction-gate.md`**：方向決策閘。warm amber vs Claymorphism 對比 + 三選項（A 完全替換 / B 融合 / C 僅新功能用）。使用者在此勾選方向後 Phase 1+ 才可啟動。
2. **`01-token-mapping.md`**：新舊 token 映射表（現行 token → 新建議值）。
3. **`02-phase-plan.md`**：Phase 1/2/3 分工計畫。

### 產出 B：獨立雛形網站

存於 `eidosProject/prototypes/ui-v2/`（新目錄，與主專案 `apps/v3_eidos/` 完全隔離）：

- **獨立 Vite + React + TailwindCSS + shadcn/ui 專案**（重新 init，不 symlink 主專案）
- 實作至少 **4 個代表性頁面雛形**：
  - 主選單（MainMenu 風格）
  - 答題畫面（QuizView 風格，含正確/錯誤回饋）
  - 結果畫面（ResultView 風格，含分數 + 迷思診斷）
  - 學習報告（LearningReportView 風格，含圖表）
- 完整套用 Claymorphism token + 繁體中文字型 stack
- 可 `npm install` + `npm run dev` 獨立啟動檢視
- **假資料**即可（硬寫 mock data，不接任何後端/API）
- 包含 `README.md` 說明：如何啟動、頁面清單、設計決策對照表

### 產出 C：雛形驗收文件

存於 `docs/visual-redesign/`：

4. **`03-prototype-review.md`**：使用者檢視雛形後的回饋紀錄（欄位：頁面、回饋、是否採納、原因）。此檔 PM 先建空表，使用者自己填或與 Opus 對話後 Opus 補填。

---

## 🚧 任務邊界

### 本 Phase 0 只做

- 讀取現有視覺來源（列在「關鍵參考檔案」）
- 盤點 warm amber 目前使用的 token 清單
- 產出 A 規劃文件 × 3
- **在 `eidosProject/prototypes/ui-v2/` 新建獨立 Vite 專案**並完成 4 個頁面雛形
- 產出 C 雛形驗收文件

### 本 Phase 0 **絕對禁止**（違反立即停止並回報）

- ❌ 改 `apps/v3_eidos/` 任何 `.tsx` / `.ts` / `.css` / `.config.*` / `.json` 檔
- ❌ 改 `docs/網站功能規格書.md`（真相來源，動它必須另開 docs_ops 派工單）
- ❌ 改 `_agent/skills/` 任何檔案
- ❌ 從 `apps/v3_eidos/` import 任何東西到雛形專案（必須完全隔離）
- ❌ 把雛形專案部署到任何正式環境
- ❌ 修改 `scripts/` 下的工具腳本
- ❌ 刪除 `test/design_preview_claymorphism.html`（參考用）

### 允許的例外

- ✅ `eidosProject/prototypes/ui-v2/` 內的檔案可自由建立/修改（此目錄即為本 JOB 產出區）
- ✅ `docs/visual-redesign/` 內的檔案可自由建立/修改
- ✅ 可為雛形專案安裝任何 npm 套件（獨立 `node_modules`）

---

## 📖 執行步驟

### Step 1：現況盤點（2-3 小時）

1. 讀 `docs/網站功能規格書.md` 全文，記下現行「色彩規範」「元件狀態」章節
2. 讀 `apps/v3_eidos/tailwind.config.ts` + `apps/v3_eidos/src/index.css`（或 `globals.css`），列出所有 CSS 變數與 Tailwind custom colors
3. 讀 `apps/v3_eidos/src/data/config.ts` 的 `PUBLISHER_THEME_COLORS` 完整常數
4. Grep 找所有 `--subject-` / `subject-text-` / `amber` / `warm` 使用位置
5. 截圖目前 4 個代表頁面（Chrome DevTools）作為 before 對照圖，存 `docs/visual-redesign/screenshots/before/`

### Step 2：產出規劃文件 A（3-4 小時）

依「產出 A」規格，寫 `00-direction-gate.md`、`01-token-mapping.md`、`02-phase-plan.md`。
**尚不動雛形**——先讓使用者在規劃文件上確認大方向。

### Step 3：使用者確認 Gate

暫停，請使用者在對話中確認規劃文件無誤。**未確認不得進 Step 4。**

### Step 4：建立獨立雛形專案（4-6 小時）

```bash
cd eidosProject
mkdir -p prototypes/ui-v2
cd prototypes/ui-v2
npm create vite@latest . -- --template react-ts
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npx shadcn@latest init
# 套用 Claymorphism token 到 tailwind.config.ts + src/index.css
```

4 個頁面實作：

- `src/pages/MainMenu.tsx`
- `src/pages/QuizView.tsx`（含答對/答錯狀態示範）
- `src/pages/ResultView.tsx`
- `src/pages/LearningReportView.tsx`（含 recharts 或類似圖表）

Router 採 react-router，讓使用者可點擊切換。

### Step 5：雛形驗收輔助（1 小時）

1. 在 `prototypes/ui-v2/` 根目錄產出 `README.md`：啟動指令、頁面路由、設計對照表
2. 截圖 4 個頁面存 `docs/visual-redesign/screenshots/after/`
3. 產出 `docs/visual-redesign/03-prototype-review.md`（空表，待使用者填）

### Step 6：寫 Report

依 `jobs/_JOB-REPORT-TEMPLATE.md` 格式寫 `JOB-203-Report.md`，列出：

- 異動檔案清單（全部限制在 `prototypes/ui-v2/` 與 `docs/visual-redesign/`）
- 現行 token 清單
- 設計決策對照
- 需要使用者在 `00-direction-gate.md` 勾選的項目

---

## 📜 關鍵參考檔案（只讀，不改）

| 檔案路徑 | 用途 |
|:--|:--|
| `docs/網站功能規格書.md` | 現行色彩/元件規範真相來源 |
| `docs/技術設定/前端開發與AI實作守則.md` | 前端硬閘（JOB-202 剛重構完） |
| `docs/上版前驗證標準.md` | Phase 1+ 測試硬閘（L1-3 / L2-1 / L2-2 / L3） |
| `apps/v3_eidos/tailwind.config.ts` | 現行 Tailwind 配置（只讀盤點） |
| `apps/v3_eidos/src/data/config.ts` | `PUBLISHER_THEME_COLORS`（只讀盤點） |
| `apps/v3_eidos/src/index.css` 或同類 | CSS 變數定義（只讀盤點） |
| `apps/v3_eidos/src/components/MainMenu.tsx` | 參考結構與資料結構（只讀，供雛形模仿邏輯） |
| `apps/v3_eidos/src/components/QuizView.tsx` | 同上 |
| `apps/v3_eidos/src/components/ResultView.tsx` | 同上 |
| `apps/v3_eidos/src/components/LearningReportView.tsx` | 同上 |
| `test/design_preview_claymorphism.html` | Claymorphism 單頁預覽（對話產物） |
| `~/.claude/plugins/cache/ui-ux-pro-max-skill/ui-ux-pro-max/2.5.0/.claude/skills/ui-ux-pro-max/SKILL.md` | 設計方法論來源 |

---

## 🎨 設計決策素材（從 2026-04-20 對話凝固）

### Claymorphism token（完整來源）

| 項目 | 建議值 | 出處 |
|:--|:--|:--|
| 風格 | Claymorphism（柔軟 3D、圓潤、可擠壓） | `ui-reasoning.csv`：Children education apps |
| Primary | `#2563EB`（Learning Blue） | skill colors.csv |
| Secondary | `#F59E0B`（Play Yellow） | skill colors.csv |
| Accent | `#EC4899`（Fun Pink） | skill colors.csv |
| Background | `#EFF6FF` | skill colors.csv |
| Foreground | `#0F172A`（內文對比 16:1，超越 WCAG AAA） | skill colors.csv |
| Destructive | `#DC2626`（必搭 ✕ 圖示） | skill colors.csv |
| Border | `#E4ECFC` | skill colors.csv |
| Muted | `#F1F5FD` | skill colors.csv |

### 字型 stack（繁體中文混搭）

skill 原推 Baloo 2 + Comic Neue 不支援正體中文，依 google-fonts domain 查詢後建議：

```css
font-family:
  'Baloo 2',              /* 英文/數字 */
  'Iansui',               /* 正體中文標題（支援 bopomofo）*/
  'Noto Sans TC',         /* 正體中文內文保底 */
  system-ui, sans-serif;
```

### 圓角 / 陰影規格

- 按鈕 `rounded-xl` = 20px
- 卡片 `rounded-2xl` = 32px
- 容器 `rounded-3xl` = 48px
- Clay Shadow：多層堆疊（參考 `test/design_preview_claymorphism.html` 內 `--clay-shadow` 變數定義）

### 關鍵 UX 規則（Top 5）

1. **色彩不單獨傳達資訊**（CRITICAL - 色盲/辨色障礙）：答錯必搭 ✕ 圖示 + 文字
2. **錯誤用 `role="alert"` + `aria-live="polite"`**（HIGH - 螢幕閱讀器）
3. **Haptic 震動回饋**（MOBILE）：答對 10ms、答錯 [30,50,30]ms，不每 tap 都震
4. **Touch Target ≥ 44×44pt**（CRITICAL）：選項卡片整張可點，間距 ≥ 8px
5. **對比度 ≥ 4.5:1（正文）/ ≥ 7:1（關鍵字）**：`#0F172A` on `#EFF6FF` 實測 16:1 ✓

完整 99 條規則見 skill SKILL.md「Rule Categories by Priority」。

---

## 🔗 對話上下文（供下個對話接手用）

**執行者（Claude Opus）接手時請知悉**：

1. 本單由 Claude Code (sonnet-4-6) 以 PM 角色建立，**執行階段改由 Claude Opus 承接**（使用者決定）
2. 設計系統素材來自 2026-04-20 對話：`ui-ux-pro-max` skill（v2.5.0，全域安裝）呼叫 `--design-system` 的推理結果
3. Claymorphism 單頁 demo 存於 `test/design_preview_claymorphism.html`，可於瀏覽器直接開啟查看（**重要參考**）
4. 使用者已決定範圍擴展：不僅做規劃文件，還要在 `prototypes/ui-v2/` 完整實作 4 個頁面雛形
5. **獨立雛形核心原則**：完全不碰 `apps/v3_eidos/`，不從主專案 import 任何程式碼
6. Phase 0 結束後需開 JOB-204（Phase 1 Token Migration，把雛形驗證過的 token 真正套回主專案），由 PM 另行草擬派工單
7. 本 JOB 執行時建議分兩次與使用者 gate：
   - Step 3 後（規劃文件完成）
   - Step 5 後（雛形完成）

---

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] 已讀取 `docs/網站功能規格書.md` 色彩/元件章節
- [ ] 已讀取 `docs/技術設定/前端開發與AI實作守則.md`（JOB-202 精簡後版本）
- [ ] 已讀取 `docs/上版前驗證標準.md`
- [ ] 已讀取 `apps/v3_eidos/tailwind.config.ts`
- [ ] 已讀取 `apps/v3_eidos/src/index.css`（或同類 CSS 變數檔）
- [ ] 已讀取 `apps/v3_eidos/src/data/config.ts`
- [ ] 已讀取主專案 4 個元件（MainMenu / QuizView / ResultView / LearningReportView）作為雛形結構參考
- [ ] 已查看 `test/design_preview_claymorphism.html`（瀏覽器開啟）
- [ ] 已讀取 ui-ux-pro-max skill SKILL.md（全域路徑見「關鍵參考檔案」）
- [ ] 已確認執行模型：claude-opus-4-7（付費，使用者已核准）
- [ ] 已確認使用金鑰：[金鑰：___________]
- [ ] 已確認操作頻次：[QPM：___________]
- [ ] 已閱讀「任務邊界」並理解：**絕對不碰 `apps/v3_eidos/`**

---

## ✅ 驗收 Checklist (Acceptance)

### 規劃文件

- [ ] `docs/visual-redesign/00-direction-gate.md` 存在，現況欄已填實際值
- [ ] `docs/visual-redesign/01-token-mapping.md` 盤點所有現行 token 無遺漏
- [ ] `docs/visual-redesign/02-phase-plan.md` 列出 Phase 1/2/3 分工 + 測試硬閘
- [ ] `docs/visual-redesign/03-prototype-review.md` 空表已建立

### 雛形網站

- [ ] `prototypes/ui-v2/` 獨立 Vite 專案可執行 `npm install` + `npm run dev`
- [ ] 4 個頁面實作完成：MainMenu / QuizView / ResultView / LearningReportView
- [ ] 套用 Claymorphism token（色彩、圓角、陰影、字型）
- [ ] 含答對 / 答錯 UX 互動（✓✕ 圖示、shake 動畫、aria-live）
- [ ] Responsive：375px / 768px / 1024px 皆通過
- [ ] 對比度符合 WCAG AA（內文 ≥4.5:1）
- [ ] 螢幕閱讀器驗證關鍵元件有 aria-label

### 隔離性驗證

- [ ] `git status apps/` → **零變更**
- [ ] `git status docs/網站功能規格書.md` → **無變更**
- [ ] `git status _agent/` → **零變更**
- [ ] `prototypes/ui-v2/` 內無 import 指向 `apps/v3_eidos/`（grep 驗證）

---

## ✅ 成果 Checklist (Deliverables)

- [ ] 規劃文件 × 4（含 03-prototype-review）產出於 `docs/visual-redesign/`
- [ ] 獨立雛形專案於 `prototypes/ui-v2/`，含 README
- [ ] Before / After 截圖於 `docs/visual-redesign/screenshots/`
- [ ] Report 列出：
  - 所有異動檔案（限於 `prototypes/ui-v2/` + `docs/visual-redesign/`）
  - 現行 token 清單 + 建議值
  - Token migration 未來影響範圍
- [ ] 使用者確認 `00-direction-gate.md` 方向（A/B/C）+ 雛形驗收結果後，由 PM 開 JOB-204（Phase 1 Tokens）
- [ ] 已執行 `/pj_sync`
- [ ] 更新 `docs/README_專案發展紀錄.md`

---

## 真實回報本次對話的模型與花費

＄作業匯總：Token數:{執行時填} | 花費: ${執行時填} | 使用模型: claude-opus-4-7 | 執行者: Claude Opus
