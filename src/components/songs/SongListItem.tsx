import { useState, memo } from 'react';
import { Box, Typography, ListItemButton, IconButton, Menu, MenuItem, ListItemIcon as MuiListItemIcon, ListItemText as MuiListItemText, Chip } from '@mui/material';
import { PlayArrow, MusicNote, MoreVert, SkipNext, QueueMusic, PlaylistAdd, Share, Star, Download } from '@mui/icons-material';
import type { Song } from '../../types/song';
import { formatDuration } from '../../utils/formatters';
import Equalizer from '../player/Equalizer';
import * as colors from '../../theme/colors';

interface SongListItemProps {
  song: Song;
  onClick: (song: Song) => void;
  isCurrentSong?: boolean;
  isPlaying?: boolean;
  index?: number;
  onPlayNext?: (song: Song) => void;
  onAddToQueue?: (song: Song) => void;
  onAddToPlaylist?: (song: Song) => void;
  onRate?: (song: Song) => void;
  onDownload?: (song: Song) => void;
}

export default memo(function SongListItem({
  song, onClick, isCurrentSong, isPlaying,
  onPlayNext, onAddToQueue, onAddToPlaylist, onRate, onDownload,
}: SongListItemProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const hasMenu = onPlayNext || onAddToQueue || onAddToPlaylist || onRate || onDownload;

  const handleShare = async () => {
    setAnchorEl(null);
    if (navigator.share) {
      try {
        await navigator.share({ title: song.title, text: `Listen to "${song.title}" by ${song.artist}` });
      } catch { /* cancelled */ }
    }
  };

  return (
    <ListItemButton
      onClick={() => onClick(song)}
      sx={{ borderRadius: 2, mx: 1, gap: 1.5, bgcolor: isCurrentSong ? 'action.selected' : 'transparent' }}
    >
      {/* Thumbnail */}
      <Box sx={{ width: 48, height: 48, borderRadius: 1.5, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
        {song.coverImageUrl ? (
          <Box component="img" src={song.coverImageUrl} alt={song.title} loading="lazy" decoding="async" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Box sx={{
            width: '100%', height: '100%',
            background: `linear-gradient(135deg, ${colors.primaryGradientStart}, ${colors.primaryGradientEnd})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <MusicNote sx={{ color: colors.playerAccent }} />
          </Box>
        )}
        {isCurrentSong && (
          <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isPlaying ? <Equalizer isPlaying height={16} /> : <PlayArrow sx={{ color: '#fff', fontSize: 20 }} />}
          </Box>
        )}
      </Box>

      {/* Song info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600} noWrap color={isCurrentSong ? 'primary.main' : 'text.primary'}>
          {song.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {song.artist}
        </Typography>
      </Box>

      {/* Play/Download count badges */}
      {song.userPlayCount && song.userPlayCount > 1 && (
        <Chip
          icon={<PlayArrow sx={{ fontSize: 14 }} />}
          label={`${song.userPlayCount}x`}
          size="small"
          variant="outlined"
          color="primary"
          sx={{ height: 22, '& .MuiChip-label': { px: 0.5, fontSize: '0.7rem' }, '& .MuiChip-icon': { ml: 0.5 } }}
        />
      )}
      {song.userDownloadCount && song.userDownloadCount > 1 && (
        <Chip
          icon={<Download sx={{ fontSize: 14 }} />}
          label={`${song.userDownloadCount}x`}
          size="small"
          variant="outlined"
          color="secondary"
          sx={{ height: 22, '& .MuiChip-label': { px: 0.5, fontSize: '0.7rem' }, '& .MuiChip-icon': { ml: 0.5 } }}
        />
      )}

      {/* Duration */}
      <Typography variant="caption" color="text.secondary">
        {formatDuration(song.duration)}
      </Typography>

      {/* More menu */}
      {hasMenu && (
        <>
          <IconButton
            size="small"
            aria-label={`More options for ${song.title}`}
            onClick={(e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); }}
            sx={{ color: 'text.secondary' }}
          >
            <MoreVert fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={(e: React.SyntheticEvent) => { e.stopPropagation?.(); setAnchorEl(null); }}
            onClick={(e) => e.stopPropagation()}
          >
            {onPlayNext && (
              <MenuItem onClick={() => { setAnchorEl(null); onPlayNext(song); }}>
                <MuiListItemIcon><SkipNext fontSize="small" /></MuiListItemIcon>
                <MuiListItemText>Play Next</MuiListItemText>
              </MenuItem>
            )}
            {onAddToQueue && (
              <MenuItem onClick={() => { setAnchorEl(null); onAddToQueue(song); }}>
                <MuiListItemIcon><QueueMusic fontSize="small" /></MuiListItemIcon>
                <MuiListItemText>Add to Queue</MuiListItemText>
              </MenuItem>
            )}
            {onAddToPlaylist && (
              <MenuItem onClick={() => { setAnchorEl(null); onAddToPlaylist(song); }}>
                <MuiListItemIcon><PlaylistAdd fontSize="small" /></MuiListItemIcon>
                <MuiListItemText>Add to Playlist</MuiListItemText>
              </MenuItem>
            )}
            {onRate && (
              <MenuItem onClick={() => { setAnchorEl(null); onRate(song); }}>
                <MuiListItemIcon><Star fontSize="small" /></MuiListItemIcon>
                <MuiListItemText>Rate</MuiListItemText>
              </MenuItem>
            )}
            {onDownload && (
              <MenuItem onClick={() => { setAnchorEl(null); onDownload(song); }}>
                <MuiListItemIcon><Download fontSize="small" /></MuiListItemIcon>
                <MuiListItemText>Download</MuiListItemText>
              </MenuItem>
            )}
            <MenuItem onClick={handleShare}>
              <MuiListItemIcon><Share fontSize="small" /></MuiListItemIcon>
              <MuiListItemText>Share</MuiListItemText>
            </MenuItem>
          </Menu>
        </>
      )}
    </ListItemButton>
  );
});
