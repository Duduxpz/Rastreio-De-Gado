'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Topbar } from '@/components/Topbar';
import { Sidebar } from '@/components/Sidebar';
import { LoadingState } from '@/components/ui/LoadingState';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace('/login');
          return;
        }
        setUser(session.user);
      } catch (error) {
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const syncSidebarState = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };

    syncSidebarState();
    window.addEventListener('resize', syncSidebarState);
    return () => window.removeEventListener('resize', syncSidebarState);
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-bg-base font-sans">
      <Topbar
        userEmail={user?.email}
        fazendaNome="Fazenda São João"
        onMenuToggle={() => setSidebarOpen((prev) => !prev)}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-10 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <main className="pt-14 md:pl-56">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
