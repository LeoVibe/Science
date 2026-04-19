`last_updated`: 2026-04-19
`updated_by`: Claude Code (claude-opus-4-7)

# JOB-200: 上版前題目正解驗證（Cursor + Antigravity + Codex 分工）

**`job_type`**：`release_validation`
**`executor`**：Cursor / Antigravity / Codex（分工，見 §四）+ Claude Code（彙整）

---

## 一、給執行 Agent 的專案 on-ramp（不熟 Eidos 請先讀這段）

### Eidos 是什麼
Eidos 是為台灣國小 3-6 年級學生設計的課後複習題庫網站。每道題對應特定的 (年級 / 學期 / 科目 / 出版社 / 課次)，以四選一選擇題為主。題庫儲存於 `question/platform/{Grade}/{Subject}/{Semester}/{Publisher}/{Grade}_{Semester}_{Subject}_{Publisher}_L{N}.json`。

**JSON 結構**：
```json
{
  "meta": { "grade": "G3", "semester": "S2", "subject": "SOC", "publisher": "HANLIN", "lesson": "L2", "title": "L2", "order": 2 },
  "questions": [
    {
      "question": "從消防員叔叔的介紹中，我們可以知道消防局這個生活空間，對社區居民來說有什麼重要的意義？",
      "scenario": "【在參觀消防局時】消防員叔叔向小朋友介紹了各種消防車輛和裝備...",
      "options": [
        "A. 它是讓大家學習烹飪的地方",
        "D. 它是專門處理法律糾紛的法院",
        "B. 它是提供緊急救援和安全保障的地方",
        "C. 它是舉辦社區才藝表演的舞台"
      ],
      "answer_index": 2,
      "explanation": "消防員的工作職責是撲滅火災、執行救護...",
      "is_publishable": true,
      "quality_level": "QL4"
    }
  ]
}
```

**重要 JSON 欄位說明**：
- `answer_index`：**正解在 `options` 陣列的索引**（0=第一個、1=第二個、2=第三個、3=第四個）。**不是**選項文字裡的 "A./B./C./D." 前綴！
- `options` 字串裡的 `"A. "/"B. "/"C. "/"D. "` 前綴是舊產題器留下的歷史污染，前端會用 `stripOptionPrefix` 去除。**位置才是真實的，前綴可能對不上。**
- `is_publishable: false` 的題目不顯示給使用者。
- `quality_level` 可為 `QL1/QL2/QL3/QL4/QL5`，定義見 `question/README_驗證與盲測準則.md` 第四章。

### 前端顯示邏輯（QuizView / ReviewView）
- 前端按 `options` 陣列**位置**顯示為 A / B / C / D
- `answer_index: 2` → 前端把 **C 位置**標為綠框（正解）
- 前端的 `stripOptionPrefix` 會去除每個選項字串的 `"A./B./C./D."` 前綴後再顯示

### 2026-04-19 的 Hotfix
- **Bug**：`apps/v3_eidos/src/data/questionLoader.ts:242` 原本讀 `q.answer`，但全站 12,911 題只有 `answer_index` 欄位 → 所有題目前端都誤把 A 標為正解。
- **修補**：改為 `q.answer_index ?? q.correctAnswer ?? q.answer ?? 0`
- **已做的自動化驗證**：
  - Unit test 8/8 pass（`apps/v3_eidos/src/data/questionLoader.test.ts`）
  - `scripts/verify_ui_data_integrity.mjs --gate` 全站 6157 題 0 違規
  - Playwright `answer-integrity.spec.ts` 198/217 pass（19 個失敗需本 JOB 處理）

---

## 二、本 JOB 要完成什麼

**上版前驗證**：在 commit hotfix 與全部文檔審查並 push 觸發部署之前，對 G3-G6 × S2（開放範圍）每一個（年級×科目×出版社×課次）組合完成**真實瀏覽器驗證**，確認前端顯示的綠色正解位置 === JSON `answer_index` 指向的選項文字。

**總樣本**：217 個（自動產生，`apps/v3_eidos/tests/answer-integrity.samples.json`）

