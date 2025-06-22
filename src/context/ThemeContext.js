'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('light');

  useEffect(() => {
    const storedMode = localStorage.getItem('theme');
    if (storedMode) {
      setMode(storedMode);
    } else {
      const prefersDarkMode = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      setMode(prefersDarkMode ? 'dark' : 'light');
    }
  }, []);

  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newMode);
      return newMode;
    });
  };

  const baseThemeOptions = {
    shape: {
      borderRadius: 16,
    },
    typography: {
      fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif',
      h5: { fontWeight: 700 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            backdropFilter: 'blur(6px)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            fontWeight: 600,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            borderRadius: '0 0 16px 16px',
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              backgroundColor:
                mode === 'light'
                  ? 'rgba(255,255,255,0.3)'
                  : 'rgba(50,50,50,0.7)',
            },
            '&:hover': {
              backgroundColor:
                mode === 'light'
                  ? 'rgba(255,255,255,0.5)'
                  : 'rgba(50,50,50,0.5)',
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            backgroundColor:
              mode === 'light' ? 'rgba(255,255,255,0.6)' : 'rgba(30,30,30,0.6)',
            backdropFilter: 'blur(6px)',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 20,
            backgroundColor:
              mode === 'light' ? 'rgba(255,255,255,0.6)' : 'rgba(30,30,30,0.6)',
            backdropFilter: 'blur(6px)',
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            margin: '8px 0',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            '&::before': {
              display: 'none',
            },
          },
        },
      },
      MuiFormControlLabel: {
        styleOverrides: {
          root: {
            margin: 0, // Set default margin to 0
          },
        },
      },
    },
  };

  const theme = createTheme({
    ...baseThemeOptions,
    palette:
      mode === 'light'
        ? {
            mode: 'light',
            primary: { main: '#FF7043' },
            secondary: { main: '#FFD54F' },
            background: {
              default: '#FFF8E1',
              paper: 'rgba(255, 255, 255, 0.9)',
            },
            text: {
              primary: '#3E2723',
              secondary: '#6D4C41',
            },
          }
        : {
            mode: 'dark',
            primary: { main: '#FF8A65' },
            secondary: { main: '#FFE082' },
            background: {
              default: '#1E1E1E',
              paper: 'rgba(50, 50, 50, 0.5)',
            },
            text: {
              primary: '#E0E0E0',
              secondary: '#B0BEC5',
            },
          },
  });

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
