import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import AppLogo from '../components/common/AppLogo';
import * as colors from '../theme/colors';

const notes = ['♩', '♪', '♫', '♬', '♩', '♪', '♫', '♬'];

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 4000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: `linear-gradient(135deg, ${colors.playerAccent}, #D4960A, #1A2744)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Floating musical notes */}
      {notes.map((note, i) => (
        <motion.div
          key={i}
          initial={{
            x: (i % 4) * 100 - 150 + Math.random() * 40,
            y: 300,
            opacity: 0,
          }}
          animate={{
            y: -300,
            x: (i % 4) * 100 - 150 + Math.sin(i) * 60,
            opacity: [0, 0.7, 0.7, 0],
          }}
          transition={{
            duration: 3.5,
            delay: i * 0.4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            fontSize: 28 + Math.random() * 16,
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          {note}
        </motion.div>
      ))}

      {/* App icon */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'backOut' }}
      >
        <Box
          sx={{
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: colors.playerDark1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `3px solid #D4960A`,
            boxShadow: `0 0 40px rgba(227,173,67,0.4)`,
          }}
        >
          <AppLogo size={120} />
        </Box>
      </motion.div>

      {/* App name */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mt: 3, textAlign: 'center' }}>
          With Joyful Lips
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', mt: 1 }}>
          Hymns for every moment
        </Typography>
      </motion.div>
    </Box>
  );
}
