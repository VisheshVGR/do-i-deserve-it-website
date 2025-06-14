'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  SpeedDial,
  SpeedDialAction,
  Checkbox,
  Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAddCheck';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import MenuIcon from '@mui/icons-material/Menu';
import withAuth from '@/utils/withAuth';
import { useLoader } from '@/context/LoaderContext';
import { useSnackbarUtils } from '@/context/SnackbarContext';
import api from '@/utils/axios';
import tinycolor from 'tinycolor2';

// Utility functions
function getContrastText(bgColor) {
  return tinycolor(bgColor).isLight() ? '#222' : '#fff';
}

function getSubtleBg(bgColor) {
  return tinycolor(bgColor).setAlpha(0.08).toRgbString();
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

// TodoHeadingAccordion component (similar to HeadingAccordion)
function TodoHeadingAccordion({
  heading,
  todos,
  editMode,
  handleToggleTodo,
  handleEdit,
  handleHeadingClick,
  router,
}) {
  const headingColor = heading.color || '#FF7043';
  const headingTextColor = getContrastText(headingColor);
  const detailsBg = getSubtleBg(headingColor);

  return (
    <Accordion
      expanded={heading.isExpanded}
      onChange={handleHeadingClick(heading)}
      sx={{
        mb: 2,
        borderRadius: '12px !important',
        overflow: 'hidden',
        '&:before': {
          display: 'none',
        },
        transition: 'height 0.3s ease-in-out',
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
            {heading.name} ({todos.length})
          </Typography>
        </Box>
        {/* Only show edit icon if not "others-heading" */}
        {editMode && heading.id !== 'others-heading' && (
          <IconButton
            size="small"
            sx={{ ml: 1, color: headingTextColor }}
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(heading.id);
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
        {todos.length === 0 ? (
          <Typography color="text.secondary" align="center" marginY={2}>
            No todos in this heading
          </Typography>
        ) : (
          todos.map((todo, idx) => (
            <Box key={todo.id}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 2,
                  py: 1,
                  transition: 'background 0.2s',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  cursor: 'default',
                  borderRadius: 2,
                }}
              >
                <Checkbox
                  checked={todo.isDone}
                  onChange={() => handleToggleTodo(todo.id, todo.isDone)}
                />
                <Typography
                  sx={{
                    flexGrow: 1,
                    textDecoration: todo.isDone ? 'line-through' : 'none',
                    color: todo.isDone ? 'text.disabled' : 'text.primary',
                  }}
                >
                  {todo.title}
                </Typography>
                {editMode && (
                  <IconButton
                    size="small"
                    onClick={() => router.push(`/todo/todo-form?id=${todo.id}`)}
                  >
                    <EditIcon />
                  </IconButton>
                )}
              </Box>
              {todos.length > 1 && idx < todos.length - 1 && (
                <Divider sx={{ mx: 0, my: 1 }} />
              )}
            </Box>
          ))
        )}
      </AccordionDetails>
    </Accordion>
  );
}

// SpeedDial component
function TodoSpeedDial({ editMode, setEditMode, speedDialOpen, setSpeedDialOpen, router }) {
  return (
    <SpeedDial
      ariaLabel="Todo actions"
      sx={{ position: 'fixed', bottom: 32, right: 32 }}
      icon={<SettingsIcon />} // Changed from EditIcon
      open={speedDialOpen}
      onClick={() => setSpeedDialOpen((prev) => !prev)}
      onClose={() => setSpeedDialOpen(false)}
      direction="up"
    >
      <SpeedDialAction
        icon={editMode ? <DoneIcon /> : <EditIcon />}
        tooltipTitle={editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
        onClick={() => {
          setEditMode((prev) => !prev);
          setSpeedDialOpen(false);
        }}
        FabProps={{ color: editMode ? 'success' : 'primary' }}
      />
      <SpeedDialAction
        icon={<PlaylistAddCheckIcon sx={{ color: '#388e3c' }} />}
        tooltipTitle="Add Todo"
        onClick={() => {
          router.push('/todo/todo-form');
          setSpeedDialOpen(false);
        }}
        FabProps={{ color: 'success' }}
      />
      <SpeedDialAction
        icon={<PlaylistAddIcon sx={{ color: '#1976d2' }} />}
        tooltipTitle="Add Heading"
        onClick={() => {
          router.push('/todo/heading-form');
          setSpeedDialOpen(false);
        }}
        FabProps={{ color: 'primary' }}
      />
    </SpeedDial>
  );
}

function Todo() {
  // State
  const [todos, setTodos] = useState([]);
  const [headings, setHeadings] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);

  // Hooks
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();
  const { notify } = useSnackbarUtils();

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

  useEffect(() => {
    // Fetch todos and headings
    const fetchData = async () => {
      showLoader();
      try {
        const [todosRes, headingsRes] = await Promise.all([
          api.get('todos'),
          api.get('todoHeadings'),
        ]);
        setTodos(todosRes.data || []);
        setHeadings(headingsRes.data || []);
      } catch (err) {
        notify('Failed to load data', 'error');
      }
      hideLoader();
    };

    
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Group todos by heading
  const groupedTodos = todos.reduce((acc, todo) => {
    let headingId = todo.todoHeadingId || 'others-heading';
    // Check if the heading exists in the headings array
    const headingExists = headings.some((heading) => heading.id === headingId);
    // If the heading doesn't exist, assign it to 'others-heading'
    if (!headingExists && headingId !== 'others-heading') {
      headingId = 'others-heading';
    }
    if (!acc[headingId]) {
      acc[headingId] = [];
    }
    acc[headingId].push(todo);
    return acc;
  }, {});

  // Sort todos within each group (completed ones at bottom)
  Object.keys(groupedTodos).forEach((headingId) => {
    groupedTodos[headingId].sort((a, b) => {
      if (a.isDone === b.isDone) return 0;
      return a.isDone ? 1 : -1;
    });
  });

  const handleToggleTodo = async (todoId, currentStatus) => {
    showLoader();
    try {
      await api.patch(`todos/${todoId}/toggleIsDone`);
      fetchData();
    } catch (err) {
      notify('Failed to update todo', 'error');
    }
    hideLoader();
  };

  const toggleHeadingExpanded = async (headingId, isExpanded) => {
    try {
      const response = await api.patch(`todoHeadings/${headingId}/toggle`, {
        isExpanded,
      });
      // No need to update local state, fetchData() will refresh from server
    } catch (error) {
      console.error('Failed to toggle heading expanded state:', error);
      // Optionally, show a snackbar error message
      notify('Failed to update heading state', 'error');
    }
  };

  const debouncedToggleHeadingExpanded = useDebounce(
    toggleHeadingExpanded,
    500
  );

  // Update handleHeadingClick to properly update expanded state
  const handleHeadingClick = (heading) => (event, isExpanded) => {
    // Optimistically update the local state
    setHeadings((prevHeadings) =>
      prevHeadings.map((h) =>
        h.id === heading.id ? { ...h, isExpanded: !h.isExpanded } : h
      )
    );

    if (heading.id === 'others-heading') return; // Prevent API call for "Others" heading
    debouncedToggleHeadingExpanded(heading.id, !heading.isExpanded);
  };

  return (
    <Box sx={{ p: 2, minHeight: '70vh', position: 'relative', mb: 8 }}>
      {headings.length === 0 && todos.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ mt: 8 }}>
          No todos yet. Add some to get started!
        </Typography>
      ) : (
        <>
          {Object.entries(groupedTodos)
            .sort(([headingIdA], [headingIdB]) => {
              if (headingIdA === 'others-heading') {
                return 1; // Move 'others-heading' to the end
              }
              if (headingIdB === 'others-heading') {
                return -1; // Move 'others-heading' to the end
              }
              return 0; // Keep the original order for other headings
            })
            .map(([headingId, todos]) => {
              // Find the heading object for the current headingId
              const heading = headings.find((h) => h.id === headingId) || {
                id: 'others-heading',
                name: 'Others',
                color: 'grey.400',
              };

              return (
                <TodoHeadingAccordion
                  key={headingId}
                  heading={heading}
                  todos={todos}
                  editMode={editMode}
                  handleToggleTodo={handleToggleTodo}
                  handleEdit={(id) => router.push(`/todo/heading-form?id=${id}`)}
                  handleHeadingClick={handleHeadingClick}
                  router={router} // Pass router if needed inside the accordion
                />
              );
            })}
        </>
      )}

      {/* Speed Dial styled like Target page */}
      <TodoSpeedDial
        editMode={editMode}
        setEditMode={setEditMode}
        speedDialOpen={speedDialOpen}
        setSpeedDialOpen={setSpeedDialOpen}
        router={router}
      />
    </Box>
  );
}

export default withAuth(Todo);
