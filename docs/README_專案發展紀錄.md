# 📋 Eidos 專案發展紀錄

`last_updated`: 2026-04-20 20:00
`updated_by`: Claude Code（JOB-205 補登階段：素材庫 parser + 110 課 title 補齊）

---

## 一、更版說明 (Release Notes)

> ⚠️ 此區由人工進行最終文字修飾，Agent 不主動修改。

### v1.5 (2026-04-18)
- 小三下 國語、自然、社會題庫更新，用500題以上考古題，重新校正題幹與選項之適配度，確認題意與學習意涵
- 新增小四下 自然、社會題庫，重塑進行前期學習路徑定義，完成900題以上，全新題庫，並完成雙盲測試

### v1.4 (2026-03-24)
- 全站規範文件重構 v6：建立 KL/RM/QL/CQI-P/CQI-V 新體系
- 文件從 11 份精簡至 6 份
- Skill 系統重整為 ei_/pj_ 雙分類
- 三段式 Checklist 鐵則寫入全域規範

### v1.3 (2026-03-22)
- G6S2 全科題庫補齊與品質精修
- 前台導覽邏輯升級
- Cloudflare Pages 部署穩定化

---

## 二、近期重大變動彙整 (Job Changelog)

> 此區由 `/pj_sync` 觸發，掃描 `jobs/` 派工單歸納近期改動。

### 2026-04-21
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-207 | **考古題全站存檔與淬煉 MD 目錄建立**：延伸 JOB-206 β+ 補償實踐，重構考古題資產（舊 `knowledge/考古題原檔/` → 新 `knowledge/考古/` 三軌：原始/淬煉/_manifest）。新建 10 章 README（含新 Rule 7「原始檔永久保存」取代舊「解析即刪」）、2 個 pipeline 腳本（`job207_download_batch.py` + `job207_distill_to_md.py`）、G3 社會南一 Pilot 完成（25 PDF → 14 MD + `_index.json`；另 3 資料夾共 49 MD + 4 index）。51 份 _test_10 PDF 重命名遷移；JOB-172 聚合 JSON 拆 9 MD。全站 11,704 PDF 清單已備（等後續每週批次下載）。7 個現役規範路徑更新。遺留：G3 社會南一 2 Drive 被 rate-limit 待重試、舊目錄待清理、其他科目 `SUBJECT_KEYWORDS` 待補。執行者：Claude Code（授權一條龍）。見 `jobs/JOB-207-Report.md` | 🟢 DONE |
| JOB-206 | **G3 SOC NanYi L5「打造幸福的家園」全課重出上架**：anti-hallucination D-驗證發現原 30 題錯放（70% 跨情境品德題、30% 探究方法論），與正確課名「打造幸福的家園（自主探究與行動計畫）」主題不符。使用者裁決整課刪除重出。一次做完 spot fix（manifest title 補正 + 30 題降活 + libraryStats 同步）+ KL4 雙檔研究（單課研究紀錄 + 考古題與討論，β 方案以三下發展綱要實證情境為主）+ Claude-Opus-4.7 出題 30 題（taxonomy 3-11-10-6、答案分佈 8-8-7-7 均衡）+ Gemini-3.1-Flash-Lite 盲測 30/30 Match（100%）+ QL4 上架（avgCqi **9.19**）。libraryStats 重算：G3 社會 南一 units 4→5、題數 120→150、cqi 8.11→8.32。米蘭老師 G3 南一 Drive × 5 登錄於 KL4 考古題討論檔。JOB-206 原 117 檔 scenario 審查改列遺留，建議另開 JOB。執行者：Claude Code（使用者授權例外）。見 `jobs/JOB-206-Report.md` | 🟢 DONE |

