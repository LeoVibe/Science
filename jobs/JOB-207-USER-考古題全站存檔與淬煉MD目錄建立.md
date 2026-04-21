*Created by USER at 2026-04-21*

`last_updated`: 2026-04-21
`updated_by`: Claude Code (claude-opus-4-7)

# JOB-207-USER-考古題全站存檔與淬煉 MD 目錄建立

**`job_type`**：`research`（跨科全站基礎建設）
**`executor`**：Claude Code（使用者 2026-04-21 授權一條龍執行）
**`model_approval`**：純本機運算 + gdown 免費額度；**零 API 費用**

**狀態**：🟢 **進行中**（2026-04-21 Phase 0 啟動）

---

## 📌 任務背景

### 延伸自 JOB-206 的 β+ 補償研究法實踐

2026-04-20~21 JOB-206 L5 重出事件暴露兩個問題：
1. **課本原文無授權取得管道** → 走 β+ 補償路徑需要大量真實考古題
2. **考古題存放格式不一致**：三個時期三種存法並存（JOB-172、本 session 早期、本 session 後期）

本 session 已完成：
- 米蘭老師 G1-G6 × 704 個 Drive × **11,704 份 PDF 全站清單**（`_manifest/pdf_manifest_G1_G6.json`）
- β+ 補償研究法方法論文件化（`knowledge/學習議題研究/無課文情境的考古題補償研究法.md`）
- α / β+ 雙軌路徑納入研究架構總綱
- G3 社會南一 L5 首個 β+ pilot 成功（CQI 9.19 / Match 100%）

### 🔑 新核心原則（修訂既有規範）

**「所有下載的原始檔永久保留」** — 覆寫既有 `knowledge/考古題原檔/README §一 Rule 7`（原「解析完成即刪 PDF」）。

理由：
- PDF 是第一手原始素材，具不可重現性（米蘭老師 Drive 內容可能被移除）
- 本機儲存空間充裕（全站約 4-5 GB 可承受）
- 重複萃取或更換 parser 時，有原檔方可重跑
- 符合學術誠信（所有結論可追溯到原始證據）

---

## 🎯 任務目標

1. **建立標準化「考古」目錄結構**：`knowledge/考古/{_manifest,原始,淬煉}/G{1-6}/{學期_科目}/`
2. **遷移既有資產**：整合 JOB-172 與本 session 三個時期的所有檔案到新結構
3. **重下載 42 份 G3 社會南一 PDF**（使用者 Q1=是）：補回舊規範下被刪的原始檔
4. **建立下載 + 淬煉 pipeline**：
   - `scripts/job207_download_batch.py`（限速 + retry）
   - `scripts/job207_distill_to_md.py`（PDF → MD + _index.json）
5. **G3 社會南一 完整 pilot**：用新 pipeline 跑一次完整流程作範本
6. **更新所有文件引用**（使用者 Q3=A）：改 `knowledge/考古題原檔/` → `knowledge/考古/` 全部 broken link 修正
7. **更新 .gitignore**：新路徑對齊

---

## 🚧 任務邊界

### 本 JOB 做

- 目錄結構建立與既有檔案遷移
- 下載 / 淬煉腳本開發
- 規範文件更新（`knowledge/考古/README.md`）
- `.gitignore` 調整
- G3 社會南一作為完整範本（延伸既有成果）

### 本 JOB 不做

- ❌ 全站 11,704 PDF 一次下載（留給後續每週批次 JOB）
- ❌ 動 `question/` 下題庫 JSON（與 JOB-206 重出分開）
- ❌ 修 `apps/v3_eidos/` UI 元件
- ❌ 超過 G3 社會南一的其他科目/版本 pipeline 展開（另開批次 JOB）

---

## 📂 新目錄結構（Phase 0 產出）

```
knowledge/考古/                                  ← 新主目錄（從 考古題原檔 rename）
├── README.md                                    ← 規範（新寫，含新規則 + 遷移紀錄）
├── _manifest/                                   ← 索引集中
│   ├── drive_manifest_G1_G6.json                ← 本 session 既有
│   ├── pdf_manifest_G1_G6.json                  ← 本 session 既有
│   ├── tcool_exam_index.json                    ← 從 JOB-172 搬入
│   ├── download_report_JOB172.json              ← 從 JOB-172 搬入
│   ├── list_progress.log                        ← 本 session 既有
│   └── README_米蘭老師_G1_G6_Drive_清單.md       ← 本 session 既有
├── 原始/                                        ← PDF / Word（永久保留，gitignore）
│   ├── G3/
│   │   ├── 三下_國語/                           ← 從 _test_10/G3國語翰林/ 搬 23 份
│   │   ├── 三下_數學/                           ← 從 _test_10/G3數學康軒/ 搬 16 份
│   │   └── 三下_社會/                           ← 重下載 42 份
│   ├── G4/
│   │   ├── 四下_國語/                           ← 從 _test_10/G4國語南一/ 搬 12 份
│   │   └── 四下_社會/                           ← JOB-172 失敗的需補
│   ├── G5/
│   │   ├── 五下_國語/                           ← 從 _test_10/G5國語南一/
│   │   ├── 五下_自然/                           ← 從 _test_10/G5自然康軒/
│   │   └── 五下_社會/                           ← 從 _test_10/G5社會翰林/
│   └── G6/
│       ├── 六下_國語/                           ← 從 _test_10/G6國語翰林/
│       ├── 六下_自然/                           ← 從 _test_10/G6自然南一/
│       └── 六下_社會/                           ← 從 _test_10/G6社會康軒/
└── 淬煉/                                        ← MD + _index.json（gitignore MD，_index.json 進 git）
    └── G3/
        └── 三下_社會/                           ← Pilot：42 MD + 1 _index.json
            ├── _index.json
            └── 南一_108_永光國小_第三次段考.md

**檔名規則**：
- PDF：`{版本}_{學年度}_{學校}_{考試類型}_{試卷|答案}.pdf`
- MD：`{版本}_{學年度}_{學校}_{考試類型}.md`（試卷 + 答案合併呈現）
```

