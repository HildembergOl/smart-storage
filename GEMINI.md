# Smart Storage - Documentação de Contexto (GEMINI.md)

## 📌 Visão Geral
O **Smart Storage** é um sistema avançado de gestão de armazenagem (WMS) e controle de estoque, projetado com uma interface premium e foco em usabilidade. O sistema permite a gestão multi-empresa de múltiplos depósitos, posições logísticas, movimentações e financeiro integrado.

---

## 🛠️ Tecnologias Utilizadas

### Core
- **Framework:** Next.js 15.1.6 (App Router)
- **Linguagem:** TypeScript
- **Runtime:** Node.js
- **Banco de Dados:** PostgreSQL (via Prisma ORM)
- **Autenticação & Backend:** Supabase (Auth, SSR)

### Interface (UI/UX)
- **Library:** Base UI (Radix-like components for React 19)
- **Styling:** Tailwind CSS 4
- **Ícones:** Lucide React
- **Gráficos:** Recharts
- **Animações:** Framer Motion / Tailwind Animate
- **Notificações:** Sonner

### Utilitários
- **Formulários:** React Hook Form
- **Validação:** Zod
- **Datas:** Date-fns

---

## 🏗️ Estrutura do Projeto

```text
smart-storage/
├── app/                  # Rotas do Next.js (App Router)
│   ├── (auth)/           # Fluxos de Autenticação (Login, etc)
│   ├── (dashboard)/      # Aplicação Principal e Módulos
│   │   └── [modulo]/     # Ex: empresas, produtos, usuarios
│   └── api/              # Endpoints (me, admin/usuarios, estoques)
├── components/           # Componentes UI Reutilizáveis
├── lib/                  # Contextos (AppContext), Prisma, Supabase
├── prisma/               # Schema e Migrations
└── types/                # Definições globais
```

---

## 📏 Regras de Desenvolvimento (Antigravity Rules)

1. **Organização de Componentes**: Componentes de página em `_components`. Encapsular gatilhos e lógica interna.
2. **Estética & UX**: 
   - Dark Mode premium.
   - **Skeletons**: Obrigatórios para carregamento (evitar loaders full-screen).
   - **Disparo de Filtros**: Apenas via botão "Filtrar" (sem debounce automático).
3. **Segurança & Identificadores**: 
   - **Segurança:** Autenticação via Supabase com proteção de rotas no nível do Next.js Proxy (`proxy.ts`).
   - **Public Code (CUID)**: Usado exclusivamente em URLs e comunicações de API.
   - **Internal ID (BigInt)**: Exibido como "Código" nas tabelas para o usuário.
   - **Serialização BigInt**: Sempre usar `.toString()` em campos ID/BigInt ao retornar JSON nas APIs (ou garantir que o patch no `lib/prisma.ts` esteja ativo).
4. **Base UI & Triggers**: Devido ao uso da biblioteca **Base UI**, não utilize a propriedade `asChild` em componentes de gatilho (Trigger, Action, Cancel). Utilize a propriedade **`render={<Component ... />}`** para delegar a renderização, garantindo a compatibilidade de tipos.
5. **Next.js 15 (Route Handlers e Params)**:
   - Rotas dinâmicas da API (`[id]/route.ts`) recebem `params` como uma **Promise**. É terminantemente OBRIGATÓRIO usar `const { id } = await params;` para acessar os argumentos em conformidade com o Next.js 15.
   - *Nunca* tipe params como `{ params: { id: string } }`. Tipe como `{ params: Promise<{ id: string }> }`.
6. **Performance de Busca**: 
   - Ao desenhar comboboxes populadas via API `(AttributeSearchSelect)`, utilizar o hook customizado `useDebouncePromise` com promises para não enfileirar delays síncronos na fila do React e evitar loops infinitos com renderização de input.
7. **Autenticação & Contexto**: 
   - Acesse dados da empresa ativa e perfil do usuário (`name`, `phone`, `jobTitle`) através do hook `useApp()`.
   - APIs de criação devem injetar obrigatoriamente o `enterpriseId` do contexto.

---

## 💼 Regras de Negócio & Módulos

### 1. Multi-tenancy & Auth
- O sistema suporta múltiplas empresas e depositantes (Tenants).
- **Vínculos Automáticos**: Ao criar uma nova empresa, o sistema vincula automaticamente o usuário criador e o Admin (ID 1) via `UserEnterprise`.
- **Filtro de Tenant**: Se um usuário possui `UserTenant` configurado, todos os relatórios de estoque e movimentações devem ser filtrados por esse depositante.

### 2. Gestão de Usuários (Admin)
- Módulo `/usuarios` centraliza a criação de acessos e gestão de vínculos.
- **Sistema de Convites**: Novos usuários devem ser convidados via e-mail. A API (`/api/admin/usuarios/convidar`) utiliza o **Supabase Auth Admin API** para disparar o convite e criar a identidade no provedor, enquanto persiste o registro `UserInvite` no Prisma para controle de alçada.
- Vínculos de empresa usam `publicCode` para segurança na atribuição via API.

### 3. Atributos Globais (Produtos)
- O sistema utiliza uma tabela relacional unificada (`ProductAttribute`) para classificar produtos (`UnidadeMedida`, `Marca`, `Categoria`, `Grupo`, `Subgrupo`).
- Um mesmo *nome* não pode existir em tipos diferentes. (Ex: "Sony" se for Marca, não pode ser criado como Categoria).
- Modelos que consomem essas entidades têm tipagens aninhadas (ex: `PackageWithRelations`) para garantir que colunas da UI (como `row.unitOfMeasure?.name`) nunca gerem erros de TypeScript ("implicit any").

---

## 🚀 Como Desenvolver

1. `npm install`
2. Configure `.env.local` (DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, **SUPABASE_SERVICE_ROLE_KEY**).
3. `npx prisma db push`
4. `npx prisma generate`
5. `npm run dev`

---
*Este arquivo serve como guia de contexto para a IA Gemini e desenvolvedores do projeto.*
