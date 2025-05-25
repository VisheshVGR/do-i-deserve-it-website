'use client';

// Import required dependencies and components
import withAuth from '@/utils/withAuth';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
  SpeedDial,
  SpeedDialAction,
  TextField,
  Switch,
  FormControlLabel,
  ButtonGroup,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import RemoveIcon from '@mui/icons-material/Remove';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useLoader } from '@/context/LoaderContext';
import { useSnackbarUtils } from '@/context/SnackbarContext';
import api from '@/utils/axios';
import tinycolor from 'tinycolor2';

// Returns today's date in YYYY-MM-DD format
function getToday() {
  return new Date().toISOString().split('T')[0];
}

// Returns today's short weekday string (e.g., 'Mon')
function getTodayShort() {
  return new Date().toLocaleDateString('en-US', { weekday: 'short' });
}

// Main Target component
function Target() {
  // State for edit mode (true = edit, false = view)
  const [editMode, setEditMode] = useState(false);
  // State for all headings and their steps
  const [data, setData] = useState([]);
  // State for all headings (not used directly here)
  const [headings, setHeadings] = useState([]);
  // State for current step input values (by step id)
  const [stepInputs, setStepInputs] = useState({});
  // State for initial step input values (for change detection)
  const [initialStepInputs, setInitialStepInputs] = useState({});
  // State for loading status of each step (by step id)
  const [stepLoading, setStepLoading] = useState({});
  // State for floating SpeedDial open/close
  const [speedDialOpen, setSpeedDialOpen] = useState(false);

  // Router for navigation
  const router = useRouter();
  // Loader context for showing/hiding global loader
  const { showLoader, hideLoader } = useLoader();
  // Snackbar context for notifications
  const { notify } = useSnackbarUtils();

  // Fetch all headings and steps grouped by heading on mount
  useEffect(() => {
    async function fetchData() {
      showLoader();
      try {
        // Fetch headings
        const headingsRes = await api.get('targetHeadings');
        const allHeadings = headingsRes.data || [];
        setHeadings(allHeadings);

        // Fetch steps
        const stepsRes = await api.get('targetSteps');
        const grouped = {};

        // Group steps by heading
        allHeadings.forEach((h) => {
          grouped[h.id] = {
            heading: h,
            steps: [],
          };
        });

        stepsRes.data.forEach((step) => {
          const headingId =
            step.targetHeading?.id || step.targetHeadingId || 'no-heading';
          if (!grouped[headingId]) {
            grouped[headingId] = {
              heading: step.targetHeading
                ? step.targetHeading
                : { id: 'no-heading', name: 'Others' },
              steps: [],
            };
          }
          grouped[headingId].steps.push(step);
        });

        setData(Object.values(grouped));
      } catch {
        setData([]);
        setHeadings([]);
      }
      hideLoader();
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set initial stepInputs when data loads
  useEffect(() => {
    const allSteps = data.flatMap((group) => group.steps || []);
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
        initial[step.id] = step.targetStepData &&
          step.targetStepData[0] &&
          step.targetStepData[0].count
          ? 1
          : 0;
      }
    });
    setInitialStepInputs(initial);
    setStepInputs(initial);
  }, [data]);

  // Handles updating the value for a step input
  const handleStepInput = (stepId, value) => {
    if (typeof value === 'number' && value < 0) value = 0;
    setStepInputs((inputs) => ({ ...inputs, [stepId]: value }));
  };

  // Handles incrementing the value for a count step
  const handleIncrement = (step, todayShort) => {
    setStepInputs((inputs) => {
      const current = Number(inputs[step.id] || 0);
      return { ...inputs, [step.id]: current + 1 };
    });
  };

  // Handles decrementing the value for a count step
  const handleDecrement = (step, todayShort) => {
    setStepInputs((inputs) => {
      const current = Number(inputs[step.id] || 0);
      return { ...inputs, [step.id]: Math.max(0, current - 1) };
    });
  };

  // Navigates to the step edit page
  const handleEditStep = (id) => {
    router.push(`/target/step-form?id=${id}`);
  };

  // Navigates to the heading edit page
  const handleEditHeading = (id) => {
    router.push(`/target/heading-form?id=${id}`);
  };

  // Navigates to the add heading page
  const handleAddHeading = () => {
    router.push('/target/heading-form');
  };

  // Navigates to the add step page
  const handleAddStep = () => {
    router.push('/target/step-form');
  };

  // Toggles edit mode on/off
  const handleToggleEdit = () => setEditMode((e) => !e);

  // Saves all changed steps to the backend
  const handleSaveAll = async () => {
    showLoader();
    try {
      // Find steps that have changed
      const changedSteps = Object.keys(stepInputs).filter(
        (id) => stepInputs[id] !== initialStepInputs[id]
      );
      // Save each changed step
      await Promise.all(
        changedSteps.map((id) => {
          const step = data.flatMap((g) => g.steps).find((s) => s.id === id);
          return api.post(`targetSteps/${id}/data`, {
            date: getToday(),
            count:
              step.type === 'bool'
                ? stepInputs[id]
                  ? 1
                  : 0
                : Math.max(0, Number(stepInputs[id]) || 0),
          });
        })
      );
      setInitialStepInputs({ ...stepInputs });
      notify('All changes saved!', 'success');
    } catch (e) {
      notify('Failed to save changes', 'error');
    }
    hideLoader();
  };

  // Checks if there are unsaved changes
  const hasUnsavedChanges = Object.keys(stepInputs).some(
    (id) => stepInputs[id] !== initialStepInputs[id]
  );

  // Get today's short weekday string
  const todayShort = getTodayShort();

  // --- Main Render ---
  return (
    <Box sx={{ p: 2, position: 'relative', minHeight: '70vh' }}>
      {/* Show "No data" if there are no headings/steps */}
      {data.length === 0 ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minHeight="60vh"
        >
          <Typography variant="h6" color="text.secondary">
            No data
          </Typography>
        </Box>
      ) : (
        // Render all headings and their steps
        data.map(({ heading, steps }) => (
          <HeadingAccordion
            key={heading.id}
            heading={heading}
            steps={steps}
            editMode={editMode}
            handleEditHeading={handleEditHeading}
            stepInputs={stepInputs}
            stepLoading={stepLoading}
            todayShort={todayShort}
            handleStepInput={handleStepInput}
            handleEditStep={handleEditStep}
            handleIncrement={handleIncrement}
            handleDecrement={handleDecrement}
          />
        ))
      )}

      {/* Floating Save SpeedDial (shows only if there are unsaved changes) */}
      <FloatingSaveSpeedDial
        hasUnsavedChanges={hasUnsavedChanges}
        handleSaveAll={handleSaveAll}
      />

      {/* Floating Main SpeedDial for actions */}
      <FloatingMainSpeedDial
        speedDialOpen={speedDialOpen}
        setSpeedDialOpen={setSpeedDialOpen}
        editMode={editMode}
        handleToggleEdit={handleToggleEdit}
        handleAddStep={handleAddStep}
        handleAddHeading={handleAddHeading}
      />
    </Box>
  );
}

