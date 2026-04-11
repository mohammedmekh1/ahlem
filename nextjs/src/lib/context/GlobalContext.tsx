'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createSPASaaSClientAuthenticated as createSPASaaSClient } from '@/lib/supabase/client';

export type UserRole = 'owner' | 'admin' | 'teacher' | 'student';
export type UserPlan = 'free' | 'pro' | 'enterprise';

export type User = {
  id:            string;
  email:         string;
  full_name:     string | null;
  role:          UserRole;
  plan:          UserPlan;
  is_admin:      boolean;
  is_active:     boolean;
  avatar_url:    string | null;
  registered_at: Date;
};

interface GlobalContextType {
  loading:     boolean;
  user:        User | null;
  refetchUser: () => Promise<void>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user,    setUser]    = useState<User | null>(null);

  const loadData = useCallback(async () => {
    try {
      const supabase = await createSPASaaSClient();
      const client   = supabase.getSupabaseClient();

      const { data: { user: authUser } } = await client.auth.getUser();
      if (!authUser) throw new Error('Not authenticated');

      const { data: profile } = await client
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      setUser({
        id:            authUser.id,
        email:         authUser.email!,
        full_name:     profile?.full_name ?? null,
        role:          (profile?.role as UserRole) ?? 'student',
        plan:          (profile?.plan as UserPlan) ?? 'free',
        is_admin:      profile?.is_admin ?? false,
        is_active:     profile?.is_active ?? true,
        avatar_url:    profile?.avatar_url ?? null,
        registered_at: new Date(authUser.created_at),
      });
    } catch (err) {
      console.error('GlobalContext error:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <GlobalContext.Provider value={{ loading, user, refetchUser: loadData }}>
      {children}
    </GlobalContext.Provider>
  );
}

export const useGlobal = () => {
  const ctx = useContext(GlobalContext);
  if (!ctx) throw new Error('useGlobal must be used within GlobalProvider');
  return ctx;
};

// Role helpers
export const isOwner   = (u: User | null) => u?.role === 'owner';
export const isAdmin   = (u: User | null) => u?.role === 'owner' || u?.role === 'admin';
export const isTeacher = (u: User | null) => u?.role === 'teacher' || isAdmin(u);
export const isStudent = (u: User | null) => u?.role === 'student';
export const isPro     = (u: User | null) => u?.plan === 'pro' || u?.plan === 'enterprise';
