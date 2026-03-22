import { useEffect, useState } from 'react';
import { getApiBaseUrl } from '@/data/api';
import { Loader2, MessageSquareHeart } from 'lucide-react';
import { toast } from 'sonner';

interface SiteFeedback {
  user_id: string;
  comment: string;
  created_at: string;
}

export default function AdminSiteFeedback() {
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState<SiteFeedback[]>([]);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const token = sessionStorage.getItem('admin_token');
      if (!token) return;

      const res = await fetch(`${getApiBaseUrl()}/api/admin/site-feedback`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (data.ok) {
        setFeedbacks(data.details || []);
      }
    } catch (e) {
      console.error(e);
      toast.error('無法取得全站留言');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm font-bold text-muted-foreground animate-pulse">載入留言中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-2 px-1">
        <MessageSquareHeart className="w-5 h-5 text-rose-500" />
        <h2 className="text-lg font-black text-foreground">全站回饋留言版</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {feedbacks.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-2xl border border-border/50">
            目前還沒有收到使用者留言。
          </div>
        ) : (
          feedbacks.map((fb, idx) => (
            <div key={idx} className="bg-card rounded-2xl border p-4 flex flex-col gap-3 hover:border-primary/30 transition-colors shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-rose-400 group-hover:bg-primary transition-colors"></div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full font-mono text-muted-foreground truncate max-w-[120px]">
                  {fb.user_id === 'anonymous' ? '訪客' : fb.user_id}
                </span>
                <span className="text-[10px] text-muted-foreground/60 shrink-0">
                  {new Date(fb.created_at).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {fb.comment || '(無文字內容)'}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
