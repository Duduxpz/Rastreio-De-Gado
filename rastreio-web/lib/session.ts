import { supabase } from '@/lib/supabase';

const authKeys = ['token', 'oauth_provider_token', 'oauth_provider_refresh_token'];
const appDataKeys = ['animais', 'vacinacoes', 'pesagens', 'dashboard_snapshot', 'alertas_lidas', 'configuracoes'];

export function clearAppStorage() {
  if (typeof window === 'undefined') return;

  [window.localStorage, window.sessionStorage].forEach((storage) => {
    Object.keys(storage).forEach((key) => {
      const normalized = String(key);
      const isAuthKey = authKeys.includes(normalized) || normalized.startsWith('supabase.auth') || (normalized.includes('supabase') && normalized.includes('auth'));
      const isAppDataKey = appDataKeys.some((storedKey) => normalized === storedKey || normalized.startsWith(`${storedKey}:`));

      if (isAuthKey || isAppDataKey) {
        storage.removeItem(normalized);
      }
    });
  });
}

export function clearAllAppStorage() {
  if (typeof window === 'undefined') return;
  window.localStorage.clear();
  window.sessionStorage.clear();
}

export async function getSessionToken(): Promise<string | null> {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('getSessionToken error:', error);
    return null;
  }
  return session?.access_token ?? null;
}
