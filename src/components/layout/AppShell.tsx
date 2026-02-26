import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import TopAppBar from './TopAppBar';
import BottomNav from './BottomNav';
import SideNav from './SideNav';
import MiniPlayer from '../player/MiniPlayer';
import FullPlayer from '../player/FullPlayer';
import { NoInternetBanner } from '../common/NoInternetBanner';
import AdSlot from '../ads/AdSlot';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import SEOHead, { organizationSchema, websiteSchema } from '../common/SEOHead';

export default function AppShell() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isTV = useMediaQuery('(min-width: 1920px)');
  const { currentSong, showFullPlayer } = useAudioPlayer();

  const hasMiniPlayer = !!currentSong && !showFullPlayer;
  const showPlayerPane = isDesktop && !!currentSong && !showFullPlayer;
  // Bottom padding: mini player (~64px) + bottom nav (56px) = 120, or just bottom nav = 56
  const bottomPadding = hasMiniPlayer ? 128 : 56;

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      ...(isTV && { fontSize: '1.2rem' }),
    }}>
      <SEOHead jsonLd={[organizationSchema, websiteSchema]} />
      <NoInternetBanner />
      <TopAppBar />

      {/* Leaderboard ad — 728x90 desktop, 320x50 mobile */}
      <AdSlot
        slotId={import.meta.env.VITE_AD_SLOT_LEADERBOARD as string}
        placement="leaderboard"
        format="horizontal"
        sx={{
          mx: 'auto',
          maxWidth: isTV ? 1400 : 840,
          width: '100%',
          my: 0,
        }}
      />

      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Side nav on desktop only */}
        {isDesktop && <SideNav />}

        {/* Main content area */}
        <Box
          id="main-content"
          component="main"
          sx={{
            flex: 1,
            overflowY: 'auto',
            pb: isDesktop ? (hasMiniPlayer ? '80px' : 0) : `${bottomPadding}px`,
            display: 'flex',
            flexDirection: isDesktop ? 'row' : 'column',
          }}
        >
          <Box sx={{
            flex: 1,
            maxWidth: showPlayerPane ? 'calc(100% - 380px)' : '100%',
          }}>
            <Box sx={{
              maxWidth: isTV ? 1400 : 840,
              mx: isDesktop ? 'auto' : 0,
              width: '100%',
            }}>
              <Outlet />
            </Box>
          </Box>

          {/* Desktop: persistent player pane */}
          {showPlayerPane && (
            <Box sx={{
              width: 380,
              flexShrink: 0,
              borderLeft: 1,
              borderColor: 'divider',
              overflowY: 'auto',
            }}>
              <FullPlayer embedded />
            </Box>
          )}

          {/* Desktop: sidebar ad when no player pane */}
          {isDesktop && !showPlayerPane && (
            <Box sx={{
              width: 300,
              flexShrink: 0,
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              <AdSlot
                slotId={import.meta.env.VITE_AD_SLOT_SIDEBAR as string}
                placement="sidebar"
                format="vertical"
                responsive={false}
                sx={{ position: 'sticky', top: 16 }}
              />
            </Box>
          )}
        </Box>
      </Box>

      {/* Mobile banner ad — above MiniPlayer/BottomNav */}
      {!isDesktop && (
        <Box sx={{
          position: 'fixed',
          bottom: hasMiniPlayer ? 120 : 56,
          left: 0,
          right: 0,
          zIndex: 1100,
          pointerEvents: 'none',
          display: 'flex',
          justifyContent: 'center',
          '& > *': { pointerEvents: 'auto' },
        }}>
          <AdSlot
            slotId={import.meta.env.VITE_AD_SLOT_MOBILE_BANNER as string}
            placement="mobile_banner"
            format="horizontal"
            sx={{ maxWidth: 400 }}
          />
        </Box>
      )}

      {/* Mini player (mobile/tablet — below desktop) */}
      {hasMiniPlayer && !isDesktop && <MiniPlayer />}

      {/* Bottom nav (mobile/tablet — below desktop) */}
      {!isDesktop && <BottomNav />}

      {/* Full player overlay (mobile/tablet) */}
      {showFullPlayer && !isDesktop && <FullPlayer />}
    </Box>
  );
}
