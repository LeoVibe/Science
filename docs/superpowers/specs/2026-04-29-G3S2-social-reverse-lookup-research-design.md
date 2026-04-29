---
last_updated: 2026-04-29
updated_by: Claude Code (claude-sonnet-4-6)
version: 1.0.0
status: design (待 writing-plans 產出實作 plan)
job_type_target: research（主）+ docs_ops（KL2/KL3 補強）
parent_jobs: JOB-212（規範收斂）/ JOB-213（考古題轉檔）/ JOB-214（長時任務範本）/ JOB-215 Phase 1（內容層規範）
---

# G3S2 社會 反推法 KL2-KL4 研究設計（B 路徑示範）

## 文件定位

本文件為 **設計規範（spec）**，描述如何在「無課文」情境下（B 路徑）以多 Agent 反推法產出三下社會 KL2/KL3/KL4 高品質研究素材。

**本文件不是**：
- 派工單（JOB）— 待 writing-plans skill 產出實作 plan 後，以本 spec 為依據開派工
- 規範文件 — 不取代 `knowledge/README_研究架構總綱.md`、`question/README_*` 等正式規範
- 實作程式碼 — 五元件外殼依 `docs/長時任務執行範本.md` 套用

**權威性**：本文件落地時若與 Eidos 規範衝突，**以規範為權威**，並修正本 spec。

**歷史脈絡**：
- JOB-212（2026-04-28）完成 KL3 命名收斂與三下社會骨架建立（從素材庫推測版）
- JOB-213（2026-04-28）完成考古題目錄重構與三下社會 105 份 PDF→MD 轉檔
- JOB-214（2026-04-29）建立「長時任務執行範本」五元件架構
- JOB-215 Phase 1（2026-04-29，本 session）完成研究方法論內容層規範（流程/卡點/量化 DoD/分工 + KL3/KL4 模板）
- 本 spec 為 JOB-215 Phase 2 的設計依據

---

## 第一章：背景與目標

### 1.1 為什麼需要這份 spec

JOB-215 Phase 1 已寫好「研究方法論章節 + KL3/KL4 模板」，但**方法論落地需要驗證**。三下社會是最佳示範對象：
- 三版本（翰林/康軒/南一）皆無課文原文 → 純 B 路徑情境
- 105 份考古題 MD 已備齊（JOB-213 產出）
- KL3/KL4 既有 JOB-212 的素材庫推測版本，可比對「考古題佐證版」優劣

### 1.2 任務範圍

| 維度 | 範圍 |
|:--|:--|
| 年級學期 | G3S2（三年級下學期） |
| 科目 | 社會 |
| 出版社 | 翰林（6 課）+ 康軒（6 課）+ 南一（4 課 + 1 探究） |
| 階段 | KL2 補強 + KL3 改寫 + KL4 雙檔深掘 |
| 路徑 | B 路徑（無課文，反推法） |
| 量級 | 105 份考古題 MD → 17 課 × 2 = 34 個 KL4 雙檔 + 1 個 KL3 + 1 個 KL2 章節 |

### 1.3 成功標準（Goal-Driven）

| 階段 | 結束門檻 | 驗證方式 |
|:--|:--|:--|
| 階段 0 前置 | 五元件基礎建設到位 | progress.json/dashboard/wakeup 可運作 |
| 階段 2a 反推 | 三份《考古題彙整報告》達 B 完整版 DoD | 字數 ≥5,000 / 課 / 報告，迷思矩陣 ≥5 條 / 課 |
| 階段 2b KL3 改寫 | KL3 v2 三分類標記完整 | 每節有「有佐證/無佐證/矛盾」標籤，字數 ≥4,000 |
| 階段 2c KL4 深掘 | 34 個 KL4 雙檔達量化 DoD | CK-01～CK-06 全綠 + Phase 1 字數要求 |
| 階段 2d KL2 補強 | 新章節含 G3S2 共通迷思 | 字數 ≥1,500，跨年級脈絡完整 |

---

## 第二章：研究方法論（核心思路）

### 2.1 為什麼分 KL2 / KL3 / KL4

三層回答**不同問題**，不重複：

