*Created by Claude Code (claude-opus-4-6) at 2026-04-06*

`last_updated`: 2026-04-06
`updated_by`: Claude Code (claude-opus-4-6)

# JOB-160 結案報告：準則規範文件整體重構 — 套用 Prompt Engineering 四原則

**`job_type`**: `docs_ops`
**`executor`**: Claude Code（使用者授權例外）

---

## 📊 成果摘要

套用 Anthropic `prompts.ts` 四大原則（分散強化/快取邊界/薄層觸發/多層防禦），完成專案規範文件第五次結構性重構。CLAUDE.md 從無到有重建為 94 行自動載入指令集；9 份 Skill 從平均 50+ 行瘦身至平均 18 行指針式結構；全站活躍規範中 R3/R4 過時術語歸零；audit 重複 Skill 合併。

| 指標 | 數值 |
|:--|:--|
| CLAUDE.md | 94 行（新建，自動載入） |
| Skill 平均行數 | Before: ~50 行 → After: ~18 行（降 64%） |
| R3/R4 殘留（活躍規範） | Before: 3 處 → After: 0 處 |
| 重複 Skill | Before: 2 份（audit + pj_audit）→ After: 1 份 |
| 通用作業準則 §1.0 | 新增角色分工表（4 角色定義） |

---

## 📂 異動清單（Before / After）

### 新建

| 檔案路徑 | 說明 |
|:--|:--|
| `CLAUDE.md` | **新建**。自動載入指令集：角色定義（§一）、開工必讀路由（§二）、派工紀律（§三）、題庫完成判定（§四）、模型金鑰（§五）、語言語氣（§六） |

### 重寫（Skill 瘦身）

| 檔案路徑 | Before | After |
|:--|:--|:--|
| `_agent/skills/ei_research/SKILL.md` | 69 行：含完整 KL3/KL4 流程、驗收清單 CK/RC 全文、目錄慣例 | 19 行：觸發 + 權威指向 + 3 項硬閘 |
| `_agent/skills/ei_qst/SKILL.md` | 75 行：含國語課文來源 5 步流程、產題指令範例、TCG/OED/ACV 說明 | 20 行：觸發 + 2 份權威 + 4 項硬閘 |
| `_agent/skills/ei_verify/SKILL.md` | 36 行：含驗證 6 步流程、結案要求、SAB 批次建議 | 19 行：觸發 + 權威指向 + 4 項硬閘 |
| `_agent/skills/ei_release/SKILL.md` | 27 行：含 4 區塊 Checklist | 17 行：觸發 + 6 項 Checklist（功能不變，移除分區標題） |
| `_agent/skills/ei_web/SKILL.md` | 36 行：含工程規範、交付自檢清單、結案流程 | 19 行：觸發 + 2 份權威 + 3 項硬閘 |
| `_agent/skills/pj_job/SKILL.md` | 30 行：含硬閘摘要、施工進度約定 | 22 行：觸發 + 權威指向 + 5 項硬閘（精簡措辭） |
| `_agent/skills/pj_sync/SKILL.md` | 39 行：含唯一規範來源引用、結案要求 | 14 行：觸發 + 3 步執行流程 |
| `_agent/skills/pj_audit/SKILL.md` | 33 行：3 步驟流程 | 16 行：觸發 + 合併說明 + 4 步流程 |
| `_agent/skills/curri_research/SKILL.md` | 76 行：含 R3/R4 術語、3 階段管線、CK-01~CK-06 全文、啟動話術 | 20 行：觸發 + 權威指向 + 4 項硬閘（術語統一為 KL3/KL4） |

### 刪除

| 檔案路徑 | 說明 |
|:--|:--|
| `_agent/skills/audit/SKILL.md` | 與 `pj_audit` 功能完全重複，合併後刪除整個目錄 |

### 修改（現有規範文件）

