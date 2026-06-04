interface ConfirmProps {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
  isDangerous?: boolean;
}

import { Modal } from './Modal';
import { Button } from './Button';

export function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  isOpen,
  isDangerous = false,
}: ConfirmProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={isDangerous ? 'danger' : 'primary'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {description && (
        <p className="text-text-secondary">{description}</p>
      )}
    </Modal>
  );
}
