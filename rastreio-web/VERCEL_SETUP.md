# Configuração do Vercel para `rastreio-web`

Este arquivo documenta passo a passo a configuração mínima necessária no Vercel para publicar apenas a pasta `rastreio-web` do monorepo.

1) Root Directory
- Defina `Root Directory` (Project Settings → General → Root Directory) como: `rastreio-web`

2) Build & Install
- Install Command: (padrão) `npm install`
- Build Command: `npm run build`

3) Output Directory
- Deixe **Output Directory** em branco — NÃO aponte para `.next` nem para `build`.
  O Vercel detecta automaticamente `Next.js` e usa o builder apropriado.

4) Variáveis de ambiente (Production)
- Adicione as seguintes variáveis em Settings → Environment Variables → Production:
  - `NEXT_PUBLIC_SUPABASE_URL` = https://SEU_PROJETO.supabase.co
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = <sua-chave-publishable>
  - `API_URL` = https://sua-api.exemplo  # URL pública do backend Express/REST

  Observações:
  - `API_URL` ou `NEXT_PUBLIC_API_URL` deve apontar para o backend `rastreio-api` hospedado.
  - Não commit these keys into source. Use o painel do Vercel ou `vercel env`.
  - `NEXT_PUBLIC_` é exposto no cliente — use apenas keys publishable.

5) `vercel.json`
- Não é necessário para Next.js; se existir, remova qualquer `outputDirectory` apontando para `.next` e remova rewrites que forçam roteamento estático.

6) Redeploy via CLI
```bash
cd rastreio-web
vercel --prod
```

7) Dicas de troubleshooting
- Se o build falhar com erro `Invalid supabaseUrl`, verifique se `NEXT_PUBLIC_SUPABASE_URL` está definida e válida no ambiente `Production` do Vercel.
- Use `vercel env pull .vercel.env --environment production` para baixar as envs localmente (não commit `.vercel.env`).

8) Quer que eu abra um PR com este arquivo?
- Se quiser, posso criar um branch, commitar este arquivo e abrir um PR automaticamente (preciso de permissão para push/PR). Informe se devo proceder.

---
Arquivo gerado automaticamente pelo assistente — adaptável conforme suas políticas de deploy.
