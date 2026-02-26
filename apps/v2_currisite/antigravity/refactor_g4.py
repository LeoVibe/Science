import os
import json
import shutil

# 113 學年度四年級正確目錄對照表 (關鍵字匹配)
G4_STANDARD = {
    "數學": {
        "S1": {
            "康軒": ["一萬以上的數", "乘法", "角度", "除法", "公里", "三角形", "小數", "四則", "分數", "統計"],
            "翰林": ["億以內的數", "乘法", "角度", "假分數", "公里", "除法", "三角形", "兩步驟", "小數", "統計"],
            "南一": ["一億以內的數", "乘法", "角度", "公里", "除法", "三角形", "統計", "四則", "小數", "分數"]
        },
        "S2": {
            "康軒": ["億以上的數", "四邊形", "簡化計算", "面積", "小數乘法", "等值分數", "數量規律", "概數", "時間", "立方公分"],
            "翰林": ["概數", "四則計算", "四邊形", "體積", "規律"], # 簡化匹配
            "南一": ["多位數", "四邊形", "分數的加減", "概數", "面積", "小數乘法", "體積", "等值分數", "時間", "立方公分"]
        }
    },
    "自然": {
        "S1": {
            "康軒": ["地表", "水生", "聲光", "電路"],
            "翰林": ["天空", "水域", "聲光", "性質"],
            "南一": ["月亮", "水域", "電路", "性質"]
        },
        "S2": {
            "康軒": ["天空", "水的移動", "昆蟲", "自然資源"],
            "翰林": ["力", "水的奇妙現象", "變動的大地", "能源"],
            "南一": ["昆蟲", "力", "水的移動", "星空"]
        }
    },
    "社會": {
        "S1": {
            "康軒": ["位置", "地形", "氣候", "住屋", "器物", "信仰", "老街", "作息", "傳統的節慶", "現代的節日"],
            "翰林": ["地圖", "地形與氣候", "人口", "語言", "節慶", "家鄉"],
            "南一": ["環境", "地名", "發展", "信仰"]
        },
        "S2": {
            "康軒": ["產業探索", "產業轉變", "交通運輸", "人口", "在地文化", "展望"],
            "翰林": ["產業發展", "結構的變遷", "理財", "消費", "交通網路", "科技", "永續"],
            "南一": ["機構", "產業與生活", "人口", "交通與通訊", "公共問題"]
        }
    }
}

BASE_PATH = "/Users/s389080/Documents/文件 - NM389080/miaw/antigravity/questions/source/G4"

def get_correct_position(subject, publisher, title):
    if subject not in G4_STANDARD: return None
    for sem in ["S1", "S2"]:
        if publisher not in G4_STANDARD[subject][sem]: continue
        units = G4_STANDARD[subject][sem][publisher]
        for i, unit_keyword in enumerate(units):
            if unit_keyword in title:
                prefix = "M" if subject=="數學" else ("Sci" if subject=="自然" else "Soc")
                return sem, f"{prefix}{i+1}", i+1
    return None

def refactor():
    files_to_process = []
    for root, dirs, filenames in os.walk(BASE_PATH):
        for f in filenames:
            if f.endswith(".json"):
                files_to_process.append(os.path.join(root, f))

    for file_path in files_to_process:
        with open(file_path, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
            except: continue
            
            meta = data.get("meta", {})
            subject = meta.get("subject")
            publisher_raw = meta.get("publisher")
            pub_map = {"kang_hsuan": "康軒", "han_lin": "翰林", "nan_yi": "南一"}
            publisher = pub_map.get(publisher_raw, publisher_raw)
            
            if subject in ["國語", "英文"]: continue
            
            title = meta.get("title")
            pos = get_correct_position(subject, publisher, title)
            if pos:
                correct_sem, correct_lesson, correct_order = pos
                dest_dir = os.path.join(BASE_PATH, subject, correct_sem, publisher)
                os.makedirs(dest_dir, exist_ok=True)
                
                meta["semester"] = "semester_1" if correct_sem == "S1" else "semester_2"
                meta["lesson"] = correct_lesson
                meta["order"] = correct_order
                
                new_filename = f"{correct_lesson}_{title.replace(' ', '_')}.json"
                dest_path = os.path.join(dest_dir, new_filename)
                
                with open(dest_path, 'w', encoding='utf-8') as fout:
                    json.dump(data, fout, ensure_ascii=False, indent=4)
                
                if os.path.abspath(file_path) != os.path.abspath(dest_path):
                    print(f"Moved: {os.path.basename(file_path)} -> {correct_sem}/{publisher}/{new_filename}")
                    # 不要在這裡刪除，因為可能原本就在同一個資料夾，只是改名
            else:
                print(f"Unknown: {file_path}")

if __name__ == "__main__":
    refactor()
