import os
import json

SOURCE_BASE = "/Users/s389080/Documents/文件 - NM389080/miaw/antigravity/questions/source"
PLATFORM_BASE = "/Users/s389080/Documents/文件 - NM389080/miaw/antigravity/questions/platform"

def update_manifests():
    # Walk through the entire platform directory
    for root, dirs, files in os.walk(PLATFORM_BASE):
        json_files = [f for f in files if f.endswith(".json") and f != "manifest.json"]
        
        # If there are JSON files, generate/update manifest.json
        if json_files:
            # Sort files naturally (L1, L2, L3... instead of L1, L10, L11)
            # This is tricky with simple sort, let's try a custom key if possible
            # Or just sort alphabetically for now, it's consistent.
            
            # Simple alpha sort: L1, L10, L11...
            # Better sort: Try to extract numbers.
            def sort_key(filename):
                # Try to extract number after 'L' or similar prefix
                import re
                match = re.search(r'\d+', filename)
                if match:
                    return int(match.group())
                return filename

            json_files.sort(key=sort_key)
            
            manifest_path = os.path.join(root, "manifest.json")
            manifest_content = {"files": json_files}
            
            with open(manifest_path, 'w', encoding='utf-8') as f:
                json.dump(manifest_content, f, ensure_ascii=False, indent=2)
            
            print(f"Updated manifest: {os.path.relpath(manifest_path, PLATFORM_BASE)}")

if __name__ == "__main__":
    update_manifests()
