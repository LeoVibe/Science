import { useState } from 'react';
import { APP_CONFIG, Grade, Semester, Subject, Publisher, getSubjectsByGrade, SUBJECT_ICONS, getSubjectForPath } from '@/data/config';

interface TestResult {
  grade: Grade;
  subject: Subject;
  semester: Semester;
  publisher: Publisher;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  manifest: boolean;
  fileCount: number;
  questionCount: number;
  errors: string[];
}

type ViewMode = 'runner' | 'detail';

// Generate all combos
function getAllCombos(): { grade: Grade; subject: Subject; semester: Semester; publisher: Publisher }[] {
  const combos: { grade: Grade; subject: Subject; semester: Semester; publisher: Publisher }[] = [];
  for (const grade of APP_CONFIG.grades) {
    const subjects = getSubjectsByGrade(grade);
    for (const subject of subjects) {
      for (const semester of APP_CONFIG.semesters) {
        for (const publisher of APP_CONFIG.publishers) {
          combos.push({ grade, subject, semester, publisher });
        }
      }
    }
  }
  return combos;
}

// Mock test results
function generateMockResults(): TestResult[] {
  return getAllCombos().map(c => {
    const hasData = (c.grade === 5 && c.semester === 2 && c.publisher === '南一') ||
                    (c.grade === 4 && c.subject === '國語' && c.semester === 2 && c.publisher === '南一') ||
                    (c.grade === 3 && c.subject === '國語' && c.semester === 1 && c.publisher === '南一');

    if (!hasData) {
      return { ...c, status: 'fail' as const, manifest: false, fileCount: 0, questionCount: 0, errors: ['manifest.json 不存在'] };
    }

    const questionCount = 20 + Math.floor(Math.random() * 30);
    const hasWarning = Math.random() > 0.85;

    return {
      ...c,
      status: hasWarning ? 'warning' as const : 'pass' as const,
      manifest: true,
      fileCount: hasWarning ? 1 : Math.ceil(questionCount / 10),
      questionCount,
      errors: hasWarning ? ['L3 題目答案索引超出選項範圍'] : [],
    };
  });
}

