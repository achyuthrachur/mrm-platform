'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { getSupabaseClient } from '@/lib/supabase/client';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

const DEMO_CREDS = [
  { label: 'Model Owner', email: 'sarah.chen@heartlandbank.demo', role: 'owner' },
  { label: 'MRM Officer', email: 'marcus.williams@heartlandbank.demo', role: 'mrm' },
];

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoCreds, setShowDemoCreds] = useState(false);
  const supabase = getSupabaseClient();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    if (!supabase) {
      // No Supabase config — proceed directly in demo mode
      toast.success('Demo mode — Supabase not configured. Continuing with demo defaults.');
      router.push('/dashboard');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    router.push('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: 'var(--canvas)' }}>
      {/* Indigo header — matches app shell */}
      <header className="flex items-center gap-3 px-8 py-4" style={{ backgroundColor: '#011E41' }}>
        <Image
          src="/crowe-logo-white.svg"
          alt="Crowe"
          width={72}
          height={24}
          priority
          className="h-6 w-auto"
        />
        <span className="select-none text-white/30">|</span>
        <span className="text-sm font-semibold tracking-tight text-white">MRM Platform™</span>
      </header>

      {/* Login card */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div
          className="w-full max-w-sm space-y-6 rounded-card p-8"
          style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-card-lg)' }}
        >
          <div className="space-y-1">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck
                className="h-5 w-5"
                style={{ color: 'var(--accent)' }}
                aria-hidden="true"
              />
              <span className="text-caption font-semibold uppercase tracking-wider text-ink-muted">
                Heartland Commerce Bank
              </span>
            </div>
            <h1 className="text-h2 font-bold text-ink">Sign in</h1>
            <p className="text-small text-ink-muted">Model Risk Management Platform</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label className="text-small mb-1.5 block font-medium text-ink" htmlFor="login-email">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className="text-small w-full rounded-md border bg-surface-sunken px-3 py-2 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
                style={{ borderColor: 'var(--border-hairline)' }}
              />
              {errors.email && (
                <p className="mt-1 text-caption" style={{ color: 'var(--status-fail)' }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                className="text-small mb-1.5 block font-medium text-ink"
                htmlFor="login-password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password')}
                  className="text-small w-full rounded-md border bg-surface-sunken px-3 py-2 pr-10 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
                  style={{ borderColor: 'var(--border-hairline)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-caption" style={{ color: 'var(--status-fail)' }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              variant="primary"
              size="md"
              type="submit"
              className="w-full justify-center"
              loading={isSubmitting}
            >
              Sign in
            </Button>
          </form>

          {/* Demo credentials helper */}
          <div>
            <button
              type="button"
              onClick={() => setShowDemoCreds((v) => !v)}
              className="rounded text-caption text-ink-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
            >
              {showDemoCreds ? '▲ Hide demo credentials' : '▼ Show demo credentials'}
            </button>

            {showDemoCreds && (
              <div
                className="mt-3 space-y-2 rounded-md p-3"
                style={{ backgroundColor: 'var(--canvas)' }}
              >
                <p className="text-caption font-semibold uppercase tracking-wider text-ink-muted">
                  Demo accounts
                </p>
                {DEMO_CREDS.map((cred) => (
                  <button
                    key={cred.role}
                    type="button"
                    onClick={() => {
                      setValue('email', cred.email);
                      setValue('password', 'Demo@1234!');
                    }}
                    className="flex w-full items-start gap-2 rounded p-2 text-left transition-colors hover:bg-[var(--border-hairline)]"
                  >
                    <div>
                      <p className="text-small font-medium text-ink">{cred.label}</p>
                      <p className="text-caption text-ink-muted">{cred.email}</p>
                      <p className="text-caption text-ink-muted">Password: Demo@1234!</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
