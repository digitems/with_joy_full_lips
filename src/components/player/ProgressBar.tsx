import { Box, Slider, Typography } from '@mui/material';
import { formatDuration } from '../../utils/formatters';
import * as colors from '../../theme/colors';

interface ProgressBarProps {
  currentPosition: number;
  duration: number;
  onSeek: (position: number) => void;
  light?: boolean;
}

export default function ProgressBar({ currentPosition, duration, onSeek, light }: ProgressBarProps) {
  return (
    <Box sx={{ width: '100%', px: 1 }}>
      <Slider
        value={duration > 0 ? currentPosition : 0}
        max={duration || 100}
        onChange={(_, val) => onSeek(val as number)}
        sx={{
          color: colors.playerAccent,
          height: 4,
          '& .MuiSlider-thumb': {
            width: 14,
            height: 14,
            bgcolor: '#fff',
            '&:hover, &.Mui-focusVisible': { boxShadow: `0 0 0 8px rgba(227,173,67,0.16)` },
          },
          '& .MuiSlider-rail': { opacity: 0.3, bgcolor: light ? '#fff' : undefined },
        }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: -0.5 }}>
        <Typography variant="caption" color={light ? '#ccc' : 'text.secondary'}>
          {formatDuration(currentPosition)}
        </Typography>
        <Typography variant="caption" color={light ? '#ccc' : 'text.secondary'}>
          {formatDuration(duration)}
        </Typography>
      </Box>
    </Box>
  );
}
