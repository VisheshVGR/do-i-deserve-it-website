'use client';

import withAuth from '@/utils/withAuth';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  MenuItem,
  CircularProgress,
  Divider,
} from '@mui/material';
import api from '@/utils/axios';
import { useLoader } from '@/context/LoaderContext';
import { useSnackbarUtils } from '@/context/SnackbarContext';
import { useAuth } from '@/context/AuthContext';

const TAG_OPTIONS = [
  { value: 'feedback', label: 'Feedback' },
  { value: 'bug', label: 'Bug' },
  { value: 'feature request', label: 'Feature Request' },
  { value: 'ui / ux issue', label: 'UI / UX Issue' },
];

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'in progress', label: 'In Progress' },
  { value: 'fixed', label: 'Fixed' },
  { value: 'need more info', label: 'Need More Info' },
];

const ADMIN_USER_UID = process.env.NEXT_PUBLIC_ADMIN_USER_UID || process.env.ADMIN_USER_UID;

function FeedbackForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { showLoader, hideLoader } = useLoader();
  const { notify } = useSnackbarUtils();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('feedback');
  const [status, setStatus] = useState('open');
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isAdmin = user?.uid === ADMIN_USER_UID;

  // Fetch feedback if editing
  useEffect(() => {
    if (!id) return;
    showLoader();
    api.get(`/feedback/${id}`)
      .then(res => {
        setTitle(res.data.title);
        setDescription(res.data.description || '');
        setTag(res.data.tag || 'feedback');
        setStatus(res.data.status || 'open');
      })
      .catch(() => notify('Failed to fetch feedback', 'error'))
      .finally(() => hideLoader());
  }, [id, showLoader, hideLoader, notify]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    showLoader();
    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        tag,
      };

      if (id) {
        await api.put(`/feedback/${id}`, payload);
        notify('Feedback updated!', 'success');
      } else {
        await api.post('/feedback', payload);
        notify('Feedback added!', 'success');
      }
      setTimeout(() => router.push('/feedback'), 700);
    } catch (err) {
      notify(err.response?.data?.error || 'Failed to save feedback', 'error');
    }
    setLoading(false);
    hideLoader();
  };

  const handleDelete = async () => {
    showLoader();
    setLoading(true);
    try {
      await api.delete(`/feedback/${id}`);
      notify('Feedback deleted!', 'success');
      setTimeout(() => router.push('/feedback'), 700);
    } catch (err) {
      notify(err.response?.data?.error || 'Failed to delete feedback', 'error');
    }
    setLoading(false);
    setConfirmOpen(false);
    hideLoader();
  };

  const handleStatusUpdate = async () => {
    setStatusLoading(true);
    showLoader();
    try {
      await api.patch(`/feedback/${id}/status`, { status });
      notify('Status updated!', 'success');
      setTimeout(() => router.push('/feedback'), 700);
    } catch (err) {
      notify(err.response?.data?.error || 'Failed to update status', 'error');
    }
    setStatusLoading(false);
    hideLoader();
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      paddingX: 2,
      maxWidth: 400,
      mx: 'auto',
      my: 6,
    }}>
      <form onSubmit={handleSubmit}>
        <Typography variant="h5" gutterBottom>
          {id ? 'Edit Feedback' : 'Add Feedback'}
        </Typography>
        <TextField
          label="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={4}
          margin="normal"
        />
        <TextField
          select
          label="Tag"
          value={tag}
          onChange={e => setTag(e.target.value)}
          fullWidth
          margin="normal"
        >
          {TAG_OPTIONS.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : id ? 'Update' : 'Add'}
          </Button>
          <Button
            variant="text"
            color="secondary"
            fullWidth
            disabled={loading}
            onClick={() => router.push('/feedback')}
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
              disabled={loading}
              onClick={() => setConfirmOpen(true)}
            >
              Delete
            </Button>
            {/* Admin-only status update */}
            {isAdmin && (
              <>
                <Divider sx={{ my: 3 }} />
                <TextField
                  select
                  label="Status"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  fullWidth
                  margin="normal"
                >
                  {STATUS_OPTIONS.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  variant="contained"
                  color="info"
                  fullWidth
                  sx={{ mt: 1 }}
                  onClick={handleStatusUpdate}
                  disabled={statusLoading}
                >
                  {statusLoading ? <CircularProgress size={24} /> : 'Update Status'}
                </Button>
              </>
            )}
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to delete this feedback? This action cannot be undone.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setConfirmOpen(false)} color="primary">
                  Cancel
                </Button>
                <Button onClick={handleDelete} color="error" variant="contained" disabled={loading}>
                  Delete
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </form>
    </Box>
  );
}

export default withAuth(FeedbackForm);