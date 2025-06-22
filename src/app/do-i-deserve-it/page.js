'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  SpeedDial,
  SpeedDialAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DoneIcon from '@mui/icons-material/Done';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import withAuth from '@/utils/withAuth';
import { useLoader } from '@/context/LoaderContext';
import { useSnackbarUtils } from '@/context/SnackbarContext';
import api from '@/utils/axios';
import { pageContainerStyles, sectionStyles } from '@/styles/common';

function DoIDeserveIt() {
  // State
  const [entries, setEntries] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [title, setTitle] = useState('');

  // Hooks
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();
  const { notify } = useSnackbarUtils();

  // Fetch entries
  const fetchEntries = async () => {
    showLoader();
    try {
      const res = await api.get('deserve');
      setEntries(res.data || []);
    } catch (err) {
      notify('Failed to load entries', 'error');
    }
    hideLoader();
  };

  useEffect(() => {
    fetchEntries();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle form submit
  const handleSubmit = async () => {
    if (!title.trim()) {
      notify('Title is required', 'error');
      return;
    }

    showLoader();
    try {
      if (selectedEntry) {
        await api.put(`deserve/${selectedEntry.id}`, { title: title.trim() });
        notify('Entry updated!', 'success');
      } else {
        await api.post('deserve', { title: title.trim() });
        notify('Entry added!', 'success');
      }
      setDialogOpen(false);
      setSelectedEntry(null);
      setTitle('');
      fetchEntries();
    } catch (err) {
      notify(err.response?.data?.error || 'Failed to save entry', 'error');
    }
    hideLoader();
  };

  // Handle delete
  const handleDelete = async () => {
    if (!entryToDelete) return;
    
    showLoader();
    try {
      await api.delete(`deserve/${entryToDelete.id}`);
      notify('Entry deleted!', 'success');
      fetchEntries();
    } catch (err) {
      notify('Failed to delete entry', 'error');
    }
    hideLoader();
    setDeleteDialogOpen(false);
    setEntryToDelete(null);
  };

  return (
    <Box sx={{...pageContainerStyles, mb: 8}}>
      {entries.length === 0 ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <Typography variant="h6" color="text.secondary">
            No entries yet. Add something you think you deserve!
          </Typography>
        </Box>
      ) : (
        <Box sx={sectionStyles}>
          <List>
            {entries.map((entry) => (
              <ListItem
                key={entry.id}
                sx={{
                  bgcolor: 'background.paper',
                  mb: 1,
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
                secondaryAction={
                  editMode && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        edge="end"
                        onClick={() => {
                          setSelectedEntry(entry);
                          setTitle(entry.title);
                          setDialogOpen(true);
                        }}
                        sx={{
                          color: 'primary.main',
                          '&:hover': {
                            bgcolor: 'primary.light',
                            color: 'primary.dark',
                          },
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => {
                          setEntryToDelete(entry);
                          setDeleteDialogOpen(true);
                        }}
                        sx={{
                          color: 'error.main',
                          '&:hover': {
                            bgcolor: 'error.light',
                            color: 'error.dark',
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )
                }
              >
                <ListItemText primary={entry.title} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Speed Dial */}
      <SpeedDial
        ariaLabel="Do I Deserve It actions"
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
        icon={<SettingsIcon />}
        open={speedDialOpen}
        onClose={() => setSpeedDialOpen(false)}
        onClick={() => setSpeedDialOpen((prev) => !prev)}
      >
        <SpeedDialAction
          icon={editMode ? <DoneIcon /> : <EditIcon />}
          tooltipTitle={editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
          onClick={() => {
            setEditMode((prev) => !prev);
            setSpeedDialOpen(false);
          }}
        />
        <SpeedDialAction
          icon={<AddIcon />}
          tooltipTitle="Add Entry"
          onClick={() => {
            setSelectedEntry(null);
            setTitle('');
            setDialogOpen(true);
            setSpeedDialOpen(false);
          }}
        />
      </SpeedDial>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {selectedEntry ? 'Edit Entry' : 'Add New Entry'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="What do you deserve?"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedEntry ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setEntryToDelete(null);
        }}
      >
        <DialogTitle>Delete Entry</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &quot;{entryToDelete?.title}&quot;?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setEntryToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default withAuth(DoIDeserveIt);