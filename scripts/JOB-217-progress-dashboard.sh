#!/bin/bash
# JOB-217 progress dashboard（spec 第 8.3 節）
# 用法：bash scripts/JOB-217-progress-dashboard.sh
TSV="jobs/JOB-217-progress.tsv"

if [[ ! -f "$TSV" ]]; then
  echo "錯誤：$TSV 不存在"
  exit 1
fi

LINE_COUNT=$(awk 'NR>1' "$TSV" | wc -l | tr -d ' ')

echo "=== JOB-217 三下社會反推研究進度 ($(date '+%Y-%m-%d %H:%M:%S')) ==="
echo "資料行數：$LINE_COUNT"
echo

if [[ "$LINE_COUNT" -eq 0 ]]; then
  echo "（尚無資料，tsv 僅含 header）"
  exit 0
fi

echo "📈 各 phase 進度："
awk -F'\t' 'NR>1{print $2}' "$TSV" | sort | uniq -c | sort -rn
echo

echo "📊 各 publisher × status 矩陣："
awk -F'\t' 'NR>1 {a[$4 "_" $10]++} END {for (k in a) print "  "k": "a[k]}' "$TSV" | sort
echo

echo "⚠️  manual_review / crash 待處理："
awk -F'\t' 'NR>1 && ($10=="manual_review" || $10=="crash") {print "  "$2"/"$4"/"$5": "$11}' "$TSV"
echo

echo "🔥 最新 5 筆："
tail -n 5 "$TSV" | column -t -s $'\t'
