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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync initial sidebar visibility with viewport: desktop (>=1024) open by default
  useEffect(() => {
    const sync = () => setSidebarOpen(window.innerWidth >= 1024);
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, router, user]);

  // Block body scroll when drawer is open (mobile)
  useEffect(() => {
    if (sidebarOpen) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = previous; };
    }
    return undefined;
  }, [sidebarOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sidebarOpen]);

  if (authLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-bg-base font-sans">
      <Topbar
        userEmail={user?.email}
        fazendaNome={farmName}
        isMenuOpen={sidebarOpen}
        onMenuToggle={() => setSidebarOpen((v) => !v)}
      />

      {/* Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="pt-14 lg:pl-56">
        <div className="px-4 md:px-8 py-6 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
