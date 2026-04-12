import re
import os

def extract_old_names():
    path = "/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject/knowledge/課綱研究/國語/三下/KL4_三下_國語_原始研究素材庫.md"
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Matches "| L1 | Name |"
    matches = re.findall(r'\| L\d+ \| (.*?) \|', content)
    names = [m.strip() for m in matches if m.strip() != "課程名稱"]
    # Handle duplicates if any (though there shouldn't be for different publishers)
    return names

def extract_new_names():
    path = "/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject/knowledge/課綱研究/國語/KL3_國語科_課名_課文彙整.md"
    if not os.path.exists(path):
        return []
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    matches = re.findall(r'#### 📖 (.*)', content)
    names = []
    for m in matches:
        # Clean prefix and normalize
        clean = re.sub(r'(閱讀測驗|[A-Za-z0-9\-]+)--', '', m).strip()
        names.append(clean)
    return names

def compare_content(lesson_name):
    # Search for lesson in KL4 files
    # Note: KL4 files are in subdirs 康軒, 翰林, 南一
    old_text = ""
    new_vault_path = "/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject/knowledge/課綱研究/國語/KL3_國語科_課名_課文彙整.md"
    
    # Find old text in any KL4 file
    base_dir = "/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject/knowledge/課綱研究/國語/三下/"
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith("單課研究紀錄.md") and lesson_name in file:
                with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                    content = f.read()
                    # Extract quote block
                    match = re.search(r'> \*\*課文標題：.*?\*\*\n>\s*\n(.*?)(?=\n\n### 2.|$)', content, re.DOTALL)
                    if match:
                        old_text = match.group(1).replace('> ', '').strip()
                break
    
    # Find new text in vault
    new_text = ""
    with open(new_vault_path, 'r', encoding='utf-8', errors='ignore') as f:
        vault_content = f.read()
        match = re.search(rf'#### 📖 .*?{re.escape(lesson_name)}.*?\n\*\*URL\*\*: .*?\n\n(.*?)(?=\n\n#### 📖|### 📋|## 🏛️|$)', vault_content, re.DOTALL)
        if match:
            new_text = match.group(1).strip()
            
    return old_text, new_text

def main():
    old_names = extract_old_names()
    new_names = extract_new_names()
    
    print(f"--- G3S2 CURRICULUM ANALYSIS ---")
    print(f"Old Names (Source Matrix): {len(old_names)}")
    print(f"New Names (Vault): {len(new_names)}")
    
    matched = []
    missing = []
    for on in old_names:
        found = False
        for nn in new_names:
            if on in nn or nn in on:
                matched.append(on)
                found = True
                break
        if not found:
            missing.append(on)
            
    print(f"Matched count: {len(matched)}")
    print(f"Missing count: {len(missing)}")
    if missing:
        print(f"Missing items: {missing}")
        
    print("\n--- CONTENT COMPARISON (SAMPLE) ---")
    samples = ["許願", "臺灣的山椒魚", "還要跌幾次"]
    for s in samples:
        ot, nt = compare_content(s)
        if ot and nt:
            # Simple length comparison or preview
            print(f"Lesson: {s}")
            print(f"  Old Text Len: {len(ot)}")
            print(f"  New Text Len: {len(nt)}")
            # Show first 50 chars of both
            print(f"  Old Preview: {ot[:50]}...")
            print(f"  New Preview: {nt[:50]}...")
        else:
            print(f"Lesson: {s} - Data incomplete for comparison (Old:{'OK' if ot else 'MISS'}, New:{'OK' if nt else 'MISS'})")

if __name__ == "__main__":
    main()
