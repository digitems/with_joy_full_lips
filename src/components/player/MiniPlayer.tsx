import { Box, Typography, IconButton, LinearProgress } from '@mui/material';
import { PlayArrow, Pause, SkipNext } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAudioPlayer, usePlayerPosition } from '../../context/AudioPlayerContext';
import Equalizer from './Equalizer';
import VinylDisk from './VinylDisk';
import { miniPlayerGradient } from '../../theme/gradients';

export default function MiniPlayer() {
  const {
    currentSong,
    isPlaying,
    isBuffering,
    togglePlayPause,
    skipToNext,
    setShowFullPlayer,
  } = useAudioPlayer();
  const { currentPosition, duration } = usePlayerPosition();

  if (!currentSong) return null;

  const progress = duration > 0 ? (currentPosition / duration) * 100 : 0;

  return (
    <motion.div
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      exit={{ y: 80 }}
      style={{
        position: 'fixed',
        bottom: 56, // above bottom nav
        left: 0,
        right: 0,
        zIndex: 1100,
      }}
    >
      <Box
        onClick={() => setShowFullPlayer(true)}
        sx={{
          background: miniPlayerGradient,
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        {/* Progress bar at top */}
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            bgcolor: 'rgba(255,255,255,0.15)',
            '& .MuiLinearProgress-bar': { bgcolor: '#E3AD43' },
          }}
        />

        <VinylDisk
          coverUrl={currentSong.coverImageUrl}
          isPlaying={isPlaying}
          size={44}
          rotationDuration={3}
        />

        <Equalizer isPlaying={isPlaying} height={16} />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" color="#fff" noWrap fontWeight={600}>
            {currentSong.title}
          </Typography>
          <Typography variant="caption" color="rgba(255,255,255,0.7)" noWrap>
            {currentSong.artist}
          </Typography>
        </Box>

        <IconButton
          aria-label={isPlaying ? 'Pause' : 'Play'}
          onClick={(e) => {
            e.stopPropagation();
            togglePlayPause();
          }}
          sx={{ color: '#fff' }}
        >
          {isBuffering ? (
            <Box sx={{ width: 24, height: 24 }}>
              <svg viewBox="0 0 24 24" width={24} height={24}>
                <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                <circle
                  cx="12" cy="12" r="10" fill="none" stroke="#E3AD43" strokeWidth="2"
                  strokeDasharray="63" strokeDashoffset={63 * (1 - progress / 100)}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                />
              </svg>
            </Box>
          ) : isPlaying ? (
            <Pause />
          ) : (
            <PlayArrow />
          )}
        </IconButton>

        <IconButton
          aria-label="Next song"
          onClick={(e) => {
            e.stopPropagation();
            skipToNext();
          }}
          sx={{ color: '#fff' }}
        >
          <SkipNext />
        </IconButton>
      </Box>
    </motion.div>
  );
}
