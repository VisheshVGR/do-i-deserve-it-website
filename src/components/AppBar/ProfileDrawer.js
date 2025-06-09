'use client';

import React from 'react';
import {
  Drawer,
  Avatar,
  Typography,
  Box,
  Button,
  Divider,
} from '@mui/material';
import { useAuth } from '@/context/AuthContext';

export default function ProfileDrawer({ open, onClose }) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onClose(); // Close the drawer after logout
  };

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { padding: 2, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 } }}
    >
      <Box textAlign="center">
        {/* User Avatar */}
        <Avatar
          src={user?.photoURL}
          alt={user?.displayName}
          sx={{ width: 80, height: 80, margin: '0 auto' }}
        />
        <Typography variant="h6" sx={{ marginTop: 2 }}>
          {user?.displayName || 'Anonymous'}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {user?.email}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          UID: {user?.uid}
        </Typography>
        <Divider sx={{ marginY: 2 }} />
        <Button variant="contained" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
    </Drawer>
  );
}