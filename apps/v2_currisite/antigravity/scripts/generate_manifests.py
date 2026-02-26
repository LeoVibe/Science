import os
import json
from datetime import datetime, timezone
from pathlib import Path

# 定義平台區根目錄
ROOT_DIR = Path("questions/platform")

def generate_manifest(directory):
    """
    為指定目錄生成 manifest.json，列出所有 .json 檔案。
    """
    json_files = [
        f.name for f in directory.glob("*.json") 
        if f.is_file() and f.name != "manifest.json"
    ]
    json_files.sort()
    
    if not json_files:
        return

    manifest_data = {
        "version": "1.0.0",
        "generated": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "files": json_files
    }
    
    manifest_path = directory / "manifest.json"
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest_data, f, indent=2, ensure_ascii=False)
    print(f"✅ Generated manifest for {directory}")

def main():
    if not ROOT_DIR.exists():
        print(f"❌ Error: {ROOT_DIR} does not exist.")
        return

    # 遍歷所有子目錄
    for directory in ROOT_DIR.rglob("*"):
        if directory.is_dir():
            generate_manifest(directory)

if __name__ == "__main__":
    main()
