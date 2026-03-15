-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "codigoPublico" TEXT NOT NULL,
    "situacao" TEXT NOT NULL DEFAULT 'Ativo',
    "tipoEmpresa" TEXT NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "nomeFantasia" TEXT,
    "cnpjCpf" TEXT NOT NULL,
    "inscricaoEstadual" TEXT,
    "endereco" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "observacoes" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estoque" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "codigoPublico" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "situacao" TEXT NOT NULL DEFAULT 'Ativo',
    "empresaId" TEXT NOT NULL,
    "locatarioId" TEXT,

    CONSTRAINT "Estoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setor" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,

    CONSTRAINT "Setor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Posicao" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "estoqueId" TEXT NOT NULL,
    "setorId" TEXT NOT NULL,
    "rua" TEXT,
    "bloco" TEXT,
    "andar" TEXT,
    "locacao" TEXT,
    "empresaId" TEXT NOT NULL,

    CONSTRAINT "Posicao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produto" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "unidadeMedida" TEXT NOT NULL,
    "marca" TEXT,
    "categoria" TEXT,
    "grupo" TEXT,
    "subgrupo" TEXT,
    "tipoProduto" TEXT NOT NULL,
    "tipoControle" TEXT NOT NULL,
    "imagemCapa" TEXT,
    "situacao" TEXT NOT NULL DEFAULT 'Ativo',
    "empresaId" TEXT NOT NULL,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Embalagem" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "situacao" TEXT NOT NULL DEFAULT 'Ativo',
    "unidadeMedida" TEXT NOT NULL,
    "codigoBarras" TEXT,
    "fator" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "altura" DOUBLE PRECISION,
    "largura" DOUBLE PRECISION,
    "comprimento" DOUBLE PRECISION,
    "cubagem" DOUBLE PRECISION,
    "pesoBruto" DOUBLE PRECISION,
    "pesoLiquido" DOUBLE PRECISION,
    "produtoId" TEXT NOT NULL,

    CONSTRAINT "Embalagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProdutoEstoque" (
    "id" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "estoqueId" TEXT NOT NULL,
    "precoCusto" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "quantidade" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "ProdutoEstoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProdutoPosicao" (
    "id" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "posicaoId" TEXT NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lote" TEXT,
    "validade" TIMESTAMP(3),
    "grade" TEXT,
    "numeroSerie" TEXT,

    CONSTRAINT "ProdutoPosicao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImagemMarketplace" (
    "id" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "estoqueId" TEXT,

    CONSTRAINT "ImagemMarketplace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pessoa" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "tipoPessoa" TEXT NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "nomeFantasia" TEXT,
    "cnpjCpf" TEXT NOT NULL,
    "inscricaoEstadual" TEXT,
    "endereco" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "observacoes" TEXT,
    "email" TEXT,
    "isCliente" BOOLEAN NOT NULL DEFAULT false,
    "isFornecedor" BOOLEAN NOT NULL DEFAULT false,
    "isFuncionario" BOOLEAN NOT NULL DEFAULT false,
    "isLocatario" BOOLEAN NOT NULL DEFAULT false,
    "isVeiculo" BOOLEAN NOT NULL DEFAULT false,
    "empresaId" TEXT NOT NULL,

    CONSTRAINT "Pessoa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entrada" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "estoqueId" TEXT NOT NULL,
    "pessoaId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "chaveNfe" TEXT,
    "totalProduto" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalNfe" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "observacoes" TEXT,
    "empresaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Entrada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemEntrada" (
    "id" TEXT NOT NULL,
    "entradaId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL,
    "valorUnit" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ItemEntrada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaturaEntrada" (
    "id" TEXT NOT NULL,
    "entradaId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "formaPagamento" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "vencimento" TIMESTAMP(3) NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "FaturaEntrada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnexoEntrada" (
    "id" TEXT NOT NULL,
    "entradaId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "AnexoEntrada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Saida" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "estoqueId" TEXT NOT NULL,
    "pessoaId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "chaveNfe" TEXT,
    "totalProduto" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalNfe" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "observacoes" TEXT,
    "empresaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Saida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemSaida" (
    "id" TEXT NOT NULL,
    "saidaId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL,
    "valorUnit" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ItemSaida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContaPagar" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "pessoaId" TEXT NOT NULL,
    "vencimento" TIMESTAMP(3) NOT NULL,
    "formaPagamento" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "saldo" DOUBLE PRECISION NOT NULL,
    "situacao" TEXT NOT NULL DEFAULT 'EmAberto',
    "empresaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContaPagar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContaReceber" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "pessoaId" TEXT NOT NULL,
    "vencimento" TIMESTAMP(3) NOT NULL,
    "formaPagamento" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "saldo" DOUBLE PRECISION NOT NULL,
    "situacao" TEXT NOT NULL DEFAULT 'EmAberto',
    "empresaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContaReceber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_codigo_key" ON "Empresa"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_codigoPublico_key" ON "Empresa"("codigoPublico");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_cnpjCpf_key" ON "Empresa"("cnpjCpf");

-- AddForeignKey
ALTER TABLE "Estoque" ADD CONSTRAINT "Estoque_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estoque" ADD CONSTRAINT "Estoque_locatarioId_fkey" FOREIGN KEY ("locatarioId") REFERENCES "Pessoa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setor" ADD CONSTRAINT "Setor_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Posicao" ADD CONSTRAINT "Posicao_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Posicao" ADD CONSTRAINT "Posicao_estoqueId_fkey" FOREIGN KEY ("estoqueId") REFERENCES "Estoque"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Posicao" ADD CONSTRAINT "Posicao_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "Setor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Embalagem" ADD CONSTRAINT "Embalagem_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdutoEstoque" ADD CONSTRAINT "ProdutoEstoque_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdutoEstoque" ADD CONSTRAINT "ProdutoEstoque_estoqueId_fkey" FOREIGN KEY ("estoqueId") REFERENCES "Estoque"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdutoPosicao" ADD CONSTRAINT "ProdutoPosicao_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdutoPosicao" ADD CONSTRAINT "ProdutoPosicao_posicaoId_fkey" FOREIGN KEY ("posicaoId") REFERENCES "Posicao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImagemMarketplace" ADD CONSTRAINT "ImagemMarketplace_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pessoa" ADD CONSTRAINT "Pessoa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entrada" ADD CONSTRAINT "Entrada_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entrada" ADD CONSTRAINT "Entrada_estoqueId_fkey" FOREIGN KEY ("estoqueId") REFERENCES "Estoque"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entrada" ADD CONSTRAINT "Entrada_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemEntrada" ADD CONSTRAINT "ItemEntrada_entradaId_fkey" FOREIGN KEY ("entradaId") REFERENCES "Entrada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemEntrada" ADD CONSTRAINT "ItemEntrada_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FaturaEntrada" ADD CONSTRAINT "FaturaEntrada_entradaId_fkey" FOREIGN KEY ("entradaId") REFERENCES "Entrada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnexoEntrada" ADD CONSTRAINT "AnexoEntrada_entradaId_fkey" FOREIGN KEY ("entradaId") REFERENCES "Entrada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Saida" ADD CONSTRAINT "Saida_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Saida" ADD CONSTRAINT "Saida_estoqueId_fkey" FOREIGN KEY ("estoqueId") REFERENCES "Estoque"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Saida" ADD CONSTRAINT "Saida_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemSaida" ADD CONSTRAINT "ItemSaida_saidaId_fkey" FOREIGN KEY ("saidaId") REFERENCES "Saida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemSaida" ADD CONSTRAINT "ItemSaida_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaPagar" ADD CONSTRAINT "ContaPagar_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaPagar" ADD CONSTRAINT "ContaPagar_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaReceber" ADD CONSTRAINT "ContaReceber_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaReceber" ADD CONSTRAINT "ContaReceber_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
