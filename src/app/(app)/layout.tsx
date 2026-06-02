'use client';

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
import { Toaster } from 'sonner';

function AppShell({ children }: { children: React.ReactNode }) {
  const { sessionRole, currentUser } = useSupabaseAuth();

  return (
    <ThemeProvider>
      <RoleProvider initialRole={sessionRole} initialUser={currentUser}>
        <ModelsProvider>
          <FindingsProvider>
            <FlagsProvider>
              <FrequencyApprovalsProvider>
                <div className="min-h-screen" style={{ backgroundColor: 'var(--canvas)' }}>
                  <AppHeader />
                  <AppSidebar />

                  <div
                    className="flex min-h-screen flex-col"
                    style={{
                      paddingTop: 'var(--header-height)',
                      paddingLeft: 'var(--sidebar-width)',
                    }}
                  >
                    <main className="flex-1 p-6" id="main-content" tabIndex={-1}>
                      {children}
                    </main>
                    <AppFooter />
                  </div>
                </div>
                <Toaster position="bottom-right" richColors />
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
