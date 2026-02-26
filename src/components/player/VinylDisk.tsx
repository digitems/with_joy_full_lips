import { Box } from '@mui/material';
import { MusicNote } from '@mui/icons-material';
import * as colors from '../../theme/colors';

interface VinylDiskProps {
  coverUrl?: string;
  isPlaying: boolean;
  size?: number;
  rotationDuration?: number;
}

export default function VinylDisk({ coverUrl, isPlaying, size = 240, rotationDuration = 20 }: VinylDiskProps) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: `0 8px 32px rgba(0,0,0,0.4)`,
        animation: isPlaying ? `spin ${rotationDuration}s linear infinite` : 'none',
        '@keyframes spin': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      }}
    >
      {coverUrl ? (
        <Box
          component="img"
          src={coverUrl}
          alt="Album art"
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
          <MusicNote sx={{ fontSize: size * 0.4, color: colors.playerAccent }} />
        </Box>
      )}
      {/* Center hole */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: size * 0.15,
          height: size * 0.15,
          borderRadius: '50%',
          bgcolor: 'background.default',
          border: `2px solid ${colors.playerAccent}`,
        }}
      />
    </Box>
  );
}
