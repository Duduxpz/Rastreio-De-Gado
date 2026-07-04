'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Topbar } from '@/components/Topbar';
import { Sidebar } from '@/components/Sidebar';
import { LoadingState } from '@/components/ui/LoadingState';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { user, farmName, loading: authLoading } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, router, user]);

  if (authLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-bg-base font-sans">
      <Topbar
        userEmail={user?.email}
        fazendaNome={farmName}
        onMenuToggle={() => setMobileSidebarOpen((value) => !value)}
        isMenuOpen={mobileSidebarOpen}
      />
      <Sidebar mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      <main className="pt-16 md:pt-14 md:pl-56">
        <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 md:px-8 md:py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
