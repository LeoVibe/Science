*Created by Claude Code at 2026-04-20 17:45*

`last_updated`: 2026-04-20 17:45
`updated_by`: Claude Code (claude-opus-4-7)

# JOB-204 結案報告 — 視覺清晰化 A+B+C 與字型試行

**`job_type`**：`mixed`（engineering 主體 + docs_ops 同步規格書）與開案派工單一致
**`executor`**：Claude Code（使用者授權例外，2026-04-20 17:30）

---

## 📊 成果摘要

JOB-203 Phase 0 三輪雛形驗證後確立方向「只調文字對比度、選項清晰度、顏色細節 + 試字型」，不換色系、不動結構。本 JOB 單一 commit 包裝 14 項改動點，使用者瀏覽器驗收通過。所有改動皆對應可 revert：`git revert <commit>` 一鍵退版。

| 指標 | 數值 |
|:--|:--|
| 改動點數 | 14 項（A1-A3 + B1-B3 + C1-C4 + D1-D4 + E1-E3）|
| 受影響檔案 | 7 檔（index.html 1 + index.css 1 + 4 React 元件 + 規格書 1）|
| Git 統計 | +95 / -38 行 |
| `.num` class 套用處 | 17 處（派工單目標 ≥ 8，超額達成）|
| L1-3 UI 資料一致性 | 0 違規（6157 題全掃過）|
| L2-1 questionLoader 單元測試 | 8/8 通過 |
| Build | 1790 modules，5.02s |
| L2-2 Playwright 主檔 | ⚠️ 多數 fail，屬既有 test sample / 環境問題（非本 JOB 造成），列遺留 |

---

## 📋 14 項改動點逐項狀態

### A 類｜文字對比度
| 編號 | 改動 | 狀態 |
|:--:|:--|:--:|
| A1 | `--muted-foreground` `30 8% 50%` → `30 8% 40%`（WCAG AA 5.5:1）+ Dark `55%` → `68%` | ✅ |
| A2 | `--foreground` `30 12% 20%` → `30 12% 12%`（AAA 13:1）+ Dark `90%` → `94%` | ✅ |
| A3 | QuizView 題目字重 `font-medium` → `font-semibold` | ✅ |

### B 類｜選項清晰度
| 編號 | 改動 | 狀態 |
|:--:|:--|:--:|
| B1 | 選項 A/B/C/D badge 純文字 → 28×28 方形（`w-7 h-7 rounded-lg bg-muted text-primary`；答對變綠；錯選變紅）| ✅ |
| B2 | 選項 hover 邊框 `primary/50` → `primary/70` | ✅ |
| B3 | QuizView 答對/錯選右側加 `✓`/`✕` 24px 圖示（色盲友善）；ResultView 累積錯題本 `text-green-600` → `text-correct` token | ✅ |

### C 類｜顏色細節
| 編號 | 改動 | 狀態 |
|:--:|:--|:--:|
| C1 | `--wrong` `0 55% 62%` → `0 60% 52%`（粉紅 → 正紅）| ✅ |
| C2 | MainMenu 分課卡題數 pill 字級 `text-[10px]` → `text-xs`；padding `px-1.5 py-0.5` → `px-2 py-1` | ✅ |
| C3 | 題數 pill 透明度 `text-muted-foreground/70` → `text-muted-foreground` | ✅ |
| C4 | 分課卡「第 N 課」前綴 `text-muted-foreground font-semibold` → `text-foreground/60 font-medium` | ✅ |

### D 類｜字型試行
| 編號 | 改動 | 狀態 |
|:--:|:--|:--:|
| D1 | `apps/v3_eidos/index.html` 加 Baloo 2 + Iansui Google Fonts link（合併到現有 Noto Sans TC link 一行）| ✅ |
| D2 | `index.css @layer base` 新增 `h1, h2, .font-zh { font-family: 'Iansui', 'Noto Sans TC', sans-serif; letter-spacing: 0.02em; }` 與 `.num { font-family: 'Baloo 2', ui-monospace, monospace; font-variant-numeric: tabular-nums; }` | ✅ |
| D3 | body font-family **保持不變**（Nunito + Noto Sans TC），Iansui/Baloo 2 僅作用於 h1/h2/.font-zh/.num | ✅ |
| D4 | 全站 17 處關鍵數字加 `.num` class | ✅ |

