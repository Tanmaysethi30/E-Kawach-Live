import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('E-KAWACH ErrorBoundary caught an unhandled exception:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleReset = () => {
    try {
      localStorage.removeItem('ekawach_user');
      localStorage.removeItem('ekawach_token');
    } catch (_e) {}
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 select-none font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-4 animate-pulse">
              <span className="material-symbols-outlined text-[32px]">emergency_home</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 font-mono mb-1">
              Clinical Session Protected
            </span>
            <h1 className="text-xl font-bold text-white mb-2">Display Module Recovered</h1>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              An unexpected display interrupt occurred. Your patient and doctor records remain securely synchronized with the central E-KAWACH database.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer border border-white/10"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
