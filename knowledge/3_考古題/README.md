# 考古 — 規範與來源索引 (`knowledge/3_考古題/`)

`last_updated`: 2026-04-21
`updated_by`: Claude Code (claude-opus-4-7)

**本目錄前身**：`knowledge/3_考古題/`（2026-04-11 JOB-172 建立）。
2026-04-21 JOB-207 重構為 `knowledge/3_考古題/`，導入**三軌結構**（原始 / 淬煉 / 索引）與新存檔原則。

>已經下載完成的檔案 會視硬碟狀況，搬至雲端硬碟去，
>若發現學期與學科紀錄中，已經下載考古題完成，但實體目錄卻沒有檔案
>請提示任務發起人，如何取得相關檔案。

---

## 一、鐵律（2026-04-21 修訂版）

1. **KL4 考古題必須來自真實考卷**，嚴禁自行編造假裝為考古題。
2. 每道考古題須標註來源（學校名稱 + 學年度 + 考試類型，或可驗證之 URL）。
3. **出題卡點（Production Gate）**：每課需同時滿足：
   - **α 路徑**（有課文）：≥ 10 道真實考古題 + ≥ 2 個不同外部來源
   - **β+ 路徑**（無課文）：15 分鐘努力上限，多多益善；警戒值 ≥ 10 道 + ≥ 3 個不同外部來源
   - （詳見 `knowledge/5_學習議題研究/無課文情境的考古題補償研究法.md`）
4. 不足門檻時，須在 KL4 檔案中明確標註不足事實與已嘗試之搜尋來源，不得以自編題充數，**且該課禁止出題**。
5. **考古題的定位：參考座標，非抄寫範本**
   - **嚴禁原封不動照抄**。題幹換字、選項重排若核心結構邏輯未改變仍視為抄襲。
   - 正確做法：以考古題為座標，理解知識點與誘答機制，基於對課文/發展綱要的深度理解**原創設計**新題。
   - 自有題庫每一道題必須能通過檢驗：「把考古題原檔刪除後，這道題依然站得住腳」。

6. **智財保護與使用邊界**：
   - 考古題原檔**僅供內部研究參考**，嚴禁原文上架、公開散佈或提供第三方使用。
   - 智財目錄（`knowledge/3_考古題/1_原始檔/` + `knowledge/3_考古題/2_MD淬鍊文字/**/*.md`）已列入 `.gitignore`，**禁止上傳至 GitHub**。
   - 但 `_manifest/`（Drive/PDF 清單 metadata）與 `_index.json`（目錄索引）**允許追蹤**（不含原題內容）。

7. **留存政策（2026-04-21 修訂）**：
   - ⭐ **所有下載的原始檔永久保存**（PDF、Word、HTML 等）——修訂舊版「解析完成即刪」政策。
   - 理由：原檔具不可重現性（外部來源可能移除）+ 重複萃取需要時可重跑 + 符合學術誠信。
   - 原檔位置：`knowledge/3_考古題/1_原始檔/`
   - 原檔副本結構：`knowledge/3_考古題/2_MD淬鍊文字/`（結構化 MD）+ `_index.json`（索引）
   - 三軌共存；不因 MD 生成而刪 PDF。

8. **新三軌結構**（原始 / 淬煉 / 索引）：
   - **原始**：PDF / Word 不改動，永久保存
   - **淬煉**：每份 PDF 對應一份 MD（含 frontmatter metadata + 結構化題目 + 誘答分析）
   - **索引**：每資料夾一份 `_index.json`（該資料夾所有 MD 的 metadata 聚合 + 主題命中矩陣）
   - 程式查詢用 `_index.json`（快）；人類閱讀用 MD（友善）；追溯用原始（權威）

---

## 二、目錄結構