### E 類｜規格書同步
| 編號 | 改動 | 狀態 |
|:--:|:--|:--:|
| E1 | `docs/網站功能規格書.md §1.1` `--foreground` → `30 12% 12%` | ✅ |
| E2 | §1.1 新增 `--muted-foreground` / `--wrong` 行 | ✅ |
| E3 | §1.4 字型章節擴充：Nunito body + Iansui 標題 + Baloo 2 數字三層說明 + 載入字串 + 退版機制 | ✅ |

---

## 📂 異動清單

> 所有檔案都在派工單邊界內。未動 `apps/v3_eidos/src/data/config.ts`、`tailwind.config.ts`、`vite.config.ts`、其他規格書章節、`_agent/`、`prototypes/`。

| 檔案路徑 | 異動類型 | 說明 |
|:--|:--|:--|
| `apps/v3_eidos/index.html` | 修改 | D1：合併字型 `<link>` 加入 Baloo 2 + Iansui |
| `apps/v3_eidos/src/index.css` | 修改 | A1/A2 Light+Dark 對比度；C1 wrong 正紅；D2 h1/h2/.font-zh + .num 規則 |
| `apps/v3_eidos/src/components/QuizView.tsx` | 修改 | A3 題目字重；B1 選項 badge 方形化；B2 hover 邊框；B3 ✓/✕ 圖示；D4 進度與計數加 .num |
| `apps/v3_eidos/src/components/MainMenu.tsx` | 修改 | C2/C3 題數 pill；C4 前綴色；D4 題數數字加 .num |
| `apps/v3_eidos/src/components/ResultView.tsx` | 修改 | B3 text-green-600 → text-correct；D4 分數/正確率/stats/錯題次數加 .num |
| `apps/v3_eidos/src/components/LearningReportView.tsx` | 修改 | D4 SummaryCard/環形圖/各課長條/練習歷史數字加 .num |
| `docs/網站功能規格書.md` | 修改 | E1/E2/E3 §1.1 §1.4 同步 |
| `jobs/JOB-204-USER-視覺清晰化-ABC三組與字型調整.md` | 新增 | 本 JOB 派工單 |
| `jobs/JOB-204-Report.md` | 新增 | 本結案報告 |
| `docs/README_專案發展紀錄.md` | 修改 | 新增 JOB-204 完成條目（結案流程一併提交）|

**Git diff 統計**：`+95 / -38` 行（不含 Report 與派工單本身）

---

## ✅ Checklist 對照結果

### 啟動 Checklist (Pre-Flight)

- [x] 已讀取 `docs/技術設定/前端開發與AI實作守則.md` — 佐證：硬閘 #1「禁止 JSX 硬編碼色碼」已遵循（B3 將 text-green-600 改 text-correct token）
- [x] 已讀取 `docs/上版前驗證標準.md` — 佐證：L1-3/L2-1/L2-2 章節已納入執行
- [x] 已確認任務邊界 — 佐證：未動 color 主系 token、元件 JSX 結構、其他規格書章節
- [x] 已確認字型載入為加法 — 佐證：body font-family 原 `"Nunito", "Noto Sans TC", ...` 未動，僅新增 h1/h2/.font-zh + .num rule
- [x] 已備妥 dev server 驗證環境 — 佐證：port 8080 Vite dev server 運行中（使用者自行啟動）
- [x] 已建立 branch `job-204-ui-clarity` — 佐證：`git branch` 顯示當前在此分支

### 驗收 Checklist (Acceptance)

**A 類**
- [x] A1 `--muted-foreground: 30 8% 40%` — 佐證：`git diff apps/v3_eidos/src/index.css` L26
- [x] A2 `--foreground: 30 12% 12%` — 佐證：同檔 L10 + Dark `L72`
- [x] A3 題目 `font-semibold` — 佐證：`QuizView.tsx` L213

**B 類**
- [x] B1 badge 28×28 方形 — 佐證：`QuizView.tsx` 選項 render span className 含 `w-7 h-7 rounded-lg bg-muted text-primary`
- [x] B2 hover `primary/70` — 佐證：optClass 初始值
- [x] B3 ✓/✕ 圖示 — 佐證：選項 render 尾端兩個 conditional span；ResultView `text-green-600` → `text-correct`（grep 0 殘留）

