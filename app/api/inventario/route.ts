import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const enterpriseIdStr = searchParams.get("enterpriseId") || "";
    const stockId = searchParams.get("stockId");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!enterpriseIdStr) {
      return NextResponse.json({ error: "enterpriseId é obrigatório" }, { status: 400 });
    }

    // Identificar usuário e verificar alçada
    const { createServerSupabase } = await import("@/lib/supabase");
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    // Buscar empresa
    const enterprise = await prisma.enterprise.findUnique({
      where: enterpriseIdStr.startsWith("c") ? { publicCode: enterpriseIdStr } : { id: BigInt(enterpriseIdStr) },
      select: { id: true },
    });

    if (!enterprise) return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });

    const userAccess = await prisma.userEnterprise.findFirst({
      where: { user: { publicKey: user.id }, enterpriseId: enterprise.id },
    });
    if (!userAccess) return NextResponse.json({ error: "Sem acesso a esta empresa" }, { status: 403 });

    // Verificar se o usuário possui filtro de Tenant obrigatório
    const dbUser = await prisma.user.findUnique({
      where: { publicKey: user.id },
      include: { tenant: true },
    });

    const where: Prisma.InventoryWhereInput = {
      enterpriseId: enterprise.id,
    };

    // Filtro de Tenant: se o usuário tiver UserTenant configurado, restringe
    const forcedTenantId = dbUser?.tenant?.tenantId;
    if (forcedTenantId) {
      where.stock = {
        id: stockId ? BigInt(stockId) : undefined,
        tenantId: forcedTenantId,
      };
    } else if (stockId) {
      where.stockId = BigInt(stockId);
    }

    // Filtro de Status
    if (status && status !== "TODOS") {
      where.status = status;
    }

    // Filtro de datas
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const inventories = await prisma.inventory.findMany({
      where,
      include: {
        stock: {
          select: {
            id: true,
            publicCode: true,
            description: true,
          },
        },
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json(
      inventories.map((inv) => ({
        id: inv.id.toString(),
        publicCode: inv.publicCode,
        description: inv.description,
        status: inv.status,
        stockId: inv.stockId.toString(),
        enterpriseId: inv.enterpriseId.toString(),
        createdAt: inv.createdAt.toISOString(),
        finishedAt: inv.finishedAt?.toISOString() || null,
        stock: {
          ...inv.stock,
          id: inv.stock.id.toString(),
        },
      }))
    );
  } catch (error) {
    console.error("Error fetching inventories:", error);
    return NextResponse.json({ error: "Erro ao buscar inventários" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { createServerSupabase } = await import("@/lib/supabase");
    const supabase = await createServerSupabase();
    const { data: { user: caller } } = await supabase.auth.getUser();
    if (!caller) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const body = await request.json();
    let enterpriseId: bigint;
    if (String(body.enterpriseId).startsWith("c")) {
      const ent = await prisma.enterprise.findUnique({
        where: { publicCode: body.enterpriseId },
        select: { id: true },
      });
      if (!ent) return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
      enterpriseId = ent.id;
    } else if (body.enterpriseId) {
      enterpriseId = BigInt(body.enterpriseId);
    } else {
      return NextResponse.json({ error: "enterpriseId é obrigatório" }, { status: 400 });
    }

    // Validar alçada
    const userAccess = await prisma.userEnterprise.findFirst({
      where: { user: { publicKey: caller.id }, enterpriseId },
    });
    if (!userAccess) {
      return NextResponse.json({ error: "Sem permissão nesta empresa" }, { status: 403 });
    }

    if (!body.stockId || !body.description) {
      return NextResponse.json({ error: "Dados obrigatórios ausentes" }, { status: 400 });
    }

    const inventory = await prisma.inventory.create({
      data: {
        description: body.description,
        stockId: BigInt(body.stockId),
        enterpriseId,
        status: "Pendente",
      },
      include: {
        stock: {
          select: {
            id: true,
            publicCode: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        ...inventory,
        id: inventory.id.toString(),
        stockId: inventory.stockId.toString(),
        enterpriseId: inventory.enterpriseId.toString(),
        stock: {
          ...inventory.stock,
          id: inventory.stock.id.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating inventory:", error);
    return NextResponse.json({ error: "Erro ao criar inventário" }, { status: 500 });
  }
}
