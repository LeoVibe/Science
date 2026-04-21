import re
import os

def extract_standard_names():
    base_dir = "/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject/knowledge/1_課綱研究/國語/"
    standards = {}
    
    # Files to scan
    files = [
        "三上/KL3_三上_國語_發展綱要.md",
        "三下/KL3_三下_國語_研究總綱.md",
        "四上/KL3_四上_國語_發展綱要.md",
        "四下/KL3_四下_國語_發展綱要.md",
        "五下/KL3_五下_國語_發展綱要.md",
        "六下/KL3_六下_國語_發展綱要.md"
    ]
    
    for relative_path in files:
        full_path = os.path.join(base_dir, relative_path)
        if not os.path.exists(full_path):
            print(f"File not found: {full_path}")
            continue
            
        print(f"Scanning: {relative_path}")
        with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            
        # Parse Tables - Robust regex
        # Matches "| L1 | Name |" or "| L1 | **Name** |" 
        matches = re.findall(r'\| [Ll]\d+\s*\| (.*?)\|', content)
        for name in matches:
            # Clean up the name
            name = name.split('|')[0].strip() # Take the first column content after L1
            name = name.replace('**', '').replace('`', '').strip()
            if name and "課程名稱" not in name and "翰林" not in name and "康軒" not in name and "南一" not in name:
                standards[name] = relative_path
                
    return standards

def extract_vault_names():
    vault_path = "/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject/knowledge/1_課綱研究/國語/KL3_國語科_課名_課文彙整.md"
    if not os.path.exists(vault_path):
        return set()
        
    with open(vault_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
        
    # Find #### 📖 ....
    matches = re.findall(r'#### 📖 (.*)', content)
    vault_names = []
    for m in matches:
        # Remove prefix like "閱讀測驗--0230101"
        clean_name = re.sub(r'(閱讀測驗|[A-Za-z0-9\-]+)--', '', m).strip()
        vault_names.append(clean_name)
    return set(vault_names)

def main():
    standards = extract_standard_names()
    vault = extract_vault_names()
    
    print(f"--- CURRICULUM COMPARE REPORT ---")
    print(f"Standards Count: {len(standards)}")
    print(f"Vault Count: {len(vault)}")
    print("-" * 30)
    
    if not standards:
        print("Warning: No standards found in development outlines!")
        return

    missing = []
    for s_name in standards:
        found = False
        for v_name in vault:
            # Normalizing comparison
            if s_name in v_name or v_name in s_name:
                found = True
                break
        if not found:
            missing.append((s_name, standards[s_name]))
            
    if missing:
        print(f"MISSING IN VAULT ({len(missing)} items):")
        for name, src in missing:
            print(f"[X] {name} (from {src})")
    else:
        print("Success: All analyzed standards found in vault!")

if __name__ == "__main__":
    main()
