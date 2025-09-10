import { useState, useCallback } from 'react';

// Hook for handling async errors in functional components
export const useAsyncError = () => {
  const [, setState] = useState();

  return useCallback((error: Error) => {
    setState(() => {
      throw error;
    });
  }, []);
};
