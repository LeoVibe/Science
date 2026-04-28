*Created by AG at 2026-04-28*

`last_updated`: 2026-04-28
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-213-AG-考古題目錄重構-G→學期層-三下社會科初轉檔

**`job_type`**：`mixed`（Phase A/B = `docs_ops` + `engineering`；Phase C = `research` 轉檔）

## 📌 任務背景

`knowledge/3_考古題/` 底下的 `1_原始檔/` 和 `2_MD淬鍊文字/` 目前以年級層（G1~G6）為頂層目錄，
導致「三上」與「三下」的素材混放在同一 G3/ 下，不易精準取用。
本任務將兩個目錄的頂層改為學期層（一上/一下/…/六下，共 12 個），
並同步更新相關腳本與文件，最後執行三下社會科 PDF→MD 首批轉檔。

## 🎯 任務目標

完成後：
1. `1_原始檔/` 頂層為 12 個學期目錄，無 G{n}/ 年級目錄存在
2. `2_MD淬鍊文字/` 頂層同樣為 12 個學期目錄
3. 所有健體相關目錄已刪除（科目不在範圍內）
4. `job207_distill_to_md.py` 路徑/參數配合新結構正常運作
5. `knowledge/3_考古題/README.md` §二目錄結構與實際一致
6. G3 三下社會科（翰林53+3、康軒94+8）已完成 MD 淬鍊，`_index.json` 已更新

## 🚧 任務邊界

本次任務只做：
- Phase A：健體目錄刪除 + 12學期目錄建立 + 現有目錄 mv
- Phase B：`job207_distill_to_md.py` 路徑更新（`--semester`/`--subject` 新參數）、README §二更新、5個 `_index.json` path 欄位更新
- Phase C：G3 三下社會科 翰林+康軒 PDF→MD 轉檔

本次任務不做：
- 其他科目/年級的 MD 轉檔（範圍外）
- 修改 `question/` 題庫 JSON
- JOB-212 Phase D2（國語年度素材庫拆解，已遞延）

## 📖 執行步驟

### Phase A：目錄重構

**A1（stop-and-confirm）** 列出健體目錄讓使用者確認，再 rm -rf：
```bash
find knowledge/3_考古題/1_原始檔 -type d -name "*健體*" | sort
# 確認後執行：
find knowledge/3_考古題/1_原始檔 -type d -name "*健體*" -exec rm -rf {} +
```

**A2** 建立 12 個學期空殼目錄（1_原始檔 + 2_MD淬鍊文字）：
```bash
for sem in 一上 一下 二上 二下 三上 三下 四上 四下 五上 五下 六上 六下; do
  mkdir -p knowledge/3_考古題/1_原始檔/$sem
  mkdir -p knowledge/3_考古題/2_MD淬鍊文字/$sem
done
```

**A3** 搬移 1_原始檔 各科目目錄（G{n}/{學期}_{科目}_{版本}/ → {學期}/{科目}_{版本}/）：
```bash
# 對每個 G1~G6 目錄下的子目錄：mv Gn/{學期}_{...} {學期}/
```

**A4** 搬移 2_MD淬鍊文字 各目錄（G3/三下_社會 → 三下/社會）：
```bash
# G3/三下_國語 → 三下/國語，G3/三下_數學 → 三下/數學，G3/三下_社會 → 三下/社會
# G4/四下_國語 → 四下/國語，G4/四下_社會 → 四下/社會
```

**A5** 刪除空的 G1~G6 目錄：
```bash
for g in G1 G2 G3 G4 G5 G6; do
  rmdir knowledge/3_考古題/1_原始檔/$g 2>/dev/null || true
  rmdir knowledge/3_考古題/2_MD淬鍊文字/$g 2>/dev/null || true
done
```

### Phase B：文件與腳本更新

**B1** 更新 `scripts/job207_distill_to_md.py`：
- `1_原始檔/G{n}/{sem_subj}_{pub}/` → `1_原始檔/{sem}/{subj}_{pub}/`
- `2_MD淬鍊文字/G{n}/{sem_subj}/` → `2_MD淬鍊文字/{sem}/{subj}/`
- CLI 參數：`--grade`/`--semester_subject` → `--semester`（例：三下）/`--subject`（例：社會）

**B2** 更新 `knowledge/3_考古題/README.md` §二（目錄結構示意圖）

**B3** 更新 5 個 `_index.json` 的 `path` 欄位：
- `2_MD淬鍊文字/三下/國語/_index.json`
- `2_MD淬鍊文字/三下/數學/_index.json`
- `2_MD淬鍊文字/三下/社會/_index.json`
- `2_MD淬鍊文字/四下/國語/_index.json`
- `2_MD淬鍊文字/四下/社會/_index.json`

### Phase C：G3 三下社會科轉檔

**C1** 煙霧測試（1份 PDF 翰林）：
```bash
cd scripts
python3 job207_distill_to_md.py --semester 三下 --subject 社會 --publisher 翰林 --smoke-test
```

**C2** 翰林全批（53 PDF + 3 DOC）

**C3** 抽樣檢查翰林輸出（head -50 看 3 份 MD）

**C4** 康軒全批（94 PDF + 8 DOC）

**C5** 抽樣檢查康軒輸出

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `knowledge/3_考古題/README.md` | 目錄結構規範、SOP |
| `scripts/job207_distill_to_md.py` | PDF→MD 轉檔腳本 |
| `knowledge/3_考古題/2_MD淬鍊文字/三下/社會/_index.json` | 轉後索引（Phase B3/C 寫入目標） |

## ✅ 啟動 Checklist (Pre-Flight)

- [x] 已讀取：`knowledge/3_考古題/README.md`
- [x] 已確認 1_原始檔 現況（G1~G6，共 ~165 個子目錄）
- [x] 已確認 2_MD淬鍊文字 現況（G3/G4，共 5 個子目錄）
- [x] 無 LLM API 呼叫：Phase A/B 為本地 shell 操作；Phase C 使用 pdfplumber/markitdown（本地）
- [x] 已確認執行模型：claude-sonnet-4-6（本地文件操作）
- [x] 已閱讀「任務邊界」

## ✅ 驗收 Checklist (Acceptance)

- [ ] `ls knowledge/3_考古題/1_原始檔/` 只有 12 個學期目錄，無 G{n}
- [ ] `find *健體*` = 0
- [ ] `ls knowledge/3_考古題/2_MD淬鍊文字/` 只有學期目錄，無 G{n}
- [ ] `python3 -m py_compile scripts/job207_distill_to_md.py` 無錯誤
- [ ] 5 個 `_index.json` path 欄位已更新至新路徑
- [ ] 三下社會 翰林 MD 輸出 ≥ 50 份
- [ ] 三下社會 康軒 MD 輸出 ≥ 80 份

## ✅ 成果 Checklist (Deliverables)

- [ ] 產出 `jobs/JOB-213-Report.md`，異動清單已列出所有實際修改的檔案路徑
- [ ] 執行 `node scripts/job_manager.js close JOB-213`
- [ ] 執行 `/pj_sync`
- [ ] Discord 結案回報至 `#eidos_派工與回報`

## 💰 花費回報

＄作業匯總：Token數:- | 花費: $- | 使用模型: claude-sonnet-4-6 | 執行者: Claude Code
