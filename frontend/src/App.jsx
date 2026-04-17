import { Routes, Route } from 'react-router-dom';
import RootLayout from './layouts/RootLayout.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import ToastContainer from './components/Toast.jsx';
import ThemeProvider from './components/ThemeProvider.jsx';
import PwaInstallPrompt from './components/PwaInstallPrompt.jsx';
import Home from './pages/Home.jsx';
import Search from './pages/Search.jsx';
import Trending from './pages/Trending.jsx';
import Portfolio from './pages/Portfolio.jsx';
import Watchlist from './pages/Watchlist.jsx';
import Alerts from './pages/Alerts.jsx';
import Profile from './pages/Profile.jsx';
import Settings from './pages/Settings.jsx';
import Login from './pages/Login.jsx';
import AuthCallback from './pages/AuthCallback.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route element={<RootLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <ToastContainer />
        <PwaInstallPrompt />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