**成功判準**：每個樣本在瀏覽器中：
- `review` 模式下點擊對應課次 → 顯示該題區塊
- 帶 `bg-correct-light` class（或綠底樣式）的選項文字 === `options[answer_index]` 去前綴後的文字
- 若有不符，記錄具體 (json 路徑, 題目索引, UI 顯示的綠選文字, 預期的綠選文字) 並標記為 FAIL

### 🚨 驗證方式強制規定（所有 Phase 適用）

**必須使用真實瀏覽器實測**，不可僅用邏輯推導或 grep JSON 檔案來交差。允許的三種做法：

| 做法 | 適用 | 工具 |
|:--|:--|:--|
| A. Playwright headed／headless | 全自動批量 | `cd apps/v3_eidos && npx playwright test answer-integrity` |
| B. 手動在 Chrome／Firefox 點擊 | 深度抽樣、疑點排查 | 起 dev server 後親眼看 UI，每題建議截圖 |
| C. DevTools Console 腳本自動化 | 已進入某頁時快速批量比對 | §八提供 snippets |

**不允許**的做法：
- ❌ 只開 JSON 檔用 `answer_index` 跟 `options[answer_index]` 比對自己 → 這只驗證資料，沒驗證前端顯示邏輯
- ❌ 只跑 unit test 斷言 `normalizedAnswer === answer_index` → 同上
- ❌ 不實際載入 dev server 就宣告通過

**本 JOB 的核心目的**：確認 UI 層（含 questionLoader → QuizView/ReviewView → DOM class `bg-correct-light`）整條 pipeline 對每個樣本都正確。任何繞過瀏覽器的「驗證」都無效，結案時會被 Claude 退件重做。

---

## 三、前置資料與工具

### 必讀檔案（請在開工前逐一讀過）
| 路徑 | 作用 |
|:--|:--|
| `docs/上版前驗證標準.md` | L1/L2/L3 三層驗證規範，本 JOB 屬 L3 層 |
| `question/README_驗證與盲測準則.md` §4 | QL 定義 |
| `apps/v3_eidos/src/data/questionLoader.ts` line 228-247 | Hotfix 的核心邏輯 |
| `apps/v3_eidos/src/components/QuizView.tsx` line 215-240 | UI 顯示邏輯（optionLabels / bg-correct-light） |
| `apps/v3_eidos/src/components/ReviewView.tsx` | Review 模式選課與題目顯示 |
| `apps/v3_eidos/src/utils/format.ts` | `stripOptionPrefix` 去前綴邏輯 |

### 樣本清單
`apps/v3_eidos/tests/answer-integrity.samples.json` — JSON 陣列，每筆：

```json
{
  "grade": 3,
  "subjectPath": "soc",
  "semesterPath": "s2",
  "publisherPath": "hlm",
  "jsonFile": "question/platform/G3/SocialStudies/S2/HanLin/G3_S2_SOC_HANLIN_L2.json",
  "lessonOrder": 2,
  "questionIndex": 15
}
```

### 啟動 dev server 的指令
```bash
cd apps/v3_eidos && npm run dev
# 會在 http://localhost:8080/ 啟動
```

### 從 sample 推導待驗證 URL 的公式
```
http://localhost:8080/g{grade}/{subjectPath}/{semesterPath}/{publisherPath}/review
```
舉例：`http://localhost:8080/g3/soc/s2/hlm/review` → 進入後點擊「第 2 課」→ 找到第 16 題（questionIndex=15，0-based）

### Welcome Setup 蓋台繞過
首次進入網頁會有首登設定蓋台，可手動按「完成設定」或在 DevTools 執行：
```js
localStorage.setItem('sci_v2_user_profile', JSON.stringify({grade:3, semester:2, publisher:'HanLin', setupComplete:true, maxQuizQuestions:25}));
localStorage.setItem('hasSeenValueOnboarding', 'true');
location.reload();
```

---

## 四、工作分工

### Phase 0（Cursor 先行，1 小時內完成）：資料清理 + 阻斷排除

**目標**：清理阻礙其他 agent 執行的 manifest 殘項。

