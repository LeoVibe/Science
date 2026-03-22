import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MessageSquare, ThumbsDown, AlertTriangle, Users } from 'lucide-react';
import { toast } from 'sonner';
import { getApiBaseUrl } from '@/data/api';

interface TagStat {
  tag: string;
  count: number;
}

interface Hotspot {
  question_id: string;
  report_count: number;
}

interface FeedbackEntry {
  id?: number;
  user_id: string;
  question_id: string;
  tag: string;
  comment: string | null;
  created_at: string;
}

/** 與前台 QuestionFeedback 一致，並保留舊版 tag 字串 */
const TAG_LABELS: Record<string, { label: string; icon: string }> = {
  confusing: { label: '題目看不懂、不清楚', icon: '🤷' },
  wrong_answer: { label: '答案選項錯誤或錯字', icon: '⌨️' },
  formatting: { label: '圖片或排版不清楚', icon: '🎨' },
  too_hard: { label: '題目太難、不該出現', icon: '❌' },
  other: { label: '其他建議', icon: '💬' },
  dont_understand: { label: '看不懂題目', icon: '🤷' },
  content_error: { label: '答案或內容有錯', icon: '❌' },
  typo: { label: '有錯字', icon: '⌨️' },
  display_issue: { label: '圖片或排版不清楚', icon: '🎨' },
  general: { label: '一般', icon: '📌' },
};

type RangeKey = '7d' | '30d' | 'all';

const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: '7d', label: '7 日內' },
  { key: '30d', label: '30 日內' },
  { key: 'all', label: '全部' },
];

export default function AdminFeedbackInsights() {
  const [range, setRange] = useState<RangeKey>('30d');
  const [stats, setStats] = useState<{
    total: number;
    tagStats: TagStat[];
    hotspots: Hotspot[];
  } | null>(null);
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('admin_token');
      const apiUrl = getApiBaseUrl();
      const q = `range=${range}`;
      const [resStats, resEntries] = await Promise.all([
        fetch(`${apiUrl}/api/admin/feedback/stats?${q}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${apiUrl}/api/admin/feedback/entries?${q}&limit=400`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (!resStats.ok) throw new Error('stats failed');
      const dataStats = await resStats.json();
      setStats({
        total: dataStats.total ?? 0,
        tagStats: Array.isArray(dataStats.tagStats) ? dataStats.tagStats : [],
        hotspots: Array.isArray(dataStats.hotspots) ? dataStats.hotspots : [],
      });
      if (resEntries.ok) {
        const dataE = await resEntries.json();
        setEntries(Array.isArray(dataE.entries) ? dataE.entries : []);
      } else {
        setEntries([]);
        toast.error('無法載入回饋明細（請確認 Worker 已部署 /api/admin/feedback/entries）');
      }
    } catch (error) {
      console.error('Fetch feedback error:', error);
      toast.error('無法取得回饋資料');
      setStats(null);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    void load();
  }, [load]);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('zh-TW', { dateStyle: 'short', timeStyle: 'short' });
    } catch {
      return iso;
    }
  };

  const tagLabel = (tag: string) => {
    const t = TAG_LABELS[tag];
    return t ? `${t.icon} ${t.label}` : tag;
  };

  if (loading) {
    return <div className="py-20 text-center text-muted-foreground">載入回饋數據中...</div>;
  }

  const totalForBar = stats?.total || 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          僅顯示<strong className="text-foreground">題目回饋</strong>（不含全站留言）。可切換時間範圍；明細表列出使用者選擇的類型與文字留言。
        </p>
        <div className="flex rounded-xl bg-secondary p-1 gap-1">
          {RANGE_OPTIONS.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => setRange(o.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                range === o.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <MessageSquare className="w-3 h-3" /> 總回饋數
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{stats?.total ?? 0}</div>
            <p className="text-[10px] text-muted-foreground mt-1">範圍內、題目回饋筆數</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 text-primary" /> 主要問題類型
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-foreground">
              {stats?.tagStats && stats.tagStats.length > 0
                ? tagLabel([...stats.tagStats].sort((a, b) => b.count - a.count)[0].tag)
                : '尚無資料'}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">範圍內次數最多之標籤</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-3 h-3 text-primary" /> 熱點題數
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{stats?.hotspots.length || 0}</div>
            <p className="text-[10px] text-muted-foreground mt-1">至少一筆回饋的題目（前 10 大見右表）</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ThumbsDown className="w-4 h-4 text-primary" /> 問題類型分佈
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats?.tagStats.map((stat) => (
              <div key={stat.tag} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-foreground">{tagLabel(stat.tag)}</span>
                  <span className="text-muted-foreground">{stat.count} 次</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-1000"
                    style={{ width: `${(stat.count / totalForBar) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {(!stats?.tagStats || stats.tagStats.length === 0) && (
              <div className="py-10 text-center text-xs text-muted-foreground">目前尚無標籤回饋</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" /> 熱點題目（Top 10）
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] h-8 px-4">題目 ID</TableHead>
                  <TableHead className="text-[10px] h-8 text-right px-4">報告次數</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats?.hotspots.map((spot) => (
                  <TableRow key={spot.question_id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="text-xs font-medium font-mono py-2 truncate max-w-[180px]">{spot.question_id}</TableCell>
                    <TableCell className="text-right py-2 px-4">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          spot.report_count >= 5 ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {spot.report_count}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {(!stats?.hotspots || stats.hotspots.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} className="py-10 text-center text-xs text-muted-foreground">
                      目前沒有符合範圍的題目回饋
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-sm font-bold">回饋明細（含使用者選項與留言）</CardTitle>
          <Button type="button" variant="secondary" size="sm" onClick={() => void load()}>
            重新整理
          </Button>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px] min-w-[120px]">時間</TableHead>
                <TableHead className="text-[10px] min-w-[100px]">使用者</TableHead>
                <TableHead className="text-[10px] min-w-[140px]">題目 ID</TableHead>
                <TableHead className="text-[10px] min-w-[160px]">回饋類型（選項）</TableHead>
                <TableHead className="text-[10px] min-w-[220px]">留言／補充</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((row) => (
                <TableRow key={`${row.id ?? row.created_at}-${row.question_id}-${row.tag}`}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(row.created_at)}</TableCell>
                  <TableCell className="text-xs font-mono">{row.user_id === 'anonymous' ? '匿名' : row.user_id}</TableCell>
                  <TableCell className="text-xs font-mono break-all max-w-[200px]">{row.question_id}</TableCell>
                  <TableCell className="text-xs">{tagLabel(row.tag)}</TableCell>
                  <TableCell className="text-xs text-foreground whitespace-pre-wrap max-w-md">
                    {row.comment?.trim() ? row.comment : '—'}
                  </TableCell>
                </TableRow>
              ))}
              {entries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-xs text-muted-foreground">
                    此時間範圍尚無題目回饋明細
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
