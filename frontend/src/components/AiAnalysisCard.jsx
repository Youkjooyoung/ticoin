import { useEffect, useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import api from '../api/axios.js';

export default function AiAnalysisCard({ symbol, price, changePct }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(true);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ai/analyze', {
        params: { symbol, price: price ?? 0, changePct: changePct ?? 0 },
      });
      setData(res.data);
      setEnabled(res.data?.enabled !== false);
    } catch (err) {
      setData({ summary: 'AI 분석을 불러오지 못했습니다.', enabled: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [symbol]);

  return (
    <div className="glass-card p-4 space-y-3">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-brand-bg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold">AI 시장 분석</h4>
            <p className="text-[10px] text-text-3">Powered by Claude Haiku</p>
          </div>
        </div>
        {enabled && (
          <button
            onClick={fetchAnalysis}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-[var(--surface-2)] transition-colors disabled:opacity-50"
            aria-label="재분석"
          >
            <RefreshCw className={`w-4 h-4 text-text-2 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </header>

      <div className="text-sm leading-relaxed">
        {loading ? (
          <div className="space-y-2">
            <div className="h-3 rounded bg-[var(--surface-2)] animate-pulse" />
            <div className="h-3 rounded bg-[var(--surface-2)] animate-pulse w-5/6" />
            <div className="h-3 rounded bg-[var(--surface-2)] animate-pulse w-4/6" />
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-text-1">{data?.summary}</p>
        )}
      </div>

      {!enabled && (
        <p className="text-[11px] text-text-3 pt-2 border-t border-[var(--border)]">
          💡 활성화하려면 백엔드 환경 변수 <code className="mono bg-[var(--surface-2)] px-1.5 py-0.5 rounded">ANTHROPIC_API_KEY</code>를 설정하세요.
        </p>
      )}
    </div>
  );
}
