import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { AD_CONSENT_KEY, AD_CONSENT_EVENT } from './constants';

export default function AdConsentBanner() {
  const [visible, setVisible] = useState(
    () => !localStorage.getItem(AD_CONSENT_KEY),
  );

  if (!visible) return null;

  const respond = (choice: 'granted' | 'denied') => {
    localStorage.setItem(AD_CONSENT_KEY, choice);
    window.dispatchEvent(new Event(AD_CONSENT_EVENT));
    setVisible(false);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1400,
        bgcolor: '#3E2723',
        color: '#fff',
        px: { xs: 2, sm: 3 },
        py: 1.5,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 1.5,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.35)',
      }}
    >
      <Typography
        variant="body2"
        sx={{ flex: 1, fontSize: '0.85rem', lineHeight: 1.5 }}
      >
        We show small, non-intrusive ads to keep With Joyful Lips free. No audio
        or video ads — just static images that won't interrupt your listening.
      </Typography>
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          flexShrink: 0,
          justifyContent: 'flex-end',
        }}
      >
        <Button
          size="small"
          onClick={() => respond('denied')}
          sx={{
            color: 'rgba(255,255,255,0.7)',
            fontWeight: 600,
            textTransform: 'none',
          }}
        >
          Decline
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={() => respond('granted')}
          sx={{
            bgcolor: '#E3AD43',
            color: '#3E2723',
            fontWeight: 700,
            textTransform: 'none',
            '&:hover': { bgcolor: '#D4960A' },
          }}
        >
          Accept
        </Button>
      </Box>
    </Box>
  );
}
