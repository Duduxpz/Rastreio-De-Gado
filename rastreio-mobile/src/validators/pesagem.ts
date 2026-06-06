import { z } from 'zod';

export const pesagemSchema = z.object({
  peso: z.string().min(1, 'Informe o peso'),
  data: z.string().min(1, 'Informe a data'),
  observacao: z.string().optional(),
});

export type PesagemFormValues = z.infer<typeof pesagemSchema>;
