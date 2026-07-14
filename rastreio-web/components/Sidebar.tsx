'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Sprout, Syringe, Scale,
  BellRing, Settings2, ChevronRight, TrendingUp, ClipboardList,
} from 'lucide-react';
import { AnimalIcon } from '@/components/icons/AnimalIcon';

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

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const path = usePathname();
  return (
    <aside className={`fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-72 max-w-[85vw]
                      bg-bg-surface border-r border-bg-border shadow-lg
                      flex flex-col justify-between py-4 z-20 transition-transform duration-200
                      ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                      md:w-56`}>
      <nav className="flex flex-col gap-0.5 px-2">
        {nav.map(({ href, icon: Icon, label }) => {
          const active = path === href;
          const iconClasses = active ? 'text-text-inverse' : 'text-brand-light';
          return (
            <Link key={href} href={href}
              onClick={() => onClose()}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-sm font-medium transition-all duration-150
                ${active
                  ? 'bg-brand-DEFAULT text-text-inverse shadow-[0_2px_8px_rgba(34,197,94,0.3)]'
                  : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                }
              `}>
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
        <Link href="/dashboard/configuracoes"
          className="flex items-center gap-2 text-xs text-text-muted
                     hover:text-text-secondary transition-colors">
          <Settings2 size={14} />
          Configurações
        </Link>
      </div>
    </aside>
  );
}
