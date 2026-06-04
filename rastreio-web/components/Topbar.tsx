import { Bell, ChevronDown } from 'lucide-react';

interface TopbarProps {
  userEmail: string;
  fazendaNome: string;
}

export function Topbar({ userEmail, fazendaNome }: TopbarProps) {
  return (
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
        <span className="text-xs text-text-muted">{fazendaNome}</span>
      </div>

      {/* Direita */}
      <div className="flex items-center gap-3">
        {/* Notificação */}
        <button className="relative w-8 h-8 rounded-lg bg-bg-elevated
                           flex items-center justify-center
                           hover:bg-bg-border transition-colors">
          <Bell size={15} className="text-text-secondary" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2
                           rounded-full bg-danger-DEFAULT
                           ring-2 ring-bg-base" />
        </button>

        {/* Avatar + usuário */}
        <button className="flex items-center gap-2 px-3 py-1.5
                           rounded-lg bg-bg-elevated border border-bg-border
                           hover:bg-bg-border transition-colors">
          <div className="w-6 h-6 rounded-full bg-cta-DEFAULT
                          flex items-center justify-center text-[10px]
                          font-bold text-text-inverse">
            {userEmail[0].toUpperCase()}
          </div>
          <span className="text-xs text-text-secondary max-w-[140px] truncate">
            {userEmail}
          </span>
          <ChevronDown size={12} className="text-text-muted" />
        </button>
      </div>
    </header>
  );
}
