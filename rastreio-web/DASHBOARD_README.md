# Dashboard - Rastreio Bovino 🐄

Um dashboard profissional e completo para rastreabilidade bovina em Next.js 14 com integração Supabase.

## ✨ Funcionalidades Implementadas

### 📊 Dashboard Home
- Cards com estatísticas principais (total de animais, vacinações pendentes, pesagens)
- Gráfico de evolução de peso (últimos 30 dias)
- Alertas em tempo real
- Ações rápidas para navegação

### 🐄 Gerenciamento de Animais
- Listagem completa de animais com busca e filtros
- Criar novo animal com modal
- Página de detalhe com informações completas
- Visualização de vacinações por animal
- Visualização de pesagens por animal
- Gráfico de evolução individual

### 💉 Controle de Vacinações
- Listagem de todas as vacinações
- Registrar nova vacinação por animal
- Alertas de vacinações pendentes
- Filtro por status (pendente/realizado)

### ⚖️ Registro de Pesagens
- Histórico completo de pesagens
- Registrar nova pesagem
- Atualização automática do peso atual do animal
- Evolução de peso visualizada em gráficos

### 📈 Relatórios
- Estatísticas gerais da fazenda
- Gráfico de peso por animal (top 10)
- Distribuição de categorias em gráfico de pizza
- Recomendações personalizadas

### 🚨 Sistema de Alertas
- Alertas de vacinações atrasadas (críticos, avisos)
- Alertas de peso baixo
- Filtro por severidade
- Links rápidos para ações

### 🔐 Autenticação
- Login com Supabase Auth
- Cadastro de novos usuários
- Gerenciamento de sessão
- Proteção de rotas

### 🎨 Design System Completo
- Componentes reutilizáveis (Button, Input, Card, Table, etc)
- Design responsivo mobile-first
- Paleta de cores corporativa
- Tipografia profissional
- Animações suaves

## 🚀 Como Começar

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta Supabase (https://supabase.com)

### Instalação

1. **Clonar ou entrar no repositório**
```bash
cd rastreio-web
```

2. **Instalar dependências**
```bash
npm install
```

3. **Configurar variáveis de ambiente**

Criar arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
API_URL=https://sua-api.railway.app
```

4. **Iniciar servidor de desenvolvimento**
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) no navegador.

## 📁 Estrutura do Projeto

```
rastreio-web/
├── app/
│   ├── dashboard/           # Layout base do dashboard
│   │   ├── page.tsx        # Home
│   │   ├── layout.tsx      # Layout com navbar e sidebar
│   │   ├── animais/        # Página de animais
│   │   │   ├── page.tsx    # Listagem
│   │   │   └── [id]/       # Detalhe do animal
│   │   ├── vacinacoes/     # Página de vacinações
│   │   ├── pesagens/       # Página de pesagens
│   │   ├── relatorios/     # Página de relatórios
│   │   └── alertas/        # Página de alertas
│   ├── login/              # Página de login
│   ├── layout.tsx          # Layout global
│   └── globals.css         # Estilos globais
├── components/
│   ├── ui/                 # Componentes base
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Table.tsx
│   │   ├── Modal.tsx
│   │   ├── Badge.tsx
│   │   ├── Spinner.tsx
│   │   ├── Toast.tsx
│   │   └── ... mais
│   ├── Navbar.tsx          # Barra de navegação
│   ├── Sidebar.tsx         # Barra lateral
│   └── StatCard.tsx        # Card de estatística
├── hooks/
│   ├── useData.ts          # Hooks para dados
│   └── useToast.ts         # Hook para notificações
├── lib/
│   └── supabase.ts         # Cliente Supabase
├── types/
│   └── index.ts            # Tipos TypeScript
└── tailwind.config.ts      # Configuração Tailwind
```

## 🎯 Componentes Disponíveis

### UI Components

#### Button
```tsx
<Button variant="primary" onClick={handleClick}>
  Clique aqui
</Button>
```

#### Input
```tsx
<Input
  label="Email"
  type="email"
  placeholder="seu@email.com"
  error={error}
  required
/>
```

#### Card
```tsx
<Card className="p-6">
  Conteúdo do card
</Card>
```

#### Table
```tsx
<Table
  data={animais}
  keyExtractor={(animal) => animal.id}
  columns={[
    { key: 'brinco', label: 'Brinco' },
    { key: 'raca', label: 'Raça' },
  ]}
  onRowClick={(animal) => handleSelect(animal)}
/>
```

#### Modal
```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Título"
  footer={<Button>Confirmar</Button>}
>
  Conteúdo do modal
</Modal>
```

#### Badge
```tsx
<Badge label="Ativo" variant="success" />
```

## 🔗 Integração com API

O dashboard se conecta com a API REST do backend via `lib/supabase.ts`. 

Endpoints esperados:
- `POST /api/sync/push` - Sincronizar dados
- `GET /animais` - Listar animais
- `POST /animais` - Criar animal
- `GET /vacinacoes` - Listar vacinações
- `POST /vacinacoes` - Criar vacinação
- `GET /pesagens` - Listar pesagens
- `POST /pesagens` - Criar pesagem

## 🎨 Customização

### Cores
Editar `tailwind.config.ts`:
```ts
colors: {
  primary: {
    500: '#1A7A4A',  // Verde principal
    600: '#146040',
    700: '#0F5233',
  },
  accent: {
    500: '#D97706',  // Âmbar
  },
}
```

### Tipografia
Editar `app/globals.css` para mudar fonte padrão.

### Componentes
Todos os componentes estão em `components/ui/` e podem ser customizados.

## 📱 Responsividade

O dashboard é totalmente responsivo:
- **Mobile**: Layout stackado, menu em drawer
- **Tablet**: Grid de 2 colunas
- **Desktop**: Grid de 4 colunas com sidebar fixo

## 🔒 Segurança

- Autenticação via Supabase Auth
- JWT token para requisições
- Row Level Security (RLS) no banco
- Proteção de rotas com verificação de sessão
- Variáveis de ambiente privadas

## 📊 Dados e Banco

### Tabelas utilizadas
- `animais` - Registro de animais
- `vacinacoes` - Histórico de vacinações
- `pesagens` - Histórico de pesagens
- `fazendas` - Dados da fazenda

Ver `database-schema.sql` para estrutura completa.

## 🚀 Deploy

### Vercel (Recomendado)

1. Push no GitHub
2. Conectar repositório no [Vercel](https://vercel.com)
3. Configurar variáveis de ambiente
4. Deploy automático

```bash
npm run build
```

### Variáveis de Ambiente em Produção
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
API_URL
```

## 🐛 Troubleshooting

### "TypeError: Cannot read property 'getSession' of undefined"
- Verificar se `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão corretos

### Tabelas não aparecem
- Verificar se RLS está configurado no Supabase
- Confirmar permissões do usuário

### Estilos não carregam
- Limpar cache: `npm run build`
- Reiniciar dev server

## 📝 Scripts

```bash
npm run dev      # Desenvolver localmente
npm run build    # Build para produção
npm start        # Iniciar servidor de produção
npm run lint     # Linter
```

## 🤝 Contribuição

1. Criar branch: `git checkout -b feature/minha-feature`
2. Commit: `git commit -am 'Adicionar feature'`
3. Push: `git push origin feature/minha-feature`
4. Criar Pull Request

## 📄 Licença

Proprietário - Sistema Rastreio

## 📞 Suporte

Para dúvidas ou problemas, abrir issue no repositório ou contatar equipe de desenvolvimento.

---

**Desenvolvido com ❤️ para fazendas brasileiras**
