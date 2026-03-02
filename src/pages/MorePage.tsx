import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText, Switch, Divider, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { Info, Help, DarkMode, InstallDesktop, QueueMusic, Favorite, History, MusicNote, Campaign, PrivacyTip } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import SEOHead from '../components/common/SEOHead';

interface MorePageProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function MorePage({ darkMode, onToggleDarkMode }: MorePageProps) {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { isInstallable, promptInstall } = useInstallPrompt();
  const [snackbar, setSnackbar] = useState('');
  const [showAbout, setShowAbout] = useState(false);

  const handleInstall = async () => {
    const accepted = await promptInstall();
    setSnackbar(accepted ? 'App installed!' : 'Installation cancelled');
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      <SEOHead title="More" noIndex />
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        More
      </Typography>

      <List>
        {/* Quick links */}
        <ListItemButton onClick={() => navigate('/playlists')}>
          <ListItemIcon><QueueMusic /></ListItemIcon>
          <ListItemText primary="My Playlists" secondary="Manage your playlists" />
        </ListItemButton>

        <ListItemButton onClick={() => navigate('/favorites')}>
          <ListItemIcon><Favorite /></ListItemIcon>
          <ListItemText primary="Favorites" secondary="Your favorite hymns" />
        </ListItemButton>

        <ListItemButton onClick={() => navigate('/history')}>
          <ListItemIcon><History /></ListItemIcon>
          <ListItemText primary="Play History" secondary="Recently played" />
        </ListItemButton>

        <Divider sx={{ my: 1 }} />

        {/* Settings */}
        <ListItemButton onClick={onToggleDarkMode}>
          <ListItemIcon><DarkMode /></ListItemIcon>
          <ListItemText primary="Dark Mode" secondary="Toggle dark/light theme" />
          <Switch checked={darkMode} />
        </ListItemButton>

        {isInstallable && (
          <ListItemButton onClick={handleInstall}>
            <ListItemIcon><InstallDesktop /></ListItemIcon>
            <ListItemText primary="Install App" secondary="Add to home screen for quick access" />
          </ListItemButton>
        )}

        {/* Admin */}
        {authUser?.role === 'admin' && (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItemButton onClick={() => navigate('/admin/ads')}>
              <ListItemIcon><Campaign /></ListItemIcon>
              <ListItemText primary="Ad Manager" secondary="Manage ad campaigns and metrics" />
            </ListItemButton>
          </>
        )}

        <Divider sx={{ my: 1 }} />

        {/* Info */}
        <ListItemButton onClick={() => setShowAbout(true)}>
          <ListItemIcon><Info /></ListItemIcon>
          <ListItemText primary="About" secondary="With Joyful Lips v1.0.0 — Hymns for every moment" />
        </ListItemButton>

        <ListItemButton onClick={() => { window.location.href = 'mailto:anointtech@gmail.com?subject=WithJoyfulLips%20App%20Support'; }}>
          <ListItemIcon><Help /></ListItemIcon>
          <ListItemText primary="Help & Support" secondary="Get help with the app" />
        </ListItemButton>

        <ListItemButton onClick={() => navigate('/privacy')}>
          <ListItemIcon><PrivacyTip /></ListItemIcon>
          <ListItemText primary="Privacy Policy" secondary="How we handle your data" />
        </ListItemButton>
      </List>

      <Dialog open={showAbout} onClose={() => setShowAbout(false)}>
        <DialogTitle sx={{ textAlign: 'center' }}>
          <MusicNote sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
          <Typography variant="h6">With Joyful Lips</Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography variant="body1">Version 1.0.0</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Hymns for every moment — stream and enjoy your favorite hymns.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Made by AnointTech
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button onClick={() => setShowAbout(false)}>OK</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snackbar} autoHideDuration={3000} onClose={() => setSnackbar('')} message={snackbar} />
    </Box>
  );
}
