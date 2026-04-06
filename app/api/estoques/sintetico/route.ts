import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const enterpriseId = searchParams.get("enterpriseId");
    const tenantId = searchParams.get("tenantId");
    const search = searchParams.get("search") || "";

    if (!enterpriseId) {
      return NextResponse.json({ error: "enterpriseId é obrigatório" }, { status: 400 });
    }

    // Identificar usuário e verificar alçada
    const { createServerSupabase } = await import("@/lib/supabase");
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const entId = BigInt(enterpriseId);

    const userAccess = await prisma.userEnterprise.findFirst({
      where: { user: { publicKey: user.id }, enterpriseId: entId },
    });
    if (!userAccess) return NextResponse.json({ error: "Sem acesso a esta empresa" }, { status: 403 });

    const where: Prisma.ProductStockWhereInput = {
      product: {
        enterpriseId: entId,
        OR: [
          { description: { contains: search, mode: "insensitive" } },
          { publicCode: { contains: search, mode: "insensitive" } },
        ],
      },
    };

    if (tenantId) {
      where.stock = { tenantId: BigInt(tenantId) };
    }

    const stocks = await prisma.productStock.findMany({
      where,
      include: {
        product: { select: { id: true, publicCode: true, description: true } },
        stock: { select: { id: true, publicCode: true, description: true } },
      },
      orderBy: { product: { description: "asc" } },
    });

    return NextResponse.json(
      stocks.map((s) => ({
        id: s.id.toString(),
        codEstoque: s.stock.publicCode,
        descEstoque: s.stock.description,
        codProduto: s.product.publicCode,
        descProduto: s.product.description,
        custoUnit: s.costPrice,
        quantidade: s.quantity,
        total: s.costPrice * s.quantity,
      }))
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar estoque" }, { status: 500 });
  }
}