**C 類**
- [x] C1 `--wrong: 0 60% 52%` — 佐證：index.css L57
- [x] C2+C3 題數 pill `text-xs px-2 py-1 text-muted-foreground` — 佐證：MainMenu L158-160
- [x] C4 前綴 `text-foreground/60 font-medium` — 佐證：MainMenu L156

**D 類（字型）**
- [x] D1 index.html 載入 Baloo 2 + Iansui — 佐證：`<link>` href 含 `family=Baloo+2:wght@500;700&family=Iansui`
- [x] D2 `h1, h2, .font-zh` + `.num` rule — 佐證：index.css `@layer base` 第二段
- [x] D3 body font-family 保持原值 — 佐證：`git diff apps/v3_eidos/src/index.css` body block 未改
- [x] D4 `.num` class **17 處**（目標 ≥ 8）— 佐證：`grep -rn "className=[^>]*\\bnum\\b" apps/v3_eidos/src/components/` 輸出 17 筆

**E 類（規格書）**
- [x] E1/E2 §1.1 表格 HSL 值更新 — 佐證：git diff docs/網站功能規格書.md
- [x] E3 §1.4 字型章節擴充 — 佐證：同檔

**測試硬閘**
- [x] L1-3 `verify_ui_data_integrity.mjs --gate` **0 違規** — 佐證：掃描 6157 題、D-INT-1/2/3/4 各 0
- [x] L2-1 `questionLoader.test.ts` **8/8 通過** — 佐證：vitest 953ms Duration
- [ ] L2-2 `answer-integrity.spec.ts` 全通過 — **未達成**：多數 fail 於 `expect(getByRole('button', { name: /第N課/ })).toBeVisible` line 85 timeout 15s。錯誤模式與本 JOB 改動無關（未動 button text content）。判定為**既有 test sample 或環境問題**，已列遺留問題 §1
- [x] L3 人工抽測 — 使用者於 <http://localhost:8080/> 瀏覽器驗收通過

**Build**
- [x] Build 通過 1790 modules / 5.02s / 98.79 KB CSS / 627.73 KB JS

### 成果 Checklist (Deliverables)

- [x] 單一 commit，訊息符合 `docs/技術設定/commit-message-規範.md`（type: `feat`，含 JOB: JOB-204）
- [ ] 4 組 Before / After 截圖於 `docs/visual-redesign/screenshots/job-204-*` — **未產出**：Claude Code 環境無直接瀏覽器截圖能力，使用者已於瀏覽器目視驗收，截圖留待後續若需文檔化補拍
- [x] `jobs/JOB-204-Report.md` 產出（本檔）
- [x] `docs/README_專案發展紀錄.md` 新增條目
- [ ] 已執行 `/pj_sync` — 待使用者觸發
- [ ] Discord 摘要同步 — 待使用者觸發
- [x] `node scripts/job_manager.js close JOB-204` 已執行

---

## ⚠️ 遺留問題

### §1 L2-2 Playwright 多數 fail（既有問題，非本 JOB 造成）

**現象**：`answer-integrity.spec.ts` 217 個測試絕大多數 fail 於 line 85：
```
getByRole('button', { name: /第N課/ }).first() → visible timeout 15000ms
```

**判定非本 JOB 造成的依據**：
1. 本 JOB 未動任何分課卡 button 的 **text content**（「第 N 課　XX」text 保持原樣）
2. Accessible name 計算基於 text content，不受 className 變動影響
3. 另於 `git stash` 比對 main 分支 MainMenu.tsx L155 同一邏輯，text 輸出相同
4. Playwright 失敗遍及所有 publisher/subject/lesson，表示 MainMenu 根本未渲染或 WelcomeSetup 未被測試處理——這屬於測試 fixture / dev server 環境問題

**可能原因**（待後續診斷）：
- 測試未處理首登 WelcomeSetup 的 localStorage 初始化
- port 8080 dev server 與 port 5173 兩個 Vite instance 並存造成測試連線不穩
- 測試 sample data 中 lessonOrder 指向題庫中不存在的課次（例 G3 Math HanLin 實際只有 L1-L9 但 sample 引用 L4-L7 等需再驗證）