### 2026-04-20
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-206 | **題目 scenario 規範與錯放題目審查**：JOB-204 §4 + JOB-205 延伸。Subagent 抽樣 5 檔 183 題揭露錯放率達 66%（C2 52% + C3 14%），G5 HanLin L4 滿修女採訪記 >90% 錯放（童話內容佔滿）、G3 HanLin L2 還差一點 0 題正確。外推 117 檔可能影響 2,600-4,900 題。前期研究 `docs/question-audit/JOB-206-前期研究.md` 已產出，後續階段 1-3 待使用者核准付費 LLM 審核預算。| 🟡 OPEN（前期研究完成） |
| JOB-205 | **JOB-184 批次建檔事故修復（防破窗 + placeholder 清理）+ 補登階段**：追查 `eccb974` mega-commit（標記 JOB-184 但實際涵蓋 5-6 個 JOB 的 4422 檔變更），定位三層防線崩壞。階段 2 防破窗：`repair_manifests.js:63`、`auto_generate_questions.js:80`、`job184_g5s2_social_orchestrator.js:147` 三處 fallback 改 throw；`verify_ui_data_integrity.mjs` 加 D-INT-5 規則；新增 `verify_no_placeholder_title.mjs`。階段 1 事故文件：`docs/技術設定/JOB-184-批次建檔事故分析.md` 含盤點疏漏修正章節。階段 3 補 title：G5 Math × 3 publisher（KL4）+ G3 ENG × 3（發展綱要）= 42 課。**補登階段**（使用者質疑後）：brainstorming skill 產出設計文件，新 `scripts/job205_sync_title_from_materials.mjs` 通用 parser 支援 5 種素材庫 pattern，補 G3 數/自/社/G4 Math/G6 數/自/社 **110 課**；衝突 19 筆寫入 `docs/question-audit/title-conflicts.md`；vision 驗證 3 張 G3 jpg 與素材庫 **100% 一致**。Placeholder 最終 27→10 manifest（剩英語 + G6 Math 衝突 + G3 社會 NanYi 邊界）。見 `jobs/JOB-205-Report.md` | 🟢 DONE |
| JOB-204 | **視覺清晰化 A+B+C 與字型試行**：JOB-203 Phase 0 三輪雛形後鎖定「不換色系、不動結構」方針；本 JOB 交付 14 項元素級改動——A1/A2 `--foreground`/`--muted-foreground` 對比度升至 AAA/AA、A3 題目字重 semibold；B1 選項 A/B/C/D badge 從純文字升級 28×28 方形底、B2 hover 邊框 /50 → /70、B3 答對/錯選加 ✓/✕ 色盲友善圖示；C1 `--wrong` 粉 → 正紅、C2-C4 分課卡題數 pill 放大與前綴微調；D1-D4 字型試行（標題 Iansui + 數字 Baloo 2，body 仍 Nunito）；E1-E3 `docs/網站功能規格書.md §1.1 §1.4` 同步。L1-3 0 違規 + L2-1 8/8 + Build 通過；L2-2 既有測試 sample 問題列遺留。發現 G5 南一 L4「縣官審石頭」10/12 題 scenario 不符，全站掃描 117 檔可疑，列 JOB-206 獨立處理；42 manifest title 佔位符列 JOB-205。見 `jobs/JOB-204-Report.md` | 🟢 DONE |
| JOB-203 | **視覺重構-全站 Claymorphism 導入-Phase0 規劃與獨立雛形站**：使用者透過 `ui-ux-pro-max` skill（v2.5.0，全域安裝）確定採用 Claymorphism 風格 + Learning Blue 調色盤。本 Phase 0 將產出三份規劃文件（方向決策閘 / token 映射 / Phase 計畫）+ 在 `prototypes/ui-v2/` 建立獨立 Vite 雛形站（4 個代表頁面），**絕對不碰 `apps/v3_eidos/`**。執行者：Claude Opus（claude-opus-4-7）。 | 🟡 OPEN |
| JOB-202 | **前端守則與 ei_web SKILL 硬閘同步**：`docs/技術設定/前端開發與AI實作守則.md` 從 66 行精簡至 45 行（刪除 SOP 5 具體 class 名、SOP 7 通用清潔程式碼等與 CLAUDE.md 重複項）；測試層級表由錯誤的 L1/L2/L3 改為精確對應 L1-3/L2-1/L2-2；同步修正 `_agent/skills/ei_web/SKILL.md` 第一條硬閘「禁止 TailwindCSS 類名」（與專案實際技術棧 Tailwind + shadcn/ui 矛盾）。`/pj_audit` 稽核 5/5 PASS。**本單為事後補單登記**，已留下紀律痕跡供未來引以為鑑。見 `jobs/JOB-202-Report.md` | 🟢 DONE |

