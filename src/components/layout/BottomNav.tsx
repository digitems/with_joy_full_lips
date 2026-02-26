import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Home, LibraryMusic, Person, MoreHoriz } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  { label: 'Home', icon: <Home />, path: '/' },
  { label: 'Browse', icon: <LibraryMusic />, path: '/browse' },
  { label: 'Profile', icon: <Person />, path: '/profile' },
  { label: 'More', icon: <MoreHoriz />, path: '/more' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentTab = tabs.findIndex((t) => t.path === location.pathname);

  return (
    <Paper
      elevation={8}
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1200 }}
    >
      <BottomNavigation
        value={currentTab >= 0 ? currentTab : 0}
        onChange={(_, idx) => navigate(tabs[idx].path)}
        showLabels
      >
        {tabs.map((tab) => (
          <BottomNavigationAction key={tab.path} label={tab.label} icon={tab.icon} />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
