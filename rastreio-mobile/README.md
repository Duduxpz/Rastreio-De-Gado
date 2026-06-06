# Rastreio Mobile — Scaffold inicial

Este diretório contém o scaffold inicial para o aplicativo `rastreio-mobile`.

O que foi gerado:
- `src/theme/ThemeProvider.tsx` — provider central usando tokens existentes.
- `src/hooks/useResponsive.ts` — hook de responsividade (mobile/tablet/desktop).
- `src/database/schema.ts` — inicialização do banco SQLite com tabelas principais e `sync_queue`.
- `src/repositories/BaseRepository.ts` — repositório genérico para CRUD local.
- `src/services/api.ts` — wrapper simples para `fetch` com suporte a token.
- `src/sync/queue.ts` — fila de sincronização básica.

Próximos passos recomendados:
1. Integrar `ThemeProvider` no root do app (`app/_layout.tsx`).
2. Criar repositórios específicos: `AnimaisRepository`, `VacinacoesRepository`, `PesagensRepository` usando `BaseRepository`.
3. Implementar `useAuth` para fornecer token e chamar `setAuthToken` em `services/api`.
4. Implementar UI inicial (listas, detalhes) usando `FlashList`.
5. Adicionar testes unitários para repositórios e sync.

Como executar (local):

1. Instalar dependências no `rastreio-mobile` e rodar o Expo:

```powershell
cd rastreio-mobile
npm install
npm start
```

2. Inicializar DB ao iniciar o app chamando `initDatabase()` antes de renderizar.

Observações:
- Este scaffold respeita as restrições de não alterar APIs ou backend. O próximo passo é mapear endpoints exatos e os tipos (compartilhar `types/index.ts`).
