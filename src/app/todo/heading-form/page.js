'use client';

import withAuth from '@/utils/withAuth';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Typography, TextField, Button, Stack, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { ChromePicker } from 'react-color';
import api from '@/utils/axios';
import { useLoader } from '@/context/LoaderContext';
import { useSnackbarUtils } from '@/context/SnackbarContext';

function HeadingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { open, showLoader, hideLoader } = useLoader();
  const { notify } = useSnackbarUtils();

  const [name, setName] = useState('');
  const [color, setColor] = useState('#FF7043');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false); // Add this state

  // Fetch heading if editing
  useEffect(() => {
    if (!id) return;
    showLoader();
    api.get(`todoHeadings/${id}`)  // Changed from targetHeadings to todoHeadings
      .then(res => {
        setName(res.data.name);
        setColor(res.data.color || '#FF7043');
      })
      .catch(() => notify('Failed to fetch heading', 'error'))
      .finally(() => hideLoader());
  }, [id, showLoader, hideLoader, notify]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    showLoader();
    try {
      const payload = {
        name: name.trim(),
        color: color || undefined, // Use undefined for optional color
      };

      if (id) {
        await api.put(`todoHeadings/${id}`, payload);
        notify('Todo heading updated!', 'success');
      } else {
        await api.post('todoHeadings', payload);
        notify('Todo heading added!', 'success');
      }
      setTimeout(() => router.push('/todo'), 700);
    } catch (err) {
      notify(err.response?.data?.error || 'Failed to save heading', 'error');
    }
    hideLoader();
  };

  const handleDelete = async () => {
    showLoader();
    try {
      await api.delete(`todoHeadings/${id}`);  // Changed API endpoint
      notify('Todo heading deleted!', 'success');
      setTimeout(() => router.push('/todo'), 700);  // Changed redirect path
    } catch (err) {
      notify(err.response?.data?.error || err.message || 'Failed to delete heading', 'error');
    }
    setConfirmOpen(false);
    hideLoader();
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 6 }}>
      <Typography variant="h5" gutterBottom>
        {id ? 'Edit Todo Heading' : 'Add Todo Heading'}  {/* Changed text */}
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Heading Name"
          value={name}
          onChange={e => setName(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <Box sx={{ mt: 2, mb: 2, display: 'flex', alignItems: 'center' }}>
          <Typography variant="subtitle2" gutterBottom sx={{ mb: 0, pr: 1 }}>
            Heading Color
          </Typography>
          {/* Color circle next to text */}
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: color,
              border: '2px solid #ccc',
              cursor: 'pointer',
              ml: 2,
              display: 'inline-block',
            }}
            onClick={() => setPickerOpen(true)}
            title="Click to pick color"
          />
          {/* Color picker as popup dialog */}
          <Dialog open={pickerOpen} onClose={() => setPickerOpen(false)}>
            <DialogTitle>Pick a Color</DialogTitle>
            <DialogContent>
              <ChromePicker
                color={color}
                onChange={color => setColor(color.hex)}
                disableAlpha
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPickerOpen(false)} variant="outlined">
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={open}
            fullWidth
          >
            {id ? 'Update' : 'Add'}
          </Button>
          <Button
            variant="text"
            color="secondary"
            fullWidth
            disabled={open}
            onClick={() => router.push('/todo')}
          >
            Cancel
          </Button>
        </Stack>
        {id && (
          <>
            <Button
              variant="outlined"
              color="error"
              fullWidth
              sx={{ mt: 2 }}
              disabled={open}
              onClick={() => setConfirmOpen(true)}
            >
              {'Delete'}
            </Button>
            <Dialog
              open={confirmOpen}
              onClose={() => setConfirmOpen(false)}
            >
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to delete this heading? This action cannot be undone.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setConfirmOpen(false)} color="primary">
                  Cancel
                </Button>
                <Button onClick={handleDelete} color="error" variant="contained" disabled={open}>
                  {'Delete'}
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </form>
    </Box>
  );
}

export default withAuth(HeadingForm);