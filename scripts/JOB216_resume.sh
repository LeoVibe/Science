#!/bin/bash
# JOB-216 備援執行腳本 — 不依賴 Cursor agent / 網路，直接跑本地腳本
# 用途：Cursor agent 斷線時，手動執行此腳本繼續剩餘 wave
# 執行：bash scripts/JOB216_resume.sh

set -e
LOG_DIR="scripts/orchestrator-logs"
TS=$(date +%H%M%S)

echo "=== JOB-216 Resume @ $(date '+%Y-%m-%d %H:%M:%S') ==="
python3.11 scripts/JOB216_dashboard.py

echo ""
echo "=== Wave 2 Batch 2 — 五下國語 (docling) ==="
if [ ! -f "knowledge/3_考古題/2_MD淬鍊文字/五下/五下_國語_南一/_index.json" ] || \
   [ ! -f "knowledge/3_考古題/2_MD淬鍊文字/五下/五下_國語_康軒/_index.json" ] || \
   [ ! -f "knowledge/3_考古題/2_MD淬鍊文字/五下/五下_國語_翰林/_index.json" ]; then
  python3.11 scripts/job207_distill_to_md.py --semester 五下 --subject 國語 --publisher 南一 --engine docling \
    > "$LOG_DIR/JOB-216-W2-五下國語南一.log" 2>&1 &
  python3.11 scripts/job207_distill_to_md.py --semester 五下 --subject 國語 --publisher 康軒 --engine docling \
    > "$LOG_DIR/JOB-216-W2-五下國語康軒.log" 2>&1 &
  python3.11 scripts/job207_distill_to_md.py --semester 五下 --subject 國語 --publisher 翰林 --engine docling \
    > "$LOG_DIR/JOB-216-W2-五下國語翰林.log" 2>&1 &
  wait
  echo "✅ Wave 2 Batch 2 完成"
else
  echo "⏭  五下國語已完成，跳過"
fi

echo ""
echo "=== Wave 2 Batch 3 — 六下國語 (docling) ==="
if [ ! -f "knowledge/3_考古題/2_MD淬鍊文字/六下/六下_國語_南一/_index.json" ] || \
   [ ! -f "knowledge/3_考古題/2_MD淬鍊文字/六下/六下_國語_康軒/_index.json" ] || \
   [ ! -f "knowledge/3_考古題/2_MD淬鍊文字/六下/六下_國語_翰林/_index.json" ]; then
  python3.11 scripts/job207_distill_to_md.py --semester 六下 --subject 國語 --publisher 南一 --engine docling \
    > "$LOG_DIR/JOB-216-W2-六下國語南一.log" 2>&1 &
  python3.11 scripts/job207_distill_to_md.py --semester 六下 --subject 國語 --publisher 康軒 --engine docling \
    > "$LOG_DIR/JOB-216-W2-六下國語康軒.log" 2>&1 &
  python3.11 scripts/job207_distill_to_md.py --semester 六下 --subject 國語 --publisher 翰林 --engine docling \
    > "$LOG_DIR/JOB-216-W2-六下國語翰林.log" 2>&1 &
  wait
  echo "✅ Wave 2 Batch 3 完成"
else
  echo "⏭  六下國語已完成，跳過"
fi

echo ""
echo "=== Wave 3 — 自然 (v6 + OCR) ==="
for grade in 四下 五下 六下; do
  for pub in 南一 康軒 翰林; do
    idx="knowledge/3_考古題/2_MD淬鍊文字/${grade}/${grade}_自然_${pub}/_index.json"
    if [ ! -f "$idx" ]; then
      python3.11 scripts/job207_distill_to_md.py --semester "$grade" --subject 自然 --publisher "$pub" --engine pdfplumber \
        > "$LOG_DIR/JOB-216-W3-${grade}自然${pub}.log" 2>&1 &
    fi
  done
done
wait
echo "✅ Wave 3 v6 完成，執行 OCR 補跑..."
python3.11 /tmp/p_ocr_scanned.py 2>/dev/null || echo "⚠️  OCR 補跑腳本未找到，請手動執行"

echo ""
echo "=== Wave 4 — 英語 (v6 + OCR) ==="
for grade in 四下 五下 六下; do
  for pub in 康軒 翰林 何嘉仁; do
    idx="knowledge/3_考古題/2_MD淬鍊文字/${grade}/${grade}_英語_${pub}/_index.json"
    if [ ! -f "$idx" ]; then
      python3.11 scripts/job207_distill_to_md.py --semester "$grade" --subject 英語 --publisher "$pub" --engine pdfplumber \
        > "$LOG_DIR/JOB-216-W4-${grade}英語${pub}.log" 2>&1 &
    fi
  done
done
wait
echo "✅ Wave 4 v6 完成，執行 OCR 補跑..."
python3.11 /tmp/p_ocr_scanned.py 2>/dev/null || echo "⚠️  OCR 補跑腳本未找到，請手動執行"

echo ""
echo "=== 全部完成 ==="
python3.11 scripts/JOB216_dashboard.py
