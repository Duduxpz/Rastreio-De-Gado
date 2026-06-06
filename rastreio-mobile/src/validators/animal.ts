import { z } from 'zod';

export const animalSchema = z.object({
  brinco: z.string().min(1, 'Informe o brinco'),
  raca: z.string().min(1, 'Informe a raça'),
  sexo: z.enum(['M', 'F']),
  data_nascimento: z.string().optional(),
  categoria: z.enum(['bezerro', 'novilha', 'vaca', 'touro', 'boi', 'outro']),
  lote: z.string().optional(),
  pasto: z.string().optional(),
  peso_atual: z
    .string()
    .regex(/^\d+(\.\d+)?$/, 'Informe um valor numérico')
    .optional()
    .or(z.literal('')),
});

export type AnimalFormValues = z.infer<typeof animalSchema>;
