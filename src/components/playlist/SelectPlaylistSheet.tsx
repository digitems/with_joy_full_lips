import { useState } from 'react';
import { Drawer, Box, Typography, List, ListItemButton, ListItemIcon, ListItemText, IconButton, Button } from '@mui/material';
import { Close, QueueMusic, Add } from '@mui/icons-material';
import { usePlaylists } from '../../context/PlaylistContext';
import { playlistGradients } from '../../theme/colors';
import CreatePlaylistSheet from './CreatePlaylistSheet';
import type { Song } from '../../types/song';

interface SelectPlaylistSheetProps {
  open: boolean;
  onClose: () => void;
  song: Song | null;
}

export default function SelectPlaylistSheet({ open, onClose, song }: SelectPlaylistSheetProps) {
  const { playlists, addSongToPlaylist } = usePlaylists();
  const [showCreate, setShowCreate] = useState(false);

  const handleSelect = async (playlistId: string) => {
    if (!song) return;
    await addSongToPlaylist(playlistId, song);
    onClose();
  };

  return (
    <>
      <Drawer anchor="bottom" open={open} onClose={onClose} PaperProps={{ sx: { borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '70vh' } }}>
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" fontWeight={700}>Add to Playlist</Typography>
            <IconButton aria-label="Close" onClick={onClose}><Close /></IconButton>
          </Box>

          {song && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} noWrap>
              {song.title} — {song.artist}
            </Typography>
          )}

          <Button
            startIcon={<Add />}
            onClick={() => setShowCreate(true)}
            fullWidth
            variant="outlined"
            sx={{ mb: 1, borderRadius: 3 }}
          >
            Create New Playlist
          </Button>

          <List>
            {playlists.map((pl) => {
              const gradient = playlistGradients[pl.colorIndex % playlistGradients.length];
              const alreadyAdded = song ? pl.songs.some((s) => s.id === song.id) : false;
              return (
                <ListItemButton
                  key={pl.id}
                  onClick={() => handleSelect(pl.id)}
                  disabled={alreadyAdded}
                  sx={{ borderRadius: 2 }}
                >
                  <ListItemIcon>
                    <Box sx={{
                      width: 40, height: 40, borderRadius: 1.5,
                      background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <QueueMusic sx={{ color: '#fff', fontSize: 20 }} />
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={pl.name}
                    secondary={alreadyAdded ? 'Already added' : `${pl.songs.length} songs`}
                  />
                </ListItemButton>
              );
            })}
          </List>

          {playlists.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
              No playlists yet. Create one first!
            </Typography>
          )}
        </Box>
      </Drawer>

      <CreatePlaylistSheet
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(id) => { if (song) handleSelect(id); }}
      />
    </>
  );
}
