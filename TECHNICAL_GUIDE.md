# 🔧 Guia Técnico - Rastreio v2.0

> Para desenvolvedores que precisam manter ou estender as novas funcionalidades

---

## 📦 Arquitetura das Mudanças

### 1. Menu Mobile Drawer

**Componentes envolvidos:**
```
Topbar.tsx
  ├─ mobileMenuOpen (state)
  ├─ onMobileMenuToggle (callback)
  └─ Botão hambúrguer (mobile only)
  
Sidebar.tsx
  ├─ mobileOpen (prop)
  ├─ onClose (callback)
  ├─ Drawer container (mobile)
  ├─ Backdrop (mobile)
  └─ Nav links (shared)

dashboard/layout.tsx
  ├─ mobileSidebarOpen (state)
  ├─ Children (pages)
  └─ Responsive padding
```

**Fluxo de estado:**
```
User clicks hamburger (Topbar)
  ↓
setMobileMenuOpen(true)
  ↓
layout.tsx detecta mudança
  ↓
passa mobileOpen={true} → Sidebar
  ↓
Sidebar exibe drawer com backdrop
  ↓
User clica link ou backdrop
  ↓
Sidebar chama onClose()
  ↓
setMobileMenuOpen(false)
```

**CSS Classes Importantes:**
```css
/* Drawer position e animação */
.drawer {
  position: fixed;
  left: 0;
  top: 0;
  width: 14rem;    /* 224px, mesmo que desktop */
  height: 100vh;
  transform: translateX(-100%);  /* Começar fora */
  transition: transform 300ms ease-in-out;
}

.drawer.open {
  transform: translateX(0);      /* Animar para dentro */
}

/* Backdrop */
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 20;  /* Atrás do drawer (z-30) */
}

/* Mobile-only no desktop */
.hamburger {
  display: none; /* desktop */
}
@media (max-width: 768px) {
  .hamburger {
    display: block; /* mobile */
  }
  .sidebar-desktop {
    display: none;
  }
}
```

---

### 2. Múltiplas Espécies de Animais

**Estrutura de dados:**

```typescript
// lib/animal-species.ts
export interface AnimalSpeciesOption {
  value: string;
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
      // ...
    ]
  },
  {
    value: 'equino',
    label: 'Equino',
    categories: [
      { value: 'potro', label: 'Potro' },
      { value: 'cavalo', label: 'Cavalo' },
      // ...
    ]
  },
  // ...
];
```

**Como adicionar nova espécie:**

1. Editar `lib/animal-species.ts`:
```typescript
{
  value: 'camelino',
  label: 'Camelo',
  categories: [
    { value: 'bezerro_camelo', label: 'Filhote' },
    { value: 'camelo_adulto', label: 'Adulto' },
  ]
}
```

2. Atualizar `types/index.ts` (tipo `Categoria`):
```typescript
export type Categoria = 
  // Bovinos
  | 'bezerro' | 'novilha' | 'vaca' | 'touro' | 'boi'
  // Equinos
  | 'potro' | 'cavalo' | 'égua'
  // ... outras
  // Novos
  | 'bezerro_camelo' | 'camelo_adulto'
  // ...
```

3. Atualizar `database-schema.sql`:
```sql
ALTER TABLE animais 
  DROP CONSTRAINT animais_categoria_check;
ALTER TABLE animais 
  ADD CONSTRAINT animais_categoria_check CHECK (
    categoria IN (
      -- ... existing values
      'bezerro_camelo', 'camelo_adulto'
    )
  );
```

4. Pronto! Form e tabela atualizam automaticamente.

**Helper functions:**

```typescript
// Obter categorias de uma espécie
const especieData = getAnimalSpeciesMeta('equino');
console.log(especieData.categories); // Array de categorias equinas

// Obter label legível
const label = getAnimalCategoryLabel('potro'); // "Potro"
const specieLabel = getAnimalSpeciesLabel('equino'); // "Equino"
```

---

### 3. Nome da Fazenda Persistido

**Pontos de persistência (em ordem de prioridade):**

```
1. localStorage['farm_name']
   ↑
   └─ Recuperado ao iniciar página
   └─ Sincronização rápida entre abas

2. Supabase profiles.farm_name
   ↑
   └─ Source of truth
   └─ Sobrevive logout/login
   └─ Compartilhado entre dispositivos

3. Event farm-name-updated
   ↑
   └─ Dispara sincronização cross-component
   └─ Notifica Topbar, Sidebar etc
```

**Fluxo de atualização:**

```
User muda nome em Configurações
  ↓
handleSaveFarmName()
  ├─ AuthContext.setFarmName(newName)
  │   ├─ Salva em Supabase profiles
  │   └─ Chama persistFarmName()
  │       ├─ localStorage.setItem('farm_name', newName)
  │       └─ dispatchEvent('farm-name-updated')
  │
  └─ Topbar / Sidebar recebem evento
      └─ Re-render com novo nome

```

**Código de sincronização (components):**

```typescript
// Qualquer componente que precisa escutar mudanças
useEffect(() => {
  const handleFarmNameUpdated = () => {
    const newName = localStorage.getItem('farm_name') || '';
    setFarmName(newName);
  };

  window.addEventListener('farm-name-updated', handleFarmNameUpdated);
  return () => window.removeEventListener('farm-name-updated', handleFarmNameUpdated);
}, []);
```

**Onde persistir nome ao integrar novos flows:**

- ✅ Signup: `app/login/page.tsx` linha ~170
- ✅ Settings: `app/dashboard/configuracoes/page.tsx` linha ~120
- ✅ AuthContext: `contexts/AuthContext.tsx` método `persistFarmName()`
- ✅ Topbar: `components/Topbar.tsx` (listener de evento)

---

