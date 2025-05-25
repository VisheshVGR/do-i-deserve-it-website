'use client';

import React, { createContext, useContext, useRef } from 'react';
import { SnackbarProvider, useSnackbar } from 'notistack';

const SnackbarContext = createContext();

export const SnackbarProviderWithUtils = ({ children }) => {
  const notistackRef = useRef();

  // Utility to show notification
  const notify = (message, variant = 'success') => {
    if (notistackRef.current) {
      notistackRef.current.enqueueSnackbar(message, { variant, preventDuplicate: true });
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