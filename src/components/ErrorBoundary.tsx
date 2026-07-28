import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidMount() {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleGlobalError);
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    }
  }

  public componentWillUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('error', this.handleGlobalError);
      window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    }
  }

  private redirectInviteToRegistration = () => {
    const match = window.location.pathname.match(/^\/join\/([^/]+)\/?$/);
    if (!match) return false;

    window.location.replace(`/?invite=${encodeURIComponent(match[1])}`);
    return true;
  };

  private handleGlobalError = (event: ErrorEvent) => {
    if (event.error) {
      console.error('Global error caught by ErrorBoundary:', event.error);
      if (!this.redirectInviteToRegistration()) {
        this.setState({ hasError: true, error: event.error });
      }
    }
  };

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    console.error('Unhandled rejection caught by ErrorBoundary:', event.reason);
    if (this.redirectInviteToRegistration()) return;

    const err = event.reason instanceof Error ? event.reason : new Error(String(event.reason || 'Sự cố kết nối hoặc phản hồi API không thành công'));
    this.setState({ hasError: true, error: err });
  };

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    if (!this.redirectInviteToRegistration()) {
      this.setState({ errorInfo });
    }
  }

  private handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Storage clear error:', e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-center">
            
            <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
              <AlertTriangle className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-white">
                Hệ Thống Đang Tự Động Khôi Phục
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Đã xảy ra sự cố không mong muốn trong quá trình tải ứng dụng. Vui lòng bấm nút bên dưới để khôi phục trạng thái ban đầu.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-left overflow-auto max-h-32 text-[11px] font-mono text-rose-300">
                {this.state.error.toString()}
              </div>
            )}

            <div className="pt-2 space-y-2">
              <button
                onClick={this.handleReset}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Khôi Phục & Tải Lại Lại Ứng Dụng</span>
              </button>

              <button
                onClick={() => window.location.href = window.location.pathname}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800 flex items-center justify-center space-x-1.5 transition-all"
              >
                <Home className="h-4 w-4 text-slate-400" />
                <span>Trở Về Trang Chủ</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-500 font-mono">
              Quản Lý Hụi 4.0 • eKYC & VietQR Secured
            </p>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