| 層 | 回答的問題 | 範圍 |
|:--|:--|:--|
| **KL2** | 這科本質是什麼？學生最常卡在哪？ | 整個科目（如「社會科」G1-G6） |
| **KL3** | 這學期教什麼？三版本怎麼對照？ | 一個學期 |
| **KL4** | 這一課要教什麼？學生在這一課會在哪裡錯？ | 單一一課 |

**原則**：上層當「定錨」給下層；下層用「實證」回饋上層。

### 2.2 兩種研究路徑

| 路徑 | 適用 | 起點 | 流向 |
|:--|:--|:--|:--|
| **A 路徑** | 國語、英語（有課文） | 課文原文 | 由上而下：KL2 → 讀課文 → KL4 → 補強 KL3 |
| **B 路徑** | 社會、自然（無課文） | 真實考古題 | 由下而上：KL2 → 多 Agent 讀考古題 → 改 KL3 → 寫 KL4 |

**B 路徑精神**：考古題就是真相，KL3/KL4 必須與之對齊。

### 2.3 為什麼 B 路徑要先改 KL3 再寫 KL4

KL3 是 KL4 的定錨。若 KL3 本身內容不準（基於素材庫推測但無考古題佐證），錯誤會傳遞到 KL4。

**改寫 KL3 三分類動作**：

| 對照結果 | 判斷依據 | 處置 |
|:--|:--|:--|
| 原 KL3 有考古題佐證 | 原內容對應 ≥3 道考古題 | 保留 + 加考古題引用 |
| 原 KL3 無考古題佐證 | 純素材庫推測，無考古題對應 | 降級「教學設計推測」標籤或刪除 |
| 原 KL3 與考古題矛盾 | 原說 X，考古題實際考 Y | 改寫為 Y，標明來源 |

### 2.4 KL4 雙檔分工

| 檔案 | 回答 | 內容核心 |
|:--|:--|:--|
| 單課研究紀錄 | 這一課要學什麼？ | 課綱連結（學習表現/內容編碼）、知識點地圖、認知地雷 |
| 考古題與討論 | 學生實際在這一課哪裡錯？ | 真實考古題、誘答機制分析、迷思深度討論 |

兩個合起來，下游出題階段才能「知道這一課該出什麼、怎麼設計誘答」。

---

## 第三章：執行架構（三階段嚴格阻塞 + 五元件外殼）

### 3.1 整體流程

```
┌─ 階段 0：前置（30 min）── 五元件基礎建設
│   └─ progress.json / dashboard / loop wrapper / wakeup / Discord
│
├─ 階段 2a：多 Agent 反推考古題（1-2 天）
│   ├─ Cursor agent × 3 並行（model: sonnet 4.6）
│   ├─ Agent-翰林（30 份 MD）/ Agent-康軒（51 份）/ Agent-南一（24 份）
│   ├─ ⛔ 嚴格阻塞：三 agent 全部 keep 才進 2b
│   └─ 產出：3 份《[版本] 考古題彙整報告》（B 完整版）
│
├─ 階段 2b：PM 改寫 KL3（半天）
│   ├─ 切到 Opus 4.7（logic-heavy）
│   ├─ 三分類比對：有佐證 / 無佐證 / 矛盾
│   └─ 產出：KL3_三下_社會_研究總綱.md（v2 考古題佐證版）
│
├─ 階段 2c：多 Agent 寫 KL4（1-2 天）
│   ├─ Cursor agent × 3 並行（model: sonnet 4.6）
│   ├─ 翰林 12 課（RM0→RM3）/ 康軒 12 課（從零→RM3）/ 南一 10 課
│   └─ 產出：34 個 KL4 雙檔達量化 DoD
│
└─ 階段 2d：KL2 補強（半天，PM 親跑）
    └─ 把 G3S2 共通迷思補進 KL2_社會科共同發展總綱.md
```

### 3.2 為什麼 KL2 補強放最後

KL2 是「整科 G1-G6 的學科本質」，本任務僅 G3S2 一個學期。把 KL2 放最後，是讓 G3S2 的考古題實證**回饋給 KL2**，達成 bottom-up feedback——這正是「KL2~KL4 變得更有意義」的關鍵。

