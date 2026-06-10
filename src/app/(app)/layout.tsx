'use client';

import { useCallback } from 'react';
import {
  useSupabaseAuth,
  SupabaseAuthProvider,
} from '@/components/features/shell/SupabaseAuthProvider';
import { ThemeProvider } from '@/components/features/shell/ThemeProvider';
import { RoleProvider } from '@/components/features/shell/RoleProvider';
import { AppHeader } from '@/components/features/shell/AppHeader';
import { AppSidebar } from '@/components/features/shell/AppSidebar';
import { AppFooter } from '@/components/features/shell/AppFooter';
import { ModelsProvider } from '@/lib/store/models-context';
import { FindingsProvider } from '@/lib/store/findings-context';
import { FlagsProvider } from '@/lib/store/flags-context';
import { FrequencyApprovalsProvider } from '@/lib/store/frequency-approvals-context';
import { SubmissionsProvider } from '@/lib/store/submissions-context';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { useModels } from '@/lib/store/models-context';
import { useFindings } from '@/lib/store/findings-context';
import { Toaster } from 'sonner';

function AppShellInner({ children }: { children: React.ReactNode }) {
  const { models } = useModels();
  const { findings } = useFindings();

  /* Header search button dispatches ⌘K — CommandPalette listens for it */
  const openPalette = useCallback(() => {
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true })
    );
  }, []);

  const modelItems = models.map((m) => ({ id: m.id, name: m.name, cat: m.cat }));
  const findingItems = findings
    .filter((f) => f.status !== 'Closed')
    .map((f) => ({ id: f.id, title: f.title, status: f.status }));

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader onOpenPalette={openPalette} />
      <AppSidebar />
      <div
        className="flex min-h-screen flex-col"
        style={{ paddingTop: 'var(--header-height)', paddingLeft: 'var(--sidebar-width)' }}
      >
        <main className="flex-1 p-6" id="main-content" tabIndex={-1}>
          {children}
        </main>
        <AppFooter />
      </div>
      <CommandPalette models={modelItems} findings={findingItems} />
      {/* Keyboard shortcut also handled inside CommandPalette */}
      <Toaster position="bottom-right" richColors />
    </div>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  const { sessionRole, currentUser } = useSupabaseAuth();
  return (
    <ThemeProvider>
      <RoleProvider initialRole={sessionRole} initialUser={currentUser}>
        <ModelsProvider>
          <FindingsProvider>
            <FlagsProvider>
              <FrequencyApprovalsProvider>
                <SubmissionsProvider>
                  <AppShellInner>{children}</AppShellInner>
                </SubmissionsProvider>
              </FrequencyApprovalsProvider>
            </FlagsProvider>
          </FindingsProvider>
        </ModelsProvider>
      </RoleProvider>
    </ThemeProvider>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseAuthProvider>
      <AppShell>{children}</AppShell>
    </SupabaseAuthProvider>
  );
}
