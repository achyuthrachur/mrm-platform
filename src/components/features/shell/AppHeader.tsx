'use client';

import Image from 'next/image';
import { Moon, Sun, ChevronDown, Building2 } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useRole } from './RoleProvider';
import type { Role } from '@/types';

const ROLE_LABELS: Record<Role, string> = {
  owner: 'Model Owner',
  mrm: 'MRM Officer',
};

const ROLE_COLORS: Record<Role, string> = {
  owner: 'bg-[#F5A800] text-[#011E41]',
  mrm: 'bg-[#05AB8C] text-white',
};

export function AppHeader() {
  const { theme, toggleTheme } = useTheme();
  const { role, setRole, currentUser } = useRole();

  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6"
      style={{
        height: 'var(--header-height)',
        backgroundColor: '#011E41',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
      role="banner"
    >
      {/* ── Left: Logo + App name ── */}
      <div className="flex items-center gap-3">
        <Image
          src="/crowe-logo-white.svg"
          alt="Crowe"
          width={72}
          height={24}
          priority
          className="h-6 w-auto"
        />
        <span className="select-none text-white/30" aria-hidden="true">
          |
        </span>
        <span className="text-[0.9rem] font-semibold tracking-tight text-white">MRM Platform™</span>
      </div>

      {/* ── Right: controls ── */}
      <div className="flex items-center gap-2">
        {/* Sector label */}
        <div className="mr-2 hidden items-center gap-1.5 text-small text-white/60 sm:flex">
          <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Heartland Commerce Bank</span>
        </div>

        {/* Role switcher */}
        <div className="relative">
          <button
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-caption font-semibold uppercase tracking-wide transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5A800] ${ROLE_COLORS[role]}`}
            aria-label={`Current role: ${ROLE_LABELS[role]}. Click to switch.`}
            onClick={() => setRole(role === 'owner' ? 'mrm' : 'owner')}
          >
            {ROLE_LABELS[role]}
            <ChevronDown className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>

        {/* Current user */}
        <div
          className="hidden items-center gap-2 rounded px-3 py-1 text-small text-white/70 md:flex"
          aria-label={`Signed in as ${currentUser}`}
        >
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-caption font-bold text-white"
            aria-hidden="true"
          >
            {currentUser.charAt(0)}
          </span>
          <span className="hidden lg:block">{currentUser}</span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          className="flex h-8 w-8 items-center justify-center rounded text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5A800]"
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Sun className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </header>
  );
}
