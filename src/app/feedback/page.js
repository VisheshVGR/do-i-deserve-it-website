'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Avatar,
  SpeedDial,
  SpeedDialAction,
  IconButton,
  Typography,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import SettingsIcon from '@mui/icons-material/Settings';
import api from '@/utils/axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLoader } from '@/context/LoaderContext';
import moment from 'moment';

const ADMIN_USER_UID = process.env.NEXT_PUBLIC_ADMIN_USER_UID;

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

export default function FeedbackPage() {
  const [tab, setTab] = useState('my');
  const [editMode, setEditMode] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [myFeedback, setMyFeedback] = useState([]);
  const [allFeedback, setAllFeedback] = useState([]);

  const { user } = useAuth();
  const { showLoader, hideLoader } = useLoader();
  const router = useRouter();

  const isAdmin = user?.uid === ADMIN_USER_UID;

  useEffect(() => {
    fetchFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchFeedback = async () => {
    showLoader();
    try {
      const allRes = await api.get('/feedback');
      const all = allRes.data || [];
      const myRes = all.filter((fb) => fb?.userId === user?.uid);
      setMyFeedback(myRes);
      setAllFeedback(all);
    } catch {
      setError('Failed to load feedback');
    }
    hideLoader();
  };

  // Render feedback list
  const renderFeedbackList = (list, showUser = false) =>
    list.map((fb) => (
      <Paper key={fb.id} sx={{ p: 2, mb: 2, position: 'relative' }}>
        {showUser && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={fb.user?.photoURL} sx={{ width: 28, height: 28 }} />
            <Box>
              <Typography fontWeight={600}>
                {fb.user?.displayName || fb.user?.email}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {fb.user?.email}
              </Typography>
            </Box>
          </Box>
        )}
        <Typography variant="subtitle1" fontWeight={600}>
          {fb.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {fb.description}
        </Typography>
        <Box display="flex" alignItems="center" gap={1} sx={{ mt: 2 }}>
          <Chip label={fb.tag} size="small" />
          <Chip label={fb.status} size="small" color="info" />
          {/* Show edit icon for myFeedback, and for allFeedback if admin and editMode */}
          {editMode && (!showUser || isAdmin) && (
            <IconButton
              size="small"
              onClick={() => router.push(`/feedback/feedback-form?id=${fb.id}`)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', ml: 'auto' }}
          >
            Created: {moment(fb.createdAt).format('D MMM YY')} | Updated:{' '}
            {moment(fb.updatedAt).format('D MMM YY')}
          </Typography>
        </Box>
      </Paper>
    ));

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: 2 }}>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 2 }}
        variant="fullWidth"
      >
        <Tab label="My Feedback" value="my" />
        <Tab label="All Feedback" value="all" />
      </Tabs>

      {tab === 'my' && (
        <>
          {!myFeedback.length && !allFeedback.length ? (
            <CircularProgress />
          ) : (
            renderFeedbackList(myFeedback)
          )}
        </>
      )}
      {tab === 'all' && (
        <>
          {!allFeedback.length ? (
            <CircularProgress />
          ) : (
            renderFeedbackList(allFeedback, true)
          )}
        </>
      )}

      {/* SpeedDial for actions */}
      <SpeedDial
        ariaLabel="Feedback actions"
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
        icon={<SettingsIcon />}
        onClose={() => setSpeedDialOpen(false)}
        open={speedDialOpen}
        onClick={() => setSpeedDialOpen((prev) => !prev)}
        direction="up"
      >
        <SpeedDialAction
          icon={editMode ? <DoneIcon /> : <EditIcon />}
          tooltipTitle={editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
          onClick={() => {
            setEditMode((e) => !e);
            setSpeedDialOpen(false);
          }}
        />
        <SpeedDialAction
          icon={<AddIcon />}
          tooltipTitle="Add Feedback"
          onClick={() => {
            router.push('/feedback/feedback-form');
            setSpeedDialOpen(false);
          }}
        />
      </SpeedDial>
    </Box>
  );
}
