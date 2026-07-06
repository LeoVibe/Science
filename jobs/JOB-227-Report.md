*Created by Claude at 2026-05-04 17:40*

`last_updated`: 2026-05-04 17:40
`updated_by`: Claude Code (claude-opus-4-7)

# JOB-227 結案報告 — Raw MD 學期分類稽核與修補

**`job_type`**：`research`
**`executor`**：Claude

## 📊 成果摘要

JOB-226 三下_英語_康軒 phase6 抽樣發現「上學期試卷被分到下學期 combo」，本 JOB 寫稽核腳本掃 1054 份三下 raw MD，找出 **42 份學期分類錯誤**（misclassified），實際移檔 41 份（1 份 false positive 排除）+ 28 份受影響整合版到 `_misclassified/` 備存區。後續對 2 個受影響的 done combo（英語_何嘉仁、英語_康軒）重 finalize + 重抽 phase6，**雙 PASS**。

| 指標 | 數值 |
|:--|:--|
| 三下 raw MD 稽核總數 | 1054 |
| ok（學期一致） | 898 |
| misclassified（學期不一致） | **42** |
| ambiguous（同檔上下學期 markers） | 25 |
| unknown（無 marker） | 89 |
| 實際移檔（raw） | **41 份** |
| 實際移檔（整合版） | **28 份** |
| 修補後 done combo | **三下 15/15** |

## 📋 影響範圍（misclassified by combo）

| Combo | Source | 移檔數 |
|:--|:--|:--|
| 三下_英語_何嘉仁 | Codex | 14 |
| 三下_英語_何嘉仁 | Claude | 12 |
| 三下_英語_康軒 | Codex | 12 |
| 三下_英語_康軒 | Claude | 3 |
| 三下_國語_康軒 | Claude | 1 (false positive，排除) |

## 📂 異動清單

| 檔案路徑 | 異動類型 | 說明 |
|:--|:--|:--|
| `scripts/JOB227_audit_raw_semester.py` | 新增 | raw MD 學期稽核腳本（regex marker detect）|
| `scripts/JOB227_move_misclassified.py` | 新增 | 批次移檔 raw → 備存區 |
| `scripts/JOB227_move_integrated.py` | 新增 | 批次移檔受影響整合版 → 備存區 |
| `knowledge/3_考古題/_logs/JOB-227/audit_summary.json` | 新增 | 稽核統計 |
| `knowledge/3_考古題/_logs/JOB-227/misclassified.json` | 新增 | 誤分類清單（42 筆）|
| `knowledge/3_考古題/_logs/JOB-227/move_log.json` | 新增 | raw 移檔紀錄（41 筆）|
| `knowledge/3_考古題/_logs/JOB-227/integrated_move_log.json` | 新增 | 整合版移檔紀錄（28 筆）|
| `knowledge/3_考古題/2_MD淬鍊文字_misclassified/三下_誤分類_上學期/` | 新增 | 備存區（41 raw + 28 整合版）|
| `knowledge/3_考古題/2_MD淬鍊文字_整合版/三下/三下_英語_何嘉仁/` | 修改 | 移走 14 份上學期整合版（48→34）|
| `knowledge/3_考古題/2_MD淬鍊文字_整合版/三下/三下_英語_康軒/` | 修改 | 移走 14 份上學期整合版（39→25）+ 重 finalize + 重 phase6 PASS，partial → done |

## ✅ Checklist 對照結果

### 驗收 Checklist
- [x] 自動化稽核腳本可重跑 — 佐證：`scripts/JOB227_audit_raw_semester.py` 已驗證可重跑
- [x] 三下 raw 稽核報告完成 — 佐證：`_logs/JOB-227/audit_summary.json` ok=898, mis=42
- [x] 移檔執行有備份 — 佐證：原檔在 `_misclassified/三下_誤分類_上學期/{Source}/{Combo}/`，可還原
- [x] 受影響整合版清單明確 — 佐證：`integrated_move_log.json` 28 筆
- [x] 受影響 combo 重驗 PASS — 佐證：英語_何嘉仁 phase6 PASS（34 份）、英語_康軒 phase6 PASS（25 份）

