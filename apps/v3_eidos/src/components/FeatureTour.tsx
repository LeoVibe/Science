import { useEffect, useState } from 'react';

interface FeatureTourProps {
    targetId: string;
    content: string;
    onComplete: () => void;
}

export default function FeatureTour({ targetId, content, onComplete }: FeatureTourProps) {
    const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

    useEffect(() => {
        const updatePosition = () => {
            const el = document.getElementById(targetId);
            if (el) {
                const rect = el.getBoundingClientRect();
                setCoords({
                    top: rect.bottom - 4, // 稍微上移讓手指更靠近圖示
                    left: rect.left + rect.width / 2
                });
            }
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);
        return () => window.removeEventListener('resize', updatePosition);
    }, [targetId]);

    if (!coords) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-300">
            <div
                className="absolute flex flex-col items-center animate-in slide-in-from-top-4 duration-500"
                style={{
                    top: coords.top,
                    left: coords.left,
                    transform: 'translateX(-50%)'
                }}
            >
                {/* 浮動游標手指 - 放在最上方指向盾牌 */}
                <div className="text-4xl animate-bounce pointer-events-none mb-1">
                    👆
                </div>

                {/* 提示氣泡 - 放在手指下方 */}
                <div className="bg-primary text-primary-foreground px-5 py-4 rounded-2xl shadow-2xl max-w-[240px] text-center space-y-3 border-4 border-white relative">
                    {/* 小裝飾：連接氣泡與手指的小突起 */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rotate-45 border-l-4 border-t-4 border-white" />

                    <p className="text-sm font-black leading-relaxed relative z-10">
                        {content}
                    </p>
                    <button
                        onClick={onComplete}
                        className="w-full bg-white text-primary py-2 rounded-xl font-black text-xs hover:bg-opacity-90 transition-all active:scale-95 relative z-10"
                    >
                        知道了！
                    </button>
                </div>
            </div>
        </div>
    );
}