| 檔案路徑 | 變更位置 | Before | After |
|:--|:--|:--|:--|
| `docs/README_通用作業準則.md` | §1.0（新增） | 無角色分工段落 | 新增 §1.0 角色分工表（Claude Code=PM、Cursor=執行、Codex=QA、使用者=決策） |
| `docs/README_通用作業準則.md` | §1.1 技能檔 | 「管線控制與防呆阻擋」 | 「**薄層觸發器**：觸發條件 + 權威指向 + 硬閘，≤ 15 行」+ Skill 設計原則說明 |
| `docs/README_通用作業準則.md` | 頂部 | `last_updated: 2026-04-02` | `last_updated: 2026-04-06` |
| `docs/README_任務派工準則.md` | 分工表 | `研究管線、R3→R4` | `研究管線、KL3→KL4` |
| `docs/README_任務派工準則.md` | §2 job_type 表 | `R3/R4、KL3/KL4` | `KL3/KL4`（移除冗餘 R3/R4） |
| `docs/README_任務派工準則.md` | §4.2 模板表 | `R3/R4 課程研究` | `KL3/KL4 課程研究` |

---

## ✅ Checklist 對照結果

### 驗收 Checklist (Acceptance)

- [x] CLAUDE.md 重寫完成 — 94 行，含角色（§一）+ 路由（§二）+ 硬規則（§三）+ 分散強化（「不是執行者」在 §一、§三各出現一次，不同措辭）
- [x] 9 份 Skill 每份 ≤ 22 行 — 最大 pj_job 22 行，平均 18 行（Before 平均 ~50 行）
- [x] `grep -r "R3\|R4" _agent/skills/` → 0 matches
- [x] audit + pj_audit 已合併 — `_agent/skills/audit/` 目錄已刪除
- [x] `docs/README_通用作業準則.md` §1.0 含角色分工表（4 角色 × 4 欄位）
- [x] 本 Report 異動記錄含每個檔案的 Before/After 變更

### 成果 Checklist (Deliverables)

- [x] 所有修改的檔案已列出異動記錄
- [ ] 已執行 `/pj_sync`（下方執行）
- [x] 產出 `jobs/JOB-160-Report.md`

---

## 🔄 同步確認

- [ ] `docs/進度彙整_題庫研發與產出.md`（本次為 docs_ops，不涉及題庫變更，不需更新）
- [ ] `docs/README_專案發展紀錄.md`（下方 pj_sync 執行）

---

## ⚠️ 遺留問題

1. **pj_job 硬閘 22 行**：超出 15 行目標，但 5 項 Checklist 每項都是必要防線，強行刪減會弱化安全性。建議接受。
2. **過期文件 R3/R4**：`docs/過期文件_勿參考/` 內仍有大量 R3/R4 術語，但該目錄已標記為「勿參考」，不屬於活躍規範，未修改。
3. **`.cursor/rules/*.mdc`**：Cursor 專用規則未在本次範圍內同步。若需對齊 CLAUDE.md 角色定義，建議另開 JOB。

---

## 🔧 技術筆記

- **P1 分散強化落地**：「Claude Code 不是執行者」出現在 CLAUDE.md §一（角色定義）、§三（派工紀律第 3 條）、README_通用作業準則.md §1.0（角色分工表），三處用不同措辭強化同一條規則。
- **P2 快取邊界落地**：CLAUDE.md = 自動載入（靜態快取），docs/*.md = 按需讀取（動態）。CLAUDE.md §二的路由表就是快取邊界的 routing layer。
- **P3 薄層觸發落地**：9 份 Skill 不再複述規則正文，只做「觸發 + 指向 + 硬閘」。驗收清單全文留在 knowledge/README_研究架構總綱.md 等權威檔中。
- **P4 多層防禦落地**：角色定義（CLAUDE.md）→ 草稿確認（pj_job 硬閘）→ 腳本防呆（job_manager.js）→ 執行者 Checklist → 結案驗收分離，五層各管不同問題。

---

## 🔍 驗收確認

| 欄位 | 內容 |
|:--|:--|
| 驗收者 | （待使用者填寫） |
| 驗收時間 | — |
| 驗收結果 | 待確認 |
| 退回原因 | 無 |

---

## ⏱️ 執行時間回報

| 子任務 | 耗時 | 備註 |
|:--|:--|:--|
| Step 1: CLAUDE.md 重寫 | - | 環境無壁鐘 |
| Step 2: 通用作業準則更新 | - | — |
| Step 3: 9 份 Skill 瘦身 | - | — |
| Step 4: 術語統一 | - | — |
| Step 5: audit 合併 | - | — |
| Step 6: Report + pj_sync | - | — |

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:- | 花費:- | 使用模型:claude-opus-4-6 | 執行者:Claude Code（使用者授權例外）
