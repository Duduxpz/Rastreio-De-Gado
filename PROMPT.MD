# 🐄 PROMPT COMPLETO — MELHORIAS DO SISTEMA DE RASTREABILIDADE DE GADO
> Sistema: Rastreabilidade de Gado | Stack: React + Next.js (inferido pela UI) | Data: 20/06/2026

---

## CONTEXTO GERAL DO SISTEMA

O sistema já possui as seguintes seções no menu lateral:
- Dashboard
- Animais
- Vacinações
- Pesagens
- Analytics
- **Relatórios** *(selecionado atualmente)*
- Alertas
- Recomendações
- Configurações

A identidade visual atual usa:
- Verde como cor primária (sidebar, ícones ativos, badges)
- Fundo branco/cinza claro nos cards
- Tipografia limpa e sans-serif
- Cards com bordas sutis e sombras leves
- Badges coloridos para categorias (ex: "Bezerro" em verde)

---

## MELHORIA 1 — ATUALIZAÇÃO DE ÍCONES (Ícones Temáticos Agropecuários)

### Problema
Os ícones atuais do menu lateral e das seções são genéricos (ícones padrão de UI kit). Precisam refletir o contexto rural/agropecuário do sistema.

### Especificação

Substituir todos os ícones do menu e das seções internas por ícones temáticos e representativos. Usar a biblioteca **Lucide React** como base, complementando com SVGs customizados onde necessário.

#### Mapeamento de Ícones por Seção

| Seção | Ícone Atual (genérico) | Ícone Novo (temático) | Observação |
|---|---|---|---|
| Dashboard | Grid genérico | `LayoutDashboard` + badge de pata | Manter, apenas refinar |
| Animais | Ícone de lista | SVG customizado de cabeça de boi (Nelore) | SVG inline no componente |
| Vacinações | Ícone de check | `Syringe` (Lucide) | Disponível em versões recentes |
| Pesagens | Ícone de gráfico | `Scale` (Lucide) | Balança de pesagem |
| Analytics | Ícone de linha | `BarChart3` com tendência ascendente | |
| Relatórios | Documento genérico | `ClipboardList` com linhas de dados | |
| Alertas | Sino genérico | `BellRing` com animação pulse quando ativo | |
| Recomendações | Lâmpada genérica | `Sprout` (representa crescimento/cuidado) | |
| Configurações | Engrenagem | `Settings2` | Manter padrão |

#### Ícones de Status nas Vacinações
```
✅ Aplicada     → ícone: `CheckCircle2` (cor: #22c55e)
⏳ Pendente     → ícone: `Clock` (cor: #f59e0b)  
❌ Atrasada     → ícone: `AlertCircle` (cor: #ef4444)
📅 Agendada     → ícone: `CalendarCheck` (cor: #3b82f6)
```

#### Ícones por Espécie Animal (para uso em cards e listas)
```
🐄 Bovino       → SVG customizado cabeça de boi
🐴 Equino       → SVG customizado cabeça de cavalo
🐑 Ovino        → SVG customizado ovelha
🐐 Caprino      → SVG customizado cabra
🐷 Suíno        → `PiggyBank` adaptado ou SVG
🐔 Aves         → SVG customizado galinha
🐕 Cão          → SVG customizado (cão de trabalho/pastoreio)
```

#### Implementação
```tsx
// components/icons/AnimalIcon.tsx
import { LucideProps } from 'lucide-react';

type AnimalType = 'bovino' | 'equino' | 'ovino' | 'caprino' | 'suino' | 'ave';

export function AnimalIcon({ type, size = 24, className }: { 
  type: AnimalType; 
  size?: number; 
  className?: string; 
}) {
  // Retorna SVG inline específico por espécie
  // Cores seguem o design system do site (verde primário #16a34a)
}
```

---

## MELHORIA 2 — SISTEMA AUTOMÁTICO DE VACINAÇÕES

### Problema
O sistema atualmente registra vacinações manualmente. Precisa de automação que, ao cadastrar um animal com espécie/categoria/idade, gere automaticamente um calendário vacinal completo e acompanhe as aplicações.

