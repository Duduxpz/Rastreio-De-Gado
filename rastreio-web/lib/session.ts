import { supabase } from '@/lib/supabase';

const authKeys = new Set(['token', 'oauth_provider_token', 'oauth_provider_refresh_token']);

export function clearAppStorage() {
  if (typeof globalThis.window === 'undefined') return;

  [globalThis.window.localStorage, globalThis.window.sessionStorage].forEach((storage) => {
    Object.keys(storage).forEach((key) => {
      const normalized = String(key);
      const isAuthKey = authKeys.has(normalized) || normalized.startsWith('supabase.auth') || (normalized.includes('supabase') && normalized.includes('auth'));

      if (isAuthKey) {
        storage.removeItem(normalized);
      }
    });
  });
}

export function clearAllAppStorage() {
  clearAppStorage();
}

export async function getSessionToken(): Promise<string | null> {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('getSessionToken error:', error);
    return null;
  }
  return session?.access_token ?? null;
}
