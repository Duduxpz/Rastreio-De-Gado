/**
 * BuiltinAIProvider - Provedor padrão usando regras pré-definidas
 * Não depende de APIs externas (OpenAI, Claude, Gemini)
 */

import {
  AIProvider,
  AIInsight,
  AIAnalysisContext,
  Prioridade,
} from './providers/AIProvider';
import { AIRecommendationEngine } from './AIRecommendationEngine';

export class BuiltinAIProvider implements AIProvider {
  private engine: AIRecommendationEngine;

  constructor() {
    this.engine = new AIRecommendationEngine(this);
  }

  /**
   * Gera uma recomendação automática baseada em regras
   */
  async generateRecommendation(context: AIAnalysisContext): Promise<AIInsight> {
    const recomendacoes = await this.engine.generateAllRecommendations(context);

    if (recomendacoes.length === 0) {
      // Retornar recomendação padrão positiva
      return {
        id: `default-ok-${Date.now()}`,
        prioridade: 'INFORMATIVA',
        titulo: 'Tudo em dia!',
        descricao: 'Nenhuma recomendação urgente identificada.',
        impacto: 'Sistema funcionando normalmente. Continue monitorando o rebanho.',
        sugestao: 'Mantenha a rotina de atualização de dados e vacinações.',
        analiseIA:
          'O rebanho está bem gerenciado. Não foram identificadas pendências críticas. Continue com as boas práticas.',
        geradoEm: new Date(),
        status: 'PENDENTE',
      };
    }

    // Retornar primeira recomendação (geralmente a mais urgente)
    return recomendacoes[0];
  }

  /**
   * Analisa dados e retorna insights em texto
   */
  async generateAnalysis(context: AIAnalysisContext): Promise<string> {
    const { animais, vacinacoes, pesagens } = context;

    let analise = '## Análise do Rebanho\n\n';

    // Total de animais
    analise += `**Total de Animais:** ${animais.length}\n`;

    // Categorias
    const categorias: Record<string, number> = {};
    animais.forEach((a) => {
      const cat = a.categoria || 'Não categorizados';
      categorias[cat] = (categorias[cat] || 0) + 1;
    });
    analise += `**Distribuição:** ${Object.entries(categorias)
      .map(([cat, count]) => `${count} ${cat}`)
      .join(', ')}\n\n`;

    // Vacinações
    const taxaVacinal = ((vacinacoes.length / animais.length) * 100).toFixed(1);
    analise += `**Taxa Vacinal:** ${taxaVacinal}% dos animais possuem registros de vacinação\n`;

    // Pesagens
    if (pesagens.length > 0) {
      const pesoMedio =
        pesagens.reduce((sum, p) => sum + (p.peso || 0), 0) / pesagens.length;
      analise += `**Peso Médio:** ${pesoMedio.toFixed(2)} kg\n`;
    } else {
      analise += `**Peso Médio:** Sem registros\n`;
    }

    analise += '\n---\n';

    // Recomendações geradas
    const recomendacoes = await this.engine.generateAllRecommendations(context);
    if (recomendacoes.length > 0) {
      analise += `\n**Recomendações Identificadas:** ${recomendacoes.length}\n`;
      recomendacoes.forEach((r, i) => {
        analise += `\n${i + 1}. **[${r.prioridade}]** ${r.titulo}\n   ${r.descricao}\n`;
      });
    }

    return analise;
  }