## 🗄️ Migrações de Banco Dados

### Adicionar nova coluna `especie`

```sql
-- Deploy como migration nova
-- migrations/004_add_animal_species.sql

ALTER TABLE animais ADD COLUMN IF NOT EXISTS especie TEXT DEFAULT 'bovino';

ALTER TABLE animais 
  DROP CONSTRAINT IF EXISTS animais_categoria_check;

ALTER TABLE animais 
  ADD CONSTRAINT animais_categoria_check CHECK (
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

-- Opcional: backfill animais existentes
UPDATE animais SET especie = 'bovino' 
  WHERE especie IS NULL 
    AND categoria IN ('bezerro', 'novilha', 'vaca', 'touro', 'boi');
```

### Atualizar RLS policies (se necessário)

```sql
-- A política existente já funciona, pois filtra por fazenda_id
-- Nenhuma mudança necessária para especie
-- RLS continua: cada usuário vê só animais da sua fazenda

CREATE POLICY "rls_animais_update" ON animais
  FOR UPDATE
  USING (fazenda_id IN (
    SELECT id FROM fazendas WHERE owner_id = auth.uid()
  ));

-- Nota: especie não afeta isolamento, só agricultural classification
```

---

## 🚨 Pontos de Atenção

### Type Safety

❌ NUNCA fazer:
```typescript
const initial = displayName[0]?.toUpperCase();
// ❌ displayName pode ser Record<string, unknown>
```

✅ SEMPRE fazer:
```typescript
const displayName = (user?.user_metadata?.full_name as string | undefined) || 'Padrão';
const initial = typeof displayName === 'string' ? displayName[0] : '?';
```

### Mobile Drawer Performance

⚠️ Não adicione animações extras no drawer:
```css
/* ✅ BOM: transform é GPU-accelerated */
transform: translateX(-100%);
transition: transform 300ms;

/* ❌ RUIM: left/width causam reflow */
left: -100%;
transition: left 300ms;
```

### Espécie Default

⚠️ Ao criar animal sem espécie explícita:
```typescript
// ✅ CORRETO
const animal = {
  ...input,
  especie: input.especie || 'bovino'  // Default para compatibilidade
};

// ❌ ERRADO
const animal = {
  ...input
  // especie fica NULL, viola CHECK constraint
};
```

---

## 🔍 Debugging

### Verificar localStorage

```javascript
// Console do navegador
localStorage.getItem('farm_name')  // "Fazenda A"
localStorage.getItem('auth.user')  // User JSON
```

### Inspecionar evento farm-name-updated

```typescript
// Anywhere in console
window.addEventListener('farm-name-updated', () => {
  console.log('Farm name updated!');
});
```

### Type checking sem build

```bash
cd rastreio-web
npx tsc --noEmit  # Verifica sem compilar
```

### Erros comuns

| Erro | Causa | Solução |
|------|-------|---------|
| `Property does not exist on type '{}'` | Record<string,unknown> não tipado | Use `as string \| undefined` |
| `Cannot read property of undefined` | farmName não carregou | Adicione loading state |
| `Categoria não aparece no select` | Espécie não teve categorias | Verificar `animal-species.ts` |
| `localStorage key not syncing` | Evento não disparado | Verificar `dispatchEvent()` |

---

## 📚 Arquivos de Referência Rápida

| Arquivo | Responsabilidade |
|---------|------------------|
| `lib/animal-species.ts` | Catálogo de espécies/categorias |
| `types/index.ts` | Tipos TypeScript Animal, Categoria |
| `contexts/AuthContext.tsx` | Farm name state + persistence |
| `components/Topbar.tsx` | Menu toggle + farm name display |
| `components/Sidebar.tsx` | Drawer mobile + nav |
| `app/dashboard/layout.tsx` | Layout responsivo + drawer state |
| `app/dashboard/animais/page.tsx` | Form dinâmico + tabela com filtro |
| `app/dashboard/configuracoes/page.tsx` | Edição farm name |
| `app/login/page.tsx` | Signup com farm name |
| `lib/fazenda.ts` | Save animal com especie |
| `database-schema.sql` | Schema com especie + categoria |

---

## 🚀 Deploy Checklist

- [ ] Migrations de banco executadas (especie, categoria)
- [ ] Variáveis de ambiente revisadas
- [ ] Build local passa sem erros (`npm run build`)
- [ ] Testes manuais em mobile + desktop
- [ ] RLS policies não quebradas
- [ ] localStorage não tem data stale
- [ ] Backwards compatibility: bovinos antigos funcionam
- [ ] Cross-tab sync testado
- [ ] Logout/login recupera farm name
- [ ] Drawer animation smooth (60fps)

---

## 📞 Troubleshooting

**"O drawer não abre em mobile"**
```
1. Verificar: media query md:hidden em Topbar
2. DevTools > 480px viewport
3. Botão deve aparecer
4. onClick deve chamar onToggleMobileMenu()
5. layout.tsx deve ter mobileSidebarOpen={true}
```

**"Categoria não muda quando seleciono espécie"**
```
1. Verificar animal-species.ts tem a espécie
2. Verificar form usa getAnimalSpeciesMeta(selectedSpecies)
3. Verificar estado de selectedSpecies atualiza antes de renderizar categories
4. Adicionar console.log(selectedSpecies) para debugar
```

**"Farm name não sincroniza entre abas"**
```
1. Verificar localStorage.setItem('farm_name', ...) foi chamado
2. Verificar dispatchEvent('farm-name-updated') foi chamado
3. Abrir Console > localStorage → ver farm_name
4. Testar manualmente: abrir 2 abas, mudar nome em 1, ver 2
```

---

**Last Updated:** 2024
**Maintainers:** Tim (Fullstack), Ana (Mobile sync)
