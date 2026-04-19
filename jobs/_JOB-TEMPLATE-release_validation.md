`last_updated`: YYYY-MM-DD
`updated_by`: {AgentName} ({ModelCode})

# JOB-XXX: {簡述} — 上版前多 Agent 驗證（release_validation）

**`job_type`**：`release_validation`
**`executor`**：Cursor + Antigravity + Codex（分工，見 §四）+ Claude Code（彙整）

---

## 模板使用說明

本模板固化 JOB-200（2026-04-19）的多 Agent 上版前驗證流程。建立新 `release_validation` 派工時，複製本檔並填入 {佔位符}。每個 Phase 的樣本數請用**精確過濾公式**而非「約 N 題」，以免 Agent 執行時產生歧義（JOB-200 吃過虧）。

---

## 一、給執行 Agent 的專案 on-ramp

### Eidos 是什麼

{一句話專案描述——複製自 README.md 或 `docs/README_產品介紹.md` 的精華段}

### 題庫 JSON 結構重點

{說明 meta / questions / options / answer_index 關係；強調 `answer_index` 是陣列位置索引，不是選項字串前綴}

### 本次 release 的背景

{為何要做這次上版前驗證？是 hotfix 後的強驗？是新功能上線前的 smoke？填入具體背景}

---

## 二、本 JOB 要完成什麼

**目標**：{一句話}

**成功判準**：{具體的 PASS 條件}

### 🚨 驗證方式強制規定（所有 Phase 適用）

**必須使用真實瀏覽器實測**（Playwright headed/headless 或手動 Chrome/Firefox 或 DevTools Console 腳本）。

**不允許**：
- ❌ 只開 JSON 檔用 `answer_index` 跟 `options[answer_index]` 比對自己（純資料驗證）
- ❌ 只跑 unit test（繞過 UI 層）
- ❌ 「白盒邏輯模擬」：用 Node.js 手動跑 loader 邏輯（JOB-200 Phase 2 初版因此被退件）
- ❌ 不實際載入 dev server 就宣告通過

違反者結案時會被 Phase 4 Claude 退件重做。

---

## 三、前置資料與工具

### 必讀檔案

| 路徑 | 作用 |
|:--|:--|
| `docs/上版前驗證標準.md` | L1/L2/L3 三層驗證規範 + 多 Agent 環境要求 |
| `apps/v3_eidos/src/data/questionLoader.ts` | Loader 邏輯（注意 `data.meta + data.questions[*].answer_index` 分支） |
| `apps/v3_eidos/src/components/ReviewView.tsx` | Review 模式 DOM 結構（`.bg-correct-light` 標記正解） |
| `apps/v3_eidos/src/utils/format.ts` | `stripOptionPrefix` 去前綴邏輯 |
| `question/README_驗證與盲測準則.md` §4 | QL 定義 |

### 樣本清單

{指向本次 JOB 使用的 samples JSON，如 `apps/v3_eidos/tests/answer-integrity.samples.json`}

### 啟動 dev server

```bash
cd apps/v3_eidos && npm run dev
# http://localhost:8080/
```

### Welcome Setup 繞過

```js
localStorage.setItem('sci_v2_user_profile', JSON.stringify({grade:3, semester:2, publisher:'HanLin', setupComplete:true, maxQuizQuestions:25}));
localStorage.setItem('hasSeenValueOnboarding', 'true');
location.reload();
```

### 各 Agent 呼叫範本

| Agent | 呼叫指令 |
|:--|:--|
| Cursor | `cursor agent --print --force --workspace . "..."` |
| Codex | `codex exec --sandbox danger-full-access --cd {PROJECT_ROOT} --skip-git-repo-check "..."`（dev server／Chromium 必須 `danger-full-access`） |
| Antigravity | 使用者手動貼派工單路徑到 Antigravity IDE；**系統需 Node ≥ 18**，若 Node 14 改用 `/Applications/Cursor.app/.../node` |

---

## 四、工作分工（樣本過濾公式要精確）

### Phase 0（Cursor）：阻斷排除

**目標**：清理任何可能阻擋其他 Agent 執行的資料 / 環境問題。

**任務**（範例）：
1. {例：移除某 manifest 的殘項}
2. {例：同步 source / public}
3. {例：跑格式驗證腳本}

