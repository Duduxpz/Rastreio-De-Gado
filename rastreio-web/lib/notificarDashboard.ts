export const notificarDashboard = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('dashboard:refresh'));
    window.dispatchEvent(new Event('storage'));
  }
};
