import { useState } from 'react';
import { Drawer, Box, Typography, TextField, Button, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { playlistGradients } from '../../theme/colors';
import { usePlaylists } from '../../context/PlaylistContext';

interface CreatePlaylistSheetProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (playlistId: string) => void;
}

export default function CreatePlaylistSheet({ open, onClose, onCreated }: CreatePlaylistSheetProps) {
  const { createPlaylist } = usePlaylists();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [colorIndex, setColorIndex] = useState(0);

  const handleCreate = async () => {
    if (!name.trim()) return;
    const pl = await createPlaylist(name.trim(), description.trim(), colorIndex);
    setName('');
    setDescription('');
    setColorIndex(0);
    onCreated?.(pl.id);
    onClose();
  };

  return (
    <Drawer anchor="bottom" open={open} onClose={onClose} PaperProps={{ sx: { borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '80vh' } }}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>New Playlist</Typography>
          <IconButton aria-label="Close" onClick={onClose}><Close /></IconButton>
        </Box>

        <TextField
          label="Playlist Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="dense"
          autoFocus
        />

        <TextField
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          margin="dense"
          multiline
          rows={2}
        />

        {/* Color picker */}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
          Choose a color
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {playlistGradients.map((gradient, idx) => (
            <Box
              key={idx}
              onClick={() => setColorIndex(idx)}
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
                cursor: 'pointer',
                border: idx === colorIndex ? '3px solid' : '3px solid transparent',
                borderColor: idx === colorIndex ? 'primary.main' : 'transparent',
                transition: 'border-color 0.2s',
              }}
            />
          ))}
        </Box>

        <Button
          variant="contained"
          fullWidth
          onClick={handleCreate}
          disabled={!name.trim()}
          sx={{ mt: 3, py: 1.2, borderRadius: 3 }}
        >
          Create Playlist
        </Button>
      </Box>
    </Drawer>
  );
}