  /**
   * Avalia risco sanitário do rebanho
   */
  async generateRiskAssessment(context: AIAnalysisContext): Promise<{
    nivelRisco: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAIXO';
    descricao: string;
    recomendacoes: string[];
  }> {
    const { animais, vacinacoes, pesagens } = context;

    if (animais.length === 0) {
      return {
        nivelRisco: 'ALTO',
        descricao: 'Sistema vazio. Sem dados para análise.',
        recomendacoes: ['Cadastrar animais no sistema'],
      };
    }

    const taxaVacinal = (vacinacoes.length / animais.length) * 100;
    const animaisSemVacina = animais.filter(
      (a) => !vacinacoes.some((v) => v.animal_id === a.id)
    );

    // Calcular nível de risco
    let nivelRisco: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAIXO' = 'BAIXO';
    const recomendacoes: string[] = [];

    if (animaisSemVacina.length > animais.length * 0.3) {
      nivelRisco = 'CRITICO';
      recomendacoes.push('Vacinação urgente: >30% do rebanho sem vacinação');
    } else if (taxaVacinal < 70) {
      nivelRisco = 'ALTO';
      recomendacoes.push(`Taxa vacinal baixa: ${Math.round(taxaVacinal)}% (meta: >85%)`);
    } else if (taxaVacinal < 85) {
      nivelRisco = 'MEDIO';
      recomendacoes.push(`Taxa vacinal moderada: ${Math.round(taxaVacinal)}% (meta: >85%)`);
    }

    // Validar pesagens
    if (pesagens.length === 0 && animais.length > 0) {
      if (nivelRisco === 'BAIXO') nivelRisco = 'MEDIO';
      recomendacoes.push('Registrar pesagens para monitoramento sanitário');
    }

    // Validar dados completos
    const animaisCompletos = animais.filter((a) => a.raca && a.sexo && a.data_nascimento);
    if (animaisCompletos.length < animais.length * 0.7) {
      if (nivelRisco === 'BAIXO') nivelRisco = 'MEDIO';
      recomendacoes.push('Completar dados cadastrais de ' +
        Math.round(((animais.length - animaisCompletos.length) / animais.length) * 100) +
        '% dos animais');
    }

    const descricao = this.gerarDescricaoRisco(
      nivelRisco,
      taxaVacinal,
      animaisSemVacina.length,
      animais.length
    );

    return { nivelRisco, descricao, recomendacoes };
  }

  /**
   * Gera um score de saúde do rebanho (0-100)
   */
  async generateHealthScore(context: AIAnalysisContext): Promise<{
    score: number;
    categoria: 'CRITICO' | 'ALERTA' | 'SATISFATORIO' | 'OTIMO';
    detalhes: string[];
  }> {
    const { animais, vacinacoes, pesagens } = context;

    if (animais.length === 0) {
      return {
        score: 0,
        categoria: 'CRITICO',
        detalhes: ['Sem animais cadastrados'],
      };
    }

    const detalhes: string[] = [];
    let score = 50; // Base 50

    // Vacinação (até +30 pontos)
    const taxaVacinal = (vacinacoes.length / animais.length) * 100;
    const pontosVacinal = Math.min((taxaVacinal / 100) * 30, 30);
    score += pontosVacinal;
    detalhes.push(
      `Vacinação: ${Math.round(pontosVacinal)}/30 (Taxa: ${Math.round(taxaVacinal)}%)`
    );

    // Pesagens (até +20 pontos)
    let pontosPesagem = 0;
    if (pesagens.length > 0) {
      const trintaDiasAtras = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
      const pesagensRecentes = pesagens.filter((p) => new Date(p.data) >= trintaDiasAtras);
      pontosPesagem = Math.min((pesagensRecentes.length / animais.length) * 20, 20);
    }
    score += pontosPesagem;
    detalhes.push(`Pesagens: ${Math.round(pontosPesagem)}/20`);

    // Dados completos (até +20 pontos)
    const animaisCompletos = animais.filter((a) => a.raca && a.sexo && a.data_nascimento);
    const pontosDados = Math.min((animaisCompletos.length / animais.length) * 20, 20);
    score += pontosDados;
    detalhes.push(`Dados cadastrais: ${Math.round(pontosDados)}/20`);

    // Normalizar score
    score = Math.min(100, score);

    let categoria: 'CRITICO' | 'ALERTA' | 'SATISFATORIO' | 'OTIMO';
    if (score < 30) categoria = 'CRITICO';
    else if (score < 50) categoria = 'ALERTA';
    else if (score < 75) categoria = 'SATISFATORIO';
    else categoria = 'OTIMO';

    return { score: Math.round(score), categoria, detalhes };
  }

  private gerarDescricaoRisco(
    nivel: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAIXO',
    taxaVacinal: number,
    animaisSemVacina: number,
    totalAnimais: number
  ): string {
    const descricoes: Record<string, string> = {
      CRITICO: `Risco Crítico: ${animaisSemVacina} animais (${Math.round(
        (animaisSemVacina / totalAnimais) * 100
      )}%) sem vacinação. Ação imediata requerida.`,
      ALTO: `Risco Alto: Taxa de vacinação baixa (${Math.round(
        taxaVacinal
      )}%). Recomenda-se revisão do programa sanitário.`,
      MEDIO: `Risco Médio: Alguns indicadores abaixo do ideal. Monitor frequente recomendado.`,
      BAIXO: `Risco Baixo: Rebanho em bom nível de proteção sanitária. Continue monitorando.`,
    };
    return descricoes[nivel];
  }

  getProviderName(): string {
    return 'Builtin Rules Engine';
  }
}
