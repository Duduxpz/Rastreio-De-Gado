'use client';

import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-bg-surface rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-bg-border">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-bg-border bg-bg-surface">
          <h2 className="text-xl font-bold text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex gap-3 p-6 border-t border-bg-border bg-bg-elevated justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
