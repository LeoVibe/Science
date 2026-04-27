# Eidos 派工系統 — 進度／斷點恢復子系統設計

`spec_id`: 2026-04-27-progress-resume-system-design
`status`: draft (pending PM review)
`last_updated`: 2026-04-27
`updated_by`: Claude Code (claude-opus-4-7)
`parent_jobs`: JOB-210（G5S2 三 Agent 流水線前置基礎建設）
`child_jobs`: JOB-211（暫稱，斷點恢復子系統試行）

---

## 一、背景與目的

### 1.1 起因

JOB-210 完成 G5S2 三 Agent 流水線前置基礎建設後，使用者於 2026-04-27 提問：「JOB-210 的規劃中有網路中斷後或 Job 中斷後的重啟或延續規劃嗎？」

查 spec / plan / 三 SKILL 結果（標 ✅ 事實 / ❌ 缺項）：

**已涵蓋**：
- ✅ API 429 自動降頻、連 5 次 crash 停下
- ✅ CQI-P 不及格 retry ≤ 3 次（每次 30s）
- ✅ Research 連 3 課 crash 停下
- ✅ Verify 雙盲不一致率 > 20% 停下、TYPE-B > 5%/課 整課退
- ✅ Schema violation 即停
- ✅ 每課即 commit + 寫 g5s2_results.tsv（隱含 resume 基礎）

**缺項**：
- ❌ Cursor agent CLI 行程退出後的重啟指令範本
- ❌ 進度檔 resume 計算 helper
- ❌ 非 429 的網路錯誤退避（connection refused / DNS / 5xx）
- ❌ 「未過閘」單一資訊來源未明（tsv？JSON？派工單？）
- ❌ Cursor agent CLI 自身的 timeout / quota 上限未證實
- ❌ Agent 卡點時通知 PM 的明文機制

### 1.2 目的

建立**通用**斷點恢復子系統，所有 Eidos 長時 JOB 共用：

1. 中斷後可從進度檔接續（不丟超過 1 個單位的進度）
2. 卡點時透過 Discord DM 與 PM 互動（pending_pm 狀態 + 通知）
3. 底層連線錯誤自動退避
4. 進度與卡點對話可審計（git log 進度檔與派工單對話區）

### 1.3 範圍邊界

✅ 在範圍內：
- 進度檔 schema、派工單區塊格式、四支核心腳本
- PM DM 回覆協議
- 底層腳本（`auto_generate_questions.js` / `run_blind_eval.js`）的連線錯誤退避
- 試行 JOB（自然 翰林 L1）端到端驗證 5 條路徑

❌ 不在範圍內：
- 改變 Eidos 派工生命週期（依 `docs/README_任務派工準則.md`）
- 取代 results.tsv 既有格式（過渡：g5s2_results.tsv → JOB-XXX-progress.tsv 並行）
- 修改 cursor agent CLI 自身

---

## 二、設計決策

brainstorming 對話 Q1-Q5 + D1-D3 結論：

| 決策 | 選擇 | Why |
|:--|:--|:--|
| Q1 試行範圍 | (c) 完整驗證（含底層 retry） | 為長期運作機制而規劃，不只看這次 |
| Q2 抽象層級 | (b) 通用子系統 | 所有長時 JOB 共用 |
| Q3 進度檔位置 | (e) B+D 各取所長：寫入走獨立檔、讀取走派工單摘要區 | 寫衝突隔離 + 讀直觀 |
| Q4 PM 等待機制 | (c) timeout 參數化（infinity / N 分 / 0） | 單一機制涵蓋三情境 |
| Q5 試行範圍 | (b) 階段 1 第一單實際驗證 | 真實場景、不浪費 |
| D1 sync 觸發 | pre-commit hook | 自動、不依賴 Agent 記得 |
| D2 PM 解析 | 嚴格 + 編號自適應 | 嚴格避免誤接話、編號降低 PM 表達成本 |
| D3 與 JOB-210 關係 | (a) 開新 JOB-211 | 結案後紀律守得住、邊界乾淨 |

