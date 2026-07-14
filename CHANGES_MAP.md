# 🔍 Mapa de Mudanças - Rastreio v2.0

> Referência rápida de todos os arquivos criados e modificados

---

## ✨ Novos Arquivos

### `lib/animal-species.ts` (Criar)
**Propósito:** Catálogo centralizado de espécies e categorias
**Linhas:** ~100
**Funções exportadas:**
- `animalSpeciesOptions: AnimalSpeciesOption[]` - Array de espécies
- `getAnimalSpeciesMeta(species)` - Obter meta da espécie
- `getAnimalCategoryLabel(category)` - Traduzir categoria
- `getAnimalSpeciesLabel(species)` - Traduzir espécie

**Conteúdo resumido:**
```typescript
export const animalSpeciesOptions = [
  { value: 'bovino', label: 'Bovino', categories: [...] },
  { value: 'equino', label: 'Equino', categories: [...] },
  // ... 5 mais
];
```

---

## 🔧 Arquivos Modificados

### 1. `components/Topbar.tsx`
**O que mudou:** Adicionado menu toggle mobile + farm name sync
**Linhas modificadas:** ~20
**Mudanças principais:**
```typescript
// Novo: Menu toggle state
const [menuOpen, setMenuOpen] = useState(false);

// Novo: Type casting para displayName
const displayName = (user?.user_metadata?.full_name as string | undefined) || ...;

// Novo: Farm name de localStorage
const displayFarmName = fazendaNome || farmName || 'Minha Fazenda';

// Novo: Botão hamburger (mobile only)
{/* md:hidden */}
<button onClick={() => setMenuOpen(!menuOpen)}>
  {/* Menu/X ícone */}
</button>
```

---

### 2. `components/Sidebar.tsx`
**O que mudou:** Convertido para drawer mobile + desktop
**Linhas modificadas:** ~60
**Estrutura:**
```typescript
interface SidebarProps {
  readonly mobileOpen?: boolean;
  readonly onClose?: () => void;
}

// Novo: Drawer container com transform animation
<div className="fixed left-0 top-0 w-56 h-screen
               transform transition-transform
               {mobileOpen ? 'translate-x-0' : '-translate-x-full'}" />

// Novo: Backdrop (mobile only)
{mobileOpen && (
  <div onClick={onClose} className="fixed inset-0 bg-black/50 md:hidden" />
)}
```

---

### 3. `app/dashboard/layout.tsx`
**O que mudou:** Adicionado state drawer mobile + responsividade
**Linhas modificadas:** ~30
**Mudanças principais:**
```typescript
// Novo: State do drawer
const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

// Novo: Passar props ao Sidebar
<Sidebar 
  mobileOpen={mobileSidebarOpen}
  onClose={() => setMobileSidebarOpen(false)}
/>

// Novo: Padding responsivo
<main className="pt-16 md:pt-14 md:pl-56 min-h-screen">
```

---

### 4. `contexts/AuthContext.tsx`
**O que mudou:** Adicionado farm name persistence
**Linhas modificadas:** ~50
**Funções novas:**
```typescript
// Novo: Persistir farm name
const persistFarmName = useCallback((name: string) => {
  localStorage.setItem('farm_name', name);
  window.dispatchEvent(new Event('farm-name-updated'));
}, []);

// Novo: setFarmName callback
const setFarmName = useCallback(async (name: string) => {
  // Salvar em Supabase
  // Chamar persistFarmName()
}, [user?.id]);
```

---

### 5. `app/login/page.tsx`
**O que mudou:** Salvar farm_name no signup
**Linhas modificadas:** ~5
**Mudança:**
```typescript
// No handler de signup sucesso:
localStorage.setItem('farm_name', state.farmName);
window.dispatchEvent(new Event('farm-name-updated'));
```

---

### 6. `app/dashboard/configuracoes/page.tsx`
**O que mudou:** Farm name editável + persistência
**Linhas modificadas:** ~15
**Adições:**
```typescript
// No handler de save:
localStorage.setItem('farm_name', farmName);
window.dispatchEvent(new Event('farm-name-updated'));
```

---

### 7. `app/dashboard/animais/page.tsx`
**O que mudou:** Suporte a múltiplas espécies com categorias dinâmicas
**Linhas modificadas:** ~150
**Mudanças principais:**

```typescript
// Novo: Import species
import { animalSpeciesOptions, getAnimalSpeciesMeta } from '@/lib/animal-species';

// Novo: State de espécie
const [selectedSpecies, setSelectedSpecies] = useState('bovino');

// Novo: Categorias dinâmicas
const speciesData = getAnimalSpeciesMeta(selectedSpecies);
const categories = speciesData?.categories || [];

// Novo: Form com dropdowns dinâmicos
<select value={selectedSpecies} onChange={e => setSelectedSpecies(e.target.value)}>
  {animalSpeciesOptions.map(s => ...)}
</select>

<select value={selectedCategory}>
  {categories.map(c => ...)}
</select>

// Novo: Filtro por espécie
const matchCategoria = 
  filtroCategoria === '' || 
  animal.categoria === filtroCategoria || 
  animal.especie === filtroCategoria;

// Novo: Tabela mostra espécie
<td>{animal.especie || 'Bovino'} · {animal.categoria}</td>
```

---

### 8. `types/index.ts`
**O que mudou:** Tipos expandidos para todas espécies
**Linhas modificadas:** ~30
**Mudanças:**

