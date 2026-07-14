export function normalizeApiUrl(rawUrl: string | undefined) {
  const trimmed = (rawUrl ?? '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith(':')) return `http://localhost${trimmed}`;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `http://${trimmed}`;
}

export function getBackendUrl() {
  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim() || process.env.API_URL?.trim() || '';
  const apiUrl = normalizeApiUrl(rawApiUrl);

  if (apiUrl) {
    return apiUrl;
  }

  if (process.env.NODE_ENV !== 'production') {
    return 'http://localhost:3001';
  }

  throw new Error(
    'A variável de ambiente NEXT_PUBLIC_API_URL ou API_URL não está configurada. Defina-a no ambiente de produção para permitir chamadas ao backend.'
  );
}
