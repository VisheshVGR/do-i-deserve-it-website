'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

const LoaderContext = createContext();

export const LoaderProvider = ({ children }) => {
  const [open, setOpen] = useState(false);

  const showLoader = useCallback(() => setOpen(true), []);
  const hideLoader = useCallback(() => setOpen(false), []);

  return (
    <LoaderContext.Provider value={{ open, showLoader, hideLoader }}>
      {children}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => useContext(LoaderContext);