不放最前面的原因：
- 不該為了一個學期重寫 KL2（範圍不對）
- KL2 在 2a/2b/2c 過程中，原版本可作為定錨參考
- 學完三版本 17 課後，才有足夠材料判斷「哪些是 G3S2 特有 vs 社會科共通」

---

## 第四章：階段 2a 詳細設計（多 Agent 反推）

### 4.1 Cursor agent prompt 骨架

```bash
cursor agent --print --yolo --workspace . --model claude-sonnet-4-6 \
  "[Research Agent - 三下社會 {版本} 考古題反推]

   📚 必讀：
     1. knowledge/README_研究架構總綱.md（v4.5，含量化 DoD + 歷史卡點）
     2. knowledge/3_考古題/README.md（考古題鐵律 + 課次分類準則）
     3. knowledge/1_課綱研究/社會/KL3_三下_社會_研究總綱.md（既有課名清單）
     4. jobs/_JOB-TEMPLATE-research-KL3.md（KL3 模板）
     5. jobs/JOB-{NNN}-AG-G3S2-社會-{版本}-考古題反推.md（本任務）

   🛡️ 護欄（IDE 自動套用）：
     • karpathy-guidelines.mdc 四原則
     • workspace-directory.mdc / project-startup-and-job-discipline.mdc

   🎯 任務：
     讀 knowledge/3_考古題/2_MD淬鍊文字/三下/三下_社會_{版本}/ 下所有 MD（{N} 份）
     → 每題標 lesson（L1~L6 / ambiguous）
     → 淬鍊每課「出題方向 + 學生卡點 + 誘答機制統計」
     → 產出《{版本} 考古題彙整報告》

   📋 報告章節（B 完整版）：
     見 §4.2 報告結構規格

   🔁 自主迴圈（autoresearch NEVER STOP）：
     for 每課:
       1. 抽出該課題目（按 §4.3 課次分類準則）
       2. 寫第三節對應子節
       3. 寫一行至 jobs/JOB-{NNN}-progress.tsv:
          \$commit\\t2a\\tSocial\\t{版本}\\t\$lesson\\t-\\t-\\t-\\tRM2\\t\$status\\t\$desc\\t\$ts
       4. status = keep | β+_keep | manual_review | crash
     直到 6 課全完，git commit + 寫整體報告

   ⛔ 退件條件：
     - 某課題數 < 5（連 ambiguous 都計入仍不足）→ 標 β+_keep + 報告寫入「來源稀缺警告」
     - MD 讀取錯誤連 5 次 → crash 停下等 PM
     - 課次歸屬信心 < 60% > 30% 題目 → manual_review 等 PM 裁定" \
  > scripts/orchestrator-logs/JOB-{NNN}-社會-{版本}.log 2>&1 &
```

### 4.2 報告結構規格（B 完整版）

```markdown
# {版本} 三下社會 考古題彙整報告

## 第一節 概覽
- N 份試卷 / M 校 / Y 年度
- 三下社會 {版本} 課目錄（從 KL3 引用）
- 達標檢核總覽（每課題數 / 來源數 / 是否 ≥10+≥2 達標）

## 第二節 逐題分類表
| 檔名 | 題號 | 題幹首句 | lesson | 信心 | 備註 |

## 第三節 逐課深度分析（每課一節）
### {Lx} {課名}
#### 3.x.1 該課考古題清單
（題幹 + 四選項 + 答案 + 來源「{學校} {學年度} {考試類型}」）

#### 3.x.2 出題方向統計
（依 topic_hits 對應，列出該課 N 題覆蓋的主題）

#### 3.x.3 跨年度頻率分析
（哪些年常考、哪些是新題型，學年度分布）

#### 3.x.4 誘答機制統計
（最常用的錯誤選項類型；如「現代化謬誤」「概念混淆」「價值偏見」）

#### 3.x.5 迷思矩陣（≥5 條）
| 迷思描述 | 為何普遍存在 | 對應考古題編號 |

## 第四節 達標檢核
- 每課題數達標 / 不達標
- 來源數 ≥2 達標 / 不達標
- β+ 標記課次清單與原因

## 第五節 給 PM 的建議
- KL3 改寫建議重點（哪些原 KL3 內容明顯與考古題矛盾）
- 跨課邊界題處理建議
- KL2 補強候選素材（哪些迷思可能是社會科共通）
```

