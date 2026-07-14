# 📱 Integração Mobile - Rastreio v2.0

> Instruções para sincronizar mudanças web com o React Native app

---

## 📋 O que Mudou no Web

1. **Menu hamburger** → Drawer mobile (<768px)
2. **7 espécies** → Categorias dinâmicas
3. **Farm name** → Persistência sincronizada

---

## 🔄 Sincronização com `rastreio-mobile`

### 1. Espécies de Animais

**Arquivo a sincronizar:**
- Web: `rastreio-web/lib/animal-species.ts`
- Mobile: `rastreio-mobile/lib/animal-species.ts` (criar se não existir)

**Ação necessária:**

```bash
# Na pasta rastreio-mobile/
# Copie o conteúdo de lib/animal-species.ts do web para cá
cp ../rastreio-web/lib/animal-species.ts ./lib/animal-species.ts

# Ou replique manualmente em:
# rastreio-mobile/src/types/species.ts (ou local equivalente)
```

**TypeScript Types:**

```typescript
// rastreio-mobile/types/index.ts
// Adicione campo especie e categorias expandidas

export interface Animal {
  id: string;
  fazenda_id: string;
  brinco: string;
  raca?: string;
  sexo?: Sexo;
  data_nascimento?: string;
  peso_atual?: number;
  lote?: string;
  pasto?: string;
  categoria?: Categoria;
  especie?: string;  // 👈 NOVO
  foto_url?: string;
  ativo: boolean;
  updated_at: string;
  synced?: 0 | 1;
}

export type Categoria = 
  // Bovinos
  | 'bezerro' | 'novilha' | 'vaca' | 'touro' | 'boi'
  // Equinos
  | 'potro' | 'cavalo' | 'égua'
  // Ovinos
  | 'cordeiro' | 'ovelha' | 'carneiro'
  // Caprinos
  | 'cabrito' | 'cabra' | 'bode'
  // Suínos
  | 'leitão' | 'porco' | 'porca'
  // Aves
  | 'frango' | 'galinha' | 'galo'
  // Outro
  | 'outro';
```

### 2. Banco de Dados Offline (SQLite)

**Schema SQLite:**

```sql
-- rastreio-mobile/database/schema.ts
-- Adicionar coluna especie

ALTER TABLE animais ADD COLUMN especie TEXT DEFAULT 'bovino';

-- Também update o INSERT statement:
CREATE TABLE animais (
  id TEXT PRIMARY KEY,
  fazenda_id TEXT NOT NULL,
  brinco TEXT NOT NULL,
  raca TEXT,
  sexo TEXT,
  data_nascimento TEXT,
  peso_atual REAL,
  lote TEXT,
  pasto TEXT,
  categoria TEXT,
  especie TEXT DEFAULT 'bovino',  -- 👈 NOVO
  foto_url TEXT,
  ativo INTEGER DEFAULT 1,
  synced INTEGER DEFAULT 0,
  updated_at TEXT,
  UNIQUE(fazenda_id, brinco)
);
```

**Como aplicar:**

```typescript
// rastreio-mobile/database/schema.ts
export async function initDatabase(db: SQLiteDatabase) {
  try {
    // Tables existentes...
    
    // Verificar se coluna existe
    const result = await db.execAsync(
      'PRAGMA table_info(animais);'
    );
    
    const hasEspecie = result.some(col => col.name === 'especie');
    
    if (!hasEspecie) {
      await db.execAsync(
        'ALTER TABLE animais ADD COLUMN especie TEXT DEFAULT "bovino";'
      );
      console.log('✓ Coluna especie adicionada');
    }
  } catch (err) {
    console.error('Database init error:', err);
  }
}
```

### 3. Form de Criação de Animal

**Adicionar selector de espécie:**

