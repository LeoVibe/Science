*Created by Claude at 2026-07-22*

`last_updated`: 2026-07-22
`updated_by`: Claude Code (claude-opus-4-8)

# JOB-282 結案報告

**`job_type`**：`mixed`（question_prod 誘答重鑄 + question_verify 雙盲驗證）
**`executor`**：Claude（主迴圈編排＋subagent 執行）

## 📊 成果摘要（本單範圍：BIAS 修正）

4 課（G5 康軒L1、翰林L2/L4/L6）「正解嚴格唯一最長」比例 42.1%~58.8%（JOB-281 發現），比照 JOB-277 已驗證方法（只加長誘答文字、不動 answer_index、不動正解語意）重鑄 106 題。PM 對每一檔獨立複驗（唯讀重算 BIAS＋逐題 answer_index 比對 vs git HEAD），**4 課 BIAS 全數降至 0.0%**，answer_index 零誤改。雙盲驗證（洗牌選項盲測，全部 106 題，非抽樣）Match Rate **105/106 = 99.1%**，唯一未命中題（康軒L1#7）經核實為課文情節記憶題、盲測者無課文可查僅能低信心猜測，非題目缺陷（同 JOB-276 先例）。4 課 CQI 重算全數 QL4（avgCQI 8.48~8.90）。

| 課次 | BIAS修正前 | BIAS修正後 | Match Rate | avgCQI |
|:--|--:|--:|--:|--:|
| 康軒 L1《你會怎麼回答？》 | 42.1%（16/38） | 0.0% | 15/16=93.8% | 8.53 |
| 翰林 L2《山與海的交響樂》 | 50.8%（30/59） | 0.0% | 30/30=100% | 8.83 |
| 翰林 L4《滿修女採訪記》 | 55.6%（30/54） | 0.0% | 30/30=100% | 8.90 |
| 翰林 L6《幸福的味道》 | 58.8%（30/51） | 0.0% | 30/30=100% | 8.48 |

## 📂 異動清單（本單範圍）

| 檔案路徑 | 說明 |
|:--|:--|
| `question/platform/G5/Chinese/S2/KangHsuan/G5_S2_CHI_KANGHSUAN_L1.json` | 重鑄16題誘答 |
| `question/platform/G5/Chinese/S2/HanLin/G5_S2_CHI_HANLIN_L2.json` | 重鑄30題誘答 |
| `question/platform/G5/Chinese/S2/HanLin/G5_S2_CHI_HANLIN_L4.json` | 重鑄30題誘答（含1題正解同義精簡） |
| `question/platform/G5/Chinese/S2/HanLin/G5_S2_CHI_HANLIN_L6.json` | 重鑄30題誘答 |
| 2份manifest（康軒/翰林） | 對應課次count/avg_cqi/quality更新 |
| `apps/v3_eidos/{public,src}/data/libraryStats.json` | 重產（`--dryRun`機制生效，0個範圍外檔案被誤寫） |
| `apps/v3_eidos/public/question/platform/`（對應鏡像） | 同步 |

## ✅ Checklist 對照結果

### 驗收 Checklist (Acceptance)
- [x] 4課BIAS全數≤40% — 實際0.0%（PM獨立複驗，非採信agent自報）
- [x] 雙盲Match Rate≥85% — 105/106=99.1%
- [x] evaluate_question_quality.js 0 crash
- [x] git diff範圍精確4檔
- [x] CQI≥6.5 — 8.48~8.90

### 成果 Checklist (Deliverables)
- [x] 成果表格、進度說明、/pj_sync、Report、commit+push 皆完成

## ⚠️ 範圍外重大發現（誠實揭露，未擅自處理）

雙盲驗證的 judge 覆核（本應只檢查「誘答重鑄是否引入新缺陷」）意外揭露一個**與本單BIAS問題完全獨立、規模遠大於本單**的既有缺陷：

| 課次 | belongs=false（題目內容與課文無關） | 佐證 |
|:--|--:|:--|
| 翰林 L2《山與海的交響樂——東海岸鐵道》（鐵道遊記） | 29/30 | 題幹描述「農夫耕作」「垃圾分類」「原住民祭典」等與課文完全無關的情境；經比對確認題幹**未被本單觸碰過**（vs git HEAD 逐字相同），屬既有缺陷 |
| 翰林 L4《滿修女採訪記》（教養院修女故事） | 29/30 | 題目測驗「小明小華救傷鳥」「追夢故事」等**課文中不存在的捏造情節**；題庫檔自身的 `blind_eval_mismatch` 欄位早已標記「題目內容與提供的課文完全無關」，卻從未被處理 |
| 翰林 L6《幸福的味道》（父女對話，氣味與幸福記憶） | 29/30 | 17題為與課文無關的自創情境，12題圍繞課文中不存在的「米勒畫作／恆久的美」主題；8題與檔案既有的 `blind_eval_mismatch` 標記吻合 |
| 康軒 L1《你會怎麼回答？》 | 0/16 | 乾淨，僅1題既有語意重疊小問題（idx29，正解與1個誘答在explanation中因果重疊，屬既有設計問題非本次重鑄引入） |

**規模**：3 課合計 87/90 題（96.7%）題目內容與實際課文脫鉤，等同 JOB-273（四下國語全文本重建）在五下國語的重現，需要**整課重新出題**（依課文重寫題幹與所有選項），不是調整誘答長度可解決。

**判定依據**：已用 `git show HEAD:<檔案路徑>` 逐一核對，這些題幹在本單開始前即已如此（本單僅動 `options` 陣列文字，未動 `question`/`scenario` 欄位），確認為既有缺陷、非本次重鑄造成或惡化。

**未處理原因**：本單 job_type 為 `question_prod`（誘答重鑄），任務邊界明訂「不可自行擴大範圍重出」；此發現規模（87題整課重出）遠超本單授權範圍，依派工紀律停止並回報，交由使用者裁定是否另開單（比照今日 JOB-281 的處置模式）。

## 🔍 驗收確認
| 欄位 | 內容 |
|:--|:--|
| 驗收者 | Claude Code（PM）＋待使用者驗收 |
| 驗收時間 | 2026-07-22 |
| 驗收結果 | 通過（本單範圍：BIAS修正，佐證見上表）；另有範圍外重大發現待使用者裁定 |
| 退回原因 | 無 |

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:約950,000（8個subagent之subagent_tokens加總） | 花費: -（Claude Code session訂閱額度內） | 使用模型: claude-opus-4-8 | 執行者: Claude
