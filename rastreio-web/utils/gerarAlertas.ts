export interface Alerta {
  id: string;
  tipo: 'critico' | 'aviso';
  categoria: 'vacinacao' | 'pesagem' | 'animal' | 'sistema';
  titulo: string;
  descricao: string;
  animalId?: string;
  animalBrinco?: string;
  lida: boolean;
  criadoEm: string;
}

interface LocalVacinacao {
  id?: string;
  animalId?: string;
  animal_id?: string;
  animalBrinco?: string;
  vacina: string;
  data?: string;
  dataAplicacao?: string;
  lote?: string;
  dose?: string;
  dataVencimento?: string;
  proxima_dose?: string;
  status?: 'aplicada' | 'pendente';
  veterinario?: string;
  responsavel?: string;
  created_at?: string;
}

interface LocalPesagem {
  id?: string;
  animalId?: string;
  animal_id?: string;
  animalBrinco?: string;
  peso: number;
  data: string;
  observacoes?: string;
  observacao?: string;
  created_at?: string;
}

interface LocalAnimal {
  id: string;
  fazenda_id?: string;
  brinco: string;
  raca?: string;
  sexo?: 'M' | 'F' | 'Macho' | 'Fêmea';
  data_nascimento?: string;
  dataNascimento?: string;
  peso_atual?: number;
  peso?: number;
  lote?: string;
  pasto?: string;
  categoria?: string;
  foto_url?: string;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
  criadoEm?: string;
}

function getConfig() {
  if (typeof window === 'undefined') {
    return { diasAlertaVacinacao: 7, diasAlertaPesagem: 30 };
  }
  const config = JSON.parse(
    localStorage.getItem('configuracoes') || '{}'
  );
  return {
    diasAlertaVacinacao: config.diasAlertaVacinacao ?? 7,
    diasAlertaPesagem: config.diasAlertaPesagem ?? 30,
  };
}

