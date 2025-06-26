'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  Tabs,
  Tab,
  Avatar,
  SpeedDial,
  SpeedDialAction,
  IconButton,
  Typography,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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

// Tag and status color maps
const TAG_OPTIONS = [
  { value: 'feedback', label: 'Feedback', color: 'primary.main' },
  { value: 'bug', label: 'Bug', color: 'error.main' },
  { value: 'feature request', label: 'Feature Request', color: 'warning.main' },
  { value: 'ui / ux issue', label: 'UI / UX Issue', color: 'info.main' },
];

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open', color: 'primary' },
  { value: 'in progress', label: 'In Progress', color: 'warning' },
  { value: 'fixed', label: 'Fixed', color: 'success' },
  { value: 'need more info', label: 'Need More Info', color: 'info' },
];

const getStatusColor = (status) =>
  STATUS_OPTIONS.find((opt) => opt.value === status)?.color || 'default';

const getTagColor = (tag) =>
  TAG_OPTIONS.find((opt) => opt.value === tag)?.color || 'default';

// Helper to convert Firestore Timestamp to JS Date
function toDate(ts) {
  if (!ts) return null;
  if (ts instanceof Date) return ts;
  if (typeof ts === 'object' && ('_seconds' in ts || 'seconds' in ts)) {
    // Support both _seconds and seconds keys
    const sec = ts._seconds ?? ts.seconds;
    return new Date(sec * 1000);
  }
  return new Date(ts);
}

export default function FeedbackPage() {
  const [tab, setTab] = useState('my');
  const [editMode, setEditMode] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [myFeedback, setMyFeedback] = useState([]);
  const [allFeedback, setAllFeedback] = useState([]);
  const [allTab, setAllTab] = useState('all');
  const [myTab, setMyTab] = useState('all');
  const [error, setError] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

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
      console.log (all);
      all.forEach(fb => {
        const formatDate = (dateVal) => {
          let d;
          // Firestore Timestamp objects have a toDate() method
          if (dateVal && typeof dateVal.toDate === 'function') {
            d = dateVal.toDate();
          } else if (typeof dateVal === 'string' || typeof dateVal === 'number') {
            d = new Date(dateVal);
          } else {
            return 'Invalid Date';
          }
          const day = d.getDate();
          const month = d.toLocaleString('default', { month: 'short' });
          const year = d.getFullYear();
          let hours = d.getHours();
          const minutes = d.getMinutes().toString().padStart(2, '0');
          const ampm = hours >= 12 ? 'PM' : 'AM';
          hours = hours % 12 || 12;
          return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
        };
        console.log(
          `ID: ${fb.id} | Created: ${new Date(fb.createdAt.seconds*1000)} | Updated: ${new Date(fb.updatedAt.seconds*1000) }`
        );
      });
    } catch {
      setError('Failed to load feedback');
    }
    hideLoader();
  };

  // Sort by latest updatedAt date first
  const sortByDateDesc = (arr) =>
    [...arr].sort((a, b) => toDate(b.updatedAt) - toDate(a.updatedAt));

  // Filtered feedback for "All Feedback" tab
  const filteredAllFeedback = sortByDateDesc(
    allFeedback.filter(
      (fb) =>
        (tagFilter === 'all' || fb.tag === tagFilter) &&
        (statusFilter === 'all' || fb.status === statusFilter)
    )
  );

  // Filtered feedback for "My Feedback" tab
  const filteredMyFeedback = sortByDateDesc(
    myFeedback.filter(
      (fb) =>
        (tagFilter === 'all' || fb.tag === tagFilter) &&
        (statusFilter === 'all' || fb.status === statusFilter)
    )
  );

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
          <Chip
            label={fb.tag}
            size="small"
            sx={{ bgcolor: getTagColor(fb.tag), color: 'white' }}
          />
          <Chip
            label={fb.status}
            size="small"
            color={getStatusColor(fb.status)}
          />
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
            {/* Only show date, not time */}
            Created: {moment(toDate(fb.createdAt)).format('D MMM YY')} | Updated: {moment(toDate(fb.updatedAt)).format('D MMM YY')}
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

      {/* Centered Select Filters */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Tag</InputLabel>
          <Select
            value={tagFilter}
            label="Tag"
            onChange={(e) => setTagFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            {TAG_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            {STATUS_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {tab === 'my' ? (
        !filteredMyFeedback.length && !allFeedback.length ? (
          <Typography align="center" color="text.secondary" sx={{ mt: 6 }}>
            No feedback as of now, why don&apos;t you share your views?
          </Typography>
        ) : (
          renderFeedbackList(filteredMyFeedback)
        )
      ) : (
        !filteredAllFeedback.length ? (
          <Typography align="center" color="text.secondary" sx={{ mt: 6 }}>
            No feedback as of now, why don&apos;t you share your views?
          </Typography>
        ) : (
          renderFeedbackList(filteredAllFeedback, true)
        )
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
