`last_updated`: 2026-04-28
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-212 Report — 規範治理-KL2-KL4 檔名收斂與素材庫拆解

**執行者**：Claude Code (claude-sonnet-4-6)
**執行日期**：2026-04-28
**完成範圍**：Phase A + Phase B + Phase C + Phase D1（Phase D2 遞延至下次 session）
**Commit**：`3c9896a`（44 files changed，1357 insertions，650 deletions）

---

## ✅ 啟動 Checklist 驗收

- [x] 已讀取：`knowledge/README_研究架構總綱.md`
- [x] 已讀取：`knowledge/1_課綱研究/國語/README_KL4單課建置與複製準則.md`
- [x] 已讀取：`knowledge/1_課綱研究/社會/G3_S2_社會_原始研究素材庫.md`
- [x] 確認執行模型：claude-sonnet-4-6（本地文件操作，無 LLM API 呼叫）
- [x] 確認無需付費 API
- [x] stop-and-confirm 節點均已執行（Phase A 草稿確認、B2 表確認、C2 課名表確認）

---

## ✅ 驗收 Checklist

| 驗收項目 | 佐證 |
|:--|:--|
| README_研究架構總綱.md 新增 4 條定義 | v4.4，KL3 命名規範第 80 行後、KL4 大檔禁止第 96 行後可定位 |
| README_出題與品管準則.md 新增附錄 A | 第 244 行後「附錄 A：圖片依賴題型的處理規範」 |
| `find *發展綱要*` = 0（KL3 舊名清零） | `find knowledge/1_課綱研究 -name "*發展綱要*" \| grep -v 選擇題` → 0 |
| `find KL3_*_研究總綱.md` = 25 | `find knowledge/1_課綱研究 -name "KL3_*_研究總綱.md"` → 25 筆 |
| KL3_三下_社會_研究總綱.md 補課名清單 | §「三出版社課名清單」表格已插入 |
| 社會/三下/翰林/ KL4 空殼 12 個 | `ls knowledge/1_課綱研究/社會/三下/翰林/` → 12 筆 |
| manifest 課名正確 | `grep '"title"' G3_S2_SOC_HANLIN_manifest.json` → 6 個正確課名（非 L1~L6） |
| D1 清理 4 項 | 三個刪除確認（ls 已不存在）；01_五下生物合併至 KL3_五下_自然_研究總綱.md §附錄 |

---

## 📋 實際修改檔案清單

### Phase A（規範文件）
- `knowledge/README_研究架構總綱.md`（修改，v4.3→v4.4）
- `question/README_出題與品管準則.md`（修改，新增附錄 A）

### Phase B（KL3 重命名 + 腳本更新）
**國語（5 rename + 1 delete）：**
- `國語/三上/KL3_三上_國語_發展綱要.md` → `KL3_三上_國語_研究總綱.md`
- `國語/四上/KL3_四上_國語_發展綱要.md` → `KL3_四上_國語_研究總綱.md`
- `國語/四下/KL3_四下_國語_發展綱要.md` → `KL3_四下_國語_研究總綱.md`
- `國語/五下/KL3_五下_國語_發展綱要.md` → `KL3_五下_國語_研究總綱.md`
- `國語/六下/KL3_六下_國語_發展綱要.md` → `KL3_六下_國語_研究總綱.md`
- `國語/五下/KL3_五下_國語_發展綱要_附錄.md`（刪除，空殼 alias）

**數學（6 rename）：**
- `數學/三上_數學_發展綱要.md` → `KL3_三上_數學_研究總綱.md`
- `數學/三下_數學_發展綱要.md` → `KL3_三下_數學_研究總綱.md`
- `數學/四下_數學_發展綱要.md` → `KL3_四下_數學_研究總綱.md`
- `數學/五上_數學_發展綱要.md` → `KL3_五上_數學_研究總綱.md`
- `數學/五下_數學_發展綱要.md` → `KL3_五下_數學_研究總綱.md`
- `數學/六下_數學_發展綱要.md` → `KL3_六下_數學_研究總綱.md`

**社會（5 rename，社會 KL3 原無前綴，git 記為 D+A）：**
- `三下_社會_發展綱要.md` → `KL3_三下_社會_研究總綱.md`
- `四下_社會_發展綱要.md` → `KL3_四下_社會_研究總綱.md`
- `五上_社會_發展綱要.md` → `KL3_五上_社會_研究總綱.md`
- `五下_社會_發展綱要.md` → `KL3_五下_社會_研究總綱.md`
- `六下_社會_發展綱要.md` → `KL3_六下_社會_研究總綱.md`