```
knowledge/3_考古題/
├── README.md                                    ← 本文件
├── _manifest/                                   ← 全站索引（進 git）
│   ├── drive_manifest_G1_G6.json                ← 704 Drive metadata
│   ├── pdf_manifest_G1_G6.json                  ← 11,704 PDF metadata
│   ├── tcool_exam_index.json                    ← JOB-172 收集的 708 份 tcool 考卷 ID
│   ├── download_report_JOB172.json              ← JOB-172 下載試跑報告
│   ├── list_progress.log                        ← JOB-207 listing 進度記錄
│   └── README_米蘭老師_G1_G6_Drive_清單.md       ← 米蘭老師 Drive 完整清單（人類可讀版）
├── 1_原始檔/                                    ← PDF/Word（不進 git；按出版社分資料夾）
│   └── {學期}/                                  (例：三上、三下…，共 12 個)
│       └── {學期_科目}_{版本}/                   (例：三下_社會_翰林、三下_社會_康軒)
│           ├── (米蘭老師格式，含空格) *.pdf/.doc  ← 從 Google Drive 直接下載的原始檔名
│           └── (已正規化格式) {版本}_{年度}_{學校}_{考試類型}_{試卷|答案}.pdf
├── 2_MD淬鍊文字/                                ← MD + _index.json（與 1_原始檔 三層結構一致）
│   └── {學期}/                                  (例：三上、三下…，共 12 個)
│       └── {學期_科目}_{版本}/                   (例：三下_社會_翰林；按出版社分目錄，與 1_原始檔 同名)
│           ├── _index.json                      ← 進 git（單一出版社）
│           └── {版本}_{年度}_{學校}_{考試類型}.md   ← 不進 git
└── 健體/                                        ← 健體科目獨立存放（不轉檔、不納入研發）
    └── {學期_健體}_{版本}/                       (例：三下_健體_南一)
```

**來源檔名格式（三種，腳本均支援）**：
- **A 米蘭老師格式**（從 Drive 直接下載，含空格）：
  `{縣市立}{學校名} 三年級 {年度} 下學期 {領域} {科目} {段考描述} {版本} {試卷|答案}.pdf`
  例：`縣立永光國小 三年級 108 下學期 社會領域 社會 第三次段考 期末考 翰林 試卷.pdf`
- **B 自校壓縮格式**（各校自行上傳，多樣）：
  例：`112下-勝利國小-社三末卷.pdf`、`111下-新北安和國小-社會3年級期中.pdf`
- **C 已正規化格式**（JOB-207 重命名後）：
  `{版本}_{年度}_{學校}_{考試類型}_{試卷|答案}.pdf`
  例：`南一_108_永光國小_第三次段考_試卷.pdf`

**輸出 MD 統一命名**：`{版本}_{年度}_{學校}_{考試類型}.md`（試卷 + 答案合併成一份 MD）
例：`翰林_108_永光國小_第三次段考.md`

---

## 三、來源與取得方式

### 來源 A：tcool.cc（全國中小學題庫網）— 主力來源

**存取方式**：透過 Chrome 瀏覽器工具（claude-in-chrome）操作，WebFetch 會被 403 封鎖。

**搜尋介面**：`https://www.tcool.cc/`
- 年級 1-12、科目、學期、段考類型、出版社、縣市、有答案卷 篩選完整
- URL 格式：`https://www.tcool.cc/mock/{ID}/`
- 取題流程：逐題 `get_page_text` + JS click（**Mock Quiz 逐題作答法**，詳見 §六 SOP）

### 來源 B：米蘭老師教育資訊室 — 主力來源（2026-04-21 升格）

**網址**：`https://melances.com/grade{N}/`（N=1-6）

**結構**：按年級 → 科目 → 版本 → 學期 → 考試類型，提供 Google Drive 公開資料夾連結（PDF/Word）。

**取檔方式**：
- `gdown --folder <URL>` 下載整個 Drive
- `gdown.download_folder(url, skip_download=True)` 僅取檔案清單（file_id + filename）
- 本機已驗證成功率 100%（JOB-207 Phase 0 完成 704 Drive 全站 listing）

**全站規模**（2026-04-21 實算）：
- 704 Drive 資料夾
- **11,704 份 PDF**
- 完整清單：`_manifest/pdf_manifest_G1_G6.json`

### 來源 C：各校官方試卷區 — 補充來源