```typescript
// rastreio-mobile/app/(tabs)/cadastro.tsx

import { animalSpeciesOptions } from '@/lib/animal-species';

export function CadastroScreen() {
  const [selectedSpecies, setSelectedSpecies] = useState('bovino');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Obter categorias da espécie selecionada
  const speciesData = animalSpeciesOptions.find(s => s.value === selectedSpecies);
  const categories = speciesData?.categories || [];

  return (
    <ScrollView>
      {/* Input Brinco */}
      <Input
        label="Brinco"
        value={brinco}
        onChangeText={setBrinco}
      />

      {/* Novo: Selector Espécie */}
      <Picker
        label="Espécie"
        selectedValue={selectedSpecies}
        onValueChange={(value) => {
          setSelectedSpecies(value);
          setSelectedCategory(''); // Reset categoria
        }}
        items={animalSpeciesOptions.map(s => ({
          label: s.label,
          value: s.value
        }))}
      />

      {/* Categoria (dinâmica) */}
      <Picker
        label="Categoria"
        selectedValue={selectedCategory}
        onValueChange={setSelectedCategory}
        items={categories.map(c => ({
          label: c.label,
          value: c.value
        }))}
      />

      {/* Inputs existentes... */}
      
      <Button
        label="Salvar"
        onPress={() => saveAnimal({
          brinco,
          especie: selectedSpecies,  // 👈 NOVO
          categoria: selectedCategory,
          // ... outros campos
        })}
      />
    </ScrollView>
  );
}
```

### 4. Lista de Animais (AnimalCard)

**Atualizar card para mostrar espécie:**

```typescript
// rastreio-mobile/components/AnimalCard.tsx

import { getAnimalSpeciesLabel, getAnimalCategoryLabel } from '@/lib/animal-species';

export function AnimalCard({ animal }: { animal: Animal }) {
  const specieLabel = getAnimalSpeciesLabel(animal.especie || 'bovino');
  const categoryLabel = getAnimalCategoryLabel(animal.categoria);

  return (
    <Card>
      <View style={{ flex: 1 }}>
        <Text style={styles.brinco}>Brinco {animal.brinco}</Text>
        
        {/* Mostrar espécie e categoria */}
        <Text style={styles.info}>
          {specieLabel} · {categoryLabel}
        </Text>
        
        {/* Badges */}
        <View style={styles.badges}>
          <Badge label={specieLabel} variant="info" />
          <Badge label={categoryLabel} variant="success" />
          {animal.peso_atual && (
            <Badge label={`${animal.peso_atual} kg`} variant="neutral" />
          )}
        </View>
      </View>
    </Card>
  );
}
```

### 5. Sincronização (Push/Pull)

**Atualizar payload de sync:**

```typescript
// rastreio-mobile/database/sync.ts

export interface SyncPayload {
  fazenda_id: string;
  animais: Array<{
    id: string;
    brinco: string;
    especie?: string;        // 👈 NOVO
    categoria?: string;
    // ... outros campos
  }>;
  vacinacoes: Vacinacao[];
  pesagens: Pesagem[];
}

// Ao montar payload:
const animaisToSync = animals.map(a => ({
  ...a,
  especie: a.especie || 'bovino'  // Garantir default
}));
```

**Receber mudanças do servidor:**

```typescript
// Ao fazer GET /api/sync/pull
const remoteAnimals = response.data.animais;

for (const animal of remoteAnimals) {
  await db.runAsync(
    `INSERT OR REPLACE INTO animais 
     (id, brinco, especie, categoria, ...)
     VALUES (?, ?, ?, ?, ...)`,
    [animal.id, animal.brinco, animal.especie || 'bovino', animal.categoria, ...]
  );
}
```

### 6. Menu Drawer (Se aplicável ao React Native)

**Para React Native com Expo Router:**

```typescript
// rastreio-mobile/components/Drawer.tsx
// Usar expo-router drawer ou react-native-drawer

import { useDrawerStatus } from '@react-navigation/drawer';

export function CustomDrawer({ state, navigation }) {
  const isDrawerOpen = useDrawerStatus() === 'open';
  
  return (
    <View style={{
      transform: [{ 
        translateX: isDrawerOpen ? 0 : -224 
      }],
      transition: 'all 300ms ease-in-out'
    }}>
      {/* Nav items */}
    </View>
  );
}
```

Ou usar `expo-router` tab layout nativo (mais simples).

