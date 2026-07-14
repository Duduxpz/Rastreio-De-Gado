/**
 * Configuração central de espécies.
 *
 * Este arquivo é a única fonte de verdade sobre como o painel de "Animais"
 * deve se comportar para cada espécie: quais categorias existem, se o
 * animal é identificado/buscado por nome (ex: cavalos) ou por brinco
 * (ex: bovinos, suínos, aves), e os rótulos exibidos na tela.
 *
 * Para adicionar uma nova espécie no futuro, basta incluir uma nova entrada
 * neste objeto — todo o formulário, tabela e busca se adaptam sozinhos.
 */

export type Especie = 'bovino' | 'equino' | 'ovino' | 'caprino' | 'suino' | 'ave';

export interface CategoriaOption {
  value: string;
  label: string;
}

export interface EspecieConfig {
  label: string;
  labelPlural: string;
  emoji: string;
  /** Rótulo do campo de identificação numérica/física do animal (brinco, anilha, etc.) */
  identificadorLabel: string;
  identificadorPlaceholder: string;
  /** Se true, o campo "Nome" é obrigatório e vira o principal meio de busca (ex: equinos) */
  nomeObrigatorio: boolean;
  nomePlaceholder: string;
  categorias: CategoriaOption[];
}

export const ESPECIES: Record<Especie, EspecieConfig> = {
  bovino: {
    label: 'Bovino',
    labelPlural: 'Bovinos',
    emoji: '🐄',
    identificadorLabel: 'Brinco',
    identificadorPlaceholder: 'Ex: 001',
    nomeObrigatorio: false,
    nomePlaceholder: 'Ex: Mimosa (opcional)',
    categorias: [
      { value: 'bezerro', label: 'Bezerro' },
      { value: 'novilha', label: 'Novilha' },
      { value: 'vaca', label: 'Vaca' },
      { value: 'touro', label: 'Touro' },
      { value: 'boi', label: 'Boi' },
      { value: 'outro', label: 'Outro' },
    ],
  },
  equino: {
    label: 'Equino',
    labelPlural: 'Equinos',
    emoji: '🐴',
    identificadorLabel: 'Brinco / Chip',
    identificadorPlaceholder: 'Ex: EQ-001',
    nomeObrigatorio: true,
    nomePlaceholder: 'Ex: Trovão',
    categorias: [
      { value: 'potro', label: 'Potro' },
      { value: 'potranca', label: 'Potranca' },
      { value: 'egua', label: 'Égua' },
      { value: 'garanhao', label: 'Garanhão' },
      { value: 'castrado', label: 'Castrado' },
      { value: 'outro', label: 'Outro' },
    ],
  },
  ovino: {
    label: 'Ovino',
    labelPlural: 'Ovinos',
    emoji: '🐑',
    identificadorLabel: 'Brinco',
    identificadorPlaceholder: 'Ex: OV-001',
    nomeObrigatorio: false,
    nomePlaceholder: 'Ex: Nuvem (opcional)',
    categorias: [
      { value: 'cordeiro', label: 'Cordeiro' },
      { value: 'borrega', label: 'Borrega' },
      { value: 'ovelha', label: 'Ovelha' },
      { value: 'carneiro', label: 'Carneiro' },
      { value: 'outro', label: 'Outro' },
    ],
  },
  caprino: {
    label: 'Caprino',
    labelPlural: 'Caprinos',
    emoji: '🐐',
    identificadorLabel: 'Brinco',
    identificadorPlaceholder: 'Ex: CP-001',
    nomeObrigatorio: false,
    nomePlaceholder: 'Ex: Pingo (opcional)',
    categorias: [
      { value: 'cabrito', label: 'Cabrito' },
      { value: 'caprina', label: 'Caprina' },
      { value: 'cabra', label: 'Cabra' },
      { value: 'bode', label: 'Bode' },
      { value: 'outro', label: 'Outro' },
    ],
  },
  suino: {
    label: 'Suíno',
    labelPlural: 'Suínos',
    emoji: '🐖',
    identificadorLabel: 'Brinco / Tatuagem',
    identificadorPlaceholder: 'Ex: SU-001',
    nomeObrigatorio: false,
    nomePlaceholder: 'Opcional',
    categorias: [
      { value: 'leitao', label: 'Leitão' },
      { value: 'marra', label: 'Marrã' },
      { value: 'porca', label: 'Porca' },
      { value: 'cachaco', label: 'Cachaço' },
      { value: 'outro', label: 'Outro' },
    ],
  },
  ave: {
    label: 'Ave',
    labelPlural: 'Aves',
    emoji: '🐔',
    identificadorLabel: 'Anilha / Lote',
    identificadorPlaceholder: 'Ex: AV-001',
    nomeObrigatorio: false,
    nomePlaceholder: 'Opcional',
    categorias: [
      { value: 'pintainho', label: 'Pintainho' },
      { value: 'frango', label: 'Frango de corte' },
      { value: 'poedeira', label: 'Poedeira' },
      { value: 'matriz', label: 'Matriz' },
      { value: 'reprodutor', label: 'Reprodutor' },
      { value: 'outro', label: 'Outro' },
    ],
  },
};

export const ESPECIE_OPTIONS: Array<{ value: Especie; label: string; emoji: string }> =
  (Object.keys(ESPECIES) as Especie[]).map((key) => ({
    value: key,
    label: ESPECIES[key].label,
    emoji: ESPECIES[key].emoji,
  }));

export function getEspecieConfig(especie: string | undefined | null): EspecieConfig {
  return ESPECIES[(especie as Especie) || 'bovino'] || ESPECIES.bovino;
}

/** Categoria padrão (primeira da lista) ao trocar de espécie no formulário */
export function categoriaPadrao(especie: string | undefined | null): string {
  return getEspecieConfig(especie).categorias[0]?.value || 'outro';
}