### 2026-04-19
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-201 | **AboutView 題庫設定連動修正**：修復 admin 後台 `library_config` 對前台「題庫總覽」tab 完全無效的問題。`AboutView` 改接受 `libraryConfig` prop（來源：`Index.tsx` 從 `/api/settings` 取得），移除獨立 localStorage 讀取；`Index.tsx` 傳入 prop；subjects 過濾邏輯改為 allowlist（subjects dict 有設定時，只顯示 `enabled === true`）。本機瀏覽器驗證：G5 S2 僅顯示國語、G4 S2 僅顯示國語＋數學，與 admin 設定一致。見 `jobs/JOB-201-Report.md` | 🟢 DONE |

### 2026-04-18
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-199 | **補盲測：G3 國語康軒 L4/L6 + G4 社會南一 L6**：對三檔執行 `run_blind_eval.js`（Gemini-3.1-Flash-Lite，免費額度）；L4 20題 100%、L6 29題 100%、SOC L6 28題 100%，全部 Match Rate 100%。G3 下國語康軒升 QL4（442/442）、G4 下社會南一升 QL4（178/178）。重新生成 `libraryStats.json`。見 `jobs/JOB-199-Report.md` | 🟢 DONE |
| JOB-198 | **全量重評 + backup 排除 + 限已開放科目統計**：對 380 檔已開放科目（G3-G6 × S2）執行 canonical QL 重評，更新所有題目的 `quality_level` 欄位；`generate_library_stats.js` 新增 `OPEN_GRADE_SEMESTERS` 與 `isBackupDir()` 過濾；新增 `scripts/batch_reevaluate_all.js` 批次腳本。最終 57 個 publisherStats：QL4 × 16、QL3 × 8、QL1 × 33。英語、G4/G5 數學、G5 自然/G6 自然社會數學因無 KL4 per-lesson 雙檔結構判為 QL1（實際狀況誠實反映）。見 `jobs/JOB-198-Report.md` | 🟢 DONE |
| JOB-197 | **QL 定義 canonical 整合**：建立 QL Single Source of Truth 於 `question/README_驗證與盲測準則.md` §4，整合五系統（KL/RM/CQI-P/CQI-V/QL）關係；統一 7 份文件與 UI 用語；重構 `evaluate_question_quality.js` 每題 QL 判定（改為檢查 KL4 單課研究紀錄+考古題與討論是否存在 + `blind_evaluation===true`），檔級 QL 門檻由 80% 升至 90%；UI 文案改為「{QL4} 代表 該題庫有 90% 的題目達到 {QL4} 以上的標準」。遺留：題目 JSON 的 `quality_level` 欄位未全量重評，英語因無 KL4 per-lesson 結構若重跑會降級。見 `jobs/JOB-197-Report.md` | 🟢 DONE |
| JOB-196 | **QL 定義重構 + 全科統計更新**：重新定義題庫品質等級計算邏輯——每題以 `blind_evaluation===true` 判定 QL4、`quality_level≥QL3` 判定 QL3、`≥QL2` 判定 QL2；科目等級改為「全科累積比例 ≥ 90%」取代舊版「單課最高值 ≥ 80%」。更新 `scripts/generate_library_stats.js`（新增 `getQuestionQLevel()`、`computeSubjectQL()`）並重新生成 src/public 兩份 `libraryStats.json`。產出升級分析表：G3 S2 國語康軒（差 15 題）、G4 S2 社會南一（差 11 題）最接近 QL4。見 `jobs/JOB-196-Report.md` | 🟢 DONE |
| JOB-195 | **G3 國語 S2 重寫三檔 Cursor 獨立驗證**：對翰林 L8《行人的守護者》、康軒 L4《工匠之祖》、康軒 L6《神奇密碼》執行 `evaluate_question_quality.js`（三檔 `biasWarning: null`；檔級 L8=QL4 avgCqi 9.30、L4/L6=QL3 avgCqi 6.69／5.75）；依 KL4 對讀並每檔抽查 ≥10 題，確認課文對應與 `answer_index`／`explanation` 一致；**未修改**題庫 JSON；盲測未於本 JOB 執行。見 `jobs/JOB-195-Report.md` | DONE |
| JOB-194 | **G3 康軒國語 S2 L4《工匠之祖》30 題、L6《神奇密碼》29 題全數重寫**：發現原題根本性內容錯誤（L4 含 22 題《愛與成長的腳印》，L6 全為禮貌用語），由 Claude Code 依 KL4 研究文件全數重寫；主動設計三種等長選項策略確保 `biasWarning: null`；L4 正解最長比 13.3%，L6 亦通過；兩檔均 QL3、`biasWarning: null`；已跑 `generate_library_stats.js`。見 `jobs/JOB-194-Report.md` | 🟢 DONE |
| JOB-193 | **G3 翰林國語 S2 L8《行人的守護者》重出 30 題**：依 KL4 單課與考古討論重寫 `G3_S2_CHI_HANLIN_L8.json`；`evaluate_question_quality.js` 檔級 **QL4**、**biasWarning: null**、單題 QL4×30；`review_status=pending_review` 待另開盲測；已跑 `generate_library_stats.js` 並同步 `public/data/libraryStats.json`。見 `jobs/JOB-193-Report.md` | 🟢 DONE |
| JOB-191 | **explanation 元評論句型清除**：以 JOB-190 Phase 2 產出（743 筆命中、350 題）為輸入，建立 `scripts/clean_explanation_artifacts.js`（11 條 sentence-level 正規表達式 + 二次標點清理）；實際執行清除 80 個 JSON 檔，成功清除 **165 題**、標記 review_needed **83 題**（explanation 全為元評論、需人工補寫）、102 題未命中。三道安全機制：dry-run 預覽、review_needed 保護、執行紀錄 `logs/clean_explanation_2026-04-17T18-04-59.json`。開發過程修正 3 個 bug（批判性思考過廣、孤立句點殘留、review 門檻過高）。見 `jobs/JOB-191-Report.md` | 🟢 DONE |
| JOB-192 | **review_needed explanation 補寫（83 題）**：依 `logs/clean_explanation_2026-04-17T18-04-59.json` 清單，補寫 34 個 JSON 檔內 83 題之 `explanation`（學科向解析、對齊 `answer_index`）；附 `jobs/JOB-192-explanations.json` + `scripts/apply_job192_explanations.mjs` 供重現；逐檔執行 `evaluate_question_quality.js` 通過。見 `jobs/JOB-192-Report.md` | 🟢 DONE |

