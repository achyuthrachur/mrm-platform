'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Database,
  FlaskConical,
  AlertTriangle,
  Activity,
  ShieldCheck,
  GitBranch,
  Circle,
} from 'lucide-react';
import { useRole } from './RoleProvider';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inventory', label: 'Model Inventory', icon: Database },
  { href: '/workbench', label: 'Testing Workbench', icon: FlaskConical },
  { href: '/findings', label: 'Findings Tracker', icon: AlertTriangle },
  { href: '/monitor', label: 'Performance Monitor', icon: Activity },
  { href: '/governance', label: 'Governance', icon: ShieldCheck },
  { href: '/dependencies', label: 'Dependencies', icon: GitBranch, beta: true },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { role, currentUser } = useRole();

  return (
    <aside
      className="fixed left-0 z-40 flex flex-col"
      style={{
        top: 'var(--header-height)',
        width: 'var(--sidebar-width)',
        height: 'calc(100vh - var(--header-height))',
        backgroundColor: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border-hairline)',
      }}
      aria-label="Main navigation"
    >
      <nav className="flex-1 overflow-y-auto py-2" role="navigation">
        <ul className="space-y-px px-2" role="list">
          {NAV_ITEMS.map(({ href, label, icon: Icon, beta }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <li key={href} role="listitem">
                <Link
                  href={href}
                  className={cn(
                    'relative flex items-center gap-2.5 rounded-control px-3 py-2.5 text-body transition-colors',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--focus-ring)]',
                    active
                      ? 'font-medium text-[var(--sidebar-active-text)]'
                      : 'font-normal text-ink-secondary hover:bg-[var(--canvas)] hover:text-ink'
                  )}
                  style={active ? { backgroundColor: 'var(--sidebar-active-bg)' } : {}}
                  aria-current={active ? 'page' : undefined}
                >
                  {/* Active indicator */}
                  {active ? (
                    <span
                      className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r"
                      style={{ backgroundColor: 'var(--sidebar-active-indicator)' }}
                      aria-hidden="true"
                    />
                  ) : null}

                  <Icon
                    className={cn('h-4 w-4 shrink-0', active ? 'text-ink' : 'text-ink-muted')}
                    aria-hidden="true"
                  />
                  <span className="hidden truncate sm:block">{label}</span>

                  {beta ? (
                    <span
                      className="ml-auto rounded px-1.5 py-px text-eyebrow font-semibold uppercase tracking-[0.06em]"
                      style={{
                        backgroundColor: 'var(--status-info-bg)',
                        color: 'var(--status-info)',
                      }}
                      aria-label="Beta"
                    >
                      BETA
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t px-4 py-3" style={{ borderColor: 'var(--border-hairline)' }}>
        <div className="flex items-center gap-2">
          <Circle
            className="h-1.5 w-1.5 shrink-0"
            fill={role === 'mrm' ? '#05AB8C' : '#F5A800'}
            stroke="none"
            aria-hidden="true"
          />
          <span className="truncate text-body-sm text-ink-muted">
            <span className="font-medium text-ink-secondary">{currentUser}</span>
            {' · '}
            {role === 'mrm' ? 'MRM Officer' : 'Model Owner'}
          </span>
        </div>
        <p className="mt-0.5 text-body-sm text-ink-muted">Heartland Commerce Bank</p>
      </div>
    </aside>
  );
}
