import { ThemeProvider } from '@/components/features/shell/ThemeProvider';
import { RoleProvider } from '@/components/features/shell/RoleProvider';
import { AppHeader } from '@/components/features/shell/AppHeader';
import { AppSidebar } from '@/components/features/shell/AppSidebar';
import { AppFooter } from '@/components/features/shell/AppFooter';
import { Toaster } from 'sonner';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <RoleProvider>
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
      </RoleProvider>
    </ThemeProvider>
  );
}
