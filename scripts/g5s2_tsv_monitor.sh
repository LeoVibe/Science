#!/bin/bash
# G5S2 三 Agent 進度監控（spec 第 9.3 節）
# 用法：bash scripts/g5s2_tsv_monitor.sh
TSV="jobs/g5s2_results.tsv"

if [[ ! -f "$TSV" ]]; then
  echo "錯誤：$TSV 不存在"
  exit 1
fi

LINE_COUNT=$(awk 'NR>1' "$TSV" | wc -l | tr -d ' ')

echo "=== G5S2 三 Agent 進度 ($(date '+%Y-%m-%d %H:%M')) ==="
echo "資料行數：$LINE_COUNT"
echo

if [[ "$LINE_COUNT" -eq 0 ]]; then
  echo "（尚無資料，tsv 僅含 header）"
  exit 0
fi

echo "📈 status 分布："
awk -F'\t' 'NR>1{print $10}' "$TSV" | sort | uniq -c | sort -rn
echo

echo "📊 各 agent 進度（status=keep）："
awk -F'\t' 'NR>1 && $10=="keep" {a[$2]++} END {for (k in a) print "  "k": "a[k]" 課過閘"}' "$TSV"
echo

echo "⚠️  manual_review 待裁定："
awk -F'\t' 'NR>1 && $10=="manual_review" {print "  "$2"/"$3"/"$4"/"$5": "$11}' "$TSV"
echo

echo "🔥 最新 5 筆："
tail -n 5 "$TSV" | column -t -s $'\t'
