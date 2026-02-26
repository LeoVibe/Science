import { useState } from 'react';
import {
  Grade,
  Subject,
  Semester,
  Publisher,
  APP_CONFIG,
  getSubjectsByGrade,
  SUBJECT_PLATFORM_PATH,
  PUBLISHER_PLATFORM_PATH,
} from '@/data/config';
import libraryStatsJson from '@/data/libraryStats.json';
import { evaluateQuestions, type RawQ } from '@/utils/qualityEvaluator';

type PublisherStatKey = string;
interface PublisherStatRow {
  key: PublisherStatKey;
  grade: Grade;
  semester: Semester;
  subject: Subject;
  publisher: Publisher;
  units: number;
  questions: number;
  quality: string;
  avgScore: string | null;
  pirlsLiteral: number | null;
  pirlsInferential: number | null;
  pirlsApplied: number | null;
}

const publisherStatsData = (libraryStatsJson as { publisherStats?: Record<string, { units: number; questions: number; quality: string }> }).publisherStats ?? {};

function getQualityColor(q: string): string {
  if (q.includes('L4') || q.includes('L5')) return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400';
  if (q.includes('L3')) return 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400';
  if (q.includes('L2')) return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
  return 'bg-secondary text-muted-foreground';
}

function parsePublisherStatKey(key: string): { grade: number; semester: number; subject: string; publisher: string } | null {
  const m = key.match(/^G(\d)_S(\d)_(.+)_(康軒|南一|翰林)$/);
  if (!m) return null;
  const grade = parseInt(m[1], 10);
  const semester = parseInt(m[2], 10);
  const subject = m[3];
  const publisher = m[4];
  if (grade < 1 || grade > 6 || (semester !== 1 && semester !== 2)) return null;
  return { grade: grade as Grade, semester: semester as Semester, subject, publisher: publisher as Publisher };
}

