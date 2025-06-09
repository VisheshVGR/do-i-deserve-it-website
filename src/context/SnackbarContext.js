'use client';

import React, { createContext, useContext, useRef } from 'react';
import { SnackbarProvider, useSnackbar } from 'notistack';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const SnackbarContext = createContext();

export const SnackbarProviderWithUtils = ({ children }) => {
  const notistackRef = useRef();

  // Utility to show notification
  const notify = (message, variant = 'success') => {
    if (notistackRef.current) {
      notistackRef.current.enqueueSnackbar(message, {
        variant,
        preventDuplicate: true,
        action: (key) => (
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={() => {
              notistackRef.current.closeSnackbar(key);
            }}
          >
            <CloseIcon />
          </IconButton>
        ),
        persist: false,
      });
    }
  };

  return (
    <SnackbarContext.Provider value={{ notify }}>
      <SnackbarProvider
        maxSnack={3}
        ref={notistackRef}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={3000}
      >
        {children}
      </SnackbarProvider>
    </SnackbarContext.Provider>
  );
};

export const useSnackbarUtils = () => useContext(SnackbarContext);