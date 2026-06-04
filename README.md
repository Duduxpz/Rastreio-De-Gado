# Rastreabilidade de Gado

Sistema SaaS de rastreabilidade bovina para fazendas brasileiras.

## 🚀 Estrutura do projeto

- **rastreio-mobile/** — App React Native (Expo) para uso no campo
- **rastreio-api/** — API REST Node.js + Express
- **rastreio-web/** — Painel Next.js para visualização

## 📋 Pré-requisitos

- Node.js 20+
- PostgreSQL / Supabase account
- Expo CLI (para mobile)

## 🔧 Setup

### 1. API

```bash
cd rastreio-api
npm install
cp .env.example .env
# Configure suas variáveis de ambiente
npm run dev
```

### 2. Web

```bash
cd rastreio-web
npm install
cp .env.example .env.local
# Configure suas variáveis de ambiente
npm run dev
```

### 3. Mobile

```bash
cd rastreio-mobile
npm install
cp .env.example .env
# Configure suas variáveis de ambiente
npm start
```

## 📚 Documentação

- Design system: [Design tokens](./rastreio-mobile/constants/)
- Componentes: [UI components](./rastreio-mobile/components/)
- Schema do banco: [database-schema.sql](./database-schema.sql)

## 🔐 Segurança

- Nunca exponha `SUPABASE_SERVICE_KEY` no frontend ou mobile
- Todo acesso ao banco passa por RLS
- IDs sempre UUID v4 gerados no cliente

## 📝 Padrões

- TypeScript strict mode em todos os arquivos
- Componentes mobile: objetos de estilo inline com tokens
- Componentes web: Tailwind CSS
- Sync: sempre em lote via `POST /api/sync/push`

## 🚀 Deploy

- API: Railway
- Web: Vercel
- Mobile: Expo EAS
# Pecuaria
# Pecuaria
