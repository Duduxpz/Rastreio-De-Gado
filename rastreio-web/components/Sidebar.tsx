'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Sprout, Syringe, Scale,
  FileText, Bell, Settings, ChevronRight
} from 'lucide-react';

const nav = [
  { href: '/dashboard',           icon: LayoutDashboard, label: 'Dashboard'   },
  { href: '/dashboard/animais',       icon: Sprout,             label: 'Animais'     },
  { href: '/dashboard/vacinacoes',icon: Syringe,         label: 'Vacinações'  },
  { href: '/dashboard/pesagens',  icon: Scale,           label: 'Pesagens'    },
  { href: '/dashboard/relatorios',icon: FileText,        label: 'Relatórios'  },
  { href: '/dashboard/alertas',   icon: Bell,            label: 'Alertas'     },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-56
                       bg-bg-surface border-r border-bg-border
                       flex flex-col justify-between py-4 z-20">
      <nav className="flex flex-col gap-0.5 px-2">
        {nav.map(({ href, icon: Icon, label }) => {
          const active = path === href;
          return (
            <Link key={href} href={href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-sm font-medium transition-all duration-150
                ${active
                  ? 'bg-cta-DEFAULT text-text-inverse shadow-[0_2px_8px_rgba(249,115,22,0.35)]'
                  : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                }
              `}>
              <Icon size={16} className={active ? 'text-text-inverse' : ''} />
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
          <Settings size={14} />
          Configurações
        </Link>
      </div>
    </aside>
  );
}
