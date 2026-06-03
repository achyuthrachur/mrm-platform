'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, User, ShieldAlert } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { getSupabaseClient } from '@/lib/supabase/client';

const DEMO_USERS = [
  {
    role: 'owner',
    label: 'Log in as Model Owner',
    name: 'Sarah Chen',
    email: 'sarah.chen@heartlandbank.demo',
    password: 'Demo@1234!',
    icon: User,
    description: 'Run tests · Create findings · Export results',
  },
  {
    role: 'mrm',
    label: 'Log in as MRM Officer',
    name: 'Marcus Williams',
    email: 'marcus.williams@heartlandbank.demo',
    password: 'Demo@1234!',
    icon: ShieldAlert,
    description: 'Review findings · Approve frequencies · Full portfolio view',
  },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const supabase = getSupabaseClient();

  async function signInAs(email: string, password: string, role: string) {
    setLoading(role);
    try {
      if (!supabase) {
        toast.success('Demo mode — continuing without Supabase.');
        router.push('/dashboard');
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
        return;
      }
      router.push('/dashboard');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: 'var(--canvas)' }}>
      {/* Header */}
      <header className="flex items-center gap-3 px-8 py-4" style={{ backgroundColor: '#011E41' }}>
        <Image
          src="/crowe-logo-white.svg"
          alt="Crowe"
          width={68}
          height={22}
          priority
          className="h-5 w-auto"
        />
        <span className="select-none text-white/25">|</span>
        <span className="text-sm font-semibold tracking-tight text-white/90">MRM Platform™</span>
      </header>

      {/* Card */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div
          className="w-full max-w-sm space-y-5 rounded-card p-8"
          style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--elev-3)' }}
        >
          {/* Title */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck
                className="h-4 w-4"
                style={{ color: 'var(--accent)' }}
                aria-hidden="true"
              />
              <span className="text-eyebrow uppercase tracking-[0.06em] text-ink-muted">
                Heartland Commerce Bank
              </span>
            </div>
            <h1 className="text-h2 font-bold text-ink">Sign in</h1>
            <p className="mt-0.5 text-body-sm text-ink-muted">Choose a demo account to continue</p>
          </div>

          {/* Quick login buttons */}
          <div className="space-y-3">
            {DEMO_USERS.map(({ role, label, email, password, icon: Icon, description }) => (
              <button
                key={role}
                onClick={() => signInAs(email, password, role)}
                disabled={loading !== null}
                className="group w-full rounded-control border text-left transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] disabled:opacity-50"
                style={{
                  borderColor: 'var(--border-hairline)',
                  backgroundColor: 'var(--surface)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'var(--elev-2)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hairline)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control"
                    style={{
                      backgroundColor:
                        role === 'owner' ? 'rgba(245,168,0,0.10)' : 'rgba(5,171,140,0.10)',
                    }}
                  >
                    <Icon
                      className="h-4 w-4"
                      style={{ color: role === 'owner' ? 'var(--accent)' : 'var(--status-pass)' }}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-body font-semibold text-ink">{label}</p>
                    <p className="text-body-sm text-ink-muted">{description}</p>
                  </div>
                  {loading === role ? (
                    <span
                      className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[var(--ink-muted)] border-t-transparent"
                      aria-hidden="true"
                    />
                  ) : (
                    <span className="shrink-0 text-body-sm text-ink-muted">→</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t" style={{ borderColor: 'var(--border-hairline)' }} />
            <span className="text-eyebrow uppercase tracking-[0.06em] text-ink-muted">
              or sign in manually
            </span>
            <div className="flex-1 border-t" style={{ borderColor: 'var(--border-hairline)' }} />
          </div>

          {/* Manual email/password (collapsible) */}
          <ManualLoginForm onSuccess={() => router.push('/dashboard')} />
        </div>
      </div>
    </div>
  );
}

function ManualLoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = getSupabaseClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) {
      onSuccess();
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
        return;
      }
      onSuccess();
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded text-center text-body-sm text-ink-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
      >
        Enter email and password
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        className="w-full rounded-control border bg-surface-sunken px-3 py-2 text-body text-ink placeholder:text-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
        style={{ borderColor: 'var(--border-hairline)' }}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
        className="w-full rounded-control border bg-surface-sunken px-3 py-2 text-body text-ink placeholder:text-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
        style={{ borderColor: 'var(--border-hairline)' }}
      />
      <Button
        variant="secondary"
        size="md"
        type="submit"
        loading={loading}
        className="w-full justify-center"
      >
        Sign in
      </Button>
    </form>
  );
}
