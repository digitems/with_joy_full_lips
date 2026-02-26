import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { songsApi } from '../api/songs';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { useAuth } from '../context/AuthContext';
import CategorySection from '../components/songs/CategorySection';
import SongListItem from '../components/songs/SongListItem';
import SearchBar from '../components/common/SearchBar';
import { SongListSkeleton } from '../components/common/SkeletonLoading';
import { getGreeting } from '../utils/greeting';
import { welcomeGradient } from '../theme/gradients';
import AdSlot from '../components/ads/AdSlot';
import SEOHead from '../components/common/SEOHead';
import type { Song } from '../types/song';

// Module-level cache — survives re-mounts, 5-minute TTL
const CACHE_TTL = 5 * 60 * 1000;
let homeCache: { trending: Song[]; mostLiked: Song[]; topRated: Song[]; newReleases: Song[]; fetchedAt: number } | null = null;

export default function HomePage() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { playSong, currentSong, isPlaying } = useAudioPlayer();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [trending, setTrending] = useState<Song[]>([]);
  const [mostLiked, setMostLiked] = useState<Song[]>([]);
  const [topRated, setTopRated] = useState<Song[]>([]);
  const [newReleases, setNewReleases] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (homeCache && Date.now() - homeCache.fetchedAt < CACHE_TTL) {
      setTrending(homeCache.trending);
      setMostLiked(homeCache.mostLiked);
      setTopRated(homeCache.topRated);
      setNewReleases(homeCache.newReleases);
      setLoading(false);
      return;
    }
    Promise.all([
      songsApi.getTrending({ limit: 15 }),
      songsApi.getMostLiked({ limit: 15 }),
      songsApi.getTopRated({ limit: 15 }),
      songsApi.getNewReleases({ limit: 15 }),
    ])
      .then(([t, ml, tr, nr]) => {
        const data = {
          trending: t.data.data || [],
          mostLiked: ml.data.data || [],
          topRated: tr.data.data || [],
          newReleases: nr.data.data || [],
          fetchedAt: Date.now(),
        };
        homeCache = data;
        setTrending(data.trending);
        setMostLiked(data.mostLiked);
        setTopRated(data.topRated);
        setNewReleases(data.newReleases);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = useCallback(
    async (query: string) => {
      if (!query) {
        setSearchResults([]);
        return;
      }
      setSearchLoading(true);
      try {
        const { data } = await songsApi.search(query);
        setSearchResults(data.data || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) handleSearch(searchQuery.trim());
      else setSearchResults([]);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  const handleSongClick = (song: Song, songs: Song[]) => {
    playSong(song, songs, songs.indexOf(song));
  };

  const cardWidth = isDesktop ? 200 : 160;

  return (
    <Box sx={{ pb: 2 }}>
      <SEOHead
        title="Home"
        description="Discover trending hymns, top-rated worship songs, and new releases. Stream your favorite gospel music with With Joyful Lips."
        canonicalPath="/"
      />
      {/* Welcome header */}
      <Box sx={{ background: welcomeGradient, px: 2, pt: 3, pb: 4 }}>
        <Typography variant="h5" color="#fff" fontWeight={700}>
          {getGreeting()}
          {user ? `, ${user.name.split(' ')[0]}` : ''}
        </Typography>
        <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ mb: 2 }}>
          What would you like to sing today?
        </Typography>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
        />
      </Box>

      {/* Search results */}
      {searchQuery.trim() ? (
        <Box sx={{ px: 1, py: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ px: 1, mb: 1 }}>
            Search Results
          </Typography>
          {searchLoading ? (
            <SongListSkeleton />
          ) : searchResults.length > 0 ? (
            searchResults.map((song) => (
              <SongListItem
                key={song.id}
                song={song}
                onClick={(s) => handleSongClick(s, searchResults)}
                isCurrentSong={currentSong?.id === song.id}
                isPlaying={currentSong?.id === song.id && isPlaying}
              />
            ))
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">No hymns found</Typography>
            </Box>
          )}
        </Box>
      ) : (
        <>
          <CategorySection
            title="Trending Now"
            subtitle="Most played this week"
            songs={trending}
            loading={loading}
            onSongClick={handleSongClick}
            cardWidth={cardWidth}
          />
          <CategorySection
            title="Most Liked"
            subtitle="Community favorites"
            songs={mostLiked}
            loading={loading}
            onSongClick={handleSongClick}
            cardWidth={cardWidth}
          />

          {/* In-feed ad — 300x250 medium rectangle between sections */}
          <AdSlot
            slotId={import.meta.env.VITE_AD_SLOT_INFEED as string}
            placement="infeed"
            format="rectangle"
            sx={{ mx: 2, mb: 1 }}
          />

          <CategorySection
            title="Top Rated"
            subtitle="Highest rated hymns"
            songs={topRated}
            loading={loading}
            onSongClick={handleSongClick}
            cardWidth={cardWidth}
          />
          <CategorySection
            title="Recently Added"
            subtitle="New hymns in the collection"
            songs={newReleases}
            loading={loading}
            onSongClick={handleSongClick}
            cardWidth={cardWidth}
          />
        </>
      )}
    </Box>
  );
}