// --- Modular Components & Helpers ---

// Floating Save SpeedDial button (shows only if there are unsaved changes)
function FloatingSaveSpeedDial({ hasUnsavedChanges, handleSaveAll }) {
  if (!hasUnsavedChanges) return null;
  return (
    <SpeedDial
      ariaLabel="Save changes"
      sx={{ position: 'fixed', bottom: 32, right: 104, zIndex: 1100 }}
      icon={<SaveIcon />}
      FabProps={{ color: 'success' }}
      onClick={handleSaveAll}
      direction="up"
      open
    />
  );
}

// Floating Main SpeedDial for edit/add actions
function FloatingMainSpeedDial({
  speedDialOpen,
  setSpeedDialOpen,
  editMode,
  handleToggleEdit,
  handleAddStep,
  handleAddHeading,
}) {
  return (
    <SpeedDial
      ariaLabel="Target actions"
      sx={{ position: 'fixed', bottom: 32, right: 32 }}
      icon={<MenuIcon />}
      open={speedDialOpen}
      onClick={() => setSpeedDialOpen((prev) => !prev)}
      onClose={() => setSpeedDialOpen(false)}
      direction="up"
    >
      {/* Toggle edit mode */}
      <SpeedDialAction
        icon={editMode ? <DoneIcon /> : <EditIcon />}
        tooltipTitle={editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
        onClick={() => {
          handleToggleEdit();
          setSpeedDialOpen(false);
        }}
        FabProps={{ color: editMode ? 'success' : 'primary' }}
      />
      {/* Add step */}
      <SpeedDialAction
        icon={<PlaylistAddCheckIcon sx={{ color: '#388e3c' }} />}
        tooltipTitle="Add Target Step"
        onClick={() => {
          handleAddStep();
          setSpeedDialOpen(false);
        }}
        FabProps={{ color: 'success' }}
      />
      {/* Add heading */}
      <SpeedDialAction
        icon={<PlaylistAddIcon sx={{ color: '#1976d2' }} />}
        tooltipTitle="Add Target Heading"
        onClick={() => {
          handleAddHeading();
          setSpeedDialOpen(false);
        }}
        FabProps={{ color: 'primary' }}
      />
    </SpeedDial>
  );
}

// Returns 'black' or 'white' based on background color for best contrast
function getContrastText(bgColor) {
  return tinycolor(bgColor).isLight() ? '#222' : '#fff';
}

// Returns a transparent version of the color for the details section
function getSubtleBg(bgColor) {
  return tinycolor(bgColor).setAlpha(0.08).toRgbString();
}

// Accordion for a single heading and its steps
function HeadingAccordion({
  heading,
  steps,
  editMode,
  handleEditHeading,
  stepInputs,
  stepLoading,
  todayShort,
  handleStepInput,
  handleEditStep,
  handleIncrement,
  handleDecrement,
}) {
  // Use heading.color or fallback
  const headingColor = heading.color || '#FF7043';
  const headingTextColor = getContrastText(headingColor);
  const detailsBg = getSubtleBg(headingColor);

  return (
    <Accordion key={heading.id} defaultExpanded>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: headingTextColor }} />}
        sx={{
          bgcolor: headingColor,
          color: headingTextColor,
          fontWeight: 700,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          '& .MuiTypography-root': {
            fontWeight: 700,
            color: headingTextColor,
          },
        }}
      >
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 700, color: headingTextColor }}>
            {heading.name}
          </Typography>
        </Box>
        {/* Edit heading button (only in edit mode and not for 'no-heading') */}
        {editMode && heading.id !== 'no-heading' && (
          <IconButton
            size="small"
            sx={{ ml: 1, color: headingTextColor }}
            onClick={(e) => {
              e.stopPropagation();
              handleEditHeading(heading.id);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        )}
      </AccordionSummary>
      <AccordionDetails
        sx={{
          bgcolor: detailsBg,
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
        }}
      >
        {/* Show "No steps" if there are no steps */}
        {steps.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No steps
          </Typography>
        ) : (
          // Render each step in this heading
          steps.map((step) => (
            <StepRow
              key={step.id}
              step={step}
              editMode={editMode}
              stepInputs={stepInputs}
              stepLoading={stepLoading}
              todayShort={todayShort}
              handleStepInput={handleStepInput}
              handleEditStep={handleEditStep}
              handleIncrement={handleIncrement}
              handleDecrement={handleDecrement}
            />
          ))
        )}
      </AccordionDetails>
    </Accordion>
  );
}

