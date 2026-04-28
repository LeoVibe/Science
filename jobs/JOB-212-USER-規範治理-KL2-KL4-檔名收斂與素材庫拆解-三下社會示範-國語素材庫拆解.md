*Created by USER at 2026-04-28 00:00*

`last_updated`: 2026-04-28 00:00
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-212-USER-規範治理-KL2KL4-檔名收斂與素材庫拆解-三下社會示範-國語素材庫拆解

**`job_type`**：`mixed`（`docs_ops` + `research`）

---

## 📌 任務背景

本次 doc2md 技能呼叫過程中，發現多處規範不一致問題：
1. KL3 檔名格式無統一（缺 `KL3_` 前綴，部分缺學期，部分含「發展綱要」而非「研究總綱」）
2. `knowledge/README_研究架構總綱.md` 未明確定義課名歸屬層（KL3 vs KL4），導致 Agent 找不到資料
3. G3 社會科素材庫（`G3_S2_社會_原始研究素材庫.md`）混 KL3 + KL4 內容，未拆解
4. 5 份國語年度素材庫（`KL4_[學期]_國語_原始研究素材庫.md`）尚未拆解成各課 KL4 雙檔
5. HanLin G3 S2 社會科 manifest 課名是佔位符（L1~L6）
6. 部分過時附屬檔（生活科 KL2 重複、選擇題設計指引、01_五下生物、iCloud 副本）尚未清理
7. 交叉引用（文件間路徑引用）散見於歷史 Report 與腳本，有待釐清是否需更新

---

## 🎯 任務目標

完成後達到以下可驗證狀態：
1. `README_研究架構總綱.md` 新增四條明確定義（KL3 必含課名清單、KL3 檔名格式、KL4 雙檔格式、素材庫大檔禁止規則）
2. 全部 26 個 KL3 檔案符合命名規範（`KL3_[學期]_[科目]_研究總綱.md`）
3. G3 S2 社會科素材庫拆成：KL3（課名清單）+ 6 個 KL4 雙檔（各課研究紀錄）
4. HanLin G3 S2 社會科 manifest 6 個 L1~L6 佔位符改為真實課名
5. 過時附屬檔清理完成（5 項）
6. 5 份國語年度素材庫各自拆解成所有課次的 KL4 雙檔（約 180 課，分批進行）

---

## 🚧 任務邊界

**本次任務只做：**
- A. 規範文件增補（`README_研究架構總綱.md` + `README_出題與品管準則.md`）
- B. 26 個 KL3 檔案重命名（`mv` + 回歸腳本驗證）
- C. G3 S2 社會科素材庫拆解（KL3 + 6 個 KL4）+ manifest 課名修正
- D1. 過時附屬檔清理（生活科 KL2 重複、選擇題設計指引、01_五下生物、iCloud 副本）
- D2. 5 份國語年度素材庫拆解（分批，每批後 stop-and-confirm）

**本次任務不做：**
- 考古題 PDF 轉 MD 轉檔（另開 JOB）
- 盲測、出題、題庫 JSON 修改（除 manifest 課名以外）
- 非上述範圍的任何規範文件修改

---

## 📖 執行步驟

### Phase A｜規範文件增補（docs_ops）
**目標**：把 Agent 找不到的知識點寫進規範。stop-and-confirm 後再進 B。

A1. 讀 `knowledge/README_研究架構總綱.md`，在 KL3 章節新增四條定義：
   - KL3 必含課名清單（定義：各版本各冊課文標題列表）
   - KL3 檔名格式：`KL3_[學期縮寫]_[科目]_研究總綱.md`（例：`KL3_三下_社會_研究總綱.md`）
   - KL4 雙檔格式：`KL4_[學期縮寫]_[科目]_L[課次]_[版本]_研究紀錄.md` + `KL4_[學期縮寫]_[科目]_L[課次]_[版本]_考古題.md`
   - 素材庫大檔禁止規則：新建 KL4 素材庫不得再以單一大檔存放多課；既有大檔視為待拆解

A2. 讀 `question/README_出題與品管準則.md`，從「選擇題設計指引」（即將刪除的舊檔 `knowledge/1_課綱研究/選擇題設計指引.md`）中萃取核心出題原則，新增為準則附錄。

**⚠️ stop-and-confirm**：A 完成後，呈現修改 diff 草稿，等使用者確認後才寫入檔案並進 B。

