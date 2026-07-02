export type VaccinationStatus = 'pendente' | 'aplicada' | 'atrasada' | 'agendada';

export interface ScheduledVaccination {
  id: string;
  animalId: string;
  animalBrinco: string;
  nome: string;
  dataPrevista: string;
  status: VaccinationStatus;
  obrigatoria: boolean;
  dose: string;
  observacao?: string;
}

interface VaccinationProtocolItem {
  id: string;
  nome: string;
  idadeAplicacao: { min: number; max: number; unidade: string };
  dose: string;
  reforco?: { intervalo: number; unidade: string } | null;
  obrigatoria?: boolean;
  observacao?: string;
  restricaoSexo?: 'M' | 'F';
}

interface AnimalLike {
  id: string;
  brinco?: string;
  sexo?: string;
  dataNascimento?: string;
  categoria?: string;
  especie?: string;
}

const protocols: Record<string, Record<string, VaccinationProtocolItem[]>> = {
  bovino: {
    bezerro: [
      {
        id: 'brucelose-f19',
        nome: 'Brucelose (F19)',
        idadeAplicacao: { min: 3, max: 8, unidade: 'meses' },
        dose: 'única',
        reforco: null,
        obrigatoria: true,
        observacao: 'Apenas fêmeas. Exigência legal.',
        restricaoSexo: 'F',
      },
      {
        id: 'aftosa',
        nome: 'Febre Aftosa',
        idadeAplicacao: { min: 3, max: 999, unidade: 'meses' },
        dose: '2ml IM',
        reforco: { intervalo: 6, unidade: 'meses' },
        obrigatoria: true,
        observacao: 'Campanha semestral obrigatória.',
      },
      {
        id: 'raiva-bovina',
        nome: 'Raiva Bovina',
        idadeAplicacao: { min: 3, max: 999, unidade: 'meses' },
        dose: '2ml SC',
        reforco: { intervalo: 12, unidade: 'meses' },
        obrigatoria: false,
        observacao: 'Recomendada em regiões de risco.',
      },
    ],
    vaca: [
      {
        id: 'aftosa',
        nome: 'Febre Aftosa',
        idadeAplicacao: { min: 3, max: 999, unidade: 'meses' },
        dose: '2ml IM',
        reforco: { intervalo: 6, unidade: 'meses' },
        obrigatoria: true,
      },
      {
        id: 'raiva-bovina',
        nome: 'Raiva Bovina',
        idadeAplicacao: { min: 3, max: 999, unidade: 'meses' },
        dose: '2ml SC',
        reforco: { intervalo: 12, unidade: 'meses' },
        obrigatoria: false,
      },
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
        observacao: 'Fundamental para equinos.',
      },
    ],
  },
};

function toMonthDiff(dateString?: string): number | null {
  if (!dateString) return null;
  const birth = new Date(dateString);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  return Math.max(months, 0);
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export class VaccinationScheduler {
  static generateSchedule(animal: AnimalLike): ScheduledVaccination[] {
    const especie = (animal.especie || 'bovino').toLowerCase();
    const categoria = (animal.categoria || 'bezerro').toLowerCase();
    const protocol = protocols[especie]?.[categoria];
    if (!protocol) return [];

    const hoje = new Date();
    const idadeEmMeses = toMonthDiff(animal.dataNascimento);
    const vacinas: ScheduledVaccination[] = [];

    for (const vacina of protocol) {
      if (idadeEmMeses === null || idadeEmMeses < vacina.idadeAplicacao.min) continue;
      if (vacina.restricaoSexo && animal.sexo !== vacina.restricaoSexo) continue;

      const dataVacina = idadeEmMeses >= vacina.idadeAplicacao.min ? addMonths(new Date(animal.dataNascimento || hoje), vacina.idadeAplicacao.min) : hoje;
      const status = dataVacina < hoje ? 'atrasada' : 'pendente';

      vacinas.push({
        id: `${animal.id}-${vacina.id}`,
        animalId: animal.id,
        animalBrinco: animal.brinco || '—',
        nome: vacina.nome,
        dataPrevista: toDateString(dataVacina),
        status,
        obrigatoria: !!vacina.obrigatoria,
        dose: vacina.dose,
        observacao: vacina.observacao,
      });
    }

    return vacinas;
  }

  static getUpcoming(diasAntecedencia = 7): ScheduledVaccination[] {
    if (typeof window === 'undefined') return [];
    const stored = JSON.parse(localStorage.getItem('vacinacoes') || '[]');
    const hoje = new Date();
    const limite = new Date();
    limite.setDate(hoje.getDate() + diasAntecedencia);

    return (stored as ScheduledVaccination[]).filter((item) => {
      if (item.status === 'aplicada') return false;
      const data = new Date(item.dataPrevista);
      return data >= hoje && data <= limite;
    });
  }
}
