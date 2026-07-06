---
name: ei_md_extract
description: 多格式檔案 → Markdown 工程經驗集（PDF/DOCX/Excel/HTML/圖片 OCR），含工具選型、Pipeline 模式、坑與 fallback。經 JOB-218~226 批量驗證。
last_updated: 2026-05-06
updated_by: Claude Code (claude-opus-4-7)
---

# ei_md_extract — 多格式 → MD 工程經驗

**觸發**：批量轉檔、文件 → MD 化、OCR 後處理，或 `/ei_md_extract`。

**經驗來源**：JOB-218~226（考古題雙源 MD 整合，60 combo / 2117 檔），實證下列模式可批量穩定運作。

---

## 一、工具選型矩陣（依來源格式）

| 來源格式 | 首選工具 | Fallback | 何時用首選 | 何時換 fallback |
|:--|:--|:--|:--|:--|
| **純文字 PDF**（嵌入 text layer） | `pdfplumber` | `pymupdf` (fitz) | 90% 情況；layout 簡單、欄位清楚 | pdfplumber 抽不到（掃描檔/影像 PDF） |
| **掃描/影像 PDF** | LLM OCR（Codex/Gemini/Claude）+ 圖片渲染 | Mistral OCR API、PaddleOCR | 中文+數學公式+圖文混雜（教材常見） | 純文字、版面單純（用傳統 OCR 較快） |
| **DOCX** | `python-docx` | `pandoc` | 結構化 docx（標題、段落、表格） | 含複雜圖片/embedded 物件 |
| **Excel/CSV** | `openpyxl` + `pandas` | `csvkit` | 表格資料轉 MD table | 多 sheet/合併儲存格複雜 |
| **HTML** | `markdownify` | `pandoc`、`html2text` | 一般網頁/結構化 HTML | 需保留特殊標籤/CSS class |
| **圖片**（jpg/png） | LLM Vision（Claude/Codex） | Tesseract、PaddleOCR | 中文+公式+手寫混雜 | 純印刷文字、量大求快 |
| **混合來源**（PDF 含部分掃描頁） | 先 pdfplumber 試抽，empty 頁再 OCR | — | 雜誌/教材常見 | — |

> **鐵律**：抽不到不要硬抽。`pdfplumber.extract_text()` 回 `''` 或 < N 字 → 直接走 OCR fallback，不要試圖 parse 失敗的輸出。

---

## 二、PDF → MD（最常見場景）

### 2.1 三種 PDF 類型 + 偵測法

```python
import pdfplumber

def detect_pdf_type(path):
    with pdfplumber.open(path) as pdf:
        first_page_text = pdf.pages[0].extract_text() or ''
        if len(first_page_text.strip()) < 30:
            return 'scanned'  # 掃描/影像 → OCR
        # 檢查是否有大量 layout 元素
        if first_page_text.count('\n') > 50:
            return 'multi_column'  # 多欄/版面複雜
        return 'text'  # 純文字
```

### 2.2 純文字 PDF（最簡單）

```python
import pdfplumber

def pdf_to_md(path):
    parts = []
    with pdfplumber.open(path) as pdf:
        for i, page in enumerate(pdf.pages, 1):
            text = page.extract_text() or ''
            if text.strip():
                parts.append(f'## Page {i}\n\n{text}')
    return '\n\n'.join(parts)
```

**坑**：
- `extract_text()` 對中文 layout 排版常出錯（字距大/換行錯位）
- 表格用 `page.extract_tables()` 另抽，再手動轉 MD table

### 2.3 掃描 PDF → LLM OCR（推薦做法）

**為何選 LLM 而非 Tesseract/PaddleOCR**：
- 中文教材含大量公式（√、π、分數、化學式）— 傳統 OCR 必崩
- 含圖表說明 — LLM 能理解圖意一併描述
- 斷字問題（中文字之間多餘空白）幾乎自動處理

**用 Codex CLI 跑**（已驗證）：

