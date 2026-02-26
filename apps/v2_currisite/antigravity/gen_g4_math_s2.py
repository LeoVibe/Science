import json
import os

def create_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

base_path = "/Users/s389080/Documents/文件 - NM389080/miaw/antigravity/questions/source/G4/數學/S2"

math_content = [
    {"lesson": "M1", "title": "億或兆以上的數", "order": 1, "questions": [
        {"id": "1", "type": "multiple_choice", "question": "10 個一億是多少？", "options": ["十億", "一百億", "一兆", "一千萬"], "answer": "十億", "explanation": "滿十進一，10 個億等於 10 億。"},
        {"id": "2", "type": "true_false", "question": "一兆等於 10000 個一億。", "answer": "True", "explanation": "兆與億之間隔著「十億、百億、千億」，所以是一萬個億倍。"},
        {"id": "3", "type": "fill_in_the_blank", "question": "「1200000000000」讀作：一______二千億。", "answer": "兆", "explanation": "由右往左：個、萬、億、兆。"},
        {"id": "4", "type": "multiple_choice", "question": "比較 3 兆與 2 兆 9999 億，何者較大？", "options": ["3 兆", "2 兆 9999 億", "一樣大", "無法比較"], "answer": "3 兆", "explanation": "3 兆比 2 兆 9999 億多出 1 億。"},
        {"id": "5", "type": "true_false", "question": "我國的人口數大約是 2300 兆人。", "answer": "False", "explanation": "我國人口大約是 2300 萬人。"}
    ]},
    {"lesson": "M2", "title": "四邊形", "order": 2, "questions": [
        {"id": "1", "type": "multiple_choice", "question": "四個角都是直角，且四條邊都一樣長的圖形是？", "options": ["正方形", "長方形", "梯形", "菱形"], "answer": "正方形", "explanation": "正方形具備四角皆直角且四邊等長的特性。"},
        {"id": "2", "type": "true_false", "question": "平行四邊形的對邊不但平行且長度相等。", "answer": "True", "explanation": "這是平行四邊形的基本幾何性質。"},
        {"id": "3", "type": "fill_in_the_blank", "question": "只有一組對邊平行的四邊形稱為______。", "answer": "梯形", "explanation": "梯形的定義是僅有一對邊平行。"},
        {"id": "4", "type": "multiple_choice", "question": "長方形與正方形的共通點是什麼？", "options": ["四邊都等長", "四個角都是直角", "只有兩邊平行", "沒有共通點"], "answer": "四個角都是直角", "explanation": "兩者都屬於矩形，角皆為 90 度。"},
        {"id": "5", "type": "true_false", "question": "任何四邊形的內角和都是 180 度。", "answer": "False", "explanation": "四邊形的內角和是 360 度。"}
    ]},
    {"lesson": "M3", "title": "簡化計算或四則", "order": 3, "questions": [
        {"id": "1", "type": "multiple_choice", "question": "利用分配律計算：125 * 88 = 125 * (80 + 8) = ？", "options": ["10000", "11000", "12000", "13000"], "answer": "11000", "explanation": "10000 + 1000 = 11000。"},
        {"id": "2", "type": "true_false", "question": "在加減混合運算中，先算後算最後的結果都不會變。", "answer": "True", "explanation": "加法具有結合律與交換律。"},
        {"id": "3", "type": "fill_in_the_blank", "question": "25 * 4 * 73 = 100 * 73 = ______。", "answer": "7300", "explanation": "先做容易計算的部分（25*4=100）。"},
        {"id": "4", "type": "multiple_choice", "question": "99 * 52 與下列哪一個算式的結果相同？", "options": ["(100 - 1) * 52", "(100 + 1) * 52", "100 * 52 - 1", "100 * 52 + 52"], "answer": "(100 - 1) * 52", "explanation": "利用分配律簡化。"},
        {"id": "5", "type": "true_false", "question": "括號的優先權大於乘除與加減。", "answer": "True", "explanation": "括號改變運算順序。"}
    ]},
    {"lesson": "M4", "title": "周長與面積", "order": 4, "questions": [
        {"id": "1", "type": "multiple_choice", "question": "邊長 10 公分正方形的面積是多少平方公分？", "options": ["40", "100", "10", "1"], "answer": "100", "explanation": "10 * 10 = 100。"},
        {"id": "2", "type": "true_false", "question": "正方形的周長是邊長的 4 倍。", "answer": "True", "explanation": "周長 = 邊長 + 邊長 + 邊長 + 邊長。"},
        {"id": "3", "type": "fill_in_the_blank", "question": "長 12 公分、周長 40 公分的長方形，寬是______公分。", "answer": "8", "explanation": "(40 / 2) - 12 = 20 - 12 = 8。"},
        {"id": "4", "type": "multiple_choice", "question": "面積為 48 平方公分的長方形，長是 8 公分，寬是多少？", "options": ["4公分", "6公分", "8公分", "12公分"], "answer": "6公分", "explanation": "48 / 8 = 6。"},
        {"id": "5", "type": "true_false", "question": "面積單位和周長單位的名稱是一樣的。", "answer": "False", "explanation": "面積常用「平方」單位，周長是長度單位。"}
    ]},
    {"lesson": "M5", "title": "小數乘法", "order": 5, "questions": [
        {"id": "1", "type": "multiple_choice", "question": "0.3 * 4 等於多少？", "options": ["1.2", "0.12", "12", "0.7"], "answer": "1.2", "explanation": "把 0.3 看成 3 個 0.1，3*4=12，即 12 個 0.1 = 1.2。"},
        {"id": "2", "type": "true_false", "question": "0.5 * 0.5 = 2.5。", "answer": "False", "explanation": "0.5 * 0.5 = 0.25。"},
        {"id": "3", "type": "fill_in_the_blank", "question": "2.1 * 10 = ______。", "answer": "21", "explanation": "乘以 10 小數點右移一位。"},
        {"id": "4", "type": "multiple_choice", "question": "小明買了 3 瓶 1.5 公升的汽水，共幾公升？", "options": ["3.5", "4", "4.5", "5"], "answer": "4.5", "explanation": "1.5 * 3 = 4.5。"},
        {"id": "5", "type": "true_false", "question": "一個小數乘以 0，結果仍是 0。", "answer": "True", "explanation": "任何數乘以 0 均為 0。"}
    ]},
    {"lesson": "M6", "title": "等值分數與加減", "order": 6, "questions": [
        {"id": "1", "type": "multiple_choice", "question": "二分之一與下列哪一個分數相等？", "options": ["四分之二", "六分之一", "八分之三", "十分之四"], "answer": "四分之二", "explanation": "1/2 = 2/4 = 3/6 = 5/10。"},
        {"id": "2", "type": "true_false", "question": "將分數的分子與分母同時乘以一個不為 0 的數，分數大小不變。", "answer": "True", "explanation": "這稱為「擴分」，數值維持等值。"},
        {"id": "3", "type": "fill_in_the_blank", "question": "九分之三約分後是三分之______。", "answer": "一", "explanation": "3/9 = (3/3) / (9/3) = 1/3。"},
        {"id": "4", "type": "multiple_choice", "question": "五分之二加上五分之一，結果是多少？", "options": ["十分之三", "五分之三", "五分之二", "一"], "answer": "五分之三", "explanation": "分母相同，分子相加。"},
        {"id": "5", "type": "true_false", "question": "所有分數都可以化成帶分數。", "answer": "False", "explanation": "只有假分數（分子大於等於分母）才可化為帶分數（或整數）。"}
    ]},
    {"lesson": "M7", "title": "體積或數量規律", "order": 7, "questions": [
        {"id": "1", "type": "multiple_choice", "question": "每邊 1 公分的立方體，其體積是？", "options": ["1平方公分", "1公分", "1立方公分", "3立方公分"], "answer": "1立方公分", "explanation": "體積單位是立方。"},
        {"id": "2", "type": "true_false", "question": "正方體的體積 = 邊長 * 邊長 * 邊長。", "answer": "True", "explanation": "體積計算公式。"},
        {"id": "3", "type": "fill_in_the_blank", "question": "長 4 公分、寬 2 公分、高 3 公分的長方體體積是______立方公分。", "answer": "24", "explanation": "4 * 2 * 3 = 24。"},
        {"id": "4", "type": "multiple_choice", "question": "一個物體所佔空間的大小，稱為什麼？", "options": ["面積", "周長", "體積", "邊長"], "answer": "體積", "explanation": "這是體積的概念定義。"},
        {"id": "5", "type": "true_false", "question": "同一堆積木擺放方式不同，總體積就會跟著改變。", "answer": "False", "explanation": "物體形狀改變但組成物質（積木數）不變，則體積不變。"}
    ]},
    {"lesson": "M8", "title": "概數", "order": 8, "questions": [
        {"id": "1", "type": "multiple_choice", "question": "將 8245 用「四捨五入法」取概數到千位是？", "options": ["8000", "9000", "8200", "8300"], "answer": "8000", "explanation": "百位是 2 小於 5，捨去。"},
        {"id": "2", "type": "true_false", "question": "「無條件進入法」取出的數一定會比原數大或相等。", "answer": "True", "explanation": "因為只要有餘數就進位。"},
        {"id": "3", "type": "fill_in_the_blank", "question": "將 2561 用「無條件捨去法」取概數到百位是______。", "answer": "2500", "explanation": "尾數直接歸零。"},
        {"id": "4", "type": "multiple_choice", "question": "購物時，如果老闆說「大約 500 元」，這是一個？", "options": ["正確數", "概數", "整數", "負數"], "answer": "概數", "explanation": "不精確的估計值稱為概數。"},
        {"id": "5", "type": "true_false", "question": "取概數到萬位時，要看千位數來判斷。 ", "answer": "True", "explanation": "四捨五入法看下一位決定。"}
    ]},
    {"lesson": "M9", "title": "時間的計算", "order": 9, "questions": [
        {"id": "1", "type": "multiple_choice", "question": "1 日等於多少小時？", "options": ["12小時", "24小時", "48小時", "60小時"], "answer": "24小時", "explanation": "一日有 24 小時。"},
        {"id": "2", "type": "true_false", "question": "上午 9 時到下午 3 時，經過了 6 小時。", "answer": "True", "explanation": "15 - 9 = 6。"},
        {"id": "3", "type": "fill_in_the_blank", "question": "150 秒 = ______ 分 ______ 秒", "answer": "2, 30", "explanation": "150 / 60 = 2...30。"},
        {"id": "4", "type": "multiple_choice", "question": "小華看電影花了 2 小時 15 分，電影在 14:00 結束，請問何時開始？", "options": ["11:45", "12:15", "16:15", "11:15"], "answer": "11:45", "explanation": "14:00 - 2:15 = 11:45。"},
        {"id": "5", "type": "true_false", "question": "月、日、時、分、秒都是常用的時間單位。", "answer": "True", "explanation": "生活中的基本時間刻度。"}
    ]},
    {"lesson": "M10", "title": "統計圖、體積或規律進階", "order": 10, "questions": [
        {"id": "1", "type": "multiple_choice", "question": "用來比較不同項目的數量多少，最清楚的圖表是？", "options": ["長條圖", "折線圖", "圓餅圖", "地圖"], "answer": "長條圖", "explanation": "長條的高低能直觀反應數量。"},
        {"id": "2", "type": "true_false", "question": "折線圖主要用來觀察數據隨著時間變化的趨勢。", "answer": "True", "explanation": "線條的升降代表趨勢。"},
        {"id": "3", "type": "fill_in_the_blank", "question": "在統計圖中，橫軸代表項目，縱軸代表______。", "answer": "數量、值", "explanation": "座標軸的基本定義。"},
        {"id": "4", "type": "multiple_choice", "question": "數列：2, 4, 8, 16, ( ), 下一個數是？", "options": ["24", "30", "32", "64"], "answer": "32", "explanation": "規律是前項乘 2。"},
        {"id": "5", "type": "true_false", "question": "統計圖的標題應清楚說明該圖所呈現的主旨。", "answer": "True", "explanation": "標題是閱讀圖表的重要指引。"}
    ]}
]

for pub in ["康軒", "翰林", "南一"]:
    dest_dir = os.path.join(base_path, pub)
    for unit in math_content:
        pub_key = "kang_hsuan" if pub=="康軒" else ("han_lin" if pub=="翰林" else "nan_yi")
        data = {
            "meta": {
                "grade": "grade_4",
                "semester": "semester_2",
                "subject": "數學",
                "publisher": pub_key,
                "lesson": unit["lesson"],
                "order": unit["order"],
                "title": unit["title"]
            },
            "questions": unit["questions"]
        }
        filename = f"{unit['lesson']}_{unit['title']}.json"
        create_json(os.path.join(dest_dir, filename), data)
        print(f"Created/Math: {pub}/{filename}")