### 4.3 課次分類準則

| 情況 | 處理 | 計入達標？ |
|:--|:--|:--:|
| 明確含該課專屬詞彙 | `lesson: "L2"` | ✅ |
| 兩課交界 | `lesson: "L2_or_L3"` | ❌ |
| 通用常識 | `lesson: "ambiguous"` | ❌ |
| 閱讀題短文明確對應某課 | 該課 | ✅ |

**原則**：寧可少歸，不可錯歸。

---

## 第五章：階段 2b 詳細設計（PM 改寫 KL3）

### 5.1 執行者

PM（Claude Code，使用者切換到 Opus 4.7）親跑。理由：
- 三分類比對是 logic-heavy 工作
- 涉及對既有 KL3 的全面審查
- G5S2 spec §2.1 角色卡：Research Agent 不該做這類設計層判斷

### 5.2 三分類動作流程

```
input：3 份《考古題彙整報告》+ 原 KL3_三下_社會_研究總綱.md（v1）

step 1：把原 KL3 拆成節（依現有章節）

step 2：對每節做三分類比對
  - 找該節對應的考古題（從 2a 報告抽出）
  - 判斷：有佐證 / 無佐證 / 矛盾
  - 記錄判斷依據（哪些題支持/反對）

step 3：改寫
  - 有佐證 → 保留 + 加引用「（佐證：{版本} {學校} {年度} 第 N 題）」
  - 無佐證 → 加標籤「[教學設計推測]」或整段刪除
  - 矛盾 → 改寫為考古題版本 + 加標籤「[依考古題佐證；原素材庫推測：{舊內容}]」

step 4：補新節（從 2a 報告新發現的內容）
  - 跨版本共通迷思（高頻）
  - 三版本獨特出題方向

output：KL3_三下_社會_研究總綱.md（v2）
  - 字數 ≥4,000（原 v1 ~3,000）
  - 每節有三分類標籤
  - frontmatter 標 last_updated / updated_by / version: 2.0
```

### 5.3 PM session 工作模式

- 預估 4-6 小時（半天）
- 一次性完成，不分段（避免中斷導致三分類不一致）
- 過程不寫 progress.tsv（PM session 不適用 autoresearch）
- 完成後人工檢查：抽 3 節驗證三分類正確性

---

## 第六章：階段 2c 詳細設計（多 Agent 寫 KL4）

### 6.1 Cursor agent prompt 骨架

```bash
cursor agent --print --yolo --workspace . --model claude-sonnet-4-6 \
  "[Research Agent - 三下社會 {版本} KL4 雙檔產出]

   📚 必讀：
     1. knowledge/README_研究架構總綱.md（v4.5）
     2. knowledge/1_課綱研究/社會/KL3_三下_社會_研究總綱.md（v2，2b 產出）
     3. {對應 2a 產出的考古題彙整報告}
     4. jobs/_JOB-TEMPLATE-research-KL4.md（KL4 模板）
     5. knowledge/1_課綱研究/社會/四下/翰林/KL4_四下_翰林_L1_家鄉老故事_*.md（深度標竿）

   🎯 任務：
     對 {版本} {課數} 課，每課產出 KL4 雙檔：
       - {版本}/KL4_三下_{版本}_L{N}_{課名}_單課研究紀錄.md
       - {版本}/KL4_三下_{版本}_L{N}_{課名}_考古題與討論.md

   📋 量化 DoD（每檔達標）：
     單課研究紀錄：
       - 字數 ≥1,500（β+ ≥1,200）
       - 知識點地圖 ≥3 主題節
       - 認知地雷 ≥4 條
       - 108 課綱學習編碼 ≥2 個
     考古題與討論：
       - 字數 ≥3,000（β+ ≥2,500）
       - 真實考古題 ≥10 題（β+ 警戒值 ≥10）
       - 來源學校數 ≥2（β+ ≥3）
       - 迷思深度討論 ≥2 條
       - 每題誘答分析 ≥30 字（β+ ≥40 字）
       - 達標狀態明確標記（✅ RM2 達標 或 ❌ 未達）

   🔁 自主迴圈：
     for 每課（從 L1 到 L{N}）:
       1. 寫單課研究紀錄
       2. 寫考古題與討論
       3. CK-01～CK-06 自稽
       4. git commit
       5. 寫 progress.tsv（phase=2c）
     NEVER STOP 直到全課完成

   ⛔ 退件條件：
     - 字數連 3 課不達 DoD → manual_review，停下等 PM 抽查
     - 考古題不足某課 → 標 β+ 降 QL 上限
     - CK 自稽連 3 課不過 → crash 停下" \
  > scripts/orchestrator-logs/JOB-{NNN}-社會-{版本}-KL4.log 2>&1 &
```

