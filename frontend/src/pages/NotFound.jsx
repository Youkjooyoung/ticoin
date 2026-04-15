import { Link } from 'react-router-dom';
import { Home, Ghost } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-full bg-brand-soft border border-brand/30 flex items-center justify-center mb-5">
        <Ghost className="w-10 h-10 text-brand-light" />
      </div>
      <h2 className="text-4xl font-extrabold gradient-text">404</h2>
      <p className="text-base font-semibold mt-2">페이지를 찾을 수 없습니다</p>
      <p className="text-sm text-text-3 mt-1">요청하신 경로가 존재하지 않거나 이동되었습니다.</p>
      <Link
        to="/"
        className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors"
      >
        <Home className="w-4 h-4" />
        홈으로 돌아가기
      </Link>
    </div>
  );
}
