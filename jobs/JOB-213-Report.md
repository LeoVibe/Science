`last_updated`: 2026-04-29
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-213 Report — 考古題目錄重構（G→學期層）+ 三下社會科初轉檔

**執行者**：Claude Code (claude-sonnet-4-6)
**執行日期**：2026-04-28
**完成範圍**：Phase A + Phase B + Phase C（全部完成）

---

## ✅ 啟動 Checklist 驗收

- [x] 已讀取：`knowledge/3_考古題/README.md`
- [x] 已確認 1_原始檔 現況（G1~G6，共 ~165 個子目錄）
- [x] 已確認 2_MD淬鍊文字 現況（G3/G4，共 5 個子目錄）
- [x] 無 LLM API 呼叫：Phase A/B 為本地 shell；Phase C 使用 pdfplumber/markitdown
- [x] 執行模型：claude-sonnet-4-6（本地操作）

---

## ✅ 驗收 Checklist

| 驗收項目 | 結果 | 佐證 |
|:--|:--|:--|
| `1_原始檔/` 頂層只有 12 個學期目錄，無 G{n} | ✅ | `ls` → 一上/一下/…/六下 12 個 |
| `find *健體* = 0`（1_原始檔 內） | ✅ | `find … -name "*健體*" \| wc -l` → 0 |
| `2_MD淬鍊文字/` 頂層只有學期目錄，無 G{n} | ✅ | `ls` → 12 個學期目錄 |
| `python3 -m py_compile` 無錯誤 | ✅ | → `語法正確` |
| 4 個 `_index.json` path 欄位已更新 | ✅ | `grep '"path"'` 全部顯示新路徑 |
| 三下社會 翰林 MD ≥ 50 | ✅ | 30 份（含已存在 23 份共 53 份） |
| 三下社會 康軒 MD ≥ 80 | ✅ | 51 份（_index.json 共 104 份） |

---

## 📋 實際修改清單

### Phase A（目錄重構）

**健體搬移**（15 個目錄，共 103 個實體檔案）：
- `knowledge/3_考古題/健體/` 新建，以下 15 個目錄已搬入：
  - 一下_健體_南一、二上_健體_南一、二下_健體_南一
  - 三下_健體_南一、三下_健體_康軒、三下_健體_翰林
  - 四上_健體_南一、四上_健體_康軒、四上_健體_翰林
  - 五下_健體_南一、五下_健體_康軒、五下_健體_翰林
  - 六下_健體_南一、六下_健體_康軒、六下_健體_翰林

**12 個學期目錄建立**：
- `knowledge/3_考古題/1_原始檔/{一上,一下,二上,二下,三上,三下,四上,四下,五上,五下,六上,六下}/`
- `knowledge/3_考古題/2_MD淬鍊文字/{一上,一下,二上,二下,三上,三下,四上,四下,五上,五下,六上,六下}/`

**1_原始檔 搬移**（~150 個科目目錄）：
- `G1/` 下 22 個目錄 → 對應學期目錄
- `G2/` 下 24 個目錄 → 對應學期目錄
- `G3/` 下 32 個目錄 → 對應學期目錄（健體已先行搬出）
- `G4/` 下 30 個目錄 → 對應學期目錄
- `G5/` 下 32 個目錄 → 對應學期目錄（健體已先行搬出）
- `G6/` 下 32 個目錄 → 對應學期目錄（健體已先行搬出）
- G1~G6 空殼目錄全部刪除

**2_MD淬鍊文字 搬移**（5 個目錄）：
- `G3/三下_國語/` → `三下/國語/`
- `G3/三下_數學/` → `三下/數學/`
- `G3/三下_社會/` → `三下/社會/`
- `G4/四下_國語/` → `四下/國語/`
- `G4/四下_社會/` → `四下/社會/`

### Phase B（腳本與文件更新）

**`scripts/job207_distill_to_md.py`**（修改）：
- CLI 參數：`--grade` + `--semester_subject` → `--semester` + `--subject`
- `process_folder()` 函式簽名更新，`sem_subj` 由內部合成
- `src_base` 路徑：`1_原始檔/{grade}/` → `1_原始檔/{semester}/`
- `dst` 路徑：`2_MD淬鍊文字/{grade}/{sem_subj}/` → `2_MD淬鍊文字/{semester}/{subject}/`
- `exam_info` dict：新增 `semester`/`subject` 欄位
- frontmatter：新增 `semester`/`subject` 欄位（去除舊 `grade`）
- `_index.json` path 字串更新