// Renders a single step row (title, description, and controls)
function StepRow({
  step,
  editMode,
  stepInputs,
  stepLoading,
  todayShort,
  handleStepInput,
  handleEditStep,
  handleIncrement,
  handleDecrement,
}) {
  // Current value for this step
  const count = stepInputs[step.id] ?? 0;
  // Is this a kudos day for count steps?
  const isKudos =
    step.type === 'count' &&
    step.days &&
    !step.days.includes(todayShort) &&
    count > 0;
  // Is this a kudos day for bool steps?
  const isBoolKudos =
    step.type === 'bool' &&
    step.days &&
    !step.days.includes(todayShort) &&
    count > 0;

  return (
    <Box key={step.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      {/* Step title and description */}
      <Box sx={{ flexGrow: 1 }}>
        <Typography fontWeight={500}>{step.title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {step.description}
        </Typography>
      </Box>
      {/* Render controls/status for this step */}
      <StepEditOrStatus
        step={step}
        editMode={editMode}
        count={count}
        isKudos={isKudos}
        isBoolKudos={isBoolKudos}
        stepLoading={stepLoading}
        todayShort={todayShort}
        handleStepInput={handleStepInput}
        handleEditStep={handleEditStep}
        handleIncrement={handleIncrement}
        handleDecrement={handleDecrement}
      />
    </Box>
  );
}

// Renders the correct control or status for a step based on edit mode, type, and status
function StepEditOrStatus({
  step,
  editMode,
  count,
  isKudos,
  isBoolKudos,
  stepLoading,
  todayShort,
  handleStepInput,
  handleEditStep,
  handleIncrement,
  handleDecrement,
}) {
  // If in edit mode, show edit button
  if (editMode) {
    return (
      <IconButton
        size="small"
        sx={{ ml: 1 }}
        onClick={() => handleEditStep(step.id)}
        color="primary"
      >
        <EditIcon fontSize="small" />
      </IconButton>
    );
  }

  // If step is suspended or completed, show status badge
  if (step.status === 'suspended' || step.status === 'completed') {
    return (
      <Box sx={{ ml: 2 }}>
        <Box
          component="span"
          sx={{
            display: 'inline-block',
            px: 2,
            py: 0.5,
            borderRadius: 2,
            fontWeight: 600,
            color:
              step.status === 'completed' ? 'success.main' : 'warning.dark',
            bgcolor:
              step.status === 'completed' ? 'success.light' : 'warning.light',
            fontSize: 14,
            letterSpacing: 1,
            textTransform: 'capitalize',
          }}
        >
          {step.status}
        </Box>
      </Box>
    );
  }

  // If step is boolean, show toggle with colored label
  if (step.type === 'bool') {
    return (
      <FormControlLabel
        control={
          <Switch
            checked={!!count}
            onChange={(e) => handleStepInput(step.id, e.target.checked ? 1 : 0)}
            color="success"
            sx={{
              '& .MuiSwitch-thumb': {
                bgcolor:
                  count === 0
                    ? 'error.main'
                    : isBoolKudos
                    ? 'warning.main'
                    : 'success.main',
              },
              '& .MuiSwitch-track': {
                bgcolor:
                  count === 0
                    ? 'error.light'
                    : isBoolKudos
                    ? 'warning.light'
                    : 'success.light',
                opacity: 1,
              },
            }}
          />
        }
        // Label: Absent if 0, Kudos if bool kudos, Present otherwise
        label={count === 0 ? 'Absent' : isBoolKudos ? 'Kudos' : 'Present'}
        labelPlacement="start"
        sx={{
          '.MuiFormControlLabel-label': {
            fontWeight: 700,
            color:
              count === 0
                ? 'error.dark'
                : isBoolKudos
                ? 'warning.dark'
                : 'success.dark',
            minWidth: 60,
            mr: 1,
          },
        }}
      />
    );
  }

  // For count steps, show increment/decrement and current value as a button group
  if (step.type === 'count') {
    return (
      <ButtonGroup
        variant="outlined"
        sx={{
          borderRadius: 8,
          bgcolor: isKudos
            ? 'warning.light'
            : count === 0
            ? 'error.light'
            : 'success.light',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          ml: 2,
          overflow: 'hidden',
        }}
        disableElevation
      >
        <IconButton
          size="small"
          color="error"
          onClick={() => handleDecrement(step, todayShort)}
          disabled={stepLoading[step.id]}
          sx={{
            borderRadius: 0,
            bgcolor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
          }}
        >
          <RemoveIcon />
        </IconButton>
        <Box
          sx={{
            px: 2,
            minWidth: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 18,
            color: 'text.primary',
            bgcolor: 'transparent',
            userSelect: 'none',
          }}
        >
          {count}
        </Box>
        <IconButton
          size="small"
          color="primary"
          onClick={() => handleIncrement(step, todayShort)}
          disabled={stepLoading[step.id]}
          sx={{
            borderRadius: 0,
            bgcolor: 'background.paper',
            borderLeft: '1px solid',
            borderColor: 'divider',
          }}
        >
          <AddCircleIcon />
        </IconButton>
      </ButtonGroup>
    );
  }

  return null;
}

export default withAuth(Target);
