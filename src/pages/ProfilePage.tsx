import { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Button, Grid, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { Favorite, History, PlaylistPlay, Download, Edit } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/user';
import { brandGradient } from '../theme/gradients';
import SEOHead from '../components/common/SEOHead';
import type { UserStats } from '../types/user';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    userApi.getStats().then(({ data }) => setStats(data.data)).catch(() => {});
  }, [isAuthenticated]);

  if (!isAuthenticated || !user) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 2 }}>
        <Typography variant="h6" color="text.secondary">Sign in to view your profile</Typography>
        <Button variant="contained" onClick={() => navigate('/login')} sx={{ background: brandGradient }}>
          Sign In
        </Button>
      </Box>
    );
  }

  const handleUpdateProfile = async () => {
    if (!editName.trim()) return;
    try {
      await userApi.updateProfile({ name: editName.trim() });
      setShowEdit(false);
      window.location.reload(); // Refresh to get updated user
    } catch { /* ignore */ }
  };

  const statItems = [
    { label: 'Favorites', value: stats?.totalFavorites || 0, icon: <Favorite />, path: '/favorites' },
    { label: 'History', value: stats?.totalPlays || 0, icon: <History />, path: '/history' },
    { label: 'Ratings', value: stats?.totalRatings || 0, icon: <PlaylistPlay />, path: '/ratings' },
    { label: 'Downloads', value: stats?.totalDownloads || 0, icon: <Download />, path: '/downloads' },
  ];

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      <SEOHead title="My Profile" noIndex />
      {/* Avatar & info */}
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Avatar
          src={user.profileImage}
          sx={{ width: 120, height: 120, mx: 'auto', mb: 2, fontSize: 48, bgcolor: 'primary.main' }}
        >
          {user.name.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="h5" fontWeight={700}>{user.name}</Typography>
        <Typography variant="body2" color="text.secondary">{user.email}</Typography>
        <Button
          size="small"
          startIcon={<Edit />}
          onClick={() => { setEditName(user.name); setShowEdit(true); }}
          sx={{ mt: 1 }}
        >
          Edit Profile
        </Button>
      </Box>

      {/* Stats grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statItems.map((item) => (
          <Grid size={{ xs: 6 }} key={item.label}>
            <Paper
              elevation={0}
              onClick={() => item.path && navigate(item.path)}
              sx={{
                p: 2,
                textAlign: 'center',
                borderRadius: 3,
                bgcolor: 'background.paper',
                cursor: item.path ? 'pointer' : 'default',
                '&:hover': item.path ? { bgcolor: 'action.hover' } : {},
              }}
            >
              <Box sx={{ color: 'primary.main', mb: 0.5 }}>{item.icon}</Box>
              <Typography variant="h6" fontWeight={700}>{item.value}</Typography>
              <Typography variant="caption" color="text.secondary">{item.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Button
        variant="outlined"
        color="error"
        fullWidth
        onClick={async () => { await logout(); navigate('/'); }}
        sx={{ borderRadius: 3 }}
      >
        Sign Out
      </Button>

      {/* Edit dialog */}
      <Dialog open={showEdit} onClose={() => setShowEdit(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            fullWidth
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEdit(false)}>Cancel</Button>
          <Button onClick={handleUpdateProfile} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
