'use client';

import withAuth from '@/utils/withAuth';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Typography, TextField, Button, Stack, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
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
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Fetch heading if editing
  useEffect(() => {
    if (!id) return;
    showLoader();
    api.get(`targetHeadings/${id}`)
      .then(res => setName(res.data.name))
      .catch(() => notify('Failed to fetch heading', 'error'))
      .finally(() => hideLoader());
  }, [id, showLoader, hideLoader, notify]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    showLoader();
    try {
      if (id) {
        await api.put(`targetHeadings/${id}`, { name });
        notify('Heading updated!', 'success');
      } else {
        await api.post('targetHeadings', { name });
        notify('Heading added!', 'success');
      }
      setTimeout(() => router.push('/target'), 700);
    } catch (err) {
      notify(err.response?.data?.error || err.message || 'Failed to save heading', 'error');
    }
    hideLoader();
  };

  const handleDelete = async () => {
    showLoader();
    try {
      await api.delete(`targetHeadings/${id}`);
      notify('Heading deleted!', 'success');
      setTimeout(() => router.push('/target'), 700);
    } catch (err) {
      notify(err.response?.data?.error || err.message || 'Failed to delete heading', 'error');
    }
    setConfirmOpen(false);
    hideLoader();
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 6 }}>
      <Typography variant="h5" gutterBottom>
        {id ? 'Edit Target Heading' : 'Add Target Heading'}
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
            onClick={() => router.push('/target')}
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