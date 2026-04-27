# Git Hooks 同步

`.git/hooks/` 不在 git 版控內。為了讓所有 dev/Agent 共用相同的 pre-commit 規則，本目錄保存一份副本，dev 自行 symlink 啟用。

## 啟用方式

```bash
ln -sf "$(pwd)/scripts/git-hooks/pre-commit" .git/hooks/pre-commit
chmod +x scripts/git-hooks/pre-commit
```

## 觸發節點

1. 黃金測資（品質評分腳本回歸測試）
2. Manifest 格式一致性驗證（僅 question/ 變更時）
3. UI ↔ 資料一致性驗證（僅 questionLoader 或題庫 JSON 變更時）
4. 進度檔變更 → progress_sync 自動觸發（2026-04-27 加入；JOB-211 進度恢復系統）

## 維護紀錄

- 2026-04-27：加入第 4 節點，hook shebang 改 bash（既有節點不變）
- 2026-04-19：加入第 3 節點 UI 一致性驗證
