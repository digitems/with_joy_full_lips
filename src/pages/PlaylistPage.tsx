import { useState } from 'react';
import { Box, Typography, Card, CardActionArea, Fab, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { Add, QueueMusic } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePlaylists } from '../context/PlaylistContext';
import { playlistGradients } from '../theme/colors';
import SEOHead from '../components/common/SEOHead';

export default function PlaylistPage() {
  const navigate = useNavigate();
  const { playlists, createPlaylist } = usePlaylists();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return;
    const colorIdx = Math.floor(Math.random() * playlistGradients.length);
    await createPlaylist(name.trim(), desc.trim(), colorIdx);
    setName('');
    setDesc('');
    setShowCreate(false);
  };

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <SEOHead title="My Playlists" noIndex />
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        My Playlists
      </Typography>

      {playlists.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <QueueMusic sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">No playlists yet</Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
            Create a playlist to organize your favorite hymns
          </Typography>
          <Button variant="contained" onClick={() => setShowCreate(true)}>Create Playlist</Button>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 2 }}>
          {playlists.map((pl) => {
            const gradient = playlistGradients[pl.colorIndex % playlistGradients.length];
            return (
              <motion.div key={pl.id} whileTap={{ scale: 0.95 }}>
                <Card elevation={2} sx={{ borderRadius: 3 }}>
                  <CardActionArea
                    onClick={() => navigate(`/playlist/${pl.id}`)}
                    sx={{
                      background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
                      p: 2,
                      minHeight: 100,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <QueueMusic sx={{ color: 'rgba(255,255,255,0.7)', mb: 0.5 }} />
                    <Typography variant="subtitle1" color="#fff" fontWeight={700} noWrap>{pl.name}</Typography>
                    <Typography variant="caption" color="rgba(255,255,255,0.7)">
                      {pl.songs.length} song{pl.songs.length !== 1 ? 's' : ''}
                    </Typography>
                  </CardActionArea>
                </Card>
              </motion.div>
            );
          })}
        </Box>
      )}

      <Fab
        color="primary"
        onClick={() => setShowCreate(true)}
        sx={{ position: 'fixed', bottom: 80, right: 16 }}
      >
        <Add />
      </Fab>

      <Dialog open={showCreate} onClose={() => setShowCreate(false)} maxWidth="xs" fullWidth>
        <DialogTitle>New Playlist</DialogTitle>
        <DialogContent>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth margin="dense" />
          <TextField label="Description" value={desc} onChange={(e) => setDesc(e.target.value)} fullWidth margin="dense" multiline rows={2} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreate(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={!name.trim()}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
