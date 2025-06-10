'use client';

// Import required dependencies and components
import withAuth from '@/utils/withAuth';
import { useState, useEffect, useRef, useCallback } from 'react';
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
  Switch,
  FormControlLabel,
  ButtonGroup,
  Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import MenuIcon from '@mui/icons-material/Menu';
import PublicIcon from '@mui/icons-material/Public';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import RemoveIcon from '@mui/icons-material/Remove';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useLoader } from '@/context/LoaderContext';
import { useSnackbarUtils } from '@/context/SnackbarContext';
import api from '@/utils/axios';
import tinycolor from 'tinycolor2';
import { ICON_MAP } from '@/utils/muiIcons';

// Utility: Returns today's date in YYYY-MM-DD format
function getToday() {
  return new Date().toISOString().split('T')[0];
}

// Utility: Returns today's short weekday string (e.g., 'Mon')
function getTodayShort() {
  return new Date().toLocaleDateString('en-US', { weekday: 'short' });
}

// Debounce Function
function useDebounce(func, delay) {
  const timeoutRef = useRef(null);

  const debouncedFunction = useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        func(...args);
      }, delay);
    },
    [func, delay]
  );

  return debouncedFunction;
}

// Main Target component
function Target() {
  // State for edit mode (true = edit, false = view)
  const [editMode, setEditMode] = useState(false);
  // State for all headings and their steps
  const [data, setData] = useState([]);
  // State for all headings (for heading selection)
  const [headings, setHeadings] = useState([]);
  // State for current step input values (by step id)
  const [stepInputs, setStepInputs] = useState({});
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
            step.targetHeading?.id || step.targetHeadingId || 'others-heading';
          if (!grouped[headingId]) {
            grouped[headingId] = {
              heading: step.targetHeading
                ? step.targetHeading
                : { id: 'others-heading', name: 'Others' },
              steps: [],
            };
          }
          grouped[headingId].steps.push(step);
        });

        // Convert grouped object to array
        const dataArray = Object.values(grouped);

        // Sort the steps within each heading
        dataArray.forEach((group) => {
          group.steps.sort((a, b) => {
            // Assuming steps have a property like 'order' or 'createdAt'
            // Replace 'order' with the actual property you want to sort by
            return a.order - b.order;
          });
        });

        setData(dataArray);
      } catch {
        setData([]);
        setHeadings([]);
      }
      hideLoader();
    }
    fetchData();
  }, [hideLoader, showLoader]);

  // Set initial stepInputs when data loads
  useEffect(() => {
    showLoader();
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
  }, [data, hideLoader, showLoader]);

  // Generic function to save step data
  const saveStepData = async (stepId, value) => {
    try {
      await api.post(`targetSteps/${stepId}/data`, {
        date: getToday(),
        count: value,
      });
      notify('Step updated!', 'success');
    } catch (error) {
      console.error('Error saving step data:', error);
      notify('Failed to update step', 'error');
    }
  };

  // Debounced save function
  const debouncedSaveStepData = useDebounce(saveStepData, 500);

  // Handles updating the value for a step input
  const handleStepInput = (stepId, value) => {
    if (typeof value === 'number' && value < 0) value = 0;
    setStepInputs((inputs) => ({ ...inputs, [stepId]: value }));
    debouncedSaveStepData(stepId, value); // Call debounced save
  };

  // Handles incrementing the value for a count step
  const handleIncrement = (step, todayShort) => {
    setStepInputs((inputs) => {
      const newValue = Number(inputs[step.id] || 0) + 1;
      setStepInputs((inputs) => ({ ...inputs, [step.id]: newValue }));
      debouncedSaveStepData(step.id, newValue);
      return { ...inputs, [step.id]: newValue };
    });
  };

  // Handles decrementing the value for a count step
  const handleDecrement = (step, todayShort) => {
    setStepInputs((inputs) => {
      const newValue = Math.max(0, Number(inputs[step.id] || 0) - 1);
      setStepInputs((inputs) => ({ ...inputs, [step.id]: newValue }));
      debouncedSaveStepData(step.id, newValue);
      return { ...inputs, [step.id]: newValue };
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

  // Get today's short weekday string
  const todayShort = getTodayShort();

  // --- Main Render ---
  return (
    <Box sx={{ p: 2, position: 'relative', minHeight: '70vh', mb: 8 }}>
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
            setData={setData}
            steps={steps}
            editMode={editMode}
            handleEditHeading={handleEditHeading}
            stepInputs={stepInputs}
            todayShort={todayShort}
            handleStepInput={handleStepInput}
            handleEditStep={handleEditStep}
            handleIncrement={handleIncrement}
            handleDecrement={handleDecrement}
          />
        ))
      )}

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