### 6.2 三版本平行配置

| Agent | 版本 | 課數 | 預估時間 | 既有狀態 |
|:--|:--|:--:|:--:|:--|
| Agent-翰林 | 翰林 | 6 課 × 2 = 12 檔 | 1-2 天 | RM0 空殼（JOB-212 已建） |
| Agent-康軒 | 康軒 | 6 課 × 2 = 12 檔 | 1-2 天 | 從零（康軒目錄不存在） |
| Agent-南一 | 南一 | 5 課 × 2 = 10 檔 | 1-2 天 | L5 已 RM3，L1-4 從零 |

---

## 第七章：階段 2d 詳細設計（KL2 補強）

### 7.1 執行者

PM 親跑（沿用 2b 的 Opus 4.7）。

### 7.2 補強動作

```
input：原 KL2_社會科共同發展總綱.md（v1）+ 完整 G3S2 KL3/KL4 產出

step 1：盤點 G3S2 學到的迷思
  - 從 2a 三份彙整報告 §3.x.5（迷思矩陣）合計
  - 從 2b KL3 v2 §跨課迷思
  - 從 2c KL4 §認知地雷

step 2：判斷哪些迷思是「社會科 G1-G6 共通」
  - 跨年級可推估（如「公權力依賴」非僅 G3 特有）
  - 認知發展對應（如「具體運思 vs 形式運思」轉折期問題）

step 3：補新章節（不重寫舊章節）
  - 章節名：「§ G3S2 實證迷思補充（依 JOB-215 反推法 2026-04-29）」
  - 內容：≥5 條跨年級可能共通的迷思 + 認知發展對應
  - 字數 ≥1,500

step 4：更新 frontmatter
  - last_updated / updated_by / 標明本次補強範圍

output：KL2_社會科共同發展總綱.md（v2，僅新增章節）
```

### 7.3 邊界原則

- **不重寫原 KL2** — 只補新章節
- **不擴張到其他學期** — 僅基於 G3S2 實證
- **保留前作者標註** — 不刪除原作者設計

---

## 第八章：五元件外殼（依長時任務範本）

### 8.1 對應關係

| 五元件 | 本任務套用 | 路徑 |
|:--|:--|:--|
| ① Progress State | jobs/JOB-{NNN}-progress.tsv | TSV 格式（schema 見 §8.2） |
| ② Worker | Cursor agent CLI（2a/2c）+ PM session（2b/2d） | scripts/orchestrator-logs/ |
| ③ Dashboard | scripts/JOB-{NNN}-progress-dashboard.sh | 仿 g5s2_tsv_monitor.sh |
| ④ Loop Wrapper | 不需要（每階段一次性派 3 agent，不 batch loop） | — |
| ⑤ Wakeup + Discord | ScheduleWakeup 60 min + Discord MCP | chat_id `1487738477608177714` |

### 8.2 progress.tsv schema

```tsv
commit	phase	subject	publisher	lesson	CQI-P	CQI-V	Match%	RM	status	desc	ts
```

