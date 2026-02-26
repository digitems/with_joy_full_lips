import { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Snackbar } from '@mui/material';
import { ArrowBack, FavoriteBorder } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../api/user';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import SongListItem from '../components/songs/SongListItem';
import { SongListSkeleton } from '../components/common/SkeletonLoading';
import { downloadSong } from '../utils/downloadSong';
import SEOHead from '../components/common/SEOHead';
import type { Song } from '../types/song';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { playSong, currentSong, isPlaying } = useAudioPlayer();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const handleDownload = async (song: Song) => {
    try {
      await downloadSong(song);
      setSnackbar('Download started');
    } catch {
      setSnackbar('Download failed');
    }
  };

  useEffect(() => {
    userApi
      .getFavorites({ limit: 50 })
      .then(({ data }) => setSongs(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ pb: 2 }}>
      <SEOHead title="My Favorites" noIndex />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
        <IconButton onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" fontWeight={700}>Favorites</Typography>
      </Box>

      {loading ? (
        <SongListSkeleton />
      ) : songs.length > 0 ? (
        songs.map((song) => (
          <SongListItem
            key={song.id}
            song={song}
            onClick={(s) => playSong(s, songs, songs.indexOf(s))}
            isCurrentSong={currentSong?.id === song.id}
            isPlaying={currentSong?.id === song.id && isPlaying}
            onDownload={handleDownload}
          />
        ))
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <FavoriteBorder sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">No favorites yet</Typography>
          <Typography variant="body2" color="text.disabled">
            Songs you mark as favorite will appear here
          </Typography>
        </Box>
      )}
      <Snackbar open={!!snackbar} autoHideDuration={3000} onClose={() => setSnackbar(null)} message={snackbar} />
    </Box>
  );
}
