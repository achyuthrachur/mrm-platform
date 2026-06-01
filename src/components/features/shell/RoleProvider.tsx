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

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>('owner');

  useEffect(() => {
    const stored = localStorage.getItem('mrm-role') as Role | null;
    if (stored === 'owner' || stored === 'mrm') {
      setRoleState(stored);
    }
  }, []);

  function setRole(next: Role) {
    setRoleState(next);
    localStorage.setItem('mrm-role', next);
  }

  return (
    <RoleContext.Provider value={{ role, setRole, currentUser: ROLE_USERS[role] }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleContextValue {
  return useContext(RoleContext);
}
