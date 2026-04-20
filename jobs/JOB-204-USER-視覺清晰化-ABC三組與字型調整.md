*Created by USER at 2026-04-20 17:00*

`last_updated`: 2026-04-20 17:30
`updated_by`: Claude Code (claude-opus-4-7)

# JOB-204-USER-視覺清晰化-ABC三組與字型調整

**`job_type`**：`mixed`（engineering 主體 + docs_ops 同步規格書 §1.1 §1.4）
**`executor`**：Claude Code（使用者授權例外）
**`executor_change_reason`**：原委派 Cursor CLI（PID 29072）背景執行後 20+ 分鐘 log 0 bytes、CPU 累積僅 3.49 秒、git 無任何改動，判定卡在 `--print --yolo` buffer/認證階段。2026-04-20 17:30 使用者授權改由 Claude Code 直接執行。
**`model_approval`**：Claude Opus（claude-opus-4-7），本地執行不呼叫付費 LLM，純 code 編輯

---

## 📌 任務背景

JOB-203 Phase 0 三輪雛形驗證後（方向 A 完全替換、方向 D 保守漸進、1:1 快照），使用者明確結論：
1. 不換主題、不換色系、不動元件結構
2. 只調**文字對比度、選項清晰度、顏色細節**
3. 同時試字型（標題 Iansui + 數字 Baloo 2，body 仍保留 Nunito）
4. 若不滿意 → `git revert` 一鍵退版

本 JOB 為 JOB-203 Phase 0 的後續產物實作階段，所有改動**單一 commit 包裝**，易於審查與退版。

---

## 🎯 任務目標

### A 類｜文字對比度（3 項）

| # | 檔案 | 當前 | 改為 |
|:--|:--|:--|:--|
| A1 | `apps/v3_eidos/src/index.css` `--muted-foreground`（約 L26） | `30 8% 50%` | `30 8% 40%` |
| A2 | `apps/v3_eidos/src/index.css` `--foreground`（約 L10） | `30 12% 20%` | `30 12% 12%` |
| A3 | `apps/v3_eidos/src/components/QuizView.tsx` 題目文字（約 L212） | `text-lg font-medium leading-relaxed` | `text-lg font-semibold leading-relaxed` |

### B 類｜選項清晰度（3 項）

| # | 檔案 | 當前 | 改為 |
|:--|:--|:--|:--|
| B1 | `QuizView.tsx` 選項 render 的 A/B/C/D badge（約 L236） | `<span className="font-bold text-muted-foreground shrink-0">{optionLabels[i]}</span>` | `<span className="shrink-0 w-7 h-7 rounded-lg bg-muted text-primary font-bold grid place-items-center text-sm">{optionLabels[i]}</span>` |
| B2 | `QuizView.tsx` 選項 hover 邊框（約 L216） | `bg-background border hover:border-primary/50` | `bg-background border hover:border-primary/70` |
| B3 | `QuizView.tsx` 選項 render 結尾，加正解/錯選圖示 | 無 | 正解時選項右側加 `<span className="ml-auto text-correct text-xl font-black shrink-0" aria-hidden>✓</span>`；錯選時加 `<span className="ml-auto text-wrong text-xl font-black shrink-0" aria-hidden>✕</span>`。同時 `ResultView.tsx` 累積錯題本的「✓ 正確答案」由 `text-green-600` 改為 `text-correct` |

### C 類｜顏色細節（4 項）

| # | 檔案 | 當前 | 改為 |
|:--|:--|:--|:--|
| C1 | `index.css` `--wrong`（約 L57） | `0 55% 62%` | `0 60% 52%` |
| C2 | `MainMenu.tsx` 分課卡題數 pill（約 L157） | `text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground/70 group-hover:bg-primary/10 group-hover:text-primary` | `text-xs font-bold px-2 py-1 rounded-md bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary` |
| C3 | 同 C2（透明度已於 C2 同步處理）| — | — |
| C4 | `MainMenu.tsx` 分課卡「第 X 課」前綴（約 L155） | `<span className="text-muted-foreground font-semibold">第{i + 1}課　</span>` | `<span className="text-foreground/60 font-medium">第{i + 1}課　</span>` |

