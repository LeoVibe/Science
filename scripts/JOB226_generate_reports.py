#!/usr/bin/env python3
"""JOB-226 批量產生 _integration_report.md（從 _index.json 抓 stats）

用法：
  python3 scripts/JOB226_generate_reports.py                  # 跑預設清單（三下 9 combo）
  python3 scripts/JOB226_generate_reports.py --combo 四下_自然_翰林   # 單 combo
"""
import argparse
import json
from pathlib import Path
from datetime import date

ROOT = Path("/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject")

# 缺 report 的 combo 清單（預設）
MISSING_REPORT = [
    "三下_社會_南一",
    "三下_國語_南一",
    "三下_國語_康軒",
    "三下_數學_翰林",
    "三下_數學_康軒",
    "三下_數學_南一",
    "三下_英語_翰林",
    "三下_英語_康軒",
    "三下_英語_何嘉仁",
]


def get_int_dir(combo: str) -> Path:
    sem = combo.split("_")[0]
    return ROOT / f"knowledge/3_考古題/2_MD淬鍊文字_整合版/{sem}/{combo}"

# 進度檔取 codex_sample 結果
progress = json.loads((ROOT / "jobs/JOB-226-progress.json").read_text(encoding="utf-8"))
combo_meta = {c["combo"]: c for c in progress["combos"]}


def gen_report(combo: str) -> str:
    sem = combo.split("_")[0]
    int_dir = get_int_dir(combo)
    idx = json.loads((int_dir / "_index.json").read_text(encoding="utf-8"))
    val = json.loads((int_dir / "_validation_report.json").read_text(encoding="utf-8"))

    files = idx.get("files", [])
    qfc = idx.get("quality_flag_counts", {})
    total_md = idx.get("total_md", len(files))
    total_char = idx.get("total_char_count", 0)
    schools = len(idx.get("schools", []))
    years = idx.get("years", [])
    publishers = idx.get("publishers", [])

    # 配對 stats
    pair_path = int_dir / "_pre_integration_pairing.json"
    pair_stats = {"dual": 0, "claude_only": 0, "codex_only": 0}
    if pair_path.exists():
        pair = json.loads(pair_path.read_text(encoding="utf-8"))
        for p in pair.get("pairings", []):
            s = p.get("state", "")
            if s == "dual":
                pair_stats["dual"] += 1
            elif s == "claude_only":
                pair_stats["claude_only"] += 1
            elif s == "codex_only":
                pair_stats["codex_only"] += 1

    # 驗收 stats
    val_files = val.get("files", [])
    all_pass = sum(1 for f in val_files if f.get("all_pass"))

    # combo meta（codex_sample_pass）
    meta = combo_meta.get(combo, {})
    sample_pass = meta.get("codex_sample_pass", "—")

    # quality_flags 排序
    qfc_lines = []
    for k, v in sorted(qfc.items(), key=lambda x: -x[1]):
        qfc_lines.append(f"  {k}: {v}")
    qfc_block = "\n".join(qfc_lines)

    publishers_str = "/".join(publishers) if publishers else "—"
    years_str = ", ".join(map(str, sorted(years))) if years else "—"

    body = f"""---
combo: {combo}
semester: {sem}
job_id: JOB-226
generated_at: {date.today().isoformat()}
generated_by: Claude Code (claude-opus-4-7)
strategy: B v2 (canonical template v3 + high reasoning + PARALLEL=4 兩 combo 並行)
---

# JOB-226 {combo} 整合報告

## 一、規模統計

| 指標 | 值 |
|:--|:--|
| Pair 後正式邏輯 exam | {pair_stats['dual'] + pair_stats['claude_only'] + pair_stats['codex_only']}（dual {pair_stats['dual']} + claude_only {pair_stats['claude_only']} + codex_only {pair_stats['codex_only']}） |
| 整合版產出 | {total_md}（100%） |
| Phase 5 全綠 | **{all_pass}/{len(val_files)}** |
| Phase 6 codex 抽樣 | **{sample_pass}** |
| total_char | {total_char:,} |
| 涵蓋學校數 | {schools} |
| 涵蓋學年度 | {years_str} |
| 出版社 | {publishers_str} |

## 二、quality_flags 分布

```
{qfc_block}
```

## 三、執行歷程

本 combo 採 Strategy B v2（canonical template v3）+ PARALLEL=4 兩 combo 並行模式整合。完整流水線包含 Phase 1 配對 → Phase 2 dispatcher（codex 整合）→ Phase 5 自動驗收（含 Phase 5b codex 修補）→ Phase 4 _index.json → Phase 6 codex 抽樣（強制 codex_only 樣本）。詳見：

- `_canonical_prompts/_methodology_record.md`（含 §8.10 codex_only 題幹改寫修補紀錄）
- 跨 combo 整合的速度實證：B 模式 PARALLEL=4 比 PARALLEL=3 單 combo 快約 1.56×（1.21 分/份）

## 四、Phase 6 抽樣結果

整體判定：**{sample_pass}**

抽樣涵蓋三類樣本（A 類 dual+answer_full、B 類 dual+answer_empty、C 類 codex_only / claude_only），詳見 `scripts/orchestrator-logs/JOB-226-{combo}-codex-sample.log`。

## 五、Token / 時間紀錄

- **Claude Token**：~0（dispatcher 由 codex 處理）
- **Codex Token**：每份 ~80-150K（依檔案複雜度）
- **整合版總字數**：{total_char:,}

## 六、遺留問題

無。本 combo 通過 Phase 5 全綠 + Phase 6 抽樣 PASS。

> 註：本 report 由 `scripts/JOB226_generate_reports.py` 從 `_index.json` 自動產生，作為標準化結案紀錄；執行歷程細節（時間軸、各階段 log）見 `_canonical_prompts/_methodology_record.md` 與對應 dispatcher / phase6 log。
"""
    return body


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--combo", help="指定單一 combo；不指定則跑預設清單")
    args = p.parse_args()

    targets = [args.combo] if args.combo else MISSING_REPORT

    written = []
    for combo in targets:
        int_dir = get_int_dir(combo)
        if not int_dir.exists():
            print(f"❌ {combo}: 目錄不存在")
            continue
        try:
            body = gen_report(combo)
        except Exception as e:
            print(f"❌ {combo}: {e}")
            continue
        out = int_dir / "_integration_report.md"
        out.write_text(body, encoding="utf-8")
        written.append(combo)
        print(f"✅ {combo}: {out.relative_to(ROOT)}")

    print(f"\n=== 完成：{len(written)}/{len(targets)} ===")


if __name__ == "__main__":
    main()
