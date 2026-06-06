/**
 * AIRecommendationEngine - Motor de recomendações baseado em regras
 * Gera insights automáticos a partir de dados do rebanho
 */

import { AIProvider, AIInsight, AIAnalysisContext, Prioridade } from './providers/AIProvider';

export class AIRecommendationEngine {
  constructor(private provider: AIProvider) {}

  /**
   * Analisa todos os dados e gera recomendações
   */
  async generateAllRecommendations(context: AIAnalysisContext): Promise<AIInsight[]> {
    const recomendacoes: AIInsight[] = [];

    // Executar todas as regras
    const resultVacinacao = await this.analisarVacinacao(context);
    if (resultVacinacao) recomendacoes.push(resultVacinacao);

    const resultPesagem = await this.analisarPesagem(context);
    if (resultPesagem) recomendacoes.push(resultPesagem);

    const resultCadastro = await this.analisarCadastroAnimais(context);
    if (resultCadastro) recomendacoes.push(resultCadastro);

    const resultSaude = await this.analisarSaudeRebanho(context);
    if (resultSaude) recomendacoes.push(resultSaude);

    return recomendacoes;
  }

  /**
   * REGRA: Animais sem vacinação
   */
  private async analisarVacinacao(context: AIAnalysisContext): Promise<AIInsight | null> {
    const { animais, vacinacoes } = context;
    const vacinasVencidas = vacinacoes.filter((v: any) => {
      if (v.proxima_dose && new Date(v.proxima_dose) < new Date()) {
        return true;
      }
      return false;
    });

    const animaisSemVacina = animais.filter(
      (a: any) => !vacinacoes.some((v: any) => v.animal_id === a.id)
    );

    // Priorizar se há vacinações vencidas
    if (vacinasVencidas.length > 0) {
      return {
        id: `vac-vencida-${Date.now()}`,
        prioridade: 'ALTA',
        titulo: 'Vacinação vencida',
        descricao: `Identificamos ${vacinasVencidas.length} vacinação(ões) com prazo expirado.`,
        impacto:
          'Elevado risco sanitário. Vacinações vencidas comprometem a imunidade do rebanho contra doenças infecciosas.',
        sugestao: `Regularizar imediatamente a vacinação de ${vacinasVencidas.length} animal(is). Consulte veterinário para revacinação.`,
        analiseIA: this.gerarAnaliseVacinacao(vacinasVencidas, animais),
        geradoEm: new Date(),
        status: 'PENDENTE',
        payload: {
          vacinasVencidas: vacinasVencidas.length,
          animaisAfetados: vacinasVencidas.map((v) => v.animal_id),
        },
      };
    }

    // Se há animais sem vacinação
    if (animaisSemVacina.length > 0) {
      return {
        id: `vac-ausente-${Date.now()}`,
        prioridade: 'ALTA',
        titulo: 'Animal sem vacinação registrada',
        descricao: `Foi identificado(s) ${animaisSemVacina.length} animal(is) sem vacinação registrada.`,
        impacto: 'Risco sanitário elevado. Animais sem vacinação reduzem a imunidade coletiva do rebanho.',
        sugestao: `Registrar vacinação dos seguintes animais dentro de 7 dias: ${animaisSemVacina
          .map((a) => a.brinco)
          .join(', ')}. Efetue verificação do histórico médico.`,
        analiseIA: `O sistema não encontrou registros de vacinação para ${animaisSemVacina.length} animal(is). 
        Isso pode indicar: (1) Vacinação não realizada, (2) Histórico não registrado no sistema. 
        Recomenda-se revisar a documentação veterinária e atualizar o histórico.`,
        geradoEm: new Date(),
        status: 'PENDENTE',
        payload: {
          totalSemVacina: animaisSemVacina.length,
          brincos: animaisSemVacina.map((a) => a.brinco),
        },
      };
    }

    return null;
  }

  /**
   * REGRA: Pesagens desatualizadas
   */
  private async analisarPesagem(context: AIAnalysisContext): Promise<AIInsight | null> {
    const { animais, pesagens } = context;
    const agora = new Date();
    const trintaDiasAtras = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);

