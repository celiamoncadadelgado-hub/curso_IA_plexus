import React from 'react';
import { Box, Typography } from '@mui/material';
import TaskCard from './TaskCard';
import type { Task } from '../types';
import { calcularScore } from '../utils/ice';

interface TaskListProps {
  tasks: Task[];
  onAction: (action: { type: string; taskId: string }) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onAction }) => {
  const sortedTasks = [...tasks].sort(
    (a, b) =>
      calcularScore(b.impact, b.confidence, b.ease) -
      calcularScore(a.impact, a.confidence, a.ease),
  );

  if (sortedTasks.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6">No hay tareas aún</Typography>
        <Typography>Crea tu primera tarea arriba</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Lista de Tareas</Typography>
      {sortedTasks.map(task => (
        <TaskCard key={task.id} task={task} onAction={onAction} />
      ))}
    </Box>
  );
};

export default TaskList;