**任務清單**：
1. 開啟 `apps/v3_eidos/public/question/platform/G3/Math/S2/KangHsuan/manifest.json`
2. 刪除 `items` 陣列中 `id === "mismatch_catalog"` 或 `file === "mismatch_catalog.json"` 的項目
3. 同步 source：`question/platform/G3/Math/S2/KangHsuan/` 下的 `*_manifest.json` 也做同樣清理
4. 跑 `node scripts/verify_format_consistency.js` 確認無誤
5. 重新跑 Playwright 確認先前失敗的 9 個 G3 Math KangHsuan tests 通過：
   ```bash
   cd apps/v3_eidos && npx playwright test answer-integrity --project=chromium -g "G3_S2_MATH_KANGHSUAN"
   ```

**Phase 0 產出**：`jobs/JOB-200-Phase0-Report.md`（簡短，說明清理了什麼 + playwright 回測結果）

**Phase 0 未完成，Phase 1/2/3 不得開工**。

---

### Phase 1（Cursor，131 樣本）：G3-G4 × 國語/數學/社會

**分配樣本**：`answer-integrity.samples.json` 中 `grade === 3 || grade === 4`，且 `subjectPath` 為 `chi / mat / soc` 者。**實際 131 題**（G3 chi 33 + G3 mat 28 + G3 soc 17 + G4 chi 36 + G4 soc 17；G4 數學全站 QL1 未上架故不入採樣）。

**執行步驟**（對每個樣本）：
1. 開啟瀏覽器到 `http://localhost:8080/g{grade}/{subjectPath}/s2/{publisherPath}/review`
2. 點擊「第 {lessonOrder} 課」
3. 滾動到「第 {questionIndex + 1} 題」
4. 觀察哪個選項有綠色背景
5. 開啟 `{jsonFile}`，查 `questions[{questionIndex}].answer_index` 與 `options[answer_index]`
6. 比對 UI 綠選項文字（去前綴後）與 JSON 期望文字

**記錄格式**：`jobs/JOB-200-Phase1-Report.md`
```markdown
| # | jsonFile | qIdx | 預期文字 | UI 綠選文字 | 結果 |
|:-:|:--|:-:|:--|:--|:-:|
| 1 | G3/Chinese/S2/HanLin/L1 | 0 | 父親的眼神很溫柔 | 父親的眼神很溫柔 | ✅ |
| 2 | G3/Chinese/S2/HanLin/L2 | 3 | 風的形狀 | 父親的眼神很溫柔 | ❌ |
```

**Phase 1 完成標準**：103 題全部記錄；FAIL 題目列出具體差異。

---

### Phase 2（Antigravity，36 樣本）：G3-G4 × 自然/英語

**分配樣本**：`answer-integrity.samples.json` 中 `grade === 3 || grade === 4` 且 `subjectPath` 為 `sci / eng` 者。
- G3 Science（翰林/康軒/南一 各 4）= 12
- G3 English（翰林/康軒/南一 各 4）= 12
- G4 Science（翰林/康軒/南一 各 4）= 12
- G4 English 全站 QL1 不入採樣
- **合計 36 題**

**執行步驟**：同 Phase 1。

**記錄格式**：`jobs/JOB-200-Phase2-Report.md` （表格同上）

---

### Phase 3（Codex，50 樣本 + 深度檢查）：G5-G6 × 國語 + 特殊 case 調查

**分配樣本**：`answer-integrity.samples.json` 中 `grade === 5 || grade === 6` 且 `subjectPath === "chi"` 者。
- G5 Chinese（翰林 7 + 康軒 7 + 南一 5）= 19
- G6 Chinese（翰林 11 + 康軒 9 + 南一 11）= 31
- **合計 50 題**

**加碼任務**：Phase 1/2 中 FAIL 的題目，Codex 做深度重驗：
- 排除瀏覽器快取：隱身模式重開
- 抽換 questionLoader 是否真的讀到正確欄位（DevTools Network 看實際 JSON）
- 記錄懷疑是「data 破壞」還是「UI 邏輯」問題

