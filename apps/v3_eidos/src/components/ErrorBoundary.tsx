import { Component, ErrorInfo, ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean; message: string };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message || '發生未知錯誤' };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md bg-card border rounded-2xl p-6 text-center space-y-3">
            <p className="text-3xl">⚠️</p>
            <h1 className="text-lg font-bold">畫面暫時發生錯誤</h1>
            <p className="text-sm text-muted-foreground">{this.state.message}</p>
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold"
              onClick={() => window.location.reload()}
            >
              重新整理
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
