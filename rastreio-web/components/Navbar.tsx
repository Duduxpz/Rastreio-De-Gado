'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from './ui/Button';

interface NavbarProps {
  userEmail?: string;
}

export function Navbar({ userEmail }: NavbarProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-primary-800 border-b border-primary-700 shadow-sm z-40">
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="text-2xl">🐄</span>
          <h1 className="text-xl font-bold text-white">Rastreio</h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {userEmail && (
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent-500 text-white flex items-center justify-center font-semibold">
                {userEmail[0].toUpperCase()}
              </div>
              <span className="text-sm text-primary-100">{userEmail}</span>
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-white hover:bg-primary-700 rounded-lg transition"
            >
              ⋮
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-primary-800 rounded-lg shadow-lg border border-primary-700 py-1">
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="w-full text-left px-4 py-2 text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading ? 'Saindo...' : 'Sair'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