| 欄 | 範例 | 說明 |
|:--|:--|:--|
| commit | `abc1234` | git commit short hash（每課一個 commit） |
| phase | `2a` / `2b` / `2c` / `2d` | 對應階段 |
| subject | `Social` | 固定 |
| publisher | `HanLin` / `KangHsuan` / `NanYi` | 與目錄一致 |
| lesson | `L1` / `L2` ... `L6` / `summary` | 課號或 summary |
| CQI-P / CQI-V / Match% | 全填 `-` | 本任務不出題不盲測 |
| RM | `RM0` / `RM2` / `RM3` | 該課當前等級 |
| status | `keep` / `β+_keep` / `manual_review` / `crash` / `retry` | autoresearch 風格 |
| desc | `12 考古/3 來源` | 一句話描述 |
| ts | `2026-04-29T16:30` | ISO 8601 短格式 |

### 8.3 Dashboard 必備元素

依 JOB-214 範本 §三-③ 規範：
1. 醒目時間戳（含日期、星期、HH:MM:SS）
2. 整體狀態計數（done / partial / failed / pending）
3. 完成度百分比
4. 近 60 分鐘增量
5. 各 phase 進度條（2a/2b/2c/2d）
6. 預估剩餘 + 預估完成時間

### 8.4 Wakeup 排程

- 階段 2a 啟動 → ScheduleWakeup 60 min
- 階段 2c 啟動 → ScheduleWakeup 60 min
- 階段 2b/2d 為 PM 親跑，不需 wakeup
- prompt 模板沿用 `scripts/templates/wakeup_prompt.md`

---

## 第九章：退件矩陣

| 階段 | 失敗訊號 | 自動處置 | 標記 | 後續流程 |
|:--|:--|:--|:--|:--|
| 2a | 某課題數 <5 | 標 β+_keep + 報告寫警告 | `β+_keep` | 進 2b（β+ 路徑） |
| 2a | MD 讀失敗連 5 次 | 即停 | `crash` | PM 介入 |
| 2a | 課次信心 <60% 占比 >30% | 停下 | `manual_review` | PM 裁定 |
| 2b | 三分類矛盾 ≥30% 章節 | 停下 | — | PM 與使用者討論優先順序 |
| 2c | 字數連 3 課不達 DoD | 停下 | `manual_review` | PM 抽查模板與 prompt |
| 2c | RM 升級失敗（題數不足） | 標 β+ 降 QL 上限 | `β+_keep` | 繼續推進 |
| 2c | CK 自稽連 3 課不過 | 即停 | `crash` | PM 介入 |
| 2d | KL2 新章節字數不達 | 停下 | — | PM 補強或調低門檻 |

---

## 第十章：與既有規範的相容性

### 10.1 規範版本鎖

| 規範文件 | 本 spec 引用版本 | 來源最後更新 |
|:--|:--|:--|
| `knowledge/README_研究架構總綱.md` | v4.5（含 Phase 1 新增 4 章節） | 2026-04-29 |
| `docs/長時任務執行範本.md` | v1.0 | 2026-04-29 |
| `jobs/_JOB-TEMPLATE-research-KL3.md` | （Phase 1 新建） | 2026-04-29 |
| `jobs/_JOB-TEMPLATE-research-KL4.md` | （Phase 1 新建） | 2026-04-29 |
| `knowledge/3_考古題/README.md` | （JOB-213 後最新） | 2026-04-28 |

### 10.2 與 G5S2 三 Agent spec 的差異

本 spec 是「精簡版三 Agent」，差異：

| 維度 | G5S2 spec | 本 spec |
|:--|:--|:--|
| Agent 角色 | Research / Production / Verification 三角色 | 僅 Research（Production/Verification 不在範圍） |
| 雙盲驗證 | L2（Gemini + Claude） | 不適用（本任務不出題） |
| 模式 | 階段並行（不同課可在不同階段） | 嚴格阻塞（三 agent 全完才進下一階段） |
| 範圍 | G5S2 三科 ~80 個 JOB | G3S2 一科 ~5 個 JOB（每階段一個） |

### 10.3 與 JOB-214 長時任務範本的相容

完全套用五元件，僅省略 Loop Wrapper（因每階段不 batch loop）。

---

## 第十一章：嚴謹度等級與不確定性

### 11.1 嚴謹度等級

**L1 單盲不適用**：本任務不出題不盲測，嚴謹度體現在：
- 考古題真實性（每題標來源）
- 三分類比對的可追溯性（每節有判斷依據）
- 量化 DoD 字數/條目門檻

