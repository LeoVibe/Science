"""
全面同步腳本：
- 來源：antigravity/questions/source/
- 目標：Cursor/Science-Standalone/public/questions/platform/
- 同時更新 antigravity/questions/platform/（備份用）
- 重新產出所有 manifest.json
"""
import os
import json
import shutil
from datetime import datetime

SOURCE_BASE = "/Users/s389080/Documents/文件 - NM389080/miaw/antigravity/questions/source"
PLATFORM_BACKUP = "/Users/s389080/Documents/文件 - NM389080/miaw/antigravity/questions/platform"
PLATFORM_WEB = "/Users/s389080/Documents/文件 - NM389080/miaw/Cursor/Science-Standalone/public/questions/platform"

def sync_all():
    stats = {"synced": 0, "dirs": 0}
    
    for target_base in [PLATFORM_BACKUP, PLATFORM_WEB]:
        print(f"\n🔄 同步至: {target_base}")
        
        # 清空目標目錄（重建確保乾淨）
        if os.path.exists(target_base):
            shutil.rmtree(target_base)
        os.makedirs(target_base, exist_ok=True)
        
        # 收集每個 publisher 目錄的 json 檔案
        dir_files = {}  # dest_dir -> [filenames]
        
        for root, dirs, files in os.walk(SOURCE_BASE):
            json_files = [f for f in files if f.endswith(".json")]
            if not json_files:
                continue
            
            # 計算相對路徑
            rel = os.path.relpath(root, SOURCE_BASE)
            dest_dir = os.path.join(target_base, rel)
            os.makedirs(dest_dir, exist_ok=True)
            stats["dirs"] += 1
            
            copied = []
            for f in json_files:
                src = os.path.join(root, f)
                dst = os.path.join(dest_dir, f)
                shutil.copy2(src, dst)
                copied.append(f)
                stats["synced"] += 1
            
            dir_files[dest_dir] = copied
        
        # 產出 manifest.json
        manifest_count = 0
        for dest_dir, files in dir_files.items():
            import re
            def sort_key(fn):
                m = re.search(r'\d+', fn)
                return int(m.group()) if m else fn
            
            sorted_files = sorted(files, key=sort_key)
            manifest = {"files": sorted_files}
            manifest_path = os.path.join(dest_dir, "manifest.json")
            with open(manifest_path, 'w', encoding='utf-8') as mf:
                json.dump(manifest, mf, ensure_ascii=False, indent=2)
            manifest_count += 1
        
        print(f"  ✅ 同步 {stats['synced']} 個題庫檔案")
        print(f"  ✅ 產出 {manifest_count} 個 manifest.json")
        stats = {"synced": 0, "dirs": 0}

def generate_coverage_report():
    """掃描 source 目錄，產出覆蓋率報告"""
    DOC_PATH = "/Users/s389080/Documents/文件 - NM389080/miaw/Cursor/Science-Standalone/docs/record/CURRICULUM_COVERAGE.md"
    
    report_data = {}  # Grade -> Subject -> Semester -> Publisher -> Count
    
    for root, dirs, files in os.walk(SOURCE_BASE):
        json_files = [f for f in files if f.endswith(".json")]
        if not json_files:
            continue
        try:
            parts = root.split("/")
            source_idx = parts.index("source")
            if len(parts) < source_idx + 5:
                continue
            grade = parts[source_idx + 1]
            subject = parts[source_idx + 2]
            semester = parts[source_idx + 3]
            publisher = parts[source_idx + 4]
        except (ValueError, IndexError):
            continue
        
        if grade not in report_data: report_data[grade] = {}
        if subject not in report_data[grade]: report_data[grade][subject] = {}
        if semester not in report_data[grade][subject]: report_data[grade][subject][semester] = {}
        if publisher not in report_data[grade][subject][semester]: report_data[grade][subject][semester][publisher] = 0
        report_data[grade][subject][semester][publisher] += len(json_files)
    
    all_grades = ["G3", "G4", "G5", "G6"]
    all_subjects = ["國語", "英文", "數學", "自然", "社會"]
    
    lines = []
    lines.append("# 📊 題庫建置進度摘要 (Curriculum Status Summary)")
    lines.append(f"\n**最後更新時間**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append(f"**資料來源**: `questions/source/` (唯一真實來源)")
    lines.append(f"**同步目標**: `public/questions/platform/` (網站讀取)")
    lines.append("\n**符號說明**：")
    lines.append("- ✅ `(n)` 已完成，n = 課程單元數")
    lines.append("- ⬜ 尚未建立")
    lines.append("\n---")
    
    for grade in all_grades:
        lines.append(f"\n## 🎓 {grade[1:]}年級 ({grade})")
        
        if grade not in report_data:
            lines.append("\n> 此年級尚未建立任何題庫。")
            lines.append("\n| 科目 | 學期 | 康軒 | 翰林 | 南一 | 狀態 |")
            lines.append("|:---:|:---:|:---:|:---:|:---:|:---:|")
            for subj in all_subjects:
                lines.append(f"| **{subj}** | 上 S1 | ⬜ | ⬜ | ⬜ | ❌ 全缺 |")
                lines.append(f"|  | 下 S2 | ⬜ | ⬜ | ⬜ | ❌ 全缺 |")
            continue
        
        lines.append("\n| 科目 | 學期 | 康軒 | 翰林 | 南一 | 狀態 |")
        lines.append("|:---:|:---:|:---:|:---:|:---:|:---:|")
        
        for subj in all_subjects:
            for sem, sem_label in [("S1", "上 S1"), ("S2", "下 S2")]:
                row = []
                statuses = []
                for pub in ["康軒", "翰林", "南一"]:
                    count = report_data.get(grade, {}).get(subj, {}).get(sem, {}).get(pub, 0)
                    if count > 0:
                        row.append(f"✅ ({count})")
                        statuses.append(True)
                    else:
                        row.append("⬜")
                        statuses.append(False)
                
                if all(statuses):
                    status = "✅ 完整"
                elif any(statuses):
                    status = "⚠️ 部分缺"
                else:
                    status = "❌ 全缺"
                
                subj_col = f"**{subj}**" if sem == "S1" else ""
                lines.append(f"| {subj_col} | {sem_label} | {row[0]} | {row[1]} | {row[2]} | {status} |")
    
    # 詳細清單
    lines.append("\n\n---\n")
    lines.append("# 📑 詳細題庫清單")
    lines.append("> 以下為 source 目錄中所有已建立的題庫，供細部核對。\n")
    
    sorted_grades = sorted(report_data.keys(), key=lambda x: int(x[1:]) if x[1:].isdigit() else 99)
    for grade in sorted_grades:
        lines.append(f"\n### {grade[1:]}年級 ({grade})")
        for subj in all_subjects:
            if subj not in report_data.get(grade, {}):
                continue
            lines.append(f"\n#### {subj}")
            for sem in ["S1", "S2"]:
                if sem not in report_data[grade][subj]:
                    continue
                sem_label = "上學期" if sem == "S1" else "下學期"
                for pub in ["康軒", "翰林", "南一"]:
                    count = report_data[grade][subj][sem].get(pub, 0)
                    if count > 0:
                        lines.append(f"- {sem_label} / {pub}：{count} 課")
    
    os.makedirs(os.path.dirname(DOC_PATH), exist_ok=True)
    with open(DOC_PATH, 'w', encoding='utf-8') as f:
        f.write("\n".join(lines))
    print(f"\n📄 報告已更新：{DOC_PATH}")

if __name__ == "__main__":
    sync_all()
    generate_coverage_report()
