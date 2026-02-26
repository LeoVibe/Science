import json
import os

def create_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

base_path = "/Users/s389080/Documents/文件 - NM389080/miaw/antigravity/questions/source/G3/自然/S1"

# Grade 3 Science Semester 1
# Based on 113 Curriculum
# 康軒: 1.認識植物 2.空氣與風 3.溶解與生活 4.磁鐵
# 翰林: 1.植物的身體 2.神奇的磁鐵 3.空氣和風 4.溶解
# 南一: 1.認識植物 2.空氣和水 3.奇妙的溶解 4.磁鐵

curriculum = [
    # Kang Hsuan
    {"pub": "kang_hsuan", "dir": "康軒", "units": [
        {"lesson": "Sci1", "title": "認識植物", "qs": [{"id":"1","type":"multiple_choice","question":"植物的根主要功能是什麼？","options":["吸收水分","行光合作用","授粉","發光"],"answer":"吸收水分","explanation":"根負責抓地固著與吸收水份。"}]},
        {"lesson": "Sci2", "title": "空氣與風", "qs": [{"id":"1","type":"true_false","question":"看不見空氣代表空氣不存在。","answer":"False","explanation":"空氣佔有空間且有重量，只是透明無色。"}]},
        {"lesson": "Sci3", "title": "溶解與生活", "qs": [{"id":"1","type":"multiple_choice","question":"哪一種東西可以溶解在水中？","options":["石頭","鹽巴","沙子","鐵釘"],"answer":"鹽巴","explanation":"鹽巴是可溶物質。"}]},
        {"lesson": "Sci4", "title": "磁鐵", "qs": [{"id":"1","type":"true_false","question":"磁鐵可以吸起所有的金屬。","answer":"False","explanation":"主要吸鐵、鎳、鈷，不能吸金、銀、銅。"}]}
    ]},
    # Han Lin
    {"pub": "han_lin", "dir": "翰林", "units": [
        {"lesson": "Sci1", "title": "植物的身體", "qs": [{"id":"1","type":"multiple_choice","question":"葉子上的紋路稱為什麼？","options":["葉脈","葉柄","葉緣","皺紋"],"answer":"葉脈","explanation":"輸送水分養分的通道。"}]},
        {"lesson": "Sci2", "title": "神奇的磁鐵", "qs": [{"id":"1","type":"multiple_choice","question":"磁鐵磁力最強的地方稱為？","options":["中間","磁極","側面","上面"],"answer":"磁極","explanation":"兩端磁極磁力最強。"}]},
        {"lesson": "Sci3", "title": "空氣和風", "qs": [{"id":"1","type":"true_false","question":"風就是流動的空氣。","answer":"True","explanation":"空氣流動形成風。"}]},
        {"lesson": "Sci4", "title": "溶解", "qs": [{"id":"1","type":"multiple_choice","question":"想要加速糖溶解，可以用什麼方法？","options":["攪拌","加冰塊","不理它","減少水量"],"answer":"攪拌","explanation":"攪拌可加速溶解。"}]}
    ]},
    # Nan Yi
    {"pub": "nan_yi", "dir": "南一", "units": [
        {"lesson": "Sci1", "title": "認識植物", "qs": [{"id":"1","type":"true_false","question":"每一種植物的葉子形狀都一樣。","answer":"False","explanation":"不同植物葉形各異。"}]},
        {"lesson": "Sci2", "title": "空氣和水", "qs": [{"id":"1","type":"multiple_choice","question":"把空杯子倒扣入水中，為什麼水進不去？","options":["因為杯子裡有空氣","因為水怕杯子","因為杯子有魔法","因為杯子破了"],"answer":"因為杯子裡有空氣","explanation":"空氣佔有空間。"}]},
        {"lesson": "Sci3", "title": "奇妙的溶解", "qs": [{"id":"1","type":"multiple_choice","question":"不能溶解的沉澱物可以如何分離？","options":["過濾","攪拌","加熱","搖晃"],"answer":"過濾","explanation":"利用濾紙過濾顆粒。"}]},
        {"lesson": "Sci4", "title": "磁鐵", "qs": [{"id":"1","type":"multiple_choice","question":"磁鐵同極相斥，異極？","options":["相吸","相斥","沒反應","爆炸"],"answer":"相吸","explanation":"磁鐵基本性質。"}]}
    ]}
]

for item in curriculum:
    dest_dir = os.path.join(base_path, item["dir"])
    for i, unit in enumerate(item["units"]):
        data = {
            "meta": {
                "grade": "grade_3",
                "semester": "semester_1",
                "subject": "自然",
                "publisher": item["pub"],
                "lesson": unit["lesson"],
                "order": i + 1,
                "title": unit["title"]
            },
            "questions": unit["qs"]
        }
        filename = f"{unit['lesson']}_{unit['title']}.json"
        create_json(os.path.join(dest_dir, filename), data)
        print(f"Created: {filename}")
