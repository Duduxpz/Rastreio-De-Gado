# 📋 Plano de Testes - Rastreio

> Instruções para validar as 3 implementações (menu mobile, múltiplas espécies, nome fazenda)

---

## 🧪 Testes Manuais Recomendados

### 1️⃣ MENU MOBILE HAMBURGER

#### 🖥️ Desktop (>768px)
```
✓ Sidebar visível fixo à esquerda
✓ Topbar sem botão hamburger
✓ Links de navegação funcionam
✓ Layout sem overflow
```

#### 📱 Mobile (<768px)
```
✓ Sidebar ocultado (display: none)
✓ Botão hambúrguer visível no Topbar
✓ Clicar abre drawer com animação suave (300ms)
✓ Drawer tem backdrop semi-transparente
✓ Clicar no backdrop fecha drawer
✓ Clicar em link de navegação fecha drawer
✓ Ícone muda de Menu → X quando drawer aberto
✓ Drawer não tem scroll horizontal
```

**Breakpoints para testar:**
- `360px` (Samsung Galaxy S8)
- `375px` (iPhone SE)
- `390px` (iPhone 13)
- `414px` (iPhone 11)
- `428px` (iPhone 14 Max)
- `768px` (iPad mini - transição desktop/mobile)

**Como testar:**
```bash
# DevTools Chrome/Firefox
F12 → Toggle Device Toolbar (Ctrl+Shift+M)
→ Select device ou custom size
```

---

### 2️⃣ MÚLTIPLAS ESPÉCIES

#### 📝 Criar Animal Bovino (legado)
```
1. Dashboard > Animais > Novo Animal
2. Preencher: Brinco "001", Sexo "M"
3. Espécie: deixar vazio ou selecionar "Bovino" (default)
4. Categoria: deve mostrar [bezerro, novilha, vaca, touro, boi]
5. Selecionar "vaca"
6. Salvar
✓ Animal criado com especie='bovino', categoria='vaca'
✓ Aparece na tabela com rótulo "Bovino" e "Vaca"
```

#### 🐴 Criar Animal Equino (novo)
```
1. Dashboard > Animais > Novo Animal
2. Preencher: Brinco "HORSE-001", Sexo "F"
3. Espécie: selecionar "Equino"
4. Categoria: deve ATUALIZAR para [potro, cavalo, égua]
   (não deve mostrar categorias bovinas)
5. Selecionar "égua"
6. Salvar
✓ Animal criado com especie='equino', categoria='égua'
✓ Aparece na tabela com rótulo "Equino" e "Égua"
```

#### 🐑 Criar Animal Ovino (novo)
```
1. Novo Animal
2. Espécie: "Ovino" 
3. Categoria: deve mostrar [cordeiro, ovelha, carneiro]
4. Selecionar "ovelha"
5. Salvar
✓ Rótulo na tabela: "Ovino" "Ovelha"
```

#### 🐔 Criar Animal Ave (novo)
```
1. Novo Animal
2. Espécie: "Ave"
3. Categoria: deve mostrar [frango, galinha, galo]
4. Selecionar "galinha"
5. Salvar
✓ Rótulo na tabela: "Ave" "Galinha"
```

#### 🔄 Mudar Espécie Dinamicamente
```
1. Novo Animal - não preencher
2. Selecionar Espécie: "Bovino"
3. Aguardar 200ms - Categoria deve atualizar
✓ Opções bovinas aparecem
4. Mudar Espécie: "Equino"
✓ Opções bovinas sumirem, aparecem equinas
5. Mudar Espécie: "Outro"
✓ Categoria fica vazia (sem categorias predefinidas para "outro")
```

#### 📊 Filtrar por Espécie
```
1. Dashboard > Animais (com múltiplas espécies criadas)
2. Filtro: selecionar "Bovino"
✓ Aparecem apenas animais bovinos
3. Filtro: selecionar "Equino"
✓ Aparecem apenas equinos
4. Filtro: deixar vazio
✓ Aparecem todas as espécies
```

#### 🗂️ Ver Detalhe de Animal com Espécie
```
1. Dashboard > Animais
2. Clicar em animal (ex: equino "égua")
3. Abrir página de detalhe [id]
✓ Página mostra espécie "Equino" e categoria "Égua"
✓ Edições mantêm a espécie
```

---

### 3️⃣ NOME DA FAZENDA PERSISTIDO

#### ✍️ Signup + Nome Fazenda
```
1. Ir para /login
2. Clicar "Criar Conta"
3. Preencher:
   - Email: seu_email@test.com
   - Senha: SupaDupaSenha123
   - Nome Completo: João Silva
   - Nome da Fazenda: Fazenda do Meu Avó
4. Clicar "Criar Conta"
5. Aguardar autenticação
✓ Redirecta para /dashboard
✓ Topbar mostra "Fazenda do Meu Avó" ao lado de "Rastreio |"
✓ localStorage tem farm_name = "Fazenda do Meu Avó"
```

#### 🔄 Refresh - Nome Persiste
```
1. Após signup com nome "Fazenda do Meu Avó"
2. Pressionar F5 ou Ctrl+R (refresh)
3. Aguardar carregamento
✓ Topbar ainda mostra "Fazenda do Meu Avó"
✓ Nenhum carregamento de "Minha Fazenda"
```

