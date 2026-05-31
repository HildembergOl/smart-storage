import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const enterpriseIdStr = searchParams.get("enterpriseId") || "";
    const search = searchParams.get("search") || "";
    const codigo = searchParams.get("codigo") || "";
    const numero = searchParams.get("numero") || "";
    const pessoa = searchParams.get("pessoa") || "";
    const tenantIdStr = searchParams.get("tenantId") || "";

    if (!enterpriseIdStr) {
      return NextResponse.json({ error: "enterpriseId é obrigatório" }, { status: 400 });
    }

    // Identificar usuário e verificar alçada
    const { createServerSupabase } = await import("@/lib/supabase");
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    // Buscar empresa (ID interno e validar alçada)
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

    const where: Prisma.EntryWhereInput = {
      enterpriseId: enterprise.id,
    };

    // Filtro de Tenant: se o usuário tiver UserTenant configurado, restringe
    const forcedTenantId = dbUser?.tenant?.tenantId;
    const userTenantId = forcedTenantId || (tenantIdStr ? BigInt(tenantIdStr) : null);
    if (userTenantId) {
      where.stock = { tenantId: userTenantId };
    }

    // Filtros de busca
    if (codigo) {
      const isNum = /^\d+$/.test(codigo);
      if (isNum) {
        where.id = BigInt(codigo);
      } else {
        where.publicCode = { contains: codigo, mode: "insensitive" };
      }
    }

    if (numero) {
      where.number = { contains: numero, mode: "insensitive" };
    }

    if (pessoa) {
      where.person = {
        OR: [
          { legalName: { contains: pessoa, mode: "insensitive" } },
          { tradeName: { contains: pessoa, mode: "insensitive" } },
        ],
      };
    }

    if (search) {
      where.OR = [
        { number: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
        { person: { legalName: { contains: search, mode: "insensitive" } } },
        { person: { tradeName: { contains: search, mode: "insensitive" } } },
      ];
    }

    const entries = await prisma.entry.findMany({
      where,
      include: {
        stock: {
          select: {
            id: true,
            publicCode: true,
            description: true,
            tenantId: true,
          },
        },
        person: {
          select: {
            id: true,
            publicCode: true,
            legalName: true,
            tradeName: true,
          },
        },
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json(
      entries.map((e) => ({
        id: e.id.toString(),
        publicCode: e.publicCode,
        stockId: e.stockId.toString(),
        personId: e.personId.toString(),
        number: e.number,
        type: e.type,
        nfeKey: e.nfeKey,
        totalProduct: e.totalProduct,
        totalNfe: e.totalNfe,
        notes: e.notes,
        enterpriseId: e.enterpriseId.toString(),
        createdAt: e.createdAt.toISOString(),
        stock: {
          ...e.stock,
          id: e.stock.id.toString(),
          tenantId: e.stock.tenantId?.toString() || null,
        },
        person: {
          ...e.person,
          id: e.person.id.toString(),
        },
      }))
    );
  } catch (error) {
    console.error("Error fetching entries:", error);
    return NextResponse.json({ error: "Erro ao buscar entradas" }, { status: 500 });
  }
}

interface ItemInput {
  productId: string;
  quantity: number;
  unitValue: number;
}

interface FaturaInput {
  paymentMethod: string;
  number: string;
  dueDate: string;
  value: number;
}

interface AnexoInput {
  url: string;
  description?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const { createServerSupabase } = await import("@/lib/supabase");
    const supabase = await createServerSupabase();
    const { data: { user: caller } } = await supabase.auth.getUser();
    if (!caller) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const body = await request.json();
    console.log("POST /api/entradas received body:", JSON.stringify(body, null, 2));

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

    // Validar alçada do criador
    const userAccess = await prisma.userEnterprise.findFirst({
      where: { user: { publicKey: caller.id }, enterpriseId },
    });
    if (!userAccess) {
      return NextResponse.json({ error: "Sem permissão para criar entradas nesta empresa" }, { status: 403 });
    }

    if (!body.stockId || !body.personId || !body.number || !body.type) {
      return NextResponse.json({ error: "Dados obrigatórios ausentes" }, { status: 400 });
    }

    // Criar a entrada com itens, faturas e anexos
    const entry = await prisma.entry.create({
      data: {
        stockId: BigInt(body.stockId),
        personId: BigInt(body.personId),
        number: body.number,
        type: body.type,
        nfeKey: body.nfeKey || null,
        totalProduct: Number(body.totalProduct || 0),
        totalNfe: Number(body.totalNfe || 0),
        notes: body.notes || null,
        enterpriseId,
        items: {
          create: body.itens?.map((item: ItemInput) => ({
            productId: BigInt(item.productId),
            quantity: Number(item.quantity),
            unitValue: Number(item.unitValue),
          })) || [],
        },
        invoices: {
          create: body.faturas?.map((fat: FaturaInput) => ({
            paymentMethod: fat.paymentMethod,
            number: fat.number,
            dueDate: new Date(fat.dueDate),
            value: Number(fat.value),
          })) || [],
        },
        attachments: {
          create: body.anexos?.map((anx: AnexoInput) => ({
            url: anx.url,
            description: anx.description || null,
          })) || [],
        },
      },
      include: {
        stock: true,
        person: true,
      },
    });

    return NextResponse.json(
      {
        ...entry,
        id: entry.id.toString(),
        stockId: entry.stockId.toString(),
        personId: entry.personId.toString(),
        enterpriseId: entry.enterpriseId.toString(),
        stock: {
          ...entry.stock,
          id: entry.stock.id.toString(),
          enterpriseId: entry.stock.enterpriseId.toString(),
          tenantId: entry.stock.tenantId?.toString() || null,
        },
        person: {
          ...entry.person,
          id: entry.person.id.toString(),
          enterpriseId: entry.person.enterpriseId.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating entry:", error);
    return NextResponse.json({ error: "Erro ao criar entrada" }, { status: 500 });
  }
}
