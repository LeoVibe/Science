import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MessageSquareText, CheckCircle2, AlertCircle, HelpCircle, Edit3, Image as ImageIcon, XCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { getApiBaseUrl } from '@/data/api';

interface QuestionFeedbackProps {
    questionId: string;
    userId?: string;
    /** 是否採用底部工具列樣式 (1/5 比例，視覺上較低調) */
    isToolbarStyle?: boolean;
}

const FEEDBACK_OPTIONS = [
    { id: 'confusing', label: '🤷 題目看不懂、不清楚', icon: <HelpCircle className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'wrong_answer', label: '⌨️ 答案選項錯誤或錯字', icon: <Edit3 className="w-3.5 h-3.5 text-red-500" /> },
    { id: 'formatting', label: '🎨 圖片或排版不清楚', icon: <ImageIcon className="w-3.5 h-3.5 text-blue-500" /> },
    { id: 'too_hard', label: '❌ 題目太難、不該出現', icon: <XCircle className="w-3.5 h-3.5 text-purple-500" /> },
    { id: 'other', label: '💬 其他建議', icon: <Info className="w-3.5 h-3.5 text-slate-500" /> },
];

export default function QuestionFeedback({ questionId, userId, isToolbarStyle }: QuestionFeedbackProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleFeedback = async (tag: string, label: string) => {
        setIsSubmitting(true);
        try {
            const apiUrl = getApiBaseUrl();
            const response = await fetch(`${apiUrl}/api/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': userId || 'anonymous',
                },
                body: JSON.stringify({
                    questionId,
                    tag,
                    userId: userId || 'anonymous',
                }),
            });

            if (!response.ok) throw new Error('Failed to submit feedback');

            setIsSubmitted(true);
            toast.success(`感謝回饋！我們收到你對「${label}」的意見了。`, {
                icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
            });

            setTimeout(() => {
                setIsSubmitted(false);
                setIsOpen(false);
            }, 3000);
        } catch (error) {
            console.error('Feedback error:', error);
            toast.error('回饋送出失敗，請稍後再試。');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={`${isToolbarStyle
                        ? "h-9 px-3 text-xs bg-muted/50 border border-muted-foreground/10 hover:bg-muted"
                        : "h-7 px-2 text-[10px] text-muted-foreground bg-muted/30 rounded-full"
                        } gap-1.5 transition-all flex-col sm:flex-row`}
                >
                    <AlertCircle className={isToolbarStyle ? "w-4 h-4" : "w-3 h-3"} />
                    <span className={isToolbarStyle ? "scale-90 sm:scale-100" : ""}>問題回報</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3 rounded-2xl shadow-xl border-amber-100" side="top" align="start" sideOffset={12}>
                <div className="space-y-3">
                    <div className="space-y-1">
                        <h4 className="text-xs font-bold flex items-center gap-1.5">
                            <MessageSquareText className="w-3 h-3 text-amber-500" />
                            這題哪裡怪怪的呢？
                        </h4>
                        <p className="text-[10px] text-muted-foreground">告訴我們，我們會馬上修復它！</p>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5">
                        {FEEDBACK_OPTIONS.map((tag) => (
                            <Button
                                key={tag.id}
                                variant="outline"
                                size="sm"
                                disabled={isSubmitting || isSubmitted}
                                className={`justify-start gap-2 h-9 text-xs rounded-xl hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition-all ${isSubmitted ? 'opacity-50' : ''
                                    }`}
                                onClick={() => handleFeedback(tag.id, tag.label)}
                            >
                                <span className="mr-2 text-xs">{tag.icon}</span>
                                {tag.label}
                            </Button>
                        ))}
                    </div>

                    {isSubmitted && (
                        <div className="pt-1 flex items-center justify-center gap-1.5 text-[10px] text-green-600 font-medium animate-in fade-in slide-in-from-bottom-1">
                            <CheckCircle2 className="w-3 h-3" />
                            傳送成功！謝謝你
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
