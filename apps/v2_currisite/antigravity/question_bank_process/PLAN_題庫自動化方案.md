# Antigravity 題庫自動化生成方案

## 1. 核心概念
不嘗試一次生成所有題目，而是建立一個「生成工廠」。由 Python 負責控制流程，AI 負責生成內容，最後將結果結構化存檔。

## 2. 系統架構

### A. 設定檔 (`curriculum_config.yaml`)
我們需要將龐大的需求拆解成機器可讀的設定。
```yaml
grade_1:
  mandarin (國語):
    publishers:
      kang_hsuan (康軒):
        chapters:
          - "第一課: 拍拍手"
          - "第二課: ... "
      han_lin (翰林):
        chapters: [...]
  math (數學):
    ...
```

### B. 生成腳本 (`generate_questions.py`)
這是我(Agent)會幫您寫的程式，邏輯如下：
1. 讀取設定檔。
2. 檢查哪些單元還沒生成過（支援斷點續傳）。
3. 針對每個單元，呼叫 AI 模型生成題目（依據指定的題型、數量、難度）。
4. 驗證生成的 JSON 格式是否正確。
5. 將結果存入 `output/grade_1/mandarin/kang_hsuan/ch1.json`。

### C. 輸出格式 (Schema)
我們會定義統一的輸出的格式，方便您未來匯入資料庫或製作考卷。
```json
{
  "meta": {
    "grade": 1,
    "subject": "Mandarin",
    "publisher": "Kang Hsuan",
    "chapter": "第一課"
  },
  "questions": [
    {
      "type": "multiple_choice",
      "difficulty": "easy",
      "question": "題目內容...",
      "options": ["選項A", "選項B", "選項C", "選項D"],
      "answer": "A",
      "explanation": "解析..."
    }
  ]
}
```

## 3. 執行流程 (Workflow)
1. **初始化**：您告訴我想要生成的範圍（例如：先做小一國語）。
2. **準備資料**：如果需要精準對應課文，您需要提供課文關鍵字或大綱；若不提供，我將依據「通用課綱」生成該年級程度的題目。
3. **自動執行**：執行 Python 腳本。
   - Agent 會在背景運作。
   - 您會看到檔案一個一個出現在資料夾中。
4. **人工檢核**：抽樣檢查生成的題目品質。
5. **大量生產**：確認無誤後，擴大設定檔範圍，跑完整個流程。

## 4. 優勢總結
- **可控性**：隨時可以暫停、修改設定、繼續執行。
- **結構化**：產出就是資料庫格式，不是一堆文字。
- **擴充性**：未來要加「素養題」或「雙語題」，只要改 Prompt 設定即可。
