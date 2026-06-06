import { z } from 'zod';

export const vacinacaoSchema = z.object({
  vacina: z.string().min(1, 'Informe a vacina'),
  data: z.string().min(1, 'Informe a data'),
  dose: z.string().optional(),
  veterinario: z.string().optional(),
  proxima_dose: z.string().optional(),
});

export type VacinacaoFormValues = z.infer<typeof vacinacaoSchema>;