### 2026-04-16
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-190 Phase 2 | **explanation 元評論關鍵字深度掃描**：補強 Phase 1 頻率分析的盲區（盲測機制從不驗收 explanation，低頻分散模板在 ≥5 門檻下不可見）。新增 `scripts/scan_explanation_artifacts.mjs`，以 12 類正規表達式掃描 654 個 JSON / 12,980 題；命中不重複題數 **350 題** / 743 筆紀錄。重災科目：G3/Chinese/S2（390 筆）、G4/Chinese/S2（125 筆）。輸出 `explanation_元評論_關鍵字掃描.md/.json`，作為 JOB-191 清除腳本精確輸入。見 `jobs/JOB-190-Report.md` | 🟢 DONE |

### 2026-04-15
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-190 Phase 1 | **全科三欄位高頻片段分析**：掃描 653 個題庫 JSON / 12,930 題，對 `question`/`scenario`/`explanation` 三欄位進行句號+逗號雙重分割頻次分析；輸出各欄位 Top 100 榜（含分科子榜）及 JOB-128 舊案 36 個模式對照（殘留 0 個）；285 片段全數加入 🔴/🟡/🟢 判斷欄（🔴20/🟡18/🟢247）。腳本 `scripts/analyze_field_segments.mjs` 已產出。見 `jobs/JOB-190-Report.md` | 🟢 DONE |
| JOB-189 | **全庫 AI 評註殘留清除**：掃描 653 個題庫 JSON，修改 243 檔（兩輪執行）、7,621+ 個選項；AI 評註殘留從 2,124 個降至 **0 個**；清除模式涵蓋尾綴型（4 種）、嵌入型、括號型重複評註（4 種）、前綴垃圾、尾部全形空白共 10+ 種規則；腳本 `scripts/clean_option_artifacts.js` 已產出（含 dry-run 模式）；另重建兩個 `libraryStats.json`（src/data: 98 組合；public/data: 658 檔 12,980 題）。遺留：G5 翰林 L4 Q28「標記」「物件」後綴待後續 JOB 處理。見 `jobs/JOB-189-Report.md` | 🟢 DONE |

