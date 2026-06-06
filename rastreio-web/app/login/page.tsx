'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { clearAllAppStorage } from '@/lib/session';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    // Limpar qualquer cache de conta anterior ao abrir a tela de login
    clearAllAppStorage();

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      }
    };
    checkAuth();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);

    try {
      if (isSignup) {
        if (password !== confirmPassword) {
          setError('As senhas não coincidem');
          return;
        }

        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) {
          setError(authError.message);
          return;
        }

        setError('Cadastro realizado! Verifique seu email para confirmar.');
        setTimeout(() => {
          setIsSignup(false);
          setEmail('');
          setPassword('');
          setConfirmPassword('');
        }, 2000);
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          setError(authError.message);
          return;
        }

        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-DEFAULT rounded-full mb-4">
            <span className="text-3xl">🐄</span>
          </div>
          <h1 className="text-4xl font-bold text-text-primary">Rastreio</h1>
          <p className="text-text-muted mt-2">
            Rastreabilidade Bovina para sua Fazenda
          </p>
        </div>

        {/* Card */}
        <Card className="p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-text-primary mb-6 text-center">
            {isSignup ? 'Criar Conta' : 'Fazer Login'}
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div
                className={`p-4 rounded-lg text-sm border ${
                  error.includes('realizado') ||
                  error.includes('Verifique')
                    ? 'bg-success-subtle text-success-DEFAULT border-success-DEFAULT/30'
                    : 'bg-danger-subtle text-danger-DEFAULT border-danger-DEFAULT/30'
                }`}
              >
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />

            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />

            {isSignup && (
              <Input
                label="Confirmar Senha"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              {isSignup
                ? loading
                  ? 'Criando conta...'
                  : 'Criar Conta'
                : loading
                  ? 'Entrando...'
                  : 'Entrar'}
            </Button>
          </form>

          {/* Toggle Signup/Login */}
          <div className="mt-6 pt-6 border-t border-bg-border text-center">
            <p className="text-sm text-text-secondary">
              {isSignup ? 'Já tem conta?' : 'Não tem conta?'}{' '}
              <button
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError('');
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                }}
                className="font-semibold text-cta-DEFAULT hover:text-cta-light"
              >
                {isSignup ? 'Fazer login' : 'Criar conta'}
              </button>
            </p>
          </div>
        </Card>

        {/* Features */}
        <div className="mt-12 grid grid-cols-3 gap-4 text-center text-sm">
          <div className="text-text-muted">
            <div className="text-2xl mb-2">📊</div>
            <p>Dashboard</p>
          </div>
          <div className="text-text-muted">
            <div className="text-2xl mb-2">🐄</div>
            <p>Rastreamento</p>
          </div>
          <div className="text-text-muted">
            <div className="text-2xl mb-2">📈</div>
            <p>Relatórios</p>
          </div>
        </div>
      </div>
    </div>
  );
}
