import csv
import json
import os
import re

# 目錄對應
base_dir = "/Users/s389080/Documents/文件 - NM389080/work/0_AI_Project/ScienceQuest"
input_dir = os.path.join(base_dir, "docs/research/output_Gemini")
output_base = os.path.join(base_dir, "public/questions/platform")

files_info = [
    {"file": "南一三下國語題庫_高品質版.csv", "grade": "G3", "grade_meta": "grade_3"},
    {"file": "南一四下國語題庫_高品質版.csv", "grade": "G4", "grade_meta": "grade_4"},
    {"file": "南一五下國語題庫_高品質版.csv", "grade": "G5", "grade_meta": "grade_5"},
]

def extract_lesson_info(lesson_str):
    lesson_str = lesson_str.strip()
    if lesson_str == "全冊整合":
        return "Review", "全冊整合"
    
    match = re.match(r"(L\d+)\s+(.*)", lesson_str)
    if match:
        return match.group(1), match.group(2).strip()
    return "Unknown", lesson_str

for info in files_info:
    csv_path = os.path.join(input_dir, info["file"])
    if not os.path.exists(csv_path):
        print(f"Skipping {info['file']} (not found)")
        continue
        
    grade = info["grade"]
    grade_meta = info["grade_meta"]
    
    # 建立輸出目錄結構: platform/G3/國語/S2/南一
    out_dir = os.path.join(output_base, grade, "國語", "S2", "南一")
    os.makedirs(out_dir, exist_ok=True)
    
    questions_by_lesson = {}
    
    with open(csv_path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            lesson_orig = row.get("課次", "")
            if not lesson_orig or lesson_orig == "課次": # Skip empty or repeated headers
                continue
                
            lesson_id, title = extract_lesson_info(lesson_orig)
            lesson_key = f"{lesson_id}_{title}"
            
            if lesson_key not in questions_by_lesson:
                questions_by_lesson[lesson_key] = {
                    "meta": {
                        "grade": grade_meta,
                        "semester": "semester_2",
                        "subject": "國語",
                        "publisher": "nan_yi",
                        "lesson": lesson_id,
                        "title": title
                    },
                    "questions": []
                }
            
            ans_letter = row.get("正確答案", "").strip().upper()
            answer_text = ""
            if ans_letter == "A": answer_text = row.get("選項A", "").strip()
            elif ans_letter == "B": answer_text = row.get("選項B", "").strip()
            elif ans_letter == "C": answer_text = row.get("選項C", "").strip()
            elif ans_letter == "D": answer_text = row.get("選項D", "").strip()
            
            q_id = str(len(questions_by_lesson[lesson_key]["questions"]) + 1)
            
            # 有可能選項中有空白等，可以strip()處理
            options = [
                row.get("選項A", "").strip(),
                row.get("選項B", "").strip(),
                row.get("選項C", "").strip(),
                row.get("選項D", "").strip()
            ]
            
            q_obj = {
                "id": q_id,
                "type": "multiple_choice",
                "question": row.get("題目內容", "").strip(),
                "options": options,
                "answer": answer_text,
                "explanation": row.get("命題解析", "").strip()
            }
            questions_by_lesson[lesson_key]["questions"].append(q_obj)
            
    # Write to JSON
    for lesson_key, data in questions_by_lesson.items():
        # sanitize title for filename
        safe_key = lesson_key.replace("/", "_").replace("\\", "_")
        json_path = os.path.join(out_dir, f"{safe_key}.json")
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        print(f"Generated {json_path}")

print("All Done!")
