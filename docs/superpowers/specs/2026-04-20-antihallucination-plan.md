---
name: Anti-Hallucination Plan（PM 亂推斷防範）
date: 2026-04-20
owner: Claude Code (claude-opus-4-7) + 使用者共識
status: A 實裝中、D-驗證待做
---

# PM 亂推斷防範計畫

## 背景

2026-04-20 session 使用者明確指出 Claude Code（PM 角色）多次「亂推斷」：用詞武斷、未讀完資料就下結論、混淆事實/推論/假說、數字直覺估、因果與時間共現混為一談。使用者希望找出**積極方法**防止類似狀況再發生，並與我一起解決。

本 spec 記錄共識與實施計畫，compact 後依此續接。

## 6 類已確認錯誤案例（本 session）

| # | 事發點 | 我當時說的 | 使用者質疑後修正 | 錯誤類別 |
|:--:|:--|:--|:--|:--|
| 1 | JOB-203 Phase 0 雛形方向 | 先給 Learning Blue 完全替換 A 方向 | 「太大、看不出好處」退回到方向 D 保守漸進 | 先入為主（以 skill 建議為絕對答案） |
| 2 | JOB-205 KL4 盤點 | 「G3/G4 非國語科目沒有 KL4 研究」 | 進度表顯示全 S2 皆有 KL3+KL4；我用嚴格 regex 漏抓素材庫 | 用詞武斷（無 per-lesson = 沒研究） |
| 3 | WebSearch 規模估 | 「170+ 課都要 WebSearch」 | 精算後實際 ~27 次 | 數字憑直覺（沒實算） |
| 4 | JOB-205/206 關係 | 「同源」 | 兩個獨立 bug 只是時間共現 | 含糊用詞（因果 vs 時間共現） |
| 5 | JOB-206 成因 | 「錯放源自 eccb974 commit」 | git show 顯示 eccb974 時已錯，實際錯放在更早生成階段 | 因果跳躍（commit 當下已存在 ≠ commit 造成） |
| 6 | G3 SOC NanYi L5 推課名 | 「是『家鄉故事與古蹟保存』」 | 讀 30 題後只 Q1 沾邊，其餘跨課通用 | 局部推全部（看 Q1 推整檔） |

## 錯誤模式共通性

- **A. 用詞含糊**：「同源」「大部分」「所有」
- **B. 武斷結論**：沒看完資料就下判斷
- **C. 直覺估數字**：沒實算
- **D. 局部推全部**：看一點就推全
- **E. 混淆事實/推論/假說**：三類沒明確區分

## 與使用者共識：D-驗證路徑（選 A 先行）

### 方案選擇過程

| 方案 | 內容 | 我的建議 | 使用者回應 |
|:--:|:--|:--|:--|
| A | CLAUDE.md 紀律 + auto memory | — | 最終選擇 |
| B | 使用者可觸發 `/challenge` | — | 可後續加 |
| C | 我自動自檢 checklist | — | 可後續加 |
| D = A+B+C | 全套 | 起初推 | 使用者質疑「D 有用嗎還是我的推論」 |
| **A + D-驗證** | **先實裝 A，跑可證偽實驗** | **最終共識** | 使用者 2026-04-20 同意 |

### D-驗證方法（falsifiable test）

1. 先**實裝 A**（本 spec 下節）
2. 挑 1-2 個已犯錯案例（例：#6 G3 SOC NanYi L5）
3. **乾淨重現**判斷場景（假裝從零開始）
4. 看 A 紀律能否在我說出錯答案前**攔截**
5. **通過** → A 有效；**不通過** → 改 A 或補 B/C

## A 實裝方案（待 compact 後做）

### A-1：auto memory（已完成）

檔案：`/Users/s389080/.claude/projects/.../memory/feedback_anti_hallucination.md`

包含 6 條規則 + Why + How to apply。下次 session 自動載入。

### A-2：CLAUDE.md 紀律章節（待加）

新增章節「八、防亂推斷紀律」或類似，含：

```markdown
## 八、防亂推斷紀律（2026-04-20 起）

**完整規則見** `~/.claude/projects/.../memory/feedback_anti_hallucination.md`

核心條款（摘要）：
1. 給結論前必分「事實 / 推論 / 假說」
2. 武斷用詞清單（同源、所有、大部分...）使用前需具體化
3. 數字須實算，禁直覺估
4. 局部證據（≤3 筆）不能推全部
5. 因果 vs 時間共現嚴格區分
6. Logic-heavy 任務啟動 `mcp__sequential-thinking__sequentialthinking`
```

### A-3：Design doc commit + 本 spec commit

待做。

## Pending Actions（compact 後續接用）

| # | 動作 | 優先級 | 依賴 |
|:--:|:--|:--:|:--|
| 1 | G6 Math 副本清理（刪 4 檔 + 改 3 manifest）| 低 | 獨立 |
| 2 | G3 SOC NanYi L5 → β⁺ 下架（is_active: false + 列 JOB-206）| 中 | 獨立 |
| 3 | CLAUDE.md 加「八、防亂推斷紀律」章節 | **高** | A 實裝核心 |
| 4 | D-驗證：重跑錯誤案例 #6 看 A 能否攔住 | 高 | 依賴 3 |
| 5 | 若 A 無效，評估加 B（/challenge 自訂指令）和 C（自檢 checklist）| 中 | 依賴 4 |
| 6 | JOB-205 branch merge 決定 | 使用者驗收後 | 與本 spec 獨立 |

## 驗收指標（長期）

- 本 spec 寫入 memory 後，下 3-5 個 session 的「使用者指出亂推斷次數」
- Baseline：本 session 6 次
- 目標：下個 session 降至 ≤ 2 次；連 3 session 後降至 0-1 次
- 若失敗 → 加 B/C；再失敗 → 重新 brainstorm

## 版本紀錄

| 日期 | 變更 |
|:--|:--|
| 2026-04-20 | 建立，記錄 6 類錯誤 + D-驗證計畫；auto memory 已寫；CLAUDE.md 實裝與 D-驗證待 compact 後執行 |
