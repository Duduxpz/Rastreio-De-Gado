'use client';

import { useState, useCallback } from 'react';
import { ToastMessage } from '@/components/ui/Toast';

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (
      message: string,
      type: 'success' | 'error' | 'info' | 'warning' = 'info',
      duration: number = 3000
    ) => {
      const id = Math.random().toString(36).substring(2, 11);
      setToasts((prev) => [...prev, { id, message, type, duration }]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return { toasts, addToast, removeToast, clearToasts };
}
