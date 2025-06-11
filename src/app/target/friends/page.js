'use client';

/**
 * Friends page component that displays a list of friends and their daily steps
 * Allows adding/removing friends and viewing their progress
 */

// React and hooks
import { useState, useEffect } from 'react';

// MUI Components
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  SpeedDial,
  SpeedDialAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Avatar,
  Divider,
} from '@mui/material';

// MUI Icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';

// Utils and contexts
import withAuth from '@/utils/withAuth';
import { useLoader } from '@/context/LoaderContext';
import { useSnackbarUtils } from '@/context/SnackbarContext';
import api from '@/utils/axios';
import tinycolor from 'tinycolor2';
import { HeadingAccordion } from '../page';
import Link from 'next/link';

/**
 * Main Friends Page component
 */
function FriendsPage() {
  // State management
  const [friends, setFriends] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addUserId, setAddUserId] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  // state for report view mode
  const [inReportViewMode, setInReportViewMode] = useState(false);

  // New function to toggle report view mode
  const handleToggleReportViewMode = () => setInReportViewMode((e) => !e);

  // Hooks
  const { showLoader, hideLoader } = useLoader();
  const { notify } = useSnackbarUtils();

  // Fetch friends list
  const fetchFriends = async () => {
    showLoader();
    try {
      const res = await api.get('userFriends');
      setFriends(res.data || []);
      setExpanded(
        Object.fromEntries((res.data || []).map((f) => [f.friendUserId, true]))
      );
    } catch {
      setFriends([]);
      notify('Failed to load friends', 'error');
    }
    hideLoader();
  };

  // Fetch friends on mount
  useEffect(() => {
    fetchFriends();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handler functions
  const handleAddFriend = async () => {
    setAddLoading(true);
    try {
      await api.post('userFriends', { friendUserId: addUserId });
      notify('Friend added!', 'success');
      setAddDialogOpen(false);
      setAddUserId('');
      fetchFriends();
    } catch (err) {
      notify(err.response?.data?.error || 'Invalid user ID', 'error');
    }
    setAddLoading(false);
  };

  const handleDeleteClick = (e, friendUserId) => {
    e.stopPropagation();
    setDeleteUserId(friendUserId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteUserId) return;

    showLoader();
    try {
      await api.delete(`userFriends/${deleteUserId}`);
      notify('Friend removed!', 'success');
      fetchFriends();
    } catch (err) {
      notify('Failed to remove friend', 'error');
    }
    hideLoader();
    setDeleteDialogOpen(false);
    setDeleteUserId(null);
  };

  const handleAccordionChange = (friendUserId) => (event, isExpanded) => {
    setExpanded((prev) => ({ ...prev, [friendUserId]: isExpanded }));
  };

  return (
    <Box sx={{ p: 2, minHeight: '70vh', position: 'relative', mb: 8 }}>
      <RenderFriendAccordions
        friends={friends}
        editMode={editMode}
        expanded={expanded}
        handleDeleteClick={handleDeleteClick}
        handleAccordionChange={handleAccordionChange}
        inReportViewMode={inReportViewMode}
      />

      {/* Floating SpeedDial */}
      <SpeedDial
        ariaLabel="Friends actions"
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
        icon={<SettingsIcon />}
        open={speedDialOpen}
        onClick={() => setSpeedDialOpen((prev) => !prev)}
        onClose={() => setSpeedDialOpen(false)}
        direction="up"
      >
        <SpeedDialAction
          icon={editMode ? <DoneIcon /> : <EditIcon />}
          tooltipTitle={editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
          onClick={() => setEditMode((e) => !e)}
        />
        {/* Toggle report view mode */}
        <SpeedDialAction
          icon={inReportViewMode ? <DoneIcon /> : <AssessmentIcon />} // Use AssessmentIcon
          tooltipTitle={
            inReportViewMode
              ? 'Exit Report View Mode'
              : 'Enter Report View Mode'
          }
          onClick={() => {
            handleToggleReportViewMode(); // Call handleToggleReportViewMode
            setSpeedDialOpen(false);
          }}
          FabProps={{ color: inReportViewMode ? 'success' : 'primary' }}
        />
        <SpeedDialAction
          icon={<PersonAddIcon />}
          tooltipTitle="Add Friend"
          onClick={() => setAddDialogOpen(true)}
        />
      </SpeedDial>

      {/* Add Friend Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Add Friend by User ID</DialogTitle>
        <DialogContent>
          <TextField
            label="User ID"
            value={addUserId}
            onChange={(e) => setAddUserId(e.target.value)}
            fullWidth
            autoFocus
            margin="normal"
            disabled={addLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)} disabled={addLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleAddFriend}
            variant="contained"
            disabled={addLoading || !addUserId}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteUserId(null);
        }}
      >
        <DialogTitle>Remove Friend</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to remove this friend?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setDeleteUserId(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}



/**
 * Independent function to render friend accordions
 */
const RenderFriendAccordions = ({
  friends,
  editMode,
  expanded,
  handleDeleteClick,
  handleAccordionChange,
  inReportViewMode,
}) => {
  if (friends.length === 0) {
    return (
      <Typography color="text.secondary" align="center" sx={{ mt: 8 }}>
        No friends added. Add friends to see their progress!
      </Typography>
    );
  }

  return friends.map((friend) => {
    const headingColor = friend.user?.color || '#FF7043';
    const headingTextColor = tinycolor(headingColor).isLight()
      ? '#222'
      : '#fff';
    const detailsBg = tinycolor(headingColor).setAlpha(0.08).toRgbString();

    return (
      <Accordion
        key={friend.friendUserId}
        expanded={expanded[friend.friendUserId] ?? true}
        onChange={handleAccordionChange(friend.friendUserId)}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Avatar src={friend.user?.photoURL} sx={{ mr: 2 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography fontWeight={600}>
              {friend.user?.displayName ||
                friend.user?.email ||
                friend.friendUserId}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {friend.user?.email}
            </Typography>
          </Box>
          {editMode ? (
            <IconButton
              size="small"
              color="error"
              onClick={(e) => handleDeleteClick(e, friend.friendUserId)}
            >
              <DeleteIcon />
            </IconButton>
          ) : null}
        </AccordionSummary>
        <AccordionDetails
          sx={{
            bgcolor: detailsBg,
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
          }}
        >
          {/*  FriendSteps component */}
          <FriendSteps
            friendUserId={friend.friendUserId}
            headingColor={headingColor}
            inReportViewMode={inReportViewMode}
          />
        </AccordionDetails>
      </Accordion>
    );
  });
};



/**
 * Component to display a friend's steps grouped by headings
 */
function FriendSteps({ friendUserId, headingColor, inReportViewMode }) {
  // State
  const [steps, setSteps] = useState([]);
  // State for current step input values (by step id)
  const [stepInputs, setStepInputs] = useState({});

  // Hooks
  const { showLoader, hideLoader } = useLoader();
  const { notify } = useSnackbarUtils();
  const noop = () => {};

  // Fetch steps on mount and friendUserId change
  useEffect(() => {
    let mounted = true;

    const fetchSteps = async () => {
      showLoader();
      try {
        const res = await api.get(`userFriends/${friendUserId}/today`);
        if (mounted) {
          const today = new Date().toLocaleDateString('en-US', {
            weekday: 'short',
          });
          const enhancedSteps = (res.data?.steps || []).map((step) => ({
            ...step,
            todayShort: today,
          }));
          setSteps(enhancedSteps);
        }
      } catch (err) {
        if (mounted) {
          setSteps([]);
          notify('Failed to load steps', 'error');
        }
      }
      hideLoader();
    };

    fetchSteps();
    return () => {
      mounted = false;
    };
  }, [friendUserId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Set initial stepInputs when data loads
  useEffect(() => {
    showLoader();
    const allSteps = steps;
    const initial = {};
    allSteps.forEach((step) => {
      // For count steps, sum count and kudos
      if (
        step.type === 'count' &&
        step.targetStepData &&
        step.targetStepData.length > 0
      ) {
        initial[step.id] =
          Number(step.targetStepData[0].count) +
          Number(step.targetStepData[0].kudos);
      }
      // For bool steps, true if count exists
      else if (step.type === 'bool') {
        initial[step.id] =
          step.targetStepData &&
          step.targetStepData[0] &&
          step.targetStepData[0].count
            ? 1
            : 0;
      }
    });

    setStepInputs(initial);
    hideLoader();
  }, [steps, hideLoader, showLoader]);

  // Group steps by their headings
  const groupedSteps = steps.reduce((acc, step) => {
    const headingId = step.targetHeadingId || 'others';
    if (!acc[headingId]) {
      acc[headingId] = {
        heading: {
          id: headingId,
          name: step.targetHeading?.name || 'Others',
          color: step.targetHeading?.color || headingColor,
        },
        steps: [],
      };
    }
    acc[headingId].steps.push(step);
    return acc;
  }, {});

  // Sort groups to put 'Others' at the end
  const sortedGroups = Object.values(groupedSteps).sort((a, b) => {
    if (a.heading.id === 'others') return 1;
    if (b.heading.id === 'others') return -1;
    return a.heading.name.localeCompare(b.heading.name);
  });

  return (
    <>
      {sortedGroups.map(({ heading, steps }) => (
        <HeadingAccordion
          key={heading.id}
          heading={heading}
          steps={steps}
          editMode={false}
          inReportViewMode={inReportViewMode}
          handleEditHeading={noop}
          stepInputs={stepInputs}
          todayShort={new Date().toLocaleDateString('en-US', {
            weekday: 'short',
          })}
          handleStepInput={noop}
          handleEditStep={noop}
          handleIncrement={noop}
          handleDecrement={noop}
          readOnly={true} // Pass readOnly prop
        />
      ))}
    </>
  );
}

export default withAuth(FriendsPage);
