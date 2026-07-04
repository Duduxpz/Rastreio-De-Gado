'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Sprout, Syringe, Scale,
  BellRing, Settings2, ChevronRight, TrendingUp, ClipboardList,
} from 'lucide-react';
import { AnimalIcon } from '@/components/icons/AnimalIcon';

interface SidebarProps {
  readonly mobileOpen?: boolean;
  readonly onClose?: () => void;
}

const nav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/animais', icon: () => <AnimalIcon type="bovino" size={16} />, label: 'Animais' },
  { href: '/dashboard/vacinacoes', icon: Syringe, label: 'Vacinações' },
  { href: '/dashboard/pesagens', icon: Scale, label: 'Pesagens' },
  { href: '/dashboard/analytics', icon: TrendingUp, label: 'Analytics' },
  { href: '/dashboard/relatorios', icon: ClipboardList, label: 'Relatórios' },
  { href: '/dashboard/alertas', icon: BellRing, label: 'Alertas' },
  { href: '/dashboard/recomendacoes', icon: Sprout, label: 'Recomendações' },
];

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const path = usePathname();

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Fechar navegação"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        aria-label="Navegação do painel"
        role="dialog"
        aria-modal={mobileOpen}
        className={`fixed left-0 top-14 z-40 flex h-[calc(100vh-3.5rem)] w-72 flex-col justify-between border-r border-bg-border bg-bg-surface py-4 shadow-2xl transition-transform duration-300 ease-out md:top-14 md:w-56 md:translate-x-0 md:shadow-none ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <nav className="flex flex-col gap-0.5 px-2">
          {nav.map(({ href, icon: Icon, label }) => {
            const active = path === href;
            const iconClasses = active ? 'text-text-inverse' : 'text-brand-light';
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${active ? 'bg-brand-DEFAULT text-text-inverse shadow-[0_2px_8px_rgba(34,197,94,0.3)]' : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'}`}
              >
                {typeof Icon === 'function' && Icon.name === '' ? (
                  <div className={iconClasses}><Icon size={16} /></div>
                ) : (
                  <Icon size={16} className={iconClasses} />
                )}
                <span className="flex-1">{label}</span>
                {active && <ChevronRight size={14} className="text-text-inverse/60" />}
              </Link>
            );
          })}
        </nav>
        <div className="px-4">
          <Link
            href="/dashboard/configuracoes"
            onClick={onClose}
            className="flex items-center gap-2 text-xs text-text-muted transition-colors hover:text-text-secondary"
          >
            <Settings2 size={14} />
            Configurações
          </Link>
        </div>
      </aside>
    </>
  );
}