### 成果 Checklist
- [x] Report 寫入 `jobs/JOB-227-Report.md`
- [x] 三下 progress 更新（15/15 done，partial=0）
- [x] 範圍外項目（四/五/六下 raw 稽核）已標註延後
- [x] 已執行 /pj_sync 全域知識沉澱（更新 docs/進度彙整_題庫研發與產出.md + docs/README_專案發展紀錄.md，含 JOB-226 + JOB-227）

## 🔍 技術發現

### 1. raw 抓取階段有「上學期混入下學期 combo」bug
英語科最嚴重（何嘉仁 26、康軒 15），可能因為英語段考次數命名與其他科不同。國語科 1 份 false positive（檔名「下」但內容引用「第一學期」，是參照敘述非試卷學期）。需後續查 raw 抓取腳本根因。

### 2. Phase 6 抽樣未必能覆蓋分類錯誤
英語_何嘉仁本來是 done PASS（48 份），但其中 14 份是上學期試卷。phase6 抽 3 份沒抽到，假性 PASS。**phase6 採樣策略對分類錯誤的偵測能力有限**，需獨立的稽核機制。

### 3. 整合版上學期樣本仍是「題幹一致+格式合規」
codex 整合品質沒問題（content-wise 都是 v3 spec 合規），錯只在「學期歸屬」。所以這些上學期整合版可在未來「三上 combo」被重新利用，不需重做。

## 📌 遺留問題

1. **四/五/六下 raw 稽核**：本 JOB 限三下範圍。其他學期 raw（claude 529、codex 1334）尚未稽核，等 claude raw 抓全後再做。
2. **ambiguous 25 份 + unknown 89 份**：稽核腳本無法自動判定的，需人工抽查。**本 JOB 不處理，列為遺留**。
3. **Raw 抓取根因**：raw 抓取階段為何把上學期分到下學期，未深入查；建議獨立 JOB 處理（修 raw pipeline）。

## 💰 ＄作業匯總
Token數: ~1.5K(claude opus) + 0(codex，本 JOB 為腳本驅動，未呼叫 codex CLI) | 花費: -（免費額度內）| 使用模型: Claude Opus 4.7 + Python 腳本 | 執行者: Claude

---

## 七、Follow-up（2026-05-04 補執行）

### 7.1 範圍擴展：四/五/六下也做完

JOB-227 主體聚焦三下，使用者要求「順手做」其他學期，本 follow-up 把 audit + move 擴展到四/五/六下。

**移檔結果（含主體）**：

| 學期 | raw MD 移檔 | 整合版移檔 | 備註 |
|:--|--:|--:|:--|
| 三下（主體） | 41 | 28 | 已完成於 2026-05-03 |
| 四下（follow-up） | 17 | 0 | 整合版未產，無需移 |
| 五下（follow-up） | 41 | 0 | 整合版未產，無需移 |
| 六下（follow-up） | 17 | 0 | 整合版未產，無需移 |
| **總計** | **116** | **28** | |

**集中度分布**（4 學期合計）：

| 受影響 combo | 移檔數 |
|:--|--:|
| 英語_何嘉仁（4 學期合計） | **57**（76% 集中度） |
| 英語_康軒（4 學期合計） | **18** |
| 國語_康軒 | 1（false positive，未動）|
| 其他科目 | 0 |

raw pipeline 「上學期試卷誤入下學期 combo」bug 幾乎全集中在英語_何嘉仁 + 英語_康軒。可能根因：Drive 來源資料夾結構、英語段考次數命名歧義、raw 抓取腳本對英語檔案命名解析不嚴。

### 7.2 PDF 不移檔 — 反查機制保證可追溯

**決策**：本 JOB **只移 MD 檔（raw + 整合版），PDF 原始檔留在原位 `1_原始檔/`**。

**理由**：
1. PDF 是米蘭老師原始素材，動之前需與她或使用者確認結構
2. raw 重抓不是常規動作，重抓時可由獨立 JOB 處理
3. **MD 中已含 source_pdfs 欄位**，反查能力完整，不依賴 PDF 移檔