---

## 三、架構

### 3.1 三件式檔案結構

每個長時 JOB 三檔同前綴同目錄：

```
jobs/JOB-XXX-AG-名稱.md       ← 派工單（手寫 + 自動同步進度摘要區）
jobs/JOB-XXX-progress.tsv     ← 進度檔（純資料、append-only）
jobs/JOB-XXX-Report.md        ← 結案報告（既有約定）
```

打開 `jobs/JOB-XXX*` 任一檔即見 JOB 全貌。

### 3.2 四支核心腳本

| 腳本 | 一句話 | 觸發時機 |
|:--|:--|:--|
| `scripts/progress_append.sh` | 做完一單寫進度檔一行 | Agent 完成單位後 |
| `scripts/progress_sync.sh` | 把進度檔重點抄到派工單摘要區 | append 後（pre-commit hook 自動）|
| `scripts/progress_next.sh` | 算出該 Agent 的下一個未完成單位 | Agent 啟動後第一件事 |
| `scripts/progress_dm.sh` | 卡點時發 DM、寫 paused、含 timeout 等待 | Agent 達失敗門檻時 |

### 3.3 自主迴圈（簡化流程圖）

```
[新 Agent 啟動]
       │
       ↓
   progress_next（找下一單）
       │
   ┌───┴───┐
   無       有
   │       │
  結案    做事
           │
        成功？
       ┌───┴───┐
       ✅      ❌（達失敗門檻）
       │       │
   append   progress_dm
    sync   （含 timeout 邏輯）
       │       │
   ┌───┴───┐   │
   回主迴圈   結束自身
              │
              ↓
   PM 看 DM → 新對話 → 新 Agent → 重啟（從 progress_next 接續）
```

---

## 四、進度檔 Schema

### 4.1 13 欄 tsv

```
unit_id  commit  agent  subject  publisher  lesson  CQI-P  CQI-V  Match%  QL  status  desc  ts
```

| 欄 | 範例 | 必填 | 說明 |
|:--|:--|:-:|:--|
| unit_id | `Sci_HanLin_L1` | ✅ | 範圍內唯一識別（題庫類用 `<subject>_<publisher>_<lesson>`） |
| commit | `abc1234` | ✅ | 該單位的 git short hash |
| agent | `research` / `prod` / `verify` | ✅ | 哪個 Agent 寫的 |
| subject | `Science` | 題庫類 | 沿用 g5s2 spec §9.1 |
| publisher | `HanLin` | 題庫類 | 同上 |
| lesson | `L1` | 題庫類 | 同上 |
| CQI-P | `6.2` / `-` | 題庫類 | research 階段填 `-` |
| CQI-V | `3.4` / `-` | 題庫類 | prod 階段填 `-` |
| Match% | `97%` / `-` | 題庫類 | 雙盲 Match 率 |
| QL | `QL4` | 題庫類 | 該單當前等級 |
| status | 見 §4.2 | ✅ | 通用狀態 |
| desc | `30題 CQI 6.2` | ✅ | 一句話（避禁 tab/換行） |
| ts | `2026-04-27T14:30` | ✅ | ISO 8601 短 |

### 4.2 status 通用化（取代 g5s2 spec §9.1）

| 通用 status | 對應原 g5s2 status | 說明 |
|:--|:--|:--|
| `done` | keep / β+_keep | 完成（β+ 路徑寫進 desc） |
| `paused` | （新） | Agent 主動暫停（如 pre-commit hook 失敗） |
| `pending_pm` | （新） | 等 PM 介入（卡點） |
| `paused_offline` | （新） | DM 發不出去、Agent 結束 |
| `failed` | crash | 確定失敗、不可自動恢復 |
| `manual_review` | manual_review | 待人工裁定 |
| `partial` | partial | 部分完成（如雙盲一致一不一致） |
| `aborted` | （新） | 整 JOB 中止 |
| `retry` | retry | 重試中 |

