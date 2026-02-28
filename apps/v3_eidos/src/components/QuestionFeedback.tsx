import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MessageSquareText, ThumbsDown, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { getApiBaseUrl } from '@/data/api';

interface QuestionFeedbackProps {
    questionId: string;
    userId?: string;
    /** 是否採用底部工具列樣式 (1/5 比例，視覺上較低調) */
    isToolbarStyle?: boolean;
}

const FEEDBACK_TAGS = [
    { id: 'dont_understand', label: '看不懂題目', icon: '🤷' },
    { id: 'content_error', label: '答案或內容有錯', icon: '❌' },
    { id: 'typo', label: '有錯字', icon: '⌨️' },
    { id: 'display_issue', label: '圖片或排版不清楚', icon: '🎨' },
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
                    size={isToolbarStyle ? "default" : "sm"}
                    className={`${isToolbarStyle
                        ? "w-full h-full py-3 px-1 text-xs sm:text-sm text-muted-foreground/70 hover:text-foreground hover:bg-muted/50 border-none shadow-none"
                        : "h-7 px-2 text-[10px] text-muted-foreground bg-muted/30 rounded-full"
                        } gap-1.5 transition-all flex-col sm:flex-row`}
                >
                    <MessageSquareText className={isToolbarStyle ? "w-4 h-4" : "w-3 h-3"} />
                    <span className={isToolbarStyle ? "scale-90 sm:scale-100" : ""}>這題有誤？</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3 rounded-2xl shadow-xl border-amber-100" side="top" align="start" sideOffset={12}>
                <div className="space-y-3">
                    <div className="space-y-1">
                        <h4 className="text-xs font-bold flex items-center gap-1.5">
                            <ThumbsDown className="w-3 h-3 text-amber-500" />
                            這題哪裡怪怪的呢？
                        </h4>
                        <p className="text-[10px] text-muted-foreground">告訴我們，我們會馬上修復它！</p>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5">
                        {FEEDBACK_TAGS.map((tag) => (
                            <Button
                                key={tag.id}
                                variant="outline"
                                size="sm"
                                disabled={isSubmitting || isSubmitted}
                                className={`justify-start gap-2 h-9 text-xs rounded-xl hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition-all ${isSubmitted ? 'opacity-50' : ''
                                    }`}
                                onClick={() => handleFeedback(tag.id, tag.label)}
                            >
                                <span className="text-sm">{tag.icon}</span>
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
