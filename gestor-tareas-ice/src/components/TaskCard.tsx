import React from 'react';
import { Card, CardContent, Typography, Chip, Button, Box } from '@mui/material';
import { calcularScore, getPriorityLabel } from '../utils/ice';
import type { Task, PriorityLabel } from '../types';

interface TaskCardProps {
  task: Task;
  onAction: (action: { type: string; taskId: string }) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onAction }) => {
  const score = calcularScore(task.impact, task.confidence, task.ease);

  const getScoreColor = (score: number) => {
    const label: PriorityLabel = getPriorityLabel(score);
    if (label === 'high') return 'success';
    if (label === 'medium') return 'warning';
    return 'default';
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Esperando';
      case 'in_progress': return 'En curso';
      case 'done': return 'Hecha';
      default: return status;
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {task.description.length > 100 ? `${task.description.substring(0, 100)}...` : task.description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Chip label={`ICE: ${score.toFixed(1)}`} color={getScoreColor(score)} size="small" />
              <Chip label={getStatusLabel(task.status)} variant="outlined" size="small" />
            </Box>
            <Typography variant="body2" color="text.secondary">
              I: {task.impact} | C: {task.confidence} | E: {task.ease}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button size="small" onClick={() => onAction({ type: 'edit', taskId: task.id })}>
              Ver por qué
            </Button>
            <Button size="small" onClick={() => onAction({ type: 'changeStatus', taskId: task.id })}>
              Cambiar estado
            </Button>
            <Button size="small" color="error" onClick={() => onAction({ type: 'delete', taskId: task.id })}>
              Eliminar
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TaskCard;