向下相容：sync 腳本對照表處理（不改現有 `g5s2_results.tsv` 已有的 row）。

### 4.3 必要核心 6 欄

未來其他類型 JOB（爬蟲、研究批次、engineering）只寫核心欄：

```
unit_id  commit  agent  status  desc  ts
```

題庫專屬 7 欄空著（`-`）。

---

## 五、派工單三區塊

### 5.1 進度子系統設定（手寫一次、之後不動）

```markdown
## 進度子系統設定
<!-- progress-config-start -->
schema: question_pipeline_v1
pm_response_timeout: 30           # infinite | 0 | <minutes>
range:
  - subject: Science
    publisher: HanLin
    lessons: L1..L14
<!-- progress-config-end -->
```

`progress_next.sh` 讀這區得知本 JOB 範圍。

### 5.2 進度摘要（progress_sync.sh 自動同步）

```markdown
## 進度摘要（自動同步，勿手動編輯）
<!-- progress-summary-start -->
- 範圍總計：14 個單位
- 已 done：12（85.7%）
- pending_pm：1（Sci_HanLin_L13 — 雙盲不一致率 22%）
- failed/paused：0
- manual_review：1（Sci_HanLin_L5）
- 最近 5 筆：
  - Sci_HanLin_L12 / verify / done / 雙盲一致 30 publishable
  - Sci_HanLin_L11 / prod / done / 30 題 CQI 6.2
  - ...
- 最後更新：2026-04-27T14:30 (sync from JOB-211-progress.tsv)
<!-- progress-summary-end -->
```

### 5.3 PM 對話紀錄（progress_dm.sh 寫入）

```markdown
## PM 對話紀錄（progress_dm.sh 自動寫入）
<!-- progress-dm-log-start -->
[2026-04-27T14:30] DM sent (msg_id: 1498xxx)
  reason: 雙盲不一致率 22% 超 20% 門檻
  unit: Sci_HanLin_L13
  pause_status: pending_pm
  awaiting: PM 回覆（timeout: 30 min）

[2026-04-27T18:42] Resumed by new Agent
  pm_decision: 1 (accept)
  pm_message: "1 接受，QL3 即可"
  resumed_unit: Sci_HanLin_L14
<!-- progress-dm-log-end -->
```

每次 DM 寫一段；resume 時新 Agent 也寫一段。

---

## 六、PM 回覆協議

### 6.1 嚴格模式 + 編號自適應

PM 在 DM 第一行需含三件：
1. JOB 編號（`JOB-XXX`）
2. unit_id（如 `Sci_HanLin_L13`）
3. 指示關鍵字 / 編號

**單一 pending 時**（最常見）：Agent 自動配對，PM 只需回編號或英文 keyword。

### 6.2 六指示關鍵字

| 編號 | keyword | 意思 | Agent 動作 | status 變化 |
|:-:|:--|:--|:--|:--|
| 1 | `accept` | 接受、推進 | 該單標 done、繼續下一單 | pending_pm → done |
| 2 | `retry` | 重試 | retry counter +1（≤5） | pending_pm → retry |
| 3 | `skip` | 跳過 | 標 manual_review、繼續下一單 | pending_pm → manual_review |
| 4 | `pause` | 暫停 | Agent 結束、不接續 | 不變 |
| 5 | `abort` | 中止 | Agent 結束、JOB 退 PM | aborted |
| 6 | `custom` | 自由講話 | Agent 結束、PM 開新對話下指令 | 不變 |

### 6.3 解析規則

```
讀第一行 tokens：
  1. 找數字 1-6 或英文 keyword：
     有 → 算「指示確定」
     無 → 忽略，繼續等

  2. 配對 pending_pm 卡點：
     0 個 → 忽略（無卡點）
     1 個 → 自動配對 → 執行
     ≥2 個 → 必須含 unit_id；缺 → DM 要求補

  3. 補充說明（第一行剩餘 + 第二行起）：
     存進派工單 dm-log 區、不影響指示
```

