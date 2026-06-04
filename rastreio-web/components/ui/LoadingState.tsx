import { Spinner } from './Spinner';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({
  message = 'Carregando...',
}: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Spinner size="lg" />
      <p className="mt-4 text-text-secondary">{message}</p>
    </div>
  );
}
