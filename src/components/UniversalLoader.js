'use client';

import React, { useState, useEffect } from 'react';
import { useLoader } from '@/context/LoaderContext';
import { Backdrop, CircularProgress, Box, Button, Typography, Fade } from '@mui/material';

export default function UniversalLoader() {
  const { open, hideLoader } = useLoader();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      {isClient && (
        <Backdrop
          open={open}
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 999,
            color: '#fff',
            backdropFilter: 'blur(6px)',
            backgroundColor: 'rgba(0,0,0,0.3)',
          }}
        >
          <Fade in={open} timeout={undefined} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
              <CircularProgress color="inherit" />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Loading...
              </Typography>
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                onClick={hideLoader}
                sx={{ mt: 1, color: '#fff', borderColor: '#fff' }}
              >
                Close Loader
              </Button>
            </Box>
          </Fade>
        </Backdrop>
      )}
    </>
  );
}