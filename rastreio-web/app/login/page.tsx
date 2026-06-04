'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
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
    // Verificar se já está autenticado
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-4">
            <span className="text-3xl">🐄</span>
          </div>
          <h1 className="text-4xl font-bold text-primary-600">Rastreio</h1>
          <p className="text-gray-600 mt-2">
            Rastreabilidade Bovina para sua Fazenda
          </p>
        </div>

        {/* Card */}
        <Card className="p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {isSignup ? 'Criar Conta' : 'Fazer Login'}
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div
                className={`p-4 rounded-lg text-sm border ${
                  error.includes('realizado') ||
                  error.includes('Verifique')
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-red-50 text-red-700 border-red-200'
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
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              {isSignup ? 'Já tem conta?' : 'Não tem conta?'}{' '}
              <button
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError('');
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                }}
                className="font-semibold text-primary-600 hover:text-primary-700"
              >
                {isSignup ? 'Fazer login' : 'Criar conta'}
              </button>
            </p>
          </div>
        </Card>

        {/* Features */}
        <div className="mt-12 grid grid-cols-3 gap-4 text-center text-sm">
          <div className="text-white">
            <div className="text-2xl mb-2">📊</div>
            <p>Dashboard</p>
          </div>
          <div className="text-white">
            <div className="text-2xl mb-2">🐄</div>
            <p>Rastreamento</p>
          </div>
          <div className="text-white">
            <div className="text-2xl mb-2">📈</div>
            <p>Relatórios</p>
          </div>
        </div>
      </div>
    </div>
  );
}
