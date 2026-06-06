export type Sexo = 'M' | 'F';
export type Categoria = 'bezerro' | 'novilha' | 'vaca' | 'touro' | 'boi' | 'outro';
export type Plano = 'starter' | 'fazenda' | 'enterprise';
export type Prioridade = 'ALTA' | 'MEDIA' | 'BAIXA' | 'INFORMATIVA';
export type RecommendationStatus = 'PENDENTE' | 'RECONHECIDA' | 'RESOLVIDA';

export interface Animal {
  id: string;
  fazenda_id: string;
  brinco: string;
  raca?: string;
  sexo?: Sexo;
  data_nascimento?: string; // ISO date
  peso_atual?: number;
  lote?: string;
  pasto?: string;
  categoria?: Categoria;
  foto_url?: string;
  ativo: boolean;
  updated_at: string; // ISO timestamp
  synced?: 0 | 1; // local-only
}

export interface Vacinacao {
  id: string;
  animal_id: string;
  vacina: string;
  data: string; // ISO date
  dose?: string;
  veterinario?: string;
  proxima_dose?: string;
  created_at?: string;
  synced?: 0 | 1;
}

export interface Pesagem {
  id: string;
  animal_id: string;
  peso: number;
  data: string; // ISO date
  observacao?: string;
  created_at?: string;
  synced?: 0 | 1;
}

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
  synced?: 0 | 1;
}

export interface SyncPayload {
  fazenda_id: string;
  animais: Animal[];
  vacinacoes: Vacinacao[];
  pesagens: Pesagem[];
  recomendacoes?: Recommendation[];
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
  synced?: 0 | 1;
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
  synced?: 0 | 1;
}

// ============================================================================
// Recommendation Types
// ============================================================================

export interface Recommendation {
  id: string;
  fazenda_id: string;
  prioridade: number; // 1-5
  motivo: string;
  impacto: string;
  payload: Record<string, any>;
  acknowledged: boolean;
  created_at: string;
  synced?: 0 | 1;
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
