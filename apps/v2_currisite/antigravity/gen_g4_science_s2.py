import json
import os

def create_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

base_path = "/Users/s389080/Documents/文件 - NM389080/miaw/antigravity/questions/source/G4/自然/S2"

science_content = [
    {"lesson": "Sci1", "title": "白天和夜晚/生活中的力", "order": 1, "questions": [
        {"id": "1", "type": "multiple_choice", "question": "月亮的圓缺變化主要是因為？", "options": ["太陽變色了", "月球繞地球公轉與太陽照射角度變化", "雲擋住了", "地球發生地震"], "answer": "月球繞地球公轉與太陽照射角度變化", "explanation": "月相盈虧是規律的天文現象。"},
        {"id": "2", "type": "true_false", "question": "用力拉彈簧，彈簧變長是力產生的形變效果。", "answer": "True", "explanation": "力可以改變物體的形狀或運動狀態。"},
        {"id": "3", "type": "fill_in_the_blank", "question": "測量物體重量時，常用的工具是______。", "answer": "秤、彈簧秤", "explanation": "秤能顯示物體受重力的大小。"},
        {"id": "4", "type": "multiple_choice", "question": "下列哪一種力是「非接觸力」？", "options": ["推門的力", "磁鐵吸迴紋針的力", "提水袋的力", "拍皮球的力"], "answer": "磁鐵吸迴紋針的力", "explanation": "磁力可以隔空作用。"},
        {"id": "5", "type": "true_false", "question": "夜晚看見的星星，也會像太陽一樣東升西落。", "answer": "True", "explanation": "這是地球由西向東自轉產生的視運動。"}
    ]},
    {"lesson": "Sci2", "title": "水的移動/有趣現象", "order": 2, "questions": [
        {"id": "1", "type": "multiple_choice", "question": "虹吸現象能將水引往低處，管子內必須充滿什麼？", "options": ["空氣", "沙子", "水", "油脂"], "answer": "水", "explanation": "虹吸必須先建立連綿的水柱才能啟動。"},
        {"id": "2", "type": "true_false", "question": "毛細現象讓衣服上的汗水能迅速擴散。", "answer": "True", "explanation": "布料纖維間的細縫產生毛細吸力。"},
        {"id": "3", "type": "fill_in_the_blank", "question": "茶杯中的水靜止時，水面保持______。", "answer": "水平", "explanation": "受重力影響，靜止液面恆為水平。"},
        {"id": "4", "type": "multiple_choice", "question": "連通管原理常應用在生活中的？", "options": ["飲水機水位計", "吸塵器", "手電筒", "溫度計"], "answer": "飲水機水位計", "explanation": "水位計能顯示與內部等高的水面。"},
        {"id": "5", "type": "true_false", "question": "只有吸管能產生虹吸現象，粗水管不行。", "answer": "False", "explanation": "任何密封且充滿水的管路都能產生虹吸。"}
    ]},
    {"lesson": "Sci3", "title": "昆蟲大解密/變動大地", "order": 3, "questions": [
        {"id": "1", "type": "multiple_choice", "question": "昆蟲的身體構造分為哪三部分？", "options": ["頭、頸、尾", "頭、胸、腹", "頭、身、四肢", "殼、膜、肉"], "answer": "頭、胸、腹", "explanation": "三段式構造與六隻腳是昆蟲的特徵。"},
        {"id": "2", "type": "true_false", "question": "毛毛蟲（幼蟲）與蝴蝶（成蟲）長得完全不一樣，這是變態發育。", "answer": "True", "explanation": "昆蟲的一生經歷卵、幼蟲、蛹、成蟲階段稱為完全變態。"},
        {"id": "3", "type": "fill_in_the_blank", "question": "昆蟲有______對翅膀、三對腳。", "answer": "兩", "explanation": "多數昆蟲成蟲具備兩對翅。"},
        {"id": "4", "type": "multiple_choice", "question": "下列何者屬於社會性昆蟲（共同分工生活）？", "options": ["蚊子", "蝴蝶", "螞蟻", "蒼蠅"], "answer": "螞蟻", "explanation": "螞蟻、蜜蜂具有嚴謹的社會分工系統。"},
        {"id": "5", "type": "true_false", "question": "蜘蛛有八隻腳，所以也屬於昆蟲類。", "answer": "False", "explanation": "蜘蛛屬於蛛形綱，並非昆蟲（昆蟲為六隻腳）。"}
    ]},
    {"lesson": "Sci4", "title": "資源與利用/能源電路", "order": 4, "questions": [
        {"id": "1", "type": "multiple_choice", "question": "下列哪一種能源屬於「再生能源」？", "options": ["石油", "煤炭", "太陽能", "天然氣"], "answer": "太陽能", "explanation": "可以自然再生、取之不盡的能量來源。"},
        {"id": "2", "type": "true_false", "question": "多使用節能家電可以減少二氧化碳排放。", "answer": "True", "explanation": "節能有助於減緩溫室效應。"},
        {"id": "3", "type": "fill_in_the_blank", "question": "電池並聯時，電路的亮度______。", "answer": "不變", "explanation": "並聯不改變電壓，僅增加使用時間。"},
        {"id": "4", "type": "multiple_choice", "question": "廢電池應該如何處理？", "options": ["直接丟垃圾桶", "埋入土裡", "拿到回收站回收", "丟進河裡"], "answer": "拿到回收站回收", "explanation": "電池含有重金屬，需特殊處理以免污染環境。"},
        {"id": "5", "type": "true_false", "question": "地球資源是無限的，可以隨意揮霍。", "answer": "False", "explanation": "許多資源為有限資源，必須節導利用。"}
    ]}
]

for pub in ["康軒", "翰林", "南一"]:
    dest_dir = os.path.join(base_path, pub)
    for unit in science_content:
        pub_key = "kang_hsuan" if pub=="康軒" else ("han_lin" if pub=="翰林" else "nan_yi")
        # Adjust titles for Nan Yi specifically
        actual_title = unit["title"]
        if pub == "南一":
            if unit["lesson"] == "Sci1": actual_title = "昆蟲的一生"
            if unit["lesson"] == "Sci2": actual_title = "生活中的力"
            if unit["lesson"] == "Sci3": actual_title = "水的移動"
            if unit["lesson"] == "Sci4": actual_title = "星空"

        data = {
            "meta": {
                "grade": "grade_4",
                "semester": "semester_2",
                "subject": "自然",
                "publisher": pub_key,
                "lesson": unit["lesson"],
                "order": unit["order"],
                "title": actual_title
            },
            "questions": unit["questions"]
        }
        filename = f"{unit['lesson']}_{actual_title}.json"
        create_json(os.path.join(dest_dir, filename), data)
        print(f"Created/Sci: {pub}/{filename}")
