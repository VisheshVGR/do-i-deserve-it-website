'use client';

import React, { useState, useEffect } from 'react';
import withAuth from '@/utils/withAuth';
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
  Switch,
} from '@mui/material';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import api from '@/utils/axios';
import { useLoader } from '@/context/LoaderContext';
import { useSnackbarUtils } from '@/context/SnackbarContext';
import IconPickerDialog from '@/components/IconPickerDialog';
import * as MuiIcons from '@mui/icons-material';
import Divider from '@mui/material/Divider';

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
  const [icon, setIcon] = useState('Star'); // default icon
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  // Fetch headings for dropdown
  useEffect(() => {
    showLoader();
    api
      .get('targetHeadings')
      .then((res) => setHeadings(res.data))
      .catch(() => setHeadings([]))
      .finally(() => hideLoader());
  }, [showLoader, hideLoader]);

  // Fetch step if editing
  useEffect(() => {
    if (!id) return;
    showLoader();
    api
      .get(`targetSteps/${id}`)
      .then((res) => {
        setTitle(res.data.title);
        setDescription(res.data.description);
        setType(res.data.type);
        setDays(res.data.days || []);
        setIsPublic(res.data.isPublic);
        setStatus(res.data.status);
        setTargetHeadingId(res.data.targetHeadingId || '');
        setIcon(res.data.icon || 'Star');
      })
      .catch(() => notify('Failed to fetch step', 'error'))
      .finally(() => hideLoader());
  }, [id, showLoader, hideLoader, notify]);

  const handleDayToggle = (day) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    showLoader();
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        isPublic,
        targetHeadingId,
        icon,
        type,
        days: days
      };

      if (id) {
        await api.put(`targetSteps/${id}`, payload);
        notify('Step updated!', 'success');
      } else {
        await api.post('targetSteps', payload);
        notify('Step added!', 'success');
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push('/target');
      await new Promise(resolve => setTimeout(resolve, 100));
      hideLoader();
    } catch (err) {
      notify(err.response?.data?.error || 'Failed to save step', 'error');
      hideLoader();
    }
  };

  const handleDelete = async () => {
    showLoader();
    try {
      await api.delete(`targetSteps/${id}`);
      notify('Step deleted!', 'success');
      setTimeout(() => router.push('/target'), 700);
    } catch (err) {
      notify(
        err.response?.data?.error || err.message || 'Failed to delete step',
        'error'
      );
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
      notify(
        err.response?.data?.error || err.message || 'Failed to update status',
        'error'
      );
    }
    hideLoader();
  };

  return (
    <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh', // Ensure it takes at least the full viewport height
        paddingX: 2, // Add horizontal padding
        maxWidth: 400,
        mx: 'auto',
        my: 6,
    }}>
      {/* <Typography variant="h5" gutterBottom>
        {id ? 'Edit Target Step' : 'Add Target Step'}
      </Typography> */}
      <form onSubmit={handleSubmit}>
        {/* Heading selection */}
        <FormControl fullWidth margin="normal">
          <InputLabel id="heading-label">Heading</InputLabel>
          <Select
            labelId="heading-label"
            value={targetHeadingId}
            label="Heading"
            onChange={(e) => setTargetHeadingId(e.target.value)}
          >
            <MenuItem value="">None</MenuItem>
            {headings.map((h) => (
              <MenuItem key={h.id} value={h.id}>
                {h.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Step Icon row: text left, icon picker right */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            my: 2,
          }}
        >
          <Typography variant="subtitle2">Icon</Typography>
          <Button
            variant="outlined"
            startIcon={
              MuiIcons[icon] ? (
                React.createElement(MuiIcons[icon])
              ) : (
                <MuiIcons.Star />
              )
            }
            onClick={() => setIconPickerOpen(true)}
          >
            {icon}
          </Button>
        </Box>
        <IconPickerDialog
          open={iconPickerOpen}
          onClose={() => setIconPickerOpen(false)}
          onSelect={setIcon}
          value={icon}
        />

        {/* Title & Description */}
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          minRows={4}
          maxRows={8}
        />

        {/* Type row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            my: 2,
          }}
        >
          <FormLabel component="legend" sx={{ minWidth: 60, mr: 2 }}>
            Type
          </FormLabel>
          <RadioGroup
            row
            value={type}
            onChange={(e) => setType(e.target.value)}
            sx={{ ml: 1 }}
          >
            <FormControlLabel
              value="bool"
              control={<Radio />}
              label="Boolean"
            />
            <FormControlLabel value="count" control={<Radio />} label="Count" />
          </RadioGroup>
        </Box>

        {/* Days row */}
        <FormControl
          component="fieldset"
          margin="normal"
          sx={{ width: '100%' }}
        >
          <FormLabel component="legend">
            Days (Kudos for attending on extra days)
          </FormLabel>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              mt: 2,
              width: '100%',
              justifyContent: 'space-between',
            }}
          >
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
              (day, idx) => (
                <Button
                  key={day}
                  variant={days.includes(day) ? 'contained' : 'outlined'}
                  onClick={() => handleDayToggle(day)}
                  size="small"
                >
                  {day}
                </Button>
              )
            )}
          </Box>
        </FormControl>

        {/* Public switch */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            my: 2,
          }}
        >
          <FormLabel component="legend" sx={{ minWidth: 60, mr: 2 }}>
            Public (Friends can see Progress...)
          </FormLabel>
          <Switch
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            color="success"
          />
        </Box>

        {/* Submit/Cancel Buttons */}
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

        {/* Divider before status update */}
        {id && <Divider sx={{ my: 3 }} />}
        
        {/* Status (if editing) */}
        {id && (
          <FormControl fullWidth margin="normal" sx={{ mt: 3 }}>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value)}
              disabled={open}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
        )}

        {/* Status update button */}
        {id && (
          <Button
            variant="outlined"
            color="info"
            fullWidth
            sx={{ mb: 2 }}
            disabled={open}
            onClick={handleStatusUpdate}
          >
            Update Status
          </Button>
        )}

        {/* Divider before delete */}
        {id && <Divider sx={{ my: 3 }} />}

        {/* Delete button */}
        {id && (
          <>
            <Button
              variant="outlined"
              color="error"
              fullWidth
              sx={{ mb: 2 }}
              disabled={open}
              onClick={() => setConfirmOpen(true)}
            >
              {'Delete'}
            </Button>
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to delete this step? This action cannot
                  be undone.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setConfirmOpen(false)} color="primary">
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  color="error"
                  variant="contained"
                  disabled={open}
                >
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
