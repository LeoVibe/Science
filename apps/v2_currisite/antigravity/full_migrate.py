import os
import json
import shutil
from pathlib import Path

def migrate():
    source_root = Path("questions")
    target_root = Path("questions/source")
    
    # 遍歷所有 .json 檔案
    for json_file in list(source_root.rglob("*.json")):
        # 跳過已經在 source 或 platform 或 library 中的檔案
        if any(p in json_file.parts for p in ["source", "platform", "library"]):
            continue
            
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                meta = data.get("meta", {})
                
                # 獲取屬性
                grade = meta.get("grade", "").replace("grade_", "G").upper()
                subject = meta.get("subject", "未指定")
                semester_raw = meta.get("semester", "semester_1")
                semester = "S1" if "1" in semester_raw else "S2"
                publisher_raw = meta.get("publisher", "unknown")
                
                # 出版社對應映射
                pub_map = {
                    "kang_hsuan": "康軒",
                    "han_lin": "翰林",
                    "nan_yi": "南一"
                }
                publisher = pub_map.get(publisher_raw, publisher_raw)
                
                # 建立目標路徑
                target_dir = target_root / grade / subject / semester / publisher
                target_dir.mkdir(parents=True, exist_ok=True)
                
                # 搬移檔案
                target_file = target_dir / json_file.name
                shutil.move(str(json_file), str(target_file))
                print(f"Moved: {json_file} -> {target_file}")
                
        except Exception as e:
            print(f"Error processing {json_file}: {e}")

if __name__ == "__main__":
    migrate()
