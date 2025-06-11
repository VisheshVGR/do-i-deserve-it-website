'use client';

import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import RightDrawer from './RightDrawer';
import ProfileDrawer from './ProfileDrawer';
import { usePathname } from 'next/navigation';
import { routes } from '@/components/AppBar/RightDrawer'; // Import routes
import { ICON_MAP } from '@/utils/muiIcons'; // Import ICON_MAP

const getPageTitle = (pathname) => {
  const route = routes.find((route) => route.path === pathname);
  return route ? { label: route.label, icon: route.icon } : { label: 'Do I Deserve It', icon: null };
};

export default function CustomAppBar() {
  const pathname = usePathname();
  const [isRightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [isProfileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { label, icon } = mounted ? getPageTitle(pathname) : { label: '', icon: null };

  return (
    <>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'transparent', boxShadow: 0 }}>
        <Toolbar>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            {mounted && icon && (
              <Box sx={{ mr: 1, display: 'flex', alignItems: 'center'  }}>
                {React.cloneElement(icon, { style: { color: icon.props.sx?.color } })} {/* Clone and apply color */}
              </Box>
            )}
            <Typography variant="h6" color="inherit">
              {mounted ? label : ''}
            </Typography>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            aria-label="menu"
            onClick={() => setRightDrawerOpen(true)}
            sx={{backgroundColor: 'rgba(0,0,0,0.03)'}}
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