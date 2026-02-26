import { useState, useEffect } from 'react';
import { Snackbar, Alert, Box, Typography, Button } from '@mui/material';
import { WifiOff, CloudOff } from '@mui/icons-material';
import { motion } from 'framer-motion';

export function NoInternetBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <Snackbar open anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <Alert severity="warning" icon={<WifiOff />} sx={{ width: '100%' }}>
        No internet connection. Some features may not work.
      </Alert>
    </Snackbar>
  );
}

export function NoInternetScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '60vh', gap: 2, px: 3,
    }}>
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <CloudOff sx={{ fontSize: 80, color: 'text.disabled' }} />
      </motion.div>
      <Typography variant="h6" color="text.secondary" textAlign="center">
        No Internet Connection
      </Typography>
      <Typography variant="body2" color="text.disabled" textAlign="center">
        Check your connection and try again
      </Typography>
      <Button variant="contained" onClick={onRetry} sx={{ mt: 1, borderRadius: 3 }}>
        Retry
      </Button>
    </Box>
  );
}
