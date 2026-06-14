*Created by Claude Code (claude-opus-4-8) at 2026-06-14*

`last_updated`: 2026-06-14
`updated_by`: Claude Code (claude-opus-4-8)

# JOB-257-AG-三下五下社會品質修復與上架交接

**`job_type`**：`mixed`（question_verify 盲測修復 + 上架交接）
**`executor`**：內容校正驗證 Claude（本 session）→ **上架 station（另一 session）接手整合上版**
**`model`**：盲測 claude-opus-4-8（訂閱制，未用 API）

> ⚠️ **給上架 station**：本 session 只做內容校正與盲測驗證，**未碰正式檔顯示內容、未 commit、未 push、未 sync public**。所有可上架成果已備妥在下述路徑，請依「§3 上架作業步驟」整合上版。

---

## 1. 三下社會：6 課系統性 BIAS 修復（用新題替換）

### 問題
三下社會舊版有 **6 課系統性 BIAS**（evaluate 判 QL1，正解選項明顯過長，學生選最長就對）：
- 康軒 L2、L4、L5
- 南一 L1、L3、L4

### 解法
用 JOB-252 重出的新題（選項對稱、無 BIAS）替換。已盲測驗證：

| 課 | 新題盲測 | evaluate |
|:--|:--|:--|
| 康軒 L2/L4/L5 | 150/150 (100%) | QL4 cqi 9.2 bias=None |
| 南一 L1/L3/L4 | 150/150 (100%) | QL4 cqi 9.2 bias=None |

新題已回寫 QL4、is_publishable=50/50，**存放於對應 `_new.json`**：
```
question/platform/G3/SocialStudies/S2/KangHsuan/G3_S2_SOC_KANGHSUAN_L2_new.json
question/platform/G3/SocialStudies/S2/KangHsuan/G3_S2_SOC_KANGHSUAN_L4_new.json
question/platform/G3/SocialStudies/S2/KangHsuan/G3_S2_SOC_KANGHSUAN_L5_new.json
question/platform/G3/SocialStudies/S2/NanYi/G3_S2_SOC_NANYI_L1_new.json
question/platform/G3/SocialStudies/S2/NanYi/G3_S2_SOC_NANYI_L3_new.json
question/platform/G3/SocialStudies/S2/NanYi/G3_S2_SOC_NANYI_L4_new.json
```

### 三下社會替換後最終樣貌（17 課全 QL4 無 BIAS，已逐課驗證乾淨）
| 版本 | 用新題（_new 替換正式檔）| 保留舊版 |
|:--|:--|:--|
| 翰林 | — | L1-L6（已 QL4 無 BIAS）|
| 康軒 | **L2、L4、L5** | L1、L3、L6 |
| 南一 | **L1、L3、L4** | L2、L5 |

⚠️ 注意：6 課新題為 **50 題/課**，舊版為 30 題/課。替換後 manifest 的 count 需更新（康軒 L2/L4/L5→50、南一 L1/L3/L4→50）。

---

## 2. 五下社會：未盲測補盲測（康軒/南一 10 課 450 題）

### 問題
五下社會康軒/南一 10 課（各 5 課×45 題）**從未盲測**（blind=0、is_publishable=0），前台顯示「尚未建構題庫」。

### 解法
已 Claude subagent 盲測：**450/450 (100%) Match**。**source 已回寫**（blind_evaluation=true、is_publishable=true、QL4），路徑：
```
question/platform/G5/SocialStudies/S2/KangHsuan/G5_S2_SOC_KANGHSUAN_L1~L5.json
question/platform/G5/SocialStudies/S2/NanYi/G5_S2_SOC_NANYI_L1~L5.json
```
- 可上架：康軒 224/225、南一 223/225
- **5 題 pending**（4 題幹空白+1 缺答案，品質待補，不影響整課顯示）

---

## 3. 上架作業步驟（給上架 station 執行）

### A. 三下社會（6 課新題替換）
```bash
# 1. 用 _new.json 覆蓋對應正式檔
for f in KangHsuan/G3_S2_SOC_KANGHSUAN_L2 KangHsuan/G3_S2_SOC_KANGHSUAN_L4 \
         KangHsuan/G3_S2_SOC_KANGHSUAN_L5 NanYi/G3_S2_SOC_NANYI_L1 \
         NanYi/G3_S2_SOC_NANYI_L3 NanYi/G3_S2_SOC_NANYI_L4; do
  mv "question/platform/G3/SocialStudies/S2/${f}_new.json" "question/platform/G3/SocialStudies/S2/${f}.json"
done
# 2. 更新康軒/南一 manifest（這6課 count 改 50）
# 3. sync 三下社會康軒/南一到 public
```

### B. 五下社會（source 已回寫，直接同步）
```bash
# sync 五下社會康軒/南一 source → public（10 檔）
```

### C. 部署
```bash
# git add（精確：只 add 三下/五下社會相關檔，避免帶上無關的 144 個未 commit）
# commit + push（postBuffer 已設 500MB，push 會順）
```

---

## 4. ⚠️ git 並發注意事項

- 本 session 操作期間，發現另一 session 已 commit **3e9111ca「數英暫下架...」**，且工作目錄有 **144 個未 commit 改動**（含舊版社會 quality_level 校正等）
- **本 session 未 commit 任何題庫變更**，避免並發打架
- 上架 station 整合時，請 `git add` **精確指定**三下/五下社會檔案，不要 `git add -A`（會帶上無關殘留）
- push 前用 `git diff --cached --stat` 確認 blast radius 只含社會科

---

## ✅ 本 session 完成項（內容校正驗證）

- [x] 三下社會 6 課 BIAS 診斷 + 新題盲測替換（300/300，QL4 無 BIAS）
- [x] 五下社會 10 課盲測（450/450）+ source 回寫
- [x] 三下社會替換後 17 課就緒驗證（全乾淨）
- [x] 派工單交接（本檔）

## ⬜ 待上架 station 執行

- [ ] 三下社會 6 課 _new 替換正式檔 + manifest count 更新
- [ ] 五下社會 sync public
- [ ] git 精確 commit + push 部署
- [ ] 驗證正式站三下/五下社會顯示

## 真實回報

＄作業匯總：Token數:- | 花費: 訂閱制無單次計費 | 使用模型: claude-opus-4-8（盲測驗證）| 執行者: AG（內容校正）→ 上架 station 接手
