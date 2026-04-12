# 開發協作：單一 Git 與工作目錄規範

**建立目的**：同一台電腦上有多位人員或多個 AI Agent 並行調整程式時，避免出現「兩套目錄、兩份未對齊的修改」，導致覆蓋或合併地獄。

**最後更新**：2026-03-22

---

## 1. 唯一真相目錄（Canonical Working Copy）

| 項目 | 約定 |
|------|------|
| **本機主 clone 路徑** | `/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject` |
| **日常開發** | 僅在此目錄開啟 Cursor / VS Code、執行 `npm run dev`、`wrangler dev`、`git commit` |
| **遠端** | 僅與此 clone 綁定之 `origin`（例如 `main` + `feature/*`） |

不在此目錄下的同名資料夾（含 Cursor 自動建立的 **`/.cursor/worktrees/...`**）**不作為**團隊約定的寫程式根目錄。

---

## 2. 禁止事項

1. **禁止**在 `.cursor/worktrees/` 下長期改程式再手動拷貝回主目錄（易漏檔、易版本錯）。
2. **禁止**同一專案在電腦上維護兩套「都以為自己是主線」的完整目錄；若需實驗，請用 **`git worktree` + 明確分支** 且**約定只有主目錄可 merge 進 shared branch**。
3. **禁止**在 Markdown／腳本中寫死他人機器上的絕對路徑作為「唯一正確路徑」；本文件之路徑為本專案目前約定，若遷移目錄應更新本文件與 `.cursor/rules/workspace-directory.mdc`。

---

## 3. 多 Agent / 多人同一台電腦時

1. **Cursor 工作區**：一律 **Open Folder** → 僅選 **主目錄** `eidosProject`。
2. **分支**：各 Agent 或各任務使用 **`feature/xxx`** 或 **`JOB-xxx-簡述`**，完成後 **merge / PR 進 `main`**（或團隊約定之整合分支）。
3. **提交前**：`git status`、`git pull --rebase`（若流程允許）再 push，避免互相覆蓋。

---

## 4. 若曾誤在 worktree 修改，如何併回主目錄

以下在 **主目錄** `eidosProject` 操作為原則；worktree 路徑請替換成實際路徑。

### 作法 A：產生 patch 再套用（適合變更檔案明確）

在 **worktree** 目錄：

```bash
cd /path/to/worktree/bio
git diff > /tmp/wt-changes.patch
# 或只針對特定檔案
git diff -- path/to/file >> /tmp/wt-changes.patch
```

在 **主目錄**：

```bash
cd /Users/s389080/Documents/doc/work/0_AI_Project/eidosProject
git checkout -b integrate/wt-handoff
git apply /tmp/wt-changes.patch   # 若有衝突需手動修
# 檢查後
git add -A && git commit -m "chore: integrate changes from worktree handoff"
```

### 作法 B：cherry-pick（若 worktree 上有獨立 commit）

在 worktree 用 `git log` 取得 commit hash，在主目錄：

```bash
git cherry-pick <hash>
```

### 作法 C：手動複製檔案

僅適合少數檔；複製後務必在 **主目錄** 跑 `git diff` 與測試。

---

## 5. 清理多餘 worktree（可選，需團隊同意）

若確定不再使用某 worktree：

```bash
cd /Users/s389080/Documents/doc/work/0_AI_Project/eidosProject
git worktree list
git worktree remove /path/to/worktree/bio   # 路徑以 list 為準
```

**注意**：remove 前請確認該目錄內**沒有未備份的僅本地變更**。

---

## 6. Cursor 規則檔

本規範由 **`.cursor/rules/workspace-directory.mdc`**（`alwaysApply: true`）對 AI 強制生效；變更約定時請同步更新該檔與本文件。