### Especificação

#### 2.1 — Motor de Regras Vacinais por Espécie

Criar um arquivo de configuração central com protocolos vacinais:

```typescript
// data/vaccination-protocols.ts

export const vaccinationProtocols = {
  bovino: {
    bezerro: [
      {
        id: 'brucelose-f19',
        nome: 'Brucelose (F19)',
        idadeAplicacao: { min: 3, max: 8, unidade: 'meses' },
        dose: 'única',
        reforco: null,
        obrigatoria: true,
        observacao: 'Apenas fêmeas. Exigência legal (IN MAPA 10/2017)',
      },
      {
        id: 'aftosa',
        nome: 'Febre Aftosa',
        idadeAplicacao: { min: 3, max: 999, unidade: 'meses' },
        dose: '2ml IM',
        reforco: { intervalo: 6, unidade: 'meses' },
        obrigatoria: true,
        observacao: 'Campanha semestral obrigatória (maio e novembro)',
      },
      {
        id: 'raiva-bovina',
        nome: 'Raiva Bovina',
        idadeAplicacao: { min: 3, max: 999, unidade: 'meses' },
        dose: '2ml SC',
        reforco: { intervalo: 12, unidade: 'meses' },
        obrigatoria: false,
        observacao: 'Recomendada em regiões de risco',
      },
      {
        id: 'clostridioses',
        nome: 'Clostridioses (Polivalente)',
        idadeAplicacao: { min: 2, max: 999, unidade: 'meses' },
        dose: '5ml SC',
        reforco: { intervalo: 12, unidade: 'meses' },
        obrigatoria: false,
        observacao: 'Primeira dose + reforço em 30 dias',
      },
    ],
    vaca: [
      // protocolos específicos para vacas adultas
      // inclui: aftosa, raiva, clostridioses, leptospirose, IBR/BVD
    ],
    touro: [
      // protocolos para reprodutores
    ],
  },
  
  equino: {
    potro: [
      {
        id: 'influenza-equina',
        nome: 'Influenza Equina',
        idadeAplicacao: { min: 6, max: 999, unidade: 'meses' },
        dose: '1ml IM',
        reforco: { intervalo: 6, unidade: 'meses' },
        obrigatoria: false,
      },
      {
        id: 'tetano-equino',
        nome: 'Tétano',
        idadeAplicacao: { min: 3, max: 999, unidade: 'meses' },
        dose: '1ml SC',
        reforco: { intervalo: 12, unidade: 'meses' },
        obrigatoria: true,
        observacao: 'Fundamental para equinos',
      },
      {
        id: 'encefalomielite',
        nome: 'Encefalomielite (EEE/WEE)',
        idadeAplicacao: { min: 6, max: 999, unidade: 'meses' },
        dose: '1ml IM',
        reforco: { intervalo: 12, unidade: 'meses' },
        obrigatoria: false,
      },
      {
        id: 'herpesvirus-equino',
        nome: 'Herpesvírus Equino (EHV-1/4)',
        idadeAplicacao: { min: 5, max: 999, unidade: 'meses' },
        dose: '1ml IM',
        reforco: { intervalo: 6, unidade: 'meses' },
        obrigatoria: false,
      },
    ],
  },
  
  ovino: { /* protocolos para ovinos */ },
  caprino: { /* protocolos para caprinos */ },
  suino: { /* protocolos para suínos */ },
};
```

#### 2.2 — Serviço de Geração Automática de Calendário

