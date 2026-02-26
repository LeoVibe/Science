#!/bin/bash
BASE="questions/source/G3/國語"
mkdir -p $BASE/S1/康軒 $BASE/S2/康軒 $BASE/S1/翰林 $BASE/S2/翰林 $BASE/S1/南一 $BASE/S2/南一

# 搬移康軒 (S1/S2 區分)
mv "questions/G3/國語/康軒/L1_心的悄悄話.json" "$BASE/S1/康軒/" 2>/dev/null
mv "questions/G3/國語/康軒/L1_許願.json" "$BASE/S2/康軒/" 2>/dev/null
mv "questions/G3/國語/康軒/L2_妙故事點點名.json" "$BASE/S1/康軒/" 2>/dev/null
mv "questions/G3/國語/康軒/L2_下雨的時候.json" "$BASE/S2/康軒/" 2>/dev/null
# ... 其他以此類推，但我這裡先搬移關鍵的測試

# 這裡我用一個規則：如果檔案已經有整理好的 S2 特徵就搬移
# 之前我有生成過 L1-L12 的三下國語，我可以用清單批量搬移
