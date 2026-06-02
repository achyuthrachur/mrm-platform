'use client';

import Image from 'next/image';
import { Moon, Sun, ChevronDown, Building2, LogOut, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { useRole } from './RoleProvider';
import { useSupabaseAuth } from './SupabaseAuthProvider';
import type { Role } from '@/types';

const ROLE_LABELS: Record<Role, string> = { owner: 'Model Owner', mrm: 'MRM Officer' };
const ROLE_COLORS: Record<Role, string> = {
  owner: 'bg-[var(--accent)] text-[var(--accent-text)]',
  mrm: 'bg-[#05AB8C] text-white',
};

interface AppHeaderProps {
  onOpenPalette?: () => void;
}

export function AppHeader({ onOpenPalette }: AppHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { role, setRole, currentUser } = useRole();
  const { user, signOut } = useSupabaseAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push('/login');
  }

  const iconBtn =
    'flex h-8 w-8 items-center justify-center rounded text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]';

  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-5"
      style={{
        height: 'var(--header-height)',
        backgroundColor: '#011E41',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
      role="banner"
    >
      {/* Logo + name */}
      <div className="flex items-center gap-3">
        <Image
          src="/crowe-logo-white.svg"
          alt="Crowe"
          width={68}
          height={22}
          priority
          className="h-5.5 w-auto"
        />
        <span className="select-none text-white/25" aria-hidden="true">
          |
        </span>
        <span className="text-[0.85rem] font-semibold tracking-tight text-white/90">
          MRM Platform
        </span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1.5">
        {/* Sector — subtle */}
        <div className="mr-3 hidden items-center gap-1.5 text-body-sm text-white/45 sm:flex">
          <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Heartland Commerce Bank</span>
        </div>

        {/* ⌘K search affordance */}
        <button
          onClick={onOpenPalette}
          className="hidden items-center gap-2 rounded-control border px-2.5 py-1.5 text-body-sm text-white/50 transition-colors hover:border-white/20 hover:text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] sm:flex"
          style={{
            borderColor: 'rgba(255,255,255,0.12)',
            backgroundColor: 'rgba(255,255,255,0.04)',
          }}
          aria-label="Open command palette"
        >
          <Search className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Search</span>
          <kbd
            className="rounded px-1 text-eyebrow"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Role switcher */}
        <button
          className={`flex items-center gap-1 rounded px-2 py-0.5 text-eyebrow font-semibold uppercase tracking-[0.06em] transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${ROLE_COLORS[role]}`}
          aria-label={`Role: ${ROLE_LABELS[role]}. Click to switch.`}
          onClick={() => setRole(role === 'owner' ? 'mrm' : 'owner')}
        >
          {ROLE_LABELS[role]}
          <ChevronDown className="h-3 w-3" aria-hidden="true" />
        </button>

        {/* User avatar */}
        <div
          className="ml-1 hidden items-center gap-2 text-body-sm text-white/60 md:flex"
          aria-label={`Signed in as ${currentUser}`}
        >
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-caption font-bold text-white"
            aria-hidden="true"
          >
            {currentUser.charAt(0)}
          </span>
          <span className="hidden text-white/70 lg:block">{currentUser}</span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          className={iconBtn}
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Sun className="h-4 w-4" aria-hidden="true" />
          )}
        </button>

        {/* Sign out */}
        {user ? (
          <button onClick={handleSignOut} aria-label="Sign out" className={iconBtn}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </header>
  );
}