export default function AdminTestRunner() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('runner');
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [filterGrade, setFilterGrade] = useState<Grade | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const handleScan = () => {
    setScanning(true);
    setProgress(0);
    setResults([]);

    const total = getAllCombos().length;
    let step = 0;

    const interval = setInterval(() => {
      step += Math.floor(Math.random() * 3) + 1;
      if (step >= total) {
        step = total;
        clearInterval(interval);
        setResults(generateMockResults());
        setScanning(false);
      }
      setProgress(Math.round((step / total) * 100));
    }, 80);
  };

  const handleViewDetail = (r: TestResult) => {
    setSelectedResult(r);
    setViewMode('detail');
  };

  const filteredResults = results.filter(r => {
    if (filterGrade && r.grade !== filterGrade) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    return true;
  });

  const passCount = results.filter(r => r.status === 'pass').length;
  const warnCount = results.filter(r => r.status === 'warning').length;
  const failCount = results.filter(r => r.status === 'fail').length;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {viewMode === 'runner' && (
        <>
          {/* Scan button */}
          <div className="bg-card rounded-2xl border p-5 space-y-4">
            <div className="text-center space-y-2">
              <span className="text-4xl">🧪</span>
              <h3 className="font-black text-base">Quest Test Drive</h3>
              <p className="text-xs text-muted-foreground">
                自動掃描所有（年級 × 科目 × 學期 × 出版社）組合，<br />
                驗證 manifest、檔案載入、題目格式
              </p>
            </div>

            {scanning ? (
              <div className="space-y-2">
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-center text-xs text-muted-foreground">掃描中... {progress}%</p>
              </div>
            ) : (
              <button
                onClick={handleScan}
                className="w-full py-3.5 rounded-2xl gradient-full text-white font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
              >
                🚀 開始掃描
              </button>
            )}
          </div>

          {/* Results */}
          {results.length > 0 && (
            <>
              {/* Summary */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setFilterStatus(filterStatus === 'pass' ? null : 'pass')}
                  className={`bg-card rounded-2xl border p-3 text-center transition-all ${filterStatus === 'pass' ? 'ring-2 ring-correct' : ''}`}
                >
                  <div className="text-xl font-black text-correct">{passCount}</div>
                  <div className="text-[10px] text-muted-foreground">✅ 通過</div>
                </button>
                <button
                  onClick={() => setFilterStatus(filterStatus === 'warning' ? null : 'warning')}
                  className={`bg-card rounded-2xl border p-3 text-center transition-all ${filterStatus === 'warning' ? 'ring-2 ring-accent' : ''}`}
                >
                  <div className="text-xl font-black text-accent">{warnCount}</div>
                  <div className="text-[10px] text-muted-foreground">⚠️ 警告</div>
                </button>
                <button
                  onClick={() => setFilterStatus(filterStatus === 'fail' ? null : 'fail')}
                  className={`bg-card rounded-2xl border p-3 text-center transition-all ${filterStatus === 'fail' ? 'ring-2 ring-destructive' : ''}`}
                >
                  <div className="text-xl font-black text-destructive">{failCount}</div>
                  <div className="text-[10px] text-muted-foreground">❌ 失敗</div>
                </button>
              </div>

              {/* Grade filter */}
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setFilterGrade(null)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    !filterGrade ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                  }`}
                >全部</button>
                {APP_CONFIG.grades.map(g => (
                  <button
                    key={g}
                    onClick={() => setFilterGrade(filterGrade === g ? null : g)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      filterGrade === g ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                    }`}
                  >{g}年級</button>
                ))}
              </div>

              {/* Health check table */}
              <div className="bg-card rounded-2xl border overflow-hidden">
                <div className="px-4 py-3 border-b bg-secondary/50">
                  <h3 className="font-bold text-sm">🏥 健康狀態表</h3>
                  <p className="text-[10px] text-muted-foreground">顯示 {filteredResults.length} 筆結果</p>
                </div>
                <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
                  {filteredResults.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => handleViewDetail(r)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors text-left"
                    >
                      <span className="text-base shrink-0">
                        {r.status === 'pass' ? '🟢' : r.status === 'warning' ? '🟡' : '🔴'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {SUBJECT_ICONS[r.subject]} G{r.grade} {r.subject} S{r.semester} {r.publisher}
                        </p>
                        {r.errors.length > 0 && (
                          <p className="text-[10px] text-destructive truncate">{r.errors[0]}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold">{r.questionCount} 題</p>
                        <p className="text-[10px] text-muted-foreground">{r.fileCount} 檔</p>
                      </div>
                      <span className="text-muted-foreground text-xs">›</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error log */}
              {results.some(r => r.errors.length > 0) && (
                <div className="bg-card rounded-2xl border overflow-hidden">
                  <div className="px-4 py-3 border-b bg-destructive/5">
                    <h3 className="font-bold text-sm text-destructive">🚨 錯誤日報</h3>
                  </div>
                  <div className="divide-y divide-border">
                    {results.filter(r => r.errors.length > 0).slice(0, 10).map((r, i) => (
                      <div key={i} className="px-4 py-3 space-y-1">
                        <p className="text-xs font-bold">
                          G{r.grade} {r.subject} S{r.semester} {r.publisher}
                        </p>
                        {r.errors.map((err, j) => (
                          <p key={j} className="text-[10px] text-destructive font-mono pl-3">• {err}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Detail view */}
      {viewMode === 'detail' && selectedResult && (
        <div className="space-y-4">
          <button
            onClick={() => setViewMode('runner')}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            ← 返回掃描結果
          </button>

          <div className="bg-card rounded-2xl border p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-base">
                  {SUBJECT_ICONS[selectedResult.subject]} G{selectedResult.grade} {selectedResult.subject}
                </h3>
                <p className="text-xs text-muted-foreground">
                  S{selectedResult.semester} · {selectedResult.publisher}版
                </p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                selectedResult.status === 'pass' ? 'bg-correct/12 text-correct' :
                selectedResult.status === 'warning' ? 'bg-accent/12 text-accent' :
                'bg-destructive/12 text-destructive'
              }`}>
                {selectedResult.status === 'pass' ? 'PASS' :
                 selectedResult.status === 'warning' ? 'WARNING' : 'FAIL'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-secondary rounded-xl p-2.5 text-center">
                <p className="text-sm font-black">{selectedResult.manifest ? '✅' : '❌'}</p>
                <p className="text-[10px] text-muted-foreground">manifest</p>
              </div>
              <div className="bg-secondary rounded-xl p-2.5 text-center">
                <p className="text-sm font-black">{selectedResult.fileCount}</p>
                <p className="text-[10px] text-muted-foreground">檔案數</p>
              </div>
              <div className="bg-secondary rounded-xl p-2.5 text-center">
                <p className="text-sm font-black">{selectedResult.questionCount}</p>
                <p className="text-[10px] text-muted-foreground">題目數</p>
              </div>
            </div>
          </div>

          {/* Check items */}
          <div className="bg-card rounded-2xl border divide-y divide-border">
            <div className="px-4 py-3 border-b bg-secondary/50">
              <h3 className="font-bold text-sm">📋 檢查項目</h3>
            </div>
            {[
              { label: 'manifest.json 存在且格式正確', pass: selectedResult.manifest },
              { label: '所有課程檔案可正常 Fetch', pass: selectedResult.status !== 'fail' },
              { label: 'meta 資訊與路徑一致', pass: selectedResult.status !== 'fail' },
              { label: '無重複題目 ID', pass: true },
              { label: '答案索引在選項範圍內', pass: selectedResult.status !== 'warning' },
              { label: '選項數量 ≥ 2', pass: selectedResult.status !== 'fail' },
            ].map((item, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3">
                <span className={`text-sm ${item.pass ? 'text-correct' : 'text-destructive'}`}>
                  {item.pass ? '✅' : '❌'}
                </span>
                <span className="text-sm text-foreground">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Mock question preview */}
          <div className="bg-card rounded-2xl border overflow-hidden">
            <div className="px-4 py-3 border-b bg-secondary/50">
              <h3 className="font-bold text-sm">👁️ 題目預覽</h3>
              <p className="text-[10px] text-muted-foreground">管理員人工複查介面</p>
            </div>
            <div className="divide-y divide-border">
              {[1, 2, 3].map(n => (
                <div key={n} className="px-4 py-3 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold bg-secondary px-2 py-0.5 rounded-full">#{n}</span>
                    <span className="text-[10px] font-bold bg-secondary px-2 py-0.5 rounded-full">L{n}</span>
                  </div>
                  <p className="text-sm font-medium">
                    {n === 1 && '下列哪一個是正確的描述？'}
                    {n === 2 && '根據課文內容，以下何者為非？'}
                    {n === 3 && '文章中提到的主要觀點是什麼？'}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['A', 'B', 'C', 'D'].map((opt, j) => (
                      <div key={opt} className={`px-2.5 py-1.5 rounded-lg text-xs ${
                        j === 0 ? 'bg-correct-light border border-correct/30 font-medium' : 'bg-secondary'
                      }`}>
                        {opt}. 選項內容
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="text-center text-[10px] text-muted-foreground">
        驗證引擎：Cloudflare Workers · 模擬前端載入流程
      </p>
    </div>
  );
}
