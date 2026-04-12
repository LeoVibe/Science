*Created by AG at 2026-04-11 10:00*

`last_updated`: 2026-04-11 11:00
`updated_by`: Claude Code (claude-opus-4-6)

# JOB-172-AG-考古題蒐集方法探索與來源擴充

**`job_type`**：`mixed`（research + docs_ops）
**`executor`**：Claude Code（使用者授權例外）
**`status`**：🔄 執行中（待 Report 定稿 + `/pj_sync` 後結案）

---

## 📌 任務背景

JOB-170（G4S2 社會 KL4 建置）執行過程中發現：
1. 現有考古題來源以 tcool.cc 期末考 PDF 為主，但**期中考 PDF 回傳 403**，無法下載
2. 部分版本（翰林 L2、南一 L1/L2/L3/L6）考古題數量不足原門檻（≥8 道）
3. 使用者要求提升門檻至「每課 ≥10 道 + ≥2 個不同來源」作為出題前置卡點
4. 綜合考卷的題目無法都明確歸屬到特定課次，需建立分類準則

上述問題均需在方法論層面解決，而非個案修補。

---

## 🎯 任務目標

| # | 目標 | 可驗證標準 | 驗證方式 |
|:--|:--|:--|:--|
| G1 | 突破 tcool.cc 期中考 PDF 403 封鎖 | ≥1 份期中考考卷存為 JSON | `cat knowledge/考古題原檔/四下/社會/G4_S2_社會_翰林_期中1_大華國小.json \| python3 -c "import sys,json; print(len(json.load(sys.stdin)['questions']))"` → 預期 ≥15 |
| G2 | 擴充考古題來源至 ≥3 個管道 | 來源索引檔列出 ≥3 管道含具體連結 | `grep -c '### 來源' knowledge/考古題原檔/README_考古題蒐集規範與來源索引.md` → 預期 ≥4 |
| G3 | 建立 mock quiz 逐題作答 SOP | SOP 含技術細節、已知 error、修正方式 | 規範檔「步驟二」段落含 `next-btn`、`1500ms`、`正確答案是` 三個關鍵字 |
| G4 | 升級 Production Gate | 研究架構總綱門檻為 ≥10 道 + ≥2 來源 | `grep '10 道' knowledge/README_研究架構總綱.md` → 有匹配 |
| G5 | 建立課次歸屬分類準則 | 規範檔含分類決策表 | 規範檔「課次分類準則」段落（約 line 175-195）含 `ambiguous`、`L2_or_L3`、三行判定規則 |
| G6 | 智財保護方案 | `.gitignore` 排除 + 蒐集規範載明使用邊界 | `.gitignore` 含 `knowledge/考古題原檔/` + 規範檔§一含「僅供內部研究」條文 |

---

## 🚧 任務邊界

**本次任務只做：**
- 探索考古題來源網站，記錄可用連結
- 用 mock quiz 法抓取考卷並存為 JSON 原檔
- 更新兩份準則檔案（研究架構總綱 + 考古題蒐集規範）
- 建立智財保護措施（.gitignore + 使用範圍限制條文）

**本次任務不做：**
- 不修改 KL4 考古題與討論檔（回填為另案）
- 不出題、不跑盲測
- 不修改出題準則或盲測準則
- 不 push 任何考古題原檔到 GitHub

---

## 📖 執行步驟

> 以祈使句撰寫，供不了解背景的 Agent 亦可依此重現。已知技術結論見「技術發現紀錄」段落。

### 階段一：驗證 mock quiz 抓題法（G1）

1. 從 `knowledge/考古題原檔/tcool_exam_index.json` 取得目標考卷的 mock ID
2. 用 Chrome 工具導航至 `https://www.tcool.cc/mock/{ID}/`
   - 若遇 Cloudflare "請稍候..." 頁面，等 3-5 秒後重新 `read_page`
