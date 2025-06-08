'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

const LoaderContext = createContext();

export const LoaderProvider = ({ children }) => {
  const [count, setCount] = useState(0);

  const showLoader = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  const hideLoader = useCallback(() => {
    setCount(prev => Math.max(0, prev - 1));
  }, []);

  return (
    <LoaderContext.Provider 
      value={{ 
        open: count > 0, 
        count,
        showLoader, 
        hideLoader 
      }}
    >
      {children}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => useContext(LoaderContext);