### D 類｜字型改動（試行，可退）

| # | 檔案 | 內容 |
|:--|:--|:--|
| D1 | `apps/v3_eidos/index.html` `<head>` | 新增 3 行：<br>`<link rel="preconnect" href="https://fonts.googleapis.com">`<br>`<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`<br>`<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700&family=Iansui&display=swap" rel="stylesheet">` |
| D2 | `apps/v3_eidos/src/index.css` `@layer base` | 新增兩條規則：<br>`h1, h2, .font-zh { font-family: 'Iansui', 'Noto Sans TC', sans-serif; letter-spacing: 0.02em; }`<br>`.num { font-family: 'Baloo 2', ui-monospace, monospace; font-variant-numeric: tabular-nums; }` |
| D3 | `index.css` body font-family（約 L107） | **保持不變**（仍為 Nunito + Noto Sans TC + 備援）。Iansui 僅作用於 h1/h2/.font-zh；Baloo 2 僅作用於 .num class |
| D4 | 全站套用 `.num` class（關鍵數字處） | 在以下位置加 `num` class：<br>• `MainMenu.tsx` 分課卡題數 pill 內文「N 題」<br>• `QuizView.tsx` 進度文字「第 X 題 / 共 Y 題」、「✓ N ✗ N」計數<br>• `ResultView.tsx` 分數大數字、正確率「X%」、總體統計格內數字、錯題本「錯 N 次 / 共 M 次」<br>• `LearningReportView.tsx` SummaryCard 數字、環形圖內「X%」、各課正確率標籤「X% (N/M)」、練習歷史「N/M」「X%」 |

### E 類｜規格書同步

| # | 檔案 | 內容 |
|:--|:--|:--|
| E1 | `docs/網站功能規格書.md §1.1` | 表格中 `--foreground` HSL 更新為 `30 12% 12%`（備註「JOB-204 提升對比度」） |
| E2 | `docs/網站功能規格書.md §1.1` | 若 `--muted-foreground` 未列於表格，新增一行 `--muted-foreground = 30 8% 40%`；若已列，同步更新 |
| E3 | `docs/網站功能規格書.md §1.4` | 字型章節更新：主字型保留 Nunito；標題（h1/h2）使用 Iansui 正體中文手寫體；數字類元素（`.num` class）使用 Baloo 2 tabular-nums。使用情境說明：標題更溫暖、數字對齊更穩定 |

**不做**：`PUBLISHER_THEME_COLORS` drift 修正（留遺留問題給後續 JOB）

---

## 🚧 任務邊界

### 本次任務只做

- 上述 A + B + C + D + E 共 **14 個改動點**
- 受影響檔案：`apps/v3_eidos/src/index.css`、`QuizView.tsx`、`MainMenu.tsx`、`ResultView.tsx`、`LearningReportView.tsx`、`apps/v3_eidos/index.html`、`docs/網站功能規格書.md`

### 本次任務不做（遇到請停止並回報）

- ❌ 動 `--primary` / `--background` / `--card` / `--accent` / 6 科目色 / 3 出版社色**任何色值**
- ❌ 新增 Clay Shadow / 圓角放大 / 主題大改 / Dark Mode 重配
- ❌ 改任何元件的 JSX **結構**（除 B1/B3 明確指定的 render 細節，即選項內容改動）
- ❌ 動 `apps/v3_eidos/src/data/config.ts`、`tailwind.config.ts`、`vite.config.ts`
- ❌ 動 `_agent/`、`docs/*.md`（§1.1 / §1.4 以外章節）
- ❌ 新增 utility class（除 `.num` 與 `.font-zh` 外）
- ❌ 動 `prototypes/ui-v2/`（那是 JOB-203 產物，保留作參考）

