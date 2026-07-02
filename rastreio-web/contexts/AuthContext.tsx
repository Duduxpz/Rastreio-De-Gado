'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getUserProfile, saveFarmNameForUser, type UserProfile } from '@/lib/profile';

interface AuthContextValue {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  farmName: string;
  refreshProfile: () => Promise<void>;
  setFarmName: (farmName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (currentUser: any | null) => {
    if (!currentUser?.id) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const currentProfile = await getUserProfile(currentUser.id);
      if (currentProfile) {
        setProfile(currentProfile);
      } else {
        const createdProfile = await saveFarmNameForUser(currentUser.id, 'Minha Fazenda');
        setProfile(createdProfile);
      }
    } catch (error) {
      console.error('Erro ao carregar profile do usuário:', error);
      setProfile({ id: currentUser.id, farm_name: 'Minha Fazenda', created_at: null });
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const result = await supabase.auth.getUser();
    const currentUser = result.data?.user ?? null;

    if (!currentUser?.id) {
      setProfile(null);
      return;
    }

    await loadProfile(currentUser);
  }, [loadProfile]);

  const setFarmName = useCallback(async (farmName: string) => {
    const result = await supabase.auth.getUser();
    const currentUser = result.data?.user ?? null;

    if (!currentUser?.id) {
      return;
    }

    const updatedProfile = await saveFarmNameForUser(currentUser.id, farmName);
    setProfile(updatedProfile);
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const result = await supabase.auth.getSession();
      const currentUser = result.data?.session?.user ?? null;
      setUser(currentUser);
      await loadProfile(currentUser);
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      await loadProfile(currentUser);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    profile,
    loading,
    farmName: profile?.farm_name?.trim() ? profile.farm_name : 'Minha Fazenda',
    refreshProfile,
    setFarmName,
  }), [loading, profile, refreshProfile, setFarmName, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
