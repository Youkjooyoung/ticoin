import { Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from './layouts/RootLayout.jsx';
import Home from './pages/Home.jsx';
import Search from './pages/Search.jsx';
import Trending from './pages/Trending.jsx';
import Portfolio from './pages/Portfolio.jsx';
import Watchlist from './pages/Watchlist.jsx';
import Profile from './pages/Profile.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/trending" element={<Trending />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
