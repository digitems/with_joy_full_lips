import { Box } from '@mui/material';
import { MusicNote, PlayArrow } from '@mui/icons-material';
import Equalizer from '../player/Equalizer';
import * as colors from '../../theme/colors';

interface SongCoverWithIndicatorProps {
  coverUrl?: string;
  isCurrentSong: boolean;
  isPlaying: boolean;
  size?: number;
}

export default function SongCoverWithIndicator({ coverUrl, isCurrentSong, isPlaying, size = 48 }: SongCoverWithIndicatorProps) {
  return (
    <Box sx={{ width: size, height: size, borderRadius: 1.5, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
      {coverUrl ? (
        <Box component="img" src={coverUrl} alt="" loading="lazy" decoding="async" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <Box sx={{
          width: '100%', height: '100%',
          background: `linear-gradient(135deg, ${colors.primaryGradientStart}, ${colors.primaryGradientEnd})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <MusicNote sx={{ color: colors.playerAccent, fontSize: size * 0.5 }} />
        </Box>
      )}
      {isCurrentSong && (
        <Box sx={{
          position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {isPlaying ? <Equalizer isPlaying height={16} /> : <PlayArrow sx={{ color: '#fff', fontSize: 20 }} />}
        </Box>
      )}
    </Box>
  );
}
