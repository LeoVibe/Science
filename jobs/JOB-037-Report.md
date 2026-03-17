# JOB-037 智慧隨機抽題與學力成果視覺化 研究報告書

*Created by AG at 2026-02-27 23:45*

## 目錄
1. 階段一：智慧隨機抽題機制 (Smart Shuffle)
2. 階段二：小三學力成果看板 (Learning Map & Radar)

---

## 1. 智慧隨機抽題機制 (Smart Shuffle)

### 1.1 `AnswerHistory` 資料結構分析
在 `apps/v3_eidos/src/utils/storage.ts` 中，每個題目的作答紀錄 `AnswerRecord` 包含以下欄位：
- `total`: 總作答次數
- `correct`: 答對次數
- `wrong`: 答錯次數
- `lastAnswer`: 最後一次是否答對
- `lastAnswerTime`: 最後一次作答的時間戳

從這些欄位中，我們可以推導出題目的「熟練度」與「遺忘曲線」狀態。

### 1.2 抽題比例配方設計 (Question Pool Distribution)
為了確保學生能夠學習新知、回顧錯題並維持記憶，建議將單次抽題（例如一份測驗 10 題）依循以下比例分配：
- **A. 新題/未作答池 (New/Unseen): 60%** 
  - 條件：`total === 0` 或 歷史紀錄不存在。
  - 目的：推進學期進度。
- **B. 錯題復健池 (Mistakes/Weakness): 20%**
  - 條件：`wrong > 0` 且 `lastAnswer === false` (最後一次是錯的，代表尚未被糾正)，或是正確率低於 50% 的題目。
  - 目的：加強弱點記憶。
- **C. 定期複習池 (Spaced Repetition): 20%**
  - 條件：`total > 0` 且 `lastAnswer === true`。
  - 目的：抵抗遺忘曲線，鞏固長期記憶。

### 1.3 動態過濾防疲勞機制 (Anti-fatigue Filter)
為了避免學生被連續丟出已經熟練的題目，必須建立「黑名單/過濾名單」：
- **排除條件**：若一題的 `correct >= 2` 且 `lastAnswer === true` 且 `(Date.now() - record.lastAnswerTime) < 2 * 24 * 60 * 60 * 1000` (也就是兩天內作答過，且總正確次數大於等於 2)。
- 這類題目應被標記為「近期已熟練 (Mastered)」，不應出現在本次抽題的任何池子中。

### 1.4 加權隨機算法虛擬碼 (Pseudo Code)
```typescript
function smartShuffle(allQuestions: Question[], history: Record<string, AnswerRecord>, targetCount: number = 10): Question[] {
  const poolNew: Question[] = [];
  const poolMistakes: Question[] = [];
  const poolReview: Question[] = [];
  
  const now = Date.now();
  const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;
  
  // 1. 分類所有題目到對應的池子
  for (const q of allQuestions) {
    const record = history[q.id];
    
    // 從未作答過 -> 新題池
    if (!record || record.total === 0) {
      poolNew.push(q);
      continue;
    }
    
    // 動態過濾機制：近期已熟練 (兩天內作答過，且總正確次數>=2，且最後一次答對) => 略過
    if (record.correct >= 2 && record.lastAnswer && (now - record.lastAnswerTime) < TWO_DAYS) {
        continue;
    }
    
    // 錯題池：最後一次答錯，或是曾經答錯過且正確率低於 50%
    const accuracy = record.correct / record.total;
    if (!record.lastAnswer || (record.wrong > 0 && accuracy < 0.5)) {
      poolMistakes.push(q);
      continue;
    }
    
    // 複習池：其他已作答過的題目 (可能答對但快遺忘了)
    poolReview.push(q);
  }
  
  // 2. 打亂各個池子
  shuffleArray(poolNew);
  shuffleArray(poolMistakes);
  shuffleArray(poolReview);
  
  // 3. 計算各池名額 (依循 60%, 20%, 20% 比例)
  let countNew = Math.floor(targetCount * 0.6);
  let countMistakes = Math.floor(targetCount * 0.2);
  let countReview = targetCount - countNew - countMistakes;
  
  // 4. 動態補償機制 (Fallback)
  // 若錯題池數量不足，讓出名額給新題
  if (poolMistakes.length < countMistakes) {
      countNew += (countMistakes - poolMistakes.length);
      countMistakes = poolMistakes.length;
  }
  // 若複習池數量不足，讓出名額給新題
  if (poolReview.length < countReview) {
      countNew += (countReview - poolReview.length);
      countReview = poolReview.length;
  }
  // 若新題池數量不足，讓出名額給複習池與錯題池
  if (poolNew.length < countNew) {
      // 這裡暫不展開，實作上可優先從 Review 補足
      countNew = poolNew.length;
  }

  // 5. 組裝並最後洗牌一次
  const finalSet = [
    ...poolNew.slice(0, countNew),
    ...poolMistakes.slice(0, countMistakes),
    ...poolReview.slice(0, countReview)
  ];
  
  shuffleArray(finalSet);
  return finalSet;
}
```

---

## 2. 小三學力成果看板 (Learning Map & Radar)

### 2.1 單元學習地圖 (Progress Map)
為取代單調的清單列表，我們引入「關卡闖關」概念。
- **節點設計**：每個單元 (Lesson) 視為一個大區塊，切割出 3 個學習節點。
  - **Node 1: 初探 (Exploration)**：完成測驗至少 1 次，無論分數。
  - **Node 2: 熟練 (Proficiency)**：正確率達到 80% 以上。
  - **Node 3: 精通 (Mastery)**：正確率達 95% 以上，且答題速度中位數低於 15 秒/題（此為進階條件，可先以正確率為主）。
- **解鎖條件**：Node 2 需要 Node 1 通關後解鎖。UI 上可呈現一條由虛線連成的路徑，隨著答題逐漸填色變為實線 (類似 Duolingo)。

### 2.2 學科力雷達圖 (Skill Radar Chart)
為了更精準呈現學習狀況，不再只看單一分數。設定以下 5 個維度 (Dimensions)，滿分皆為 100 分：
1. **知識擷取力**：針對定義型題目 (如 L1 知識儲備題) 的正確率。
2. **語意理解力**：針對綜合應用、閱讀理解題的正確率。
3. **情境應用力**：針對 L4 情境題/素養題的正確率與答題穩定度。
4. **答題敏捷度**：作答花費時間的快慢（時間越短分數越高，但錯誤率會吃掉加分）。
5. **記憶持久度**：定期複習池內的重考正確率 (反映是否遺忘)。

### 2.3 知識勳章系統 (Achievement Badges)
結合遊戲化，設定 3 枚初期勳章與獲取條件：
- 🏅 **百步穿楊 (Sharpshooter)**：連續答對 20 題以上（不限單元）。
- 🏅 **錯題終結者 (Mistake Terminator)**：於一次測驗中，將 5 題以上的歷史錯題全部答對。
- 🏅 **每日先鋒 (Daily Pioneer)**：連續 3 天都有進行測驗。
*UI 顯示邏輯*：勳章預設在面板上反灰 (Opacity: 0.3)，達成條件時透過動畫解鎖並改為全亮，點擊可顯示解鎖時間與成就說明。

---

*下一步：將此設計規格書交由開發團隊 (Cursor) 進行 Dashboard 畫面重構與新功能串接。*