**自然（5 rename）：**
- `三下_自然_發展綱要.md` → `KL3_三下_自然_研究總綱.md`
- `四下_自然_發展綱要.md` → `KL3_四下_自然_研究總綱.md`
- `五上_自然_發展綱要.md` → `KL3_五上_自然_研究總綱.md`
- `五下_自然_發展綱要.md` → `KL3_五下_自然_研究總綱.md`
- `六下_自然_發展綱要.md` → `KL3_六下_自然_研究總綱.md`

**英語（3 rename）：**
- `三下_英語_發展綱要.md` → `KL3_三下_英語_研究總綱.md`
- `四下_英語_發展綱要.md` → `KL3_四下_英語_研究總綱.md`
- `五下_英語_發展綱要.md` → `KL3_五下_英語_研究總綱.md`

**腳本更新：**
- `scripts/run_blind_eval.js`（R4_MAPPING 全 22 條路徑更新）
- `scripts/evaluate_question_quality.js`（搜尋邏輯補強：研究總綱 || 發展綱要）
- `scripts/evaluate_question_quality 2.js`（刪除，iCloud 副本）

### Phase C（社會 KL3+KL4）
- `knowledge/1_課綱研究/社會/KL3_三下_社會_研究總綱.md`（修改，插入三出版社課名清單）
- `knowledge/1_課綱研究/社會/三下/翰林/KL4_三下_翰林_L1_我居住的地方_單課研究紀錄.md`（新建）
- `knowledge/1_課綱研究/社會/三下/翰林/KL4_三下_翰林_L1_我居住的地方_考古題與討論.md`（新建）
- `knowledge/1_課綱研究/社會/三下/翰林/KL4_三下_翰林_L2_多元的生活空間_單課研究紀錄.md`（新建）
- `knowledge/1_課綱研究/社會/三下/翰林/KL4_三下_翰林_L2_多元的生活空間_考古題與討論.md`（新建）
- `knowledge/1_課綱研究/社會/三下/翰林/KL4_三下_翰林_L3_生活中的各行各業_單課研究紀錄.md`（新建）
- `knowledge/1_課綱研究/社會/三下/翰林/KL4_三下_翰林_L3_生活中的各行各業_考古題與討論.md`（新建）
- `knowledge/1_課綱研究/社會/三下/翰林/KL4_三下_翰林_L4_生活與工作的轉變_單課研究紀錄.md`（新建）
- `knowledge/1_課綱研究/社會/三下/翰林/KL4_三下_翰林_L4_生活與工作的轉變_考古題與討論.md`（新建）
- `knowledge/1_課綱研究/社會/三下/翰林/KL4_三下_翰林_L5_儲蓄與消費的選擇_單課研究紀錄.md`（新建）
- `knowledge/1_課綱研究/社會/三下/翰林/KL4_三下_翰林_L5_儲蓄與消費的選擇_考古題與討論.md`（新建）
- `knowledge/1_課綱研究/社會/三下/翰林/KL4_三下_翰林_L6_小小街道觀察家_單課研究紀錄.md`（新建）
- `knowledge/1_課綱研究/社會/三下/翰林/KL4_三下_翰林_L6_小小街道觀察家_考古題與討論.md`（新建）

### Phase D1（清理）
- `knowledge/1_課綱研究/自然/01_五下生物成熟度與出題規劃.md`（刪除，內容合併至 KL3_五下_自然_研究總綱.md §附錄）
- `knowledge/1_課綱研究/自然/KL3_五下_自然_研究總綱.md`（修改，新增附錄節）
- `question/platform/G3/Math/S2/KangHsuan/G3_S2_MATH_KANGHSUAN_manifest 2.json`（刪除，iCloud 副本）
- `question/platform/G3/SocialStudies/S2/HanLin/G3_S2_SOC_HANLIN_manifest 2.json`（刪除，iCloud 副本）

---

## 📌 遺留問題（Phase D2，下次 session）

5 份國語年度素材庫尚未拆解：
- `KL4_三下_國語_原始研究素材庫.md`
- `KL4_四下_國語_原始研究素材庫.md`
- `KL4_五下_國語_原始研究素材庫.md`
- `KL4_六下_國語_原始研究素材庫.md`
- 其他年度（視實際存在確認）

預估工作量：~180 課 × 2 = ~360 個 KL4 雙檔，建議分 5 批（每學期一批）執行。

---

## ✅ 成果 Checklist (Deliverables)

- [x] 產出 `jobs/JOB-212-Report.md`，異動清單已列出所有實際修改的檔案路徑
- [x] 執行 `node scripts/job_manager.js close JOB-212`
- [x] 已執行 /pj_sync 全域知識沉澱（docs/README_專案發展紀錄.md 已更新）
- [ ] Discord 結案回報至 `#eidos_派工與回報`（已送出，見 message_id: 1498653756009484298）

---

## 💰 花費回報

＄作業匯總：Token數:- | 花費: $- | 使用模型: claude-sonnet-4-6 | 執行者: Claude Code
