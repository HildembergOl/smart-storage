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

    const where: Prisma.ProductPositionWhereInput = {
      product: {
        enterpriseId: entId,
        OR: [
          { description: { contains: search, mode: "insensitive" } },
          { publicCode: { contains: search, mode: "insensitive" } },
        ],
      },
    };

    if (tenantId) {
      where.position = {
        section: {
          enterpriseId: BigInt(enterpriseId),
        },
        stock: {
          tenantId: BigInt(tenantId),
        },
      };
    }

    const positions = await prisma.productPosition.findMany({
      where,
      include: {
        product: { select: { id: true, publicCode: true, description: true } },
        position: {
          include: {
            stock: { select: { id: true, publicCode: true, description: true } },
            section: { select: { id: true, publicCode: true, description: true } },
          },
        },
      },
      orderBy: { product: { description: "asc" } },
    });

    return NextResponse.json(
      positions.map((p) => ({
        id: p.id.toString(),
        codigo: p.product.publicCode,
        produto: p.product.description,
        estoque: p.position.stock.description,
        setor: p.position.section.description,
        rua: p.position.aisle || "",
        bloco: p.position.block || "",
        andar: p.position.floor || "",
        locacao: p.position.location || "",
        quantidade: p.quantity,
        lote: p.batch || "",
        validade: p.expiry ? p.expiry.toISOString().split("T")[0] : "",
        grade: p.grid || "",
        numeroSerie: p.serialNumber || "",
      }))
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar detalhes do estoque" }, { status: 500 });
  }
}
