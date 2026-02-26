import os
import json
from datetime import datetime

# Configuration
SOURCE_BASE = "/Users/s389080/Documents/文件 - NM389080/miaw/antigravity/questions/source"
DOC_PATH = "/Users/s389080/Documents/文件 - NM389080/miaw/Cursor/Science-Standalone/docs/CURRICULUM_COVERAGE.md"

def generate_coverage_report():
    report_data = {} # Grade -> Subject -> Semester -> Publisher -> Count
    
    # Traverse directory to build data structure
    for root, dirs, files in os.walk(SOURCE_BASE):
        for file in files:
            if file.endswith(".json"):
                try:
                    parts = root.split("/")
                    try:
                        source_idx = parts.index("source")
                        if len(parts) < source_idx + 5: continue
                        
                        grade = parts[source_idx + 1]   # G3
                        subject = parts[source_idx + 2] # 國語
                        semester = parts[source_idx + 3] # S1
                        publisher = parts[source_idx + 4] # 康軒
                    except ValueError:
                        continue

                    if grade not in report_data: report_data[grade] = {}
                    if subject not in report_data[grade]: report_data[grade][subject] = {}
                    if semester not in report_data[grade][subject]: report_data[grade][subject][semester] = {}
                    if publisher not in report_data[grade][subject][semester]: report_data[grade][subject][semester][publisher] = 0
                    
                    report_data[grade][subject][semester][publisher] += 1

                except Exception as e:
                    pass

    # Generate Markdown Content
    lines = []
    lines.append("# 📊 題庫建置進度摘要 (Curriculum Status Summary)")
    lines.append(f"\n**最後更新時間**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append("\n符號說明：")
    lines.append("- ✅ **已完成** (有檔案)")
    lines.append("- ⬜ **缺漏** (無檔案)")
    lines.append("- ⚠️ **部分完成** (僅單一學期或單一版本)")
    lines.append("\n---")
    
    # Grades Logic
    all_grades = ["G3", "G4", "G5", "G6"]
    all_subjects = ["國語", "英文", "數學", "自然", "社會"]
    all_publishers = ["康軒", "翰林", "南一"]
    all_semesters = ["S1", "S2"]

    for grade in all_grades:
        lines.append(f"\n## 🎓 {grade[1:]}年級 ({grade})")
        
        # Check overall completeness for this grade
        if grade not in report_data:
            lines.append("> ⚠️ 此年級尚未建立任何題庫檔。")
            lines.append("") # Empty line
            # Create empty table
            lines.append("| 科目 | 學期 | 康軒 | 翰林 | 南一 |")
            lines.append("|:---:|:---:|:---:|:---:|:---:|")
            for subj in all_subjects:
                 lines.append(f"| {subj} | 上 | ⬜ | ⬜ | ⬜ |")
                 lines.append(f"| {subj} | 下 | ⬜ | ⬜ | ⬜ |")
            continue

        # Table Header
        lines.append("| 科目 | 學期 | 康軒 | 翰林 | 南一 | 狀態備註 |")
        lines.append("|:---:|:---:|:---:|:---:|:---:|:---|")
        
        for subj in all_subjects:
            # Check S1
            s1_row = []
            s1_status = []
            for pub in all_publishers:
                count = report_data.get(grade, {}).get(subj, {}).get("S1", {}).get(pub, 0)
                if count > 0:
                    s1_row.append(f"✅ ({count})")
                    s1_status.append(True)
                else:
                    s1_row.append("⬜")
                    s1_status.append(False)
            
            s1_note = "完整" if all(s1_status) else ("部分缺" if any(s1_status) else "全缺")
            lines.append(f"| **{subj}** | 上 (S1) | {s1_row[0]} | {s1_row[1]} | {s1_row[2]} | {s1_note} |")

            # Check S2
            s2_row = []
            s2_status = []
            for pub in all_publishers:
                count = report_data.get(grade, {}).get(subj, {}).get("S2", {}).get(pub, 0)
                if count > 0:
                    s2_row.append(f"✅ ({count})")
                    s2_status.append(True)
                else:
                    s2_row.append("⬜")
                    s2_status.append(False)
            
            s2_note = "完整" if all(s2_status) else ("部分缺" if any(s2_status) else "全缺")
            lines.append(f"|  | 下 (S2) | {s2_row[0]} | {s2_row[1]} | {s2_row[2]} | {s2_note} |")
            
            # Separator row for readability
            # lines.append("|---|---|---|---|---|---|") 

    # Append Detailed File List (Optional, kept at bottom)
    lines.append("\n\n---\n")
    lines.append("# 📑 詳細題庫清單 (Detailed File List)")
    lines.append("> 以下列出系統中所有已建立的題庫檔案，供細部核對使用。")
    
    sorted_grades = sorted(report_data.keys(), key=lambda x: int(x[1:]) if x[1:].isdigit() else 99)
    for grade in sorted_grades:
        lines.append(f"\n### {grade}")
        subjects = sorted(report_data[grade].keys())
        for subject in subjects:
            lines.append(f"\n#### {subject}")
            semesters = sorted(report_data[grade][subject].keys())
            for sem in semesters:
                publishers = sorted(report_data[grade][subject][sem].keys())
                for pub in publishers:
                    count = report_data[grade][subject][sem][pub]
                    lines.append(f"- **{sem} / {pub}**: {count} 課")

    # Write to file
    os.makedirs(os.path.dirname(DOC_PATH), exist_ok=True)
    with open(DOC_PATH, 'w', encoding='utf-8') as f:
        f.write("\n".join(lines))
    
    print(f"Summary report generated at: {DOC_PATH}")

if __name__ == "__main__":
    generate_coverage_report()
