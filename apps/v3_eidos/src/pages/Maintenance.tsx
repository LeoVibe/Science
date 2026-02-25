import { useNavigate } from "react-router-dom";

export default function Maintenance() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-secondary/50 rounded-full flex items-center justify-center mb-8">
                <span className="text-5xl">🚧</span>
            </div>
            <h1 className="text-3xl font-black mb-4">系統維護中</h1>
            <p className="text-muted-foreground max-w-sm mb-8">
                我們正在進行系統升級與題庫維護中，以提供更好的服務品質。請稍後再試。
            </p>

            <button
                onClick={() => {
                    // 提供管理員後門，如果是管理員還是可以進入 /admin
                    navigate('/admin');
                }}
                className="text-xs text-muted-foreground/30 hover:text-primary transition-colors hover:underline"
            >
                管理員登入
            </button>
        </div>
    );
}
