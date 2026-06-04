# Rastreabilidade de Gado — Instruções completas do projeto

## Visão geral

Sistema SaaS de rastreabilidade bovina para fazendas brasileiras.
Três aplicações integradas com um banco central compartilhado.

| App | Pasta | Quem usa |
|---|---|---|
| Mobile (offline-first) | `rastreio-mobile/` | Peão e fazendeiro no campo |
| API REST | `rastreio-api/` | Consumida pelo mobile e pelo web |
| Painel web | `rastreio-web/` | Fazendeiro no computador |

---

## Stack

| Camada | Tecnologia |
|---|---|
| Mobile | React Native, Expo SDK 51, Expo Router v3, TypeScript |
| Banco local | expo-sqlite v2 (API síncrona) |
| Backend | Node.js 20, Express 5, TypeScript |
| Banco nuvem | Supabase (PostgreSQL 15) com RLS |
| Autenticação | Supabase Auth + JWT |
| Web | Next.js 14 App Router, Tailwind CSS v3, Recharts |
| Deploy | Railway (API), Vercel (web), Expo EAS (mobile) |

---

## Regras absolutas — nunca quebre estas

1. Todo arquivo é TypeScript — zero `.js` puro no projeto
2. App mobile funciona 100% offline — nenhuma tela trava sem internet
3. `SUPABASE_SERVICE_KEY` existe apenas no backend, nunca no mobile ou web
4. Todo acesso ao banco passa pelo RLS — cada fazenda vê só os próprios dados
5. Sync sempre em lote via `POST /api/sync/push` — nunca registro por registro
6. IDs são sempre UUID v4 gerados no cliente antes de salvar (garante funcionamento offline)
7. Campos `synced = 0` = pendente de envio; `synced = 1` = já enviado ao servidor
8. Nunca use `any` no TypeScript — use os tipos definidos em `types/index.ts`

---

## Design system — Mobile (React Native)

### Paleta de cores

```typescript
// constants/colors.ts
export const colors = {
  // Primária — verde campo
  primary:        '#1A7A4A',
  primaryLight:   '#E8F5EE',
  primaryDark:    '#0F5233',

  // Secundária — âmbar para alertas e destaque
  accent:         '#D97706',
  accentLight:    '#FEF3C7',
  accentDark:     '#92400E',

  // Neutros
  gray900:        '#111827',
  gray700:        '#374151',
  gray500:        '#6B7280',
  gray300:        '#D1D5DB',
  gray100:        '#F3F4F6',
  white:          '#FFFFFF',

  // Semânticas
  success:        '#059669',
  successLight:   '#D1FAE5',
  warning:        '#D97706',
  warningLight:   '#FEF3C7',
  danger:         '#DC2626',
  dangerLight:    '#FEE2E2',
  info:           '#2563EB',
  infoLight:      '#DBEAFE',

  // Fundo
  background:     '#F9FAFB',
  surface:        '#FFFFFF',
  surfaceAlt:     '#F3F4F6',
};
```

### Tipografia

```typescript
// constants/typography.ts
export const typography = {
  // Tamanhos
  xs:   10,
  sm:   12,
  base: 14,
  md:   16,
  lg:   18,
  xl:   22,
  xxl:  28,

  // Pesos
  regular: '400' as const,
  medium:  '500' as const,
  semibold:'600' as const,
  bold:    '700' as const,
};
```

### Espaçamento

```typescript
// constants/spacing.ts
export const spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  xxl:  32,
  xxxl: 48,
};
```

### Componentes base reutilizáveis

```typescript
// components/ui/Card.tsx
import { View, ViewStyle } from 'react-native';
import { colors, spacing } from '../../constants';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  const styles: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    ...(variant === 'elevated' && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    }),
    ...(variant === 'outlined' && {
      borderWidth: 1,
      borderColor: colors.gray300,
    }),
  };
  return <View style={[styles, style]}>{children}</View>;
}
```