```bash
# 1. PDF → 圖片（每頁一張 PNG，dpi=200 平衡品質與大小）
pdftoppm -png -r 200 input.pdf out_prefix

# 2. 把每頁圖丟給 Codex，請它輸出結構化 MD
codex exec --model gpt-5 --prompt-file ocr_prompt.md \
  --input out_prefix-*.png \
  --output result.md
```

**OCR prompt 必含**：
- 「保留原文順序，不重排不增刪」
- 「中文字之間若有多餘空白請去掉」
- 「公式用 LaTeX `$...$` 包起來」
- 「表格輸出 markdown table」
- 「不確定的字用 `[?]` 標記，不要亂猜」

### 2.4 PDF 表格抽取的三種策略

| 策略 | 工具 | 適用 |
|:--|:--|:--|
| 規則式 | `pdfplumber.extract_tables()` | 表格邊框清楚 |
| 視覺切片 | `camelot` | 邊框模糊但格式規律 |
| LLM 輸出 | Codex/Claude vision | 各種雜亂表格（最後手段） |

---

## 三、Pipeline 模式（批量轉檔的標準骨架）

從 JOB-226 實證：60 個 combo 一次跑完，必須 7 階段流水線才能穩定。

```
Phase 1: 配對/清單     ← 列出來源檔，產 _pairing.json
Phase 2: dispatch      ← 平行抽取（PARALLEL=4，各檔獨立）
Phase 3: 漏檔回掃      ← actual < expected 重 dispatch（max 1 次）
Phase 4: index 產生    ← _index.json（元數據彙總）
Phase 5: 驗證          ← 字數/結構/欄位 sanity check
Phase 5b: LLM 修補     ← 失敗檔丟回 LLM 修
Phase 5c: 字眼修補     ← 規則式 sed/regex 修常見錯字
Phase 6: 抽樣品質      ← 隨機抽 N 份請 LLM 比對
```

### 3.1 Phase 1 配對：產出 dispatch 清單

```json
{
  "pairings": [
    {
      "id": "001",
      "source": "raw/檔1.pdf",
      "output": "out/檔1.md",
      "state": "pending",
      "expected_size_min": 500
    }
  ]
}
```

**為什麼要 _pairing.json**：dispatch 是 stateless 的，必須有外部清單記住「該做哪些 / 跳過哪些」，否則重跑會覆蓋。

### 3.2 Phase 2 dispatch：平行批處理

**PARALLEL 經驗值**：
- LLM API（Codex/Claude/Gemini）→ `PARALLEL=4`（再多會撞 rate limit）
- 純 Python（pdfplumber）→ `PARALLEL=8`（CPU bound）
- OCR 本機（Tesseract）→ CPU 核數

```bash
# 用 xargs 平行（最簡單）
ls raw/*.pdf | xargs -P 4 -I {} python3 extract_one.py {}

# 或 GNU parallel（更靈活）
parallel -j 4 python3 extract_one.py ::: raw/*.pdf
```

### 3.3 Watchdog：必裝

LLM API 偶爾會 hang（5+ 分鐘無回應）。**沒 watchdog 的批次跑大量會永久卡住**。

```bash
timeout 1500 python3 extract_one.py "$file" || echo "TIMEOUT: $file"
```

**1500s（25 分）** 是 JOB-226 實證的合理上限——再長就是有問題該重試。

### 3.4 Phase 5 驗證：寫 _validation_report.json

每份檔產出後 sanity check，**不要等到全部跑完才驗**。

```python
def validate(md_path):
    text = open(md_path).read()
    checks = {
        'has_frontmatter': text.startswith('---\n'),
        'min_length': len(text) > 500,
        'no_placeholder': '[?]' not in text or text.count('[?]') < 5,
        'utf8_clean': '�' not in text,  # 編碼錯誤標記
    }
    return all(checks.values()), checks
```

### 3.5 Phase 6 抽樣：別省這一步

跑完 60 combo 後，**抽 3% 請 LLM 對比原始檔**。JOB-226 用這步抓到 4 個 combo 有「題號漏失」「OCR 斷字殘留」，沒抽樣會直接漏掉。

