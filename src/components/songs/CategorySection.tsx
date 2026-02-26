import { memo } from 'react';
import { Box, Typography, Button } from '@mui/material';
import type { Song } from '../../types/song';
import SongCard from './SongCard';
import { SongCardSkeleton } from '../common/SkeletonLoading';

interface CategorySectionProps {
  title: string;
  subtitle?: string;
  songs: Song[];
  loading?: boolean;
  onSongClick: (song: Song, songs: Song[]) => void;
  onSeeAll?: () => void;
  cardWidth?: number;
}

export default memo(function CategorySection({
  title,
  subtitle,
  songs,
  loading,
  onSongClick,
  onSeeAll,
  cardWidth = 160,
}: CategorySectionProps) {
  if (!loading && songs.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, mb: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {onSeeAll && (
          <Button size="small" onClick={onSeeAll} sx={{ textTransform: 'none' }}>
            See all
          </Button>
        )}
      </Box>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          px: 2,
          pb: 1,
          scrollSnapType: 'x mandatory',
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
        }}
      >
        {loading ? (
          <SongCardSkeleton count={5} />
        ) : (
          songs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              onClick={(s) => onSongClick(s, songs)}
              width={cardWidth}
            />
          ))
        )}
      </Box>
    </Box>
  );
});