```typescript
// components/ui/Badge.tsx
import { View, Text } from 'react-native';
import { colors, typography, spacing } from '../../constants';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const variantMap = {
  success: { bg: colors.successLight, text: colors.success },
  warning: { bg: colors.warningLight, text: colors.warning },
  danger:  { bg: colors.dangerLight,  text: colors.danger  },
  info:    { bg: colors.infoLight,    text: colors.info    },
  neutral: { bg: colors.gray100,      text: colors.gray700 },
};

export function Badge({ label, variant = 'neutral' }: { label: string; variant?: BadgeVariant }) {
  const { bg, text } = variantMap[variant];
  return (
    <View style={{ backgroundColor: bg, borderRadius: 99,
                   paddingHorizontal: spacing.sm, paddingVertical: 3,
                   alignSelf: 'flex-start' }}>
      <Text style={{ color: text, fontSize: typography.xs,
                     fontWeight: typography.semibold }}>{label}</Text>
    </View>
  );
}
```

```typescript
// components/ui/Button.tsx
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from 'react-native';
import { colors, typography, spacing } from '../../constants';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

const variantStyles = {
  primary:   { bg: colors.primary,   text: colors.white,   border: 'transparent' },
  secondary: { bg: colors.primaryLight, text: colors.primaryDark, border: colors.primary },
  ghost:     { bg: 'transparent',    text: colors.gray700,  border: colors.gray300 },
  danger:    { bg: colors.danger,    text: colors.white,   border: 'transparent' },
};

export function Button({ label, onPress, variant = 'primary',
                         loading, disabled, fullWidth }: ButtonProps) {
  const s = variantStyles[variant];
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={{
        backgroundColor: s.bg,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: s.border,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: spacing.sm,
        opacity: disabled ? 0.5 : 1,
        ...(fullWidth && { width: '100%' }),
      }}>
      {loading && <ActivityIndicator size="small" color={s.text} />}
      <Text style={{ color: s.text, fontSize: typography.base,
                     fontWeight: typography.semibold }}>{label}</Text>
    </TouchableOpacity>
  );
}
```

```typescript
// components/ui/Input.tsx
import { useState } from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { colors, typography, spacing } from '../../constants';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={{ fontSize: typography.sm, fontWeight: typography.medium,
                     color: colors.gray700, marginBottom: spacing.xs }}>{label}</Text>
      <TextInput
        {...props}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e)  => { setFocused(false); props.onBlur?.(e); }}
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: error ? colors.danger : focused ? colors.primary : colors.gray300,
          borderRadius: 10,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          fontSize: typography.base,
          color: colors.gray900,
        }}
        placeholderTextColor={colors.gray500}
      />
      {(error || hint) && (
        <Text style={{ fontSize: typography.xs, marginTop: spacing.xs,
                       color: error ? colors.danger : colors.gray500 }}>
          {error ?? hint}
        </Text>
      )}
    </View>
  );
}
```

### AnimalCard — card principal do rebanho

