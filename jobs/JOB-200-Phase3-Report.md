# JOB-200 Phase 3 Report

`date`: 2026-04-19  
`executor`: Codex  
`scope`: `G5-G6 × 國語` 50 樣本 + `G6 國語 KangHsuan L8/L10/L11` 特殊 case 深度驗證  
`status`: DONE

## 1. 執行摘要

- 已先閱讀 `jobs/JOB-200-AG-上版前題目正解驗證大規模分工.md` §一與 §二，並依規定用真實瀏覽器路徑驗證 UI。
- 已執行指定指令：

```bash
cd apps/v3_eidos && npx playwright test answer-integrity --project=chromium --workers=4 -g 'question/platform/G[56]/Chinese/' --reporter=list
```

- Playwright 結果：`50 passed (31.0s)`
- Phase 3 統計：
  - PASS：50
  - FAIL：0

## 2. 50 題驗證表

| # | jsonFile | qIdx | 預期文字 | UI 綠選文字 | 結果 |
|:-:|:--|:-:|:--|:--|:-:|
| 1 | question/platform/G5/Chinese/S2/HanLin/G5_S2_CHI_HANLIN_L2.json | 1 | 期待作物豐收，不辜負自己的努力 | 期待作物豐收，不辜負自己的努力 | ✅ |
| 2 | question/platform/G5/Chinese/S2/HanLin/G5_S2_CHI_HANLIN_L3.json | 3 | 平靜與舒適 | 平靜與舒適 | ✅ |
| 3 | question/platform/G5/Chinese/S2/HanLin/G5_S2_CHI_HANLIN_L4.json | 0 | 身體不舒服或受傷 | 身體不舒服或受傷 | ✅ |
| 4 | question/platform/G5/Chinese/S2/HanLin/G5_S2_CHI_HANLIN_L5.json | 0 | 採取一種積極行動的策略：即便必須抵押個人房產，也要拍出高品質的五分鐘試拍帶，展現其理想堅持標記 | 採取一種積極行動的策略：即便必須抵押個人房產，也要拍出高品質的五分鐘試拍帶，展現其理想堅持標記 | ✅ |
| 5 | question/platform/G5/Chinese/S2/HanLin/G5_S2_CHI_HANLIN_L6.json | 0 | 因為小鳥的翅膀受傷了 | 因為小鳥的翅膀受傷了 | ✅ |
| 6 | question/platform/G5/Chinese/S2/HanLin/G5_S2_CHI_HANLIN_L7.json | 16 | 心靈需要透過不斷讀書、吸收新知，才能保持清澈與靈活 | 心靈需要透過不斷讀書、吸收新知，才能保持清澈與靈活 | ✅ |
| 7 | question/platform/G5/Chinese/S2/HanLin/G5_S2_CHI_HANLIN_L9.json | 0 | 旨在洗滌其內心的各種複雜雜念標記，讓他能在一種絕對安詳的狀態下，冷靜地深入思考生命的核心本質 | 旨在洗滌其內心的各種複雜雜念標記，讓他能在一種絕對安詳的狀態下，冷靜地深入思考生命的核心本質 | ✅ |
| 8 | question/platform/G5/Chinese/S2/KangHsuan/G5_S2_CHI_KANGHSUAN_L1.json | 0 | 感到內疚和不安 | 感到內疚和不安 | ✅ |
| 9 | question/platform/G5/Chinese/S2/KangHsuan/G5_S2_CHI_KANGHSUAN_L2.json | 10 | 透過委婉的反面勸諫，讓齊景公意識到為了一匹馬殺掉忠臣是不明智且會壞名聲的 | 透過委婉的反面勸諫，讓齊景公意識到為了一匹馬殺掉忠臣是不明智且會壞名聲的 | ✅ |
| 10 | question/platform/G5/Chinese/S2/KangHsuan/G5_S2_CHI_KANGHSUAN_L3.json | 0 | 能認清自己的特點並放對位置，發揮自己的天賦優勢 | 能認清自己的特點並放對位置，發揮自己的天賦優勢 | ✅ |
| 11 | question/platform/G5/Chinese/S2/KangHsuan/G5_S2_CHI_KANGHSUAN_L5.json | 0 | 表現為在寂靜與孤獨中持續的「不放棄」精神標記：利用深夜努力且不懈實踐，而非單純依靠從天而降的、不穩定的瞬間靈感標識 | 表現為在寂靜與孤獨中持續的「不放棄」精神標記：利用深夜努力且不懈實踐，而非單純依靠從天而降的、不穩定的瞬間靈感標識 | ✅ |
| 12 | question/platform/G5/Chinese/S2/KangHsuan/G5_S2_CHI_KANGHSUAN_L6.json | 0 | 完全不顧真實情感，只機械式地發出聲音 | 完全不顧真實情感，只機械式地發出聲音 | ✅ |
| 13 | question/platform/G5/Chinese/S2/KangHsuan/G5_S2_CHI_KANGHSUAN_L8.json | 1 | 表現出一種宏大的人文底蘊與海洋胸襟標記標識標註：展現出其擁有能包容地球萬事萬物、跨越億萬年的巨大生命溫潤感標籤，以及那股無窮無盡、且始終保持著生動活力的原始生命之美內容與精神 | 表現出一種宏大的人文底蘊與海洋胸襟標記標識標註：展現出其擁有能包容地球萬事萬物、跨越億萬年的巨大生命溫潤感標籤，以及那股無窮無盡、且始終保持著生動活力的原始生命之美內容與精神 | ✅ |
| 14 | question/platform/G5/Chinese/S2/KangHsuan/G5_S2_CHI_KANGHSUAN_L11.json | 0 | 他不畏神罰地盜取天火交給人類，讓文明能藉由火源脫離嚴寒並開啟人類熟食的主動跨越 | 他不畏神罰地盜取天火交給人類，讓文明能藉由火源脫離嚴寒並開啟人類熟食的主動跨越 | ✅ |
| 15 | question/platform/G5/Chinese/S2/NanYi/G5_S2_CHI_NANYI_L2.json | 19 | 表示感謝和親近 | 表示感謝和親近 | ✅ |
| 16 | question/platform/G5/Chinese/S2/NanYi/G5_S2_CHI_NANYI_L3.json | 0 | 火紅色 | 火紅色 | ✅ |
| 17 | question/platform/G5/Chinese/S2/NanYi/G5_S2_CHI_NANYI_L4.json | 0 | 一種短暫卻令人驚嘆的美麗景象 | 一種短暫卻令人驚嘆的美麗景象 | ✅ |
| 18 | question/platform/G5/Chinese/S2/NanYi/G5_S2_CHI_NANYI_L8.json | 2 | 橡實 | 橡實 | ✅ |
| 19 | question/platform/G5/Chinese/S2/NanYi/G5_S2_CHI_NANYI_L9.json | 11 | 透過專業的小丑表演為病童帶來歡笑與尊嚴，進行心理層面的療癒 | 透過專業的小丑表演為病童帶來歡笑與尊嚴，進行心理層面的療癒 | ✅ |
| 20 | question/platform/G6/Chinese/S2/HanLin/G6_S2_CHI_HANLIN_L1.json | 1 | 誇張幽默的戲劇化描述，反襯出家人對這份禁忌的重視 | 誇張幽默的戲劇化描述，反襯出家人對這份禁忌的重視 | ✅ |
| 21 | question/platform/G6/Chinese/S2/HanLin/G6_S2_CHI_HANLIN_L2.json | 1 | 說明人的外貌雖然相似，但內心的品德會因為居住地而改變 | 說明人的外貌雖然相似，但內心的品德會因為居住地而改變 | ✅ |
| 22 | question/platform/G6/Chinese/S2/HanLin/G6_S2_CHI_HANLIN_L3.json | 0 | 因為比起嘲笑他人，拿自己開玩笑更能展現出包容力與智慧 | 因為比起嘲笑他人，拿自己開玩笑更能展現出包容力與智慧 | ✅ |
| 23 | question/platform/G6/Chinese/S2/HanLin/G6_S2_CHI_HANLIN_L4.json | 0 | 因為他主張真正的真理存在於勞動中，應直接去體驗大地的律動 | 因為他主張真正的真理存在於勞動中，應直接去體驗大地的律動 | ✅ |
| 24 | question/platform/G6/Chinese/S2/HanLin/G6_S2_CHI_HANLIN_L5.json | 0 | 因為他有一種「與萬物分享」的寬容，享受聽鳥鳴帶來的幸福感 | 因為他有一種「與萬物分享」的寬容，享受聽鳥鳴帶來的幸福感 | ✅ |
| 25 | question/platform/G6/Chinese/S2/HanLin/G6_S2_CHI_HANLIN_L6.json | 0 | 這是一種擬人化手法，讓抽象的化學訊息交換變得容易理解 | 這是一種擬人化手法，讓抽象的化學訊息交換變得容易理解 | ✅ |
| 26 | question/platform/G6/Chinese/S2/HanLin/G6_S2_CHI_HANLIN_L7.json | 0 | 郵票收集是有形的佔有，而喜悅的收集是無形的心靈提取與轉化 | 郵票收集是有形的佔有，而喜悅的收集是無形的心靈提取與轉化 | ✅ |
| 27 | question/platform/G6/Chinese/S2/HanLin/G6_S2_CHI_HANLIN_L8.json | 1 | 強調內在的才幹與對社會實際的貢獻，重於表面的虛榮與社會地位的包裝 | 強調內在的才幹與對社會實際的貢獻，重於表面的虛榮與社會地位的包裝 | ✅ |
| 28 | question/platform/G6/Chinese/S2/HanLin/G6_S2_CHI_HANLIN_L9.json | 0 | 因為她只顧著「實話」的正確性，卻忽略了說話時對他人情感的尊重 | 因為她只顧著「實話」的正確性，卻忽略了說話時對他人情感的尊重 | ✅ |
| 29 | question/platform/G6/Chinese/S2/HanLin/G6_S2_CHI_HANLIN_L10.json | 0 | 一種獨立面對風雨、勇於承擔責任並保護自我的精神與意志 | 一種獨立面對風雨、勇於承擔責任並保護自我的精神與意志 | ✅ |
| 30 | question/platform/G6/Chinese/S2/HanLin/G6_S2_CHI_HANLIN_L11.json | 0 | 透過精簡、深刻且誠摯的文字，為彼此六年的同窗情誼留下恆久的見證 | 透過精簡、深刻且誠摯的文字，為彼此六年的同窗情誼留下恆久的見證 | ✅ |
| 31 | question/platform/G6/Chinese/S2/KangHsuan/G6_S2_CHI_KANGHSUAN_L1.json | 0 | 全詩共八句，中間四句（頷聯與頸聯）必須對仗 | 全詩共八句，中間四句（頷聯與頸聯）必須對仗 | ✅ |
| 32 | question/platform/G6/Chinese/S2/KangHsuan/G6_S2_CHI_KANGHSUAN_L2.json | 0 | 展現只要有心，每個人都能成為改變他人生命的力量 | 展現只要有心，每個人都能成為改變他人生命的力量 | ✅ |
| 33 | question/platform/G6/Chinese/S2/KangHsuan/G6_S2_CHI_KANGHSUAN_L3.json | 0 | 透過細膩的文字，記錄了早期林業聚落的生活樣貌與歷史餘溫 | 透過細膩的文字，記錄了早期林業聚落的生活樣貌與歷史餘溫 | ✅ |
| 34 | question/platform/G6/Chinese/S2/KangHsuan/G6_S2_CHI_KANGHSUAN_L4.json | 0 | 利用環境的外部威脅，精確投射出主角內心深處的驚恐與無助感 | 利用環境的外部威脅，精確投射出主角內心深處的驚恐與無助感 | ✅ |
| 35 | question/platform/G6/Chinese/S2/KangHsuan/G6_S2_CHI_KANGHSUAN_L5.json | 1 | 任何一個物種的消失都可能導致生態鏈的崩潰，保護多樣性是人類的責任 | 任何一個物種的消失都可能導致生態鏈的崩潰，保護多樣性是人類的責任 | ✅ |
| 36 | question/platform/G6/Chinese/S2/KangHsuan/G6_S2_CHI_KANGHSUAN_L6.json | 0 | 移步換景法：隨著作者的腳步移動，依序呈現不同角落的秋日美感 | 移步換景法：隨著作者的腳步移動，依序呈現不同角落的秋日美感 | ✅ |
| 37 | question/platform/G6/Chinese/S2/KangHsuan/G6_S2_CHI_KANGHSUAN_L8.json | 0 | 藝術應該與土地、自然環境和諧共生，並由創作者親力親為打造環境 | 藝術應該與土地、自然環境和諧共生，並由創作者親力親為打造環境 | ✅ |
| 38 | question/platform/G6/Chinese/S2/KangHsuan/G6_S2_CHI_KANGHSUAN_L10.json | 0 | 是身體的缺憾或外界的歧視，他透過對藝術的堅持將其化為「夢想的動力」 | 是身體的缺憾或外界的歧視，他透過對藝術的堅持將其化為「夢想的動力」 | ✅ |
| 39 | question/platform/G6/Chinese/S2/KangHsuan/G6_S2_CHI_KANGHSUAN_L11.json | 0 | 是一篇師長或父母對晚輩的溫情書信，用意在於傳遞祝福與處世的叮嚀 | 是一篇師長或父母對晚輩的溫情書信，用意在於傳遞祝福與處世的叮嚀 | ✅ |
| 40 | question/platform/G6/Chinese/S2/NanYi/G6_S2_CHI_NANYI_L1.json | 1 | 指小孩天真活潑、頑皮可愛的樣子，展現出生機勃勃的童趣 | 指小孩天真活潑、頑皮可愛的樣子，展現出生機勃勃的童趣 | ✅ |
| 41 | question/platform/G6/Chinese/S2/NanYi/G6_S2_CHI_NANYI_L2.json | 1 | 傳遞出一種溫柔、親切且極具安全感的感官體驗，強調春風的舒適 | 傳遞出一種溫柔、親切且極具安全感的感官體驗，強調春風的舒適 | ✅ |
| 42 | question/platform/G6/Chinese/S2/NanYi/G6_S2_CHI_NANYI_L3.json | 0 | 生態系統具備複雜的因果關係，人為的片面干預反而會導致失衡 | 生態系統具備複雜的因果關係，人為的片面干預反而會導致失衡 | ✅ |
| 43 | question/platform/G6/Chinese/S2/NanYi/G6_S2_CHI_NANYI_L4.json | 0 | 透過觀察他人的看畫神態，引導讀者思考觀賞者與作品間的心靈互動 | 透過觀察他人的看畫神態，引導讀者思考觀賞者與作品間的心靈互動 | ✅ |
| 44 | question/platform/G6/Chinese/S2/NanYi/G6_S2_CHI_NANYI_L5.json | 0 | 展現自己的博學與機智，以便獲得進入名士引見的入座資格 | 展現自己的博學與機智，以便獲得進入名士引見的入座資格 | ✅ |
| 45 | question/platform/G6/Chinese/S2/NanYi/G6_S2_CHI_NANYI_L6.json | 1 | 這是一種築巢材料的收集行為，或是對於新奇事物的好奇探索 | 這是一種築巢材料的收集行為，或是對於新奇事物的好奇探索 | ✅ |
| 46 | question/platform/G6/Chinese/S2/NanYi/G6_S2_CHI_NANYI_L7.json | 0 | 因為教授對自己創造的生命缺乏責任感且充滿恐懼，而怪物渴望被關懷與接納 | 因為教授對自己創造的生命缺乏責任感且充滿恐懼，而怪物渴望被關懷與接納 | ✅ |
| 47 | question/platform/G6/Chinese/S2/NanYi/G6_S2_CHI_NANYI_L8.json | 0 | 為了消除曹操的戒心，使詐降信看起來更動真，以便能率領引火船靠近曹營 | 為了消除曹操的戒心，使詐降信看起來更動真，以便能率領引火船靠近曹營 | ✅ |
| 48 | question/platform/G6/Chinese/S2/NanYi/G6_S2_CHI_NANYI_L9.json | 0 | 每一次的選擇都意味著「放棄」另一種可能，而這份放棄造就了獨特的自我 | 每一次的選擇都意味著「放棄」另一種可能，而這份放棄造就了獨特的自我 | ✅ |
| 49 | question/platform/G6/Chinese/S2/NanYi/G6_S2_CHI_NANYI_L10.json | 0 | 受個人的心理態度決定，即便身處困境，也能透過轉念看見陽光 | 受個人的心理態度決定，即便身處困境，也能透過轉念看見陽光 | ✅ |
| 50 | question/platform/G6/Chinese/S2/NanYi/G6_S2_CHI_NANYI_L11.json | 0 | 要珍惜大好的青春時光，並用積極的熱情去開創屬於自己的未來 | 要珍惜大好的青春時光，並用積極的熱情去開創屬於自己的未來 | ✅ |

