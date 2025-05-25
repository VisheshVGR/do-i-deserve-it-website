'use client';

import withAuth from '@/utils/withAuth';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Switch
} from '@mui/material';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import api from '@/utils/axios';
import { useLoader } from '@/context/LoaderContext';
import { useSnackbarUtils } from '@/context/SnackbarContext';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function StepForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { open, showLoader, hideLoader } = useLoader();
  const { notify } = useSnackbarUtils();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('bool');
  const [days, setDays] = useState([...DAYS]);
  const [isPublic, setIsPublic] = useState(false);
  const [status, setStatus] = useState('active');
  const [targetHeadingId, setTargetHeadingId] = useState('');
  const [headings, setHeadings] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Fetch headings for dropdown
  useEffect(() => {
    showLoader();
    api.get('targetHeadings')
      .then(res => setHeadings(res.data))
      .catch(() => setHeadings([]))
      .finally(() => hideLoader());
  }, [showLoader, hideLoader]);

  // Fetch step if editing
  useEffect(() => {
    if (!id) return;
    showLoader();
    api.get(`targetSteps/${id}`)
      .then(res => {
        setTitle(res.data.title);
        setDescription(res.data.description);
        setType(res.data.type);
        setDays(res.data.days || []);
        setIsPublic(res.data.isPublic);
        setStatus(res.data.status);
        setTargetHeadingId(res.data.targetHeadingId || '');
      })
      .catch(() => notify('Failed to fetch step', 'error'))
      .finally(() => hideLoader());
  }, [id, showLoader, hideLoader, notify]);

  const handleDayToggle = (day) => {
    setDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleDetailsUpdate = async (e) => {
    e.preventDefault();
    showLoader();
    try {
      const payload = { title, description, type, days, isPublic, targetHeadingId: targetHeadingId || "" };
      if (id) {
        await api.put(`targetSteps/${id}`, payload);
        notify('Step details updated!', 'success');
      } else {
        await api.post('targetSteps', payload);
        notify('Step added!', 'success');
      }
      setTimeout(() => router.push('/target'), 700);
    } catch (err) {
      notify(err.response?.data?.error || err.message || 'Failed to save step', 'error');
    }
    hideLoader();
  };

  const handleDelete = async () => {
    showLoader();
    try {
      await api.delete(`targetSteps/${id}`);
      notify('Step deleted!', 'success');
      setTimeout(() => router.push('/target'), 700);
    } catch (err) {
      notify(err.response?.data?.error || err.message || 'Failed to delete step', 'error');
    }
    setConfirmOpen(false);
    hideLoader();
  };

  const handleStatusUpdate = async () => {
    showLoader();
    try {
      await api.patch(`targetSteps/${id}/status`, { status });
      notify('Status updated!', 'success');
      setTimeout(() => router.push('/target'), 700);
    } catch (err) {
      notify(err.response?.data?.error || err.message || 'Failed to update status', 'error');
    }
    hideLoader();
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', my: 6 }}>
      <Typography variant="h5" gutterBottom>
        {id ? 'Edit Target Step' : 'Add Target Step'}
      </Typography>
      <form onSubmit={handleDetailsUpdate}>
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
          margin="normal"
          multiline
          minRows={4}
          maxRows={8}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel id="heading-label">Heading</InputLabel>
          <Select
            labelId="heading-label"
            value={targetHeadingId}
            label="Heading"
            onChange={e => setTargetHeadingId(e.target.value)}
          >
            <MenuItem value="">None</MenuItem>
            {headings.map(h => (
              <MenuItem key={h.id} value={h.id}>{h.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* Type row: label left, radios right */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, mb: 2 }}>
          <FormLabel component="legend" sx={{ minWidth: 60, mr: 2 }}>Type</FormLabel>
          <RadioGroup
            row
            value={type}
            onChange={e => setType(e.target.value)}
            sx={{ ml: 1 }}
          >
            <FormControlLabel value="bool" control={<Radio />} label="Boolean" />
            <FormControlLabel value="count" control={<Radio />} label="Count" />
          </RadioGroup>
        </Box>
        {/* Days: wrap if overflow */}
        <FormControl component="fieldset" margin="normal" sx={{ width: '100%' }}>
          <FormLabel component="legend">Days (Kudos for attending on extra days)</FormLabel>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              mt: 1,
              width: '100%',
            }}
          >
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => {
              const short = day[0];
              const isSelected = days.includes(day.slice(0, 3));
              return (
                <Box
                  key={day}
                  onClick={() => handleDayToggle(day.slice(0, 3))}
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: isSelected ? 'success.main' : 'grey.300',
                    color: isSelected ? 'common.white' : 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 18,
                    userSelect: 'none',
                    transition: 'background 0.2s'
                  }}
                >
                  {short}
                </Box>
              );
            })}
          </Box>
        </FormControl>
        {/* Public switch: label left, switch right, on its own line */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3, mb: 1 }}>
          <FormLabel component="legend" sx={{ minWidth: 60, mr: 2 }}>Public (Friends can see Progress...)</FormLabel>
          <Switch
            checked={isPublic}
            onChange={e => setIsPublic(e.target.checked)}
            color="success"
          />
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
            onClick={() => router.push('/target')}
          >
            Cancel
          </Button>
        </Stack>
        {id && (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                value={status}
                label="Status"
                onChange={e => setStatus(e.target.value)}
                disabled={open}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              color="info"
              fullWidth
              sx={{ mt: 1 }}
              disabled={open}
              onClick={handleStatusUpdate}
            >
              Update Status
            </Button>
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
                  Are you sure you want to delete this step? This action cannot be undone.
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

export default withAuth(StepForm);