3. 點擊「開始測驗」按鈕
4. 逐題執行以下流程（每卷約 20 題）：
   a. `get_page_text` 抓取題幹與四個選項
   b. `javascript_tool` 執行 `document.querySelector('div.option').click()`
   c. 等待 1500ms（答案揭曉動畫）
   d. `get_page_text` 讀取正確答案（辨識「正確答案是(X)」或「答對了」）
   e. `javascript_tool` 執行 `document.querySelector('.next-btn').click()`
      **⚠️ 此行必須是函式最後一行，不加 await，否則頁面切換會導致 context 失效**
5. 將所有題目存為 JSON，格式見「存檔結構」段落

### 階段二：探索並記錄新來源（G2）

6. 用 Chrome 工具前往 `https://hlmath.tw/school-examination/`，記錄所有國小段考連結
7. 前往 `https://melances.com/grade4/`，記錄各版本×考試類型的 Google Drive 資料夾連結
8. 將以上連結整理至 `README_考古題蒐集規範與來源索引.md` 對應段落

### 階段三：更新準則檔案（G3-G5）

9. 編輯 `knowledge/README_研究架構總綱.md`：
   - 將 Production Gate 從「≥8 道」改為「≥10 道 + ≥2 來源」
   - 在同段落加入課次歸屬分類原則（Classification Rule）
10. 編輯 `knowledge/考古題原檔/README_考古題蒐集規範與來源索引.md`：
    - §一 門檻同步更新為 ≥10 / ≥2
    - §二 加入來源 D（hlmath.tw）
    - §五 步驟二改寫為 mock quiz 逐題作答法（含技術要點與已知 error）
    - §五 步驟三後新增「課次分類準則」段落

### 階段四：智財保護措施（G6）

11. 確認 `.gitignore` 已含 `knowledge/考古題原檔/`
12. 在考古題蒐集規範§一加入智財使用邊界條文：
    - 考古題原檔僅供內部研究參考，嚴禁原文上架或公開散佈
    - 引用至 KL4 檔案時須改寫題幹或僅摘錄核心概念，不得全文複製

### 階段五：結案

13. 產出 `JOB-172-Report.md`
14. 執行 `/pj_sync`
15. 標記狀態為完成

---

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `knowledge/README_研究架構總綱.md` | Production Gate 所在（本次修改對象） |
| `knowledge/考古題原檔/README_考古題蒐集規範與來源索引.md` | SOP + 來源索引（本次修改對象） |
| `knowledge/考古題原檔/tcool_exam_index.json` | 708 份考卷 ID 索引 |
| `.gitignore` | 確認排除考古題原檔 |

---

## 📦 產出清單

| # | 產出物 | 路徑 | 說明 |
|:--|:--|:--|:--|
| 1 | 大華國小期中考 JSON | `knowledge/考古題原檔/四下/社會/G4_S2_社會_翰林_期中1_大華國小.json` | 20 題，含 lesson 分類標記 |
| 2 | 研究架構總綱 v4.2 | `knowledge/README_研究架構總綱.md` | Production Gate ≥10/≥2 + 分類原則 |
| 3 | 考古題蒐集規範（更新） | `knowledge/考古題原檔/README_考古題蒐集規範與來源索引.md` | 來源D + mock SOP + 分類準則 + 智財條文 |

---

## ✅ 啟動 Checklist (Pre-Flight)

- [x] 已讀取：`knowledge/README_研究架構總綱.md`
- [x] 已讀取：`knowledge/考古題原檔/README_考古題蒐集規範與來源索引.md`
- [x] 已確認 `.gitignore` 排除 `knowledge/考古題原檔/`
- [x] **已確認執行模型**：claude-opus-4-6（Claude Code 本體）
- [x] **已確認使用金鑰**：Claude Code 內建（Anthropic）
- [x] **已確認操作頻次**：手動操作，無自動化批次（mock quiz 逐題由人機協作完成）
- [x] 已閱讀「任務邊界」並確認本次範圍

