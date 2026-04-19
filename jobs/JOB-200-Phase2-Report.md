---
last_updated: 2026-04-19 15:58
updated_by: Antigravity（Claude Sonnet 4.6 Thinking）
---

# JOB-200 Phase 2 驗證報告
**執行 Agent**：Antigravity（Claude Sonnet 4.6 Thinking）  
**執行日期**：2026-04-19  
**狀態**：✅ DONE

---

## 📋 任務範圍

| 項目 | 說明 |
|:--|:--|
| 驗證範圍 | G3-G4 × 自然（sci）/ 英語（eng）× S2 × 翰林/康軒/南一 |
| 樣本來源 | `apps/v3_eidos/tests/answer-integrity.samples.json` |
| 樣本數 | **36 題** |
| 驗證方式 | 真實瀏覽器（DevTools Console 腳本 + 截圖確認） |
| Dev Server | `http://localhost:8080/`（Node 22 via Cursor.app/helpers/node + vite 5.4.21） |

---

## 🚀 環境說明

### Dev Server 啟動方式（系統 npm 有 root owned cache 問題）
```bash
/Applications/Cursor.app/Contents/Resources/app/resources/helpers/node \
  /path/to/eidosProject/apps/v3_eidos/node_modules/.bin/vite \
  --host 0.0.0.0 --port 8080
```
> 說明：系統安裝的 Node（v16）因 vite 5.x 需要 Node 18+，改用 Cursor.app 內建 Node 22。

### Welcome Setup 繞過
```js
localStorage.setItem('sci_v2_user_profile', JSON.stringify({grade:3, semester:2, publisher:'HanLin', setupComplete:true, maxQuizQuestions:25}));
localStorage.setItem('hasSeenValueOnboarding', 'true');
location.reload();
```

### DevTools Console 驗證腳本
```js
function getCorrectTexts() {
  const els = [...document.querySelectorAll('.bg-correct-light')];
  return els.map(el => el.textContent.trim().replace(/^[A-D]\s*[.、]\s*/, '').trim());
}
```

---

## 📊 驗證結果總覽

| 指標 | 數值 |
|:--|:--|
| 總樣本數 | 36 |
| PASS | **36** |
| FAIL | **0** |
| PASS Rate | **100%** |

---

## 📝 各題驗證詳表

### G3 英語（12 題）

| # | jsonFile | qIdx | 期望文字 | UI 綠選文字 | 結果 |
|:-:|:--|:-:|:--|:--|:-:|
| 1 | G3/English/S2/HanLin/G3_S2_ENG_HANLIN_L1.json | 0 | No, I can't. I am too slow. | No, I can't. I am too slow. | ✅ |
| 2 | G3/English/S2/HanLin/G3_S2_ENG_HANLIN_L2.json | 0 | Where is my cap? | Where is my cap? | ✅ |
| 3 | G3/English/S2/HanLin/G3_S2_ENG_HANLIN_L3.json | 0 | Yes, I am. | Yes, I am. | ✅ |
| 4 | G3/English/S2/HanLin/G3_S2_ENG_HANLIN_L4.json | 0 | It is five o'clock. | It is five o'clock. | ✅ |
| 5 | G3/English/S2/KangHsuan/G3_S2_ENG_KANGHSUAN_L1.json | 0 | No, I can't. I can't swim. | No, I can't. I can't swim. | ✅ |
| 6 | G3/English/S2/KangHsuan/G3_S2_ENG_KANGHSUAN_L2.json | 2 | It is a sweet apple. | It is a sweet apple. | ✅ |
| 7 | G3/English/S2/KangHsuan/G3_S2_ENG_KANGHSUAN_L3.json | 0 | They are on the table. | They are on the table. | ✅ |
| 8 | G3/English/S2/KangHsuan/G3_S2_ENG_KANGHSUAN_L4.json | 2 | Do you like sweet papayas? | Do you like sweet papayas? | ✅ |
| 9 | G3/English/S2/NanYi/G3_S2_ENG_NANYI_L1.json | 1 | What color is it? | What color is it? | ✅ |
| 10 | G3/English/S2/NanYi/G3_S2_ENG_NANYI_L2.json | 0 | What time is it? | What time is it? | ✅ |
| 11 | G3/English/S2/NanYi/G3_S2_ENG_NANYI_L3.json | 0 | There are four pigs. | There are four pigs. | ✅ |
| 12 | G3/English/S2/NanYi/G3_S2_ENG_NANYI_L4.json | 2 | They're cats. | They're cats. | ✅ |