### 6.4 DM 訊息範本（Agent 自動發）

```
🚨 [JOB-XXX 卡點] <unit_id>
<reason>

回覆下列任一：
  1  accept    接受現況、推進
  2  retry     重試這單
  3  skip      跳過、標 manual_review
  4  pause     整個 JOB 暫停
  5  abort     整個 JOB 中止
  6  custom    自由講話（你開新對話下指令）

可加註：例如「1 QL3 即可」（=accept + 補充）

詳細：jobs/JOB-XXX-progress.tsv
```

---

## 七、錯誤處理三層

### 7.1 底層腳本（auto_generate_questions.js / run_blind_eval.js）

新增三類錯誤處理（既有 429 規則保留）：

| 錯誤類別 | 處置 | 失敗後 stdout |
|:--|:--|:--|
| connection refused / DNS / TCP timeout | 退避 retry 3 次（1s/4s/9s） | `EXIT_NETWORK` |
| HTTP 5xx (502/503/504) | 同上 | `EXIT_5XX` |
| HTTP 429（既有） | 加 `--conservative`、間隔 60s、連 5 次 → crash | （既有規則） |

呼叫方 Agent 看到 `EXIT_NETWORK` / `EXIT_5XX` → 寫 status=failed → 等 5 分鐘（預設值，可由派工單 progress-config `unit_retry_wait` 覆寫）重試該 unit 一次 → 仍失敗則 progress_dm 求救（不超過 3 次）。

### 7.2 progress_dm.sh 自身失敗

DM 發不出去（網路斷、Discord 5xx、bot 被踢）：

```
重試 3 次（1s/4s/9s 退避）
仍失敗 →
  寫 status=paused_offline 到進度檔
  寫派工單 dm-log「DM failed at <ts>」
  exit 1（讓 Agent 立刻結束、避免無聲卡死）
```

PM 透過 monitor 腳本看到 `paused_offline` → 手動處理。

### 7.3 progress_next.sh 邊界

| 異常 | 處置 |
|:--|:--|
| 派工單 progress-config 解析失敗 | exit 1 + 印錯誤行號 |
| 進度檔 schema header 與 row 欄數不一致 | exit 2 + 列出問題行號 |
| 進度檔不存在 | 自動建立（從派工單 schema 宣告產生 header） |
| 全綠（無未做單位） | stdout 印 `NONE` + exit 0 |

---

## 八、試行範圍（JOB-211 DoD）

### 8.1 候選試行單位

`Sci_HanLin_L1`（自然 翰林 L1 KL4 補強）。理由：
- KL4 完備（前置素材最齊）
- 課文短、雜訊少
- 失敗成本最低

### 8.2 五條跑通路徑（缺一不可）

| # | 路徑 | 怎麼驗 | 預期結果 |
|:-:|:--|:--|:--|
| 1 | 正常 happy path | progress_next → Agent 跑出題 → append → sync | 摘要區自動更新、進度檔多一筆 done |
| 2 | 中斷重啟 | 跑到一半 `kill -9` cursor agent → 重啟 | 接續中斷處下一單，不重做 |
| 3 | DM 互動（人為製造卡點）| 故意調 CQI-P 門檻到 99% → 失敗 → progress_dm | DM 送達、PM 回 1、status pending_pm → done |
| 4 | timeout 退出 | pm_response_timeout=5 + 不回應 | 5 分後 Agent 超時退出、status 保 pending_pm、dm-log 寫 timeout |
| 5 | 底層 retry | 跑到一半關 Wi-Fi 5 秒 | Agent 退避 retry、最後成功 |

### 8.3 試行成功

跑通 5 條 → 修 spec（如有發現問題）→ 走 D3 (a)：JOB-211 結案、JOB-210 Report 末加索引行。