### 11.2 不確定性聲明

| 項目 | 不確定性 | 處置 |
|:--|:--|:--|
| 課次歸屬準確率 | 估 ≥80%，但 ambiguous 題比例可能偏高 | 2a 結束後抽樣 5% 人工驗證 |
| Cursor agent sonnet 4.6 處理 50 份 MD 的能力 | 未實測過此規模 | 階段 2a 開頭先試一個版本（如南一 24 份）若成功再批次 |
| 跨版本「共通迷思」判斷 | 主觀性高 | 2d 補強 KL2 時 PM 抽查並標明信心程度 |
| KL3 v2 改寫品質 | 三分類執行的一致性 | 2b 完成後人工抽查 3 節 |

---

## 第十二章：後續實作步驟

本 spec 通過使用者複核後，下一步：

1. **執行 brainstorming skill 收尾**（self-review + 使用者複核）
2. **呼叫 writing-plans skill** 產出實作 plan：
   - plan 內容：階段 0 → 2d 的具體 JOB 清單
   - 每個 JOB 的草稿先呈現對話、得使用者確認、才開單
3. **使用者批准 plan 後**，依序：
   - 階段 0：開立 docs_ops JOB（建 progress.tsv 等基礎建設）
   - 階段 2a：開 3 個 research JOB（每版本一個）→ 派 Cursor
   - 階段 2b：PM 親跑改寫 KL3（使用者切 Opus 4.7）
   - 階段 2c：開 3 個 research JOB → 派 Cursor
   - 階段 2d：PM 親跑補 KL2

---

## 附錄 A：關鍵數字盤點

| 維度 | 數量 |
|:--|:--:|
| 考古題 MD（翰林） | 30 份 |
| 考古題 MD（康軒） | 51 份 |
| 考古題 MD（南一） | 24 份 |
| **考古題 MD 合計** | **105 份** |
| KL4 待產出（翰林） | 6 課 × 2 = 12 檔 |
| KL4 待產出（康軒） | 6 課 × 2 = 12 檔 |
| KL4 待產出（南一） | 5 課 × 2 = 10 檔 |
| **KL4 合計** | **34 檔** |
| KL3 待改寫 | 1 份（v1 → v2） |
| KL2 待補強 | 1 份（新增章節） |
| 預估 JOB 數 | 階段 0 × 1 + 階段 2a × 3 + 階段 2b × 1 + 階段 2c × 3 + 階段 2d × 1 = **9 個** |

## 附錄 B：相關歷史 JOB 索引

| JOB | 任務 | 與本 spec 關係 |
|:--|:--|:--|
| JOB-170 | G4S2 社會 KL4 單課研究建置 | 深度標竿（四下翰林 RM3 範例） |
| JOB-176 | 南一四下社會 KL4 考古題蒐集 | 舊方法（tcool.cc 抓題），本 spec 改用已備齊的 MD |
| JOB-209 | 米蘭考古題分批下載 | 提供原始 PDF 來源（已完成 100%） |
| JOB-212 | KL3 命名收斂 + 三下社會骨架 | 提供原 KL3（v1，將改寫）+ 翰林 KL4 12 空殼 |
| JOB-213 | 考古題目錄重構 + 三下社會 PDF→MD | 提供 105 份 exam MD 素材 |
| JOB-214 | 長時任務範本建立 | 提供五元件外殼設計 |
| JOB-215 Phase 1 | 研究方法論內容層規範 | 提供量化 DoD + KL3/KL4 模板 |
| JOB-215 Phase 2 | （本 spec 對應） | 反推法落地實作 |
| JOB-215 Phase 3 | 比較分析 + 結案 | 接續本 spec 完成後 |

## 附錄 C：本 spec 自身的版控與更新紀律

- **本 spec 修改**：屬 docs_ops 範疇，需走完整 JOB 流程
- **小幅修正**（typo、佐證連結補充）：可在實作 plan 期間直接 commit，並在 commit message 註明「spec 修補：[何處]」
- **重大變更**（階段拆分、agent 邊界改動、嚴謹度升級）：需重新 brainstorming → 重寫 spec → 使用者再次複核
