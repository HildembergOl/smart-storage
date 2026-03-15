# PROMPT — Google Antigravity: Smart Storage Web Application

## Autorização de Design de Referência (Google Stitch)

Utilize os screens do projeto Stitch abaixo como referência visual e base de código para toda a interface:

- **Project ID:** `8450904719096190928`
- **Stitch URL Base:** `https://stitch.withgoogle.com/projects/8450904719096190928`

| Tela | Screen ID |
|------|-----------|
| Login / Cadastro | `17ec52c04df949639b34436733fae669` |
| Dashboard Home | `634ffce7b50c46a8a58ee6fcb6b7941d` |
| Gestão de Empresas | `d773f630f35a45f09f2cdced9f2afdc9` |
| Gestão de Produtos | `1acc0a32349b4e0fad26cb24af44ed9f` |
| Gestão de Pessoas | `a5222f339ddd42ec80c08fb33bc40c4d` |
| Consulta de Estoques | `98bb014263fe4898b7d601209b69179b` |
| Entradas e Saídas | `1a63d414dc8744f69beb84a8af575f5e` |

Para recuperar imagens e código de cada tela, use:
```bash
curl -L "https://stitch.withgoogle.com/projects/8450904719096190928/screens/<SCREEN_ID>"
```

---

## 1. Visão Geral do Projeto

**Nome:** Smart Storage
**Descrição:** Aplicação web moderna de controle de armazenagem de produtos e itens pessoais, voltada para pequenas, médias e grandes empresas. Suporta multitenancy (múltiplas empresas no mesmo sistema).

---

## 2. Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend + Backend | **Next.js 14+ (App Router)** |
| Estilização | **TailwindCSS** |
| Componentes UI | **shadcn/ui** |
| ORM / Banco | **Prisma** + **Supabase (PostgreSQL)** |
| Autenticação | **Supabase Auth** |
| Upload de Arquivos | **Supabase Storage** |
| Validação | **Zod** |
| Estado/Forms | **React Hook Form** |
| Ícones | **Lucide React** |

---

## 3. Estrutura de Pastas (Next.js App Router)

```
smart-storage/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx               ← Layout com Sidebar + Header
│   │   ├── page.tsx                 ← Dashboard Home
│   │   ├── empresas/
│   │   │   ├── page.tsx             ← Listagem
│   │   │   └── [id]/page.tsx        ← Cadastro/Edição
│   │   ├── produtos/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── pessoas/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── estoques/page.tsx
│   │   ├── entradas/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── saidas/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── financeiro/
│   │   │   ├── pagar/page.tsx
│   │   │   └── receber/page.tsx
│   └── api/
│       ├── empresas/route.ts
│       ├── produtos/route.ts
│       ├── pessoas/route.ts
│       ├── estoques/route.ts
│       ├── entradas/route.ts
│       ├── saidas/route.ts
│       └── financeiro/route.ts
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Breadcrumb.tsx
│   ├── ui/                          ← shadcn/ui components
│   └── shared/
│       ├── DataTable.tsx
│       ├── FilterBar.tsx
│       └── FormTabs.tsx
├── lib/
│   ├── prisma.ts
│   └── supabase.ts
├── prisma/
│   └── schema.prisma
└── types/
    └── index.ts
```

---

## 4. Schema Prisma (Banco de Dados)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Empresa {
  id               String    @id @default(cuid())
  codigo           String    @unique
  codigoPublico    String    @unique
  situacao         String    @default("Ativo")
  tipoEmpresa      String    // "Fisica" | "Juridica"
  razaoSocial      String
  nomeFantasia     String?
  cnpjCpf          String    @unique
  inscricaoEstadual String?
  endereco         String?
  numero           String?
  complemento      String?
  bairro           String?
  cidade           String?
  estado           String?
  observacoes      String?
  email            String?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  estoques   Estoque[]
  setores    Setor[]
  posicoes   Posicao[]
  produtos   Produto[]
  pessoas    Pessoa[]
  entradas   Entrada[]
  saidas     Saida[]
  contasPagar    ContaPagar[]
  contasReceber  ContaReceber[]
}