**Phase 0 產出**：`jobs/JOB-XXX-Phase0-Report.md`

**Phase 0 未完成，Phase 1-3 不得開工**。

### Phase 1（Cursor）：{Phase 1 範圍}

**樣本過濾公式**：{JS 形式，例 `grade in [3,4] && subjectPath in ['chi','mat','soc']`}
**樣本數**：{精確數字}

**執行步驟**：
1. {}
2. {}

**記錄格式**：`jobs/JOB-XXX-Phase1-Report.md`（逐題表格 + 人眼抽驗區塊）

### Phase 2（Antigravity）：{Phase 2 範圍}

同上模式。**特別提醒 Antigravity 需 Node ≥ 18 環境**（見 `docs/上版前驗證標準.md` §4.1）。

### Phase 3（Codex）：{Phase 3 範圍}

同上模式。**必須 `--sandbox danger-full-access`**（見 `docs/上版前驗證標準.md` §4.2）。

### Phase 3 Extended（可選，Codex 加碼）：多面向驗證

若需更嚴格覆蓋，補充 D1-D6 六面向：
- D1 題幹文字
- D2 選項數量（恰 4）
- D3 選項順序
- D4 正解位置（答案）
- D5 解析渲染
- D6 迷思診斷（soft check）

參考 `apps/v3_eidos/tests/answer-integrity-extended.spec.ts`。

### Phase 4（Claude Code）：彙整與釋出決議

**前置條件**：Phase 0/1/2/3 四份 Report 齊全且標記為 DONE。

**執行步驟**：
1. 讀入所有 Report
2. 合表去重、分類 FAIL（`data_bug` / `ui_display` / `loader_bug` / `reproducibility`）
3. 決議二選一：
   - ✅ 可上版：PASS rate == 100%（或 reproducibility 型 FAIL 深度重驗通過）
   - ❌ 不可上版：列出 blocker、建議後續 JOB
4. 產出 `jobs/JOB-XXX-Report.md`（依本檔 §六 模板）

---

## 五、驗收 Checklist

### Phase 0
- [ ] Phase 0 目標達成（填具體）
- [ ] Phase 0 Report 提交

### Phase 1
- [ ] N 題全部真實瀏覽器驗證
- [ ] Phase 1 Report 表格完整
- [ ] FAIL 題目分析完整（若有）

### Phase 2
- [ ] 同 Phase 1

### Phase 3
- [ ] 同 Phase 1
- [ ] 特殊 case 深度抽驗完整（若有）

### Phase 4
- [ ] 四份 Phase Report 均為 DONE
- [ ] `JOB-XXX-Report.md` 提交
- [ ] go/no-go 決議明確
- [ ] 若 go：commit 清單備妥
- [ ] 若 no-go：後續 JOB 草稿備妥

---

## 六、結案報告 `JOB-XXX-Report.md` 模板

```markdown
`last_updated`: YYYY-MM-DD
`updated_by`: Claude Code ({model})

# JOB-XXX 結案報告：{簡述}

## 📊 成果摘要

| Phase | Agent | 樣本 | 結果 | Report |
|:--|:--|:--|:--|:--|
| 0 | Cursor | — | ✅/❌ | JOB-XXX-Phase0-Report.md |
| 1 | Cursor | N | ✅/❌ | JOB-XXX-Phase1-Report.md |
| 2 | Antigravity | N | ✅/❌ | JOB-XXX-Phase2-Report.md |
| 3 | Codex | N | ✅/❌ | JOB-XXX-Phase3-Report.md |

**總驗證量**：{累計瀏覽器驗證次數}
**PASS rate**：{百分比}
**釋出決議**：✅ 可上版 / ❌ 不可上版

## 發現的附加問題（backlog）

1. ...

## 釋出 commit 規劃

1. ...
```

---

## 七、成果 Checklist（結案後必填）

- [ ] 產出 `jobs/JOB-XXX-Report.md`
- [ ] 進度彙整 `docs/進度彙整_題庫研發與產出.md` 已更新
- [ ] 執行 `/pj_sync`
- [ ] Discord 摘要送出（釋出 go/no-go 決議）

---

`last_updated`: 2026-04-19
`updated_by`: Claude Code (claude-opus-4-7)