| 學校 | 連結 | 備註 |
|:--|:--|:--|
| 新北市安和國小 | [Google Drive](https://drive.google.com/drive/folders/11orkSjAS9RdXMOVQkrvf39qbaDUXYWKU) | ✅ 110-114 學年度，含解答，全年級全科目，**檔名不含出版社** |
| 新北市桃子腳國小 | [官網](https://www.tykjh.ntpc.edu.tw/p/426-1000-57.php) | 按學年度分類 |
| 台南市和順國小 | [官網](https://www.hses.tn.edu.tw/modules/tad_uploader/index.php?of_cat_sn=1) | 上傳系統需進子分類 |
| 花蓮市明義國小 | [官網](https://www.myps.hlc.edu.tw/modules/tad_uploader/index.php?of_cat_sn=252) | 105-114 學年度 |
| 桃園市普仁國小 | [Google Sites](https://sites.google.com/pzps.tyc.edu.tw/9958/%E9%A6%96%E9%A0%81/113%E5%AD%B8%E5%B9%B4) | 按學年度分類 |

> tcool.cc 已收錄多校考卷（民權、內湖、大華、建德、大墩、獅湖、永安、忠孝、東光），優先走 tcool.cc。

### 來源 D：hlmath.tw 學校段考區

**網址**：`https://hlmath.tw/school-examination/`
- 依縣市分類、各校 Drive 連結
- 與 tcool.cc 互補（不同學校覆蓋）

---

## 四、tcool.cc 考卷 ID 索引（儲備倉庫）

**完整 JSON**：`_manifest/tcool_exam_index.json`（708 份考卷 ID，JOB-172 收集）

| 年級 | 國語 | 數學 | 社會 | 自然 | 英語 | 小計 |
|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| G3 上 | 18 | 18 | 20 | 20 | 9 | 85 |
| G3 下 | 19 | 18 | 20 | 21 | 12 | 90 |
| G4 上 | 18 | 18 | 20 | 19 | 12 | 87 |
| G4 下 | 19 | 19 | 17 | 18 | 10 | 83 |
| G5 上 | 19 | 19 | 20 | 19 | 16 | 93 |
| G5 下 | 20 | 20 | 19 | 18 | 16 | 93 |
| G6 上 | 18 | 20 | 19 | 18 | 13 | 88 |
| G6 下 | 19 | 19 | 17 | 17 | 17 | 89 |
| **合計** | **150** | **151** | **152** | **150** | **105** | **708** |

每份 tcool 考卷約 20 題 → **潛在可蒐集考古題約 14,160 題**。

---

## 五、出版社辨識規則（防止張冠李戴）

- **tcool.cc 優先**：搜尋結果已標出版社，直接用（如「4年級 社會 下學期 期末2 翰林」）
- **學校 Google Drive 辨識**：
  1. PDF 內文辨識（頁首/頁尾）
  2. 題目內容比對（例：「家鄉老故事」→ 翰林；「家鄉的地形與生活」→ 南一）
  3. 縣市教育局公告各校教科書採用版本
  4. 無法確認時標 `publisher: unknown`，**不計入** 版本專屬考古題

---

## 六、蒐集作業 SOP

### SOP A：米蘭老師 Drive 批次下載（JOB-207 主要管道）

```bash
# 1. 從 _manifest/drive_manifest_G1_G6.json 取目標 Drive URL
# 2. gdown --folder <URL> 下載整個資料夾（檔名保持米蘭老師原始格式，含空格）
cd knowledge/3_考古題/1_原始檔/G3/三下_社會_翰林   # 按 {學期_科目}_{版本} 分目錄
~/Library/Python/3.11/bin/gdown --folder "<DRIVE_URL>"

# 3. 重命名非必要：腳本可直接辨識米蘭老師格式，不需預先正規化
#    若需批量重命名，可選用 scripts/job207_download_batch.py
```

**限速**：每 Drive 間 sleep 10s，每批 ≤ 3 Drive 休 5 分鐘（避 Google rate-limit）。

### SOP B：PDF → 淬鍊 MD + _index.json（JOB-207 pipeline）

```bash
# 處理特定出版社（翰林）
~/Library/Python/3.11/bin/python3.11 scripts/job207_distill_to_md.py \
  --grade G3 --semester_subject 三下_社會 --publisher 翰林

# 處理所有出版社（掃描所有 三下_社會_* 子目錄）
~/Library/Python/3.11/bin/python3.11 scripts/job207_distill_to_md.py \
  --grade G3 --semester_subject 三下_社會
```

腳本動作：
1. 掃描 `1_原始檔/G3/三下_社會_{版本}/` 下的 PDF 和 DOC 檔
2. pdfplumber（PDF）或 markitdown（DOC）萃取文字
3. 支援三種檔名格式：米蘭老師格式、自校壓縮格式、已正規化格式
4. 套用該科目主題關鍵字規則 → 分類題目
5. 生成 `2_MD淬鍊文字/G3/三下_社會/{版本}_{年度}_{學校}_{考試類型}.md`
6. 合併更新 `2_MD淬鍊文字/G3/三下_社會/_index.json`（不覆蓋已有出版社條目）

### SOP C：tcool.cc Mock Quiz 逐題作答法（備援，詳見舊版 README）

> 技術要點（已驗證，2026-04-11）：導航 mock URL → `find('.btn-start')` click → 逐題 `get_page_text` + 點選項 + 讀答 + 點下一題（click 須為最後同步操作，不可 await）
> 期中考 PDF 會 403，必須走 mock quiz 介面。

### 課次分類準則

| 情況 | 處理方式 | 計入達標計數？ |
|:--|:--|:--:|
| 明確含該課專屬詞彙 | `lesson: "L2"` | ✅ |
| 兩課交界 | `lesson: "L2_or_L3"` | ❌ |
| 通用常識 | `lesson: "ambiguous"` | ❌ |
| 閱讀題短文明確對應某課 | 該課 | ✅ |

**原則**：寧可少歸，不可錯歸。

---

## 七、PDF → MD 淬煉規則

### MD 結構範本

```markdown
---
source_school: 彰化縣永光國小
academic_year: 108
exam_type: 第三次段考
publisher: 南一
semester: 三下
subject: 社會
semester_subject: 三下_社會
pdf_files:
  - filename: 南一_108_永光國小_第三次段考_試卷.pdf
    sha256: a3f2c1d8e9b04f6702c5341e87d9f20b3a1c6e4d0f7b8291e5a3c4d6f0b12347
  - filename: 南一_108_永光國小_第三次段考_答案.pdf
    sha256: b9d4e2f1a0c83b5702d6241e98c0f31c4b2d7e5a1f8b9302f6a4c5e7d1b23458
extracted_date: 2026-04-21
extracted_by: "Claude Code (claude-opus-4-7) via scripts/job207_distill_to_md.py"
topic_hits:
  社區營造: 12
  公民服務: 8
  探究流程: 3
char_count: 3250
---

# 三下 社會 南一｜永光國小 108 學年度 第三次段考

## 試卷結構
- 是非題 10 題 × 1 分 = 10 分
- 選擇題 10 題 × 2 分 = 20 分
- ... 

## L5 主題相關題目（精選）

### 選擇題 5｜公民參與場合
**題幹**：下列哪一個議題適合在地方會議上提出討論？
**選項**：(A) 公園施工進度 (B) 商店營業時間 (C) 學校段考範圍 (D) 家庭旅遊日期
**正確答案**：(A)
**L5 主題對應**：公民參與場合辨識
**誘答機制**：(B)(C)(D) 混淆私領域 vs 公領域

## 跨課綜合題（標記但不精解）
...

## 原文追溯
`knowledge/3_考古題/1_原始檔/G3/三下_社會_南一/南一_108_永光國小_第三次段考_試卷.pdf`
```

### `_index.json` 結構範本

```json
{
  "path": "knowledge/3_考古題/2_MD淬鍊文字/G3/三下_社會/",
  "last_updated": "2026-04-21T10:30:00Z",
  "total_md": 21,
  "schools": ["永光國小", "成功國小", ...],
  "years": ["108", "109", "110", "111", "112"],
  "publishers": ["南一"],
  "exam_types": ["期中考", "期末考", "第一次段考", "第二次段考", "第三次段考"],
  "topic_matrix": {
    "社區營造": {"108": 152, "111": 44, ...},
    "探究流程": {"108": 5, "111": 4, ...},
    ...
  },
  "lesson_coverage": {
    "L1": 15,
    "L2": 23,
    ...
  },
  "files": [
    {
      "filename": "南一_108_永光國小_第三次段考.md",
      "school": "永光國小",
      "year": "108",
      "exam_type": "第三次段考",
      "publisher": "南一",
      "topic_hits": {...},
      "lesson_hits": {...}
    },
    ...
  ]
}
```

---

## 八、與 KL / RM / QL 規範的銜接

| 規範位置 | 關聯 |
|:--|:--|
| `knowledge/README_研究架構總綱.md` | KL1-KL4、RM0-RM3、α / β+ 雙軌路徑 |
| `knowledge/5_學習議題研究/無課文情境的考古題補償研究法.md` | β+ 路徑（本目錄的主要用武之地） |
| `question/README_出題與品管準則.md` | CQI-P 評分、JSON schema |
| `question/README_驗證與盲測準則.md` | QL1-QL5 定義、盲測流程 |

**考古題與 QL 的關係**：
- α 路徑（有課文）：≥10 題 ≥2 來源 → QL3 天花板（盲測升 QL4）
- β+ 路徑（無課文）：15 分鐘上限 + ≥3 學年度 + ≥5 學校 → QL3(β+) 天花板

---

## 九、遷移紀錄（2026-04-21）

### 從 `knowledge/3_考古題/` 遷移到 `knowledge/3_考古題/`

JOB-207 執行：

| 原位置 | 新位置 | 備註 |
|:--|:--|:--|
| `考古題原檔/README_考古題蒐集規範與來源索引.md` | `考古/README.md` | 本文件（大幅更新） |
| `考古題原檔/_manifest/*` | `考古/_manifest/*` | 搬移 |
| `考古題原檔/tcool_exam_index.json` | `考古/_manifest/tcool_exam_index.json` | 納入 `_manifest/` |
| `考古題原檔/download_report.json` | `考古/_manifest/download_report_JOB172.json` | 重命名納入 |
| `考古題原檔/_test_10/G3國語翰林/期末考/*.pdf` | `考古/原始/G3/三下_國語/*.pdf` | 23 份，檔名重組 |
| `考古題原檔/_test_10/G3數學康軒/期末考/*.pdf` | `考古/原始/G3/三下_數學/*.pdf` | 16 份 |
| `考古題原檔/_test_10/G4國語南一/期末考/*.pdf` | `考古/原始/G4/四下_國語/*.pdf` | 12 份 |
| `考古題原檔/_test_10/G4社會翰林/期末考/*.pdf` | `考古/原始/G4/四下_社會/*.pdf` | 0 份（測試失敗） |
| `考古題原檔/_test_10/G5國語南一/期末考/*.pdf` | `考古/原始/G5/五下_國語/*.pdf` | 0 份 |
| `考古題原檔/_test_10/G5自然康軒/期末考/*.pdf` | `考古/原始/G5/五下_自然/*.pdf` | 0 份 |
| `考古題原檔/_test_10/G5社會翰林/期末考/*.pdf` | `考古/原始/G5/五下_社會/*.pdf` | 0 份 |
| `考古題原檔/_test_10/G6國語翰林/期末考/*.pdf` | `考古/原始/G6/六下_國語/*.pdf` | 0 份 |
| `考古題原檔/_test_10/G6自然南一/期末考/*.pdf` | `考古/原始/G6/六下_自然/*.pdf` | 0 份 |
| `考古題原檔/_test_10/G6社會康軒/期末考/*.pdf` | `考古/原始/G6/六下_社會/*.pdf` | 0 份 |
| `考古題原檔/G3/社會/南一/extracted/*.json` | **重下載** 42 份 PDF → `考古/原始/G3/三下_社會/`；JSON 轉成 `考古/淬煉/G3/三下_社會/*.md` + `_index.json` | Q1=是；舊 JSON 保留作對照直到新 MD 完成 |
| `考古題原檔/四下/社會/G4_S2_社會_考古題_8份.json` | 拆成 8 份 MD 分配到 `考古/淬煉/G4/四下_社會/` | Q2=拆 |
| `考古題原檔/四下/社會/G4_S2_社會_翰林_期中1_大華國小.json` | 轉 `考古/淬煉/G4/四下_社會/翰林_NN_大華國小_期中考.md` | 聚合拆單 |

### .gitignore 調整

```
# 原始 PDF/Word（不進 git）
knowledge/3_考古題/1_原始檔/
# 淬鍊 MD（不進 git；_index.json 例外允許追蹤）
knowledge/3_考古題/2_MD淬鍊文字/**/*.md
!knowledge/3_考古題/2_MD淬鍊文字/**/_index.json
```

### 引用路徑更新（Q3=A）

搜尋並改寫所有 `knowledge/3_考古題/` 引用為 `knowledge/3_考古題/`：
- `knowledge/README_研究架構總綱.md` §附錄
- `jobs/JOB-172-*.md`、`jobs/JOB-206-*.md`
- `knowledge/5_學習議題研究/無課文情境的考古題補償研究法.md`
- 其他 KL4 檔（若有）

---

## 十、責任鏈與追溯

每份 MD 必含 `extracted_by` + `extracted_date`，每份 `_index.json` 必含 `last_updated` 與 `total_md`。供追溯與學術誠信檢驗。

---

*本文件為 JOB-207 主規範。未來新增來源、調整 SOP、修訂鐵律時，須更新本文件並在 §九 新增遷移/變更紀錄。*
