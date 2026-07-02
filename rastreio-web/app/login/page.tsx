'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { clearAllAppStorage } from '@/lib/session';
import { saveFarmNameForUser } from '@/lib/profile';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LayoutDashboard,
  MapPin,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getAlertClasses = (hasError: boolean) =>
  hasError
    ? 'bg-danger-subtle text-danger-DEFAULT border-danger-DEFAULT/30'
    : 'bg-success-subtle text-success-DEFAULT border-success-DEFAULT/30';

const formatErrorMessage = (message: string) => {
  if (!message) return 'Algo deu errado. Tente novamente.';
  if (message.includes('Failed to fetch')) {
    return 'Não foi possível conectar ao servidor. Tente novamente.';
  }
  return message;
};

type LoginState = {
  email: string;
  password: string;
  confirmPassword: string;
  farmName: string;
  isSignup: boolean;
  forgotMode: boolean;
};

type LoginActions = {
  router: { push: (path: string) => void };
  setGlobalError: React.Dispatch<React.SetStateAction<string>>;
  setSuccessMessage: React.Dispatch<React.SetStateAction<string>>;
  setIsSignup: React.Dispatch<React.SetStateAction<boolean>>;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  setConfirmPassword: React.Dispatch<React.SetStateAction<string>>;
  setForgotMode: React.Dispatch<React.SetStateAction<boolean>>;
};

const getTitle = (forgotMode: boolean, isSignup: boolean) => {
  if (forgotMode) return 'Recuperar senha';
  if (isSignup) return 'Criar conta';
  return 'Fazer login';
};

const getSubtitle = (forgotMode: boolean) =>
  forgotMode
    ? 'Informe seu email para receber o link de redefinição.'
    : 'Entre com seu email e senha para acessar o painel.';

const getSubmitLabel = (forgotMode: boolean, isSignup: boolean, loading: boolean) => {
  if (forgotMode) return loading ? 'Enviando...' : 'Enviar link';
  if (isSignup) return loading ? 'Criando conta...' : 'Criar conta';
  return loading ? 'Entrando...' : 'Entrar';
};

