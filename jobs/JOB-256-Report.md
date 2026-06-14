*Created by Claude at 2026-06-14 12:35*

`last_updated`: 2026-06-14 12:35
`updated_by`: Claude Code (claude-opus-4-8[1m])

# JOB-256 結案報告

**`job_type`**：`engineering`
**`executor`**：Claude

## 📊 成果摘要
修復正式站全站失效的「問題回報」回饋功能（根因：`questionLoader.ts` 標準題庫分支以 `...q` spread 而題庫 JSON 無 `id` 欄位，致送出 body 缺 `questionId`，後端回 400）。同步將數學、英語全面下架（選單入口移除 + 深連結攔截），對 QL3 以下題庫加上「BETA」標記，並重生成 `libraryStats.json` 修正過時數據（G3 自然由顯示 120/150 修正為實際 200）。改動經型別檢查、資料完整性閘門、本機與正式站瀏覽器抽測後上版，線上回饋送出已由 400 轉為 200。

> 本單為 engineering 任務，無題庫產出，CQI 指標不適用。

## 📂 異動清單

| 檔案路徑 | 異動類型 | 說明 |
|:--|:--|:--|
| `apps/v3_eidos/src/data/questionLoader.ts` | 修改 | 標準題庫分支 `.map((q,i)=>)` 補 `id: q.id ?? \`${lesson}_q${i+1}\`` fallback（修復 questionId 缺失） |
| `apps/v3_eidos/src/data/config.ts` | 修改 | 新增 `DISABLED_SUBJECTS`／`isSubjectEnabled`；`getSubjectsByGrade` 改 filter 過濾數英 |
| `apps/v3_eidos/src/pages/Index.tsx` | 修改 | 兩個 URL 解析 useEffect + 科目切換 effect 加 `isSubjectEnabled`（擋數英深連結）；menu/quiz 對非 QL4 題庫顯示 BETA 標記 |
| `apps/v3_eidos/src/utils/libraryAvailability.ts` | 修改 | 新增 `getLibraryQuality`／`isBetaLibrary`；`PubRow` 加 `quality` 欄位 |
| `apps/v3_eidos/src/data/libraryStats.json` | 修改 | 重生成，`lastUpdated` 2026/06/14 |
| `apps/v3_eidos/public/data/libraryStats.json` | 修改 | 同上（public 副本） |

> commit：`3e9111ca`（A/B/C/D 主體）；beta 文案精簡為「BETA」於後續 commit。

## ✅ Checklist 對照結果

### 驗收 Checklist (Acceptance) — engineering 版
- [x] TypeScript 型別檢查 — `tsc --noEmit` exit 0
- [x] 資料完整性閘門 — `verify_ui_data_integrity.mjs --gate`：檢查 6929 題，D-INT-1~4 = 0，exit 0
- [x] loader 測試無回歸 — 6 failed | 2 passed；`git stash` 對照 baseline 完全相同（零新增失敗）
- [x] A 線上驗證 — exam15 回饋送出 network **200**（修復前 400）；攔截 body 含 `questionId:"L2_q34"`（修復前缺鍵）
- [x] B 線上驗證 — 選單僅國自社；`/g4/mat/s2/hlm` 直連被導回 `/g3/chi/s2/nani`
- [x] C 驗證 — G5 國語（QL3）顯示 BETA 標記
- [x] D 線上驗證 — about/library「最後更新 2026/06/14」、G3 自然 200/200/200 QL4

### 成果 Checklist (Deliverables)
- [x] 異動清單已列出所有實際路徑（上表 6 檔）
- [x] 已部署正式站並完成線上驗證
- [ ] 進度總表 / `/pj_sync` — 前端工程任務，非題庫產出；未動進度彙整

## 🔄 同步確認
- [ ] `docs/進度彙整_題庫研發與產出.md` — 未更新（無題庫產出）
- [ ] `docs/README_專案發展紀錄.md` /pj_sync — 未執行（如需可後補）
- [x] `apps/v3_eidos/src/data/libraryStats.json` 已重新產出（src + public）

## ⚠️ 遺留問題
1. **loader 單元測試 baseline 6/8 失敗**：`questionLoader.test.ts` 在本次之前即有 6 個失敗（測試 mock 環境問題，非本次造成）。建議另開單修復測試環境，使其能涵蓋本次新增的 id fallback。
2. **beta 文案用字**：使用者原指示「圖庫尚未嚴謹測試」，最終依使用者裁示精簡為「BETA」標記。
3. **G5/G6 自然、社會仍未盲測**：about 顯示「尚未建構題庫」/未上架，屬題庫產出範圍，非本單範圍（見先前三科健檢結論）。

## 🔧 技術筆記
- 回饋根因定位採「線上 vs 本機二分法」：本機最新源碼同樣復現缺 questionId，排除「線上舊 bundle」，確認為源碼 bug。關鍵在 loader 有兩條處理 `data.questions` 的分支，**有 id fallback 的 line 254 分支被前面 line 230（`data.meta && data.questions`）攔截，永遠走不到**——標準題庫一律走 line 230 的 `...q` spread。
- 數英下架採「單一真相」設計：`DISABLED_SUBJECTS` 同時驅動選單與路由，未來恢復上架只需從清單移除一個科目。
- 部署：push main 觸發 `.github/workflows/deploy.yml`，同一 workflow 同步部署 GitHub Pages 與 Cloudflare Pages（`--project-name=exam15`）。

## 🔍 驗收確認
| 欄位 | 內容 |
|:--|:--|
| 驗收者 | （待 user 填寫） |
| 驗收時間 | — |
| 驗收結果 | 待驗收 |
| 退回原因 | — |

> 此欄由執行者以外者填寫。

## ⏱️ 執行時間回報

| 子任務 / 階段 | 開始時間 | 結束時間 | 耗時（分鐘） | 備註 |
|:--|:--|:--|:--|:--|
| 全程（debug→實作→驗證→上版→補件） | — | — | - | session 壁鐘時間無法精確取得，依規範填 `-` |

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:- | 花費: - | 使用模型: claude-opus-4-8[1m] | 執行者: Claude
