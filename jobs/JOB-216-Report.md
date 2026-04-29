`last_updated`: 2026-04-29 23:45
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-216 Report — 四學期考古題全格式轉換（PDF / Word / JPG）

**`job_type`**：`engineering`
**`executor`**：Claude Code + Cursor agent（備援 shell 腳本）
**執行日期**：2026-04-29
**commits**：`a627f09`（Phase 1）、`c41e696`（Phase 2）、`24149a5`（Wave 6 收尾）

---

## 🎯 任務起始：為什麼做這個

### 背景

JOB-212 / JOB-213 完成了**三下**考古題的目錄重構與初步轉檔，但當時只涵蓋了國語、社會、自然三個科目，且工具只處理 PDF。

JOB-216 的**起始動機**有三層：

1. **覆蓋缺口**：四下、五下、六下共 45 組合（5 科目 × 3 出版社 × 3 學期）的考古題 PDF 從未轉換，出題時無法參考考古題內容。
2. **格式盲點**：原始檔資料夾裡除了 PDF，還混雜著 Word 檔（.doc/.docx）、JPG 圖片、iCloud 佔位符，過去一律略過。
3. **規模**：PDF 總量 2,529 份，手動處理不現實，需要批次自動化。

---

## 📋 執行全貌（三個階段）

### Phase 1 — 四下/五下/六下 PDF 全批（Wave 1–4）

**目標**：45 組合，2,529 份 PDF → MD

| Wave | 科目 | 引擎 | 組合數 | 備註 |
|:--|:--|:--|:--|:--|
| W1 | 數學 + 社會 | pdfplumber | 18 | 6 路並行 |
| W2 | 國語 | docling | 9 | 豎排文字，3 路串行批次（RAM 限制） |
| W3 | 自然 | pdfplumber + OCR | 9 | 掃描件補 ocrmac |
| W4 | 英語 | pdfplumber + OCR | 9 | 含何嘉仁出版社 |

**關鍵事件（Phase 1 執行中）**：

- **Mac 低電量 Safe Sleep**：Wave 2 執行中電池耗盡，蓋上螢幕觸發 macOS Safe Sleep。由於 Safe Sleep 把進程狀態完整寫入硬碟，接上電源後 Wave 2 從中斷點繼續完成，**0 資料遺失**。
- **Cursor agent 離線**：睡眠時網路斷線，Cursor agent（需 LLM API）無法恢復。預先建立的備援腳本 `scripts/JOB216_resume.sh` 接手 Wave 3/4。
- **引擎 flag 錯誤**：備援腳本原本寫的是 `--engine v6`，但 CLI 只接受 `pdfplumber` / `docling`。Wake-up 時從 log 發現錯誤，立刻修正並重啟全部 18 路 Wave 3/4 進程。

**Phase 1 產出**：45/45 組合完成，351 份 MD，commit `a627f09`。

---

### Phase 2 — 三下補完 + 全格式掃蕩（Wave 5–8）

**起因**：盤點原始檔後發現，「能轉的沒有全轉完」：

| 問題 | 數量 | 說明 |
|:--|:--|:--|
| 三下_數學 + 英語 PDF 從未轉 | 5 組合，~314 PDF | JOB-213 只做國語/社會/自然 |
| Word 原始檔（.doc/.docx）未轉 | 253 份 | 命名格式與 PDF 相同，但舊流程略過 |
| iCloud 佔位符（.icloud）遮蔽的 PDF | 123 個 | 實體未在本機，brctl download 觸發下載 |
| JPG 圖片 | 6 份 | ocrmac 可 OCR |
| 音檔（.mp3 / .m4a / .wav） | 27 份 | 英語聽力音檔，**無法轉文字，不處理** |

**Wave 5 — 三下_數學 + 英語（5 組合，pdfplumber）**

直接補跑，5 路並行，產出 124 份 MD，約 2 分鐘完成。

**Wave 6 — iCloud 強制下載 + 13 組合補跑**

- `brctl download` 對全部 123 個佔位符送出下載請求
- iCloud daemon 背景下載，最終 **123/123 全數下載完成**
- 比對 `_index.json` 記錄的 PDF 數 vs 實際 PDF 數，找出 13 個有新增 PDF 的組合
- 刪除這 13 個 `_index.json`，重新全量轉換（含 2 個 docling 豎排國語組合）
- pdfplumber 11 組合：1 分鐘內完成
- docling 2 組合（三下_國語_南一 96 PDF + 六下_國語_翰林 36 PDF）：約 60 + 22 分鐘

**Wave 7 — 全四學期 Word 轉 MD**

- 新建腳本 `scripts/JOB216_batch_doc_to_md.py`
- `.doc` → LibreOffice soffice headless → `.docx` → markitdown（.venv）→ `.md`
- `.docx` → markitdown 直接轉
- **首次嘗試失敗**：腳本 import markitdown 路徑錯誤，全部回傳 None。診斷後改用 subprocess 呼叫 `.venv/bin/python3.11` 解決。
- 最終結果：253 份中 234 份成功（39 .docx + 195 .doc），19 份跳過（已存在），**0 失敗**，耗時 638 秒
- 每個組合產出 `_doc_index.json` 追蹤轉換紀錄

**Wave 8 — JPG 圖片 OCR**

