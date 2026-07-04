'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Modal } from './ui/Modal';
import { SinoNotificacoes } from './SinoNotificacoes';
import { supabase } from '@/lib/supabase';
import { clearAppStorage } from '@/lib/session';
import { useAuth } from '@/contexts/AuthContext';

interface TopbarProps {
  readonly userEmail?: string;
  readonly fazendaNome?: string;
  readonly onMenuToggle?: () => void;
  readonly isMenuOpen?: boolean;
}

export function Topbar({ userEmail, fazendaNome, onMenuToggle, isMenuOpen = false }: TopbarProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [displayFarmName, setDisplayFarmName] = useState(fazendaNome || 'Minha Fazenda');
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

  useEffect(() => {
    const syncFarmName = () => {
      const storedFarmName = globalThis.localStorage?.getItem('farm_name');
      const nextFarmName = storedFarmName?.trim() || fazendaNome || farmName || 'Minha Fazenda';
      setDisplayFarmName(nextFarmName);
    };

    syncFarmName();
    globalThis.window?.addEventListener('storage', syncFarmName);
    globalThis.window?.addEventListener('farm-name-updated', syncFarmName as EventListener);

    return () => {
      globalThis.window?.removeEventListener('storage', syncFarmName);
      globalThis.window?.removeEventListener('farm-name-updated', syncFarmName as EventListener);
    };
  }, [fazendaNome, farmName]);

  const displayEmail = userEmail ?? user?.email ?? '';
  const displayName = user?.user_metadata?.full_name || displayEmail || 'Usuário';
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
      <header className="fixed top-0 left-0 right-0 h-14 z-30 bg-bg-base/80 backdrop-blur-md border-b border-bg-border flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onMenuToggle}
            aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-bg-border bg-bg-elevated text-text-primary transition-colors hover:bg-bg-border md:hidden"
          >
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#22C55E] font-bold text-sm text-white shadow-[0_0_16px_rgba(34,197,94,0.8)]">
              R
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary tracking-tight">Rastreio</p>
              <p className="truncate text-[11px] text-text-muted">
                {profileLoading ? 'Carregando...' : displayFarmName}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <SinoNotificacoes />

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-lg border border-bg-border bg-bg-elevated px-2 py-1.5 transition-colors hover:bg-bg-border sm:px-3"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cta-DEFAULT text-[10px] font-bold text-text-inverse">
                {initial}
              </div>
              <span className="hidden text-xs text-text-secondary max-w-[140px] truncate sm:inline">
                {displayEmail}
              </span>
              <ChevronDown size={12} className="text-text-muted" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-bg-border bg-bg-surface shadow-lg">
                <button
                  onClick={() => {
                    setConfirmOpen(true);
                    setMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-text-primary transition-colors hover:bg-bg-base"
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
              className="rounded-lg border border-bg-border px-4 py-2 text-sm text-text-primary transition-colors hover:bg-bg-base"
            >
              Cancelar
            </button>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="rounded-lg bg-danger px-4 py-2 text-sm text-white transition-colors hover:bg-red-600 disabled:opacity-50"
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
