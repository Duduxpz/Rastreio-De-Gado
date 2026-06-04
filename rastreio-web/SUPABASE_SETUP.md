# 🔧 Guia de Configuração Supabase para Dashboard

Este guia passo a passo para configurar o Supabase para o dashboard web.

## 1️⃣ Criar Projeto Supabase

1. Ir para [supabase.com](https://supabase.com)
2. Clicar em "Start your project"
3. Fazer login/cadastro
4. Criar novo projeto
5. Copiar a URL e chave (anon key)

## 2️⃣ Configurar Banco de Dados

### Executar Script SQL

1. No dashboard Supabase, ir para SQL Editor
2. Criar nova query
3. Copiar conteúdo de `database-schema.sql`
4. Executar

Isto vai criar as tabelas:
- `animais`
- `vacinacoes`
- `pesagens`
- `fazendas`

## 3️⃣ Row Level Security (RLS)

### Ativar RLS nas Tabelas

1. Ir para Authentication > Policies
2. Para cada tabela (`animais`, `vacinacoes`, `pesagens`):
   - Habilitar RLS
   - Adicionar política:

```sql
CREATE POLICY "rls_animais" ON animais 
USING (fazenda_id IN (SELECT id FROM fazendas WHERE owner_id = auth.uid()));
```

## 4️⃣ Variáveis de Ambiente

Criar `.env.local` na pasta `rastreio-web`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
API_URL=http://localhost:3001
```

## 5️⃣ Configurar Autenticação

### Email/Password

1. Supabase Dashboard > Authentication > Providers
2. Email ativado por padrão
3. Ir para Settings > Auth

### Configurações Recomendadas

- **Site URL**: `http://localhost:3000` (dev) | `https://seu-dominio.com` (prod)
- **Redirect URLs**: 
  - `http://localhost:3000/**`
  - `https://seu-dominio.com/**`

## 6️⃣ Dados Iniciais (Opcional)

Para testar, inserir dados manualmente:

```sql
-- Inserir fazenda de teste
INSERT INTO fazendas (nome, owner_id, plano) 
VALUES ('Fazenda Teste', 'user-uuid', 'starter');

-- Inserir animais
INSERT INTO animais (fazenda_id, brinco, raca, sexo, categoria, peso_atual, ativo)
VALUES ('fazenda-uuid', '001', 'Nelore', 'M', 'bezerro', 250, true);
```

## 7️⃣ Testar Conexão

```bash
cd rastreio-web
npm run dev
```

1. Abrir http://localhost:3000/login
2. Clicar em "Criar Conta"
3. Cadastrar novo usuário
4. Login com email e senha
5. Verificar se dashboard carrega dados

## 🔑 Credenciais

Após criar usuário no Supabase, suas credenciais serão:

- **Email**: aquele que cadastrou
- **Senha**: aquela que definiu
- **Dados**: Inicialmente vazio (sem animais, vacinações ou pesagens)

## 🆘 Checklist

- [ ] Projeto Supabase criado
- [ ] Tabelas criadas (SQL script executado)
- [ ] RLS ativado e configurado
- [ ] `.env.local` criado com credenciais
- [ ] Autenticação configurada
- [ ] Dev server rodando
- [ ] Login funciona
- [ ] Dashboard carrega

## 📚 Links Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Políticas de Autenticação](https://supabase.com/docs/guides/auth/policies)

## 💡 Dicas

- Use o Supabase Studio (painel) para gerenciar dados
- Teste as políticas RLS antes de ir a produção
- Mantenha a ANON_KEY privada no cliente (é pública por design)
- SERVICE_KEY fica somente no backend

---

**Assim que terminar a configuração, o dashboard estará pronto para usar!** 🚀