```typescript
// services/vaccination-scheduler.ts

export class VaccinationScheduler {
  
  /**
   * Ao cadastrar um animal, gera automaticamente todas as vacinações
   * baseadas na espécie, categoria e data de nascimento
   */
  static generateSchedule(animal: Animal): ScheduledVaccination[] {
    const protocol = vaccinationProtocols[animal.especie]?.[animal.categoria];
    if (!protocol) return [];
    
    const hoje = new Date();
    const idadeEmMeses = this.calcularIdadeEmMeses(animal.dataNascimento);
    const vacinas: ScheduledVaccination[] = [];
    
    for (const vacina of protocol) {
      // Verificar se animal está na faixa etária correta
      if (idadeEmMeses >= vacina.idadeAplicacao.min) {
        
        // Verificar sexo para vacinas específicas (ex: brucelose só fêmeas)
        if (vacina.restricaoSexo && animal.sexo !== vacina.restricaoSexo) {
          continue;
        }
        
        // Calcular data da próxima aplicação
        const dataVacina = this.calcularProximaData(animal, vacina);
        
        vacinas.push({
          animalId: animal.id,
          vacinaId: vacina.id,
          nome: vacina.nome,
          dataPrevista: dataVacina,
          status: dataVacina < hoje ? 'atrasada' : 'pendente',
          obrigatoria: vacina.obrigatoria,
          dose: vacina.dose,
          observacao: vacina.observacao,
        });
        
        // Gerar reforços futuros (próximos 2 anos)
        if (vacina.reforco) {
          // Criar entradas de reforço automático
        }
      }
    }
    
    return vacinas;
  }
  
  /**
   * Verifica diariamente e envia alertas para vacinações próximas
   */
  static checkUpcoming(diasAntecedencia: number = 7): Alert[] {
    // Busca todas vacinações pendentes nos próximos N dias
    // Gera alertas automáticos na seção de Alertas
  }
}
```

#### 2.3 — UI da Seção de Vacinações (Nova Interface)

**Tela Principal de Vacinações:**
```
┌─────────────────────────────────────────────────────────┐
│  💉 Vacinações                    [+ Nova Vacinação]    │
│  Calendário vacinal automatizado                        │
├──────────────┬──────────────────────────────────────────┤
│              │  RESUMO                                  │
│  FILTROS     │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│              │  │  12  │ │  3   │ │  5   │ │  2   │  │
│  Espécie ▾   │  │Agenj.│ │Pend. │ │Aplic.│ │Atras.│  │
│  Categoria ▾ │  └──────┘ └──────┘ └──────┘ └──────┘  │
│  Animal ▾    ├──────────────────────────────────────────┤
│  Status ▾    │  ESTA SEMANA                            │
│  Mês ▾       │  ┌────────────────────────────────────┐ │
│              │  │ 🟡 Bezerro 011 – Aftosa    Hoje     │ │
│              │  │    Nelore M • Lote A                │ │
│              │  │    [Registrar Aplicação] [Adiar]    │ │
│              │  ├────────────────────────────────────┤ │
│              │  │ 🔵 Égua 042 – Tétano    23/06      │ │
│              │  │    Quarto de Milha F               │ │
│              │  │    [Registrar Aplicação] [Adiar]    │ │
│              │  └────────────────────────────────────┘ │
│              │  PRÓXIMAS (30 dias)                     │
│              │  [Lista paginada]                       │
└──────────────┴──────────────────────────────────────────┘
```

**Modal "Registrar Aplicação":**
```
┌─────────────────────────────────────────┐
│  Registrar Aplicação — Bezerro 011      │
│                                         │
│  Vacina:     Febre Aftosa               │
│  Animal:     011 – Nelore M             │
│  Data prev.: 20/06/2026                 │
│                                         │
│  Data real: [20/06/2026    📅]          │
│  Dose:      [2ml IM        ___]         │
│  Lote vacina: [_____________]           │
│  Validade:  [__/__/____    ]            │
│  Aplicador: [_____________]             │
│  Observ.:   [_____________]             │
│                                         │
│  [Cancelar]          [✅ Confirmar]     │
└─────────────────────────────────────────┘
```

---

## MELHORIA 3 — ONBOARDING MULTI-ESPÉCIE (Configuração Inicial da Fazenda)

### Problema
O fluxo de criação de conta/configuração inicial não contempla espécies além de bovinos, e não guia o produtor no cadastro dos animais existentes.

### Especificação

#### 3.1 — Fluxo de Onboarding (Wizard em Etapas)

