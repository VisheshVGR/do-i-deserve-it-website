'use client';

import { useState, useEffect } from 'react';
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
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import MenuIcon from '@mui/icons-material/Menu';
import withAuth from '@/utils/withAuth';
import { useLoader } from '@/context/LoaderContext';
import { useSnackbarUtils } from '@/context/SnackbarContext';
import api from '@/utils/axios';
import tinycolor from 'tinycolor2';

function Todo() {
  // State
  const [todos, setTodos] = useState([]);
  const [headings, setHeadings] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [expanded, setExpanded] = useState(() => {
    if (typeof window === 'undefined') return {};
    const saved = localStorage.getItem('todoAccordionStates');
    return saved ? JSON.parse(saved) : {};
  });
  const [speedDialOpen, setSpeedDialOpen] = useState(false);

  // Hooks
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();
  const { notify } = useSnackbarUtils();

  // Fetch todos and headings
  const fetchData = async () => {
    showLoader();
    try {
      const [todosRes, headingsRes] = await Promise.all([
        api.get('todos'),
        api.get('todoHeadings')
      ]);
      setTodos(todosRes.data || []);
      setHeadings(headingsRes.data || []);
    } catch (err) {
      notify('Failed to load data', 'error');
    }
    hideLoader();
  };

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Group todos by heading
  const groupedTodos = todos.reduce((acc, todo) => {
    const headingId = todo.todoHeadingId || 'others';
    if (!acc[headingId]) {
      acc[headingId] = [];
    }
    acc[headingId].push(todo);
    return acc;
  }, {});

  // Sort todos within each group (completed ones at bottom)
  Object.keys(groupedTodos).forEach(headingId => {
    groupedTodos[headingId].sort((a, b) => {
      if (a.isDone === b.isDone) return 0;
      return a.isDone ? 1 : -1;
    });
  });

  const handleToggleTodo = async (todoId, currentStatus) => {
    showLoader();
    try {
      const payload = {
        isDone: !currentStatus,
        title: todos.find(t => t.id === todoId)?.title || '', // Keep existing title
        todoHeadingId: todos.find(t => t.id === todoId)?.todoHeadingId // Keep existing heading
      };

      await api.put(`todos/${todoId}`, payload);
      fetchData();
    } catch (err) {
      notify('Failed to update todo', 'error');
    }
    hideLoader();
  };

  const handleDeleteHeading = async (e, headingId) => {
    e.stopPropagation();
    showLoader();
    try {
      await api.delete(`todoHeadings/${headingId}`);
      notify('Heading deleted', 'success');
      fetchData();
    } catch (err) {
      notify('Failed to delete heading', 'error');
    }
    hideLoader();
  };

  // Add this useEffect to save expanded state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('todoAccordionStates', JSON.stringify(expanded));
    }
  }, [expanded]);

  // Update handleHeadingClick to properly update expanded state
  const handleHeadingClick = (headingId) => (event, isExpanded) => {
    const newExpanded = {
      ...expanded,
      [headingId]: isExpanded
    };
    setExpanded(newExpanded);
  };

  // Utility functions from target page
  function getContrastText(bgColor) {
    return tinycolor(bgColor).isLight() ? '#222' : '#fff';
  }

  function getSubtleBg(bgColor) {
    return tinycolor(bgColor).setAlpha(0.08).toRgbString();
  }

  // TodoHeadingAccordion component (similar to HeadingAccordion)
  function TodoHeadingAccordion({ heading, todos, editMode, handleEdit, expanded }) {
    const headingColor = heading.color || '#FF7043';
    const headingTextColor = getContrastText(headingColor);
    const detailsBg = getSubtleBg(headingColor);

    return (
      <Accordion
        expanded={expanded}
        onChange={(e, isExpanded) => handleHeadingClick(heading.id)(e, isExpanded)}
        sx={{
          mb: 2,
          borderRadius: '12px !important', // Force rounded corners always
          overflow: 'hidden', // Ensure content doesn't overflow rounded corners
          '&:before': {
            display: 'none', // Remove default divider
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
              {heading.name} ({todos.length})
            </Typography>
          </Box>
          {editMode && (
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

  return (
    <Box sx={{ p: 2, minHeight: '70vh', position: 'relative' }}>
      {headings.length === 0 && todos.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ mt: 8 }}>
          No todos yet. Add some to get started!
        </Typography>
      ) : (
        <>
          {/* Render headings with their todos using TodoHeadingAccordion */}
          {headings.map(heading => (
            <TodoHeadingAccordion
              key={heading.id}
              heading={heading}
              todos={groupedTodos[heading.id] || []}
              editMode={editMode}
              handleEdit={(id) => router.push(`/todo/heading-form?id=${id}`)}
              expanded={expanded[heading.id] ?? false} // Add this prop
            />
          ))}

          {/* Others section using TodoHeadingAccordion */}
          {groupedTodos.others && (
            <TodoHeadingAccordion
              heading={{ id: 'others', name: 'Others', color: 'grey.400' }}
              todos={groupedTodos.others}
              editMode={editMode}
              handleEdit={() => {}}
              expanded={expanded['others'] ?? false} // Add this prop
            />
          )}
        </>
      )}

      {/* Speed Dial styled like Target page */}
      <SpeedDial
        ariaLabel="Todo actions"
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
        icon={<SettingsIcon />}  // Changed from EditIcon
        open={speedDialOpen}
        onClick={() => setSpeedDialOpen((prev) => !prev)}
        onClose={() => setSpeedDialOpen(false)}
        direction="up"
      >
        <SpeedDialAction
          icon={editMode ? <DoneIcon /> : <EditIcon />}
          tooltipTitle={editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
          onClick={() => {
            setEditMode(prev => !prev);
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
    </Box>
  );
}

export default withAuth(Todo);
