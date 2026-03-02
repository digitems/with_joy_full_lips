import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, CircularProgress, Box } from '@mui/material';
import { createAppTheme } from './theme/theme';
import { getStoredThemeMode, setStoredThemeMode, hasSplashBeenShown, markSplashShown } from './utils/storage';
import { AuthProvider } from './context/AuthContext';
import { AudioPlayerProvider } from './context/AudioPlayerContext';
import { PlaylistProvider } from './context/PlaylistContext';
import AppShell from './components/layout/AppShell';
import AdConsentBanner from './components/ads/AdConsentBanner';
import SplashScreen from './pages/SplashScreen';

// Lazy-loaded pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const PhoneAuthPage = lazy(() => import('./pages/PhoneAuthPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const BrowsePage = lazy(() => import('./pages/BrowsePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const MorePage = lazy(() => import('./pages/MorePage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const RatingsPage = lazy(() => import('./pages/RatingsPage'));
const DownloadsPage = lazy(() => import('./pages/DownloadsPage'));
const CategoryDetailPage = lazy(() => import('./pages/CategoryDetailPage'));
const PlaylistPage = lazy(() => import('./pages/PlaylistPage'));
const PlaylistDetailPage = lazy(() => import('./pages/PlaylistDetailPage'));
const AdManagerPage = lazy(() => import('./pages/AdManagerPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));

const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
    <CircularProgress />
  </Box>
);

function App() {
  const [showSplash, setShowSplash] = useState(!hasSplashBeenShown());
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    const stored = getStoredThemeMode();
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const theme = useMemo(() => createAppTheme(themeMode), [themeMode]);

  // Listen for system theme changes
  useEffect(() => {
    if (getStoredThemeMode()) return; // User has explicit preference
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setThemeMode(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleDarkMode = () => {
    const next = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
    setStoredThemeMode(next);
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
    markSplashShown();
  };

  if (showSplash) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SplashScreen onFinish={handleSplashFinish} />
      </ThemeProvider>
    );
  }

  return (
    <HelmetProvider>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <AudioPlayerProvider>
            <PlaylistProvider>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/phone-auth" element={<PhoneAuthPage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route element={<AppShell />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/browse" element={<BrowsePage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/more" element={<MorePage darkMode={themeMode === 'dark'} onToggleDarkMode={toggleDarkMode} />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                    <Route path="/history" element={<HistoryPage />} />
                    <Route path="/ratings" element={<RatingsPage />} />
                    <Route path="/downloads" element={<DownloadsPage />} />
                    <Route path="/category/:id" element={<CategoryDetailPage />} />
                    <Route path="/playlists" element={<PlaylistPage />} />
                    <Route path="/playlist/:id" element={<PlaylistDetailPage />} />
                    <Route path="/admin/ads" element={<AdManagerPage />} />
                  </Route>
                </Routes>
              </Suspense>
              <AdConsentBanner />
            </PlaylistProvider>
          </AudioPlayerProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
