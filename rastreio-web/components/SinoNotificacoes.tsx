'use client';

import { useState, useEffect, useRef } from 'react';
import { gerarAlertas, type Alerta } from '@/utils/gerarAlertas';
import Link from 'next/link';

export function SinoNotificacoes() {
  const [aberto, setAberto] = useState(false);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [lidas, setLidas] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);

  const carregarAlertas = () => {
    if (typeof window === 'undefined') return;

    const animais = JSON.parse(localStorage.getItem('animais') || '[]');
    const vacinacoes = JSON.parse(localStorage.getItem('vacinacoes') || '[]');
    const pesagens = JSON.parse(localStorage.getItem('pesagens') || '[]');
    const lidas_salvas = JSON.parse(localStorage.getItem('alertas_lidas') || '[]');

    setLidas(new Set(lidas_salvas));
    setAlertas(gerarAlertas(animais, vacinacoes, pesagens));
  };

  useEffect(() => {
    carregarAlertas();
    const interval = setInterval(carregarAlertas, 5000);
    window.addEventListener('storage', carregarAlertas);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', carregarAlertas);
    };
  }, []);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickFora = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAberto(false);
      }
    };

    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  const naoLidas = alertas.filter((a) => !lidas.has(a.id));

  const marcarTodasLidas = () => {
    const ids = alertas.map((a) => a.id);
    localStorage.setItem('alertas_lidas', JSON.stringify(ids));
    setLidas(new Set(ids));
  };

  const marcarUmaLida = (id: string) => {
    const novas = new Set(lidas);
    novas.add(id);
    localStorage.setItem('alertas_lidas', JSON.stringify([...novas]));
    setLidas(novas);
  };

  return (
    <div ref={ref} className="relative">
      {/* Botão do sino */}
      <button
        onClick={() => setAberto(!aberto)}
        className="relative w-8 h-8 rounded-lg bg-bg-elevated
                   flex items-center justify-center
                   hover:bg-bg-border transition-colors group"
        aria-label="Notificações"
      >
        <span className="text-base group-hover:scale-110 transition-transform">
          🔔
        </span>
        {naoLidas.length > 0 && (
          <span
            className="absolute top-1.5 right-1.5 w-4 h-4
                       rounded-full bg-cta-DEFAULT text-white
                       text-[10px] font-bold
                       flex items-center justify-center
                       ring-2 ring-bg-base"
          >
            {naoLidas.length > 9 ? '9+' : naoLidas.length}
          </span>
        )}
      </button>

      {/* Balão dropdown */}
      {aberto && (
        <div
          className="absolute top-full right-0 mt-3 w-96
                     bg-bg-surface border border-bg-border rounded-2xl
                     shadow-2xl z-50 overflow-hidden
                     animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-3
                       border-b border-bg-border"
          >
            <h3
              className="text-xs font-bold text-text-primary
                         uppercase tracking-wider"
            >
              Notificações
            </h3>
            {naoLidas.length > 0 && (
              <button
                onClick={marcarTodasLidas}
                className="text-xs text-cta-DEFAULT hover:text-cta-light
                           font-semibold transition-colors"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="max-h-96 overflow-y-auto">
            {alertas.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 text-center">
                <span className="text-2xl mb-2">✓</span>
                <p className="text-xs text-text-muted">Nenhum alerta ativo</p>
              </div>
            ) : (
              alertas.map((alerta) => (
                <button
                  key={alerta.id}
                  onClick={() => {
                    marcarUmaLida(alerta.id);
                    setAberto(false);
                  }}
                  className={`w-full text-left px-5 py-3 border-b border-bg-border
                             hover:bg-bg-elevated transition-colors
                             flex items-start gap-3
                             ${lidas.has(alerta.id) ? 'opacity-50' : ''}`}
                >
                  {/* Ícone */}
                  <span className="text-sm flex-shrink-0 mt-0.5">
                    {alerta.tipo === 'critico' ? '🔴' : '🟡'}
                  </span>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text-primary break-words">
                      {alerta.titulo}
                    </p>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                      {alerta.descricao}
                    </p>
                  </div>

                  {/* Ponto de não lida */}
                  {!lidas.has(alerta.id) && (
                    <div className="w-2 h-2 rounded-full bg-cta-DEFAULT flex-shrink-0 mt-1.5" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {alertas.length > 0 && (
            <div className="px-5 py-3 border-t border-bg-border">
              <Link href="/dashboard/relatorios">
                <button
                  onClick={() => setAberto(false)}
                  className="text-xs font-semibold text-cta-DEFAULT
                             hover:text-cta-light transition-colors w-full text-left"
                >
                  Ver relatório completo →
                </button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