### 2026-04-13（JOB-188 補充）
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-188 §A | **上版前題庫抽樣驗證**：29 個開放組合 × 3 題 = 87 題全部抽驗。D1 格式 100%、D2 欄位 100%、D3 答案可信 100%、D4 文字品質 72.4%（63/87）。發現系統性問題：24 題含 AI 出題評註殘留（「這點在分析單元核心時非常關鍵」等），涉及 13 個組合，社會科（G3/G4 三版本）最嚴重。另發現 `libraryStats.json` 資料不完整（totalIndexed=15，實際 12,930 題）。§B 瀏覽器驗證因擴充套件未連線待後續執行。見 `jobs/JOB-188-Report.md`、`docs/reports/JOB-188-題庫抽樣驗證報告.md` | 🟡 §A DONE，§B 待補 |

### 2026-04-12
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-179 | G5S2 自然 KL4 單課研究建置：三版本（翰林/康軒/南一）各 4 課，雙檔/課 = 24 檔；每課 12 道考古題 / 2 來源達標；康軒 L11 確認廢棄殘留（待另開清理 JOB）；WebFetch 受限，考古題依課綱知識點建立並標注 tcool.cc ID 供後續驗證 | 🟢 DONE |
| JOB-180 | G5S2 社會 KL4 單課研究建置：翰林 L1-L6（12 檔）+ 康軒 L1-L5（10 檔）+ 南一 L1-L5（10 檔）= 32 檔；每課 12 題 / 3-4 來源；考古題來源：勝利國小段考卷、大直/和順/東光國小（全國中小學題庫網）等真實考卷 | 🟢 DONE |
| JOB-181 | G5S2 數學 KL4 單課研究建置：三版本 L1-L10 = 60 檔；翰林課名確認（L1 數的十進位結構 → L10 線對稱圖形）；視覺圖形題 10 課標注（體積/容積/線對稱/統計圖等），供後續盲測 triage 參考 | 🟢 DONE |
| JOB-178 | G5S2 國語三版本盲測（`question/platform/G5/Chinese/S2`）：全量 `--force` 完成；`run_blind_eval.js` 修正五下國語 R4 路徑、KL4 依 `meta.title` 與課次對齊；康軒曾誤配 KL4 已重跑；`j178_g5s2_chinese_apply.js` 回寫 `is_publishable`；多課未達每課 25 題可上版、大量 Mismatch 待人工 triage。見 `jobs/JOB-178-Report.md` | 🟡 未達 DoD（待 triage／補題） |
| JOB-182 | G5S2 國語 KL4 相關性刪題：KL4 研究比對確認 14 課脫節，刪除 455 題，保留 22 課 559 題。見 `jobs/JOB-182-Report.md` | 🟢 DONE |
| JOB-183 | G5S2 國語 14 課重出題補強：翰林 L1/L8/L10/L11、康軒 L4/L7/L9/L10/L12、南一 L1/L5/L6/L7/L12；共 625 題，全課 QL3（avgCqi 5.80–8.94）；manifest 未完全同步（遺留）。見 `jobs/JOB-183-Report.md` | 🟢 DONE |
| JOB-184 | **G5S2 社會三版本全量出題完成**：HanLin 補題至 L1-L5（L2 BIAS 修正，L4/L5 補充至 45 題各）共 165 題，CQI-P 全課 ≥5.5（平均 6.84–7.27）；康軒 L1-L5 全課 225 題，CQI-P 7.07–7.27（平均 7.17）；南一 L1-L5 全課 225 題，CQI-P 7.07–7.25（平均 7.17）；品管：BIAS 平衡已執行，欄位驗收 0 errors；待盲測驗證（CQI-V）與上架決策。見 `jobs/JOB-184-Report.md` | 🟢 全量出題 DONE |

