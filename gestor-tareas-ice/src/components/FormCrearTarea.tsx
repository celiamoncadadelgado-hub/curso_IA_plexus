import React, { useState } from 'react';
import { Button, TextField, Box, Typography } from '@mui/material';
import { validarTarea, calcularScore } from '../utils/ice';
import gemini from '../services/gemini';
import type { Task, TaskValidationResult } from '../types';

interface FormCrearTareaProps {
  onAddTask: (task: Omit<Task, 'id'>) => void;
}

const FormCrearTarea: React.FC<FormCrearTareaProps> = ({ onAddTask }) => {
  const [formData, setFormData] = useState({
    description: '',
    impact: 1,
    confidence: 1,
    ease: 1,
    explanation: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const score = calcularScore(formData.impact, formData.confidence, formData.ease);

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'description' ? event.target.value : Number(event.target.value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAnalyze = async () => {
    if (!formData.description.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const analysis = await gemini.analyzeTask(formData.description);
      setFormData(prev => ({
        ...prev,
        impact: analysis.impact,
        confidence: analysis.confidence,
        ease: analysis.ease,
        explanation: analysis.explanation,
      }));
    } catch (err) {
      setError('Error al analizar la tarea');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const taskData: Omit<Task, 'id'> = {
      description: formData.description,
      impact: formData.impact,
      confidence: formData.confidence,
      ease: formData.ease,
      status: 'pending',
      explanation: formData.explanation,
    };
    const validation: TaskValidationResult = validarTarea(taskData);
    if (validation.isValid) {
      onAddTask(taskData);
      setFormData({
        description: '',
        impact: 1,
        confidence: 1,
        ease: 1,
        explanation: '',
      });
    } else {
      setError('Datos inválidos. Revisa la descripción y los valores ICE.');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      <Typography variant="h5" gutterBottom>Crear Tarea</Typography>
      <TextField
        fullWidth
        label="Descripción"
        value={formData.description}
        onChange={handleChange('description')}
        margin="normal"
        multiline
        rows={3}
        helperText={`${formData.description.length}/200`}
      />
      <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
        <TextField
          label="Impacto (1-10)"
          type="number"
          value={formData.impact}
          onChange={handleChange('impact')}
          inputProps={{ min: 1, max: 10 }}
        />
        <TextField
          label="Confianza (1-10)"
          type="number"
          value={formData.confidence}
          onChange={handleChange('confidence')}
          inputProps={{ min: 1, max: 10 }}
        />
        <TextField
          label="Facilidad (1-10)"
          type="number"
          value={formData.ease}
          onChange={handleChange('ease')}
          inputProps={{ min: 1, max: 10 }}
        />
      </Box>
      <Typography>Score ICE: {score.toFixed(2)}</Typography>
      <TextField
        fullWidth
        label="Explicación"
        value={formData.explanation}
        onChange={handleChange('explanation')}
        margin="normal"
        multiline
        rows={2}
      />
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button variant="outlined" onClick={handleAnalyze} disabled={loading}>
          {loading ? 'Analizando con IA...' : 'Analizar con IA'}
        </Button>
        <Button type="submit" variant="contained">Añadir Tarea</Button>
      </Box>
      {error && <Typography color="error">{error}</Typography>}
    </Box>
  );
};

export default FormCrearTarea;