**特殊 case（Playwright 2026-04-19 曾失敗者，Phase 0 後尚未復測）**：G3 Math KangHsuan 已由 Phase 0 解決；其餘 10 個需要 Codex 在 Phase 3 期間順手確認已恢復：
- G3 英語 HanLin L2, L4（Phase 2 範圍，Codex 在 Phase 4 彙整時跟 Antigravity 報告交叉比對）
- G3 英語 KangHsuan L1（同上）
- G4 自然 NanYi L4（同上）
- G4 社會 HanLin L1, L3, L4（Phase 1 範圍，Codex 與 Cursor 報告交叉比對）
- G6 國語 KangHsuan L8, L10, L11（**Phase 3 自己範圍**，Codex 必須直接深度驗證）

**記錄格式**：`jobs/JOB-200-Phase3-Report.md`
- 表格（同 Phase 1/2）
- FAIL 題目的深度分析區塊（一題一個小節）

---

### Phase 4（Claude，彙整與釋出決議）

**前置條件**：Phase 0/1/2/3 四份 Report 全部存在且標記為 DONE。若任何 Phase 未完成，Phase 4 不得開工。

**執行步驟**：
1. **讀入所有 Report**：`jobs/JOB-200-Phase0-Report.md`、`JOB-200-Phase1-Report.md`、`JOB-200-Phase2-Report.md`、`JOB-200-Phase3-Report.md`
2. **去重與總表**：把所有 Phase 的表格合成單一全局表（以 `jsonFile#qIdx` 為主鍵），若同題被不同 Phase 覆蓋且結論不同，以 Phase 3 的深度重驗為準
3. **統計**：
   - 總樣本數（預期 217）
   - PASS 數、FAIL 數
   - FAIL 題目的分類：`data_bug`（data 本身錯）、`ui_display`（loader 正確但 UI 顯錯）、`loader_bug`（loader 讀錯欄位）、`reproducibility`（無法重現，含快取、環境問題）
4. **釋出決議**（二選一）：
   - ✅ **可上版**：PASS rate == 100%。commit 清單見 §九
   - ❌ **不可上版**：任一 FAIL 且分類為 `data_bug` / `ui_display` / `loader_bug`。列出 blocker、建議後續 JOB（例如 `JOB-201-修題 / JOB-202-修 loader`）
5. **產出 `jobs/JOB-200-Report.md`**，格式如下：

```markdown
# JOB-200 結案報告

## 📊 成果摘要

| 指標 | 數值 |
|:--|:--|
| 總樣本 | 217 |
| PASS | X |
| FAIL | Y |
| PASS rate | Z% |
| 釋出決議 | ✅ 可上版 / ❌ 不可上版 |

## Phase 狀態
| Phase | Agent | 樣本數 | Report 路徑 | 結論 |
|:--|:--|:--|:--|:--|
| 0 | Cursor | - | JOB-200-Phase0-Report.md | ✅ 阻斷排除 |
| 1 | Cursor | 103 | JOB-200-Phase1-Report.md | ✅/❌ |
| 2 | Antigravity | ~74 | JOB-200-Phase2-Report.md | ✅/❌ |
| 3 | Codex | ~40 + 深度 | JOB-200-Phase3-Report.md | ✅/❌ |

## FAIL 題目清單（若有）
| # | jsonFile | qIdx | 分類 | 詳情 | 建議處置 |
...

## 釋出 go/no-go
{明確文字陳述}

## 後續派工（若 no-go）
- JOB-201: ...
- JOB-202: ...
```

6. **若 go**：
   - 準備 commit 檔案清單（見 §九）
   - 回傳使用者「可 push，等你按鈕」
7. **若 no-go**：
   - 在 `docs/進度彙整_題庫研發與產出.md` 標註阻斷
   - 建立後續修補 JOB 的草稿（`job_manager.js next` 取下一號）
   - 回傳使用者「不建議 push，已識別 N 個 blocker」

---

## 五、驗收 Checklist

### Phase 0
- [ ] `G3_S2_MATH_KANGHSUAN_manifest.json` 的 `mismatch_catalog` 已清除（source + public 雙向同步）
- [ ] `verify_format_consistency.js` 通過
- [ ] Playwright G3 Math KangHsuan 9 tests 全 PASS
- [ ] Phase 0 Report 提交

