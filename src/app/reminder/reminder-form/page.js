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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import api from '@/utils/axios';
import { useLoader } from '@/context/LoaderContext';
import { useSnackbarUtils } from '@/context/SnackbarContext';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function ReminderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { open, showLoader, hideLoader } = useLoader();
  const { notify } = useSnackbarUtils();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState(new Date());
  const [repeat, setRepeat] = useState('none');
  const [days, setDays] = useState([...DAYS]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Fetch reminder if editing
  useEffect(() => {
    if (!id) return;
    showLoader();
    api.get(`reminders/${id}`)
      .then(res => {
        setTitle(res.data.title);
        setDescription(res.data.description || '');
        setTime(new Date(res.data.time));
        setRepeat(res.data.repeat);
        setDays(res.data.days || [...DAYS]);
      })
      .catch(() => notify('Failed to fetch reminder', 'error'))
      .finally(() => hideLoader());
  }, [id, showLoader, hideLoader, notify]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    showLoader();
    try {
      const payload = {
        title,
        description,
        time: time.toISOString(),
        repeat,
        days: repeat === 'custom' ? days : undefined,
      };

      if (id) {
        await api.put(`reminders/${id}`, payload);
        notify('Reminder updated!', 'success');
      } else {
        await api.post('reminders', payload);
        notify('Reminder added!', 'success');
      }
      await new Promise(resolve => setTimeout(resolve, 500)); // Longer delay for loader visibility
      router.push('/reminder');
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay after navigation
      hideLoader();
    } catch (err) {
      notify(err.response?.data?.error || err.message || 'Failed to save reminder', 'error');
      hideLoader();
    }
  };

  const handleDelete = async () => {
    showLoader();
    try {
      await api.delete(`reminders/${id}`);
      notify('Reminder deleted!', 'success');
      await new Promise(resolve => setTimeout(resolve, 500)); // Longer delay for loader visibility
      setConfirmOpen(false);
      router.push('/reminder');
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay after navigation
      hideLoader();
    } catch (err) {
      notify(err.response?.data?.error || err.message || 'Failed to delete reminder', 'error');
      setConfirmOpen(false);
      hideLoader();
    }
  };

  const handleDayToggle = (day) => {
    if (repeat !== 'custom') return;
    setDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', my: 6 }}>
      <Typography variant="h5" gutterBottom>
        {id ? 'Edit Reminder' : 'Add Reminder'}
      </Typography>
      <form onSubmit={handleSubmit}>
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

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateTimePicker
            label="Reminder Time"
            value={time}
            onChange={setTime}
            renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
          />
        </LocalizationProvider>

        <FormControl fullWidth margin="normal">
          <InputLabel>Repeat</InputLabel>
          <Select
            value={repeat}
            label="Repeat"
            onChange={e => setRepeat(e.target.value)}
          >
            <MenuItem value="none">No repeat</MenuItem>
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="custom">Custom</MenuItem>
          </Select>
        </FormControl>

        {repeat === 'custom' && (
          <FormControl component="fieldset" margin="normal" sx={{ width: '100%' }}>
            <FormLabel component="legend">Days</FormLabel>
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              {DAYS.map(day => (
                <Button
                  key={day}
                  variant={days.includes(day) ? 'contained' : 'outlined'}
                  onClick={() => handleDayToggle(day)}
                  size="small"
                >
                  {day}
                </Button>
              ))}
            </Box>
          </FormControl>
        )}

        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
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
            variant="outlined"
            color="secondary"
            fullWidth
            disabled={open}
            onClick={() => router.push('/reminder')}
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
              Delete
            </Button>

            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to delete this reminder? This action cannot be undone.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
                <Button onClick={handleDelete} color="error" variant="contained">
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

export default withAuth(ReminderForm);