model Estoque {
  id            String   @id @default(cuid())
  codigo        String
  codigoPublico String
  descricao     String
  situacao      String   @default("Ativo")
  empresaId     String
  locatarioId   String?

  empresa   Empresa  @relation(fields: [empresaId], references: [id])
  locatario Pessoa?  @relation(fields: [locatarioId], references: [id])
  posicoes  Posicao[]
  produtoEstoques ProdutoEstoque[]
  entradas  Entrada[]
  saidas    Saida[]
}

model Setor {
  id        String  @id @default(cuid())
  codigo    String
  descricao String
  empresaId String

  empresa  Empresa  @relation(fields: [empresaId], references: [id])
  posicoes Posicao[]
}

model Posicao {
  id        String  @id @default(cuid())
  codigo    String
  estoqueId String
  setorId   String
  rua       String?
  bloco     String?
  andar     String?
  locacao   String?
  empresaId String

  empresa Empresa @relation(fields: [empresaId], references: [id])
  estoque Estoque @relation(fields: [estoqueId], references: [id])
  setor   Setor   @relation(fields: [setorId], references: [id])
  produtoPosicoes ProdutoPosicao[]
}

model Produto {
  id              String  @id @default(cuid())
  codigo          String
  descricao       String
  unidadeMedida   String
  marca           String?
  categoria       String?
  grupo           String?
  subgrupo        String?
  tipoProduto     String  // "Produto" | "Servico"
  tipoControle    String  // "Padrao" | "Lote" | "Validade" | "Grade" | "NumeroSerie"
  imagemCapa      String?
  situacao        String  @default("Ativo")
  empresaId       String

  empresa         Empresa  @relation(fields: [empresaId], references: [id])
  embalagens      Embalagem[]
  produtoEstoques ProdutoEstoque[]
  produtoPosicoes ProdutoPosicao[]
  itensEntrada    ItemEntrada[]
  itensSaida      ItemSaida[]
  imagensMarketplace ImagemMarketplace[]
}

model Embalagem {
  id            String  @id @default(cuid())
  codigo        String
  situacao      String  @default("Ativo")
  unidadeMedida String
  codigoBarras  String?
  fator         Float   @default(1)
  altura        Float?
  largura       Float?
  comprimento   Float?
  cubagem       Float?
  pesoBruto     Float?
  pesoLiquido   Float?
  produtoId     String

  produto Produto @relation(fields: [produtoId], references: [id])
}

model ProdutoEstoque {
  id          String  @id @default(cuid())
  produtoId   String
  estoqueId   String
  precoCusto  Float   @default(0)
  ativo       Boolean @default(true)
  quantidade  Float   @default(0)

  produto Produto @relation(fields: [produtoId], references: [id])
  estoque Estoque @relation(fields: [estoqueId], references: [id])
}

model ProdutoPosicao {
  id          String  @id @default(cuid())
  produtoId   String
  posicaoId   String
  quantidade  Float   @default(0)
  lote        String?
  validade    DateTime?
  grade       String?
  numeroSerie String?

  produto Produto @relation(fields: [produtoId], references: [id])
  posicao Posicao @relation(fields: [posicaoId], references: [id])
}

model ImagemMarketplace {
  id        String @id @default(cuid())
  produtoId String
  url       String
  estoqueId String?

  produto Produto @relation(fields: [produtoId], references: [id])
}

model Pessoa {
  id                String  @id @default(cuid())
  codigo            String
  tipoPessoa        String  // "Fisica" | "Juridica"
  razaoSocial       String
  nomeFantasia      String?
  cnpjCpf           String
  inscricaoEstadual String?
  endereco          String?
  numero            String?
  complemento       String?
  bairro            String?
  cidade            String?
  estado            String?
  observacoes       String?
  email             String?
  isCliente         Boolean @default(false)
  isFornecedor      Boolean @default(false)
  isFuncionario     Boolean @default(false)
  isLocatario       Boolean @default(false)
  isVeiculo         Boolean @default(false)
  empresaId         String

  empresa       Empresa  @relation(fields: [empresaId], references: [id])
  estoques      Estoque[]
  entradas      Entrada[]
  saidas        Saida[]
  contasPagar   ContaPagar[]
  contasReceber ContaReceber[]
}