---

## 🗂️ Checklist de Integração Mobile

### Fase 1: Tipos e Schema
- [ ] Copiar `lib/animal-species.ts` para mobile
- [ ] Adicionar `especie?: string` a Animal interface
- [ ] Expandir tipo `Categoria` com todas espécies
- [ ] Adicionar coluna `especie` ao schema SQLite
- [ ] Testar migration SQLite (criar novo app)

### Fase 2: UI Componentes
- [ ] Atualizar form cadastro com selector espécie
- [ ] Adicionar categorias dinâmicas no form
- [ ] Mostrar espécie + categoria no AnimalCard
- [ ] Adicionar badge visual para espécie

### Fase 3: Sincronização
- [ ] Incluir `especie` no SyncPayload
- [ ] Atualizar push (enviar especie)
- [ ] Atualizar pull (receber e salvar especie)
- [ ] Testar sync offline/online

### Fase 4: Testes
- [ ] Criar animal bovino → verificar default
- [ ] Criar animal equino → ver categorias equinas
- [ ] Editar espécie → categorias atualizam
- [ ] Sincronizar → dados chegam ao web
- [ ] Offline → especie não desaparece

### Fase 5: Farm Name (Se aplicável)
- [ ] Adicionar farm_name ao profile local (AsyncStorage)
- [ ] Exibir no header mobile
- [ ] Sincronizar com server
- [ ] Cross-app persistence

---

## 🔗 Integração Backend

**Nenhuma mudança necessária no backend se:**
- ✅ Já retorna `especie` em animal objects
- ✅ Já aceita `especie` no POST /animals
- ✅ RLS policies funcionam igual

**Se backend ainda não tem:**

```typescript
// rastreio-api/routes/animais.ts

app.post('/api/animais', async (req, res) => {
  const { brinco, categoria, especie = 'bovino', ... } = req.body;
  
  const { data, error } = await supabase
    .from('animais')
    .insert({
      brinco,
      categoria,
      especie,  // 👈 NOVO
      fazenda_id: user.fazenda_id,
      ...
    });
});

app.get('/api/sync/pull', async (req, res) => {
  // Retorna animais com especie
  const { data } = await supabase
    .from('animais')
    .select('*, especie')  // 👈 NOVO
    .eq('fazenda_id', user.fazenda_id);
});
```

---

## 📊 Estrutura Comparativa

| Aspecto | Web | Mobile |
|---------|-----|--------|
| **Menu** | Drawer CSS | Expo Router / native drawer |
| **Espécies** | `lib/animal-species.ts` | `lib/animal-species.ts` (sync) |
| **Tipos** | `types/index.ts` | `types/index.ts` |
| **Database** | Supabase | SQLite (local) |
| **Farm Name** | localStorage + Supabase | AsyncStorage + SQLite |
| **Sync** | Real-time (sub) | Manual (push/pull) |

---

## 🚀 Rollout Timeline

**Sprint 1 (Web - concluído):**
- ✅ Menu mobile
- ✅ 7 espécies
- ✅ Farm name

**Sprint 2 (Mobile - proposto):**
- [ ] Copiar tipos/species
- [ ] Schema update SQLite
- [ ] UI com selectors dinâmicos
- [ ] Testes end-to-end

**Sprint 3 (Backend - se necessário):**
- [ ] Validar POST com especie
- [ ] Validar GET retorna especie
- [ ] RLS + especie (edge cases)

---

## 📞 Dúvidas Comuns

**P: Preciso quebrar compatibilidade com animais bovinos antigos?**
R: Não. Default `especie='bovino'` mantém tudo funcionando.

**P: E se o usuário tiver app mobile desatualizado?**
R: Backend retorna especie. App mobile trata null como 'bovino'.

**P: Como testar sem o backend pronto?**
R: Use dados mockados com especie field já preenchido.

**P: Preciso mudar o banco local entre versões?**
R: Sim, migration SQLite. Use PRAGMA e ALTER TABLE.

---

**Última Atualização:** 2024
**Próximo Review:** Após Sprint 2 mobile
