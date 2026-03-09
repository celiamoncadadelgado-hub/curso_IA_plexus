import { useCallback, useMemo } from 'react';
import type { Task } from '../types';
import { LOCAL_STORAGE_KEY } from '../constants';
import useLocalStorage from './useLocalStorage';

const useTareas = () => {
  const [tasks, setTasks] = useLocalStorage<Task[]>(LOCAL_STORAGE_KEY, []);

  const addTask = useCallback(
    (task: Omit<Task, 'id'>) => {
      const newTask: Task = {
        ...task,
        id: Date.now().toString(), // simple id generation
      };
      setTasks(prev => [...prev, newTask]);
    },
    [setTasks],
  );

  const updateTask = useCallback(
    (id: string, changes: Partial<Omit<Task, 'id'>>) => {
      setTasks(prev =>
        prev.map(task => (task.id === id ? { ...task, ...changes } : task)),
      );
    },
    [setTasks],
  );

  const deleteTask = useCallback(
    (id: string) => {
      setTasks(prev => prev.filter(task => task.id !== id));
    },
    [setTasks],
  );

  const sortedTasks = useMemo(
    () => [...tasks].sort((a, b) => a.description.localeCompare(b.description)),
    [tasks],
  );

  // Expose both `tasks` and `tareas` for backwards compatibility
  return {
    tasks,
    tareas: tasks,
    sortedTasks,
    addTask,
    updateTask,
    deleteTask,
  };
};

export default useTareas;