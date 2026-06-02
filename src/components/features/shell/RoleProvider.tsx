'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { Role } from '@/types';

interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
  currentUser: string;
}

const ROLE_USERS: Record<Role, string> = {
  owner: 'Sarah Chen',
  mrm: 'Marcus Williams',
};

const RoleContext = createContext<RoleContextValue>({
  role: 'owner',
  setRole: () => {},
  currentUser: ROLE_USERS.owner,
});

interface RoleProviderProps {
  children: React.ReactNode;
  /**
   * When provided (from Supabase session), this is the authenticated user's real role.
   * The demo toggle can still override this for presentation purposes.
   */
  initialRole?: Role;
  /**
   * When provided (from Supabase session), this is the authenticated user's display name.
   * Overrides the hardcoded ROLE_USERS lookup when set.
   */
  initialUser?: string;
}

export function RoleProvider({ children, initialRole, initialUser }: RoleProviderProps) {
  const [role, setRoleState] = useState<Role>(initialRole ?? 'owner');
  const [currentUser, setCurrentUser] = useState<string>(
    initialUser ?? ROLE_USERS[initialRole ?? 'owner']
  );

  useEffect(() => {
    // When initialRole arrives from Supabase (after async profile load), sync state
    if (initialRole) {
      setRoleState(initialRole);
    }
    if (initialUser) {
      setCurrentUser(initialUser);
    }
  }, [initialRole, initialUser]);

  useEffect(() => {
    // Only read localStorage as override if Supabase hasn't provided a session role
    if (!initialRole) {
      const stored = localStorage.getItem('mrm-role') as Role | null;
      if (stored === 'owner' || stored === 'mrm') {
        setRoleState(stored);
      }
    }
  }, [initialRole]);

  function setRole(next: Role) {
    setRoleState(next);
    // Update the display name to match the demo role mapping when toggling
    if (!initialUser) setCurrentUser(ROLE_USERS[next]);
    localStorage.setItem('mrm-role', next);
  }

  return (
    <RoleContext.Provider value={{ role, setRole, currentUser }}>{children}</RoleContext.Provider>
  );
}

export function useRole(): RoleContextValue {
  return useContext(RoleContext);
}