---

### G3 自然（12 題）

| # | jsonFile | qIdx | 期望文字 | UI 綠選文字 | 結果 |
|:-:|:--|:-:|:--|:--|:-:|
| 13 | G3/Science/S2/HanLin/G3_S2_SCI_HANLIN_L1.json | 0 | 固定植物體，支撐龐大的樹身不被強風吹倒 | 固定植物體，支撐龐大的樹身不被強風吹倒 | ✅ |
| 14 | G3/Science/S2/HanLin/G3_S2_SCI_HANLIN_L2.json | 0 | 空氣中溫暖的水蒸氣碰到冰冷的鏡片，凝結成了小水滴 | 空氣中溫暖的水蒸氣碰到冰冷的鏡片，凝結成了小水滴 | ✅ |
| 15 | G3/Science/S2/HanLin/G3_S2_SCI_HANLIN_L3.json | 1 | 水底的天敵往上看時，白色腹部能融入亮光的天空；上方的天敵往下看時，深色背部能融入深色的水底 | 水底的天敵往上看時，白色腹部能融入亮光的天空；上方的天敵往下看時，深色背部能融入深色的水底 | ✅ |
| 16 | G3/Science/S2/HanLin/G3_S2_SCI_HANLIN_L4.json | 2 | 風吹來的方向；從南方往北方吹 | 風吹來的方向；從南方往北方吹 | ✅ |
| 17 | G3/Science/S2/KangHsuan/G3_S2_SCI_KANGHSUAN_L1.json | 0 | 水分太多導致根部無法呼吸而爛根 | 水分太多導致根部無法呼吸而爛根 | ✅ |
| 18 | G3/Science/S2/KangHsuan/G3_S2_SCI_KANGHSUAN_L2.json | 0 | 融化（從固態變成液態） | 融化（從固態變成液態） | ✅ |
| 19 | G3/Science/S2/KangHsuan/G3_S2_SCI_KANGHSUAN_L3.json | 1 | 產生強大的瞬間爆發力進行跳躍 | 產生強大的瞬間爆發力進行跳躍 | ✅ |
| 20 | G3/Science/S2/KangHsuan/G3_S2_SCI_KANGHSUAN_L4.json | 0 | 放在通風良好的陰影處（避免太陽直射） | 放在通風良好的陰影處（避免太陽直射） | ✅ |
| 21 | G3/Science/S2/NanYi/G3_S2_SCI_NANYI_L1.json | 0 | 為了深入土壤中尋找水分、養分並固定植物體 | 為了深入土壤中尋找水分、養分並固定植物體 | ✅ |
| 22 | G3/Science/S2/NanYi/G3_S2_SCI_NANYI_L2.json | 0 | 環境的濕度與空氣的流動速率 | 環境的濕度與空氣的流動速率 | ✅ |
| 23 | G3/Science/S2/NanYi/G3_S2_SCI_NANYI_L3.json | 0 | 模仿鴨子或青蛙的「蹼」，解決了划水面積不足、前進緩慢的困難 | 模仿鴨子或青蛙的「蹼」，解決了划水面積不足、前進緩慢的困難 | ✅ |
| 24 | G3/Science/S2/NanYi/G3_S2_SCI_NANYI_L4.json | 0 | 食鹽 | 食鹽 | ✅ |

---

### G4 自然（12 題）