**Etapa 1 — Dados da Fazenda**
```
┌──────────────────────────────────────────────────────┐
│  🌱 Vamos configurar sua fazenda                     │
│                                                      │
│  ●───○───○───○   Etapa 1 de 4                       │
│                                                      │
│  Nome da fazenda/propriedade *                       │
│  [_________________________________]                 │
│                                                      │
│  Estado *              Município *                   │
│  [Minas Gerais ▾]      [____________]               │
│                                                      │
│  Área total (hectares)   CAR / NIRF (opcional)       │
│  [____________]          [_____________]             │
│                                                      │
│  Código do produtor (MAPA) (opcional)               │
│  [_____________]                                     │
│                                      [Próximo →]    │
└──────────────────────────────────────────────────────┘
```

**Etapa 2 — Quais animais você cria?**
```
┌──────────────────────────────────────────────────────┐
│  🐾 Selecione as espécies presentes na sua fazenda   │
│                                                      │
│  ●───●───○───○   Etapa 2 de 4                       │
│                                                      │
│  Marque todas que se aplicam:                        │
│                                                      │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐        │
│  │    🐄     │  │    🐴     │  │    🐑     │        │
│  │  BOVINO   │  │  EQUINO   │  │   OVINO   │        │
│  │  ✅ Sim   │  │  ✅ Sim   │  │  ○ Não   │        │
│  └───────────┘  └───────────┘  └───────────┘        │
│                                                      │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐        │
│  │    🐐     │  │    🐷     │  │    🐔     │        │
│  │  CAPRINO  │  │   SUÍNO   │  │   AVES    │        │
│  │  ○ Não   │  │  ○ Não   │  │  ○ Não   │        │
│  └───────────┘  └───────────┘  └───────────┘        │
│                                                      │
│  ┌───────────┐                                       │
│  │    ➕     │                                       │
│  │  OUTRO    │                                       │
│  │  ○ Não   │                                       │
│  └───────────┘                                       │
│                                                      │
│  [← Voltar]                          [Próximo →]    │
└──────────────────────────────────────────────────────┘
```

**Etapa 3 — Cadastro dos Animais Existentes**

*Esta etapa é dinâmica: gera formulários diferentes para cada espécie selecionada na Etapa 2.*

```
┌──────────────────────────────────────────────────────┐
│  🐄 Adicione seus Bovinos                            │
│                                                      │
│  ●───●───●───○   Etapa 3 de 4                       │
│                                                      │
│  [Abas: 🐄 Bovinos | 🐴 Equinos]                    │
│  ─────────────────────────────                      │
│                                                      │
│  Bovinos cadastrados: 1 animal                       │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ 🐄 011 – Nelore Macho – Bezerro – Lote A    │   │
│  │ Nasc: 10/01/2026 | Peso: 70kg               │   │
│  │                          [✏ Editar] [🗑]    │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  [+ Adicionar Bovino]                                │
│                                                      │
│  ══════════════════════════════════════════          │
│  Formulário rápido — Bovino                          │
│                                                      │
│  Brinco/Identificação *     Raça *                  │
│  [_____________]             [Nelore ▾]              │
│                                                      │
│  Sexo *         Categoria *    Data de Nasc. *       │
│  [M / F]        [Bezerro ▾]   [__/__/____]          │
│                                                      │
│  Peso atual (kg)   Lote         Mãe (brinco)        │
│  [_______]         [_______]    [________ ]          │
│                                                      │
│  [Salvar Animal]                                     │
│                                                      │
│  [← Voltar]                          [Próximo →]    │
└──────────────────────────────────────────────────────┘
```

**Formulários específicos por espécie:**

*Para EQUINOS — campos adicionais:*
```
Campos específicos para Cavalos/Equinos:
─────────────────────────────────────────
• Nome do animal *          (ex: "Trovão")
• Raça *                    [Quarto de Milha | Mangalarga | Árabe | PSI | Crioulo | Outra]
• Pelagem                   [Alazão | Baio | Tordilho | Castanho | Preto | Tobiano | Outra]
• Finalidade                [Trabalho | Lazer | Reprodução | Competição | Abate]
• Registro (ABQM/ABCCC)    (opcional)
• Pai (nome/registro)       (opcional)
• Mãe (nome/registro)       (opcional)
• Microchip                 (opcional)
• Castrado?                 [Sim / Não]
```