- 使用 `ocrmac.ocrmac.text_from_image()`（Apple Vision Framework）
- 6 份全數成功（933 / 627 / 543 / 692 / 182 / 32 chars），耗時不到 30 秒

---

## 📊 最終成果

### 產出數量

| 原始格式 | 原始檔數 | 產出 MD | 索引檔 |
|:--|:--|:--|:--|
| PDF | 3,545 份 | **815 份** | `_index.json` × 60 |
| Word（.doc / .docx） | 253 份 | **250 份** | `_doc_index.json` × 41 |
| JPG 圖片 | 6 份 | **6 份** | — |
| 音檔（.mp3 / .m4a / .wav） | 27 份 | — | 無法轉換 |
| **總計** | | **1,071 份 MD** | |

### 組合覆蓋度

| 學期 | 科目×版本 | PDF 完成 | Word 有轉換 |
|:--|:--|:--|:--|
| 三下 | 15 組合 | 15/15 ✅ | 11/15 |
| 四下 | 15 組合 | 15/15 ✅ | 13/15 |
| 五下 | 15 組合 | 15/15 ✅ | 12/15 |
| 六下 | 15 組合 | 15/15 ✅ | 5/15 |
| **全部** | **60 組合** | **60/60 ✅** | **41/60** |

> Word 未滿 60 的 19 個組合是本身就沒有 Word 原始檔（非遺漏）。

### 新建基礎設施

| 工具 / 檔案 | 用途 |
|:--|:--|
| `scripts/JOB216_progress.json` | 45 組合狀態追蹤（done / pending） |
| `scripts/JOB216_dashboard.py` | 即時進度儀表板（讀 _index.json 計算） |
| `scripts/JOB216_resume.sh` | Cursor agent 離線時的備援執行腳本 |
| `scripts/JOB216_batch_doc_to_md.py` | Word → MD 批次轉換（可重複執行） |

---

## 📂 主要異動清單

| 路徑 | 異動 | 說明 |
|:--|:--|:--|
| `knowledge/3_考古題/2_MD淬鍊文字/三下/` | 新增 | 15 組合 MD 目錄，含 _index.json |
| `knowledge/3_考古題/2_MD淬鍊文字/四下/` | 新增 + 修改 | 15 組合，Wave 6 重跑 2 組合 |
| `knowledge/3_考古題/2_MD淬鍊文字/五下/` | 新增 + 修改 | 15 組合，Wave 6 重跑 4 組合 |
| `knowledge/3_考古題/2_MD淬鍊文字/六下/` | 新增 + 修改 | 15 組合，Wave 6 重跑 7 組合 |
| `scripts/JOB216_batch_doc_to_md.py` | 新增 | Wave 7 Word 轉換腳本 |
| `scripts/JOB216_dashboard.py` | 新增 | 進度儀表板 |
| `scripts/JOB216_resume.sh` | 新增 | 備援執行腳本 |
| `knowledge/3_考古題/_manifest/JOB216_progress.json` | 新增 | 進度狀態 JSON |
| `docs/README_專案發展紀錄.md` | 修改 | 新增 JOB-216 條目於 2026-04-29 |

---

## ✅ 驗收 Checklist

| 驗收項目 | 結果 | 佐證 |
|:--|:--|:--|
| 60/60 組合有 `_index.json` | ✅ | `find 2_MD淬鍊文字/{三,四,五,六}下 -name "_index.json" \| wc -l` → 60 |
| 總 MD ≥ 800 份 | ✅ | PDF:815 + Word:250 + JPG:6 = **1,071 份** |
| iCloud 佔位符全數下載 | ✅ | `find 1_原始檔 -name "*.icloud" \| wc -l` → **0** |
| Word 轉換失敗率 = 0 | ✅ | Wave 7 log：`fail_doc_convert: 0, fail_md: 0` |
| git commit 包含三個主要節點 | ✅ | `a627f09` / `c41e696` / `24149a5` |
| `/pj_sync` 執行 | ✅ | `docs/README_專案發展紀錄.md` 已更新 |
| Discord 結案回報 | ✅ | `#eidos_派工與回報` id: `1499072243483803842` |

---

## ✅ 成果 Checklist

- [x] Report 已產出（本檔）
- [x] `node scripts/job_manager.js close JOB-216` 已執行
- [x] `docs/README_專案發展紀錄.md` 已更新 JOB-216 條目
- [x] `/pj_sync` 已執行
- [x] Discord `#eidos_派工與回報` 結案通知已送出

---

## ⚠️ 遺留問題

| 項目 | 說明 | 建議後續 |
|:--|:--|:--|
| 音檔 27 份（.mp3/.m4a/.wav）未轉 | 英語聽力測驗音檔，無文字可轉 | 如日後需要，考慮 speech-to-text（Whisper 等），目前不在範疇 |
| 三下_英語_何嘉仁 只有 6 份 MD（80 PDF） | 80 份 PDF 中大量是不同學校的同份試卷，grouping 後只生成 6 個有效群組 | 品質可接受，非 bug |
| 三下_自然_翰林 只有 9 份 MD（16 PDF）| 多為掃描件，OCR 結果較稀疏 | 已知限制，原始品質問題 |

---

## 真實回報

＄作業匯總：Token數: - | 花費: - | 使用模型: claude-sonnet-4-6（PM）/ pdfplumber + docling + markitdown（本地工具） | 執行者: Claude Code + Cursor agent
