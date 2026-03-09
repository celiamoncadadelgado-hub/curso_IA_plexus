import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
} from '@mui/material';
import { calcularScore, validarTarea } from '../utils/ice';
import type { Task, TaskValidationResult } from '../types';

interface PriorityModalProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (id: string, changes: Partial<Omit<Task, 'id'>>) => void;
}

const PriorityModal: React.FC<PriorityModalProps> = ({ open, task, onClose, onSave }) => {
  const [description, setDescription] = useState('');
  const [formData, setFormData] = useState({
    impact: 1,
    confidence: 1,
    ease: 1,
    explanation: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setFormData({
        impact: task.impact,
        confidence: task.confidence,
        ease: task.ease,
        explanation: task.explanation,
      });
      setDescription(task.description);
      setError(null);
    }
  }, [task]);

  const score = calcularScore(formData.impact, formData.confidence, formData.ease);

  const handleChange =
    (field: 'impact' | 'confidence' | 'ease') =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [field]: Number(event.target.value) }));
    };

  const handleSave = () => {
    if (task) {
      const validation: TaskValidationResult = validarTarea({
        description,
        impact: formData.impact,
        confidence: formData.confidence,
        ease: formData.ease,
      });

      if (!validation.isValid) {
        setError('Datos inválidos. Revisa la descripción y los valores ICE.');
        return;
      }

      onSave(task.id, {
        description,
        impact: formData.impact,
        confidence: formData.confidence,
        ease: formData.ease,
        explanation: formData.explanation,
      });
      onClose();
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Prioridad ICE</DialogTitle>
      <DialogContent>
        <TextField
          label="Descripción de la tarea"
          value={description}
          onChange={e => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={3}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
          <TextField
            label="Impacto (1-10)"
            type="number"
            value={formData.impact}
            onChange={handleChange('impact')}
            inputProps={{ min: 1, max: 10 }}
            fullWidth
          />
          <TextField
            label="Confianza (1-10)"
            type="number"
            value={formData.confidence}
            onChange={handleChange('confidence')}
            inputProps={{ min: 1, max: 10 }}
            fullWidth
          />
          <TextField
            label="Facilidad (1-10)"
            type="number"
            value={formData.ease}
            onChange={handleChange('ease')}
            inputProps={{ min: 1, max: 10 }}
            fullWidth
          />
        </Box>
        <Typography>Score ICE: {score.toFixed(2)}</Typography>
        <TextField
          label="Explicación"
          value={formData.explanation}
          onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
          fullWidth
          multiline
          rows={3}
          sx={{ mt: 2 }}
        />
        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PriorityModal;