*Para OVINOS — campos adicionais:*
```
Campos específicos para Ovinos:
─────────────────────────────────
• Raça *                    [Santa Inês | Dorper | Suffolk | Morada Nova | Outra]
• Finalidade                [Corte | Lã | Misto | Reprodução]
• Número de partos          (para fêmeas adultas)
```

*Para CAPRINOS — campos adicionais:*
```
Campos específicos para Caprinos:
──────────────────────────────────
• Raça *                    [Boer | Anglo-nubiana | Saanen | Alpina | SRD | Outra]
• Finalidade                [Corte | Leite | Misto]
• Produção média leite/dia  (para fêmeas em lactação)
```

#### 3.2 — Automação Pós-Cadastro

Ao finalizar o onboarding (Etapa 4 — Confirmação):
1. O sistema **gera automaticamente** o calendário vacinal para cada animal cadastrado
2. Cria os **primeiros alertas** de vacinações pendentes ou próximas
3. Gera um **Relatório de Rebanho Inicial** com todos os animais
4. Exibe dashboard personalizado com as espécies presentes

```
┌──────────────────────────────────────────────────────┐
│  ✅ Fazenda configurada com sucesso!                 │
│                                                      │
│  ●───●───●───●   Concluído!                         │
│                                                      │
│  📊 Resumo da configuração:                          │
│  • 1 bovino cadastrado                               │
│  • 1 equino cadastrado                               │
│  • 3 vacinações agendadas automaticamente            │
│  • 1 alerta ativo gerado                             │
│                                                      │
│  🤖 O sistema já preparou o calendário vacinal       │
│     para todos os seus animais!                      │
│                                                      │
│              [Ir para o Dashboard →]                 │
└──────────────────────────────────────────────────────┘
```

---

## MELHORIA 4 — ÁREA DE RECOMENDAÇÕES (UI/UX Completo)

### Problema
A área de Recomendações precisa de uma interface completa seguindo o padrão visual do sistema.

### Especificação

#### Layout Principal

```
┌─────────────────────────────────────────────────────────────┐
│  🌱 Recomendações                                           │
│  Orientações personalizadas para o seu rebanho              │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│  FILTROS     │  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│              │  │    8     │ │    3     │ │    2     │    │
│  Categoria ▾ │  │  Todas   │ │Urgentes  │ │Concluídas│    │
│              │  └──────────┘ └──────────┘ └──────────┘    │
│  • Saúde     │                                              │
│  • Nutrição  │  ─── URGENTES ──────────────────────────    │
│  • Manejo    │                                              │
│  • Genética  │  ┌────────────────────────────────────────┐ │
│  • Pastagem  │  │ 🔴 SAÚDE                    URGENTE    │ │
│              │  │ Aftosa em atraso – Bezerro 011         │ │
│  Espécie ▾   │  │                                        │ │
│              │  │ O bezerro 011 (Nelore M, Lote A) está  │ │
│  • Todos     │  │ com a vacinação de Febre Aftosa em     │ │
│  • Bovinos   │  │ atraso há 5 dias. Regularize para      │ │
│  • Equinos   │  │ evitar multas e riscos sanitários.     │ │
│              │  │                                        │ │
│              │  │ [Ver Animal]  [Agendar Vacinação]      │ │
│              │  └────────────────────────────────────────┘ │
│              │                                              │
│              │  ─── NUTRIÇÃO E MANEJO ─────────────────    │
│              │                                              │
│              │  ┌────────────────────────────────────────┐ │
│              │  │ 🟡 NUTRIÇÃO                 ATENÇÃO    │ │
│              │  │ Peso abaixo do esperado – Bezerro 011  │ │
│              │  │                                        │ │
│              │  │ Com 5 meses, o esperado para Nelore    │ │
│              │  │ macho é 120-150kg. Atual: 70kg.        │ │
│              │  │ Avalie suplementação ou parasitoses.   │ │
│              │  │                                        │ │
│              │  │ [Ver Pesagens]  [Ver Histórico]        │ │
│              │  └────────────────────────────────────────┘ │
│              │                                              │
│              │  ┌────────────────────────────────────────┐ │
│              │  │ 🟢 MANEJO                   BOA PRÁTICA│ │
│              │  │ Período ideal de desmama                │ │
│              │  │                                        │ │
│              │  │ Com base no peso atual do Bezerro 011, │ │
│              │  │ a desmama está prevista para agosto.   │ │
│              │  │                                        │ │
│              │  │ [Ver Detalhes]                         │ │
│              │  └────────────────────────────────────────┘ │
└──────────────┴──────────────────────────────────────────────┘
```

