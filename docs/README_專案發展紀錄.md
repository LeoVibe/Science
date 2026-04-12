# 📋 Eidos 專案發展紀錄

`last_updated`: 2026-04-12
`updated_by`: Cursor（JOB-182 /pj_sync）

---

## 一、更版說明 (Release Notes)

> ⚠️ 此區由人工進行最終文字修飾，Agent 不主動修改。

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

### 2026-04-12
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-179 | G5S2 自然 KL4 單課研究建置：三版本（翰林/康軒/南一）各 4 課，雙檔/課 = 24 檔；每課 12 道考古題 / 2 來源達標；康軒 L11 確認廢棄殘留（待另開清理 JOB）；WebFetch 受限，考古題依課綱知識點建立並標注 tcool.cc ID 供後續驗證 | 🟢 DONE |
| JOB-180 | G5S2 社會 KL4 單課研究建置：翰林 L1-L6（12 檔）+ 康軒 L1-L5（10 檔）+ 南一 L1-L5（10 檔）= 32 檔；每課 12 題 / 3-4 來源；考古題來源：勝利國小段考卷、大直/和順/東光國小（全國中小學題庫網）等真實考卷 | 🟢 DONE |
| JOB-181 | G5S2 數學 KL4 單課研究建置：三版本 L1-L10 = 60 檔；翰林課名確認（L1 數的十進位結構 → L10 線對稱圖形）；視覺圖形題 10 課標注（體積/容積/線對稱/統計圖等），供後續盲測 triage 參考 | 🟢 DONE |
| JOB-178 | G5S2 國語三版本盲測（`question/platform/G5/Chinese/S2`）：全量 `--force` 完成；`run_blind_eval.js` 修正五下國語 R4 路徑、KL4 依 `meta.title` 與課次對齊；康軒曾誤配 KL4 已重跑；`j178_g5s2_chinese_apply.js` 回寫 `is_publishable`；多課未達每課 25 題可上版、大量 Mismatch 待人工 triage。見 `jobs/JOB-178-Report.md` | 🟡 未達 DoD（待 triage／補題） |
| JOB-182 | G5S2 國語 KL4 相關性刪題：KL4 研究比對確認 14 課脫節，刪除 455 題，保留 22 課 559 題。見 `jobs/JOB-182-Report.md` | 🟢 DONE |
| JOB-183 | G5S2 國語 14 課重出題補強：翰林 L1/L8/L10/L11、康軒 L4/L7/L9/L10/L12、南一 L1/L5/L6/L7/L12；共 625 題，全課 QL3（avgCqi 5.80–8.94）；manifest 未完全同步（遺留）。見 `jobs/JOB-183-Report.md` | 🟢 DONE |
| JOB-184 | G5S2 社會三版本出題：翰林 L1-L6、康軒 L1-L5、南一 L1-L5，共 16 課 ~640 題，進行中。 | 🟡 進行中 |

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

### 2026-03-24
| JOB | 簡述 | 狀態 |
|:--|:--|:--|
| JOB-102~109 | 長期題庫建設八大派工單 | 🟡 規劃中 |

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
