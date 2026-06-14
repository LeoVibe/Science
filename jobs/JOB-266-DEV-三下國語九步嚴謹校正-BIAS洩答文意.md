*Created by USER at 2026-06-14 18:30*

`last_updated`: 2026-06-14 18:30
`updated_by`: Claude Code (claude-opus-4-8[1m])

# JOB-266-DEV-三下國語九步嚴謹校正-BIAS洩答文意

**`job_type`**：`question_verify`（盲測＋校正，含 BIAS／洩答／文意）

## 📌 任務背景（這 session 的系統性發現）
出題產生器（gpt-5.5/Codex）留下四類瑕疵，舊盲測未擋住即上架：
1. **洩答標註**：錯選項掛「這也是作者想強調的重點之一」「（與課文重點不符）」等出題後設評語（已清除 commit 1d0c5442/920debb9）。
2. **正解最長 BIAS**：三下國語 47-66%（翰55/康58/南66），學生「選最長」就中。
3. **文本錯位**：題目對錯課文（康軒 L1《許願》前 3 題引用「美好生活的起點」，課文 0 次）。
4. **原題答案標錯**：explanation 描述答案 ≠ answer_index（社會翰林 L5 已揪出 3 題）。

**QL4 標準漏洞**：原本只看盲測通過、不檢查 BIAS／洩答，故瑕疵題照上架——已補規範（BIAS 為上架硬門檻，不分 QL3/QL4，commit 59faa5d4）。
**方法論事故**：背景 subagent 再派的孫 agent 寫入不落地（社會翰林實證），故規定 subagent 親自完成、git diff 自驗。

完整設計見 `docs/superpowers/specs/2026-06-14-盲測校正流程改進-design.md`。

## 🎯 任務目標
三下國語三版（翰林 350／康軒 442／南一 331）全部走**九步嚴謹校正**，BIAS 正解最長降至 ≤40%、洩答零殘留、文意對照 KL4、答案錯誤揪出下架。

## 📜 流程與 Prompt（唯一真相）
**完整九步流程與 subagent prompt 模板**：`docs/盲測校正九步流程.md`
九步＝讀取證明→盲讀作答→文意逐題引用→迷思檢查→taxonomy 深入度→BIAS 校正→重驗單一正解→校正後重新盲測→解析一致性檢查。

## 🚧 任務邊界
- 🔒 不改 正解／answer_index／題意；只重寫過短錯選項平衡長度＋清洩答。
- 🔴 subagent 不得再派孫 agent；寫入須 git diff 自驗落地。
- 發現的其他缺陷記入待辦，不順手改規格。

## ✅ 驗收 Checklist
- [ ] 三版正解最長比例 ≤ 40%（evaluate 二次驗）
- [ ] 洩答殘留 = 0
- [ ] D-INT 答案對位 0 錯
- [ ] PM 全量 grep 核對 subagent 引用句真實性
- [ ] 文意錯位／答案錯題 標 pending+is_publishable=false
- [ ] 升級題回寫 verifying_model=claude-sonnet-4-6 等欄位

## 📍 執行狀態
- 2026-06-14：dispatch 三下國語翰/康/南 3 支 Sonnet subagent（九步），進行中。

## 真實回報
＄作業匯總：Token數:- | 花費: - | 使用模型: claude-sonnet-4-6（校正）/ claude-opus-4-8[1m]（PM） | 執行者: Claude subagent