    const animaisSemPesagemRecente = animais.filter((animal: any) => {
      const pesagensAnimal = pesagens.filter((p: any) => p.animal_id === animal.id);
      const temPesagemRecente = pesagensAnimal.some(
        (p: any) => new Date(p.data) >= trintaDiasAtras
      );
      return !temPesagemRecente;
    });

    if (pesagens.length === 0 && animais.length > 0) {
      return {
        id: `peso-nenhum-${Date.now()}`,
        prioridade: 'INFORMATIVA',
        titulo: 'Nenhuma pesagem registrada',
        descricao: 'O sistema ainda não possui registros de pesagem do rebanho.',
        impacto:
          'Impossível acompanhar evolução de peso. Dados essenciais para zootecnia e gestão de custos de alimentação.',
        sugestao: 'Registrar a primeira pesagem do rebanho. Defina frequência de pesagens (semanal/mensal).',
        analiseIA:
          'Nenhuma pesagem foi encontrada no histórico. Para otimizar gestão zootécnica, recomenda-se pesagens mensais para acompanhar ganho de peso e detectar problemas nutricionais.',
        geradoEm: new Date(),
        status: 'PENDENTE',
        payload: { totalAnimais: animais.length },
      };
    }

    if (animaisSemPesagemRecente.length > 0 && pesagens.length > 0) {
      return {
        id: `peso-desatual-${Date.now()}`,
        prioridade: 'ALTA',
        titulo: 'Pesagem desatualizada',
        descricao: `${animaisSemPesagemRecente.length} animal(is) estão sem pesagem nos últimos 30 dias.`,
        impacto:
          'Perda de acompanhamento zootécnico. Impossível detectar problemas nutricionais, saúde ou desenvolvimento inadequado.',
        sugestao: `Realizar nova pesagem para ${animaisSemPesagemRecente.length} animal(is). Frequência recomendada: a cada 30 dias.`,
        analiseIA: `A última pesagem de ${animaisSemPesagemRecente.length} animal(is) foi há mais de 30 dias. 
        Isso dificulta o acompanhamento do desenvolvimento. Recomenda-se pesagem mensal para detecção precoce de problemas.`,
        geradoEm: new Date(),
        status: 'PENDENTE',
        payload: {
          totalSemPesagemRecente: animaisSemPesagemRecente.length,
          brincos: animaisSemPesagemRecente.map((a: any) => a.brinco),
          diasSemPesagem: 30,
        },
      };
    }