---

## 📖 執行 Phases

| Phase | 動作 | 預估 | 狀態 |
|:--:|:--|:--:|:--:|
| **0** | 建新目錄骨架、搬 README、更新 .gitignore | 30 分 | 🟡 Starting |
| **1** | 遷移 _test_10 (51 PDF) + 四下 (2 JSON 拆成單張 MD) + _manifest 索引 | 30 分 | ⚪ |
| **1.5** | 重下載 42 份 G3 社會南一 PDF（Q1=是） | 20 分 | ⚪ |
| **2** | 寫 `scripts/job207_download_batch.py` | 45 分 | ⚪ |
| **3** | 寫 `scripts/job207_distill_to_md.py` | 60 分 | ⚪ |
| **4** | G3 社會南一 pilot：用 Phase 2/3 跑完整 pipeline | 30 分 | ⚪ |
| **5** | 更新所有文件引用（Q3=A：全改）| 30 分 | ⚪ |
| **6** | commit + JOB-207 Report + close | 30 分 | ⚪ |
| **合計** | | **~4 小時** | |

**結案條件**：Phase 0-6 全部完成。全站推廣（G1-G6 各科其他課次）為後續獨立 JOB。

---

## ⏱️ 預估時程

約 4 小時本 JOB，可能分 2-3 個 session 執行。

## 💰 成本

- 模型成本：**$0**（純本機運算 + gdown 免費）
- 存儲：~4-5 GB 本機（等全站下載完）
- Git 大小：只增 `_index.json` + `README.md` 約 100 KB

---

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `knowledge/README_研究架構總綱.md` | α / β+ 雙軌路徑定義 |
| `knowledge/學習議題研究/無課文情境的考古題補償研究法.md` | β+ 方法論（本 JOB 的研究基礎） |
| `knowledge/考古題原檔/_manifest/pdf_manifest_G1_G6.json` | 11,704 PDF 全站清單（遷移到 `knowledge/考古/_manifest/`） |
| `knowledge/課綱研究/社會/三下/南一/KL4_三下_南一_L5_*.md` | Pilot 的 KL4 雙檔（參照範本） |
| `jobs/JOB-172-AG-考古題蒐集方法探索與來源擴充.md` | 前置研究（tcool.cc 索引建立） |
| `jobs/JOB-206-USER-題目scenario規範與錯放題目審查.md` | 直接前置（L5 β+ pilot） |

---

## ✅ 啟動 Checklist

- [x] 已讀取 `knowledge/README_研究架構總綱.md`（α / β+ 雙軌）
- [x] 已讀取 `knowledge/學習議題研究/無課文情境的考古題補償研究法.md`（β+ 方法）
- [x] 米蘭老師 G1-G6 Drive 清單完整（704 × 11,704 PDF）
- [x] 使用者 Q1-Q3 決策確認（重下載 / 拆聚合 JSON / 全改引用）

## ✅ 驗收 Checklist (Acceptance)

- [ ] `knowledge/考古/` 新目錄結構完整建立
- [ ] Phase 1 遷移：_test_10 (51 PDF) + 四下 (2 JSON) + 索引 搬完
- [ ] Phase 1.5：42 份 G3 社會南一 PDF 重新下載完成
- [ ] Phase 2 腳本 `scripts/job207_download_batch.py` 可執行
- [ ] Phase 3 腳本 `scripts/job207_distill_to_md.py` 可執行
- [ ] Phase 4 pilot：G3 社會南一 `淬煉/G3/三下_社會/` 含 42 份 MD + `_index.json`
- [ ] Phase 5：grep `knowledge/考古題原檔` 全站改完（0 broken reference）
- [ ] `.gitignore` 更新：新路徑生效

## ✅ 成果 Checklist (Deliverables)

- [ ] `knowledge/考古/README.md` 新規範
- [ ] `scripts/job207_download_batch.py` + `scripts/job207_distill_to_md.py`
- [ ] G3 社會南一 42 MD + 1 _index.json（淬煉完成）
- [ ] 已執行 `/pj_sync`
- [ ] `jobs/JOB-207-Report.md`

## 🔄 同步確認

- [ ] `docs/進度彙整_題庫研發與產出.md` 加 JOB-207 條目
- [ ] `docs/README_專案發展紀錄.md` 加 JOB-207 DONE 紀錄
- [ ] 研究成熟度相關文件指向新路徑

---

## ⏱️ 執行時間回報

| 子任務 / 階段 | 開始時間 | 結束時間 | 耗時（分鐘） | 備註 |
|:--|:--|:--|:--|:--|
| Phase 0 目錄規範 | - | - | - | |
| Phase 1 遷移 | - | - | - | |
| Phase 1.5 重下載 | - | - | - | |
| Phase 2 下載工具 | - | - | - | |
| Phase 3 淬煉 pipeline | - | - | - | |
| Phase 4 Pilot | - | - | - | |
| Phase 5 更新引用 | - | - | - | |
| Phase 6 結案 | - | - | - | |
| **總計** | — | — | **-** | — |

## 真實回報本次對話的模型與花費

＄作業匯總：Token數:- | 花費: $- | 使用模型: Claude-Opus-4.7（規劃 + 執行） | 執行者: Claude Code