#### Cards de Recomendação — Especificação Visual

```tsx
// components/RecommendationCard.tsx
interface RecommendationCard {
  tipo: 'urgente' | 'atencao' | 'informativo' | 'boa-pratica';
  categoria: 'saude' | 'nutricao' | 'manejo' | 'genetica' | 'pastagem';
  titulo: string;
  descricao: string;
  animalRelacionado?: Animal;
  acoes: Action[];
  dataGeracao: Date;
  lida: boolean;
}

// Cores por tipo:
// urgente     → borda esquerda #ef4444, badge vermelho
// atencao     → borda esquerda #f59e0b, badge amarelo  
// informativo → borda esquerda #3b82f6, badge azul
// boa-pratica → borda esquerda #22c55e, badge verde
```

#### Recomendações por Espécie

O sistema deve gerar recomendações automáticas específicas:

**Bovinos:**
- Alertas de ganho de peso abaixo/acima da curva para a raça
- Período de reprodução (estação de monta)
- Desmama
- Manejo de pastagem por lotação
- Controle de carrapatos e verminoses

**Equinos:**
- Calendário de casqueamento (a cada 45-60 dias)
- Controle de verminoses (rotação de vermífugos)
- Dentição e desgaste
- Períodos de descanso pós-trabalho
- Suplementação baseada na finalidade

---

## MELHORIA 5 — ÁREA DE RELATÓRIOS (Corrigir Impressão/Exportação)

### Problema
Conforme imagem anexada: ao imprimir/exportar o relatório, o sistema está capturando a **página inteira** (incluindo sidebar, header e o menu de navegação), ao invés de capturar **apenas o conteúdo da área de relatório**.

### Solução

#### 5.1 — CSS de Impressão (Media Query @print)

```css
/* styles/print.css */

@media print {
  /* Esconder toda a navegação e UI do sistema */
  nav,
  aside,
  header,
  .sidebar,
  .topbar,
  .menu-lateral,
  [data-sidebar],
  [data-header],
  .no-print {
    display: none !important;
  }
  
  /* Expandir a área de conteúdo para ocupar 100% */
  main,
  .content-area,
  .relatorio-content,
  [data-print-area] {
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    position: static !important;
  }
  
  /* Configurações da página impressa */
  @page {
    size: A4 portrait;
    margin: 1.5cm 2cm;
  }
  
  /* Cabeçalho do relatório para impressão */
  .relatorio-header-print {
    display: flex !important;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1rem;
    border-bottom: 2px solid #16a34a;
    margin-bottom: 1.5rem;
  }
  
  /* Evitar quebra de página no meio dos cards */
  .relatorio-card {
    page-break-inside: avoid;
    break-inside: avoid;
  }
  
  /* Forçar fundo branco para impressão */
  body {
    background: white !important;
    color: black !important;
  }
  
  /* Garantir que links não mostrem URL */
  a[href]::after {
    content: none !important;
  }
}
```

#### 5.2 — Botão de Exportação com react-to-print

```tsx
// components/RelatorioPrintButton.tsx
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer, Download, FileText } from 'lucide-react';

export function RelatorioPrintButton({ relatorioRef }) {
  
  const handlePrint = useReactToPrint({
    content: () => relatorioRef.current,  // ← Apenas o ref do relatório, não a página inteira
    pageStyle: `
      @page { size: A4; margin: 2cm; }
      @media print {
        body { font-family: 'Inter', sans-serif; }
      }
    `,
    documentTitle: `Relatório-Fazenda-${new Date().toLocaleDateString('pt-BR')}`,
  });
  
  return (
    <div className="flex gap-2">
      <button onClick={handlePrint} className="btn-outline">
        <Printer size={16} />
        Imprimir
      </button>
      <button onClick={exportarPDF} className="btn-primary">
        <Download size={16} />
        Exportar PDF
      </button>
    </div>
  );
}
```