#### ⚙️ Editar em Configurações
```
1. Dashboard > Configurações
2. Campo "Nome da Fazenda" mostra nome atual
3. Mudar para "Fazenda Nova Graça"
4. Clicar "Salvar Configurações"
✓ Toast sucesso aparece
5. Voltar ao Dashboard (ou ir para outra página)
✓ Topbar mostra "Fazenda Nova Graça"
6. Refresh (F5)
✓ Nome ainda é "Fazenda Nova Graça"
```

#### 🔗 Cross-Page Sync
```
1. Abrir Dashboard em abas múltiplas
   - Aba 1: /dashboard
   - Aba 2: /dashboard/animais
2. Em Aba 1: ir para Configurações
3. Mudar nome para "Fazenda Atualizada"
4. Salvar
5. Voltar para Aba 2 (animais)
✓ Topbar em Aba 2 mostra "Fazenda Atualizada" imediatamente
(sem refresh necessário)
```

#### 🌐 Cross-Tab Sync (Advanced)
```
1. Abrir /login em janela 1
2. Fazer signup com "Fazenda A"
3. Dashboard carrega - Topbar mostra "Fazenda A"
4. Abrir /dashboard em janela 2 (outra aba)
5. Em janela 1: ir para Configurações
6. Mudar nome para "Fazenda B"
7. Salvar
8. Ir para janela 2 (outra aba/janela)
✓ Topbar em janela 2 mostra "Fazenda B" 
   (EventListener farm-name-updated dispara)
```

#### ✅ Verificações Adicionais
```
☑ localStorage tem chave 'farm_name'
☑ Supabase profiles.farm_name atualizado
☑ Logout + novo login recupera nome de profiles
☑ Múltiplas fazendas (múltiplos usuários) isoladas por RLS
```

---

## 🔗 Teste de Integração: Fluxo Completo

### Cenário: Novo Fazendeiro

```
1. Signup com:
   - Email: joao@fazenda.com
   - Nome: João Silva  
   - Fazenda: Fazenda Santa Rita

2. Dashboard carrega
   ✓ Topbar: "Rastreio | Fazenda Santa Rita"
   ✓ Menu lateral visível (desktop)

3. Ir para Animais
   ✓ Lista vazia (primeira vez)

4. Novo Animal
   ✓ Espécie: Bovino (default)
   ✓ Categoria: mostra bovinas
   ✓ Preencher: Brinco "001", Categoria "vaca"
   ✓ Salvar

5. Tabela mostra:
   ✓ Brinco "001" 
   ✓ Rótulos: "Bovino" "Vaca"

6. Novo Animal (Equino)
   ✓ Espécie: Equino
   ✓ Categoria: mostra equinas
   ✓ Preencher: Brinco "HORSE-01", Categoria "égua"
   ✓ Salvar

7. Tabela mostra:
   ✓ Dois animais: 1 bovino, 1 equino
   ✓ Filtro "Bovino" mostra só o primeiro
   ✓ Filtro "Equino" mostra só o segundo

8. Configurações
   ✓ Nome: "Fazenda Santa Rita"
   ✓ Mudar para "Fazenda Atualizada"
   ✓ Salvar

9. Dashboard
   ✓ Topbar: "Rastreio | Fazenda Atualizada"

10. Logout
    ✓ Redireciona /login
    ✓ Sessão limpa

11. Login novamente
    ✓ Email/Senha
    ✓ Dashboard carrega
    ✓ Topbar: "Fazenda Atualizada"
    ✓ Animais existem (bovino + equino)

✅ SUCESSO: Tudo integrado!
```

---

## 🐛 Casos de Erro Esperados

### Esperado: Sem erros console
```bash
# DevTools > Console
✓ Sem erros vermelhos
✓ Sem warnings de React
✓ Sem erros de TypeScript
```

### Esperado: RLS Isolamento
```
1. Criar 2 contas:
   - Conta A: Fazenda A com animal bovino
   - Conta B: Fazenda B com animal equino

2. Login com Conta A
   ✓ Vê só animal bovino da Fazenda A
   ✗ NÃO vê animal de Conta B

3. Login com Conta B
   ✓ Vê só animal equino da Fazenda B
   ✗ NÃO vê animal de Conta A
```

---

## 📊 Checklist Final

- [ ] Menu hamburger funciona em <768px
- [ ] Sidebar desktop funciona em >768px
- [ ] Animais bovinos criados com categoria bovinas
- [ ] Animais equinos criados com categoria equinas
- [ ] Categorias dinâmicas no form
- [ ] Filtro por espécie funciona
- [ ] Nome fazenda persiste após signup
- [ ] Nome fazenda sincroniza entre páginas
- [ ] Nome fazenda syncroniza entre abas
- [ ] Nome fazenda persiste após refresh
- [ ] Nome editável em Configurações
- [ ] Build sem erros
- [ ] Sem regressões em autenticação
- [ ] Sem regressões em CRUD de animais
- [ ] RLS mantido (isolamento por fazenda)

---

**Total: ~40 casos de teste**
**Tempo estimado: 30-45 minutos**
**Ambiente: Chrome DevTools + mobile emulation**