### 2026-04-11
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-102~109 結案 | G3S2 全科目最終清理：backup/U1-U5（翰林社會廢棄舊版 150 題）刪除；自然/社會共 9 題 mismatch 完成 triage（3 幽靈清除 + 6 TYPE-A）；**數學 154 題視覺圖形封存**（is_publishable=false、TYPE-C）—— AI 文字盲測無法處理，待後續視覺盲測能力建置；部分數學課次 pub < 25 為已知限制；G3S2 國語 JOB-103 虛假彙報問題已由 JOB-165 修復確認（verifying_date=2026-04-08）；見 `jobs/JOB-102-109-Report.md` | 🟢 DONE |
| JOB-177 | 翰林四下社會 L3 KL4 補強：從已下載大華國小期中考（mockId=20000123）選取「自來水輸送系統」+「水資源主要來源」2 題補入，L3 由 8 達 **10 題**；翰林版 L1-L6 全課 KL4 達標 | 🟢 DONE |
| JOB-171 | G4S2 社會三版本：`meta.title` 修正；康軒／翰林補題、南一重產各 30 題／課；KL4 注入 `auto_generate_questions.js`；`auto_balance`＋盲測（Gemini-3.1-Flash-Lite）；`job171_phase3_g4s2_social_publish`；南一 L6 全部重產（28 題 100% Match）補完；可上版題數康軒 174／翰林 177／南一 175（L6 共 28 題）；三版本全課 ≥25 達標；見 `jobs/JOB-171-Report.md` | 🟢 DONE |
| JOB-176（非正式）| 南一四下社會 KL4 考古題補強：tcool.cc mock quiz 抓取廣興國小（112下 mockId=17921，18題）+ 東光國小（113下 mockId=20001081，19題）；分類回填 L1（12題/3來源✅）、L2（12題/3來源✅）、L3（17題/3來源✅）；另抓廣興112下期末2（mockId=18229，19題）+ 東光113下期末2 Q17 補強 L6 至 6 題（3來源）；全掃 tcool.cc period=3/4 共 8+1 頁確認無更多南一社會四下 mock，L6 屬低出題頻率單元（6題為可達上限）；翰林四下 L2 已於前次達標（13題）一併確認 | 🟢 DONE |
| JOB-175（非正式）| 多 Agent 執行機制補寫：CLAUDE.md §3.3、派工準則 §5.0、Bootstrap L1 角色分工表 + 多 Agent 摘要區塊、orchestrator.js 注解補齊；修正「多 Agent 呼叫方式只藏在程式碼」的文件缺失；JOB-171 cursor agent 已背景啟動（PID 83202） | 🟢 DONE |
| JOB-174 | JOB-167~173 遺留項目彙整收尾：KL4 考古題門檻 8→10 同步、Hook 摘要加入文件設計原則、JOB-168/170/172/173 補結案 | 🟢 DONE |
| JOB-173 | Agent 文件設計原則研究：研究 Claude Code 源碼分析/Spec Kit/Andrew Ng 4 來源，產出通用作業準則第九章（§10.1-10.7 七項原則）+ 跨專案通用研究報告（`0_AI_Project/`） | 🟢 DONE |
| JOB-172 | 考古題蒐集方法探索：突破 tcool.cc 403（mock quiz 法）、擴充至 4 來源管道、Production Gate 升級 ≥10/≥2、課次分類準則、智財保護條文 | 🟢 DONE |
| JOB-170 | G4S2 社會 KL4 單課研究建置：三版本 6 課 × 雙檔 = 36 檔；考古題真實性重做 | 🟢 DONE |

