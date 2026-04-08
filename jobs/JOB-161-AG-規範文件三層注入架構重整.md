*Created by AG at 2026-04-08*

`last_updated`: 2026-04-08
`updated_by`: Claude Code (claude-opus-4-6)

# JOB-161-AG-重整-規範文件三層注入架構

**`job_type`**：`docs_ops`
定義與邊界見 **`docs/README_任務派工準則.md`** 第二章。

## 📌 任務背景

CLAUDE.md 已被 Claude Code 保證載入 context，其中寫有「先讀規範，再做事」。但實際上 Agent 看到指令卻不執行 Read 操作——文字指令對 LLM 是概率性信號，不是程式邏輯。

經獨立 Agent 評審確認，唯一質變的做法是：**從「告訴 Agent 去讀」改成「把內容直接塞進 context」**。

同時，全站準則文件存在以下問題：
- README.md 混合產品介紹 + Agent 規範 + 技術文件，受眾混淆
- CLAUDE.md 與 .cursorrules 的讀取順序定義不一致
- .cursorrules 仍引用已廢棄的 `/dosync` 與已刪除的 skill 檔案
- 「最高運作原則」四條鐵律空泛，不可執行
- 三層資訊架構（L0/L1/L2）未被正式記載

## 🎯 任務目標

建立三層資訊注入架構，完成後：

| 層級 | 內容 | 機制 | 效果 |
|:--|:--|:--|:--|
| **L0 硬注入** | 角色定義 + 關鍵規則 + 文件索引 | CLAUDE.md / .cursorrules（保證載入） | 100% 在 context |
| **L1 軟注入** | 通用準則 + 派工準則精華摘要 | SessionStart Hook 用 `cat` 讀檔注入 | 100% 在 context |
| **L2 按需查閱** | 完整準則正文 | Agent 執行特定任務時自行 Read | 靠 L0 索引引導 |

- 所有 AI 工具啟動時取得一致的專案基線（README.md）
- CLAUDE.md 和 .cursorrules 與 README.md 對齊，無矛盾
- 產品介紹內容獨立為專用文件

## 🚧 任務邊界

本次任務只做：
- 提煉通用準則 + 派工準則精華摘要（各 ≤ 80 行）
- 重寫 SessionStart Hook（從「提醒」改為「注入內容」）
- 重寫 README.md（瘦身 + 可執行版運作原則 + 品管流水線概覽 + 三層架構說明）
- 新建 `docs/README_產品介紹.md`（承接原 README 產品白話文）
- 調整 CLAUDE.md（直接寫死關鍵規則、讀取順序加入 README.md）
- 修正 .cursorrules（廢棄引用、對齊、直接包含關鍵規則）
- 全站五份文件交叉比對

追加修正（使用者授權）：
- 修正 `docs/README_任務派工準則.md` §2.1 已刪除 Skill 引用（`curri_research` → `ei_research`）
- 修正 `docs/README_通用作業準則.md` 章節跳號（第三章→第二章起重新編號）
- 同步更新所有引用舊章節號的現行文件

本次任務不做：
- 不改動 `knowledge/`、`question/` 下準則正文
- 不動 `_agent/skills/` 的 SKILL.md
- 不動程式碼或題庫 JSON

## 📖 執行步驟

1. 提煉通用作業準則精華摘要（≤ 80 行），建立 `docs/_agent_bootstrap_通用.md`
2. 提煉派工準則精華摘要（≤ 80 行），建立 `docs/_agent_bootstrap_派工.md`
3. 重寫 `.claude/settings.json` SessionStart Hook：`cat` 兩份摘要注入 `additionalContext`
4. Pipe-test 驗證 Hook（`echo '{}' | <cmd>` 輸出合法 JSON）
5. 重寫 `README.md`
6. 新建 `docs/README_產品介紹.md`
7. 調整 `CLAUDE.md`
8. 修正 `.cursorrules`
9. 全站交叉比對五份文件，確認零矛盾
10. 確認所有引用路徑有效

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `docs/README_通用作業準則.md` | 精華摘要來源 |
| `docs/README_任務派工準則.md` | 精華摘要來源 |
| `README.md` | 重寫目標 |
| `CLAUDE.md` | 調整目標 |
| `.cursorrules` | 修正目標 |
| `.claude/settings.json` | Hook 重寫目標 |

## ✅ 啟動 Checklist (Pre-Flight)

- [x] 已讀取：`docs/README_通用作業準則.md`
- [x] 已讀取：`docs/README_任務派工準則.md`
- [x] 已讀取：`README.md`
- [x] 已讀取：`CLAUDE.md`
- [x] 已讀取：`.cursorrules`
- [x] 已讀取：`knowledge/README_研究架構總綱.md`
- [x] 已讀取：`question/README_出題與品管準則.md`
- [x] 已讀取：`question/README_驗證與盲測準則.md`
- [x] 前置素材不適用（docs_ops 類型）
- [x] **執行模型**：Claude Code (claude-opus-4-6)（使用者授權例外）
- [x] **金鑰**：Anthropic Claude Code 訂閱
- [x] 已閱讀「任務邊界」並確認本次範圍

## ✅ 驗收 Checklist (Acceptance)

- [ ] `docs/_agent_bootstrap_通用.md` 存在且 ≤ 80 行
- [ ] `docs/_agent_bootstrap_派工.md` 存在且 ≤ 80 行
- [ ] SessionStart Hook pipe-test 通過（輸出合法 JSON 且含兩份摘要內容）
- [ ] README.md 不含產品介紹白話文，大小 ≤ 6KB
- [ ] README.md 包含：可執行版運作原則、品管流水線概覽表、強制讀取順序表、三層架構說明
- [ ] `docs/README_產品介紹.md` 存在且承接原 README 產品內容
- [ ] CLAUDE.md 直接包含 ≥ 10 條關鍵規則（非僅「請去讀」）
- [ ] CLAUDE.md §2 讀取順序以 README.md 為第 0 項
- [ ] .cursorrules 無 `/dosync`、無已刪除 skill 引用
- [ ] 五份文件交叉比對零矛盾（用詞、引用、讀取順序）

## ✅ 成果 Checklist (Deliverables)

- [ ] 成果表格填寫完畢
- [ ] 已執行 `/pj_sync`
- [ ] 產出 JOB-161-Report.md，異動清單已列出所有實際修改的檔案路徑

## 真實回報本次對話的模型與花費
＄作業匯總：Token數: - | 花費: - | 使用模型: claude-opus-4-6 | 執行者: Claude Code（使用者授權例外）
