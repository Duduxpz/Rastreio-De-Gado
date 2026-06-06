let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export async function apiFetch<T = any>(input: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init && (init.headers as Record<string, string>)),
  } as Record<string, string>;

  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const res = await fetch(input, { ...init, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

export default apiFetch;
