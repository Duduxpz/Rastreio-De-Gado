# 🤖 Centro Inteligente de Insights Pecuários — Documentação Completa

> **Refatoração do módulo "Recomendações Inteligentes"** transformando dados técnicos em insights acionáveis para produtores.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [API](#api)
4. [Frontend Web](#frontend-web)
5. [Mobile](#mobile)
6. [Regras de IA](#regras-de-ia)
7. [Próximos Passos](#próximos-passos)

---

## 🎯 Visão Geral

### Objetivo
Transformar o módulo de recomendações em um **Centro Inteligente de Insights**, onde:
- ✅ A IA interpreta dados do rebanho automaticamente
- ✅ Gera recomendações **claras, úteis e acionáveis**
- ✅ **Nenhum JSON ou ID técnico** é visível ao usuário
- ✅ Linguagem **humanizada** em português

### Problema Anterior
- Exibição de JSON bruto (`{"totalSemVacina": 1}`)
- Falta de contexto (motivo, impacto, sugestão)
- UI desorganizada com espaço vazio

### Solução Implementada
```
┌─────────────────────────────────────┐
│ [ALTA]                              │
│                                     │
│ Animal sem vacinação registrada     │
│                                     │
│ Identificamos 1 animal sem...       │
│                                     │
│ Impacto: Risco sanitário elevado    │
│                                     │
│ Sugestão da IA: Regularizar...      │
│                                     │
│ [Análise da IA ▼]                   │
│                                     │
│ [Reconhecer] [Concluir]             │
└─────────────────────────────────────┘
```

---

## 🏗️ Arquitetura

### Camadas

```
┌─────────────────────────────────────┐
│    Frontend Web (Next.js + React)   │
│  ├─ RecommendationCard              │
│  ├─ RecommendationMetrics           │
│  └─ useRecommendations (hook)       │
├─────────────────────────────────────┤
│    API Backend (Express + Node.js)  │
│  ├─ /api/recommendations            │
│  ├─ AIRecommendationEngine          │
│  └─ BuiltinAIProvider               │
├─────────────────────────────────────┤
│    Database (Supabase PostgreSQL)   │
│  └─ recommendations table (RLS)     │
├─────────────────────────────────────┤
│    Mobile (React Native + Expo)     │
│  ├─ RecommendationsRepository       │
│  ├─ Local SQLite (sync)             │
│  └─ Push/Pull sync                  │
└─────────────────────────────────────┘
```

### Provedores de IA

```typescript
interface AIProvider {
  generateRecommendation(context)    // Gera uma recomendação
  generateAnalysis(context)          // Análise em texto
  generateRiskAssessment(context)    // Avalia risco sanitário
  generateHealthScore(context)       // Score de saúde (0-100)
  getProviderName()                  // Nome do provedor
}

// Implementações
✅ BuiltinAIProvider          // Motor de regras (sempre disponível)
⏳ OpenAIProvider             // GPT-4 (template pronto)
⏳ ClaudeProvider             // Claude 3 (template pronto)
⏳ GeminiProvider             // Google Gemini (template pronto)
```

---

## 🔌 API

### Endpoints

#### `GET /api/recommendations`
Lista recomendações com filtros.

**Query Parameters:**
- `prioridade` — `ALTA|MEDIA|BAIXA|INFORMATIVA`
- `status` — `PENDENTE|RECONHECIDA|RESOLVIDA`
- `limite` — max 100 (default 50)
- `offset` — para paginação

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "fazenda_id": "uuid",
      "prioridade": "ALTA",
      "titulo": "Animal sem vacinação registrada",
      "descricao": "Identificamos 1 animal...",
      "impacto": "Risco sanitário elevado",
      "sugestao": "Regularizar vacinação em até 7 dias",
      "analiseIA": "A IA identificou que existe 1 animal...",
      "status": "PENDENTE",
      "payload": {"totalSemVacina": 1},
      "created_at": "2025-06-06T10:30:00Z",
      "updated_at": "2025-06-06T10:30:00Z"
    }
  ],
  "total": 5
}
```

#### `GET /api/recommendations/metrics`
Retorna resumo de recomendações.

**Resposta:**
```json
{
  "success": true,
  "data": {
    "total": 5,
    "pendentes": 3,
    "reconhecidas": 1,
    "resolvidas": 1,
    "altaPrioridade": 2
  }
}
```

#### `POST /api/recommendations/generate`
Gera automaticamente novas recomendações baseadas em dados do rebanho.

**Processo:**
1. Busca dados: animais, vacinações, pesagens
2. Passa para `AIRecommendationEngine`
3. Engine aplica regras e retorna `AIInsight`
4. Salva no banco (evita duplicatas por título)

**Resposta:**
```json
{
  "success": true,
  "data": {...},
  "isNew": true  // ou false se atualizou existente
}
```

#### `PATCH /api/recommendations/:id`
Atualiza status de uma recomendação.

**Body:**
```json
{
  "status": "RECONHECIDA"  // ou "RESOLVIDA"
}
```

---

## 💻 Frontend Web

### Página: `/dashboard/recomendacoes`

#### Layout
```
┌─────────────────────────────────────┐
│ Centro Inteligente de Insights      │  Botão: 🤖 Gerar Insights
├─────────────────────────────────────┤
│ [5] Total  [3] Pendentes  [1] Resolvidas
│ [2] Reconhecidas  [2] Alta Prioridade
├─────────────────────────────────────┤
│ Filtros:                            │
│ [Prioridade: Todas ▼] [Status: Todos ▼]
│ [Limpar Filtros]
├─────────────────────────────────────┤
│ RecommendationCard #1 (ALTA)        │
│ RecommendationCard #2 (MEDIA)       │
│ ...
└─────────────────────────────────────┘
```

### Componentes

#### `<RecommendationCard />`
```typescript
interface RecommendationCardProps {
  recommendation: Recommendation
  onStatusChange: (id, status) => Promise<void>
  loading?: boolean
}
```

Features:
- Badge colorida por prioridade
- Título destacado
- Descrição humanizada
- Card "Impacto"
- Card "Sugestão da IA" (destaque especial)
- Accordion "Análise da IA" (sem JSON bruto)
- Botões: Reconhecer, Concluir, Marcar Resolvida
- Responsivo

#### `<RecommendationMetrics />`
5 cards de resumo:
- Total de Recomendações
- Pendentes
- Reconhecidas
- Resolvidas
- Alta Prioridade

### Hook: `useRecommendations`

```typescript
const {
  recommendations,      // Recommendation[]
  metrics,              // RecommendationMetrics | null
  total,                // number
  loading,              // boolean
  error,                // string | null
  fetchRecommendations, // () => Promise<void>
  fetchMetrics,         // () => Promise<void>
  updateStatus,         // (id, status) => Promise<Recommendation | null>
  generateNewRecommendations, // () => Promise<Recommendation | null>
} = useRecommendations({
  prioridade: 'ALTA',
  status: 'PENDENTE',
  limit: 50,
});
```

### Filtros

- **Prioridade:** Todas | Alta | Média | Baixa | Informativa
- **Status:** Todos | Pendente | Reconhecida | Resolvida

---

## 📱 Mobile

### Database Schema

Tabela `recommendations`:
```sql
CREATE TABLE recommendations (
  id TEXT PRIMARY KEY,
  fazenda_id TEXT,
  prioridade TEXT,              -- ALTA|MEDIA|BAIXA|INFORMATIVA
  titulo TEXT,
  descricao TEXT,
  impacto TEXT,
  sugestao TEXT,
  analiseIA TEXT,
  status TEXT,                  -- PENDENTE|RECONHECIDA|RESOLVIDA
  payload TEXT,                 -- JSON string
  created_at TEXT,
  updated_at TEXT,
  synced INTEGER DEFAULT 0      -- 0=não sincronizado, 1=sincronizado
)
```

### RecommendationsRepository

```typescript
class RecommendationsRepository {
  async create(rec)           // Cria nova
  async findByFazenda(id)     // Lista todas
  async findByStatus(id, st)  // Filtra por status
  async updateStatus(id, st)  // Atualiza status
  async findUnsynced()        // Para sincronização
  async markSynced(id)        // Marca como sincronizado
}
```

### Sincronização

**Pull (API → SQLite):**
```
GET /api/recommendations?limite=100
  ↓
Busca recomendações no servidor
  ↓
Evita duplicatas
  ↓
Atualiza status se mudou
```

**Push (SQLite → API):**
```
Busca recomendações com synced=0
  ↓
PATCH /api/recommendations/:id com status atualizado
  ↓
Marca como synced=1 se sucesso
```

---

## 🧠 Regras de IA

### 1. Vacinação

#### Vacinações Vencidas
- **Condição:** `proxima_dose < hoje`
- **Prioridade:** ALTA
- **Título:** "Vacinação vencida"
- **Descrição:** Identifica X vacinações com prazo expirado
- **Impacto:** "Elevado risco sanitário"
- **Sugestão:** "Regularizar imediatamente com veterinário"

#### Animal sem Vacinação
- **Condição:** Animal sem nenhum registro vacinal
- **Prioridade:** ALTA
- **Título:** "Animal sem vacinação registrada"
- **Descrição:** Identifica X animais sem vacinação
- **Impacto:** "Risco sanitário elevado"
- **Sugestão:** "Regularizar vacinação em até 7 dias"

### 2. Pesagem

#### Pesagem Desatualizada
- **Condição:** Última pesagem > 30 dias atrás
- **Prioridade:** ALTA
- **Título:** "Pesagem desatualizada"
- **Descrição:** X animais sem pesagem recente
- **Impacto:** "Perda de acompanhamento zootécnico"
- **Sugestão:** "Realizar nova pesagem"

#### Nenhuma Pesagem
- **Condição:** `totalPesagens = 0`
- **Prioridade:** INFORMATIVA
- **Título:** "Nenhuma pesagem registrada"
- **Descrição:** "O sistema ainda não possui registros"
- **Sugestão:** "Registrar a primeira pesagem"

### 3. Cadastro

#### Rebanho Vazio
- **Condição:** `totalAnimais = 0`
- **Prioridade:** INFORMATIVA
- **Título:** "Começar cadastro do rebanho"
- **Descrição:** Nenhum animal cadastrado
- **Sugestão:** "Cadastre os animais"

#### Dados Incompletos
- **Condição:** >30% de animais sem raca/sexo/data_nascimento
- **Prioridade:** MEDIA
- **Título:** "Cadastros incompletos"
- **Descrição:** X animal(is) com dados faltando
- **Sugestão:** "Complete os dados cadastrais"

### 4. Saúde Geral

#### Score de Saúde
```
Score = (taxaVacinal * 50% + taxaDados * 30% + taxaPesagem * 20%)

Se score > 80% →  INFORMATIVA "Rebanho em dia! ✓"
Se score < 40% →  ALTA        "Saúde requer atenção"
Se 40% ≤ s ≤ 80% → MEDIA      (implícito em outros)
```

---

## 📊 Tipos TypeScript

### Recommendation
```typescript
interface Recommendation {
  id: string;
  fazenda_id: string;
  prioridade: 'ALTA' | 'MEDIA' | 'BAIXA' | 'INFORMATIVA';
  titulo: string;
  descricao: string;
  impacto: string;
  sugestao: string;
  analiseIA: string;
  status: 'PENDENTE' | 'RECONHECIDA' | 'RESOLVIDA';
  payload?: Record<string, any>;
  created_at: string;
  updated_at: string;
  synced?: 0 | 1; // Mobile only
}
```

### RecommendationMetrics
```typescript
interface RecommendationMetrics {
  total: number;
  pendentes: number;
  reconhecidas: number;
  resolvidas: number;
  altaPrioridade: number;
}
```

---

## 🎨 Design System

### Cores por Prioridade

| Prioridade | Fundo | Texto | Badge | Border |
|-----------|-------|-------|-------|--------|
| ALTA | `bg-red-50` | `text-red-900` | `bg-red-100 text-red-800` | `border-red-200` |
| MEDIA | `bg-yellow-50` | `text-yellow-900` | `bg-yellow-100 text-yellow-800` | `border-yellow-200` |
| BAIXA | `bg-blue-50` | `text-blue-900` | `bg-blue-100 text-blue-800` | `border-blue-200` |
| INFORMATIVA | `bg-gray-50` | `text-gray-900` | `bg-gray-100 text-gray-800` | `border-gray-200` |

### Status

| Status | Badge |
|--------|-------|
| PENDENTE | Cinza |
| RECONHECIDA | Azul |
| RESOLVIDA | Verde |

---

## ⚡ Próximos Passos

### Curto Prazo (v1.1)
- [ ] Aplicar migração SQL no banco
- [ ] Testes de integração API + Frontend
- [ ] Testes de sincronização Mobile
- [ ] Deploy em staging

### Médio Prazo (v2.0)
- [ ] Implementar OpenAI Provider
- [ ] Implementar Claude Provider
- [ ] Implementar Gemini Provider
- [ ] Dashboard de análise histórica

### Longo Prazo (v3.0)
- [ ] Machine Learning para detecção de padrões
- [ ] Previsões de saúde do rebanho
- [ ] Alertas preditivos
- [ ] Integração com sensores IoT

---

## 📝 Notas de Desenvolvimento

### Estrutura de Arquivos
```
rastreio-api/
├── src/lib/ai/
│   ├── AIRecommendationEngine.ts
│   ├── BuiltinAIProvider.ts
│   ├── providers/
│   │   ├── AIProvider.ts (interface)
│   │   ├── OpenAIProvider.ts
│   │   ├── ClaudeProvider.ts
│   │   └── GeminiProvider.ts
│   └── index.ts
├── src/routes/
│   └── recommendations.ts (refatorado)
└── migrations/
    └── 002_update_recommendations_ai_structure.sql

rastreio-web/
├── app/dashboard/recomendacoes/page.tsx (refatorado)
├── components/
│   ├── RecommendationCard.tsx (novo)
│   └── RecommendationMetrics.tsx (novo)
├── hooks/
│   └── useRecommendations.ts (novo)
└── types/index.ts (atualizado)

rastreio-mobile/
├── src/database/schema.ts (atualizado)
├── src/repositories/AlertsRepository.ts (refatorado)
├── src/sync/alertsSync.ts (atualizado)
└── src/types/index.ts (atualizado)
```

### Variáveis de Ambiente
Nenhuma nova variável necessária. O sistema usa BuiltinAIProvider por padrão.

Para habilitar OpenAI/Claude/Gemini no futuro, adicionar:
```env
AI_PROVIDER=openai|claude|gemini
OPENAI_API_KEY=sk-...
CLAUDE_API_KEY=...
GEMINI_API_KEY=...
```

### Testes Recomendados
1. **API**: `POST /api/recommendations/generate`
2. **Frontend**: Filtrar por prioridade e status
3. **Mobile**: Sincronizar recomendações
4. **End-to-End**: Criar recomendação → Atualizar status → Sincronizar

---

**Status Final:** ✅ 95% Completo — Aguardando testes e deploy
