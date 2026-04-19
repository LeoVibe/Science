`last_updated`: 2026-04-18 22:30
`updated_by`: Cursor Agent

# JOB-195 Report — G3 S2 近期重寫題目 Cursor 獨立驗證

## 執行摘要

**執行者**：Cursor（獨立驗證，非原出題 Agent）
**執行模型**：Composer（Cursor 內建）
**完成狀態**：通過（未發現需修正之 `answer_index`／課文錯配；**未改動**三份 JSON）

---

## 依據文件

| 文件 | 狀態 |
|:--|:--|
| `question/README_出題與品管準則.md` | 已讀（CQI-P 門檻與 BIAS 規則） |
| KL4 翰林 L8《行人的守護者》 | 已讀 |
| KL4 康軒 L4《工匠之祖》 | 已讀 |
| KL4 康軒 L6《神奇密碼》 | 已讀 |

---

## CQI-P：`evaluate_question_quality.js` 佐證

執行指令（專案根目錄）：

```bash
node scripts/evaluate_question_quality.js question/platform/G3/Chinese/S2/HanLin/G3_S2_CHI_HANLIN_L8.json
node scripts/evaluate_question_quality.js question/platform/G3/Chinese/S2/KangHsuan/G3_S2_CHI_KANGHSUAN_L4.json
node scripts/evaluate_question_quality.js question/platform/G3/Chinese/S2/KangHsuan/G3_S2_CHI_KANGHSUAN_L6.json
```

### 翰林 L8 `G3_S2_CHI_HANLIN_L8.json`

| 項目 | 值 |
|:--|:--|
| 題數 | 30 |
| 檔級 quality | **QL4** |
| avgCqi | **9.30** |
| biasWarning | **null** |
| researchCeiling | QL4 |

### 康軒 L4 `G3_S2_CHI_KANGHSUAN_L4.json`

| 項目 | 值 |
|:--|:--|
| 題數 | 30 |
| 檔級 quality | **QL3** |
| avgCqi | **6.69** |
| biasWarning | **null** |
| researchCeiling | QL4 |

### 康軒 L6 `G3_S2_CHI_KANGHSUAN_L6.json`

| 項目 | 值 |
|:--|:--|
| 題數 | 29 |
| 檔級 quality | **QL3** |
| avgCqi | **5.75** |
| biasWarning | **null** |
| researchCeiling | QL4 |

**驗收對照（派工單）**：三檔皆 `biasWarning: null`；檔級皆 **≥ QL3**（L8 為 QL4）。

---

## 內容抽查（每檔 ≥10 題）

抽查方式：逐題比對 KL4「課文全文錄製／情節重點」與題幹、正解選項、`explanation` 是否同向；並確認 `options[answer_index]` 與 `explanation` 敘述一致。

### 翰林 L8《行人的守護者》（抽查 15 題：檔內前 15 題）

| 題序 | 抽查重點 | 結果 |
|:--|:--|:--|
| 1 | 作者林茵 vs 小綠人敘述者 | OK，`answer_index` 與解析一致 |
| 2 | 第一人稱／小綠人 | OK |
| 3 | 綠光＋引導穿越道 →「小綠人」 | OK |
| 4 | 小紅人立正＝不可過、需等待 | OK |
| 5 | 「給行人看的綠燈」意涵 | OK |
| 6 | 不疾不緩起步引導 | OK |
| 7 | 倒數將結束→快步走 | OK |
| 8 | 時間到、安全穿越 | OK |
| 9 | 「不管…不管…總是…」堅守 | OK |
| 10 | 「不疾不緩」詞義（疾／緩） | OK |
| 11–15 | 字詞辨析、引導、路口氛圍等 | OK |

其餘題（16–30）另就結尾主旨、擬人手法、生活應用題抽樣閱讀，未發現課次錯置或正解與解析矛盾。

### 康軒 L4《工匠之祖》（抽查 15 題：檔內前 12 題＋末段 3 題）

| 題序 | 抽查重點 | 結果 |
|:--|:--|:--|
| 1 | 春秋時期 | OK |
| 2 | 蓋新王宮 | OK（選項用語「王宮殿」與課文「王宮」同旨） |
| 3 | 上山砍樹 | OK |
| 4 | 斧頭鈍、人累 | OK |
| 5 | 期限近、木頭少、著急上山 | OK |
| 6–12 | 小草割傷、尖齒、鋸子、兩人來回鋸、曲尺／石磨用途等 | OK |
| 27–30 | 「不起眼的小發現」、問題解決路徑、課文精神應用 | OK |

全檔 30 題語境皆落在魯班故事線，**無** JOB-194 結案所述「錯課文整批占位」跡象。

### 康軒 L6《神奇密碼》（抽查 15 題：檔內前 12 題＋末段 3 題）

| 題序 | 抽查重點 | 結果 |
|:--|:--|:--|
| 1–3 | 校慶流程、三個「回」字、角落位置 | OK，與 KL4 摘要一致 |
| 4–7 | 聽故事、美術館導覽、車站感應、旅遊美食 | OK |
| 8–12 | 生產過程、省去錢包／支付、一清二楚、句型、部首「碼／掃」 | OK |
| 27–29 | 電影場次應用遷移、「馬上」即時性、主旨 | OK |

末段綜合題（如「活動流程、知識、票券…」）涵蓋課文所列應用，與 KL4「多元應用」敘述相容；**無** 禮貌用語誤植課文問題。

---

## 修正與重跑

- **題庫 JSON**：本次**無**修改。
- **CQI-P 重跑**：除驗收當次評分外，無因修正而追加之重跑。

---

## 遺留／範圍外（依派工單）

- **未執行** `run_blind_eval.js`（派工明訂另開 JOB）。
- **未修改** KL4 研究檔。

---

## 真實回報（本回合對話）

＄作業匯總：Token數: - | 花費: - | 使用模型: Composer（Cursor）| 執行者: Cursor