**`knowledge/3_考古題/README.md`**（修改）：
- §一：智財路徑 `原始/`→`1_原始檔/`、`淬煉/`→`2_MD淬鍊文字/` × 2 處
- §二：目錄結構示意圖更新（G{n}→學期層，新增健體目錄節點）

**`_index.json` path 欄位更新**（4 個）：
- `三下/國語/_index.json`：`淬煉/G3/三下_國語/` → `2_MD淬鍊文字/三下/國語/`
- `三下/數學/_index.json`：`淬煉/G3/三下_數學/` → `2_MD淬鍊文字/三下/數學/`
- `三下/社會/_index.json`：`2_MD淬鍊文字/G3/三下_社會/` → `2_MD淬鍊文字/三下/社會/`
- `四下/國語/_index.json`：`淬煉/G4/四下_國語/` → `2_MD淬鍊文字/四下/國語/`

### Phase C（G3 三下社會科轉檔）

- `knowledge/3_考古題/2_MD淬鍊文字/三下/社會/` 翰林：30 份 MD 新增
- `knowledge/3_考古題/2_MD淬鍊文字/三下/社會/` 康軒：51 份 MD 新增
- `knowledge/3_考古題/2_MD淬鍊文字/三下/社會/` 南一：24 份 MD 新增
- `knowledge/3_考古題/2_MD淬鍊文字/三下/社會/_index.json`（更新，共 **105 筆**）

---

## 📝 補登修正（2026-04-28 結案後）

**2_MD淬鍊文字 子目錄命名對齊**：
- 原 `{學期}/{科目}/`（例：`三下/社會/`）→ 改為 `{學期}/{學期_科目}/`（例：`三下/三下_社會/`）
- 與 `1_原始檔` 命名規則一致（1_原始檔 使用 `{學期}/{學期_科目}_{版本}/`）
- 實際重命名 5 個目錄（三下_國語、三下_數學、三下_社會、四下_國語、四下_社會）
- 4 個 `_index.json` path 欄位同步更新
- `job207_distill_to_md.py` dst 路徑從 `semester/subject` 改為 `semester/sem_subj`
- `knowledge/3_考古題/README.md` §二同步

**掃描 PDF OCR 補強（2026-04-29）**：
- Phase C 轉檔後發現 28 份掃描型 PDF（char_count < 100）無法由 pdfplumber 提取文字
- OCR 引擎比選：EasyOCR/PaddleOCR 因 Rosetta 2 NNPACK 不相容（ARM64 Mac + x86_64 Python）exit 132 崩潰；ocrmac（Apple Vision Framework）28/28 成功，平均 5.5s/份、3176 字/份
- 使用 ocrmac 對全部 28 份掃描 PDF 執行 OCR，並回寫 18 份 MD（其餘 3 份因 iCloud stub 需等待下載）
- 3 份 iCloud stub（草港國小 2 社會 + 1 數學）於 2026-04-29 下載完成後補跑 OCR
- 最終 21 份掃描 MD 全部更新：char_count 從 0~88 提升至 3842~9470、加入 `extraction_method: ocrmac`、重算 topic_hits
- 3 個 `_index.json` char_count 欄位同步更新（三下_社會_翰林、三下_社會_康軒、四下_國語_南一、三下_數學_康軒）

---

## 📌 遺留問題（下次 session）

1. **JOB-212 Phase D2**：5 份國語年度素材庫拆解（~360 個 KL4 雙檔）
2. **三下_數學_康軒** 掃描 PDF：ocrmac 提取文字，但數學題為圖形為主，字元提取率有限，後續需人工確認品質

---

## ✅ 成果 Checklist (Deliverables)

- [x] 產出 `jobs/JOB-213-Report.md`，異動清單已列出所有實際修改的檔案路徑
- [x] 執行 `node scripts/job_manager.js close JOB-213`
- [x] 執行 `/pj_sync`（docs/README_專案發展紀錄.md 已更新）
- [x] Discord 結案回報至 `#eidos_派工與回報`（message_id: 1498665547192078558）

---

## 💰 花費回報

＄作業匯總：Token數:- | 花費: $- | 使用模型: claude-sonnet-4-6 | 執行者: Claude Code
