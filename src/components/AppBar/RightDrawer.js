'use client';

import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  Button,
  Avatar,
  Typography,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TargetIcon from '@mui/icons-material/TrackChanges';
import GroupIcon from '@mui/icons-material/Group';
import ReportIcon from '@mui/icons-material/Assessment';
import ReminderIcon from '@mui/icons-material/Notifications';
import StarIcon from '@mui/icons-material/Star';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SettingsIcon from '@mui/icons-material/Settings';
import { useThemeContext } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { pink, blue, green, orange, purple, yellow, deepOrange, teal } from '@mui/material/colors';

const routes = [
  { path: '/', label: 'Home', icon: <HomeIcon sx={{ color: blue[600] }} /> },
  { path: '/do-i-deserve-it', label: 'Do I Deserve It', icon: <StarIcon sx={{ color: yellow[700] }} /> },
  { path: '/target', label: 'Target', icon: <TargetIcon sx={{ color: orange[600] }} /> },
  { path: '/target/friends', label: 'Friends', icon: <GroupIcon sx={{ color: teal[500] }} />, nested: true },
  { path: '/target/report', label: 'Report', icon: <ReportIcon sx={{ color: purple[400] }} />, nested: true },
  { path: '/todo', label: 'Todo', icon: <CheckCircleIcon sx={{ color: green[600] }} /> },
  { path: '/reminder', label: 'Reminder', icon: <ReminderIcon sx={{ color: pink[400] }} /> },
];

export default function RightDrawer({ open, onClose, onProfileClick }) {
  const { mode, toggleTheme } = useThemeContext();
  const { user, login } = useAuth();
  const router = useRouter();

  const handleNavigation = (path) => {
    router.push(path);
    onClose();
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 250, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box>
          <List>
            {routes.map((route) => (
              <ListItem
                key={route.path}
                onClick={() => handleNavigation(route.path)}
                sx={{
                  pl: route.nested ? 4 : 2,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  '&:hover': {
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(0,0,0,0.06)',
                  },
                }}
              >
                <ListItemIcon>{route.icon}</ListItemIcon>
                <ListItemText primary={route.label} />
              </ListItem>
            ))}
          </List>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Box>
          <Divider sx={{ mb: 1 }} />
          {/* Login/Profile */}
          {!user ? (
            <ListItem
              
              onClick={() => { login(); onClose(); }}
                sx={{
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  '&:hover': {
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(0,0,0,0.06)',
                  },
                }}
            >
              <ListItemIcon>
                <Avatar sx={{ width: 28, height: 28 }} />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
          ) : (
            <ListItem
              
              onClick={() => {
                if (onProfileClick) onProfileClick();
                onClose();
              }}
                sx={{
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  '&:hover': {
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(0,0,0,0.06)',
                  },
                }}
            >
              <ListItemIcon>
                <Avatar src={user.photoURL || ''} alt={user.displayName || 'User'} sx={{ width: 28, height: 28 }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle1">
                    {user.displayName?.split(' ')[0] || 'User'}
                  </Typography>
                }
              />
            </ListItem>
          )}
          {/* Settings */}
          <ListItem
            
            onClick={() => { handleNavigation('/'); }}
                sx={{
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  '&:hover': {
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(0,0,0,0.06)',
                  },
                }}
          >
            <ListItemIcon>
              <SettingsIcon sx={{ color: deepOrange[400] }} />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
          {/* Theme Switch */}
          <ListItem
            
            onClick={toggleTheme}
                sx={{
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  '&:hover': {
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.4)'
                        : 'rgba(0,0,0,0.4)',
                  },
                }}
          >
            <ListItemIcon>
              {mode === 'dark'
                ? <Brightness7Icon sx={{ color: yellow[700] }} />
                : <Brightness4Icon sx={{ color: blue[800] }} />}
            </ListItemIcon>
            <ListItemText primary={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} Mode`} />
          </ListItem>
        </Box>
      </Box>
    </Drawer>
  );
}