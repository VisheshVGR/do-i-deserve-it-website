'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  SpeedDial,
  SpeedDialAction,
  Switch,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DoneIcon from '@mui/icons-material/Done';
import MenuIcon from '@mui/icons-material/Menu';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RepeatIcon from '@mui/icons-material/Repeat';
import withAuth from '@/utils/withAuth';
import { useLoader } from '@/context/LoaderContext';
import { useSnackbarUtils } from '@/context/SnackbarContext';
import api from '@/utils/axios';
import { pageContainerStyles, sectionStyles } from '@/styles/common';

function Reminder() {
  // State
  const [reminders, setReminders] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);

  // Hooks
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();
  const { notify } = useSnackbarUtils();

  // Fetch reminders
  const fetchReminders = async () => {
    showLoader();
    try {
      const res = await api.get('reminders');
      setReminders(res.data || []);
    } catch (err) {
      notify('Failed to load reminders', 'error');
    }
    hideLoader();
  };

  useEffect(() => {
    fetchReminders();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Toggle reminder on/off
  const handleToggleReminder = async (id, currentStatus) => {
    showLoader();
    try {
      await api.patch(`reminders/${id}/toggle`, { isReminderOn: !currentStatus });
      notify('Reminder updated!', 'success');
      fetchReminders();
    } catch (err) {
      notify('Failed to update reminder', 'error');
    }
    hideLoader();
  };

  // Format next alarm time
  const getNextAlarmTime = (reminder) => {
    const now = new Date();
    const reminderTime = new Date(reminder.time);
    
    if (reminder.repeat === 'none' && reminderTime < now) {
      return 'Expired';
    }
    
    if (reminder.repeat === 'daily') {
      const today = new Date();
      today.setHours(reminderTime.getHours());
      today.setMinutes(reminderTime.getMinutes());
      if (today < now) {
        today.setDate(today.getDate() + 1);
      }
      return today.toLocaleString();
    }
    
    if (reminder.repeat === 'custom') {
      // Find next occurrence based on days
      const today = new Date();
      const currentDay = today.toLocaleDateString('en-US', { weekday: 'short' });
      const dayIndex = reminder.days.indexOf(currentDay);
      if (dayIndex === -1) {
        return 'Next matching day';
      }
      return reminderTime.toLocaleString();
    }
    
    return reminderTime.toLocaleString();
  };

  return (
    <Box sx={pageContainerStyles}>
      {reminders.length === 0 ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <Typography variant="h6" color="text.secondary">
            No reminders yet. Add some to get started!
          </Typography>
        </Box>
      ) : (
        <Box sx={sectionStyles}>
          <List>
            {reminders.map((reminder) => (
              <ListItem
                key={reminder.id}
                sx={{
                  bgcolor: 'background.paper',
                  mb: 1,
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemText
                  primary={reminder.title}
                  secondary={
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {reminder.description && (
                        <Typography variant="body2">{reminder.description}</Typography>
                      )}
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip
                          icon={<AccessTimeIcon />}
                          label={getNextAlarmTime(reminder)}
                          size="small"
                          color={reminder.isReminderOn ? "primary" : "default"}
                        />
                        {reminder.repeat !== 'none' && (
                          <Chip
                            icon={<RepeatIcon />}
                            label={reminder.repeat === 'custom' ? 
                              `Custom: ${reminder.days.join(', ')}` : 
                              'Daily'}
                            size="small"
                            color="info"
                          />
                        )}
                      </Box>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  {editMode ? (
                    <IconButton
                      edge="end"
                      onClick={() => router.push(`/reminder/reminder-form?id=${reminder.id}`)}
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
                  ) : (
                    <Switch
                      edge="end"
                      onChange={() => handleToggleReminder(reminder.id, reminder.isReminderOn)}
                      checked={reminder.isReminderOn}
                    />
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Speed Dial */}
      <SpeedDial
        ariaLabel="Reminder actions"
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
        icon={<MenuIcon />}
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
          tooltipTitle="Add Reminder"
          onClick={() => {
            router.push('/reminder/reminder-form');
            setSpeedDialOpen(false);
          }}
        />
      </SpeedDial>
    </Box>
  );
}

export default withAuth(Reminder);