```typescript
// components/AnimalCard.tsx
import { TouchableOpacity, View, Text, Image } from 'react-native';
import { router } from 'expo-router';
import { Badge } from './ui/Badge';
import { colors, typography, spacing } from '../constants';
import type { Animal } from '../types';

function categoriaParaBadge(categoria?: string) {
  const map: Record<string, 'success'|'info'|'warning'|'neutral'> = {
    bezerro: 'info', novilha: 'success', vaca: 'success',
    touro: 'warning', boi: 'neutral',
  };
  return map[categoria ?? ''] ?? 'neutral';
}

export function AnimalCard({ animal }: { animal: Animal }) {
  return (
    <TouchableOpacity
      onPress={() => router.push(`/animal/${animal.id}`)}
      activeOpacity={0.8}
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: spacing.lg,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.gray100,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
      }}>
      {/* Avatar */}
      <View style={{
        width: 48, height: 48, borderRadius: 10,
        backgroundColor: colors.primaryLight,
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {animal.foto_url
          ? <Image source={{ uri: animal.foto_url }}
                   style={{ width: 48, height: 48 }} />
          : <Text style={{ fontSize: 22 }}>🐄</Text>
        }
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center',
                       justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ fontSize: typography.md, fontWeight: typography.semibold,
                         color: colors.gray900 }}>
            Brinco {animal.brinco}
          </Text>
          {!animal.synced && (
            <View style={{ width: 8, height: 8, borderRadius: 4,
                           backgroundColor: colors.accent }} />
          )}
        </View>
        <Text style={{ fontSize: typography.sm, color: colors.gray500, marginBottom: 6 }}>
          {animal.raca ?? 'Raça não informada'} · {animal.lote ?? 'Sem lote'}
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.xs }}>
          <Badge label={animal.categoria ?? 'Animal'} variant={categoriaParaBadge(animal.categoria)} />
          {animal.peso_atual && (
            <Badge label={`${animal.peso_atual} kg`} variant="neutral" />
          )}
        </View>
      </View>

      {/* Seta */}
      <Text style={{ color: colors.gray300, fontSize: 18 }}>›</Text>
    </TouchableOpacity>
  );
}
```

---

## Design system — Web (Next.js + Tailwind)

### Configuração `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#E8F5EE',
          100: '#C6E6D4',
          500: '#1A7A4A',
          600: '#146040',
          700: '#0F5233',
        },
        accent: {
          50:  '#FEF3C7',
          500: '#D97706',
          700: '#92400E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
  plugins: [],
};
export default config;
```

### Componentes web padrão

```typescript
// components/ui/StatCard.tsx
interface StatCardProps {
  label: string;
  value: number | string;
  delta?: string;
  deltaPositive?: boolean;
}

export function StatCard({ label, value, delta, deltaPositive }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      {delta && (
        <p className={`text-xs mt-1 ${deltaPositive ? 'text-primary-500' : 'text-red-500'}`}>
          {deltaPositive ? '↑' : '↓'} {delta}
        </p>
      )}
    </div>
  );
}
```

---

## Estrutura de pastas completa

```
rastreio-mobile/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx           # lista de animais
│   │   ├── cadastro.tsx        # cadastrar animal
│   │   └── relatorios.tsx      # histórico
│   ├── animal/[id].tsx         # detalhe do animal
│   └── _layout.tsx             # layout base com tab bar
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   └── EmptyState.tsx
│   ├── AnimalCard.tsx
│   ├── FormVacinacao.tsx
│   └── FormPesagem.tsx
├── constants/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   └── index.ts                # re-exporta tudo
├── database/
│   ├── schema.ts               # init + CRUD SQLite
│   └── sync.ts                 # offline → online
├── services/
│   └── api.ts                  # axios instance + endpoints
├── types/
│   └── index.ts                # Animal, Vacinacao, Pesagem, etc.
└── hooks/
    ├── useAnimais.ts
    └── useSync.ts

rastreio-api/
├── src/
│   ├── server.ts
│   ├── routes/
│   │   ├── animais.ts
│   │   ├── vacinacoes.ts
│   │   ├── pesagens.ts
│   │   └── sync.ts
│   ├── middleware/
│   │   └── auth.ts
│   └── lib/
│       └── supabase.ts
└── .env

rastreio-web/
├── app/
│   ├── login/page.tsx
│   └── dashboard/
│       ├── page.tsx
│       ├── animais/page.tsx
│       ├── animais/[id]/page.tsx
│       ├── relatorios/page.tsx
│       └── alertas/page.tsx
├── components/
│   ├── ui/
│   │   ├── StatCard.tsx
│   │   ├── Button.tsx
│   │   └── Badge.tsx
│   ├── Sidebar.tsx
│   ├── AnimalTable.tsx
│   ├── GraficoEvolucao.tsx
│   └── AlertaCard.tsx
├── lib/
│   └── supabase.ts
└── tailwind.config.ts
```

---

## Banco de dados

```sql
CREATE TABLE fazendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  plano TEXT DEFAULT 'starter' CHECK (plano IN ('starter','fazenda','enterprise')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE animais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fazenda_id UUID REFERENCES fazendas(id) ON DELETE CASCADE,
  brinco TEXT NOT NULL,
  raca TEXT,
  sexo TEXT CHECK (sexo IN ('M','F')),
  data_nascimento DATE,
  peso_atual NUMERIC(6,2),
  lote TEXT,
  pasto TEXT,
  categoria TEXT CHECK (categoria IN ('bezerro','novilha','vaca','touro','boi','outro')),
  foto_url TEXT,
  ativo BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (fazenda_id, brinco)
);