function normalizeData(dataStr: string | undefined): Date | null {
  if (!dataStr) return null;
  try {
    const date = new Date(dataStr);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

export const gerarAlertas = (
  animaisRaw: any[] = [],
  vacinacoes: LocalVacinacao[] = [],
  pesagens: LocalPesagem[] = []
): Alerta[] => {
  const alertas: Alerta[] = [];
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const { diasAlertaVacinacao, diasAlertaPesagem } = getConfig();

  // Normalizar animais
  const animais: LocalAnimal[] = (Array.isArray(animaisRaw) ? animaisRaw : []).map((a) => ({
    ...a,
    ativo: a.ativo !== false,
  }));

  // ── 1. VACINAÇÕES VENCIDAS (data de vencimento já passou) ──
  vacinacoes.forEach((v) => {
    const dataVenc = v.dataVencimento || v.proxima_dose;
    if (!dataVenc) return;

    const venc = normalizeData(dataVenc);
    if (!venc) return;

    if (venc < hoje) {
      alertas.push({
        id: `vac-vencida-${v.id || v.animalBrinco}`,
        tipo: 'critico',
        categoria: 'vacinacao',
        titulo: `Vacinação vencida — ${v.animalBrinco || 'Animal desconhecido'}`,
        descricao: `A vacinação ${v.vacina || 'sem nome'} venceu em ${venc.toLocaleDateString(
          'pt-BR'
        )}. Reaplique em breve.`,
        animalId: v.animalId || v.animal_id,
        animalBrinco: v.animalBrinco,
        lida: false,
        criadoEm: new Date().toISOString(),
      });
    }
  });

  // ── 2. VACINAÇÕES PRÓXIMAS DO VENCIMENTO (X dias) ──
  vacinacoes.forEach((v) => {
    const dataVenc = v.dataVencimento || v.proxima_dose;
    if (!dataVenc) return;

    const venc = normalizeData(dataVenc);
    if (!venc || venc < hoje) return; // Já processado acima

    const diasRestantes = Math.ceil(
      (venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diasRestantes > 0 && diasRestantes <= diasAlertaVacinacao) {
      alertas.push({
        id: `vac-prox-${v.id || v.animalBrinco}`,
        tipo: 'aviso',
        categoria: 'vacinacao',
        titulo: `Vacinação próxima do vencimento — ${v.animalBrinco || 'Animal'}`,
        descricao: `${v.vacina || 'Vacinação'} vence em ${diasRestantes} dia${diasRestantes > 1 ? 's' : ''}. Agende reaplicação.`,
        animalId: v.animalId || v.animal_id,
        animalBrinco: v.animalBrinco,
        lida: false,
        criadoEm: new Date().toISOString(),
      });
    }
  });

  // ── 3. VACINAÇÕES PENDENTES SEM DATA ──
  const pendentesSemData = vacinacoes.filter(
    (v) =>
      (v.status === 'pendente' ||
        (!v.dataAplicacao && !v.dataVencimento && !v.proxima_dose)) &&
      !v.data
  );
  if (pendentesSemData.length > 0) {
    alertas.push({
      id: 'pendentes-sem-data',
      tipo: 'aviso',
      categoria: 'vacinacao',
      titulo: `${pendentesSemData.length} vacinação${pendentesSemData.length > 1 ? 'ões' : ''} pendente${pendentesSemData.length > 1 ? 's' : ''} sem data`,
      descricao:
        'Existem vacinações registradas como pendentes sem data de aplicação ou vencimento definida.',
      lida: false,
      criadoEm: new Date().toISOString(),
    });
  }

  // ── 4. ANIMAIS SEM PESAGEM NOS ÚLTIMOS X DIAS ──
  const limitePesagem = new Date(hoje);
  limitePesagem.setDate(limitePesagem.getDate() - diasAlertaPesagem);

  animais.forEach((animal) => {
    if (!animal.ativo) return;

    const pesagensDoAnimal = pesagens.filter(
      (p) =>
        p.animalId === animal.id ||
        p.animal_id === animal.id ||
        p.animalBrinco === animal.brinco
    );

    if (pesagensDoAnimal.length === 0) return; // Sem nenhuma pesagem, vai pro alerta 5

    const pesagemRecente = pesagensDoAnimal.some((p) => {
      const data = normalizeData(p.data);
      return data && data >= limitePesagem;
    });

    if (!pesagemRecente) {
      alertas.push({
        id: `sem-pesagem-${animal.id}`,
        tipo: 'aviso',
        categoria: 'pesagem',
        titulo: `Sem pesagem recente — Animal ${animal.brinco || 'desconhecido'}`,
        descricao: `O animal ${animal.brinco || 'sem brinco'} não tem pesagem registrada nos últimos ${diasAlertaPesagem} dias.`,
        animalId: animal.id,
        animalBrinco: animal.brinco,
        lida: false,
        criadoEm: new Date().toISOString(),
      });
    }
  });

  // ── 5. ANIMAIS SEM NENHUMA VACINAÇÃO ──
  animais.forEach((animal) => {
    if (!animal.ativo) return;

    const vacinasDoAnimal = vacinacoes.filter(
      (v) =>
        v.animalId === animal.id ||
        v.animal_id === animal.id ||
        v.animalBrinco === animal.brinco
    );

    if (vacinasDoAnimal.length === 0) {
      alertas.push({
        id: `sem-vacina-${animal.id}`,
        tipo: 'aviso',
        categoria: 'vacinacao',
        titulo: `Animal sem vacinação — ${animal.brinco || 'desconhecido'}`,
        descricao: `O animal ${animal.brinco || 'sem brinco'} não possui nenhuma vacinação registrada.`,
        animalId: animal.id,
        animalBrinco: animal.brinco,
        lida: false,
        criadoEm: new Date().toISOString(),
      });
    }
  });

  return alertas;
};
