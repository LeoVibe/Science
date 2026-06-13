*Created by Claude Code (claude-opus-4-8) at 2026-06-13*

`last_updated`: 2026-06-13
`updated_by`: Claude Code (claude-opus-4-8)

# JOB-250-AG-三下-自然-南一題庫重出

**`job_type`**：`mixed`（Phase A research 反推溶解 KL4 + Phase B question_prod 出題）
**`executor`**：Codex CLI gpt-5.5（訂閱制）＋ Claude Code claude-opus-4-8（PM 驗收）
**`parent_jobs`**：JOB-247（L3 對齊）、JOB-248/249（康軒/翰林重出）
**`model`**：Codex gpt-5.5 訂閱制 — ⚠️ **只用訂閱制額度，禁止任何 API key**

---

## 📌 任務背景與南一結構釐清

南一三下自然是三版本最複雜的：現有題庫與課綱有結構性錯位。經查證：
- **現有題庫 L3 內容錯置**：manifest 標題「天氣特派員」（天氣），但題目內容塞了動物題（仿生）
- **南一 113 真實結構**（依 manifest 課名 + 113 官方評量卷實證）：

| 課 | 課名 | 主題 | 113 評量證據 |
|:--|:--|:--|:--|
| L1 | 種菜好好玩 | 植物種植與生長 | 第一次評量：花/葉/莖/根/種子 |
| L2 | 溫度影響物質的變化 | 水與物質變化（三態）| 第一次評量：蒸發/凝結/融化 |
| L3 | 天氣特派員 | **天氣觀測與解析** | 第二次評量：降雨/氣溫/風/雨量 |
| L4 | 廚房中的科學 | **溶解（物質）** | 第二次評量：溶解 27 題 |

- **無動物課**：113 兩次評量動物題 0；現有 L3 動物內容為錯置/舊版殘留
- 依使用者裁定「對齊現行 113 版」「用考古題反推綱要後續做」執行

---

## 🎯 任務目標

南一 4 課各重出 50 題（共 200 題，對齊 113 結構），達 QL3。
**課號↔KL4 對應**：

| 課 | 主題 | KL4 來源 |
|:--|:--|:--|
| L1 種菜好好玩 | 植物 | 南一 KL4 L1 植物（現有）|
| L2 溫度影響物質的變化 | 水/三態 | 南一 KL4 L2 水（現有）|
| L3 天氣特派員 | 天氣 | 南一 KL4 L4 天氣（現有，檔名 L4）|
| L4 廚房中的科學 | 溶解 | **Phase A 反推新建** |

---

## 🚧 任務邊界

**只做**：南一 4 課重出（含 Phase A 溶解 KL4 反推）
**不做**：盲測升 QL4、修改其他 KL4/KL3、網站更版（另行）、保留現有南一 L3 動物題（113 不需要）

---

## 📖 執行步驟

### Phase A：反推溶解課 KL4（research）
Codex 讀南一溶解相關考古題（113 第二次評量溶解 27 題、108 各校第二次段考、misconception「融化/溶解混用」南一 11 題），產出：
- `knowledge/1_課綱研究/自然/三下/南一/KL4_三下_南一_廚房中的科學_單課研究紀錄.md`
- `..._考古題與討論.md`
含 §知識點地圖（溶解概念、溶解 vs 融化、溶解與溫度、可逆性）+ §守衛點/迷思。

### Phase B：4 課出題（question_prod）
同 JOB-248/249 流程，每課 codex 讀對應 KL4 + 迷思，原創 50 題寫 `*_new.json`。

### Phase C：驗收
CQI-P ≥ 5.5、validate 0 errors、無 BIAS、重複 0、領域守則。覆蓋正式檔（authoring_model=gpt-5.5）+ manifest（L3 內容改天氣、L4 維持溶解、blind_tested=0、QL3）。

---

## ✅ 啟動 Checklist

- [x] 南一 113 結構釐清（植物/水/天氣/溶解，無動物）
- [x] KL4 盤點：植物/水/天氣齊備，溶解需 Phase A 反推
- [x] env 無 API key；codex 訂閱制
- [x] 使用者許可（全自主、考古題反推授權）

## ✅ 驗收 Checklist

- [x] Phase A：溶解 KL4 雙檔產出（194/253行）
- [x] 4 課各 50 題（共 200 題）
- [x] 各課 CQI-P ≥ 5.5（7.14-7.20）
- [x] validate 0 errors
- [x] L3 內容=天氣、L4 內容=溶解（對齊 113）
- [x] 無 BIAS、無重複、達 QL3

## ✅ 成果 Checklist

- [x] 溶解 KL4 雙檔 + 南一 4 課題庫 + manifest
- [x] `jobs/JOB-250-Report.md`
- [x] 進度總表同步 + `/pj_sync`
- [x] `node scripts/job_manager.js close JOB-250`
- [x] Discord 結案回報

## 真實回報

＄作業匯總：Token數:- | 花費: 訂閱制無單次計費 | 使用模型: Codex gpt-5.5 訂閱制 + claude-opus-4-8 | 執行者: AG
