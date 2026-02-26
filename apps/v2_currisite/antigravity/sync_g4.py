import os
import shutil

SOURCE_BASE = "/Users/s389080/Documents/文件 - NM389080/miaw/antigravity/questions/source/G4"
PLATFORM_BASE = "/Users/s389080/Documents/文件 - NM389080/miaw/antigravity/questions/platform/G4"

def sync_g4():
    if os.path.exists(PLATFORM_BASE):
        shutil.rmtree(PLATFORM_BASE)
    
    os.makedirs(PLATFORM_BASE, exist_ok=True)
    
    for root, dirs, files in os.walk(SOURCE_BASE):
        for file in files:
            if file.endswith(".json"):
                source_path = os.path.join(root, file)
                rel_path = os.path.relpath(source_path, SOURCE_BASE)
                dest_path = os.path.join(PLATFORM_BASE, rel_path)
                
                os.makedirs(os.path.dirname(dest_path), exist_ok=True)
                shutil.copy2(source_path, dest_path)
                print(f"Synced: {rel_path}")

if __name__ == "__main__":
    sync_g4()
