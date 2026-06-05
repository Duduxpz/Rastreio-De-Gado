export const notificarDashboard = () => {
  // Dispara o evento "storage" manualmente para forçar recalculo na mesma aba
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('storage'));
  }
};