model Entrada {
  id            String  @id @default(cuid())
  codigo        String
  estoqueId     String
  pessoaId      String
  numero        String
  tipo          String  // "NF-e" | "CF-e" | "Manual"
  chaveNfe      String?
  totalProduto  Float   @default(0)
  totalNfe      Float   @default(0)
  observacoes   String?
  empresaId     String
  createdAt     DateTime @default(now())

  empresa  Empresa      @relation(fields: [empresaId], references: [id])
  estoque  Estoque      @relation(fields: [estoqueId], references: [id])
  pessoa   Pessoa       @relation(fields: [pessoaId], references: [id])
  itens    ItemEntrada[]
  faturas  FaturaEntrada[]
  anexos   AnexoEntrada[]
}

model ItemEntrada {
  id          String  @id @default(cuid())
  entradaId   String
  produtoId   String
  quantidade  Float
  valorUnit   Float

  entrada Entrada @relation(fields: [entradaId], references: [id])
  produto Produto @relation(fields: [produtoId], references: [id])
}

model FaturaEntrada {
  id             String   @id @default(cuid())
  entradaId      String
  codigo         String
  formaPagamento String
  numero         String
  vencimento     DateTime
  valor          Float

  entrada Entrada @relation(fields: [entradaId], references: [id])
}

model AnexoEntrada {
  id        String @id @default(cuid())
  entradaId String
  url       String
  descricao String?

  entrada Entrada @relation(fields: [entradaId], references: [id])
}

model Saida {
  id           String  @id @default(cuid())
  codigo       String
  estoqueId    String
  pessoaId     String
  numero       String
  tipo         String
  chaveNfe     String?
  totalProduto Float   @default(0)
  totalNfe     Float   @default(0)
  observacoes  String?
  empresaId    String
  createdAt    DateTime @default(now())

  empresa Empresa    @relation(fields: [empresaId], references: [id])
  estoque Estoque    @relation(fields: [estoqueId], references: [id])
  pessoa  Pessoa     @relation(fields: [pessoaId], references: [id])
  itens   ItemSaida[]
}

model ItemSaida {
  id         String @id @default(cuid())
  saidaId    String
  produtoId  String
  quantidade Float
  valorUnit  Float

  saida   Saida   @relation(fields: [saidaId], references: [id])
  produto Produto @relation(fields: [produtoId], references: [id])
}

model ContaPagar {
  id             String   @id @default(cuid())
  codigo         String
  numero         String
  pessoaId       String
  vencimento     DateTime
  formaPagamento String
  valor          Float
  saldo          Float
  situacao       String   @default("EmAberto") // "EmAberto" | "Pago" | "Vencido"
  empresaId      String
  createdAt      DateTime @default(now())

  empresa Empresa @relation(fields: [empresaId], references: [id])
  pessoa  Pessoa  @relation(fields: [pessoaId], references: [id])
}

model ContaReceber {
  id             String   @id @default(cuid())
  codigo         String
  numero         String
  pessoaId       String
  vencimento     DateTime
  formaPagamento String
  valor          Float
  saldo          Float
  situacao       String   @default("EmAberto") // "EmAberto" | "Recebido" | "Vencido"
  empresaId      String
  createdAt      DateTime @default(now())

  empresa Empresa @relation(fields: [empresaId], references: [id])
  pessoa  Pessoa  @relation(fields: [pessoaId], references: [id])
}
```

---

## 5. Layout Global (app/(dashboard)/layout.tsx)

### Sidebar Esquerdo
Criar sidebar fixo à esquerda com as seguintes seções e itens de menu (com ícones Lucide):

```
Logo: "SmartStorage" (ícone PackageOpen)

MENU PRINCIPAL
  🏠 Dashboard          → /

CADASTROS
  🏢 Empresas           → /empresas
  📦 Produtos           → /produtos
  👥 Pessoas            → /pessoas