function buildQuestionsBasePath(grade: Grade, subject: Subject, semester: Semester, publisher: Publisher): string {
  const basePrefix = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${basePrefix}/question/platform/G${grade}/${SUBJECT_PLATFORM_PATH[subject]}/S${semester}/${PUBLISHER_PLATFORM_PATH[publisher]}`;
}

export default function AdminQualityAnalyzer() {
  const [rows, setRows] = useState<PublisherStatRow[]>(() => {
    const list: PublisherStatRow[] = [];
    Object.entries(publisherStatsData).forEach(([key, stat]) => {
      const parsed = parsePublisherStatKey(key);
      if (!parsed || !APP_CONFIG.publishers.includes(parsed.publisher as Publisher)) return;
      const subject = parsed.subject as Subject;
      const subs = getSubjectsByGrade(parsed.grade as Grade);
      if (!subs.includes(subject)) return;
      list.push({
        key,
        grade: parsed.grade as Grade,
        semester: parsed.semester as Semester,
        subject,
        publisher: parsed.publisher as Publisher,
        units: stat.units ?? 0,
        questions: stat.questions ?? 0,
        quality: stat.quality ?? 'L1',
        avgScore: null,
        pirlsLiteral: null,
        pirlsInferential: null,
        pirlsApplied: null,
      });
    });
    return list.sort((a, b) => a.key.localeCompare(b.key));
  });

  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState('');

  const runReAnalyze = async () => {
    setAnalyzing(true);
    setProgress('準備中…');
    const basePaths = new Map<string, string>();
    rows.forEach((r) => basePaths.set(r.key, buildQuestionsBasePath(r.grade, r.subject, r.semester, r.publisher)));

    const results = new Map<string, Omit<PublisherStatRow, 'key' | 'grade' | 'semester' | 'subject' | 'publisher' | 'units'>>();

    let idx = 0;
    for (const row of rows) {
      setProgress(`分析 ${row.grade}年級 ${row.subject} S${row.semester} ${row.publisher} (${idx + 1}/${rows.length})…`);
      const basePath = basePaths.get(row.key)!;
      try {
        const manifestRes = await fetch(`${basePath}/manifest.json`);
        if (!manifestRes.ok) {
          results.set(row.key, { questions: 0, quality: 'L1', avgScore: null, pirlsLiteral: null, pirlsInferential: null, pirlsApplied: null });
          idx++;
          continue;
        }
        const manifest = await manifestRes.json();
        const items = manifest.items ?? manifest.units ?? manifest.manifest ?? [];
        const fileList = items.map((u: { path?: string; file?: string }) => u.path ?? u.file ?? '').filter(Boolean);
        const allQuestions: RawQ[] = [];
        for (const file of fileList) {
          const res = await fetch(`${basePath}/${file}`);
          if (!res.ok) continue;
          const data = await res.json();
          const qs = data.questions ?? (Array.isArray(data) ? data : data.question ? [data] : []);
          qs.forEach((q: RawQ) => {
            if (q && (q.question || q.question === '')) allQuestions.push(q);
          });
        }
        const evalResult = evaluateQuestions(allQuestions);
        if ('error' in evalResult) {
          results.set(row.key, { questions: row.questions, quality: 'L1', avgScore: null, pirlsLiteral: null, pirlsInferential: null, pirlsApplied: null });
        } else {
          results.set(row.key, {
            questions: evalResult.count,
            quality: evalResult.quality,
            avgScore: evalResult.avgScore,
            pirlsLiteral: evalResult.pirlsLiteralRatio ?? null,
            pirlsInferential: evalResult.pirlsInferentialRatio ?? null,
            pirlsApplied: evalResult.pirlsAppliedRatio ?? null,
          });
        }
      } catch {
        results.set(row.key, { questions: row.questions, quality: row.quality, avgScore: null, pirlsLiteral: null, pirlsInferential: null, pirlsApplied: null });
      }
      idx++;
    }

    setRows((prev) =>
      prev.map((r) => {
        const next = results.get(r.key);
        if (!next) return r;
        return {
          ...r,
          questions: next.questions,
          quality: next.quality,
          avgScore: next.avgScore,
          pirlsLiteral: next.pirlsLiteral,
          pirlsInferential: next.pirlsInferential,
          pirlsApplied: next.pirlsApplied,
        };
      })
    );
    setProgress('');
    setAnalyzing(false);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="bg-card rounded-2xl border p-4 space-y-4">
        <h3 className="font-bold text-sm flex items-center gap-1.5">📊 品質分析</h3>
        <p className="text-xs text-muted-foreground">
          依據 L1～L5 題庫品質評分引擎顯示各科題庫品質分佈。初始數據來自 libraryStats；點「重新分析」會即時 fetch 題庫並重新計分。
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={runReAnalyze}
            disabled={analyzing}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            🔄 重新分析
          </button>
          {analyzing && <span className="text-xs text-muted-foreground">{progress}</span>}
        </div>

        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-card">
              <tr className="border-b border-border">
                <th className="py-2 pr-2 font-bold">科目</th>
                <th className="py-2 pr-2 font-bold">年級</th>
                <th className="py-2 pr-2 font-bold">出版社</th>
                <th className="py-2 pr-2 font-bold text-right">題數</th>
                <th className="py-2 pr-2 font-bold text-right">平均分</th>
                <th className="py-2 pr-2 font-bold">PIRLS 比例</th>
                <th className="py-2 font-bold">品質等級</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className="border-b border-border/50">
                  <td className="py-2 pr-2">{r.subject}</td>
                  <td className="py-2 pr-2">G{r.grade} S{r.semester}</td>
                  <td className="py-2 pr-2">{r.publisher}</td>
                  <td className="py-2 pr-2 text-right">{r.questions}</td>
                  <td className="py-2 pr-2 text-right">{r.avgScore ?? '—'}</td>
                  <td className="py-2 pr-2">
                    {r.pirlsInferential != null
                      ? `事${r.pirlsLiteral != null ? (r.pirlsLiteral * 100).toFixed(0) : '?'}% / 理${(r.pirlsInferential * 100).toFixed(0)}% / 應${r.pirlsApplied != null ? (r.pirlsApplied * 100).toFixed(0) : '?'}%`
                      : '—'}
                  </td>
                  <td className="py-2">
                    <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${getQualityColor(r.quality)}`}>
                      {r.quality}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <div className="py-8 text-center text-muted-foreground text-sm">尚無 publisherStats 資料，請先執行 generate_library_stats 或從題庫管理匯入。</div>
        )}
      </div>
    </div>
  );
}
