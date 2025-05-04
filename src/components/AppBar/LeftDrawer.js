'use client';

import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TargetIcon from '@mui/icons-material/TrackChanges';
import ReportIcon from '@mui/icons-material/Assessment';
import ReminderIcon from '@mui/icons-material/Notifications';
import StarIcon from '@mui/icons-material/Star';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useThemeContext } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';

const routes = [
  { path: '/', label: 'Home', icon: <HomeIcon /> },
  { path: '/todo', label: 'Todo', icon: <CheckCircleIcon /> },
  { path: '/target', label: 'Target', icon: <TargetIcon /> },
  { path: '/target/report', label: 'Report', icon: <ReportIcon />, nested: true },
  { path: '/reminder', label: 'Reminder', icon: <ReminderIcon /> },
  { path: '/do-i-deserve-it', label: 'Do I Deserve It', icon: <StarIcon /> },
];

export default function LeftDrawer({ open, onClose }) {
  const { mode, toggleTheme } = useThemeContext();
  const router = useRouter();

  const handleNavigation = (path) => {
    router.push(path);
    onClose(); // Close the drawer after navigation
  };

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: 250 }}>
        <List>
          {routes.map((route) => (
            <ListItem
              button // Ensure this is a boolean
              key={route.path}
              onClick={() => handleNavigation(route.path)}
              sx={{
                pl: route.nested ? 4 : 2, // Indent nested routes
                cursor: 'pointer', // Change mouse pointer to cursor
              }}
            >
              <ListItemIcon>{route.icon}</ListItemIcon>
              <ListItemText primary={route.label} />
            </ListItem>
          ))}
          {/* Light/Dark Mode Toggle */}
          <ListItem
            button // Ensure this is a boolean
            onClick={toggleTheme}
            sx={{
              cursor: 'pointer', // Change mouse pointer to cursor
            }}
          >
            <ListItemIcon>
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </ListItemIcon>
            <ListItemText primary={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} Mode`} />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}