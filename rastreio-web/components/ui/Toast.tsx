'use client';

import { useEffect } from 'react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export function Toast({ toasts, onRemove }: ToastProps) {
  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(
      () => onRemove(toast.id),
      toast.duration || 3000
    );
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const colors = {
    success: 'bg-success-DEFAULT',
    error: 'bg-danger-DEFAULT',
    info: 'bg-info-DEFAULT',
    warning: 'bg-warning-DEFAULT',
  };

  return (
    <div
      className={`${colors[toast.type]} text-text-inverse px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-4 max-w-sm`}
    >
      <span>{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-text-inverse hover:opacity-75"
      >
        ✕
      </button>
    </div>
  );
}
