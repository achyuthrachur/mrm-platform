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

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  beta?: boolean;
  phaseNote?: string;
}

const NAV_ITEMS: NavItem[] = [
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
      <nav className="flex-1 overflow-y-auto py-3" role="navigation">
        <ul className="space-y-0.5 px-2" role="list">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <li key={item.href} role="listitem">
                <Link
                  href={item.href}
                  className={cn(
                    'relative flex items-center gap-3 rounded-md px-3 py-2.5 text-small font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#011E41]',
                    isActive
                      ? 'text-[var(--sidebar-active-text)]'
                      : 'text-ink-secondary hover:bg-[var(--canvas)] hover:text-ink'
                  )}
                  style={isActive ? { backgroundColor: 'var(--sidebar-active-bg)' } : {}}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r"
                      style={{ backgroundColor: 'var(--sidebar-active-indicator)' }}
                      aria-hidden="true"
                    />
                  )}

                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="hidden truncate sm:block">{item.label}</span>

                  {item.beta && (
                    <span
                      className="ml-auto rounded px-1.5 py-0.5 text-caption font-semibold uppercase tracking-wide"
                      style={{
                        backgroundColor: 'var(--status-info-bg)',
                        color: 'var(--status-info)',
                      }}
                      aria-label="Beta feature"
                    >
                      BETA
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Sidebar footer ── */}
      <div className="border-t px-4 py-3" style={{ borderColor: 'var(--border-hairline)' }}>
        <div className="flex items-center gap-2">
          <Circle
            className="h-2 w-2 shrink-0"
            fill={role === 'mrm' ? '#05AB8C' : '#F5A800'}
            stroke="none"
            aria-hidden="true"
          />
          <span className="truncate text-caption text-ink-muted">
            <span className="font-medium text-ink-secondary">{currentUser}</span>
            {' · '}
            {role === 'mrm' ? 'MRM Officer' : 'Model Owner'}
          </span>
        </div>
        <p className="mt-1 text-caption text-ink-muted">Heartland Commerce Bank</p>
      </div>
    </aside>
  );
}
