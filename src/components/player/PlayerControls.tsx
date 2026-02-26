import { Box, IconButton } from '@mui/material';
import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  Shuffle,
  Repeat,
  RepeatOne,
} from '@mui/icons-material';
import * as colors from '../../theme/colors';
import { playButtonGradient } from '../../theme/gradients';
import { useAudioPlayer } from '../../context/AudioPlayerContext';

interface PlayerControlsProps {
  large?: boolean;
}

export default function PlayerControls({ large }: PlayerControlsProps) {
  const {
    isPlaying,
    togglePlayPause,
    skipToNext,
    skipToPrevious,
    shuffleEnabled,
    toggleShuffle,
    repeatMode,
    cycleRepeatMode,
  } = useAudioPlayer();

  const iconSize = large ? 32 : 24;
  const playSize = large ? 56 : 44;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: large ? 2 : 1 }}>
      <IconButton
        aria-label={shuffleEnabled ? 'Disable shuffle' : 'Enable shuffle'}
        onClick={toggleShuffle}
        sx={{ color: shuffleEnabled ? colors.playerAccent : 'rgba(255,255,255,0.6)' }}
      >
        <Shuffle sx={{ fontSize: iconSize * 0.8 }} />
      </IconButton>

      <IconButton aria-label="Previous song" onClick={skipToPrevious} sx={{ color: '#fff' }}>
        <SkipPrevious sx={{ fontSize: iconSize }} />
      </IconButton>

      <IconButton
        aria-label={isPlaying ? 'Pause' : 'Play'}
        onClick={togglePlayPause}
        sx={{
          width: playSize,
          height: playSize,
          background: playButtonGradient,
          color: '#fff',
          '&:hover': { background: playButtonGradient, filter: 'brightness(1.1)' },
        }}
      >
        {isPlaying ? <Pause sx={{ fontSize: iconSize }} /> : <PlayArrow sx={{ fontSize: iconSize }} />}
      </IconButton>

      <IconButton aria-label="Next song" onClick={skipToNext} sx={{ color: '#fff' }}>
        <SkipNext sx={{ fontSize: iconSize }} />
      </IconButton>

      <IconButton
        aria-label={repeatMode === 'off' ? 'Enable repeat' : repeatMode === 'one' ? 'Disable repeat' : 'Repeat one'}
        onClick={cycleRepeatMode}
        sx={{ color: repeatMode !== 'off' ? colors.playerAccent : 'rgba(255,255,255,0.6)' }}
      >
        {repeatMode === 'one' ? (
          <RepeatOne sx={{ fontSize: iconSize * 0.8 }} />
        ) : (
          <Repeat sx={{ fontSize: iconSize * 0.8 }} />
        )}
      </IconButton>
    </Box>
  );
}