#### 5.3 — Wrapper na Área de Relatório

```tsx
// pages/relatorios.tsx
export default function Relatorios() {
  const relatorioRef = useRef<HTMLDivElement>(null);
  
  return (
    <PageLayout>
      {/* Este é o wrapper que NÃO entra na impressão */}
      <div className="relatorio-page-header no-print">
        <h1>Relatórios</h1>
        <span>Visão consolidada do rebanho</span>
        <RelatorioPrintButton relatorioRef={relatorioRef} />
      </div>
      
      {/* ↓ APENAS ESTE BLOCO É IMPRESSO ↓ */}
      <div ref={relatorioRef} className="relatorio-content">
        
        {/* Cabeçalho que aparece SÓ na impressão */}
        <div className="relatorio-header-print hidden print:flex">
          <div>
            <img src="/logo.png" alt="Rastreabilidade de Gado" height={40} />
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>Fazenda São João</p>
            <p>Gerado em: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
        
        {/* Conteúdo do relatório */}
        <RelatorioCards />
        <TabelaAnimais />
        <TabelaVacinacoes />
        <TabelaPesagens />
        
      </div>
    </PageLayout>
  );
}
```

#### 5.4 — Exportação para PDF sem abrir diálogo do browser

```tsx
// services/relatorio-pdf.ts
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportarRelatorioPDF(relatorioEl: HTMLElement, nomeFazenda: string) {
  const canvas = await html2canvas(relatorioEl, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    // Ignora elementos com classe no-print
    ignoreElements: (el) => el.classList.contains('no-print'),
  });
  
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgData = canvas.toDataURL('image/png');
  
  // Calcular dimensões proporcionais para A4
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(`Relatorio-${nomeFazenda}-${Date.now()}.pdf`);
}
```

---

## CHECKLIST DE IMPLEMENTAÇÃO

### Prioridade Alta (Semana 1)
- [ ] **Fix Relatório** — Implementar CSS @media print e react-to-print (rápido, alto impacto visual)
- [ ] **Atualizar Ícones** — Trocar ícones do menu lateral e seções principais

### Prioridade Média (Semana 2-3)
- [ ] **Motor de Vacinações** — Criar protocols, scheduler e UI de calendário vacinal
- [ ] **Alertas automáticos** — Integrar vacinações atrasadas/próximas com a seção de Alertas

### Prioridade Média-Alta (Semana 3-4)
- [ ] **Onboarding Multi-Espécie** — Wizard de configuração com suporte a equinos e demais
- [ ] **Formulários por espécie** — Campos específicos para cavalos, ovinos, caprinos

### Prioridade Média (Semana 4-5)
- [ ] **UI Recomendações** — Interface completa com cards, filtros e ações

---

## REFERÊNCIAS DE DESIGN SYSTEM

Manter consistência com os padrões já existentes:

```
Cores:
  Primary:     #16a34a  (verde principal)
  Primary-dark:#15803d
  Warning:     #f59e0b  (amarelo/pendente)
  Danger:      #ef4444  (vermelho/atrasado)
  Info:        #3b82f6  (azul/agendado)
  Success:     #22c55e  (verde/concluído)
  
  Background:  #f9fafb
  Card:        #ffffff
  Border:      #e5e7eb
  Text:        #111827
  Text-muted:  #6b7280

Tipografia:
  Font-family: Inter, system-ui, sans-serif
  
Border-radius:
  Card:        8px
  Badge:       9999px (pill)
  Button:      6px

Sombras:
  Card: 0 1px 3px rgba(0,0,0,0.1)
```

---

*Prompt gerado em 20/06/2026 | Sistema: Rastreabilidade de Gado*