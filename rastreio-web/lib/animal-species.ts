export type AnimalSpeciesValue = 'bovino' | 'equino' | 'ovino' | 'caprino' | 'suino' | 'ave' | 'outro';

export interface AnimalSpeciesOption {
  value: AnimalSpeciesValue;
  label: string;
  categories: Array<{ value: string; label: string }>;
}

export const animalSpeciesOptions: AnimalSpeciesOption[] = [
  {
    value: 'bovino',
    label: 'Bovino',
    categories: [
      { value: 'bezerro', label: 'Bezerro' },
      { value: 'novilha', label: 'Novilha' },
      { value: 'vaca', label: 'Vaca' },
      { value: 'touro', label: 'Touro' },
      { value: 'boi', label: 'Boi' },
      { value: 'outro', label: 'Outro' },
    ],
  },
  {
    value: 'equino',
    label: 'Equino',
    categories: [
      { value: 'potro', label: 'Potro' },
      { value: 'cavalo', label: 'Cavalo' },
      { value: 'outro', label: 'Outro' },
    ],
  },
  {
    value: 'ovino',
    label: 'Ovino',
    categories: [
      { value: 'ovelha', label: 'Ovelha' },
      { value: 'carneiro', label: 'Carneiro' },
      { value: 'outro', label: 'Outro' },
    ],
  },
  {
    value: 'caprino',
    label: 'Caprino',
    categories: [
      { value: 'cabra', label: 'Cabra' },
      { value: 'bode', label: 'Bode' },
      { value: 'outro', label: 'Outro' },
    ],
  },
  {
    value: 'suino',
    label: 'Suíno',
    categories: [
      { value: 'porco', label: 'Porco' },
      { value: 'leitão', label: 'Leitão' },
      { value: 'outro', label: 'Outro' },
    ],
  },
  {
    value: 'ave',
    label: 'Ave',
    categories: [
      { value: 'frango', label: 'Frango' },
      { value: 'galinha', label: 'Galinha' },
      { value: 'galo', label: 'Galo' },
      { value: 'outro', label: 'Outro' },
    ],
  },
  {
    value: 'outro',
    label: 'Outro',
    categories: [{ value: 'outro', label: 'Outro' }],
  },
];

export function getAnimalSpeciesMeta(specie?: string): AnimalSpeciesOption {
  return animalSpeciesOptions.find((option) => option.value === (specie || 'bovino')) ?? animalSpeciesOptions[0];
}

export function getAnimalCategoryLabel(specie: string | undefined, category?: string): string {
  if (!category) return 'Não informado';

  const meta = getAnimalSpeciesMeta(specie);
  const matched = meta.categories.find((item) => item.value === category.toLowerCase());
  return matched?.label ?? category;
}

export function getAnimalSpeciesLabel(specie?: string): string {
  return getAnimalSpeciesMeta(specie).label;
}