---

## ✅ 驗收 Checklist (Acceptance)

> 本任務為 research + docs_ops，CQI 系列指標不適用。每項附具體驗證方式。

- [x] G1 達成：`knowledge/考古題原檔/四下/社會/G4_S2_社會_翰林_期中1_大華國小.json` 存在，questions 陣列長度 = 20
- [x] G2 達成：規範檔含來源 A/B/C/D 共 4 個管道（`grep '### 來源' README_考古題蒐集規範與來源索引.md` → 4 筆）
- [x] G3 達成：規範檔§五步驟二含 `next-btn`、`1500ms`、`正確答案是` 三關鍵字 + error 修正表
- [x] G4 達成：`grep '10 道' knowledge/README_研究架構總綱.md` → 匹配 line 104 `至少 **10 道**`
- [x] G5 達成：規範檔「課次分類準則」段落含三行判定規則（明確→計入 / 跨課→不計 / ambiguous→不計）
- [x] G6 達成：`.gitignore` line 49 排除 + 規範檔§一第 6 條載明使用邊界

---

## ✅ 成果 Checklist (Deliverables)

- [x] 產出清單 3 項，異動檔案路徑已列出
- [ ] 已執行 `/pj_sync`
- [ ] 產出 JOB-172-Report.md

> ⚠️ 上述兩項完成後，status 方可改為「✅ 完成」。

---

## 🔍 技術發現紀錄（供後續任務參考）

> 本段為執行過程中累積的技術結論，非執行步驟。供後續任務查閱。

### tcool.cc Mock Quiz 技術要點

| 問題 | 原因 | 解法 |
|:--|:--|:--|
| 期中考 PDF 403 | 與期末考不同權限層級 | 改用 mock quiz 介面 |
| `fetch()` BLOCKED | claude-in-chrome 安全層封鎖 `credentials: 'include'` | 改用 mock quiz 介面 |
| `Inspected target navigated or closed` | `.next-btn.click()` 後有 `await`，頁面切換導致 JS context 失效 | click 作為最後同步操作，不加 await |
| Cloudflare "請稍候..." | 初次導航觸發 CF challenge | 等 3-5 秒後重讀頁面 |

### 考古題段考覆蓋範圍（翰林四下為例）

| 段考 | tcool period 值 | 覆蓋課次 |
|:--|:--|:--|
| 第一次段考（期中考） | 1 | L1-L3 |
| 第二次段考（期中考） | 2 | L1-L3（累進） |
| 期末考 | 3 | L4-L6 |
| 第二次段考（期末考） | 4 | L4-L6（累進） |

### 新發現來源

| 來源 | URL | 特點 |
|:--|:--|:--|
| hlmath.tw | `https://hlmath.tw/school-examination/` | 16 所國小，按縣市分類，Google Drive 連結 |
| 米蘭老師 | `https://melances.com/grade4/` | 按版本×考試類型，Google Drive 資料夾 |

---

## 遺留問題

1. **hlmath.tw 完整清單未全部記錄**：僅記錄 5 所已驗證學校，其餘 11 所待後續補充
2. **南一版期中考尚未抓取**：tcool.cc 有東光國小 mockId=20001081，可用同樣 mock quiz 法取得
3. **翰林 L2 KL4 回填**：大華國小新抓的 6 題 L2 尚未回填到 KL4 考古題與討論檔（另案處理）
4. **米蘭老師 Google Drive 403**：期中考 PDF 與期末考 PDF 權限不同，部分需人工存取
5. **已解決**：留存政策已制定（永久保留，僅限 JSON/MD 格式，禁止長期存放 PDF/HTML）

---

## 真實回報本次對話的模型與花費
＄作業匯總：Token數: - | 花費: $- | 使用模型: claude-opus-4-6 | 執行者: Claude Code