CONSULTAS
  🗄️ Estoques           → /estoques

MOVIMENTAÇÕES
  📥 Entradas           → /entradas
  📤 Saídas             → /saidas

FINANCEIRO
  💳 Contas a Pagar     → /financeiro/pagar
  💰 Contas a Receber   → /financeiro/receber

SISTEMA
  ⚙️ Configurações      → /configuracoes
```

### Header
- Lado esquerdo: nome da aplicação **"Smart Storage"** + breadcrumb da rota atual
- Lado direito: ícone de **notificações** (Bell) com badge de contagem + pill de **usuário logado** (avatar com iniciais + nome + dropdown)

---

## 6. Tela de Login (app/(auth)/login/page.tsx)

Layout centralizado com:
- Logo e nome da aplicação no topo
- Card central com **abas** "Login" e "Cadastro"

**Formulário de Login:**
- Campo: Código de Empresa
- Campo: E-mail de login
- Campo: Senha
- Botão: "Entrar no sistema"
- Link: "Esqueceu a senha?"

**Formulário de Cadastro:**
- Campo: Código da Empresa
- Campo: E-mail
- Campo: Senha
- Botão: "Criar conta"

---

## 7. Tela Home / Dashboard (app/(dashboard)/page.tsx)

- Texto de boas-vindas com nome do usuário logado e data atual
- **KPIs (4 cards):** Total em Estoque, Produtos Cadastrados, Entradas do Mês (R$), Saídas do Mês (R$)
- **Gráfico de barras:** Movimentação mensal (Entradas vs Saídas — 6 meses)
- **Gráfico de rosca (donut):** Distribuição por categoria de produto
- **Tabela:** Produtos com estoque baixo (alerta)
- **Tabela:** Últimas movimentações (10 registros)

---

## 8. Módulo Empresas

### Listagem (app/(dashboard)/empresas/page.tsx)
- Filtros: Código, Razão Social, Situação
- Botão "+ Nova Empresa"
- Tabela com colunas: Código, Código Público, Razão Social, Nome Fantasia, CNPJ/CPF, Cidade/UF, Situação, Ações (editar/excluir)

### Cadastro/Edição (app/(dashboard)/empresas/[id]/page.tsx)
Card com **4 abas:**

**Aba 1 — Cadastro:**
- Código, Código Público, Situação (Ativo/Inativo), Tipo de Empresa (Física/Jurídica)
- Razão Social, Nome Fantasia
- CNPJ/CPF, Inscrição Estadual/RG, E-mail
- Endereço, Número, Complemento, Bairro, Cidade, Estado
- Observações (textarea)

**Aba 2 — Estoques:**
- Filtros: Código, Descrição
- Formulário: Código, Código Público, Descrição, Locatário (Pessoa), Situação
- Tabela: Código | Cód. Público | Descrição | Locatário | Situação | Ações

**Aba 3 — Setores:**
- Filtros: Código, Descrição
- Formulário: Código, Descrição
- Tabela: Código | Descrição | Ações

**Aba 4 — Posições:**
- Filtros: Estoque, Setor
- Formulário: Código, Estoque (select), Setor (select), Rua, Bloco, Andar, Locação
- Tabela: Código | Estoque | Setor | Rua | Bloco | Andar | Locação | Ações

---

## 9. Módulo Produtos

### Listagem (app/(dashboard)/produtos/page.tsx)
- Filtros: Código, Descrição, Categoria, Tipo de Controle
- Botão "+ Novo Produto"
- Tabela: Código | Descrição | Unidade | Marca | Categoria | Tipo Controle | Situação | Ações

### Cadastro/Edição (app/(dashboard)/produtos/[id]/page.tsx)
Card com **6 abas:**

**Aba 1 — Cadastro:**
- Código, Descrição, Unidade de Medida, Marca
- Categoria, Grupo, Subgrupo
- Tipo de Produto (Produto/Serviço), Tipo de Controle (Padrão/Lote/Validade/Grade/Número de Série)
- Upload de Imagem de Capa
- Sub-seção **Embalagens**:
  - Formulário: Código, Situação, Unidade de Medida, Código de Barras, Fator, Altura(cm), Largura(cm), Comprimento(cm), Peso Bruto, Peso Líquido
  - Tabela: Código | Situação | Unid. | Cód. Barras | Fator | Alt | Larg | Comp | Cubagem | Peso Br | Peso Lq | Ações

**Aba 2 — Embalagens:** (mesmo conteúdo em tab dedicada)
- Tabela completa de embalagens do produto

**Aba 3 — Estoques:**
- Tabela: Código | Descrição do Estoque | Preço de Custo | Ativo | Pessoa | Qtd de Estoque

**Aba 4 — Posições:**
- Tabela: Código | Estoque | Setor | Rua | Bloco | Andar | Locação | Quantidade | Lote | Validade | Grade | Número de Série

**Aba 5 — Movimentos:**
- Filtros: Pessoa, Estoque, Período Inicial, Período Final
- Tabela: Data | Tipo | Documento | Pessoa | Estoque | Qtd | Valor Unitário | Total

**Aba 6 — Marketplace:**
- Select de Estoque
- Input de upload de múltiplas imagens (aceita image/*)
- Grade de thumbnails das imagens cadastradas (5 colunas)

---

## 10. Módulo Pessoas

### Listagem (app/(dashboard)/pessoas/page.tsx)
- Filtros: Código, Nome/Razão Social, Categoria
- Botão "+ Nova Pessoa"
- Tabela: Código | Tipo | Razão Social | Nome Fantasia | CNPJ/CPF | Cidade/UF | Categorias | Ações

### Cadastro/Edição (app/(dashboard)/pessoas/[id]/page.tsx)
Formulário único:
- Código, Tipo de Pessoa (Física/Jurídica)
- Razão Social, Nome Fantasia
- CNPJ/CPF, Inscrição Estadual/RG, E-mail
- Endereço, Número, Complemento, Bairro, Cidade, Estado
- Observações (textarea)
- **Seção Categorias** (checkboxes): Cliente | Fornecedor | Funcionário | Locatário | Veículos

---

## 11. Módulo Estoques (app/(dashboard)/estoques/page.tsx)

Card com **2 abas:**

**Aba 1 — Sintético:**
- Filtros: Estoque, Produto (código ou descrição), Categoria
- Tabela: Cód. Estoque | Desc. Estoque | Cód. Produto | Desc. Produto | Custo Unit. | Quantidade | Total (Qtd × Custo)

**Aba 2 — Analítico:**
- Filtros: Estoque, Setor, Produto, Lote
- Tabela: Código | Estoque | Setor | Rua | Bloco | Andar | Locação | Qtd | Lote | Validade | Grade | Número de Série

---

## 12. Módulo Entradas

### Listagem (app/(dashboard)/entradas/page.tsx)
- Filtros: Código, Número NF, Pessoa, Data Inicial, Data Final
- Botão "+ Nova Entrada"
- Tabela: Código | Estoque | Pessoa | Número | Tipo | Total Produto | Total NF-e | Data | Ações

### Cadastro/Edição (app/(dashboard)/entradas/[id]/page.tsx)

**Seção 1 — Cabeçalho (3 abas):**

*Aba 1 — Informações:*
- Código, Estoque (select), Pessoa, Número, Tipo (NF-e/CF-e/Manual)
- Chave NF-e, Total Produto, Total NF-e
- Observações

*Aba 2 — Faturas:*
- Formulário: Código, Forma de Pagamento, Número, Vencimento, Valor
- Tabela: Código | Forma Pag. | Número | Vencimento | Valor | Ações

*Aba 3 — Anexos:*
- Formulário: Arquivo (file input), Descrição
- Tabela: Arquivo | Descrição | Data | Ações

**Seção 2 — Itens:**
- Formulário: Cód. Produto, Descrição (auto-preenchido), Quantidade, Valor Unitário
- Tabela: Código | Nome Produto | Quantidade | Valor Unit. | Total | Ações

---

## 13. Módulo Saídas

### Listagem (app/(dashboard)/saidas/page.tsx)
- Filtros: Pessoa, Data Inicial, Data Final
- Botão "+ Nova Saída"
- Tabela: Código | Estoque | Pessoa | Número | Tipo | Total Produto | Total NF-e | Data | Ações

### Cadastro/Edição (app/(dashboard)/saidas/[id]/page.tsx)

**Seção 1 — Cabeçalho:**
- Código, Estoque (select), Pessoa, Número, Tipo
- Chave NF-e, Total Produto, Total NF-e
- Observações

**Seção 2 — Itens:**
- Formulário: Cód. Produto, Descrição (auto), Quantidade, Valor Unitário
- Tabela: Código | Nome Produto | Quantidade | Valor Unit. | Total | Ações

---

## 14. Módulo Financeiro

### Contas a Pagar (app/(dashboard)/financeiro/pagar/page.tsx)
- KPIs: Total em Aberto (R$), Total Vencido (R$), Total Pago no Mês (R$)
- Filtros: Pessoa, Vencimento Inicial, Vencimento Final, Situação
- Botão "+ Novo Lançamento"
- Tabela: Código | Número | Pessoa | Vencimento | Forma de Pagamento | Valor | Saldo | Dias em Aberto | Situação | Ações (Pagar)

### Contas a Receber (app/(dashboard)/financeiro/receber/page.tsx)
- KPIs: Total a Receber (R$), Total Vencido (R$), Total Recebido no Mês (R$)
- Filtros: Pessoa, Vencimento Inicial, Vencimento Final, Situação
- Botão "+ Novo Lançamento"
- Tabela: Código | Número | Pessoa | Vencimento | Forma de Pagamento | Valor | Saldo | Dias em Aberto | Situação | Ações (Receber)

---

## 15. Variáveis de Ambiente (.env.local)

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
```

