'use client';

import React, { useState, useEffect } from 'react';
import withAuth from '@/utils/withAuth';
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
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import api from '@/utils/axios';
import { useLoader } from '@/context/LoaderContext';
import { useSnackbarUtils } from '@/context/SnackbarContext';

function TodoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { showLoader, hideLoader } = useLoader();
  const { notify } = useSnackbarUtils();

  // State
  const [title, setTitle] = useState('');
  const [todoHeadingId, setTodoHeadingId] = useState('');
  const [isDone, setIsDone] = useState(false);
  const [headings, setHeadings] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Fetch headings for dropdown
  useEffect(() => {
    showLoader();
    api
      .get('todoHeadings')
      .then((res) => setHeadings(res.data))
      .catch(() => setHeadings([]))
      .finally(() => hideLoader());
  }, [showLoader, hideLoader]);

  // Fetch todo if editing
  useEffect(() => {
    if (!id) return;
    showLoader();
    api
      .get(`todos/${id}`)
      .then((res) => {
        setTitle(res.data.title);
        setTodoHeadingId(res.data.todoHeadingId || '');
        setIsDone(res.data.isDone || false);
      })
      .catch(() => notify('Failed to fetch todo', 'error'))
      .finally(() => hideLoader());
  }, [id, showLoader, hideLoader, notify]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    showLoader();
    try {
      const payload = {
        title: title.trim(),
        todoHeadingId: todoHeadingId || undefined,
      };

      if (id) {
        await api.put(`todos/${id}`, payload);
        notify('Todo updated!', 'success');
      } else {
        await api.post('todos', payload);
        notify('Todo added!', 'success');
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push('/todo');
      await new Promise((resolve) => setTimeout(resolve, 100));
      hideLoader();
    } catch (err) {
      notify(err.response?.data?.error || 'Failed to save todo', 'error');
      hideLoader();
    }
  };

  const handleDelete = async () => {
    showLoader();
    try {
      await api.delete(`todos/${id}`);
      notify('Todo deleted!', 'success');
      setTimeout(() => router.push('/todo'), 700);
    } catch (err) {
      notify('Failed to delete todo', 'error');
    }
    setConfirmOpen(false);
    hideLoader();
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', my: 6, mx: 2 }}>
      {/* <Typography variant="h5" gutterBottom>
        {id ? 'Edit Todo' : 'Add Todo'}
      </Typography> */}

      <form onSubmit={handleSubmit}>
        {/* Heading selection */}
        <FormControl fullWidth margin="normal">
          <InputLabel id="heading-label">Heading (Optional)</InputLabel>
          <Select
            labelId="heading-label"
            value={todoHeadingId}
            label="Heading (Optional)"
            onChange={(e) => setTodoHeadingId(e.target.value)}
          >
            <MenuItem value="">None</MenuItem>
            {headings.map((h) => (
              <MenuItem key={h.id} value={h.id}>
                {h.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Title */}
        <TextField
          label="Todo Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          required
          margin="normal"
        />

        {/* Is Done Checkbox */}
        <FormControlLabel
          control={
            <Checkbox
              checked={isDone}
              onChange={(e) => setIsDone(e.target.checked)}
            />
          }
          label="Mark as done"
          sx={{ mt: 2, mb: 1 }}
        />

        {/* Submit/Cancel Buttons */}
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!title}
            fullWidth
          >
            {id ? 'Update' : 'Add'}
          </Button>
          <Button
            variant="text"
            color="secondary"
            fullWidth
            onClick={() => router.push('/todo')}
          >
            Cancel
          </Button>
        </Stack>

        {/* Delete button */}
        {id && (
          <Button
            variant="outlined"
            color="error"
            fullWidth
            sx={{ mt: 3 }}
            onClick={() => setConfirmOpen(true)}
          >
            Delete
          </Button>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>Delete Todo</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this todo?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </form>
    </Box>
  );
}

export default withAuth(TodoForm);
