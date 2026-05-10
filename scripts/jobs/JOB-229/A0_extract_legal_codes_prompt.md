# 任務：產出自然科 108 課綱第 Ⅱ 學習階段合法編碼清單

## 目標
產出 `knowledge/3_考古題/3_L2_結構化抽取/_meta/science_codes_legal_II.json`，
作為自然科考古題 L2 結構化抽取時，每題 codes_candidate 的合法 code 字典。

## 結構（簡化版，對齊 social 版頂層欄位）

```json
{
  "stage": "Ⅱ",
  "subject": "自然",
  "grade_mapping": "三、四年級（國小中年級）",
  "source": "108 課綱（自然科學領域課程綱要）",
  "extracted_at": "<ISO 時間>",
  "extractor": "Codex (gpt-5.5) - JOB-229 A0",
  "performance_count": <int>,
  "content_count": <int>,
  "total": <int>,
  "performance": [
    {"code": "tr-Ⅱ-1", "label": "<課綱項目簡述，從你對自然科 108 課綱的知識中得出>"},
    {"code": "tr-Ⅱ-2", "label": "..."},
    ...
  ],
  "content": [
    {"code": "INa-Ⅱ-1", "label": "..."},
    {"code": "INb-Ⅱ-1", "label": "..."},
    ...
  ]
}
```

## 自然科 Ⅱ 階段編碼維度

依 108 課綱**自然科學領域課程綱要**，第 Ⅱ 學習階段（國小三、四年級）含兩維：

### performance（過程技能 / 探究能力）
官方代碼前綴包含但不限於：
- **tr** - 思考智能（thinking）
- **tc** - 科學思考的批判
- **pa** - 問題解決能力
- **pc** - 學習溝通
- **ai** - 科學態度與本質（attitude/inquiry）

每個前綴下會有多條 Ⅱ-N 編碼（如 tr-Ⅱ-1, tr-Ⅱ-2, ...）。請依你對課綱的知識列全。

### content（核心概念）
官方代碼前綴：
- **INa** - 自然界的組成與特性
- **INb** - 自然界的現象、規律與作用
- **INc** - 自然界的構造與功能
- **INd** - 自然界的演變與互動
- **INe** - 科學、科技、社會與人文
- **INf** - 資源與永續發展
- **INg** - 尺度與單位

每個前綴下會有多條 Ⅱ-N 編碼。

## 規範
1. **編碼必須是 108 課綱官方真實存在的**，不可自行編造
2. **不確定的編碼寧缺勿濫**（標 `"label": "（待確認課綱原文）"`）
3. label 用簡短中文（10-30 字）描述該編碼的學習目標
4. 編碼總數預期 30-50 條（社會科是 35 條對照）
5. 每個 prefix 至少要有 1 條（如果該 prefix 在第 Ⅱ 階段有合法編碼）

## 完成標準
- JSON 合法（node 可解析）
- 頂層欄位齊全（stage/subject/grade_mapping/source/extracted_at/extractor/performance_count/content_count/total/performance/content）
- performance + content 各自至少 5 條
- 每條都有 code（必填）+ label（必填）

## 完成後請輸出
1. 檔案路徑
2. 編碼分維度統計（performance N 條、content N 條、total N 條）
3. 各 prefix 計數（tr: N, tc: N, ..., INa: N, INb: N, ...）
4. git diff 摘要
