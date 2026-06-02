'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { SupabaseClient, User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { Role } from '@/types';

interface SupabaseAuthContextValue {
  user: User | null;
  supabase: SupabaseClient | null;
  sessionRole: Role;
  currentUser: string;
  orgId: string;
  loading: boolean;
  signOut: () => Promise<void>;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextValue>({
  user: null,
  supabase: null,
  sessionRole: 'owner',
  currentUser: 'Sarah Chen',
  orgId: 'heartland-commerce-bank',
  loading: true,
  signOut: async () => {},
});

interface Profile {
  name: string;
  role: Role;
  org_id: string;
}

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = getSupabaseClient();

  useEffect(() => {
    if (!supabase) {
      // No Supabase config — fall back to demo defaults
      setLoading(false);
      return;
    }

    async function loadSession() {
      if (!supabase) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadProfile(session.user.id);
      }
      setLoading(false);
    }

    async function loadProfile(userId: string) {
      if (!supabase) return;
      const { data } = await supabase
        .from('profiles')
        .select('name, role, org_id')
        .eq('id', userId)
        .maybeSingle();
      if (data) setProfile(data as Profile);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          setUser(session.user);
          await loadProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]); // supabase is a memoized singleton — stable reference

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
  }

  // Fall back to demo defaults when Supabase is not configured or profile hasn't loaded
  const sessionRole: Role = profile?.role ?? 'owner';
  const currentUser = profile?.name ?? 'Sarah Chen';
  const orgId = profile?.org_id ?? 'heartland-commerce-bank';

  return (
    <SupabaseAuthContext.Provider
      value={{ user, supabase, sessionRole, currentUser, orgId, loading, signOut }}
    >
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuth(): SupabaseAuthContextValue {
  return useContext(SupabaseAuthContext);
}