### Phase 1
- [ ] 103 題全部 browser 驗證
- [ ] Phase 1 Report 表格完整

### Phase 2
- [ ] ~74 題全部 browser 驗證
- [ ] Phase 2 Report 表格完整

### Phase 3
- [ ] ~40 題 + 10 個特殊 case 全部 browser 驗證
- [ ] Phase 1/2 FAIL 題目深度分析完成

### Phase 4
- [ ] Claude 彙整所有 Phase Report
- [ ] 總結案報告 `JOB-200-Report.md` 提交
- [ ] 明確標示「可上版 / 不可上版 + blocker 清單」

---

## 六、成果 Checklist（結案後必填）

- [ ] 產出 `jobs/JOB-200-Report.md`（彙總報告）
- [ ] 進度彙整 `docs/進度彙整_題庫研發與產出.md` 已更新
- [ ] 執行 `/pj_sync`
- [ ] Discord 摘要送出（釋出 go/no-go 決議）
- [ ] 若 go：於 hotfix commit 中 reference JOB-200

---

## 七、執行準則提醒（給所有 agent）

1. **禁止猜測**：若瀏覽器顯示跟 JSON 對不上，**先確認資料來源是 `apps/v3_eidos/public/` 下的同名檔**（dev server 從 public/ 讀）——可能 source 已改但 public 未同步
2. **禁止改資料隱瞞失敗**：若發現題目 data 錯，記錄下來，不要擅自修題
3. **禁止跳題**：若某題 UI 顯示不出來（沒載入、崩潰等），記為 FAIL 並註明
4. **Phase 3 之前禁止 commit**：本 JOB 本質是驗證，不是修補；修補由後續 JOB 處理
5. **遇到疑問寫進 Report 的「遺留問題」欄**：不要自行判斷可忽略

---

## 八、工具與除錯備援

### 若 Playwright 不好使，改用手動瀏覽器
開 Chrome DevTools → Console → 執行：
```js
// 自動把 answer_index 與 UI 綠選一致性 log 到 console
const correctEls = [...document.querySelectorAll('.bg-correct-light')];
console.log(correctEls.map(el => el.textContent.trim()));
```

### 若 source 與 public 不同步
```bash
node scripts/sync_v3_public_questions.mjs
```
（會把 question/platform → apps/v3_eidos/public/question/platform 完整同步）

### 若 dev server 有 cache 問題
```bash
rm -rf apps/v3_eidos/.vite apps/v3_eidos/node_modules/.vite
cd apps/v3_eidos && npm run dev
```

---

## 九、給 Claude 彙整階段的提示

彙整時請產出三個數字：
1. **總樣本數**（應為 217）
2. **PASS 數**
3. **FAIL 數 + 分類**（data 錯 / UI 錯 / loader 錯 / 無法重現）

然後做**可上版判定**：
- 「PASS rate ≥ 99%」→ 可上版，FAIL 題目列為 backlog
- 「PASS rate < 99%」→ 不可上版，先處理 blocker

若可上版，列出要一起 commit 的檔案清單：
- `apps/v3_eidos/src/data/questionLoader.ts`（hotfix）
- `apps/v3_eidos/src/data/questionLoader.test.ts`（regression test）
- `apps/v3_eidos/tests/answer-integrity.spec.ts` + `answer-integrity.samples.json`
- `scripts/verify_ui_data_integrity.mjs`
- `.git/hooks/pre-commit`
- `docs/上版前驗證標準.md`（新）
- `docs/技術設定/前端開發與AI實作守則.md`（測試硬性要求）
- `docs/README_任務派工準則.md`（`release_validation` job_type）
- `question/README_驗證與盲測準則.md`（指向上版前驗證標準）
- Phase 0/1/2/3/4 各自產出的 Report
- 之前 80 項文檔審查的修正（10 檔）

---

`last_updated`: 2026-04-19
`updated_by`: Claude Code (claude-opus-4-7)
