'use client';

import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import RightDrawer from './RightDrawer';
import ProfileDrawer from './ProfileDrawer';
import { usePathname } from 'next/navigation';

const getPageTitle = (pathname) => {
  const titles = {
    '/': 'Home',
    '/dashboard': 'Dashboard',
    '/settings': 'Settings',
    '/profile': 'Profile',
    '/target': 'Target',
    '/target/friends': 'Friends',
    '/target/report': 'Report',
    '/reminder': 'Reminder',
  };
  return titles[pathname] || 'Do I Deserve It';
};

export default function CustomAppBar() {
  const pathname = usePathname();
  const [isRightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [isProfileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const title = mounted ? getPageTitle(pathname) : '';

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            aria-label="menu"
            onClick={() => setRightDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <RightDrawer
        open={isRightDrawerOpen}
        onClose={() => setRightDrawerOpen(false)}
        onProfileClick={() => {
          setRightDrawerOpen(false);
          setProfileDrawerOpen(true);
        }}
      />
      <ProfileDrawer
        open={isProfileDrawerOpen}
        onClose={() => setProfileDrawerOpen(false)}
      />
    </>
  );
}