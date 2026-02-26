import { Card, CardActionArea, Typography, IconButton } from '@mui/material';
import { QueueMusic, Delete } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { playlistGradients } from '../../theme/colors';
import type { Playlist } from '../../utils/playlistDb';

interface PlaylistCardProps {
  playlist: Playlist;
  onClick: () => void;
  onDelete?: () => void;
}

export default function PlaylistCard({ playlist, onClick, onDelete }: PlaylistCardProps) {
  const gradient = playlistGradients[playlist.colorIndex % playlistGradients.length];

  return (
    <motion.div whileTap={{ scale: 0.95 }}>
      <Card elevation={2} sx={{ borderRadius: 3, position: 'relative' }}>
        <CardActionArea
          onClick={onClick}
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
          <Typography variant="subtitle1" color="#fff" fontWeight={700} noWrap sx={{ width: '100%' }}>
            {playlist.name}
          </Typography>
          <Typography variant="caption" color="rgba(255,255,255,0.7)">
            {playlist.songs.length} song{playlist.songs.length !== 1 ? 's' : ''}
          </Typography>
        </CardActionArea>
        {onDelete && (
          <IconButton
            aria-label={`Delete ${playlist.name}`}
            size="small"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
              color: 'rgba(255,255,255,0.7)',
              '&:hover': { color: '#fff', bgcolor: 'rgba(0,0,0,0.2)' },
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        )}
      </Card>
    </motion.div>
  );
}
