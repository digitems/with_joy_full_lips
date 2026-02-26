import { memo } from 'react';
import { Box, Typography, Card, CardActionArea } from '@mui/material';
import { PlayArrow, ThumbUp, Star } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { MusicNote } from '@mui/icons-material';
import type { Song } from '../../types/song';
import { formatCount, formatRating } from '../../utils/formatters';
import * as colors from '../../theme/colors';

interface SongCardProps {
  song: Song;
  onClick: (song: Song) => void;
  width?: number;
}

export default memo(function SongCard({ song, onClick, width = 160 }: SongCardProps) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.15 }} style={{ flexShrink: 0, width, scrollSnapAlign: 'start' }}>
      <Card elevation={0} sx={{ bgcolor: 'transparent', borderRadius: 2 }}>
        <CardActionArea onClick={() => onClick(song)} sx={{ borderRadius: 2 }}>
          <Box sx={{ width, height: width, borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
            {song.coverImageUrl ? (
              <Box
                component="img"
                src={song.coverImageUrl}
                alt={song.title}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(135deg, ${colors.primaryGradientStart}, ${colors.primaryGradientEnd})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MusicNote sx={{ fontSize: width * 0.35, color: colors.playerAccent }} />
              </Box>
            )}
          </Box>
          <Box sx={{ p: 0.5, mt: 0.5 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {song.title}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {song.artist}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.25, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                <PlayArrow sx={{ fontSize: 12, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {formatCount(song.playCount)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                <ThumbUp sx={{ fontSize: 12, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {formatCount(song.likes)}
                </Typography>
              </Box>
              {song.averageRating > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                  <Star sx={{ fontSize: 12, color: colors.accentGold }} />
                  <Typography variant="caption" color="text.secondary">
                    {formatRating(song.averageRating)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </CardActionArea>
      </Card>
    </motion.div>
  );
});
