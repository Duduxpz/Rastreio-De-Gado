'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Modal } from './ui/Modal';
import { SinoNotificacoes } from './SinoNotificacoes';
import { supabase } from '@/lib/supabase';
import { clearAppStorage } from '@/lib/session';
import { useAuth } from '@/contexts/AuthContext';

interface TopbarProps {
  readonly userEmail?: string;
  readonly fazendaNome?: string;
}

export function Topbar({ userEmail, fazendaNome }: TopbarProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { user, farmName, loading: profileLoading } = useAuth();

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [menuOpen]);

  const displayEmail = userEmail ?? user?.email ?? '';
  const displayName = user?.user_metadata?.full_name || displayEmail || 'Usuário';
  const displayFarmName = fazendaNome || farmName || 'Minha Fazenda';
  const initial = displayName?.[0]?.toUpperCase() ?? '?';

  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      clearAppStorage();
      router.replace('/login');
    } finally {
      setLoading(false);
      setMenuOpen(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-14 z-30
                         bg-bg-base/80 backdrop-blur-md
                         border-b border-bg-border
                         flex items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#22C55E]
                          flex items-center justify-center text-white
                          font-bold text-sm shadow-[0_0_16px_rgba(34,197,94,0.8)]">
            R
          </div>
          <span className="font-semibold text-text-primary text-sm tracking-tight">
            Rastreio
          </span>
          <span className="text-bg-border">|</span>
          <span className="text-xs text-text-muted">{profileLoading ? 'Carregando...' : displayFarmName}</span>
        </div>

        {/* Direita */}
        <div className="flex items-center gap-3">
          <SinoNotificacoes />

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-1.5
                         rounded-lg bg-bg-elevated border border-bg-border
                         hover:bg-bg-border transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-cta-DEFAULT
                              flex items-center justify-center text-[10px]
                              font-bold text-text-inverse">
                {initial}
              </div>
              <span className="text-xs text-text-secondary max-w-[140px] truncate">
                {displayEmail}
              </span>
              <ChevronDown size={12} className="text-text-muted" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-bg-surface border border-bg-border shadow-lg overflow-hidden">
                <button
                  onClick={() => {
                    setConfirmOpen(true);
                    setMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-text-primary hover:bg-bg-base transition-colors"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirmar logout"
        footer={
          <>
            <button
              onClick={() => setConfirmOpen(false)}
              className="rounded-lg border border-bg-border px-4 py-2 text-sm text-text-primary hover:bg-bg-base transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="rounded-lg bg-danger px-4 py-2 text-sm text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saindo...' : 'Confirmar logout'}
            </button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          Tem certeza que deseja encerrar a sessão? Você será redirecionado para a tela de login.
        </p>
      </Modal>
    </>
  );
}
