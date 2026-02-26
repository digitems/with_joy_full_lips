import { Box, Typography, IconButton, useMediaQuery, Snackbar } from '@mui/material';
import {
  KeyboardArrowDown,
  Favorite,
  FavoriteBorder,
  ThumbUp,
  ThumbUpOffAlt,
  Star,
  Share,
  Download,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioPlayer, usePlayerPosition } from '../../context/AudioPlayerContext';
import { useAuth } from '../../context/AuthContext';
import VinylDisk from './VinylDisk';
import ProgressBar from './ProgressBar';
import PlayerControls from './PlayerControls';
import RatingDialog from '../common/RatingDialog';
import { playerGradient } from '../../theme/gradients';
import * as colors from '../../theme/colors';
import { songsApi } from '../../api/songs';
import { userApi } from '../../api/user';
import { downloadSong } from '../../utils/downloadSong';
import { useState } from 'react';

interface FullPlayerProps {
  embedded?: boolean;
}

export default function FullPlayer({ embedded }: FullPlayerProps) {
  const isLandscape = useMediaQuery('(orientation: landscape) and (max-height: 500px)');
  const {
    currentSong,
    isPlaying,
    seekTo,
    setShowFullPlayer,
    updateCurrentSong,
  } = useAudioPlayer();
  const { currentPosition, duration } = usePlayerPosition();
  const { isAuthenticated } = useAuth();
  const [showRating, setShowRating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  if (!currentSong) return null;

  const handleToggleLike = async () => {
    if (!isAuthenticated) return;
    try {
      await songsApi.toggleLike(currentSong.id);
      updateCurrentSong((s) => ({
        ...s,
        isLiked: !s.isLiked,
        likes: s.isLiked ? s.likes - 1 : s.likes + 1,
      }));
    } catch { /* ignore */ }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) return;
    try {
      if (currentSong.isFavorite) {
        await userApi.removeFavorite(currentSong.id);
      } else {
        await userApi.addFavorite(currentSong.id);
      }
      updateCurrentSong((s) => ({ ...s, isFavorite: !s.isFavorite }));
    } catch { /* ignore */ }
  };

  const handleRate = async (rating: number) => {
    if (!isAuthenticated) return;
    try {
      await songsApi.rateSong(currentSong.id, rating);
      updateCurrentSong((s) => ({ ...s, userRating: rating }));
      setShowRating(false);
    } catch { /* ignore */ }
  };

  const handleDownload = async () => {
    if (!currentSong || downloading) return;
    setDownloading(true);
    try {
      await downloadSong(currentSong);
      setSnackbar('Download started');
    } catch {
      setSnackbar('Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentSong.title,
          text: `Listen to "${currentSong.title}" by ${currentSong.artist} on With Joyful Lips`,
        });
      } catch { /* cancelled */ }
    }
  };

  const content = (
    <Box
      sx={{
        background: playerGradient,
        height: embedded ? '100%' : '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
      }}
    >
      {/* Top bar */}
      {!embedded && (
        <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
          <IconButton aria-label="Minimize player" onClick={() => setShowFullPlayer(false)} sx={{ color: '#fff' }}>
            <KeyboardArrowDown fontSize="large" />
          </IconButton>
          <Typography variant="subtitle2" color="#fff" sx={{ flex: 1, textAlign: 'center' }}>
            Now Playing
          </Typography>
          <Box sx={{ width: 48 }} />
        </Box>
      )}

      {/* Main content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: isLandscape ? 'row' : 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          px: 3,
          py: embedded ? 3 : 0,
        }}
      >
        {/* Album art */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <VinylDisk
            coverUrl={currentSong.coverImageUrl}
            isPlaying={isPlaying}
            size={embedded ? 200 : isLandscape ? 180 : 260}
          />
        </Box>

        {/* Song info & controls */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isLandscape ? 'flex-start' : 'center',
            width: '100%',
            maxWidth: 400,
            gap: 1,
          }}
        >
          <Typography variant="h6" color="#fff" noWrap sx={{ width: '100%', textAlign: isLandscape ? 'left' : 'center' }}>
            {currentSong.title}
          </Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.7)" noWrap sx={{ width: '100%', textAlign: isLandscape ? 'left' : 'center' }}>
            {currentSong.artist}
          </Typography>

          <ProgressBar currentPosition={currentPosition} duration={duration} onSeek={seekTo} light />

          <PlayerControls large={!embedded} />

          {/* Secondary controls */}
          {isAuthenticated && (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
              <IconButton aria-label={currentSong.isFavorite ? 'Remove from favorites' : 'Add to favorites'} onClick={handleToggleFavorite} sx={{ color: currentSong.isFavorite ? colors.favoriteRed : 'rgba(255,255,255,0.6)' }}>
                {currentSong.isFavorite ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
              <IconButton aria-label={currentSong.isLiked ? 'Unlike' : 'Like'} onClick={handleToggleLike} sx={{ color: currentSong.isLiked ? colors.playerAccent : 'rgba(255,255,255,0.6)' }}>
                {currentSong.isLiked ? <ThumbUp /> : <ThumbUpOffAlt />}
              </IconButton>
              <IconButton aria-label="Rate song" onClick={() => setShowRating(true)} sx={{ color: currentSong.userRating ? colors.accentGold : 'rgba(255,255,255,0.6)' }}>
                <Star />
              </IconButton>
              <IconButton aria-label="Share song" onClick={handleShare} sx={{ color: 'rgba(255,255,255,0.6)' }}>
                <Share />
              </IconButton>
              <IconButton aria-label="Download song" onClick={handleDownload} disabled={downloading} sx={{ color: 'rgba(255,255,255,0.6)' }}>
                <Download />
              </IconButton>
            </Box>
          )}
        </Box>
      </Box>

      <RatingDialog
        open={showRating}
        onClose={() => setShowRating(false)}
        onRate={handleRate}
        currentRating={currentSong.userRating}
        songTitle={currentSong.title}
      />
      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        message={snackbar}
      />
    </Box>
  );

  if (embedded) return content;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1300,
        }}
      >
        {content}
      </motion.div>
    </AnimatePresence>
  );
}