```typescript
// Novo: Campo especie em Animal
export interface Animal {
  // ... campos existentes
  especie?: string;  // Novo
}

// Expandido: Tipo Categoria
export type Categoria = 
  // Bovinos
  | 'bezerro' | 'novilha' | 'vaca' | 'touro' | 'boi'
  // Equinos (novo)
  | 'potro' | 'cavalo' | 'égua'
  // Ovinos (novo)
  | 'cordeiro' | 'ovelha' | 'carneiro'
  // Caprinos (novo)
  | 'cabrito' | 'cabra' | 'bode'
  // Suínos (novo)
  | 'leitão' | 'porco' | 'porca'
  // Aves (novo)
  | 'frango' | 'galinha' | 'galo'
  // Outro
  | 'outro';
```

---

### 9. `lib/fazenda.ts`
**O que mudou:** Salvar especie ao criar animal
**Linhas modificadas:** ~5
**Mudança:**

```typescript
// No saveAnimalToSupabase():
const animal = {
  ...input,
  especie: input.especie || 'bovino'  // Novo com default
};
```

---

### 10. `database-schema.sql`
**O que mudou:** Schema com nova coluna e categorias expandidas
**Linhas modificadas:** ~20
**Mudanças:**

```sql
-- Adicionado campo
ALTER TABLE animais ADD COLUMN especie TEXT DEFAULT 'bovino';

-- Expandido CHECK constraint
ALTER TABLE animais DROP CONSTRAINT animais_categoria_check;
ALTER TABLE animais ADD CONSTRAINT animais_categoria_check CHECK (
  categoria IN (
    'bezerro', 'novilha', 'vaca', 'touro', 'boi',
    'potro', 'cavalo', 'égua',
    'cordeiro', 'ovelha', 'carneiro',
    'cabrito', 'cabra', 'bode',
    'leitão', 'porco', 'porca',
    'frango', 'galinha', 'galo',
    'outro'
  )
);
```

---

## 📊 Resumo Estatísticas

| Métrica | Valor |
|---------|-------|
| Novos arquivos | 1 |
| Arquivos modificados | 9 |
| Total de mudanças | 10 |
| Linhas adicionadas | ~500 |
| Linhas modificadas | ~300 |
| Linhas removidas | 0 (sem breaking changes) |
| Complexidade ciclomática adicional | Baixa |
| Cobertura de testes necessária | ~60% |

---

## 🗺️ Mapa Visual de Dependências

```
Topbar.tsx
├─ AuthContext (farmName, user)
├─ components/Sidebar.tsx (mobileOpen state)
└─ farm-name-updated event

Sidebar.tsx
├─ dashboard/layout.tsx (mobileOpen, onClose props)
└─ routes (Nav)

dashboard/layout.tsx
├─ Topbar.tsx (onToggleMobileMenu)
├─ Sidebar.tsx (mobileOpen)
└─ Auth (Redirect)

animais/page.tsx
├─ lib/animal-species.ts (species options)
├─ types/index.ts (Animal, Categoria)
├─ lib/fazenda.ts (saveAnimal)
└─ API calls

types/index.ts
├─ Animal interface
└─ Categoria union

lib/animal-species.ts
└─ Standalone (reutilizável no mobile)

lib/fazenda.ts
├─ Supabase
└─ types/index.ts

AuthContext.tsx
├─ Supabase Auth
├─ localStorage
└─ farm-name-updated event
```

---

## 🔄 Ordem de Execução (Deploy)

1. **Database (se em produção):**
   - Executar migration SQL no Supabase
   - Verificar coluna `especie` criada

2. **Code Changes:**
   - Merge de todos os arquivos
   - Build localmente (`npm run build`)

3. **Deploy:**
   - Vercel (rastreio-web)
   - API não precisa mudar (backend já suporta)

4. **Testes:**
   - Testar signup → farm name
   - Testar menu mobile
   - Testar criar animal com espécie

---

## 🔗 Referências Rápidas

**Precisa entender:**
- 🎨 Drawer CSS? → `components/Sidebar.tsx`
- 🐴 Espécies? → `lib/animal-species.ts`
- 💾 Farm name? → `contexts/AuthContext.tsx`
- 📱 Mobile? → DevTools, breakpoint `md:hidden`
- 🗄️ DB? → `database-schema.sql`

**Precisa modificar:**
- Adicionar espécie? → `lib/animal-species.ts` + `types/index.ts`
- Adicionar categoria? → Mesmo acima + `database-schema.sql`
- Mudar farm name label? → `app/dashboard/configuracoes/page.tsx`
- Mudar drawer animation? → `components/Sidebar.tsx` CSS classes

---

## ✅ Checklist de Revisão de Código

- [ ] `lib/animal-species.ts` - Estrutura clara, tipos corretos
- [ ] `components/Topbar.tsx` - Type casting OK, nenhum `any`
- [ ] `components/Sidebar.tsx` - Transform animation smooth, z-index correto
- [ ] `dashboard/layout.tsx` - Responsive classes aplicadas
- [ ] `contexts/AuthContext.tsx` - localStorage + Supabase sincronizados
- [ ] `animais/page.tsx` - Categorias dinâmicas, filtro funciona
- [ ] `types/index.ts` - Nenhum tipo `any`, union explícito
- [ ] `database-schema.sql` - CHECK constraint completo
- [ ] Build passa sem erros (`npm run build`)
- [ ] Sem console warnings em development

---

**Última atualização:** 2024
**Próxima review:** Após QA completo