### 8.4 試行失敗

任一條 fail → 暫停試行 → PM 介入決定是改 spec、改實作、還是退回設計。

### 8.5 試行邊界

只做 `Sci_HanLin_L1` 一單，**不做** 階段 1 剩餘 8 單。試行成功後另開 JOB 跑剩餘。試行失敗時對階段 1 計畫無傷。

---

## 九、與既有 g5s2_results.tsv 的過渡

JOB-210 commit 已建立 `jobs/g5s2_results.tsv`（12 欄、空 header）。本 spec 的演化：

1. **JOB-211 試行階段**：
   - 不動 `jobs/g5s2_results.tsv`
   - 試行用 `jobs/JOB-211-progress.tsv`（13 欄、新格式）
   - 兩檔並存

2. **JOB-211 試行通過後**：
   - 階段 1 各 JOB（KL4 補強 9 單）依本 spec 開新進度檔（`jobs/JOB-XXX-progress.tsv`）
   - `g5s2_results.tsv` 不再寫入新 row、改為「歷史 JOB-210 留檔」（README 註記）

3. **長期**：
   - 跨 JOB 統計腳本（如 `scripts/progress_aggregate.sh`）讀所有 `jobs/JOB-*-progress.tsv` 合併

過渡期 monitor：`scripts/g5s2_tsv_monitor.sh` 升級為 `scripts/progress_monitor.sh JOB-XXX`，相容兩種 schema。

---

## 十、與 JOB-210 的關係

JOB-211 是 JOB-210 三 Agent 流水線的補強之子 JOB。**檔案層獨立**，但設計邏輯延伸 JOB-210。

具體：
- JOB-211 派工單第一段引用 JOB-210（`parent_jobs: JOB-210`）
- JOB-210 Report 末加一行「後續補強：JOB-211」指引（屬結案紀錄補完，非結案後改派工單；以新 commit 加入）
- Plan / 試行 / Report 全部在 JOB-211 內完成

---

## 十一、後續實作步驟

1. spec self-review（placeholder / contradiction / scope / ambiguity 四項檢查）
2. 使用者複核 spec
3. 交棒 writing-plans skill 產 JOB-211 派工單草稿與實作 plan
4. 使用者核可派工單草稿後 → `job_manager.js next` → 流水號 → `job_manager.js create`
5. 進入執行階段（依 JOB-211 plan）

---

## 附錄 A：CLAUDE.md §3.5 Discord 互動規範對照

DM 互動使用 chat_id `1487650833775722497`（claudebot DM）。
結案回報 chat_id `1487738477608177714`（`#eidos_派工與回報`）。
詳見 CLAUDE.md §3.5。

## 附錄 B：CLAUDE.md §3.6 互動原則對照

本 spec 的 brainstorming 過程遵循 CLAUDE.md §3.6 條款 19-22（先講邏輯目的、選項化、白話、可掃描拆問）。

## 附錄 C：不確定性聲明（標 🟡）

| 項目 | 不確定性 | 處置 |
|:--|:--|:--|
| cursor agent CLI 自身 timeout | 未證實上限 | 試行第 4 路徑跑 30 分鐘以上 timeout 場景驗證 |
| Discord 訊息延遲 | bot 收訊到 fetch 可見有延遲 | timeout 機制設下限 60 秒輪詢間隔避免漏接 |
| `auto_generate_questions.js` 既有 retry 行為 | 未實 grep 確認 | 試行前 plan Step 1 grep + sequential-thinking 分析 |
| 派工單 markdown marker 解析穩健性 | 不同 markdown 工具可能改 `<!-- -->` | 用 awk/sed 直接 grep marker 字串、不依賴 markdown parser |
| 進度檔 append 並發寫入 | 多 Agent 同時 append 的 race 風險 | 用 `flock` 鎖檔；僅在 progress_append.sh 一處實作 |
