'use client';

import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Button, Avatar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LeftDrawer from './LeftDrawer';
import ProfileDrawer from './ProfileDrawer';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

const getPageTitle = (pathname) => {
  const titles = {
    '/': 'Home',
    '/dashboard': 'Dashboard',
    '/auth/login': 'Login',
    '/settings': 'Settings',
    '/profile': 'Profile',
  };

  return titles[pathname] || 'Do I Deserve It'; // Default title
};

export default function CustomAppBar() {
  const { user, login } = useAuth();
  const pathname = usePathname();
  const [title, setTitle] = useState('Do I Deserve It'); // Fallback title for SSR
  const [isLeftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [isProfileDrawerOpen, setProfileDrawerOpen] = useState(false);

  // Update the title dynamically on the client side
  useEffect(() => {
    if (pathname) {
      setTitle(getPageTitle(pathname));
    }
  }, [pathname]);

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {/* Left Drawer Button */}
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setLeftDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>

          {/* Dynamic Title */}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>

          {/* Login Button or Profile Icon */}
          {user ? (
            <IconButton
              color="inherit"
              onClick={() => setProfileDrawerOpen(true)}
            >
              <Avatar
                src={user?.photoURL || ''} // Use user's profile picture if available
                alt={user?.displayName || 'User'}
                sx={{ width: 32, height: 32 }} // Adjust size as needed
              />
            </IconButton>
          ) : (
            <Button color="inherit" onClick={login}>
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Left Drawer */}
      <LeftDrawer
        open={isLeftDrawerOpen}
        onClose={() => setLeftDrawerOpen(false)}
      />

      {/* Profile Drawer */}
      <ProfileDrawer    
        open={isProfileDrawerOpen}
        onClose={() => setProfileDrawerOpen(false)}
      />
    </>
  );
}