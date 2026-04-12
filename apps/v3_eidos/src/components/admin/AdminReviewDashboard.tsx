import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ReviewStats {
  total: number;
  publishable: number;
  pendingReview: number;
  corrected: number;
  needsRework: number;
  byGrade?: Record<string, any>;
  bySubject?: Record<string, any>;
  byPublisher?: Record<string, any>;
  byStatus?: Record<string, number>;
}

const GRADES = ['G3', 'G4', 'G5', 'G6'];
const SUBJECTS = ['Chinese', 'Math', 'English', 'Science', 'Social'];
const PUBLISHERS = ['HanLin', 'KangHsuan', 'NanYi'];
const REVIEW_STATUSES = ['pending_review', 'confirmed', 'corrected', 'needs_rework'];

export default function AdminReviewDashboard() {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    grade: 'all',
    subject: 'all',
    publisher: 'all',
    reviewStatus: 'pending_review',
    searchTerm: '',
  });
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Fetch review statistics
    const fetchStats = async () => {
      try {
        // In a real implementation, this would call an API endpoint
        // For now, we'll load the data locally
        const response = await fetch('/api/review/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch review stats:', error);
        // Use dummy data for demo
        setStats({
          total: 11525,
          publishable: 4489,
          pendingReview: 7036,
          corrected: 0,
          needsRework: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all visible questions
      setSelectedQuestions(new Set(['all']));
    } else {
      setSelectedQuestions(new Set());
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action}`, selectedQuestions);
    // TODO: Implement bulk operations
  };

  const publishRate = stats
    ? ((stats.publishable / stats.total) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold">題目品質審核</h1>
        <p className="text-gray-500 mt-2">審核和管理題目發佈狀態</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">總題數</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.total ?? '—'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">已發佈</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.publishable ?? '—'}</div>
            <p className="text-xs text-gray-500 mt-2">{publishRate}% 發佈率</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">待審核</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {stats?.pendingReview ?? '—'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">需重測</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {stats?.needsRework ?? '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>篩選條件</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">級級</label>
              <Select value={filter.grade} onValueChange={(val) =>
                setFilter({ ...filter, grade: val })
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  {GRADES.map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">科目</label>
              <Select value={filter.subject} onValueChange={(val) =>
                setFilter({ ...filter, subject: val })
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  {SUBJECTS.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">版本</label>
              <Select value={filter.publisher} onValueChange={(val) =>
                setFilter({ ...filter, publisher: val })
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  {PUBLISHERS.map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">審核狀態</label>
              <Select value={filter.reviewStatus} onValueChange={(val) =>
                setFilter({ ...filter, reviewStatus: val })
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  {REVIEW_STATUSES.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">搜尋題號</label>
              <Input
                placeholder="輸入題號..."
                value={filter.searchTerm}
                onChange={(e) =>
                  setFilter({ ...filter, searchTerm: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="default">搜尋</Button>
            <Button
              variant="outline"
              onClick={() =>
                setFilter({
                  grade: 'all',
                  subject: 'all',
                  publisher: 'all',
                  reviewStatus: 'pending_review',
                  searchTerm: '',
                })
              }
            >
              重置
            </Button>
            <Button variant="outline">匯出清單</Button>
          </div>
        </CardContent>
      </Card>

      {/* Questions Table */}
      <Card>
        <CardHeader>
          <CardTitle>題目列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">載入中...</div>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-2">
                <Checkbox
                  checked={selectedQuestions.has('all')}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm">全選</span>
                {selectedQuestions.size > 0 && (
                  <>
                    <span className="text-sm text-gray-500 ml-4">
                      已選擇 {selectedQuestions.size} 項
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('publish')}
                    >
                      批量發佈
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('rework')}
                    >
                      批量標記重測
                    </Button>
                  </>
                )}
              </div>

              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox />
                      </TableHead>
                      <TableHead>課檔</TableHead>
                      <TableHead>題號</TableHead>
                      <TableHead>題文預覽</TableHead>
                      <TableHead>狀態</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell>L1</TableCell>
                      <TableCell>Q1</TableCell>
                      <TableCell className="max-w-xs truncate">
                        圓的直徑是多少公分？
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">待審核</Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost">
                          審核
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex justify-center gap-2">
                <Button variant="outline" size="sm">上一頁</Button>
                <Button variant="outline" size="sm">下一頁</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
