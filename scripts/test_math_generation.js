const fs = require('fs');

async function testGeneration() {
    const apiKey = process.env.GEMINI_API_KEY;
    const prompt = `
目前我們正在擴充與修復【HanLin版】第【G3】年級第【S2】學期，課名：《分數與其加減》。
原題庫已經有 12 題優質題，我們還需要 1 題。
請根據這篇課文（或依據你對國小課文《分數與其加減》的既有知識庫），為我自動生成這 1 題。
請務必遵守『4-4-2 配比』與『大腦友善干擾項原則（同理心投射、合理化迷思）』。
嚴禁使用重複性後綴（如：雖然看起來很有道理...）。
長情境題幹必須加上【在地點/情境時】的標籤。
若為 L4 或其餘課次，請針對課文核心《分數與其加減》產出。
請回傳包含 1 個物件的 new_questions 陣列 JSON。`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            systemInstruction: {
                parts: [{
                    text: `你是一位頂尖的小學數學教育心理學專家。
你的任務是熟讀《KL2_數學科共同發展總綱》所確立的跨學科標準，並根據「大腦友善三原則（同理心投射、合理化迷思、語氣延展）」與「中年級 4-4-2 認知動態配比」來設計大腦友善的生活情境數學應用題，絕不出現純粹的數字計算題。
長情境題幹必須使用【在xxx時】標籤。
請以 JSON 格式回傳，格式必需為一個包含 new_questions 陣列的物件。
🎯 極重要：請隨機分配 answer_index (0-3)，嚴禁大比例將答案集中在 0 或任何單一數字！
{
  "new_questions": [
    {
      "taxonomy": "literal / inferential / contextual / critical",
      "scenario": "情境與測驗標籤",
      "question": "題幹...",
      "options": ["A", "B", "C", "D"],
      "answer_index": 0,
      "explanation": "原因與推導...",
      "commonMisconception": "易錯迷思分析...",
      "quality_level": "L4",
      "cqi_score": 9.5
    }
  ]
}`
                }]
            },
            contents: [{
                role: "user",
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: 0.7,
                responseMimeType: "application/json"
            }
        })
    });

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;
    console.log("Raw Response:");
    console.log(content);
    
    try {
        const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(jsonStr);
        console.log("Successfully parsed JSON!");
    } catch (e) {
        console.error("JSON parsing error:", e.message);
        // Let's pinpoint where it failed
        const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
        let match = e.message.match(/position (\d+)/);
        if (match) {
            let pos = parseInt(match[1]);
            console.log("Failed around:");
            console.log(jsonStr.substring(Math.max(0, pos - 50), pos + 50));
        }
    }
}

testGeneration();
