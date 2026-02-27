import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MessageSquare, ThumbsDown, AlertTriangle, Users, ExternalLink } from 'lucide-react';
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

const TAG_LABELS: Record<string, { label: string; icon: string }> = {
    dont_understand: { label: '看不懂題目', icon: '🤷' },
    content_error: { label: '答案或內容有錯', icon: '❌' },
    typo: { label: '有錯字', icon: '⌨️' },
    display_issue: { label: '圖片或排版不清楚', icon: '🎨' },
};

export default function AdminFeedbackInsights() {
    const [stats, setStats] = useState<{ total: number; tagStats: TagStat[]; hotspots: Hotspot[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('admin_token');
            const apiUrl = getApiBaseUrl();
            const response = await fetch(`${apiUrl}/api/admin/feedback/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch stats');
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Fetch stats error:', error);
            toast.error('無法取得回饋統計資料');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="py-20 text-center text-muted-foreground">載入回饋數據中...</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-orange-50/50 border-orange-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-orange-600 flex items-center gap-2">
                            <MessageSquare className="w-3 h-3" /> 總回饋數
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{stats?.total || 0}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">來自全站學生的即時反應</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3 text-amber-500" /> 主要問題
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">
                            {stats?.tagStats && stats.tagStats.length > 0
                                ? TAG_LABELS[stats.tagStats.sort((a, b) => b.count - a.count)[0].tag]?.label
                                : '尚無資料'}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">目前被標記次數最多的類型</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                            <Users className="w-3 h-3 text-blue-500" /> 待處理題目
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{stats?.hotspots.length || 0}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">至少被反應過一次的題目</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tag distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <ThumbsDown className="w-4 h-4 text-primary" /> 問題類型分佈
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {stats?.tagStats.map((stat) => (
                            <div key={stat.tag} className="space-y-1.5">
                                <div className="flex justify-between text-xs">
                                    <span className="font-medium">
                                        {TAG_LABELS[stat.tag]?.icon} {TAG_LABELS[stat.tag]?.label || stat.tag}
                                    </span>
                                    <span className="text-muted-foreground">{stat.count} 次</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-1000"
                                        style={{ width: `${(stat.count / (stats.total || 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                        {(!stats?.tagStats || stats.tagStats.length === 0) && (
                            <div className="py-10 text-center text-xs text-muted-foreground">目前尚無標籤回饋</div>
                        )}
                    </CardContent>
                </Card>

                {/* Hotspots */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-destructive" /> 熱點題目清單
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
                                    <TableRow key={spot.question_id} className="hover:bg-muted/50 cursor-pointer transition-colors group">
                                        <TableCell className="text-xs font-medium font-mono py-2 truncate max-w-[150px]">
                                            {spot.question_id}
                                        </TableCell>
                                        <TableCell className="text-right py-2 px-4">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${spot.report_count >= 5 ? 'bg-destructive/10 text-destructive' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {spot.report_count}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(!stats?.hotspots || stats.hotspots.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={2} className="py-10 text-center text-xs text-muted-foreground">
                                            目前沒有被標記的題目
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