---

## 16. Requisitos de UI/UX

- Tema **escuro** (dark mode) como padrão, com opção de tema claro
- Paleta de cores: fundo `#0F172A`, sidebar `#1E293B`, accent `#0EA5E9` (sky-500)
- Componentes **shadcn/ui** para: Dialog, Sheet, Tabs, Table, Form, Input, Select, Button, Badge, Card, Separator, Toast, Tooltip, Dropdown Menu
- **TailwindCSS** para estilização responsiva
- Tabelas com paginação, ordenação de colunas e busca inline
- Formulários com validação em tempo real usando **Zod + React Hook Form**
- Feedback visual com **Toast notifications** (sucesso, erro, aviso)
- Loading states com **Skeleton** components
- Breadcrumb automático baseado na rota atual
- Sidebar com estado **colapsável** (mobile-friendly)

---

## 17. Instruções Adicionais de Implementação

1. **Multitenancy:** Todas as queries devem filtrar por `empresaId` obtido da sessão do usuário logado.
2. **API Routes (Next.js):** Implementar endpoints RESTful em `app/api/` para cada módulo, protegidos por middleware de autenticação.
3. **Autenticação:** Usar Supabase Auth com JWT. Criar middleware `middleware.ts` para proteger todas as rotas do dashboard.
4. **Upload de imagens:** Usar Supabase Storage com bucket `smart-storage-files`. Retornar URL pública para exibição.
5. **Cálculos automáticos:** Na tela de Entradas/Saídas, calcular automaticamente `Total` (Qtd × Valor Unitário) e atualizar `totalProduto` do cabeçalho.
6. **Dias em Aberto (Financeiro):** Calcular diferença entre `vencimento` e a data atual. Negativo = vencido.
7. **Cubagem (Embalagens):** Calcular automaticamente `cubagem = altura × largura × comprimento`.
8. **Situação dos Títulos:** Verificar automaticamente se `vencimento < hoje` e atualizar situação para "Vencido" nas consultas.
9. **Seed de dados:** Criar `prisma/seed.ts` com dados de exemplo para desenvolvimento.

---

*Gerado em: 14/03/2025 — Smart Storage v2.0*
