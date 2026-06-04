import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Animais', href: '/dashboard/animais', icon: '🐄' },
  { label: 'Vacinações', href: '/dashboard/vacinacoes', icon: '💉' },
  { label: 'Pesagens', href: '/dashboard/pesagens', icon: '⚖️' },
  { label: 'Relatórios', href: '/dashboard/relatorios', icon: '📈' },
  { label: 'Alertas', href: '/dashboard/alertas', icon: '🚨' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-20 md:bg-primary-700 md:text-white">
      <nav className="flex-1 px-4 py-6 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-400 text-primary-900 font-semibold'
                  : 'text-primary-100 hover:bg-primary-600'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