---

## 四、常見坑（JOB-218~226 實戰）

### 4.1 OCR 中文斷字（高頻）

**症狀**：「澎湖 的」「被 稱 」「A I」（中文字之間插入空白）

**原因**：OCR 引擎以視覺寬度切字，中文字間有微小空隙就被當成空白

**修法**：
```python
import re
# 中文字+空白+中文字 → 中文字+中文字
text = re.sub(r'([一-鿿])\s+([一-鿿])', r'\1\2', text)
# 但保留中文+數字、中文+英文之間的空白（讀感較好）
```

**根治法**：在 OCR prompt 中明寫「中文字之間若有多餘空白請去掉，但中英文/中數字之間保留」

### 4.2 編碼錯誤（中等頻率）

**症狀**：MD 檔出現 `�` 或亂碼

**原因**：read 時沒指定 encoding，預設用 system locale

**鐵律**：
```python
# 永遠寫 encoding，永遠
with open(path, encoding='utf-8') as f: ...
with open(path, 'w', encoding='utf-8') as f: ...
```

### 4.3 Frontmatter YAML 解析失敗（低頻但難 debug）

**症狀**：批次處理腳本讀 frontmatter 拋 `yaml.YAMLError`

**常見原因**：
- 值含冒號未引號：`title: 第一課：開始` → 改 `title: "第一課：開始"`
- 中文標點未跳脫
- LLM 輸出多餘空白行斷掉 frontmatter

**防呆**：
```python
import yaml
def safe_frontmatter(text):
    if not text.startswith('---\n'):
        return {}
    parts = text.split('---', 2)
    if len(parts) < 3:
        return {}
    try:
        return yaml.safe_load(parts[1]) or {}
    except yaml.YAMLError as e:
        print(f'YAML error: {e}')
        return {}
```

### 4.4 LLM 輸出多餘的 wrapper（中頻）

**症狀**：產出 MD 開頭/結尾有 ` ```markdown` 或 `Here is the converted markdown:` 等贅文

**修法**：在 prompt 結尾加「**只輸出 MD 內容本身，不要 code fence、不要說明、不要寒暄**」+ 後處理 strip

### 4.5 圖片/圖表內容遺失（高頻）

**症狀**：原 PDF 有圖表，MD 沒有

**LLM OCR 方案**：prompt 加「若該頁有圖表，輸出 `![描述](圖N)` 並在下方加一段「圖示說明：...」描述圖意」

### 4.6 表格被打散（中頻）

**症狀**：原表格變成單行文字

**修法**：
- pdfplumber：分開呼叫 `extract_text()` 和 `extract_tables()`，最後拼回去
- LLM：prompt 加「表格用 markdown table 格式輸出，每欄對齊」

### 4.7 Watchdog kill 後殘留半截檔（低頻但要處理）

**症狀**：timeout 後 output.md 寫到一半，後續驗證會 pass（檔案存在）但內容不全

**防呆**：寫成 `output.md.tmp`，跑完才 `mv`

```python
tmp = output_path + '.tmp'
with open(tmp, 'w', encoding='utf-8') as f:
    f.write(content)
os.replace(tmp, output_path)  # 原子操作
```

---

## 五、輸出結構建議（從 JOB-226 學到）

### 5.1 單檔結構

```markdown
---
source: raw/原始檔名.pdf
generated_at: 2026-05-06
generated_by: codex-cli + gpt-5
char_count: 4823
quality_flags: []
---

# 標題

