import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import FormCrearTarea from './components/FormCrearTarea';
import TaskList from './components/TaskList';
import PriorityModal from './components/PriorityModal';
import useModal from './hooks/useModal';
import useTareas from './hooks/useTareas';
import type { Task } from './types';

const theme = createTheme();

function App() {
  const { tasks, addTask, updateTask, deleteTask } = useTareas();
  const { isOpen, selectedTask, openModal, closeModal } = useModal();

  const handleTaskAction = (action: { type: string; taskId: string }) => {
    const { type, taskId } = action;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (type === 'delete') {
      // Confirmación simple; se refinará en la tarea 8
      const confirmed = window.confirm('¿Seguro que quieres eliminar esta tarea?');
      if (confirmed) {
        deleteTask(taskId);
      }
    } else if (type === 'changeStatus') {
      const nextStatus: Task['status'] =
        task.status === 'pending'
          ? 'in_progress'
          : task.status === 'in_progress'
            ? 'done'
            : 'pending';
      updateTask(taskId, { status: nextStatus });
    } else if (type === 'edit' || type === 'view') {
      openModal(task);
    }
  };

  const handleSaveFromModal = (id: string, changes: Partial<Omit<Task, 'id'>>) => {
    updateTask(id, changes);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar totalTasks={tasks.length} />
      <FormCrearTarea onAddTask={addTask} />
      <TaskList tasks={tasks} onAction={handleTaskAction} />
      <PriorityModal
        open={isOpen}
        task={selectedTask}
        onClose={closeModal}
        onSave={handleSaveFromModal}
      />
    </ThemeProvider>
  );
}

export default App;