### 2026-04-10
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-169 | G4S2 自然：南一 120 題依 KL4 重產後 <code>run_blind_eval.js …/NanYi --force</code> 全 Match；<code>j169_phase3_apply</code> 納入 <code>ai_selected=-1</code> 閘門（翰林 L3／L4 各 1 題不可上版，其餘課級仍 ≥25）；<code>normalize_manifest</code>；見 `jobs/JOB-169-Report.md` | 🟢 DONE |
| JOB-167 | G3S2 數學康軒 L3／社會康軒與南一補題後盲測、Mismatch triage（社會 3 TYPE-A；數學 L3 7×TYPE-A、1×TYPE-C）、<code>is_publishable</code> 與 manifest；見 `jobs/JOB-167-Report.md` | 🟢 DONE |
| JOB-168 | G4S2 自然 KL4 單課研究建置：三版本 4 課 × 雙檔 = 24 檔；另修正 `run_blind_eval.js` R4 映射（自然/社會/數學共 16 處）；見 `jobs/JOB-168-Report.md` | 🟢 DONE |

### 2026-04-09
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-166 | 盲測 R4：G3 國語 S2 優先讀取 `knowledge/課綱研究/國語/三下/*/KL4_*_單課研究紀錄.md`（略過 LLM 萃取）；南一 L1/L2/L3/L8 `--force` 重測，ai=-1 由 17 歸零（四課合計）；1 題 TYPE-C；見 `jobs/JOB-166-Report.md` | 🟢 DONE |

### 2026-04-08
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-165 | G3S2 國語三版本全量盲測（`run_blind_eval.js --force`）、MTP 分類 44 題、TYPE-B 1 題修正答案、課級 `is_publishable`≥25 全達標；`run_blind_eval.js` 金鑰解析與避免覆寫 `cqi_score`；見 `jobs/JOB-165-Report.md` | 🟢 DONE |
| JOB-164 | G3S2 國語三版本：`evaluate_question_quality.js` 研究檔遞迴搜尋＋三下 `KL4_三下_國語_原始研究素材庫.md` fallback；`auto_balance_json.js` 支援單檔、消 BIAS；翰林 78 題擴寫過短解析、康軒 L8 擴寫解析；各課 avgCqi≥5.5；`normalize_manifest`；見 `jobs/JOB-164-Report.md` | 🟢 DONE |

### 2026-04-06
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-160 | 準則規範文件整體重構（第五次）：套用 prompts.ts 四原則（分散強化/快取邊界/薄層觸發/多層防禦）；新建 CLAUDE.md 自動載入指令集；9 份 Skill 瘦身為指針式（平均 50→18 行）；通用作業準則新增 §1.0 角色分工表；R3/R4 術語統一為 KL3/KL4；audit+pj_audit 合併 | 🟢 DONE |
| JOB-153 | G4 S2 國語全版本補題 × 盲測 × Mismatch 審視：三版本各 360 題（1080 / 1080）補齊，CQI-P ≥ 5.5，221 題 Mismatch 全數處理；同步修正 `run_blind_eval.js` R4_MAPPING 路徑；補救 JOB-158-Report 誤判 | 🟢 DONE |
| JOB-152→JOB-158 事件 | 白名單批量初始化（JOB-152）導致 `blind_evaluation=true` 不代表真實盲測通過；建立「批量欄位初始化後必附題數分布稽核」準則；詳見 `JOB-159-事件備忘錄-白名單初始化誤判.md` | 📌 已建檔 |