正文...
```

**Frontmatter 必有**：`source`（追溯）、`generated_at`（過期判斷）、`char_count`（驗證用）、`quality_flags`（品質警示）

### 5.2 批次目錄結構

```
out/
├── 檔1.md
├── 檔2.md
├── _index.json              ← 全批清單 + 元數據
├── _pairing.json            ← dispatch 用
├── _validation_report.json  ← Phase 5 結果
└── _integration_report.md   ← 人讀的總結
```

底線開頭代表 meta 檔，避免被當成內容檔處理。

### 5.3 quality_flags 詞彙表（建議標準）

| Flag | 意義 |
|:--|:--|
| `ocr_used` | 用了 OCR（精度比 text PDF 低） |
| `partial_extract` | 部分頁面抽取失敗 |
| `manual_review` | 已標記需人工複查 |
| `image_dropped` | 圖片內容未抽取 |
| `table_simplified` | 表格做了簡化處理 |
| `low_confidence` | LLM 輸出信心度低 |

---

## 六、Cost / Token 預估（JOB-226 數據）

| 任務類型 | 工具 | 平均 token / 份 | 平均時間 / 份 |
|:--|:--|--:|--:|
| 純文字 PDF → MD（pdfplumber） | Python | 0 | < 5s |
| 掃描 PDF → MD（codex gpt-5）| Codex CLI | 80–150K | 60–120s |
| LLM 修補（Phase 5b） | 同上 | 30–60K | 30–60s |
| LLM 抽樣比對（Phase 6） | 同上 | 50–80K | 60–90s |

**60 combo / 2117 檔總 token ≈ 200M**（codex），總時間 ≈ 14h（PARALLEL=4 × 兩 combo 並行）。

---

## 七、檢查清單（開新轉檔任務前）

- [ ] 已抽 1–3 份原始檔，確認格式類型（純文字/掃描/混合）
- [ ] 已決定首選工具 + fallback（依 §一 矩陣）
- [ ] 已寫 Phase 1 _pairing.json 產生器
- [ ] dispatch 腳本含 watchdog（推薦 1500s）
- [ ] dispatch 腳本含 PARALLEL（依 §3.2 經驗值）
- [ ] 寫檔用 `.tmp` + `os.replace` 原子操作
- [ ] Phase 5 驗證腳本含字數/結構/編碼三項
- [ ] Phase 6 抽樣率 ≥ 3%（不要省）
- [ ] 結果有 `_index.json` + `_validation_report.json` + `_integration_report.md`

---

## 八、快速啟動 snippet 集

### 8.1 純文字 PDF 批次

```bash
ls raw/*.pdf | xargs -P 4 -I {} bash -c '
  out="out/$(basename "{}" .pdf).md"
  timeout 60 python3 -c "
import pdfplumber, sys
text = []
with pdfplumber.open(\"{}\") as pdf:
    for p in pdf.pages:
        t = p.extract_text() or \"\"
        if t.strip(): text.append(t)
print(\"\\n\\n\".join(text))
" > "$out.tmp" && mv "$out.tmp" "$out" || echo "FAIL: {}"
'
```

### 8.2 掃描 PDF + Codex CLI

```bash
# 1. PDF → 圖片
mkdir -p tmp_imgs
pdftoppm -png -r 200 input.pdf tmp_imgs/page

# 2. Codex 跑（單一 PDF；批次用 xargs 包起來）
codex exec --model gpt-5 \
  --message "$(cat ocr_prompt.md)" \
  --image tmp_imgs/page-*.png \
  > result.md.tmp && mv result.md.tmp result.md
```

### 8.3 DOCX 批次

```python
from docx import Document
from pathlib import Path

for docx in Path('raw').glob('*.docx'):
    doc = Document(docx)
    md = '\n\n'.join(p.text for p in doc.paragraphs if p.text.strip())
    out = Path('out') / f'{docx.stem}.md'
    out.write_text(md, encoding='utf-8')
```

---

## 九、何時該換策略（紅旗）

執行中遇到下列情況，**停下來**重新評估，不要硬撐：

- 同一份檔連 3 次抽取失敗 → 格式有特殊性，個案處理
- 一個 batch > 50% 檔案有 quality_flags → 工具/prompt 有系統性問題
- LLM API 連 5 次 timeout → 切換 model 或降 PARALLEL
- Phase 6 抽樣 < 70% PASS → 整批可能要重做，先暫停

紅旗階段優先回報使用者選擇方向，不要自行決定重跑。
