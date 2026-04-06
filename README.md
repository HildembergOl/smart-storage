# Smart Storage WMS

**Smart Storage** é um avançado Sistema de Gestão de Armazéns (WMS - Warehouse Management System), desenvolvido com foco em performance, modernidade e usabilidade premium. Este sistema foi desenhado para gerenciar de forma holística estoques, docas, processos intralogísticos (recebimento, separação, conferência e expedição) com uma arquitetura flexível baseada em múltiplos tenants e empresas.

## 🚀 Principais Features

- **Multi-empresa e Tenant**: Suporte nativo à separação e o isolamento de dados de forma hierárquica usando Tenants e Enterprises.
- **Gestão de Posições e Estoque**: Cadastro topográfico sofisticado do armazém (Setores, Corredores, Acessos) com visão sintética e analítica do estoque.
- **Ecossistema de Atributos**: Centralização de características construtivas de produtos via Atributos Globais (Categorias, Grupos, Marcas).
- **Dashboard e KPIs**: Insights dinâmicos acionáveis (Eficiência operatória, status de fluxo logístico) construídos sobre Recharts.
- **Interface Premium**: Desenvolvido sobre Tailwind CSS 4, Base UI (React 19), com dark mode elegante, micro-interações via Framer Motion e notificações avançadas (Sonner).

## 🛠️ Tecnologias Utilizadas

- **Next.js 15 (App Router)**: Framework React com features robustas, otimização de servidor, proxying HTTP.
- **Prisma ORM**: Modelagem e governança declarativa de esquemas sobre PostgreSQL.
- **Supabase**: Provedor robusto de autenticação, JWT tokens, Service Role e Gestão de Múltiplos Usuários integrados perfeitamente ao Next.js middleware / rotas Proxy.
- **TypeScript**: Total cobertura e segurança de tipos de ponta a ponta.

## 📦 Como Instalar e Rodar Localmente

1. Clone o repositório
2. Crie e preencha as variáveis de ambiente `.env.local` usando o layout base de infra (Acesso de Auth do Supabase, `DATABASE_URL` do Postgres).
3. Execute `npm install`
4. Empurre o novo esquema de banco de dados e as views executando:
   ```bash
   npx prisma db push
   npx prisma generate
   ```
5. Inicie a aplicação no terminal:
   ```bash
   npm run dev
   ```

Acesse a aplicação em `http://localhost:3000`.

## 📜 Regras de Desenvolvimento

Antes de prosseguir com qualquer manutenção no ecossistema, os desenvolvedores de inteligência artificial ou engenheiros de software designados precisam obrigatoriamente realizar um parser primário da documentação principal de Contexto Sistêmico (`GEMINI.md`) disponível na raiz. O arquivo define o padrão comportamental das APIs com uso de Serialização BigInt, Promises no App Router Next.15, hooks exclusivos de Debounce e mais.

---

> Desenvolvido primariamente como uma solução de nível enterprise (SaaS) combinando estética visual incomparável com performance rigorosa. Padrões abertos e fechados de uso comercial de ponta.
