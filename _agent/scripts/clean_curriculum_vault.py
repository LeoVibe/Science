import re
import os

def clean_file(file_path):
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found.")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split by lessons (#### 📖)
    sections = re.split(r'(#### 📖 .+)', content)
    
    header = sections[0]
    cleaned_sections = [header]
    
    for i in range(1, len(sections), 2):
        title_line = sections[i]
        body = sections[i+1] if i+1 < len(sections) else ""
        
        # Keep URL
        url_match = re.search(r'(\*\*URL\*\*: https?://[^\n]+)', body)
        url_line = url_match.group(1) if url_match else ""
        
        # Find the start of noise (e.g., "課文文意測驗", "文意測驗", "字音字義", "＊")
        # We want to keep the text between URL and noise.
        
        # Remove header/URL from body to get pure text content area
        text_area = body
        if url_line:
            text_area = text_area.replace(url_line, "", 1)
        
        # Patterns that mark the end of the actual lesson text
        noise_markers = [
            r'課文文意測驗',
            r'文意測驗',
            r'字音字義',
            r'詞語測驗',
            r'其他測驗',
            r'查成績',
            r'回三上',
            r'回三下',
            r'回四上',
            r'回四下',
            r'回五上',
            r'回五下',
            r'回六上',
            r'回六下',
            r'看看其他課文',
            r'回三年級資料列表',
            r'回四年級資料列表',
            r'回五年級資料列表',
            r'回六年級資料列表',
            r'＊', # Vocabulary/Idiom explanations
            r'大意：', # Summary (usually part of notes)
            r'第一段：',
            r'第二段：',
            r'\d\.提取訊息', # Questions
            r'\d\.推論訊息',
            r'\d\.詮釋整合',
            r'\d\.比較評估'
        ]
        
        # Combine markers into a single regex and find the first occurrence
        combined_noise_regex = '|'.join(noise_markers)
        noise_start_match = re.search(combined_noise_regex, text_area)
        
        if noise_start_match:
            clean_text = text_area[:noise_start_match.start()]
        else:
            clean_text = text_area
            
        # Clean up clean_text (remove leading/trailing spaces, extra newlines)
        clean_text = clean_text.strip()
        
        # Format the lesson back
        cleaned_body = f"\n{url_line}\n\n{clean_text}\n\n---\n"
        cleaned_sections.append(title_line)
        cleaned_sections.append(cleaned_body)

    final_content = "".join(cleaned_sections)
    
    # Overwrite the file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(final_content)
    
    print(f"Successfully cleaned: {file_path}")

if __name__ == "__main__":
    vault_path = "/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject/knowledge/1_課綱研究/國語/KL3_國語科_課名_課文彙整.md"
    clean_file(vault_path)
