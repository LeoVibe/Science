*Created by Claude Code (claude-opus-4-6) at 2026-04-06*

`last_updated`: 2026-04-06
`updated_by`: Claude Code (claude-opus-4-6)

# JOB-160-AG-準則規範文件整體重構-套用 Prompt Engineering 四原則

**`job_type`**: `docs_ops`
**`executor`**: Claude Code（使用者授權例外；本任務為規範架構設計，由總架構師直接執行）

## 📌 任務背景

### 觸發原因
JOB-153/159 執行過程暴露多項規範落地失敗：
1. Claude Code 連續數次對話未讀取任何準則即開始執行
2. Claude Code 扮演執行者而非 PM，違反角色分工
3. 手動建立派工檔案，違反 `job_manager.js` 唯一建單原則
4. 專案根目錄無 `CLAUDE.md`，新對話等於白板進場

### 設計參考
Anthropic Claude Code `prompts.ts` 源碼的四大 Prompt Engineering 原則：
- **P1 分散強化**：重要規則用不同措辭出現在多個位置
- **P2 快取邊界**：靜態（自動載入）vs 動態（按需讀取）分離
- **P3 薄層觸發**：子 Agent/Skill 不重述規則，Controller 層管安全
- **P4 多層防禦**：每一道防線解決不同問題，不混用

### 歷史脈絡
本次為第四次規範重構，延續 JOB-110（v6 定案）→ JOB-121（派工統一）→ JOB-133（三層化）→ JOB-148（草稿先行）的改進鏈。

## 🎯 任務目標

完成後須達到以下可驗證狀態：

1. **CLAUDE.md** 重寫為「角色 + 路由 + 分散強化」結構，新對話自動載入後 Agent 能知道該讀哪些文件
2. **10 份 Skill** 精簡為指針式（每份 ≤ 15 行），禁止重述規則正文
3. **術語統一**：全站 R3/R4 → KL3/KL4，無殘留過時用法
4. **audit 合併**：`audit` + `pj_audit` 合為一份
5. **通用作業準則** §1 明文寫入角色分工
6. **異動記錄表**：每個被修改的檔案，列出 Before/After 變更摘要

## 🚧 任務邊界

本次任務只做：
- 修改規範文件（CLAUDE.md、docs/*.md、_agent/skills/*/SKILL.md）
- 術語統一（R3/R4 → KL3/KL4）
- Skill 瘦身（移除重述的規則正文）
- audit Skill 合併

本次任務不做：
- 修改題庫 JSON 或出題腳本
- 修改 `job_manager.js` 程式碼
- 修改 .cursor/rules/*.mdc（Cursor 專用，非本次範圍）
- 建立新的 Skill
- 修改 knowledge/ 或 question/ 下的研究素材

## 📖 執行步驟

### Step 1：CLAUDE.md 重寫
套用 P2（快取邊界）+ P1（分散強化），重新設計自動載入內容：
- 角色定義（不同措辭強化「PM ≠ 執行者」）
- 任務路由表（job_type → 應讀文件）
- 硬規則禁止清單
- 題庫完成判定標準

### Step 2：docs/README_通用作業準則.md 更新
- §1 雙軌制：明文加入角色分工表
- 用不同角度再次強化「Claude Code 是 PM」（P1 分散強化）

### Step 3：Skill 瘦身（P3 薄層觸發）
將 10 份 Skill 逐一改為指針式結構：
```
觸發條件 → 唯一權威文件指向 → 硬閘 Checklist（≤ 3 項）
```
每份 ≤ 15 行，不重述規則正文。

### Step 4：術語統一
全站搜尋 R3/R4 殘留用法，統一改為 KL3/KL4。

### Step 5：audit Skill 合併
合併 `_agent/skills/audit/` 與 `_agent/skills/pj_audit/` 為單一 `pj_audit/`。

### Step 6：產出異動記錄
每個被修改的檔案，在 Report 中列出具體 Before/After 變更。

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `CLAUDE.md` | 本次主要重寫目標 |
| `docs/README_通用作業準則.md` | §1 角色分工更新 |
| `docs/README_任務派工準則.md` | 確認派工流程不變，僅確保一致性 |
| `_agent/skills/*/SKILL.md`（10 份） | Skill 瘦身目標 |
| `knowledge/README_研究架構總綱.md` | 術語統一參考 |

## ✅ 啟動 Checklist (Pre-Flight)

- [x] 已讀取：`docs/README_通用作業準則.md`
- [x] 已讀取：`docs/README_任務派工準則.md`
- [x] 已讀取：所有 10 份 `_agent/skills/*/SKILL.md`（由 Explore Agent 完成）
- [x] 前置素材：不適用（docs_ops 類型）
- [x] **已確認執行模型**：Claude Opus 4.6（claude-opus-4-6）
- [x] **已確認使用金鑰**：不適用（無外部 API 呼叫）
- [x] **已確認操作頻次**：不適用
- [x] 已閱讀「任務邊界」並確認本次範圍

## ✅ 驗收 Checklist (Acceptance)

- [ ] CLAUDE.md 重寫完成，含角色定義 + 路由表 + 硬規則 + 分散強化
- [ ] 10 份 Skill 每份 ≤ 15 行，無重述規則正文
- [ ] `grep -r "R3\|R4" _agent/skills/` 無殘留過時術語（排除歷史紀錄引用）
- [ ] audit + pj_audit 已合併為單一 Skill
- [ ] `docs/README_通用作業準則.md` §1 含角色分工表
- [ ] Report 異動記錄表含每個檔案的 Before/After 變更

## ✅ 成果 Checklist (Deliverables)

- [ ] 所有修改的檔案在 Report 中有對應的異動記錄
- [ ] 已執行 `/pj_sync`
- [ ] 產出 `jobs/JOB-160-Report.md`

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:- | 花費:- | 使用模型:claude-opus-4-6 | 執行者:Claude Code（使用者授權例外）