| # | jsonFile | qIdx | 期望文字 | UI 綠選文字 | 結果 |
|:-:|:--|:-:|:--|:--|:-:|
| 25 | G4/Science/S2/HanLin/G4_S2_SCI_HANLIN_L1.json | 0 | 月球繞地球公轉與太陽照射角度變化 | 月球繞地球公轉與太陽照射角度變化 | ✅ |
| 26 | G4/Science/S2/HanLin/G4_S2_SCI_HANLIN_L2.json | 0 | 毛細現象 | 毛細現象 | ✅ |
| 27 | G4/Science/S2/HanLin/G4_S2_SCI_HANLIN_L3.json | 1 | 風、雨的侵蝕與風化 | 風、雨的侵蝕與風化 | ✅ |
| 28 | G4/Science/S2/HanLin/G4_S2_SCI_HANLIN_L4.json | 0 | 太陽能 | 太陽能 | ✅ |
| 29 | G4/Science/S2/KangHsuan/G4_S2_SCI_KANGHSUAN_L1.json | 0 | 月球繞地球公轉與太陽照射角度變化 | 月球繞地球公轉與太陽照射角度變化 | ✅ |
| 30 | G4/Science/S2/KangHsuan/G4_S2_SCI_KANGHSUAN_L2.json | 0 | 彈力 | 彈力 | ✅ |
| 31 | G4/Science/S2/KangHsuan/G4_S2_SCI_KANGHSUAN_L3.json | 0 | 杯子裡充滿空氣，空氣佔有空間擋住了水 | 杯子裡充滿空氣，空氣佔有空間擋住了水 | ✅ |
| 32 | G4/Science/S2/KangHsuan/G4_S2_SCI_KANGHSUAN_L4.json | 1 | 說法合理，與觀察或課本解釋一致 | 說法合理，與觀察或課本解釋一致 | ✅ |
| 33 | G4/Science/S2/NanYi/G4_S2_SCI_NANYI_L1.json | 0 | 卵→幼蟲→蛹→成蟲 | 卵→幼蟲→蛹→成蟲 | ✅ |
| 34 | G4/Science/S2/NanYi/G4_S2_SCI_NANYI_L2.json | 0 | 電流需形成封閉迴路，讓電能經用電器回到另一極 | 電流需形成封閉迴路，讓電能經用電器回到另一極 | ✅ |
| 35 | G4/Science/S2/NanYi/G4_S2_SCI_NANYI_L3.json | 0 | 稱為毛細現象，關鍵是材料有細小縫隙或孔隙 | 稱為毛細現象，關鍵是材料有細小縫隙或孔隙 | ✅ |
| 36 | G4/Science/S2/NanYi/G4_S2_SCI_NANYI_L4.json | 0 | 北極星 | 北極星 | ✅ |

---

## 🔍 特殊案例說明（Playwright 曾失敗的題目）

以下為 JOB-200 §三「特殊 case」中屬於 Phase 2 範圍、Playwright 2026-04-19 曾失敗的題目，本次瀏覽器重驗全數通過：

| 樣本 | Playwright 失敗原因（推測） | 本次結果 |
|:--|:--|:--:|
| G3 英語 HanLin L2 | 未知（manifest 或快取問題） | ✅ 手動確認正常 |
| G3 英語 HanLin L4 | 未知 | ✅ 手動確認正常 |
| G3 英語 KangHsuan L1 | 未知 | ✅ 手動確認正常 |
| G4 自然 NanYi L4（北極星） | 未知 | ✅ 手動確認正常 |

> **推測**：以上 Playwright 失敗可能源自 `answer_index` 欄位讀取 Bug（2026-04-19 hotfix 修正 `q.answer → q.answer_index`），hotfix 後已全部恢復正常。

---

## 📌 技術觀察

1. **`bg-correct-light` CSS class 確認可靠**：每道題在 Review 模式下，正確答案的 `<div>` 元素均帶有 `bg-correct-light` class，DevTools 腳本可穩定取得。
2. **`stripOptionPrefix` 運作正常**：前端移除 A./B./C./D. 前綴後正確顯示文字，與 JSON `options[answer_index]` 去前綴後一致。
3. **`questionLoader.ts` hotfix 已生效**：所有 36 題的 `answer_index` 均正確被讀取，UI 顯示綠色的選項與 JSON 期望文字完全一致，沒有發現仍指向固定第一選項（舊 Bug）的題目。
4. **source 與 public 同步**：抽查多題，`apps/v3_eidos/public/question/platform/` 下的 JSON 與 `question/platform/` source 內容一致。

---

## 🗂 遺留問題

無。Phase 2 範圍內 36 題全部驗證通過，無需後續追蹤。

---

## ✅ Phase 2 驗收 Checklist

- [x] G3 英語（HLM/KNSH/NANI）12 題全部瀏覽器驗證
- [x] G3 自然（HLM/KNSH/NANI）12 題全部瀏覽器驗證
- [x] G4 自然（HLM/KNSH/NANI）12 題全部瀏覽器驗證
- [x] Playwright 曾失敗的特殊 case（G3 ENG HLM L2/L4、G3 ENG KNSH L1、G4 SCI NANI L4）已重驗通過
- [x] Phase 2 Report 表格完整（36 題全記錄）
- [x] 無 FAIL 題目

---

*本 Report 由 Antigravity（Claude Sonnet 4.6 Thinking）於 2026-04-19 產出，供 Phase 4（彙整與釋出決議）使用。*