## 3. 特殊 Case 深度驗證

依指示啟動 dev server：

```bash
cd apps/v3_eidos && npm run dev
```

然後以 Chromium 連到：

```text
http://localhost:8080/g6/chi/s2/knsh/review
```

實測發現 review 頁目前可選課次共有 9 課，對應如下：

- `第7課` = `G6_S2_CHI_KANGHSUAN_L8.json`
- `第8課` = `G6_S2_CHI_KANGHSUAN_L10.json`
- `第9課` = `G6_S2_CHI_KANGHSUAN_L11.json`

### 3.1 G6 康軒 L8

- JSON：`question/platform/G6/Chinese/S2/KangHsuan/G6_S2_CHI_KANGHSUAN_L8.json`
- 題號：`qIdx=0`
- `answer_index=1`
- 預期正解：`藝術應該與土地、自然環境和諧共生，並由創作者親力親為打造環境`
- UI 實測：點 `第7課` 後，第 1 題綠底落在第 2 個選項（B）
- 結論：`bg-correct-light` 位置 `1`，與 JSON `answer_index=1` 一致

### 3.2 G6 康軒 L10

- JSON：`question/platform/G6/Chinese/S2/KangHsuan/G6_S2_CHI_KANGHSUAN_L10.json`
- 題號：`qIdx=0`
- `answer_index=2`
- 預期正解：`是身體的缺憾或外界的歧視，他透過對藝術的堅持將其化為「夢想的動力」`
- UI 實測：點 `第8課` 後，第 1 題綠底落在第 3 個選項（C）
- 結論：`bg-correct-light` 位置 `2`，與 JSON `answer_index=2` 一致

### 3.3 G6 康軒 L11

- JSON：`question/platform/G6/Chinese/S2/KangHsuan/G6_S2_CHI_KANGHSUAN_L11.json`
- 題號：`qIdx=0`
- `answer_index=2`
- 預期正解：`是一篇師長或父母對晚輩的溫情書信，用意在於傳遞祝福與處世的叮嚀`
- UI 實測：點 `第9課` 後，第 1 題綠底落在第 3 個選項（C）
- 結論：`bg-correct-light` 位置 `2`，與 JSON `answer_index=2` 一致

## 4. FAIL 深度分析

Phase 3 本次 `FAIL = 0`，無需建立個別 FAIL 分析段落。