---

### Phase B｜KL3 檔案重命名（docs_ops）
**目標**：全部 26 個 KL3 檔名收斂至統一格式。stop-and-confirm 後再進 C。

B1. 列出現有所有 KL3 相關檔案（`find knowledge/ -name "*KL3*" -o -name "*發展綱要*" -o -name "*研究總綱*"`）

B2. 對照規範，逐一確認每個檔案的新名稱，產出 rename 對照表（舊名 → 新名）

B3. 撰寫 `scripts/normalize_kl3_refs.py`（whitelist 模式）：
   - Whitelist：`scripts/`、`docs/`、`_agent/` 目錄下的 .js / .py / .md 主動維護文件
   - Blacklist（不更新）：`jobs/` 下的歷史 Report（歷史紀錄保留原路徑）
   - dry-run 先跑，輸出要改的行數清單，等確認再正式跑

B4. 執行 `mv`（重命名）→ 執行 `scripts/normalize_kl3_refs.py`（更新引用）→ 驗證 `grep` 確認無殘留舊名（Whitelist 範圍內）

**⚠️ stop-and-confirm**：B2 對照表確認後才執行 mv，B3 dry-run 結果確認後才正式跑引用替換。

---

### Phase C｜G3 S2 社會科素材庫拆解（research）
**目標**：三下社會 KL3+KL4 結構完整，manifest 課名正確。stop-and-confirm 後再進 D。

C1. 讀 `knowledge/1_課綱研究/社會/G3_S2_社會_原始研究素材庫.md`，確認各出版社課名清單與各課素材

C2. 產出 `knowledge/1_課綱研究/社會/KL3_三下_社會_研究總綱.md`：
   - 三出版社各冊課名清單（康軒6課、南一5課、翰林6課）
   - 各課學習目標摘要（從素材庫萃取）

C3. 為每課產出 KL4 雙檔（共 6 課 × 1 版本 = 以現有素材能做的部分）：
   - `KL4_三下_社會_L[N]_[版本]_研究紀錄.md`
   - `KL4_三下_社會_L[N]_[版本]_考古題.md`（若無考古題素材則建空殼並標記 `RM0`）
   - 版本：先以翰林為主（因翰林有最完整素材），康軒/南一視素材可用度決定

C4. 修正 `question/platform/G3/SocialStudies/S2/HanLin/G3_S2_SOC_HANLIN_manifest.json` 的 6 個課名（L1→第1課 我居住的地方，L2→第2課...依翰林課名填入）

**⚠️ stop-and-confirm**：C2 KL3 草稿確認後才建檔，C3 第一課 KL4 產出確認後才批量其餘課次。

---

### Phase D1｜過時附屬檔清理（docs_ops）
**目標**：清理 5 項舊檔，減少目錄雜訊。

| 編號 | 動作 | 對象 |
|:--|:--|:--|
| D1-1 | 刪除 | `knowledge/1_課綱研究/生活/KL2_生活_課綱研究總綱.md`（確認與主檔重複後刪除） |
| D1-2 | 刪除 | `knowledge/1_課綱研究/選擇題設計指引.md`（內容已在 A2 萃取進準則附錄） |
| D1-3 | 重命名+合併 | `knowledge/1_課綱研究/自然/01_五下生物` → 改名為 `KL3_五下_自然_研究總綱_附錄_生物成熟度.md`，合併進自然主檔 |
| D1-4 | 刪除 | `knowledge/3_考古題/_manifest/` 下 iCloud 副本（`*manifest 2.json`、`*manifest 3.json` 等） |
| D1-5 | 刪除 | `question/platform/G3/SocialStudies/S2/HanLin/G3_S2_SOC_HANLIN_manifest 2.json`（iCloud 副本） |

---

### Phase D2｜國語年度素材庫拆解（research，分批）
**目標**：5 份國語大檔拆解成各課 KL4 雙檔（約 180 課）。

**對象檔案**（5 份）：
- `knowledge/1_課綱研究/國語/KL4_三下_國語_原始研究素材庫.md`
- `knowledge/1_課綱研究/國語/KL4_四下_國語_原始研究素材庫.md`
- `knowledge/1_課綱研究/國語/KL4_五下_國語_原始研究素材庫.md`
- `knowledge/1_課綱研究/國語/KL4_六下_國語_原始研究素材庫.md`
- `knowledge/1_課綱研究/國語/KL4_三上_國語_原始研究素材庫.md`（若存在）

