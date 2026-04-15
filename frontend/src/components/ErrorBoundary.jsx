import { Component } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-bg">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-down/10 border border-down/30 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-down" />
          </div>
          <h2 className="text-xl font-extrabold mb-2">문제가 발생했습니다</h2>
          <p className="text-sm text-text-3 mb-2">
            페이지 렌더링 중 예상치 못한 오류가 발생했습니다.
          </p>
          {this.state.error?.message && (
            <p className="text-xs text-down mono mb-5 break-all">{this.state.error.message}</p>
          )}
          <div className="flex gap-2 justify-center">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              다시 시도
            </button>
            <button
              onClick={this.handleReload}
              className="px-4 py-2 rounded-lg bg-bg-soft border border-border text-sm font-semibold text-text-2 hover:text-text-1 transition-colors"
            >
              새로고침
            </button>
          </div>
        </div>
      </div>
    );
  }
}
