import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import * as colors from '../../theme/colors';

interface EqualizerProps {
  isPlaying: boolean;
  barCount?: number;
  height?: number;
}

const durations = [0.4, 0.55, 0.35];

export default function Equalizer({ isPlaying, barCount = 3, height = 20 }: EqualizerProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height }}>
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          animate={
            isPlaying
              ? { height: [height * 0.3, height, height * 0.3] }
              : { height: height * 0.3 }
          }
          transition={
            isPlaying
              ? { duration: durations[i % durations.length], repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }
              : { duration: 0.2 }
          }
          style={{
            width: 3,
            backgroundColor: colors.playerAccent,
            borderRadius: 1,
          }}
        />
      ))}
    </Box>
  );
}
