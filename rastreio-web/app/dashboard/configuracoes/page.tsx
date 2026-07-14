'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/ui/PageHeader';
import { Toast, type ToastMessage } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface Preferencias {
  responsavel: string;
  cnpj: string;
  cidadeEstado: string;
  diasAlertaVacinacao: number;
  diasAlertaPesagem: number;
  alertaEmail: boolean;
  emailAlerta: string;
}

const preferenciasPadrao: Preferencias = {
  responsavel: '',
  cnpj: '',
  cidadeEstado: '',
  diasAlertaVacinacao: 7,
  diasAlertaPesagem: 30,
  alertaEmail: false,
  emailAlerta: '',
};

export default function ConfiguracoesPage() {
  const { user, profile, loading: authLoading, saveConfiguracoes } = useAuth();
  const [nomeFazenda, setNomeFazenda] = useState('');
  const [preferencias, setPreferencias] = useState<Preferencias>(preferenciasPadrao);
  const [salvo, setSalvo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Tudo o que o usuário vê aqui vem do profile carregado do Supabase
  // (tabela "profiles", isolado por usuário via RLS). Assim, ao fazer login
  // em qualquer dispositivo, as próprias configurações reaparecem.
  useEffect(() => {
    if (!profile) return;

    setNomeFazenda(profile.farm_name || 'Minha Fazenda');
    setPreferencias({ ...preferenciasPadrao, ...(profile.configuracoes || {}) });
  }, [profile]);

  const addToast = (message: string, type: ToastMessage['type']) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const setPref = (campo: keyof Preferencias, valor: any) =>
    setPreferencias((prev) => ({ ...prev, [campo]: valor }));

  const handleSalvar = async () => {
    const farmName = (nomeFazenda || 'Minha Fazenda').trim() || 'Minha Fazenda';

    if (!user?.id) {
      addToast('Sessão expirada. Faça login novamente para salvar.', 'error');
      return;
    }

    setSaving(true);
    try {
      await saveConfiguracoes(farmName, preferencias);
      setNomeFazenda(farmName);
      setSalvo(true);
      addToast('Configurações salvas com sucesso.', 'success');
      setTimeout(() => setSalvo(false), 2500);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar as configurações.';
      addToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleExportarJSON = async () => {
    if (!user?.id) return;
    setExporting(true);
    try {
      const [{ data: animais }, { data: vacinacoes }, { data: pesagens }] = await Promise.all([
        supabase.from('animais').select('*'),
        supabase.from('vacinacoes').select('*'),
        supabase.from('pesagens').select('*'),
      ]);

      const dados = {
        fazenda: nomeFazenda,
        preferencias,
        animais: animais || [],
        vacinacoes: vacinacoes || [],
        pesagens: pesagens || [],
        exportadoEm: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rastreio-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('Backup exportado com os dados atuais da sua conta.', 'success');
    } catch (error) {
      addToast('Não foi possível exportar os dados agora.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleImportarPreferencias = () => {
    fileInputRef.current?.click();
  };

  const handleArquivoSelecionado = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const dados = JSON.parse(ev.target?.result as string);
        // Por segurança, este importador restaura apenas as preferências
        // (nome da fazenda, alertas, etc.). Animais e vacinações já vivem
        // no Supabase e são cadastrados pela tela de Animais.
        if (dados.preferencias) {
          setPreferencias({ ...preferenciasPadrao, ...dados.preferencias });
        }
        if (dados.fazenda) {
          setNomeFazenda(dados.fazenda);
        }
        addToast('Preferências carregadas do arquivo. Clique em Salvar para confirmar.', 'success');
      } catch {
        addToast('Não foi possível ler o arquivo selecionado.', 'error');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleRestaurarPadrao = () => {
    if (typeof window === 'undefined') return;
    if (!confirm('Restaurar as preferências desta tela para os valores padrão? O nome da fazenda não será alterado.')) {
      return;
    }
    setPreferencias(preferenciasPadrao);
    addToast('Preferências redefinidas. Clique em Salvar para confirmar.', 'success');
  };

  if (authLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Configurações" description="Carregando..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <PageHeader
        title="Configurações"
        description="Preferências da sua conta — salvas no Supabase e disponíveis em qualquer login"
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
              value={nomeFazenda}
              onChange={(e) => setNomeFazenda(e.target.value)}
              placeholder="Ex: Fazenda São João"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Responsável
            </label>
            <Input
              type="text"
              value={preferencias.responsavel}
              onChange={(e) => setPref('responsavel', e.target.value)}
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
                value={preferencias.cnpj}
                onChange={(e) => setPref('cnpj', e.target.value)}
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                Cidade / Estado
              </label>
              <Input
                type="text"
                value={preferencias.cidadeEstado}
                onChange={(e) => setPref('cidadeEstado', e.target.value)}
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
                value={preferencias.diasAlertaVacinacao}
                onChange={(e) => setPref('diasAlertaVacinacao', Number(e.target.value))}
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
                value={preferencias.diasAlertaPesagem}
                onChange={(e) => setPref('diasAlertaPesagem', Number(e.target.value))}
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
                checked={preferencias.alertaEmail}
                onChange={(e) => setPref('alertaEmail', e.target.checked)}
                className="w-4 h-4 rounded border-bg-border bg-bg-elevated cursor-pointer"
              />
              <span className="text-sm text-text-secondary">
                Alertas críticos por e-mail
              </span>
            </label>
          </div>

          {preferencias.alertaEmail && (
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                E-mail para Alertas
              </label>
              <Input
                type="email"
                value={preferencias.emailAlerta}
                onChange={(e) => setPref('emailAlerta', e.target.value)}
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
            disabled={exporting}
            className="w-full px-4 py-2.5 rounded-lg border border-green-600/30
                       text-green-400 hover:bg-green-900/20 transition-colors
                       text-sm font-medium disabled:opacity-50"
          >
            {exporting ? 'Exportando...' : '↓ Exportar dados da conta (JSON)'}
          </button>
          <button
            onClick={handleImportarPreferencias}
            className="w-full px-4 py-2.5 rounded-lg border border-green-600/30
                       text-green-400 hover:bg-green-900/20 transition-colors
                       text-sm font-medium"
          >
            ↑ Importar preferências (JSON)
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleArquivoSelecionado}
          />
          <button
            onClick={handleRestaurarPadrao}
            className="w-full px-4 py-2.5 rounded-lg border border-red-600/30
                       text-red-400 hover:bg-red-900/20 transition-colors
                       text-sm font-medium"
          >
            🗑 Restaurar preferências padrão
          </button>
        </div>
        <p className="text-xs text-text-muted">
          O backup exporta os animais, vacinações, pesagens e preferências
          desta conta, direto do banco de dados. Animais e vacinações são
          gerenciados na tela de Animais e não são alterados por este
          importador — apenas as preferências acima.
        </p>
      </Card>

      {/* Seção Sistema */}
      <Card className="p-6">
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">
          ℹ️ Sistema
        </h2>
        <p className="text-sm text-text-muted">Versão 1.0.0 — Rastreio</p>
        <p className="text-xs text-text-muted mt-1">
          Conectado como {user?.email}
        </p>
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
