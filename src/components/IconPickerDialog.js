'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Box,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ICON_MAP, ICON_NAMES } from '@/utils/muiIcons';

export default function IconPickerDialog({ open, onClose, onSelect, value }) {
  const [search, setSearch] = useState('');

  // Show all icons if search is empty, otherwise filter
  let filteredIcons = [];
  if (!search.trim()) {
    filteredIcons = ICON_NAMES;
  } else {
    try {
      const regex = new RegExp(search.trim(), 'i');
      filteredIcons = ICON_NAMES.filter(name => regex.test(name));
    } catch {
      filteredIcons = [];
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Select an Icon</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            label="Search icons"
            value={search}
            onChange={e => setSearch(e.target.value)}
            fullWidth
          />
          <Button
            variant={search.trim() ? 'contained' : 'outlined'}
            onClick={() => {}}
            sx={{ minWidth: 40, px: 1 }}
            tabIndex={-1}
            disabled
          >
            <SearchIcon />
          </Button>
        </Box>
        <Box
          sx={{
            maxHeight: 400,
            minHeight: 400,
            overflowY: 'auto',
            mt: 2,
            transition: 'min-height 0.2s',
          }}
        >
          <Grid container spacing={2}>
            {filteredIcons.length === 0 ? (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" align="center">
                  No icons found.
                </Typography>
              </Grid>
            ) : (
              filteredIcons.map((iconName) => {
                const IconComp = ICON_MAP[iconName];
                return (
                  <Grid item xs={2} sm={1} key={iconName}>
                    <Button
                      variant={value === iconName ? 'contained' : 'outlined'}
                      onClick={() => {
                        onSelect(iconName);
                        onClose();
                      }}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                        minHeight: 64,
                      }}
                    >
                      <IconComp fontSize="medium" />
                      <Typography variant="caption" sx={{ mt: 0.5 }}>
                        {iconName}
                      </Typography>
                    </Button>
                  </Grid>
                );
              })
            )}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}