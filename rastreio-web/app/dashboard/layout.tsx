'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Topbar } from '@/components/Topbar';
import { Sidebar } from '@/components/Sidebar';
import { LoadingState } from '@/components/ui/LoadingState';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, farmName, loading: authLoading } = useAuth();

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
      <Topbar userEmail={user?.email} fazendaNome={farmName} />
      <Sidebar />
      <main className="pl-56 pt-14">
        <div className="px-8 py-6 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
