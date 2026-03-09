import { useState, useCallback } from 'react';
import type { Task } from '../types';

const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const openModal = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setSelectedTask(null);
  }, []);

  return { isOpen, selectedTask, openModal, closeModal };
};

export default useModal;