const processAuthAction = async (state: LoginState, actions: LoginActions) => {
  if (state.forgotMode) {
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(state.email);
    if (resetError) {
      actions.setGlobalError(formatErrorMessage(resetError.message));
      return;
    }
    actions.setSuccessMessage('Enviamos um link para recuperar sua senha. Verifique seu email.');
    return;
  }

  if (state.isSignup) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
    email: state.email,
    password: state.password,
    options: {
      data: {
        farm_name: state.farmName,
      },
    },
  });
    if (authError) {
      actions.setGlobalError(formatErrorMessage(authError.message));
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      actions.setGlobalError('Não foi possível concluir o cadastro. Tente novamente.');
      return;
    }

    try {
      await saveFarmNameForUser(userId, state.farmName);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar a fazenda inicial.';
      actions.setGlobalError(formatErrorMessage(message));
      return;
    }

    actions.setSuccessMessage('Cadastro realizado! Verifique seu email para confirmar.');
    setTimeout(() => {
      actions.setIsSignup(false);
      actions.setEmail('');
      actions.setPassword('');
      actions.setConfirmPassword('');
      actions.setForgotMode(false);
    }, 2000);
    return;
  }

  const { error: authError } = await supabase.auth.signInWithPassword({ email: state.email, password: state.password });
  if (authError) {
    actions.setGlobalError(formatErrorMessage(authError.message));
    return;
  }

  actions.router.push('/dashboard');
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [farmName, setFarmName] = useState('');
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);

  useEffect(() => {
    clearAllAppStorage();

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      }
    };

    checkAuth();
  }, [router]);

  const resetValidation = () => {
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setGlobalError('');
    setSuccessMessage('');
  };

  const validateFields = () => {
    resetValidation();
    let valid = true;

    if (!email) {
      setEmailError('Informe seu email');
      valid = false;
    } else if (!EMAIL_PATTERN.test(email)) {
      setEmailError('Digite um email válido');
      valid = false;
    }

    if (forgotMode) {
      return valid;
    }

    if (!password) {
      setPasswordError('A senha não pode ficar vazia');
      valid = false;
    }

    if (isSignup) {
      if (!farmName.trim()) {
        setGlobalError('Informe o nome da fazenda');
        valid = false;
      }

      if (!confirmPassword) {
        setConfirmPasswordError('Confirme sua senha');
        valid = false;
      } else if (password !== confirmPassword) {
        setConfirmPasswordError('As senhas não conferem');
        valid = false;
      }
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetValidation();

    if (!validateFields()) {
      return;
    }

    setLoading(true);

    try {
      await processAuthAction(
        {
          email,
          password,
          confirmPassword,
          farmName: farmName.trim(),
          isSignup,
          forgotMode,
        },
        {
          router,
          setGlobalError,
          setSuccessMessage,
          setIsSignup,
          setEmail,
          setPassword,
          setConfirmPassword,
          setForgotMode,
        },
      );
    } catch (err: any) {
      setGlobalError(formatErrorMessage(err?.message || 'Erro ao fazer login'));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignup((current) => !current);
    setForgotMode(false);
    setPassword('');
    setConfirmPassword('');
    setFarmName('');
    resetValidation();
  };

  const title = getTitle(forgotMode, isSignup);
  const subtitle = getSubtitle(forgotMode);
  const submitLabel = getSubmitLabel(forgotMode, isSignup, loading);
  const alertClasses = getAlertClasses(Boolean(globalError));
  const loginMode = !forgotMode;
  const showConfirmPassword = isSignup && loginMode;

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-DEFAULT/15 text-brand-DEFAULT mb-4 shadow-lg shadow-brand-DEFAULT/10">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight">Rastreio</h1>
          <p className="text-text-secondary mt-3 max-w-xl mx-auto text-sm md:text-base">
            Rastreabilidade bovina com tema rural, foco em segurança e controle do seu rebanho.
          </p>
        </div>

        <Card className="p-8 shadow-2xl border border-brand-DEFAULT/10 bg-bg-elevated/95">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-semibold text-white">{title}</h2>
            <p className="text-text-secondary mt-2 text-sm">{subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {(globalError || successMessage) && (
              <div className={`rounded-2xl p-4 text-sm border ${alertClasses}`}>
                {globalError || successMessage}
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
              icon={<Mail size={18} />}
              error={emailError}
            />

            {!forgotMode && (
              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                icon={<Lock size={18} />}
                rightIcon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                onRightIconClick={() => setShowPassword((current) => !current)}
                error={passwordError}
              />
            )}

            {showConfirmPassword && (
              <Input
                label="Nome da fazenda"
                type="text"
                placeholder="Ex: Fazenda São João"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                disabled={loading}
                required
                icon={<MapPin size={18} />}
              />
            )}

            {showConfirmPassword && (
              <Input
                label="Confirmar senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
                icon={<Lock size={18} />}
                rightIcon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                onRightIconClick={() => setShowPassword((current) => !current)}
                error={confirmPasswordError}
              />
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => {
                  if (forgotMode) {
                    setForgotMode(false);
                    resetValidation();
                    return;
                  }

                  setForgotMode(true);
                  setIsSignup(false);
                  resetValidation();
                  setPassword('');
                  setConfirmPassword('');
                }}
                className="text-sm font-medium text-brand-DEFAULT hover:text-brand-light"
              >
                {forgotMode ? 'Voltar ao login' : 'Esqueci minha senha'}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              {submitLabel}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-bg-border text-center">
            <p className="text-sm text-text-secondary">
              {isSignup ? 'Já tem conta?' : 'Ainda não tem conta?'}{' '}
              <button
                type="button"
                onClick={switchMode}
                className="font-semibold text-brand-DEFAULT hover:text-brand-light"
              >
                {isSignup ? 'Fazer login' : 'Criar conta'}
              </button>
            </p>
          </div>
        </Card>

        <div className="mt-12 grid grid-cols-3 gap-4 text-center text-sm">
          <div className="rounded-3xl border border-bg-border bg-bg-elevated/80 p-4">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-DEFAULT/10 text-brand-DEFAULT">
              <LayoutDashboard size={20} />
            </div>
            <p className="font-medium text-white">Dashboard</p>
          </div>
          <div className="rounded-3xl border border-bg-border bg-bg-elevated/80 p-4">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-DEFAULT/10 text-brand-DEFAULT">
              <MapPin size={20} />
            </div>
            <p className="font-medium text-white">Rastreamento</p>
          </div>
          <div className="rounded-3xl border border-bg-border bg-bg-elevated/80 p-4">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-DEFAULT/10 text-brand-DEFAULT">
              <BarChart3 size={20} />
            </div>
            <p className="font-medium text-white">Relatórios</p>
          </div>
        </div>
      </div>
    </div>
  );
}