### 退版機制（重要）

**所有改動須單一 commit 包裝**。commit 訊息：

```
feat(ui): A+B+C 元素清晰化 + 字型試行（JOB-204）

為什麼這樣做：
使用者於 JOB-203 Phase 0 驗證後明確結論「只調文字、顏色、選項清晰度 + 試字型」。
若不滿意可一鍵 git revert 退版。

技術變更：
- A1/A2 --foreground / --muted-foreground 提升對比度
- A3 Quiz 題目字重升 semibold
- B1 選項 badge 改 28×28 方形底
- B2 選項 hover 邊框強化
- B3 正解/錯選 ✓/✕ 圖示（色盲友善）
- C1 --wrong 偏粉 → 正紅
- C2/C3/C4 分課卡題數 pill 與前綴微調
- D1-D4 字型試行：Iansui 標題 + Baloo 2 數字，body 保留 Nunito
- E1-E3 規格書 §1.1 §1.4 同步

JOB: JOB-204
```

若使用者回退：`git revert <commit>` 即完全恢復到 JOB-204 前狀態。

---

## 📖 執行步驟

1. **Pre-flight**：讀 `docs/技術設定/前端開發與AI實作守則.md` + `docs/上版前驗證標準.md`
2. **開分支**：`git checkout -b job-204-ui-clarity`
3. **A 類改動**：index.css A1 / A2；QuizView A3
4. **B 類改動**：QuizView B1（badge 方形化）/ B2（hover 邊框強化）/ B3（✓/✕ 圖示）；ResultView 硬編碼 `text-green-600` 改 `text-correct`
5. **C 類改動**：index.css C1；MainMenu C2/C3/C4
6. **D 類字型**：index.html D1 加字型 link；index.css D2 加 `h1, h2, .font-zh` 與 `.num` rule；D3 body 不動；D4 關鍵數字處加 `.num` class（≥ 8 處）
7. **E 類規格書同步**：`docs/網站功能規格書.md §1.1 §1.4`
8. **L1-3 verify gate**：`node scripts/verify_ui_data_integrity.mjs --gate`（需 0 違規）
9. **L2-1 + L2-2 測試**：`cd apps/v3_eidos && npx vitest run questionLoader` + `npx playwright test answer-integrity`
10. **L3 人工抽測（5 題）**：啟動 dev server port 8080，抽 G3 國語康軒 L1-L4 + L12 各一題驗證視覺
11. **Before / After 截圖**：4 組存於 `docs/visual-redesign/screenshots/job-204-before/` 與 `job-204-after/`
12. **單一 commit 提交**：依 commit 訊息範本
13. **產出 Report + 結案**：`jobs/JOB-204-Report.md` + `job_manager.js close JOB-204` + 更新 `docs/README_專案發展紀錄.md`

---

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] 已讀取 `docs/技術設定/前端開發與AI實作守則.md`
- [ ] 已讀取 `docs/上版前驗證標準.md`
- [ ] 已確認任務邊界：不動色系、不動結構、不動其他 token
- [ ] 已確認字型載入為**加法**（body 保留 Nunito，Iansui/Baloo 2 僅作用於 h1/h2/.font-zh/.num）
- [ ] 已備妥 dev server 驗證環境（port 8080）
- [ ] 已建立 branch `job-204-ui-clarity`

---

## ✅ 驗收 Checklist (Acceptance)

### A 類
- [ ] A1 DevTools computed 顯示 `--muted-foreground: 30 8% 40%` — 佐證：截圖
- [ ] A2 DevTools computed 顯示 `--foreground: 30 12% 12%` — 佐證：截圖
- [ ] A3 Quiz 題目 `font-weight: 600`（semibold）— 佐證：截圖

