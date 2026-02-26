import { Box, Typography, IconButton, Button } from '@mui/material';
import { ArrowBack, PlayArrow, Shuffle, Delete } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { usePlaylists } from '../context/PlaylistContext';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import SongListItem from '../components/songs/SongListItem';
import { brandGradient } from '../theme/gradients';
import SEOHead from '../components/common/SEOHead';

export default function PlaylistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playlists, removePlaylist } = usePlaylists();
  const { playSong, setQueue, currentSong, isPlaying } = useAudioPlayer();

  const playlist = playlists.find((p) => p.id === id);

  if (!playlist) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography color="text.secondary">Playlist not found</Typography>
      </Box>
    );
  }

  const handlePlayAll = () => {
    if (playlist.songs.length > 0) setQueue(playlist.songs, 0);
  };

  const handleShuffle = () => {
    if (playlist.songs.length > 0) {
      const idx = Math.floor(Math.random() * playlist.songs.length);
      setQueue(playlist.songs, idx);
    }
  };

  const handleDelete = async () => {
    await removePlaylist(playlist.id);
    navigate('/playlists');
  };

  return (
    <Box sx={{ pb: 2 }}>
      <SEOHead title={playlist.name} noIndex />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
        <IconButton onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={700}>{playlist.name}</Typography>
          {playlist.description && (
            <Typography variant="caption" color="text.secondary">{playlist.description}</Typography>
          )}
        </Box>
        <IconButton aria-label={`Delete ${playlist.name} playlist`} color="error" onClick={handleDelete}>
          <Delete />
        </IconButton>
      </Box>

      {playlist.songs.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, px: 2, mb: 2 }}>
          <Button variant="contained" startIcon={<PlayArrow />} onClick={handlePlayAll} sx={{ borderRadius: 3, background: brandGradient }}>
            Play All
          </Button>
          <Button variant="outlined" startIcon={<Shuffle />} onClick={handleShuffle} sx={{ borderRadius: 3 }}>
            Shuffle
          </Button>
        </Box>
      )}

      {playlist.songs.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">No songs in this playlist</Typography>
        </Box>
      ) : (
        playlist.songs.map((song) => (
          <SongListItem
            key={song.id}
            song={song}
            onClick={(s) => playSong(s, playlist.songs, playlist.songs.indexOf(s))}
            isCurrentSong={currentSong?.id === song.id}
            isPlaying={currentSong?.id === song.id && isPlaying}
          />
        ))
      )}
    </Box>
  );
}