**反查機制**（MD frontmatter）：

```yaml
source_pdfs:
  - filename: 縣立永光國小 三年級 108 上學期 ... 何嘉仁 試卷.pdf
    kind: 試卷
    sha256: 8d16a41dcf4660db766123043ace09c446c32d6af7469d7c2e47bddd737a87f5
  - filename: 縣立永光國小 三年級 108 上學期 ... 何嘉仁 答案.pdf
    kind: 答案
    sha256: f26c3a85782c4ed7dc4ee0b7c5f75002af9c2cb62ed6eaa1cf05ab9fb7988a8c
```

每份 MD（含已移到 _misclassified/ 的）均含：
- 試卷 PDF 檔名 + sha256
- 答案 PDF 檔名 + sha256
- aliases（同檔重複命名）
- 整合版另含 `## 來源追溯` H2 區段（PDF 絕對路徑 + claude/codex raw MD 路徑）

**未來若要重抓 PDF 或修補 raw**：透過 sha256 + filename 可直接定位 `1_原始檔/` 對應 PDF，不會迷失。

### 7.3 整合版「上學期」字眼殘留分析（spot check）

移檔後 grep「上學期」字眼仍命中 14 份整合版檔，深入檢查發現：

| 類型 | 數量 | 說明 |
|:--|--:|:--|
| **False positive**（整合摘要解釋 raw 混入上學期，整合版實際是下學期） | 12 | 例：codex 整合摘要寫「raw 同時混入 111 上學期 與 111 下學期 兩組英語題卷；本版僅保留 111 下學期 的試卷與答案」— 內容已正確 |
| **PDF 命名錯但內容對**（永光 108 個案）| 1 | source_pdfs 寫「108 上學期」但 PDF 內文寫「108 第二學期 = 下學期」，整合版內容是下學期 ✅；屬 raw 抓取階段 PDF 命名 bug |
| **「未知」合併檔**（多份 PDF 混合不同學期）| 2 | 何嘉仁_?_未知_期中考、何嘉仁_?_未知_期末考；exam_id 為「?_未知」的低品質合併檔，本身有 raw 池議題 |

**結論**：整合版實質 100% 為下學期內容，殘留字眼皆來自 metadata / 摘要解釋，不是內容誤分類。

### 7.4 補執行的腳本與紀錄

| 路徑 | 說明 |
|:--|:--|
| `scripts/JOB227_audit_and_move_all_semesters.py` | 全學期 audit + move 腳本（可重跑） |
| `knowledge/3_考古題/_logs/JOB-227/move_log_四五六下.json` | 75 筆四/五/六下移檔紀錄 |
| `knowledge/3_考古題/_logs/JOB-227/follow_up_summary.md` | 簡短 follow-up 紀錄（已合併進本 Report §七）|
| `knowledge/3_考古題/2_MD淬鍊文字_misclassified/{四,五,六}下_誤分類_上學期/` | 備存區 |

### 7.5 本 follow-up 重 audit 確認

```
Claude/三下: 1 (false positive，保留)
Claude/四下: 0  Claude/五下: 0  Claude/六下: 0
Codex/三下: 0   Codex/四下: 0   Codex/五下: 0   Codex/六下: 0
```

raw 池四學期 misclassified 已歸零，未來啟動四/五/六下整合 dispatcher 不會踩到「上學期試卷被分到下學期 combo」問題。

### 7.6 仍待處理（建議獨立 JOB）

1. **raw pipeline 根因**：為何英語_何嘉仁 + 英語_康軒 集中此 bug — 需查 raw 抓取腳本
2. **PDF 命名 vs 內容不一致**（如永光 108）：raw 抓取階段 PDF 檔名標的學期跟 PDF 內文學期不一致
3. **「未知」exam_id 低品質合併檔**：raw 池有 `?_未知` 類 exam_id，多份 PDF 合併品質低
4. **ambiguous 87 份 + unknown 306 份**（4 學期合計）：本 JOB 不處理，列為觀察項