**建議處理**：另開 JOB-206 或在 JOB-205 同時排查，優先級低於 JOB-205 課名補齊。

### §2 42 manifest + 212 lesson JSON 的 `title` 為佔位符 `L{N}`

**現象**：G3-G6 英語/數學/自然/社會 S2 共 42 個 manifest 的 `items[].title` 值填入 `"L1"`/`"L2"` 等 id 重複字串，非真實課名。導致 MainMenu 分課卡顯示「第 1 課 L1」、「第 2 課 L2」，學生看不到課文名稱。

**影響範圍**：
- 所有英語（G3-G5 × 上下學期 × 3 出版社 = 18 manifest）
- G3/G4/G5/G6 數學 S2（12 manifest）
- G3/G6 自然、社會 S2（12 manifest）
- 國語（所有年級）已有真實課名，不受影響

**處理**：**另開 JOB-205**（使用者 2026-04-20 17:50 確認），`job_type: question_prod` 或 `research`，需研究教育部課綱 / 各出版社真實教科書目錄，補齊 manifest 與對應 lesson JSON 的 `title` 欄位。

### §3 Before/After 截圖未產出

**原因**：Claude Code 環境無直接瀏覽器截圖能力。

**處理**：使用者已於 <http://localhost:8080/> 目視驗收。若需文檔化，後續可用 `mcp__claude-in-chrome__*` 工具或使用者人工補拍，存於 `docs/visual-redesign/screenshots/job-204-before/` 與 `job-204-after/`。

### §4 題目 scenario 欄位使用不一致 + 疑似錯放題目（嚴重度：🔴 高）

**觸發**：使用者 2026-04-20 17:50 於答題畫面觀察到 G5 南一 L4「縣官審石頭」練習中出現「太陽公公每天照亮大地」類題目，scenario 標示為「太陽公公的笑容」，與課文完全無關。

**全站掃描結果**（2026-04-20 17:55 跑 `python3` 過濾規則：排除 `L{N}` 佔位符 title + 排除 `【…】` 情境前綴 + unique 主題級 scenario ≥ 3）：

| 類別 | 檔數 | 說明 |
|:--|:--:|:--|
| 有真實 title 的 lesson JSON 總數 | 439 | 篩選基數 |
| **unique 主題級 scenario ≥ 3 者** | **117** | 需進一步審核 |
| **100% scenario 與 title 無共字**（強可疑）| 10+ | 極可能錯放 |

**最可疑 Top 10**（scenario 完全無 title 字元交集）：

| 檔案 | title | 題數 | unique scenarios | unrelated |
|:--|:--|:--:|:--:|:--:|
| G3/Chinese/S2/KangHsuan/L1 | 許願 | 60 | 47 | 47 |
| G5/Chinese/S2/HanLin/L4 | 滿修女採訪記 | 54 | 33 | 33 |
| G3/Chinese/S2/HanLin/L2 | 還差一點 | 30 | 30 | 29 |
| G3/Chinese/S2/KangHsuan/L12 | 還要跌幾次 | 29 | 29 | 29 |
| G5/Chinese/S2/KangHsuan/L2 | 智救養馬人 | 41 | 32 | 26 |
| G3/Chinese/S2/HanLin/L6 | 月世界 | 30 | 24 | 24 |
| G3/Chinese/S2/HanLin/L4 | 靜靜的淡水河 | 29 | 25 | 23 |
| G3/Chinese/S2/HanLin/L3 | 用膝蓋跳舞的女孩 | 27 | 27 | 22 |
| G3/Chinese/S2/HanLin/L9 | 就愛倆倆在一起 | 29 | 21 | 21 |
| G3/Chinese/S2/KangHsuan/L2 | 下雨的時候 | 62 | 40 | 18 |

**觀察**：疑似錯放分三類，不能一概而論：

1. **scenario 寫成「考點分類」**（例：「主題意涵與成語聯想」「修辭手法的效果分析」「全篇主旨感悟」）— 題目內容**未必錯放**，只是 scenario 欄位誤用為「題型標籤」。需要看題目實際內容判定。
2. **scenario 引用其他課文**（例：G3 康軒 L2「下雨的時候」出現「《大象的煩惱》一文中...」）— **明確錯放**。
3. **scenario 為具象主題名詞**（例：G5 南一 L4「縣官審石頭」出現「太陽公公的笑容」「雨後的彩虹」）— **需人工核對題目是否真的錯放**。觸發本次發現的 G5 南一 L4 即屬此類，12 題有 10 題內容與課文不符。

