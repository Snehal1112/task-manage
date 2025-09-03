import React, { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onAddTask: () => void;
  onToggleSearch?: () => void;
  onToggleCompleted?: () => void;
  onClearFilters?: () => void;
  onQuickComplete?: () => void;
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  onAddTask,
  onToggleSearch,
  onToggleCompleted,
  onClearFilters,
  onQuickComplete
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Ctrl/Cmd + N: Add new task
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        onAddTask();
      }

      // Ctrl/Cmd + K: Focus search (if available)
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        onToggleSearch?.();
      }

      // Ctrl/Cmd + T: Toggle task completion
      if ((event.ctrlKey || event.metaKey) && event.key === 't') {
        event.preventDefault();
        onToggleCompleted?.();
      }

      // Ctrl/Cmd + L: Clear filters
      if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
        event.preventDefault();
        onClearFilters?.();
      }

      // Ctrl/Cmd + Q: Quick complete task (mark as important and complete)
      if ((event.ctrlKey || event.metaKey) && event.key === 'q') {
        event.preventDefault();
        onQuickComplete?.();
      }

      // Ctrl/Cmd + /: Show shortcuts help
      if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault();
        showShortcutsHelp();
      }

      // Ctrl/Cmd + Shift + C: Toggle completed tasks
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        onToggleCompleted?.();
      }

      // Ctrl/Cmd + Shift + X: Clear all filters
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'X') {
        event.preventDefault();
        onClearFilters?.();
      }

      // Space: Quick complete (when task is focused)
      if (event.key === ' ' && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
        // Only trigger if not in an input field and a task might be focused
        if (!(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) {
          event.preventDefault();
          onQuickComplete?.();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onAddTask, onToggleSearch, onToggleCompleted, onClearFilters, onQuickComplete]);

  const showShortcutsHelp = () => {
    const shortcuts = [
      'Ctrl/Cmd + N: Add new task',
      'Ctrl/Cmd + K: Focus search',
      'Ctrl/Cmd + /: Show this help',
      'Ctrl/Cmd + Shift + C: Toggle completed tasks',
      'Ctrl/Cmd + Shift + X: Clear all filters',
      'Space: Quick complete task (when focused)',
      'Click and drag: Move tasks between quadrants',
      'Double-click: Edit task'
    ];

    alert(`Keyboard Shortcuts:\n\n${shortcuts.join('\n')}`);
  };

  // This component doesn't render anything visible
  return null;
};

export default KeyboardShortcuts;