CREATE TABLE vacinacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID REFERENCES animais(id) ON DELETE CASCADE,
  vacina TEXT NOT NULL,
  data DATE NOT NULL,
  dose TEXT,
  veterinario TEXT,
  proxima_dose DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE pesagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID REFERENCES animais(id) ON DELETE CASCADE,
  peso NUMERIC(6,2) NOT NULL,
  data DATE NOT NULL,
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security
ALTER TABLE animais    ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacinacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pesagens   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rls_animais" ON animais USING (
  fazenda_id IN (SELECT id FROM fazendas WHERE owner_id = auth.uid())
);
CREATE POLICY "rls_vacinacoes" ON vacinacoes USING (
  animal_id IN (SELECT id FROM animais WHERE fazenda_id IN (
    SELECT id FROM fazendas WHERE owner_id = auth.uid()
  ))
);
CREATE POLICY "rls_pesagens" ON pesagens USING (
  animal_id IN (SELECT id FROM animais WHERE fazenda_id IN (
    SELECT id FROM fazendas WHERE owner_id = auth.uid()
  ))
);
```

---

## Tipos TypeScript (compartilhados)

```typescript
// types/index.ts
export type Sexo      = 'M' | 'F';
export type Categoria = 'bezerro' | 'novilha' | 'vaca' | 'touro' | 'boi' | 'outro';
export type Plano     = 'starter' | 'fazenda' | 'enterprise';

export interface Animal {
  id: string;
  fazenda_id: string;
  brinco: string;
  raca?: string;
  sexo?: Sexo;
  data_nascimento?: string;  // ISO date string
  peso_atual?: number;
  lote?: string;
  pasto?: string;
  categoria?: Categoria;
  foto_url?: string;
  ativo: boolean;
  updated_at: string;
  synced?: 0 | 1;            // apenas no SQLite mobile
}

export interface Vacinacao {
  id: string;
  animal_id: string;
  vacina: string;
  data: string;
  dose?: string;
  veterinario?: string;
  proxima_dose?: string;
  synced?: 0 | 1;
}

export interface Pesagem {
  id: string;
  animal_id: string;
  peso: number;
  data: string;
  observacao?: string;
  synced?: 0 | 1;
}

export interface SyncPayload {
  fazenda_id: string;
  animais:    Animal[];
  vacinacoes: Vacinacao[];
  pesagens:   Pesagem[];
}
```

---

## Variáveis de ambiente

### `rastreio-api/.env`
```env
SUPABASE_URL=https://SEU_PROJETO.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
JWT_SECRET=string_aleatoria_minimo_32_chars
PORT=3001
```

### `rastreio-web/.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
API_URL=https://sua-api.railway.app
```

### `rastreio-mobile/.env`
```env
EXPO_PUBLIC_API_URL=http://192.168.1.X:3001
EXPO_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## Padrões de código obrigatórios

- Componentes mobile: `StyleSheet.create` ou objetos de estilo inline — nunca estilos mágicos soltos
- Sempre use os tokens de `constants/` — nunca hardcode cores ou tamanhos de fonte
- Componentes web: classes Tailwind — nunca `style={{}}` no JSX web exceto valores dinâmicos
- Toda chamada async envolve try/catch com feedback visual ao usuário (loading state + toast de erro)
- Formulários mobile usam `react-hook-form` + `zod` para validação
- Hooks customizados para lógica de negócio — telas são só apresentação