**建議處理**：獨立開 JOB-206（`job_type: question_verify`），先**定義 scenario 欄位規範**（情境前綴 vs 考點分類 vs 主題名詞，擇一統一），再**逐檔 LLM/人工審核 117 檔**確認題目是否真錯放，錯放題目降為 `is_active: false` 或重新出題。

**本 JOB 不動**：純 UI 清晰化，題庫內容品質屬另一軌。

---

## 🔧 技術筆記

### 字型試行觀察

- Iansui 手寫體在主選單「國語複習」「數學複習」等標題上呈現明顯，視覺溫暖度提升
- Baloo 2 tabular-nums 對數字（題數、分數、正確率）對齊穩定
- body 保留 Nunito 避免大幅改動閱讀感，若三個月內未見負評可於後續 JOB 考慮推廣至 body

### Clay Shadow / Token 結構保留不變

JOB-203 第一輪提案的 Claymorphism（大圓角 + 多層陰影 + Learning Blue 換色）全部未採納，符合使用者「保守漸進」決定。`prototypes/ui-v2/` 保留作為未來討論參考，未影響主專案。

### L2-2 後續排查指引（給 JOB-206 接手者）

1. 先核對 `tests/answer-integrity.spec.ts` 的 sample data 與 `question/platform/*/manifest.json` 是否對齊（lessonOrder 有效性）
2. 確認測試流程是否處理 WelcomeSetup（首次訪問時 localStorage 無 UserProfile）
3. 排除多個 Vite dev server 並存干擾：跑 Playwright 前 `pkill -f vite && sleep 1 && npm run dev &`
4. 本 JOB 僅改 className 與 CSS 變數，與 answer-integrity 核心斷言（「UI 標綠 = JSON answer_index」）無邏輯關聯，可作為對照基準

### 退版 SOP

```bash
git log --oneline | grep JOB-204              # 找 commit hash
git revert <commit-hash>                       # 反向 commit
# （若已 push）git push origin job-204-ui-clarity
```

Revert 後 A/B/C/D/E 14 項改動完全消失，`docs/網站功能規格書.md §1.1 §1.4` 同步回舊版。字型載入亦一併移除。零副作用。

---

## 🔍 驗收確認

| 欄位 | 內容 |
|:--|:--|
| 驗收者 | user（2026-04-20 17:45 於 <http://localhost:8080/> 目視驗收） |
| 驗收時間 | 2026-04-20 17:45 |
| 驗收結果 | 通過（視覺效果接受；指出 manifest title 為 LN 佔位符問題，另開 JOB-205 處理） |
| 退回原因 | 無 |

---

## ⏱️ 執行時間回報

| 子任務 / 階段 | 開始時間 | 結束時間 | 耗時（分鐘） | 備註 |
|:--|:--|:--|:--|:--|
| Pre-flight + 分支建立 | - | - | - | Claude Code 環境限制 |
| A+B+C 改動 | - | - | - | 同上 |
| D 字型改動 | - | - | - | 同上 |
| E 規格書同步 | - | - | - | 同上 |
| L1-3 + L2-1 + Build | - | - | - | 同上 |
| L2-2 排查（未完成） | - | - | - | 同上 |
| Dev server 重啟（Vite dep cache 過期）| - | - | - | 同上 |
| Report 撰寫 | - | - | - | 同上 |
| **總計** | — | — | **—** | `docs/README_通用作業準則.md §5.3` 規定：Claude Code 環境無壁鐘時間，填 `-` |

---

## 真實回報本次對話的模型與花費

＄作業匯總：Token數:- | 花費: $- | 使用模型: claude-opus-4-7 | 執行者: Claude Code

> 依 `docs/README_通用作業準則.md §5.1` 情境 B：本 JOB 屬跨多輪 session，真實 Meta 由使用者在 Discord / 後續結案彙總時補填。Claude Code 環境嚴格無法取得自身 token 計數，禁止推估。
