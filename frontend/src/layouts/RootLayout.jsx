import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import BottomNav from '../components/BottomNav.jsx';
import Header from '../components/Header.jsx';

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-bg text-text-1 flex">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col md:pl-64">
        <Header />
        <main className="flex-1 min-w-0 pb-20 md:pb-6">
          <div className="max-w-[1180px] mx-auto px-4 md:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
