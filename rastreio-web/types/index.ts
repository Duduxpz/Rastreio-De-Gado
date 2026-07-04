export type Sexo = 'M' | 'F';
export type Categoria = 'bezerro' | 'novilha' | 'vaca' | 'touro' | 'boi' | 'potro' | 'cavalo' | 'ovelha' | 'carneiro' | 'cabra' | 'bode' | 'porco' | 'leitão' | 'frango' | 'galinha' | 'galo' | 'outro';

export interface Animal {
  id: string;
  fazenda_id: string;
  brinco: string;
  raca?: string;
  sexo?: Sexo;
  data_nascimento?: string;
  peso_atual?: number;
  lote?: string;
  pasto?: string;
  categoria?: Categoria;
  especie?: string;
  foto_url?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Vacinacao {
  id: string;
  animal_id: string;
  vacina: string;
  data: string;
  dose?: string;
  veterinario?: string;
  proxima_dose?: string;
  created_at: string;
}

export interface Pesagem {
  id: string;
  animal_id: string;
  peso: number;
  data: string;
  observacao?: string;
  created_at: string;
}

export interface Fazenda {
  id: string;
  nome: string;
  owner_id: string;
  plano: 'starter' | 'fazenda' | 'enterprise';
  created_at: string;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface AnalyticsSnapshot {
  id: string;
  fazenda_id: string;
  total_animais: number;
  animais_sem_pesagem_recente: number;
  vacinacoes_pendentes: number;
  rebanho_score: number;
  avg_peso: number;
  payload: Record<string, any>;
  created_at: string;
}

export interface AnalyticsStats {
  totalAnimais: number;
  animalsSemPesagemRecente: number;
  vacinacoesPendentes: number;
  rebanhoPorCategoria: Record<Categoria, number>;
  pesoBaixoAnimais: number;
  taxaSaude: number;
  evolucaoPesoMes: Array<{ data: string; pesoMedio: number }>;
}

// ============================================================================
// Alert Types
// ============================================================================

export type AlertNivel = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertTipo = 'vacinacao' | 'pesagem' | 'animal' | 'sistema';

export interface Alert {
  id: string;
  fazenda_id: string;
  tipo: AlertTipo;
  nivel: AlertNivel;
  titulo: string;
  descricao: string;
  data?: Record<string, any>;
  lida: boolean;
  arquivada: boolean;
  created_at: string;
}

export interface AlertWithAnimal extends Alert {
  animalBrinco?: string;
  animalId?: string;
}

// ============================================================================
// Recommendation Types
// ============================================================================

export type Prioridade = 'ALTA' | 'MEDIA' | 'BAIXA' | 'INFORMATIVA';
export type RecommendationStatus = 'PENDENTE' | 'RECONHECIDA' | 'RESOLVIDA';

export interface Recommendation {
  id: string;
  fazenda_id: string;
  prioridade: Prioridade;
  titulo: string;
  descricao: string;
  impacto: string;
  sugestao: string;
  analiseIA: string;
  status: RecommendationStatus;
  payload?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Resumen de métricas de recomendações
 */
export interface RecommendationMetrics {
  total: number;
  pendentes: number;
  reconhecidas: number;
  resolvidas: number;
  altaPrioridade: number;
}

// ============================================================================
// Automation Types
// ============================================================================

export interface Automation {
  id: string;
  fazenda_id: string;
  nome: string;
  trigger: Record<string, any>;
  actions: Record<string, any>;
  enabled: boolean;
  created_at: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
