import json
import os

def create_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

base_path = "/Users/s389080/Documents/文件 - NM389080/miaw/antigravity/questions/source/G4/社會/S2"

# Generally shared themes for G4 S2 Social (家鄉)
social_s2 = [
    {"lesson": "Soc1", "title": "家鄉的產業探索", "order": 1, "questions": [
        {"id": "1", "type": "multiple_choice", "question": "下列哪一種產業屬於「第一級產業」？", "options": ["農業", "製造業", "服務業", "銀行業"], "answer": "農業", "explanation": "直接從自然界獲取資源的產業（如農林漁牧）稱為第一級產業。"},
        {"id": "2", "type": "true_false", "question": "隨著科技進步，現在家鄉的耕作大多已經自動化。", "answer": "True", "explanation": "機械取代人力是現代農業的特徵。"},
        {"id": "3", "type": "fill_in_the_blank", "question": "家鄉的特色產品可以透過______或是網路行銷到全世界。", "answer": "觀光、市集", "explanation": "多元行銷管道能增加家鄉收入。"},
        {"id": "4", "type": "multiple_choice", "question": "家鄉產業的發展主要受到什麼因素影響？", "options": ["地形與氣候", "當季流行音樂", "市長的身高", "昨天的晚餐"], "answer": "地形與氣候", "explanation": "自然環境決定了適宜發展的基礎產業。"},
        {"id": "5", "type": "true_false", "question": "所有家鄉生產的東西都只能在當地賣掉。", "answer": "False", "explanation": "現代交通發達，產品可以外銷到其他地方。"}
    ]},
    {"lesson": "Soc2", "title": "家鄉的產業轉變", "order": 2, "questions": [
        {"id": "1", "type": "multiple_choice", "question": "家鄉從傳統農業轉型為觀光休閒農業，主要是為了？", "options": ["增加收入與轉型", "讓大家變懶", "不想種田了", "減少人口"], "answer": "增加收入與轉型", "explanation": "產業多元化能提升經濟價值並創造就業機會。"},
        {"id": "2", "type": "true_false", "question": "老街的活化與再造是家鄉產業轉型的一種方式。", "answer": "True", "explanation": "將歷史文化與商機結合是現代常見的做法。"},
        {"id": "3", "type": "fill_in_the_blank", "question": "傳統手工業轉型為「觀光工廠」，提供遊客體驗______樂趣。", "answer": "DIY、動手做", "explanation": "體驗經濟是產業轉型的重要方向。"},
        {"id": "4", "type": "multiple_choice", "question": "哪一個不是傳統產業面臨的困境？", "options": ["勞動力老化", "外來廉價產品競爭", "太多人搶著想做農夫", "生產成本增加"], "answer": "太多人搶著想做農夫", "explanation": "目前農村正面臨人口流失與缺工問題。"},
        {"id": "5", "type": "true_false", "question": "引進創新技術能提高家鄉產業的競爭力。", "answer": "True", "explanation": "科技化管理能優化產能與品質。"}
    ]},
    {"lesson": "Soc3", "title": "家鄉的交通運輸", "order": 3, "questions": [
        {"id": "1", "type": "multiple_choice", "question": "下列哪一種交通工具速度最快，適合跨縣市長途旅行？", "options": ["公共汽車", "捷運", "高鐵", "自行車"], "answer": "高鐵", "explanation": "高鐵是台灣目前西部地區最快速的陸上公共運輸。"},
        {"id": "2", "type": "true_false", "question": "便捷的交通網路有利於家鄉貨物的流通。", "answer": "True", "explanation": "交通是經濟發展的動脈。"},
        {"id": "3", "type": "fill_in_the_blank", "question": "家鄉的聯外交通如果越發達，外部人口移入的機率就越______。", "answer": "高、大", "explanation": "便利性吸引人潮與錢潮。"},
        {"id": "4", "type": "multiple_choice", "question": "哪一種設施屬於「通訊運輸」的範疇？", "options": ["平交道", "衛星", "加油站", "公車亭"], "answer": "衛星", "explanation": "衛星負責信號傳輸，是現代科技通訊的基礎。"},
        {"id": "5", "type": "true_false", "question": "現代交通方便及通訊發達，縮小了城鄉之間的距離感。", "answer": "True", "explanation": "這就是所謂的「地球村」縮影。"}
    ]},
    {"lesson": "Soc4", "title": "家鄉的人口", "order": 4, "questions": [
        {"id": "1", "type": "multiple_choice", "question": "家鄉如果出現「人口外流」，最主要的原因通常是？", "options": ["空氣太好", "工作機會太少", "房子太多", "學校太多"], "answer": "工作機會太少", "explanation": "追求更好的經濟生活是人口流動主因。"},
        {"id": "2", "type": "true_false", "question": "人口結構老化是指家鄉中老年人的比例持續上升。", "answer": "True", "explanation": "這是全球多數已開發國家面臨的社會問題。"},
        {"id": "3", "type": "fill_in_the_blank", "question": "新住民移入家鄉，帶來了多元的______，豐富了原本的生活。", "answer": "文化、飲食", "explanation": "族群融合能創造豐富的文化樣貌。"},
        {"id": "4", "type": "multiple_choice", "question": "家鄉人口過度密集的缺點不包括？", "options": ["交通擁擠", "污染嚴重", "生活機能完善", "空間狹窄"], "answer": "生活機能完善", "explanation": "生活機能完善屬於優點而非缺點。"},
        {"id": "5", "type": "true_false", "question": "人口密度代表單位面積內平均居住的人數。", "answer": "True", "explanation": "計算方式為總人口除以總面積。"}
    ]},
    {"lesson": "Soc5", "title": "家鄉的變遷與在地文化", "order": 5, "questions": [
        {"id": "1", "type": "multiple_choice", "question": "家鄉老舊的古蹟被保存下來，對文化有什麼意義？", "options": ["阻礙交通空間", "見證家鄉歷史與傳承", "浪費修稅錢", "沒有意義"], "answer": "見證家鄉歷史與傳承", "explanation": "歷史建築是家鄉生命力的象徵。"},
        {"id": "2", "type": "true_false", "question": "家鄉的慶典活動（如遶境）是重要的無形文化資產。", "answer": "True", "explanation": "宗教與民俗活動蘊含豐富的族群情感與歷史。"},
        {"id": "3", "type": "fill_in_the_blank", "question": "我們可以透過「修復」或「轉型利用」讓老建築展現______活力。", "answer": "新、再造", "explanation": "老屋新生是文化保存與創新的結合。"},
        {"id": "4", "type": "multiple_choice", "question": "哪一項行為能展現愛護家鄉文化的精神？", "options": ["在古蹟牆壁刻名字", "隨地亂丟祭典後的垃圾", "主動認識家鄉地名由來", "嘲笑別人的族群語言"], "answer": "主動認識家鄉地名由來", "explanation": "了解歷史是尊重的開始。"},
        {"id": "5", "type": "true_false", "question": "地方戲曲與工藝是祖先留下的智慧與瑰寶。", "answer": "True", "explanation": "這些傳統工藝應給予支持與推廣。"}
    ]},
    {"lesson": "Soc6", "title": "展望家鄉", "order": 6, "questions": [
        {"id": "1", "type": "multiple_choice", "question": "永續家鄉的首要任務是？", "options": ["拼命蓋樓拆樹", "保護自然環境與資源", "把垃圾丟到別的地方", "全面工業化"], "answer": "保護自然環境與資源", "explanation": "永續發展建立在保護生態基礎上。"},
        {"id": "2", "type": "true_false", "question": "家鄉的公共事務需要居民主動參與討論。", "answer": "True", "explanation": "社區營造需要公民參與。"},
        {"id": "3", "type": "fill_in_the_blank", "question": "我們應發展「綠色交通」，鼓勵搭乘______工具。", "answer": "大眾運輸、公車、捷運", "explanation": "減少私人載具能降低碳排放。"},
        {"id": "4", "type": "multiple_choice", "question": "面對家鄉的缺點，我們應該抱持什麼態度？", "options": ["假裝沒看到", "怨天尤人", "找出問題並共同尋求對策", "直接搬離家鄉"], "answer": "找出問題並共同尋求對策", "explanation": "正向面對與解決才是愛鄉表現。"},
        {"id": "5", "type": "true_false", "question": "家鄉的未來掌握在這一代與下一代的手中。", "answer": "True", "explanation": "傳承與創新是展望未來的關鍵。"}
    ]}
]

# Write for Kang Hsuan, Han Lin, Nan Yi with slightly adjusted titles if needed
for pub in ["康軒", "翰林", "南一"]:
    dest_dir = os.path.join(base_path, pub)
    for unit in social_s2:
        pub_key = "kang_hsuan" if pub=="康軒" else ("han_lin" if pub=="翰林" else "nan_yi")
        data = {
            "meta": {
                "grade": "grade_4",
                "semester": "semester_2",
                "subject": "社會",
                "publisher": pub_key,
                "lesson": unit["lesson"],
                "order": unit["order"],
                "title": unit["title"]
            },
            "questions": unit["questions"]
        }
        filename = f"{unit['lesson']}_{unit['title']}.json"
        create_json(os.path.join(dest_dir, filename), data)
        print(f"Created: {pub}/{filename}")
