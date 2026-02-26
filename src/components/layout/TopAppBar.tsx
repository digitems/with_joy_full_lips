import { AppBar, Toolbar, Typography } from '@mui/material';
import { MusicNote } from '@mui/icons-material';
import * as colors from '../../theme/colors';

export default function TopAppBar() {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: `linear-gradient(135deg, ${colors.primaryGradientStart}, ${colors.primaryGradientEnd})`,
      }}
    >
      <Toolbar>
        <MusicNote sx={{ mr: 1, color: colors.playerAccent }} />
        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
          With Joyful Lips
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
