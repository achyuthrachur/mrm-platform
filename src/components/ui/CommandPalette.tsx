'use client';

import { useEffect, useState, useCallback } from 'react';
import { Command } from 'cmdk';
import {
  Search,
  LayoutDashboard,
  Database,
  FlaskConical,
  AlertTriangle,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  models?: { id: string; name: string; cat: string }[];
  findings?: { id: string; title: string; status: string }[];
}

const NAV_ITEMS: CommandItem[] = [
  {
    id: 'nav-dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    action: () => {},
    keywords: ['home', 'overview'],
  },
  {
    id: 'nav-inventory',
    label: 'Model Inventory',
    icon: Database,
    action: () => {},
    keywords: ['models', 'list'],
  },
  {
    id: 'nav-workbench',
    label: 'Testing Workbench',
    icon: FlaskConical,
    action: () => {},
    keywords: ['test', 'run', 'engine'],
  },
  {
    id: 'nav-findings',
    label: 'Findings Tracker',
    icon: AlertTriangle,
    action: () => {},
    keywords: ['findings', 'issues'],
  },
  {
    id: 'nav-monitor',
    label: 'Performance Monitor',
    icon: Activity,
    action: () => {},
    keywords: ['calendar', 'macro'],
  },
  {
    id: 'nav-governance',
    label: 'Governance',
    icon: ShieldCheck,
    action: () => {},
    keywords: ['approval', 'committee'],
  },
];

export function CommandPalette({ models = [], findings = [] }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const close = useCallback(() => setOpen(false), []);

  /* ⌘K / Ctrl-K opens the palette */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  /* ESC closes via cmdk built-in */

  const navigate = (path: string) => {
    router.push(path);
    close();
  };

  return (
    <>
      {/* Backdrop */}
      {open ? (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px]"
          onClick={close}
          aria-hidden="true"
        />
      ) : null}

      {/* Palette panel */}
      {open ? (
        <div
          className="fixed left-1/2 top-[15vh] z-[61] w-full max-w-[560px] -translate-x-1/2 rounded-card bg-surface"
          style={{ boxShadow: 'var(--elev-4)' }}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <Command
            className="overflow-hidden rounded-card"
            onKeyDown={(e) => {
              if (e.key === 'Escape') close();
            }}
          >
            {/* Search input */}
            <div
              className="flex items-center gap-3 border-b px-4 py-3"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              <Search className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
              <Command.Input
                className="flex-1 bg-transparent text-body text-ink outline-none placeholder:text-ink-muted"
                placeholder="Search models, findings, navigate…"
                autoFocus
              />
              <kbd
                className="rounded px-1.5 py-0.5 text-eyebrow text-ink-muted"
                style={{ backgroundColor: 'var(--surface-sunken)' }}
              >
                ESC
              </kbd>
            </div>

            <Command.List className="max-h-[400px] overflow-y-auto p-1.5">
              <Command.Empty className="py-8 text-center text-body-sm text-ink-muted">
                No results found.
              </Command.Empty>

              {/* Navigation */}
              <Command.Group
                heading={
                  <span className="px-2 py-1.5 text-eyebrow uppercase tracking-[0.06em] text-ink-muted">
                    Navigate
                  </span>
                }
              >
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Command.Item
                      key={item.id}
                      value={`${item.label} ${item.keywords?.join(' ')}`}
                      onSelect={() => navigate(item.id.replace('nav-', '/'))}
                      className="flex cursor-pointer items-center gap-3 rounded-control px-3 py-2.5 text-body text-ink-body outline-none data-[selected]:bg-[var(--canvas)] data-[selected]:text-ink"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
                      {item.label}
                    </Command.Item>
                  );
                })}
              </Command.Group>

              {/* Models */}
              {models.length > 0 ? (
                <Command.Group
                  heading={
                    <span className="px-2 py-1.5 text-eyebrow uppercase tracking-[0.06em] text-ink-muted">
                      Models
                    </span>
                  }
                >
                  {models.slice(0, 8).map((m) => (
                    <Command.Item
                      key={m.id}
                      value={`${m.name} ${m.id} ${m.cat}`}
                      onSelect={() => navigate(`/inventory/${m.id}`)}
                      className="flex cursor-pointer items-center gap-3 rounded-control px-3 py-2.5 text-body text-ink-body outline-none data-[selected]:bg-[var(--canvas)] data-[selected]:text-ink"
                    >
                      <Database className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
                      <span className="flex-1 truncate">{m.name}</span>
                      <span className="text-body-sm text-ink-muted">{m.id}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              ) : null}

              {/* Findings */}
              {findings.length > 0 ? (
                <Command.Group
                  heading={
                    <span className="px-2 py-1.5 text-eyebrow uppercase tracking-[0.06em] text-ink-muted">
                      Findings
                    </span>
                  }
                >
                  {findings.slice(0, 5).map((f) => (
                    <Command.Item
                      key={f.id}
                      value={`${f.title} ${f.id} ${f.status}`}
                      onSelect={() => navigate(`/findings/${f.id}`)}
                      className="flex cursor-pointer items-center gap-3 rounded-control px-3 py-2.5 text-body text-ink-body outline-none data-[selected]:bg-[var(--canvas)] data-[selected]:text-ink"
                    >
                      <AlertTriangle
                        className="h-4 w-4 shrink-0 text-ink-muted"
                        aria-hidden="true"
                      />
                      <span className="flex-1 truncate">{f.title}</span>
                      <span className="text-body-sm text-ink-muted">{f.status}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              ) : null}
            </Command.List>
          </Command>
        </div>
      ) : null}
    </>
  );
}
