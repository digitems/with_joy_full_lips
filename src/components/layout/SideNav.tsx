import { Box, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Home, LibraryMusic, Person, MoreHoriz } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  { label: 'Home', icon: <Home />, path: '/' },
  { label: 'Browse', icon: <LibraryMusic />, path: '/browse' },
  { label: 'Profile', icon: <Person />, path: '/profile' },
  { label: 'More', icon: <MoreHoriz />, path: '/more' },
];

export default function SideNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        width: 80,
        flexShrink: 0,
        borderRight: 1,
        borderColor: 'divider',
        height: '100%',
        bgcolor: 'background.paper',
        pt: 1,
      }}
    >
      <List>
        {tabs.map((tab) => {
          const selected = location.pathname === tab.path;
          return (
            <ListItemButton
              key={tab.path}
              selected={selected}
              onClick={() => navigate(tab.path)}
              sx={{
                flexDirection: 'column',
                py: 1.5,
                px: 0.5,
                minHeight: 64,
                borderRadius: 2,
                mx: 0.5,
                mb: 0.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, color: selected ? 'primary.main' : 'text.secondary' }}>
                {tab.icon}
              </ListItemIcon>
              <ListItemText
                primary={tab.label}
                primaryTypographyProps={{
                  variant: 'caption',
                  textAlign: 'center',
                  color: selected ? 'primary.main' : 'text.secondary',
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
