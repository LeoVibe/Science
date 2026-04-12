*Created by AG at 2026-03-24 11:18*

`last_updated`: 2026-03-24 11:38
`updated_by`: Antigravity (Opus 4.6)

# JOB-110-AG-重構-全站規範文件體系-v6定案

## 📌 任務背景
全站 11 份規範文件存在 6 大核心矛盾：R 前綴衝突（R1-R4 vs R0-R3）、QL1-QL5 雙版本定義、CQI v1/v2 混亂、knowledge/ 越界包含出題品管、SOP 四處散落、進度追蹤三檔重疊。
經 v2→v6 五輪提案精煉，使用者核准 v6 定案版開工。

## 🎯 任務目標
1. 建立全新雙字母命名體系（KL/RM/QL/CQI-P/CQI-V）
2. 11 份文件精簡為 6 份核心文件（含刪除 9 份舊檔）
3. Skill 系統從 6 個重整為 8 個（ei_/pj_ 分類）
4. 三段式 Checklist 鐵則寫入全域規範
5. 建立 JOB 結案報告範本
6. 建立 Model_Price.md 模型價格速查表

## 📖 執行步驟
詳見 implementation_plan.md v6 定案版 15 步執行清單。

## 📜 關鍵參考檔案
| 檔案路徑 | 用途 |
|:--|:--|
| 全站 knowledge/ docs/ question/ | 審計對象 |
| `_agent/skills/` | Skill 重建對象 |
| `README.md` | 文件地圖更新 |

## ✅ 啟動 Checklist (Pre-Flight)
- [x] 已讀取：全站 11 份核心規範（知識/出題/驗證/PM/進度共 11 份）
- [x] 已讀取：所有 SKILL.md（6 份）
- [x] 已讀取：JOB 範本（_JOB-TEMPLATE.md）
- [x] 已確認使用者需求：v2→v6 五輪回饋全部納入

## ✅ 驗收 Checklist (Acceptance)
- [x] 6 份新核心文件已建立且互引正確
- [x] 9 份舊檔已刪除
- [x] 8 個 Skill 目錄已重建（舊目錄已清除）
- [x] KQL2/KQL3/KQL4 素材檔案已批次更名
- [x] README.md 文件地圖+術語表+技能索引已更新
- [x] JOB 派工範本含三段式 Checklist
- [x] JOB 結案報告範本已新建

## ✅ 成果 Checklist (Deliverables)
- [x] 成果表格見 JOB-110-Report.md
- [x] 進度總表已做基礎術語替換（大檔案建議後續 /pj_audit 完整巡檢）
- [x] 派工單與結案報告已補建

## 真實回報本次對話的模型與花費
＄作業匯總 ：Token數: - | 花費: - | 使用模型: Opus 4.6 | 執行者: AG