### 2026-03-30
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-133 | 三層規範架構：`README_通用作業準則.md`（第 2 層通則）＋`README_任務派工準則.md`（第 3 層派工／Discord／流水號）；刪除 `README_專案作業準則`／`README_專案任務準則`；全庫引用、根 `README`、`.cursorrules`、`job_manager` 註解與 §2.4→第三章 §3.4 對齊 | 🟢 DONE |

### 2026-03-28
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-123 | 規範與腳本對齊：題庫／知識管線稽核（README、作業準則、KL3 索引、ei_qst／ei_research、job_manager／verify_jobs） | 🟢 DONE |
| JOB-114 | 全站重構後文件結構二次稽核 (規範文件 v6 定案) | 🟢 DONE |
| JOB-115 | 題庫重構複核與多源題庫正規化收斂 (v3 格式統一) | 🟢 DONE |
| JOB-116 | 國文品質量產驗證與底層邏輯修補 (G3-G6 L1-L6) | 🟢 DONE |
| JOB-122 | 國語科研究階段重建 (由原 JOB-118 拆分) | 🟢 DONE |
| JOB-119 | 設計國語科 KL3 與 KL4 研究範本 (雙檔架構/認知調適) | 🟢 DONE |
| JOB-118 | 建立全域模型計價與物理防呆腳本 | 🟢 DONE |
| JOB-121 | `dojob` 併入 `pj_job`；新建 `docs/README_任務派工準則.md`；模板與引用對齊 | 🟢 DONE |
| JOB-120 | 三下國語 15 課正式課次研究紀錄與考古題補完 (QL4) | 🟢 DONE |

### 2026-03-29
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-130 | 派工單流水號稽核與檔名準則收斂：`job_manager.js` 新增 `next`/`audit`、開單前多重驗證；關鍵決策：正式派工僅得由 `create` 指令產出 | 🟢 DONE |
| JOB-131 | 社會/自然占位類字串掃描驗證：確認 SocialStudies=0、Science=0，無須清除 | 🟢 DONE |

### 2026-03-22
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-098 | 全站品質審計與管線對齊 | 🟢 DONE |
| JOB-099 | 六下題庫導覽與分課題數修正 | 🟢 DONE |
| JOB-100 | 六下社會/自然題數補齊 | 🟢 DONE |

### 2026-03-21
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-072/073 | CQI v2 七維度重構 + G6S2 康軒國語盲測 (100% Match)；關鍵決策：題庫驗證正名「盲審驗證」，Position Bias 問題促成 `auto_balance_json.js` | 🟢 DONE |
| JOB-074 | G3S2 南一版自然 U4 補強：由 4 題增補至 30 題（CQI 8.25 / QL4） | 🟢 DONE |

### 2026-03-20
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-066 | G6S2 自然科 R3/R4 建立；關鍵決策：探究實作占比≥30%、嚴格區分熱效應/磁效應場景 | 🟢 DONE |
| JOB-064 | G6S2 社會科 R3/R4 建立；關鍵決策：史地因果+公民決策占比↑、情境標籤強制引入 | 🟢 DONE |
| JOB-062 | G6S2 國語科 QL4 題庫完結，作為高年級品質標竿 | 🟢 DONE |

> 📊 題庫進度詳見 → [進度彙整_題庫研發與產出.md](進度彙整_題庫研發與產出.md)

---

## 三、技術債與優化候選

### P0（高優先）
- [ ] Cloudflare Wrangler v4 升級與相容驗證
- [ ] 後端 API 正式完成來源遷移（移除委派入口）
- [ ] 部署與維運文件統一

### P1（中優先）
- [ ] 管理後台路由切分與懶載入強化
- [ ] 題庫資料快取策略優化
- [ ] 錯誤監控與告警補強

### P2（低優先）
- [ ] UI 微動效與互動細節提升
- [ ] 長期技術債巡檢節奏化
