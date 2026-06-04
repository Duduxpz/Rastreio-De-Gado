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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }
        setUser(session.user);
      } catch (error) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-bg-base font-sans">
      <Topbar userEmail={user?.email} fazendaNome="Fazenda São João" />
      <Sidebar />
      <main className="pl-56 pt-14">
        <div className="px-8 py-6 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