    return null;
  }

  /**
   * REGRA: Cadastro incompleto
   */
  private async analisarCadastroAnimais(context: AIAnalysisContext): Promise<AIInsight | null> {
    const { animais } = context;

    if (animais.length === 0) {
      return {
        id: `cadastro-vazio-${Date.now()}`,
        prioridade: 'INFORMATIVA',
        titulo: 'Começar cadastro do rebanho',
        descricao: 'Nenhum animal cadastrado no sistema.',
        impacto:
          'Sistema sem dados. Impossível gerar análises, alertas ou recomendações inteligentes.',
        sugestao: 'Cadastre os animais do seu rebanho para começar a usar todas as funcionalidades.',
        analiseIA:
          'Para aproveitar plenamente o sistema de rastreabilidade, comece adicionando os animais do rebanho com informações básicas: brinco, raça, sexo, data de nascimento.',
        geradoEm: new Date(),
        status: 'PENDENTE',
        payload: {},
      };
    }

    // Verificar animais com dados incompletos
    const animaisIncompletos = animais.filter(
      (a: any) => !a.raca || !a.sexo || !a.data_nascimento
    );
    if (animaisIncompletos.length > animais.length * 0.3) {
      // Mais de 30% incompleto
      return {
        id: `cadastro-incompleto-${Date.now()}`,
        prioridade: 'MEDIA',
        titulo: 'Cadastros incompletos',
        descricao: `${animaisIncompletos.length} animal(is) possuem dados incompletos.`,
        impacto:
          'Dados incompletos prejudicam análises zootécnicas e rastreabilidade. Impossível gerar insights precisos.',
        sugestao: `Completar dados dos ${animaisIncompletos.length} animal(is): raça, sexo, data de nascimento.`,
        analiseIA: `${animaisIncompletos.length} animal(is) (${Math.round(
          (animaisIncompletos.length / animais.length) * 100
        )}% do rebanho) possuem informações faltando. Isso afeta a qualidade das análises.`,
        geradoEm: new Date(),
        status: 'PENDENTE',
        payload: {
          animaisIncompletos: animaisIncompletos.length,
          totalAnimais: animais.length,
          percentualIncompleto: Math.round(
            (animaisIncompletos.length / animais.length) * 100
          ),
        },
      };
    }

    return null;
  }

  /**
   * REGRA: Saúde geral do rebanho
   */
  private async analisarSaudeRebanho(context: AIAnalysisContext): Promise<AIInsight | null> {
    const { animais, vacinacoes, pesagens } = context;

    if (animais.length === 0) return null;

    // Calcular score de saúde
    const taxaVacinacao = (vacinacoes.length / animais.length) * 100;
    const taxaPesagem = pesagens.length > 0 ? 1 : 0;
    const taxaDados = (animais.filter((a: any) => a.raca && a.sexo).length / animais.length) * 100;

    const scoreGeral = (taxaVacinacao * 0.5 + taxaDados * 0.3 + taxaPesagem * 100 * 0.2) / 100;

    if (scoreGeral > 80) {
      return {
        id: `saude-otimo-${Date.now()}`,
        prioridade: 'INFORMATIVA',
        titulo: 'Rebanho em dia! ✓',
        descricao: 'Dados de saúde do rebanho estão bem acompanhados.',
        impacto: 'Rebanho com ótimo nível de controle sanitário e zootécnico.',
        sugestao: 'Mantenha a frequência de atualização. Continue com vacinações e pesagens em dia.',
        analiseIA: `Taxa de vacinação: ${Math.round(taxaVacinacao)}%, Completude de dados: ${Math.round(
          taxaDados
        )}%. O rebanho está bem gerenciado. Mantenha as boas práticas.`,
        geradoEm: new Date(),
        status: 'PENDENTE',
        payload: {
          scoreRebanho: Math.round(scoreGeral),
          taxaVacinacao: Math.round(taxaVacinacao),
          taxaDados: Math.round(taxaDados),
        },
      };
    }

    if (scoreGeral < 40) {
      return {
        id: `saude-critica-${Date.now()}`,
        prioridade: 'ALTA',
        titulo: 'Saúde do rebanho requer atenção',
        descricao: 'Muitos dados importantes do rebanho estão ausentes ou desatualizados.',
        impacto: 'Impossível garantir rastreabilidade e saúde sanitária adequada.',
        sugestao:
          'Atualizar urgentemente: vacinações, pesagens e dados dos animais. Contate um técnico agrícola se necessário.',
        analiseIA: `Score de saúde do rebanho: ${Math.round(scoreGeral)}%. Dados muito deficientes para garantir controle sanitário. 
        Prioridades: (1) Atualizar vacinações (${Math.round(taxaVacinacao)}%), (2) Completar cadastro (${Math.round(
          taxaDados
        )}%).`,
        geradoEm: new Date(),
        status: 'PENDENTE',
        payload: {
          scoreRebanho: Math.round(scoreGeral),
          taxaVacinacao: Math.round(taxaVacinacao),
          taxaDados: Math.round(taxaDados),
          alertaCritica: true,
        },
      };
    }

    return null;
  }

  /**
   * Gera análise em linguagem natural sobre vacinações
   */
  private gerarAnaliseVacinacao(vacinasVencidas: any[], animais: any[]): string {
    const primeiraCon = vacinasVencidas[0];
    const diasVencida = Math.floor(
      (new Date().getTime() - new Date(primeiraCon.proxima_dose).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    return `A IA identificou que ${vacinasVencidas.length} vacinação(ões) venceu há ${diasVencida} dia(s). 
    A ausência de revacinação aumenta significativamente o risco de doenças infecciosas no rebanho. 
    Recomendamos verificar o cronograma de vacinação com o veterinário e priorizar a revacinação.`;
  }
}
