import re
import os

def sanitize_and_clean(file_path):
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found.")
        return

    # Phase 1: Encoding Sanitization
    print(f"Sanitizing encoding for {file_path}...")
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    # Phase 2: Content Cleaning
    print(f"Cleaning content for {file_path}...")
    
    # Split by lessons (#### 📖)
    # We use a non-consuming split to keep the markers
    parts = re.split(r'(#### 📖 .+)', content)
    
    cleaned_parts = [parts[0]] # The very first header
    
    for i in range(1, len(parts), 2):
        title_line = parts[i]
        body = parts[i+1] if i+1 < len(parts) else ""
        
        # Keep URL
        url_match = re.search(r'(\*\*URL\*\*: https?://[^\n]+)', body)
        url_line = url_match.group(1) if url_match else ""
        
        # We need to capture any semester headers (### 📋) that might be trapped in the body
        # Usually they appear at the end of the previous lesson's body.
        sem_header_match = re.search(r'(### 📋 .+)', body)
        sem_header = sem_header_match.group(1) if sem_header_match else ""
        
        # Extract pure text (between URL and next section/noise)
        text_area = body
        if url_line:
            text_area = text_area.replace(url_line, "", 1)
        
        # Stop at noise markers
        noise_markers = [
            r'課文文意測驗', r'文意測驗', r'字音字義', r'詞語測驗', r'其他測驗',
            r'查成績', r'回\d[上下]', r'看看其他課文', r'回\w+年級資料列表',
            r'\*', r'大意：', r'第一段：', r'\d\.提取訊息', r'---'
        ]
        
        combined_noise_regex = '|'.join(noise_markers)
        noise_start_match = re.search(combined_noise_regex, text_area)
        
        if noise_start_match:
            clean_text = text_area[:noise_start_match.start()]
        else:
            clean_text = text_area
            
        clean_text = clean_text.strip()
        
        # Formatting
        cleaned_body = f"\n{url_line}\n\n{clean_text}\n\n"
        if sem_header:
            cleaned_body += f"\n{sem_header}\n" # Carry forward the semester header
            
        cleaned_parts.append(title_line)
        cleaned_parts.append(cleaned_body)

    final_content = "".join(cleaned_parts)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(final_content)
    
    print(f"Successfully sanitized and cleaned: {file_path}")

if __name__ == "__main__":
    vault_path = "/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject/knowledge/1_課綱研究/國語/KL3_國語科_課名_課文彙整.md"
    sanitize_and_clean(vault_path)
