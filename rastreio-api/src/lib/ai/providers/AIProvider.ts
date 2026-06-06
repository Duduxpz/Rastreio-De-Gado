/**
 * AIProvider - Interface abstrata para diferentes provedores de IA
 * Preparado para integração com OpenAI, Claude, Gemini, etc.
 */

export interface AIInsight {
  id: string;
  prioridade: 'ALTA' | 'MEDIA' | 'BAIXA' | 'INFORMATIVA';
  titulo: string;
  descricao: string;
  impacto: string;
  sugestao: string;
  analiseIA: string;
  geradoEm: Date;
  status: 'PENDENTE' | 'RECONHECIDA' | 'RESOLVIDA';
  payload?: Record<string, any>;
}

export interface AIAnalysisContext {
  fazendaId: string;
  animais: any[];
  vacinacoes: any[];
  pesagens: any[];
  reproducoes?: any[];
  mortalidades?: any[];
  custos?: any[];
  producao?: any[];
}

export interface AIProvider {
  /**
   * Gera recomendação de IA com análise completa
   */
  generateRecommendation(context: AIAnalysisContext): Promise<AIInsight>;

  /**
   * Analisa dados e retorna insights
   */
  generateAnalysis(context: AIAnalysisContext): Promise<string>;

  /**
   * Avalia risco sanitário
   */
  generateRiskAssessment(context: AIAnalysisContext): Promise<{
    nivelRisco: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAIXO';
    descricao: string;
    recomendacoes: string[];
  }>;

  /**
   * Valida saúde financeira/produtiva
   */
  generateHealthScore(context: AIAnalysisContext): Promise<{
    score: number; // 0-100
    categoria: 'CRITICO' | 'ALERTA' | 'SATISFATORIO' | 'OTIMO';
    detalhes: string[];
  }>;

  /**
   * Nome do provedor
   */
  getProviderName(): string;
}

/**
 * Enums para padronização
 */
export enum Prioridade {
  ALTA = 'ALTA',
  MEDIA = 'MEDIA',
  BAIXA = 'BAIXA',
  INFORMATIVA = 'INFORMATIVA',
}

export enum RecommendationStatus {
  PENDENTE = 'PENDENTE',
  RECONHECIDA = 'RECONHECIDA',
  RESOLVIDA = 'RESOLVIDA',
}
