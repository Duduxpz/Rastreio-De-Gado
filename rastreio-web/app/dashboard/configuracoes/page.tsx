'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/ui/PageHeader';
import { Toast, type ToastMessage } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface Config {
  nomeFazenda: string;
  responsavel: string;
  cnpj: string;
  cidadeEstado: string;
  diasAlertaVacinacao: number;
  diasAlertaPesagem: number;
  alertaEmail: boolean;
  emailAlerta: string;
}

const configPadrao: Config = {
  nomeFazenda: 'Fazenda São João',
  responsavel: '',
  cnpj: '',
  cidadeEstado: '',
  diasAlertaVacinacao: 7,
  diasAlertaPesagem: 30,
  alertaEmail: false,
  emailAlerta: '',
};

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<Config>(configPadrao);
  const [salvo, setSalvo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const { user, profile, refreshProfile, setFarmName } = useAuth();

  useEffect(() => {
    const saved = localStorage.getItem('configuracoes');
    if (saved) {
      const parsed = JSON.parse(saved) as Config;
      setConfig(parsed);
    }

    if (profile?.farm_name) {
      setConfig((prev) => ({ ...prev, nomeFazenda: profile.farm_name || prev.nomeFazenda }));
    }

    setLoading(false);
  }, [profile]);

  const addToast = (message: string, type: ToastMessage['type']) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const handleSalvar = async () => {
    const farmName = (config.nomeFazenda || 'Minha Fazenda').trim() || 'Minha Fazenda';
    setSaving(true);

    try {
      localStorage.setItem('configuracoes', JSON.stringify({ ...config, nomeFazenda: farmName }));

      if (user?.id) {
        const { error } = await supabase
          .from('profiles')
          .update({ farm_name: farmName })
          .eq('id', user.id);

        if (error) {
          throw error;
        }

        await setFarmName(farmName);
        await refreshProfile();
      }

      setConfig((prev) => ({ ...prev, nomeFazenda: farmName }));
      setSalvo(true);
      addToast('Nome da fazenda atualizado com sucesso.', 'success');
      setTimeout(() => setSalvo(false), 2500);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar as configurações.';
      addToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleExportarJSON = () => {
    const dados = {
      animais: JSON.parse(localStorage.getItem('animais') || '[]'),
      vacinacoes: JSON.parse(localStorage.getItem('vacinacoes') || '[]'),
      pesagens: JSON.parse(localStorage.getItem('pesagens') || '[]'),
      configuracoes: config,
      exportadoEm: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(dados, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rastreio-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportarJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const dados = JSON.parse(ev.target?.result as string);
          if (dados.animais)
            localStorage.setItem('animais', JSON.stringify(dados.animais));
          if (dados.vacinacoes)
            localStorage.setItem('vacinacoes', JSON.stringify(dados.vacinacoes));
          if (dados.pesagens)
            localStorage.setItem('pesagens', JSON.stringify(dados.pesagens));
          if (dados.configuracoes) {
            localStorage.setItem(
              'configuracoes',
              JSON.stringify(dados.configuracoes)
            );
            setConfig(dados.configuracoes);
          }
          window.dispatchEvent(new Event('storage'));
          setSalvo(true);
          setTimeout(() => setSalvo(false), 2500);
        } catch {
          console.error('Erro ao importar arquivo');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleLimparDados = () => {
    if (
      typeof window !== 'undefined' &&
      confirm(
        'Tem certeza que deseja limpar TODOS os dados? Esta ação não pode ser desfeita.'
      )
    ) {
      localStorage.removeItem('animais');
      localStorage.removeItem('vacinacoes');
      localStorage.removeItem('pesagens');
      localStorage.removeItem('alertas_lidas');
      localStorage.removeItem('dashboard_snapshot');
      window.dispatchEvent(new Event('storage'));
      setSalvo(true);
      setTimeout(() => setSalvo(false), 2500);
    }
  };

  const set = (campo: keyof Config, valor: any) =>
    setConfig((prev) => ({ ...prev, [campo]: valor }));

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Configurações"
          description="Carregando..."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <PageHeader
        title="Configurações"
        description="Preferências e configurações do sistema"
      />

      {/* Seção Fazenda */}
      <Card className="p-6">
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">
          🐄 Fazenda
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Nome da Fazenda
            </label>
            <Input
              type="text"
              value={config.nomeFazenda}
              onChange={(e) => set('nomeFazenda', e.target.value)}
              placeholder="Ex: Fazenda São João"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Responsável
            </label>
            <Input
              type="text"
              value={config.responsavel}
              onChange={(e) => set('responsavel', e.target.value)}
              placeholder="Nome do responsável"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                CNPJ / CPF
              </label>
              <Input
                type="text"
                value={config.cnpj}
                onChange={(e) => set('cnpj', e.target.value)}
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                Cidade / Estado
              </label>
              <Input
                type="text"
                value={config.cidadeEstado}
                onChange={(e) => set('cidadeEstado', e.target.value)}
                placeholder="São Paulo, SP"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Seção Alertas */}
      <Card className="p-6">
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">
          🚨 Alertas
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                Alerta Vacinação (dias)
              </label>
              <Input
                type="number"
                min="1"
                value={config.diasAlertaVacinacao}
                onChange={(e) =>
                  set('diasAlertaVacinacao', Number(e.target.value))
                }
                placeholder="7"
              />
              <p className="text-xs text-text-muted mt-1">
                Alertar com antecedência de X dias
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                Alerta Pesagem (dias)
              </label>
              <Input
                type="number"
                min="1"
                value={config.diasAlertaPesagem}
                onChange={(e) => set('diasAlertaPesagem', Number(e.target.value))}
                placeholder="30"
              />
              <p className="text-xs text-text-muted mt-1">
                Alertar se sem pesagem há X dias
              </p>
            </div>
          </div>

          <div className="border-t border-bg-border pt-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.alertaEmail}
                onChange={(e) => set('alertaEmail', e.target.checked)}
                className="w-4 h-4 rounded border-bg-border bg-bg-elevated cursor-pointer"
              />
              <span className="text-sm text-text-secondary">
                Alertas críticos por e-mail
              </span>
            </label>
          </div>

          {config.alertaEmail && (
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                E-mail para Alertas
              </label>
              <Input
                type="email"
                value={config.emailAlerta}
                onChange={(e) => set('emailAlerta', e.target.value)}
                placeholder="seu@email.com"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Seção Dados */}
      <Card className="p-6">
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">
          💾 Dados e Backup
        </h2>
        <div className="space-y-3 mb-4">
          <button
            onClick={handleExportarJSON}
            className="w-full px-4 py-2.5 rounded-lg border border-green-600/30
                       text-green-400 hover:bg-green-900/20 transition-colors
                       text-sm font-medium"
          >
            ↓ Exportar todos os dados (JSON)
          </button>
          <button
            onClick={handleImportarJSON}
            className="w-full px-4 py-2.5 rounded-lg border border-green-600/30
                       text-green-400 hover:bg-green-900/20 transition-colors
                       text-sm font-medium"
          >
            ↑ Importar dados (JSON)
          </button>
          <button
            onClick={handleLimparDados}
            className="w-full px-4 py-2.5 rounded-lg border border-red-600/30
                       text-red-400 hover:bg-red-900/20 transition-colors
                       text-sm font-medium"
          >
            🗑 Limpar todos os dados
          </button>
        </div>
        <p className="text-xs text-text-muted">
          O backup exporta animais, vacinações, pesagens e configurações em
          formato JSON. Ao importar, os dados existentes serão substituídos.
        </p>
      </Card>

      {/* Seção Sistema */}
      <Card className="p-6">
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">
          ℹ️ Sistema
        </h2>
        <p className="text-sm text-text-muted">Versão 1.0.0 — Rastreio</p>
      </Card>

      {/* Footer com botão salvar */}
      <div className="flex items-center justify-end gap-4 sticky bottom-6">
        {salvo && (
          <p className="text-sm text-green-400 font-semibold">
            ✓ Configurações salvas!
          </p>
        )}
        <Button variant="primary" onClick={handleSalvar} loading={saving}>
          Salvar Configurações
        </Button>
      </div>

      <Toast toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((toast) => toast.id !== id))} />
    </div>
  );
}
