*Created by Codex at 2026-05-01 08:05*

# JOB-223 Report - 三四五六下考古題全格式重轉 MD

## 結論

JOB-223 的主轉檔批次已完成：三下、四下、五下、六下共 `60/60` 個 combo 全部轉到 `knowledge/3_考古題/2_MD淬鍊文字_Codex/`，目前 `pending=0`、`blocked=0`。最後驗證後，正式輸出為 `1834` 份已索引 `.md`、`60` 份 `_index.json`、`41` 份 `_doc_index.json`。

與 Claude 版相比，Codex 版在完整度、索引路徑正確性、截斷移除、空白 code block 消除、metadata 乾淨度上明顯較好；Claude 版仍有部分人工結構化可讀性優勢，但目前量化品質風險較高。

## 輸出位置

- 來源根目錄：`knowledge/3_考古題/1_原始檔/`
- Codex 輸出根目錄：`knowledge/3_考古題/2_MD淬鍊文字_Codex/`
- Manifest / log：`knowledge/3_考古題/_manifest/`

## 本次新增或修改腳本

- `scripts/JOB223_build_manifest.py`
- `scripts/JOB223_distill_to_md.py`
- `scripts/JOB223_dashboard.py`
- `scripts/JOB223_run_batch.py`
- `scripts/JOB223_audit_icloud.py`
- `scripts/JOB223_materialize_icloud.py`

## 最終驗證數字

| 指標 | 結果 |
|:--|:--|
| combo 狀態 | `done=60`, `running=0`, `pending=0`, `blocked=0` |
| dry-run 待跑 combo | `0` |
| Codex `.md` | `1834` |
| 已索引 `.md` | `1834` |
| `_index.json` | `60` |
| `_doc_index.json` | `41` |
| unindexed stale md | `0` |
| indexed missing output | `0` |
| `_index.json.path` 指錯目錄 | `0` |
| 截斷標記檔案 | `0` |
| 空 fenced code block 檔案 | `0` |
| 空白原文 heading 檔案 | `0` |
| iCloud placeholder | `0` |

各學期產出：

| 學期 | combo | md | `_index.json` | `_doc_index.json` |
|:--|--:|--:|--:|--:|
| 三下 | 15/15 | 500 | 15 | 11 |
| 四下 | 15/15 | 479 | 15 | 12 |
| 五下 | 15/15 | 487 | 15 | 14 |
| 六下 | 15/15 | 368 | 15 | 4 |

## Claude vs Codex 量化比較

| 指標 | Claude 版 | Codex 版 |
|:--|--:|--:|
| `.md` 檔數 | 1083 | 1834 |
| `_index.json` | 60 | 60 |
| `_doc_index.json` | 41 | 41 |
| index entries | 815 | 1834 |
| index path 指錯目錄 | 60 | 0 |
| missing indexed outputs | 0 | 0 |
| unknown year entries | 105 | 5 |
| unknown school entries | 106 | 72 |
| suspicious school entries | 185 | 3 |
| truncation marker md | 65 | 0 |
| empty fenced block md | 269 | 0 |

## Codex 版優點

- 正式輸出與 `_index.json` 完全對齊，沒有未索引殘留檔，也沒有索引指到不存在檔案。
- 不再產生 `僅顯示前 8000` 或截斷標記，適合後續全文檢索與 LLM 使用。
- `_index.json.path` 全部指向 `2_MD淬鍊文字_Codex`，修正 Claude 版 path 指到舊目錄的問題。
- 國語直排 PDF 已使用 `pymupdf_vertical` 優先策略，`vertical_spacing_noise` 最終只剩 `3` 筆 group flag。
- Word 來源有 `_doc_index.json` 可追蹤，每筆含 source path、sha256、status、engine、out_md、quality flags。

## 已知限制與需複核項

- 本次依使用者指示不做圖片 OCR；JPG、音訊、影音不進主轉檔，只在 manifest/report 中保留跳過脈絡。
- 有 `321` 個 group 的 `total_non_ws_chars=0`，主要來自掃描 PDF、空答案、空試卷或舊 DOC 抽取失敗；這些已用 quality flags 標記，不阻塞主批次。
- group quality flags 前幾名為：`empty_extract=752`、`answer_empty=716`、`paper_empty=347`、`extract_error=104`、`duplicate_source_merged=77`、`missing_answer=77`。
- Word 來源共 `255` 筆，`ok=61`、`issue=194`；其中多數 issue 是 legacy `.doc` 抽取失敗。若後續要提升舊 Word 成功率，建議另開二階段任務測試 `antiword`、`textutil`、`libreoffice` profile 隔離或其他 DOC parser。

issue 較高、建議優先抽樣複核的 combo：

| combo | md | issue groups |
|:--|--:|--:|
| 三下/三下_自然_康軒 | 55 | 27 |
| 四下/四下_社會_康軒 | 43 | 27 |
| 三下/三下_國語_南一 | 28 | 26 |
| 三下/三下_國語_翰林 | 29 | 25 |
| 五下/五下_數學_南一 | 60 | 25 |
| 三下/三下_數學_南一 | 55 | 24 |
| 三下/三下_社會_康軒 | 51 | 24 |
| 三下/三下_社會_南一 | 24 | 23 |
| 四下/四下_數學_南一 | 55 | 23 |
| 三下/三下_英語_何嘉仁 | 42 | 22 |

## 驗證指令摘要

已執行：

```bash
python3.11 scripts/JOB223_dashboard.py --since-minutes 1800
python3.11 scripts/JOB223_run_batch.py --mode all-pending --sort size-asc --dry-run
python3.11 scripts/JOB223_audit_icloud.py
```

驗證結果：

```text
done=60 running=0 pending=0 blocked=0
Selected 0 combos for mode=all-pending sort=size-asc
placeholder_count=0
all_md=1834 indexed_md=1834 extra_unindexed=0 missing_indexed=0
path_bad=0 truncation_marker_files=0 empty_fenced_block_files=0 empty_original_heading_files=0
```

## 後續建議

1. 若目標是全文品質最大化，下一步建議開「legacy DOC 二階段補強」小任務，只針對 `_doc_index.json` 中 `status=issue` 的 `194` 筆 Word 來源重試。
2. 若目標是學習/出題應用，建議先接受目前 Codex 版作為主文本，因為索引完整、無截斷、path 正確，後續 pipeline 會比 Claude 版穩。
3. 若要做最終人工驗收，建議從上表 issue 較高的 10 個 combo 抽樣，比對原 PDF 影像與 MD 文字是否足夠可用。