**執行策略（分批）**：
- 每次處理 1 個學期（約 36 課次，3 出版社各 12 課）
- 每課產出 2 個檔案（研究紀錄 + 考古題殼）
- 每批完成後 stop-and-confirm，等使用者確認品質後才進下一批
- 原始素材庫大檔在全部拆解完畢、使用者確認後才刪除

**⚠️ stop-and-confirm**：每個學期拆解完後必須 stop，Claude 抽樣 3 課確認品質，使用者確認後才進下一學期。

---

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `knowledge/README_研究架構總綱.md` | KL2/KL3/KL4 定義（Phase A 修改目標） |
| `knowledge/1_課綱研究/國語/README_KL4單課建置與複製準則.md` | KL4 雙檔 SOP |
| `knowledge/1_課綱研究/社會/G3_S2_社會_原始研究素材庫.md` | 三下社會完整素材（Phase C 來源） |
| `knowledge/1_課綱研究/社會/三下_社會_發展綱要.md` | 待 Phase B 重命名的 KL3 示範 |
| `question/platform/G3/SocialStudies/S2/HanLin/G3_S2_SOC_HANLIN_manifest.json` | 待修正佔位課名（Phase C4） |
| `question/platform/G3/SocialStudies/S2/NanYi/G3_S2_SOC_NANYI_manifest.json` | 南一正確課名（參考） |
| `docs/README_任務派工準則.md` | 派工生命週期、結案流程 |
| `docs/README_通用作業準則.md` | 三段式 Checklist 規則 |

---

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] 已讀取：`knowledge/README_研究架構總綱.md`
- [ ] 已讀取：`knowledge/1_課綱研究/國語/README_KL4單課建置與複製準則.md`
- [ ] 已讀取：`knowledge/1_課綱研究/社會/G3_S2_社會_原始研究素材庫.md`
- [ ] 已確認執行模型：claude-sonnet-4-6（Claude Code 直接執行，非 Cursor）
- [ ] 已確認無需付費 API（全為本地文件操作，無 LLM API 呼叫）
- [ ] 已閱讀「任務邊界」並確認本次範圍
- [ ] 已確認 stop-and-confirm 節點位置（A後、B2後、B3 dry-run後、C2後、C3第一課後、每個D2學期後）

---

## ✅ 驗收 Checklist (Acceptance)

> 本 JOB 為 docs_ops + research，無 CQI 指標。改以結構完整性驗收。

- [ ] Phase A：`README_研究架構總綱.md` 新增 4 條定義可在文件中定位（附行號佐證）
- [ ] Phase A：`README_出題與品管準則.md` 新增附錄（附行號佐證）
- [ ] Phase B：`find knowledge/ -name "*發展綱要*"` 回傳 0 筆（KL3 舊名清零）
- [ ] Phase B：`find knowledge/ -name "KL3_*_研究總綱.md"` 回傳 26 筆
- [ ] Phase C：`ls knowledge/1_課綱研究/社會/KL3_三下_社會_研究總綱.md` 存在
- [ ] Phase C：`ls knowledge/1_課綱研究/社會/KL4_三下_社會_L*` 顯示 ≥ 6 個 KL4 研究紀錄檔
- [ ] Phase C4：manifest 6 個課名不含 "L1"~"L6" 佔位符（`grep '"L[1-6]"' manifest.json` 回傳 0）
- [ ] Phase D1：5 項舊檔已刪除或重命名（逐一 `ls` 確認不存在）
- [ ] Phase D2：每個學期拆解完畢後，抽樣 3 課確認格式正確

---

## ✅ 成果 Checklist (Deliverables)

- [ ] 產出 `jobs/JOB-212-Report.md`，含各 Phase 修改的完整檔案路徑列表
- [ ] Phase D2 拆解紀錄（每批學期完成時間 + 課次數量）
- [ ] 執行 `node scripts/job_manager.js close JOB-212`
- [ ] 執行 `/pj_sync`
- [ ] Discord 結案回報至 `#eidos_派工與回報`（chat_id: `1487738477608177714`）

---

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:{真實Meta中數字} | 花費: ${換算台幣} | 使用模型: claude-sonnet-4-6 | 執行者: Claude
