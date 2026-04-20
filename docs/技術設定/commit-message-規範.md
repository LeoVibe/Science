`last_updated`: 2026-04-20
`updated_by`: Claude Code (claude-sonnet-4-6)

# Eidos 專案 Commit 訊息規範

## 設計原則

**Commit 訊息的第一行必須回答：「這件事對誰有好處、好處是什麼？」**

不是「我動了哪些程式碼」，而是「這個版本讓什麼變得更好」。

技術細節放第二段「技術變更」，不消失，只是降優先級。

---

## 格式

```
<type>: <價值描述>（≤72 字元）

為什麼這樣做：
<動機、背景、或解決的問題>

技術變更：
- <具體修改點 1>
- <具體修改點 2>

JOB: JOB-XXX（若有對應派工單）
```

### type 清單

| type | 用途 |
|:--|:--|
| `feat` | 新功能：使用者得到新能力 |
| `fix` | 修正：使用者或系統遇到的問題被解決 |
| `improve` | 優化：現有功能更好用、更快、更準 |
| `chore` | 維護：建置、依賴、自動化工具、腳本 |
| `docs` | 文件：說明文件、規範、README 更新 |

---

## 第一行寫法：三種情境

### 情境 A — 使用者直接有感

以使用者（學生、老師、管理員）能感知的行為或結果描述。

```
fix: 管理員的題庫開放設定現在會即時反映在學生端題庫總覽
feat: 學生可依難易度篩選練習題
improve: 題庫總覽頁面介面優化，資訊層次更清晰
fix: 修正全站 12,911 題答案顯示錯誤，正解現在回到正確位置
```

### 情境 B — 間接影響使用者（品質、速度、穩定性）

這類改動使用者無法直接感知，但其成果（更好的題目、更快的更新）會間接影響他們。說明**間接價值**，不說技術細節。

```
chore: 建立高頻劣質片段分析工具，為大規模題庫品質改善奠基
fix: 修正三年級數學與社會題庫中錯誤的題目索引，確保題目正確載入
feat: 擴充四個年級題庫並提升出題品質，減少學生遇到低品質題目的機率
```

### 情境 C — 純維護 / 開發基礎設施

對使用者完全無感，但對開發流程或系統運作有意義。說明**系統或流程層面的收益**，不需假裝跟使用者有關。

```
docs: 統一 11 份開發規範，降低 AI Agent 執行時的歧義風險
chore: 新增 commit 訊息格式驗證 hook，確保每筆記錄有可追溯的價值說明
chore: 更新本機開發環境 API 連線設定
```

---

## 禁止寫法

第一行不得出現：

- 函式名、元件名（`AboutView`、`AdminLibraryManager`）
- 技術術語（`prop`、`useState`、`useEffect`、`manifest`、`answer_index`）
- 檔案名（`.env.development`、`api.ts`）
- 內部流程術語（「結案產物」、「殘項清理」、「JOB-XXX 完成」）

**❌ 禁止**：
```
fix(loader): 讀取 answer_index 修正全站 12,911 題正解錯位
fix(ui): 修正 AboutView 題庫總覽與 admin library_config 連動斷層
chore+docs: About tab 二輪 UI 改造 + JOB-200 結案產物
```

**✅ 正確**：
```
fix: 修正全站 12,911 題答案顯示錯誤，正解現在回到正確位置
fix: 管理員的題庫開放設定現在會即時反映在學生端題庫總覽
improve: 題庫總覽頁面介面優化，資訊層次更清晰
```

---

## 完整範例

```
fix: 管理員的題庫開放設定現在會即時反映在學生端題庫總覽

為什麼這樣做：
管理員在後台設定了哪些科目開放，但學生端「題庫總覽」一律顯示
全部科目，設定完全無效。兩個系統各讀各的資料來源導致斷層。

技術變更：
- AboutView.tsx：移除 useEffect localStorage 讀取，改接收 libraryConfig prop
- Index.tsx：傳入 libraryConfig={libraryConfig} 給 AboutView
- AboutView.tsx：subjects 過濾改為 allowlist 邏輯（有設定時才顯示 enabled: true）

JOB: JOB-201
```

---

## 執行層（三層保障）

| 層級 | 位置 | 觸發時機 | 作用 |
|:--|:--|:--|:--|
| L2 規範文件 | 本檔 | 人工查閱 / Agent Read | 完整說明、範例、邊界定義 |
| L0 Agent 注入 | `CLAUDE.md` §七、`.cursorrules` §Commit | Agent 啟動即載入 | Agent commit 前草擬訊息並徵詢確認 |
| Git Hook | `.git/hooks/commit-msg` | 每次 `git commit` | 自動驗證格式，不符則阻擋並提示 |
