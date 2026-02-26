import { createTheme } from '@mui/material/styles';
import * as c from './colors';

const lightScheme = {
  primary: { main: c.primaryGradientStart, contrastText: '#FFFFFF' },
  secondary: { main: c.playerAccent, contrastText: '#3E2723' },
  error: { main: c.favoriteRed, contrastText: '#FFFFFF' },
  background: { default: c.lightMintSurface, paper: '#FFF5EB' },
  text: { primary: c.onSurface, secondary: c.onSurfaceVariant },
};

const darkScheme = {
  primary: { main: '#D7CCC8', contrastText: '#3E2723' },
  secondary: { main: '#FFD54F', contrastText: '#4E342E' },
  error: { main: '#F2B8B5', contrastText: '#601410' },
  background: { default: c.playerDark1, paper: c.darkSurface },
  text: { primary: c.darkOnSurface, secondary: c.darkOnSurfaceVariant },
};

export function createAppTheme(mode: 'light' | 'dark') {
  const palette = mode === 'dark' ? darkScheme : lightScheme;

  return createTheme({
    palette: {
      mode,
      ...palette,
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h5: { fontWeight: 700 },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 500 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', borderRadius: 24, fontWeight: 600 },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: { borderRadius: 16 },
        },
      },
      MuiBottomNavigation: {
        styleOverrides: {
          root: {
            background: mode === 'dark' ? c.darkSurfaceAlt : '#FFF5EB',
            borderTop: `1px solid ${mode === 'dark' ? c.darkSurfaceVariantAlt : c.surfaceVariant}`,
          },
        },
      },
      MuiBottomNavigationAction: {
        styleOverrides: {
          root: {
            color: mode === 'dark' ? c.darkOnSurfaceVariant : c.onSurfaceVariant,
            '&.Mui-selected': {
              color: mode === 'dark' ? '#FFD54F' : c.primaryGradientStart,
            },
          },
        },
      },
    },
  });
}
