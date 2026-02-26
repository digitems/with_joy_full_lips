import { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Button, Snackbar } from '@mui/material';
import { ArrowBack, PlayArrow, Shuffle } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { categoriesApi } from '../api/categories';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import SongListItem from '../components/songs/SongListItem';
import SelectPlaylistSheet from '../components/playlist/SelectPlaylistSheet';
import RatingDialog from '../components/common/RatingDialog';
import AuthRequiredDialog from '../components/common/AuthRequiredDialog';
import { SongListSkeleton } from '../components/common/SkeletonLoading';
import { brandGradient } from '../theme/gradients';
import { useAuth } from '../context/AuthContext';
import { songsApi } from '../api/songs';
import SEOHead, { breadcrumbSchema } from '../components/common/SEOHead';
import type { Song } from '../types/song';

export default function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playSong, setQueue, currentSong, isPlaying, playNext, addToQueue } = useAudioPlayer();
  const { isAuthenticated } = useAuth();

  const [categoryName, setCategoryName] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [playlistSong, setPlaylistSong] = useState<Song | null>(null);
  const [ratingSong, setRatingSong] = useState<Song | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [snackbar, setSnackbar] = useState('');

  useEffect(() => {
    if (!id) return;
    categoriesApi
      .getSongs(id, { limit: 100 })
      .then(({ data }) => setSongs(data.data || []))
      .catch(() => {});

    categoriesApi
      .getDetails(id)
      .then(({ data }) => setCategoryName(data.data?.name || ''))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handlePlayAll = () => { if (songs.length > 0) setQueue(songs, 0); };
  const handleShuffle = () => {
    if (songs.length > 0) setQueue(songs, Math.floor(Math.random() * songs.length));
  };

  const handleRate = async (rating: number) => {
    if (!ratingSong) return;
    try {
      await songsApi.rateSong(ratingSong.id, rating);
      setSnackbar('Rating submitted');
    } catch { /* ignore */ }
    setRatingSong(null);
  };

  const requireAuth = (action: () => void) => {
    if (isAuthenticated) action();
    else setShowAuthDialog(true);
  };

  return (
    <Box sx={{ pb: 2 }}>
      <SEOHead
        title={categoryName || 'Category'}
        description={categoryName ? `Listen to ${categoryName} hymns — stream worship and praise songs in the ${categoryName} category.` : undefined}
        canonicalPath={id ? `/category/${id}` : undefined}
        jsonLd={categoryName ? breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Browse', path: '/browse' },
          { name: categoryName, path: `/category/${id}` },
        ]) : undefined}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
        <IconButton onClick={() => navigate(-1)} aria-label="Go back"><ArrowBack /></IconButton>
        <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>{categoryName}</Typography>
      </Box>

      {songs.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, px: 2, mb: 2 }}>
          <Button variant="contained" startIcon={<PlayArrow />} onClick={handlePlayAll} sx={{ borderRadius: 3, background: brandGradient }}>
            Play All
          </Button>
          <Button variant="outlined" startIcon={<Shuffle />} onClick={handleShuffle} sx={{ borderRadius: 3 }}>
            Shuffle
          </Button>
        </Box>
      )}

      {loading ? (
        <SongListSkeleton count={8} />
      ) : (
        songs.map((song) => (
          <SongListItem
            key={song.id}
            song={song}
            onClick={(s) => playSong(s, songs, songs.indexOf(s))}
            isCurrentSong={currentSong?.id === song.id}
            isPlaying={currentSong?.id === song.id && isPlaying}
            onPlayNext={(s) => { playNext(s); setSnackbar('Playing next'); }}
            onAddToQueue={(s) => { addToQueue(s); setSnackbar('Added to queue'); }}
            onAddToPlaylist={(s) => setPlaylistSong(s)}
            onRate={(s) => requireAuth(() => setRatingSong(s))}
          />
        ))
      )}

      <SelectPlaylistSheet open={!!playlistSong} onClose={() => setPlaylistSong(null)} song={playlistSong} />
      <RatingDialog open={!!ratingSong} onClose={() => setRatingSong(null)} onRate={handleRate} currentRating={ratingSong?.userRating} songTitle={ratingSong?.title || ''} />
      <AuthRequiredDialog open={showAuthDialog} onClose={() => setShowAuthDialog(false)} message="Sign in to rate hymns." />
      <Snackbar open={!!snackbar} autoHideDuration={2000} onClose={() => setSnackbar('')} message={snackbar} />
    </Box>
  );
}