### B 類
- [ ] B1 選項 badge 28×28 方形、`bg-muted text-primary` — 佐證：截圖
- [ ] B2 選項 hover border-color 使用 `hsl(var(--primary) / 0.7)` — 佐證：hover 截圖
- [ ] B3 答對選項右側 `✓`、答錯選項右側 `✕`，字色 token 化 — 佐證：截圖
- [ ] ResultView 錯題本 `✓ 正確答案` 使用 `text-correct`（grep `text-green-600` 無殘留）

### C 類
- [ ] C1 `--wrong: 0 60% 52%` — 佐證：DevTools
- [ ] C2+C3 題數 pill `text-xs px-2 py-1 text-muted-foreground`（無 `/70` 透明）— 佐證：截圖
- [ ] C4 前綴 `text-foreground/60 font-medium` — 佐證：截圖

### D 類（字型）
- [ ] D1 Network 分頁顯示 Baloo 2 + Iansui fonts 200 OK — 佐證：DevTools Network
- [ ] D2 `index.css` 含 `h1, h2, .font-zh { font-family: 'Iansui', ... }` 與 `.num { font-family: 'Baloo 2', ... }` — 佐證：grep
- [ ] D3 body font-family **保持原值** — 佐證：git diff 顯示 body 行未改
- [ ] D4 `.num` class 套用 ≥ 8 處 — 佐證：`grep -rn "className=.*\\bnum\\b" apps/v3_eidos/src/components/ | wc -l` ≥ 8

### E 類（規格書）
- [ ] E1/E2 §1.1 表格 HSL 值更新 — 佐證：git diff docs/網站功能規格書.md
- [ ] E3 §1.4 字型章節擴充 — 佐證：同上

### 測試硬閘（依 `docs/上版前驗證標準.md`）

- [ ] L1-3 `verify_ui_data_integrity.mjs --gate` 0 違規 — 佐證：pre-commit log
- [ ] L2-1 `questionLoader.test.ts` 全通過 — 佐證：vitest 輸出
- [ ] L2-2 `answer-integrity.spec.ts` 全通過 — 佐證：playwright 報告
- [ ] L3 人工抽測 5 題（本次僅視覺改動，非全 87 題）— 佐證：截圖紀錄

---

## ✅ 成果 Checklist (Deliverables)

- [ ] 單一 commit，訊息符合 `docs/技術設定/commit-message-規範.md`（type: feat）
- [ ] 4 組 Before / After 截圖於 `docs/visual-redesign/screenshots/job-204-before/` 與 `job-204-after/`
- [ ] `jobs/JOB-204-Report.md` 產出並依 `_JOB-REPORT-TEMPLATE.md`
- [ ] `docs/README_專案發展紀錄.md` 新增一行：`2026-04-XX JOB-204 完成 UI 清晰化 + 字型試行`
- [ ] 已執行 `/pj_sync`
- [ ] Discord 摘要同步
- [ ] `node scripts/job_manager.js close JOB-204` 已執行

---

## ⏱️ 時程估算

| 階段 | 預估 |
|:--|:--:|
| A + B + C 改動 | 45 分鐘 |
| D 字型改動 + `.num` 套用（≥ 8 處） | 30 分鐘 |
| E 規格書同步 | 10 分鐘 |
| L1-3 + L2-1 + L2-2 測試 | 15 分鐘 |
| L3 人工抽測 5 題 + 截圖 | 20 分鐘 |
| Report 產出 | 15 分鐘 |
| **總計** | **約 2 小時** |

---

## 🔧 退版 SOP

若使用者在執行後覺得不滿意：

```bash
git log --oneline | grep JOB-204           # 找 commit hash
git revert <commit-hash>                    # 產生反向 commit
git push origin <branch>                    # 推送（若已 push）
```

revert 後 A/B/C/D/E 全部改動消失，`docs/網站功能規格書.md §1.1 §1.4` 同步回舊版，零副作用。

---

## 真實回報本次對話的模型與花費

＄作業匯總：Token數:{執行時填} | 花費: ${執行時填} | 使用模型: {執行時填} | 執行者: Cursor