// Accordion for a single heading and its steps
export function HeadingAccordion({
  heading,
  setData,
  steps,
  editMode,
  handleEditHeading,
  stepInputs,
  todayShort,
  handleStepInput,
  handleEditStep,
  handleIncrement,
  handleDecrement,
  readOnly = false, // Add readOnly prop
  StepComponent = StepRow, // Add default StepRow as StepComponent
}) {
  // Use heading.color or fallback
  const headingColor = heading.color || '#FF7043';
  const headingTextColor = getContrastText(headingColor);
  const detailsBg = getSubtleBg(headingColor);

  const toggleHeadingExpanded = async (headingId, isExpanded) => {
    try {
      const response = await api.patch(`targetHeadings/${headingId}/toggle`, {
        isExpanded,
      });
    } catch (error) {
      console.error('Failed to toggle heading expanded state:', error);
      // Optionally, show a snackbar error message
    }
  };

  const debouncedToggleHeadingExpanded = useDebounce(
    toggleHeadingExpanded,
    500
  );

  const handleAccordionChange = (event, isExpanded) => {
    // Optimistically update the local state
    setData((prevData) => {
      return prevData.map((group) => {
        if (group.heading.id === heading.id) {
          return {
            ...group,
            heading: {
              ...group.heading,
              isExpanded: !group.heading.isExpanded, // Toggle the local state
            },
          };
        }
        return group;
      });
    });

    if (readOnly) return; // Prevent updating toggle if readOnly
    if (heading.id === 'others-heading') return; // Don't trigger API call for "Others" heading

    debouncedToggleHeadingExpanded(heading.id, !heading.isExpanded);
  };

  return (
    <Accordion
      defaultExpanded={readOnly}
      expanded={heading.isExpanded}
      onChange={handleAccordionChange}
      sx={{
        mb: 2,
        borderRadius: '12px !important',
        overflow: 'hidden',
        '&:before': {
          display: 'none',
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: headingTextColor }} />}
        sx={{
          bgcolor: headingColor,
          color: headingTextColor,
          fontWeight: 700,
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
        {/* Edit heading button (only in edit mode and not for 'others-heading') */}
        {editMode && heading.id !== 'others-heading' && (
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
          borderBottomLeftRadius: '12px',
          borderBottomRightRadius: '12px',
        }}
      >
        <Box sx={{ py: 1 }}>
          {/* Show "No steps" if there are no steps */}
          {steps.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              marginY={2}
            >
              No steps
            </Typography>
          ) : (
            // Render each step in this heading
            steps.map((step, idx) => (
              <Box
                key={step.id}
                sx={{ display: 'inline-block', mr: 2, width: '100%' }}
              >
                <StepComponent
                  step={step}
                  editMode={editMode}
                  stepInputs={stepInputs}
                  todayShort={todayShort}
                  handleStepInput={handleStepInput}
                  handleEditStep={handleEditStep}
                  handleIncrement={handleIncrement}
                  handleDecrement={handleDecrement}
                  headingColor={heading.color}
                  readOnly={readOnly} // Pass readOnly to StepComponent
                />
                {/* Divider between steps except after last */}
                {idx < steps.length - 1 && <Divider sx={{ mx: 0, my: 1 }} />}
              </Box>
            ))
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
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
      icon={<SettingsIcon />}
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

// Renders a single step row (title, description, and controls)
function StepRow({
  step,
  editMode,
  stepInputs,
  todayShort,
  handleStepInput,
  handleEditStep,
  handleIncrement,
  handleDecrement,
  headingColor,
  readOnly = false, // Add readOnly prop
}) {
  // Current value for this step
  const count = stepInputs[step.id] ?? 0;

  // Whether this step is a "kudos" (extra day)
  const isKudos =
    step.type === 'count' &&
    step.days &&
    !step.days.includes(todayShort) &&
    count > 0;
  const isBoolKudos =
    step.type === 'bool' &&
    step.days &&
    !step.days.includes(todayShort) &&
    count > 0;

  // Icon for this step
  const IconComp = ICON_MAP[step.icon] || ICON_MAP['Star'];
  const hasDescription = !!step.description;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 2,
        py: 1,
        transition: 'background 0.2s',
        '&:hover': {
          backgroundColor: 'action.hover', // MUI's default hover color
        },
        cursor: 'default', // No pointer/click effect
        borderRadius: 2,
      }}
    >
      {/* Icon with heading color */}
      <Box
        sx={{
          mr: 2,
          mt: hasDescription ? '2px' : 0,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <IconComp
          fontSize="large"
          sx={{ color: headingColor || 'primary.main' }}
        />
      </Box>
      {/* Step title and description */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: hasDescription ? 'flex-start' : 'center',
        }}
      >
        <Typography fontWeight={500}>
          {step.title}
          {readOnly
            ? null
            : step.isPublic && <PublicIcon sx={{ height: '1ch' }} />}
        </Typography>
        {hasDescription && (
          <Typography variant="body2" color="text.secondary">
            {step.description}
          </Typography>
        )}
      </Box>
      {/* Render controls/status for this step */}
      <StepEditOrStatus
        step={step}
        editMode={editMode}
        count={count}
        isKudos={isKudos}
        isBoolKudos={isBoolKudos}
        todayShort={todayShort}
        handleStepInput={handleStepInput}
        handleEditStep={handleEditStep}
        handleIncrement={handleIncrement}
        handleDecrement={handleDecrement}
        readOnly={readOnly} // Pass readOnly to StepEditOrStatus
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
  todayShort,
  handleStepInput,
  handleEditStep,
  handleIncrement,
  handleDecrement,
  readOnly = false, // Add readOnly prop
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
      <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
        {step.status === 'completed' ? (
          <CheckCircleIcon sx={{ color: 'success.main', mr: 0.5 }} />
        ) : (
          <WarningIcon sx={{ color: 'warning.dark', mr: 0.5 }} />
        )}
        {/* <Box
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
        </Box> */}
      </Box>
    );
  }

  // If step is boolean, show toggle with colored label
  if (step.type === 'bool') {
    // console.log ("im boolenan step", step, count, isKudos);
    return readOnly ? (
      <Typography
        sx={{
          fontWeight: 700,
          color:
            count === 0
              ? 'error.dark'
              : isKudos
              ? 'warning.dark'
              : 'success.dark',
          minWidth: 60,
          mr: 1,
        }}
      >
        {count === 0 ? 'Absent' : isKudos ? 'Kudos' : 'Present'}
      </Typography>
    ) : (
      <FormControlLabel
        control={
          <Switch
            checked={!!count}
            onChange={(e) => {
              const newValue = e.target.checked ? 1 : 0;
              handleStepInput(step.id, newValue);
            }}
            color="success"
            sx={{
              '& .MuiSwitch-thumb': {
                bgcolor:
                  count === 0
                    ? 'error.main'
                    : isKudos
                    ? 'warning.main'
                    : 'success.main',
              },
              '& .MuiSwitch-track': {
                bgcolor:
                  count === 0
                    ? 'error.light'
                    : isKudos
                    ? 'warning.light'
                    : 'success.light',
                opacity: 1,
              },
            }}
          />
        }
        // Label: Absent if 0, Kudos if bool kudos, Present otherwise
        label={count === 0 ? 'Absent' : isKudos ? 'Kudos' : 'Present'}
        labelPlacement="start"
        sx={{
          '.MuiFormControlLabel-label': {
            fontWeight: 700,
            color:
              count === 0
                ? 'error.dark'
                : isKudos
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
    return readOnly ? (
      <Box
        sx={{
          px: 2,
          minWidth: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: 18,
          color: isKudos
            ? 'warning.light'
            : count === 0
            ? 'error.light'
            : 'success.light',
          bgcolor: 'transparent',
          userSelect: 'none',
          ml: 2,
        }}
      >
        {count}
      </Box>
    ) : (
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
