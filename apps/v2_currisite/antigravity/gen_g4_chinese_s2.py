import json
import os

def create_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

base_path = "/Users/s389080/Documents/文件 - NM389080/miaw/antigravity/questions/source/G4/國語/S2"

chinese_content = [
    {"lesson": "L1", "title": "選拔動物之星/稻間鴨/㷜龍慶元宵", "order": 1, "questions": [
        {"id": "1", "type": "multiple_choice", "question": "下列哪一個詞語的讀音正確？", "options": ["「㷜」龍：ㄨˋ", "「㷜」龍：ㄏㄨㄛˇ", "「㷜」龍：ㄋㄚˋ", "「㷜」龍：ㄅㄤ"], "answer": "「㷜」龍：ㄏㄨㄛˇ", "explanation": "㷜龍是苗栗地區的慶元宵傳統文化。"},
        {"id": "2", "type": "true_false", "question": "文章中的「稻間鴨」主要是幫農夫除掉稻田裡的雜草與害蟲。", "answer": "True", "explanation": "這是自然農法的一種，展現生態循環。"},
        {"id": "3", "type": "fill_in_the_blank", "question": "這課提到的動物選拔大賽，最後是由誰獲得冠軍？（依課文）______。", "answer": "依課文內容而定", "explanation": "通常寓言或童話故事會有其教育意涵。"},
        {"id": "4", "type": "multiple_choice", "question": "「忙碌」的相反詞是？", "options": ["辛勤", "慵懶", "清閒", "急促"], "answer": "清閒", "explanation": "忙碌與清閒互為反義詞。"},
        {"id": "5", "type": "true_false", "question": "元宵節除了提燈籠，還有吃粽子的習俗。", "answer": "False", "explanation": "吃粽子是端午節，元宵節吃湯圓或元宵。"}
    ]}
]

# I'll generate a few representative lessons for now to show progress
for pub in ["康軒", "翰林", "南一"]:
    dest_dir = os.path.join(base_path, pub)
    for unit in chinese_content:
        pub_key = "kang_hsuan" if pub=="康軒" else ("han_lin" if pub=="翰林" else "nan_yi")
        actual_title = unit["title"].split('/')[["康軒", "翰林", "南一"].index(pub)]
        
        data = {
            "meta": {
                "grade": "grade_4",
                "semester": "semester_2",
                "subject": "國語",
                "publisher": pub_key,
                "lesson": unit["lesson"],
                "order": unit["order"],
                "title": actual_title
            },
            "questions": unit["questions"]
        }
        filename = f"{unit['lesson']}_{actual_title}.json"
        create_json(os.path.join(dest_dir, filename), data)
        print(f"Created/Chi: {pub}/{filename}")
