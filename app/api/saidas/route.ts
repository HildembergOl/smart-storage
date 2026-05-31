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
      return NextResponse.json(
        { error: "enterpriseId é obrigatório" },
        { status: 400 },
      );
    }

    // Identificar usuário e verificar alçada
    const { createServerSupabase } = await import("@/lib/supabase");
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    // Buscar empresa (ID interno e validar alçada)
    const enterprise = await prisma.enterprise.findUnique({
      where: enterpriseIdStr.startsWith("c")
        ? { publicCode: enterpriseIdStr }
        : { id: BigInt(enterpriseIdStr) },
      select: { id: true },
    });

    if (!enterprise)
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 },
      );

    const userAccess = await prisma.userEnterprise.findFirst({
      where: { user: { publicKey: user.id }, enterpriseId: enterprise.id },
    });
    if (!userAccess)
      return NextResponse.json(
        { error: "Sem acesso a esta empresa" },
        { status: 403 },
      );

    // Verificar se o usuário possui filtro de Tenant obrigatório
    const dbUser = await prisma.user.findUnique({
      where: { publicKey: user.id },
      include: { tenant: true },
    });

    const where: Prisma.OrderWhereInput = {
      enterpriseId: enterprise.id,
    };

    // Filtro de Tenant: se o usuário tiver UserTenant configurado, restringe
    const forcedTenantId = dbUser?.tenant?.tenantId;
    const userTenantId =
      forcedTenantId || (tenantIdStr ? BigInt(tenantIdStr) : null);
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

    const orders = await prisma.order.findMany({
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
      orders.map((o) => ({
        id: o.id.toString(),
        publicCode: o.publicCode,
        stockId: o.stockId.toString(),
        personId: o.personId.toString(),
        number: o.number,
        type: o.type,
        nfeKey: o.nfeKey,
        totalProduct: o.totalProduct,
        totalNfe: o.totalNfe,
        notes: o.notes,
        enterpriseId: o.enterpriseId.toString(),
        createdAt: o.createdAt.toISOString(),
        stock: {
          ...o.stock,
          id: o.stock.id.toString(),
          tenantId: o.stock.tenantId?.toString() || null,
        },
        person: {
          ...o.person,
          id: o.person.id.toString(),
        },
      })),
    );
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Erro ao buscar saídas" },
      { status: 500 },
    );
  }
}

interface ItemInput {
  productId: string;
  quantity: number;
  unitValue: number;
}

export async function POST(request: NextRequest) {
  try {
    const { createServerSupabase } = await import("@/lib/supabase");
    const supabase = await createServerSupabase();
    const {
      data: { user: caller },
    } = await supabase.auth.getUser();
    if (!caller)
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const body = await request.json();
    console.log(
      "POST /api/saidas received body:",
      JSON.stringify(body, null, 2),
    );

    let enterpriseId: bigint;
    if (String(body.enterpriseId).startsWith("c")) {
      const ent = await prisma.enterprise.findUnique({
        where: { publicCode: body.enterpriseId },
        select: { id: true },
      });
      if (!ent)
        return NextResponse.json(
          { error: "Empresa não encontrada" },
          { status: 404 },
        );
      enterpriseId = ent.id;
    } else if (body.enterpriseId) {
      enterpriseId = BigInt(body.enterpriseId);
    } else {
      return NextResponse.json(
        { error: "enterpriseId é obrigatório" },
        { status: 400 },
      );
    }

    // Validar alçada do criador
    const userAccess = await prisma.userEnterprise.findFirst({
      where: { user: { publicKey: caller.id }, enterpriseId },
    });
    if (!userAccess) {
      return NextResponse.json(
        { error: "Sem permissão para criar saídas nesta empresa" },
        { status: 403 },
      );
    }

    if (!body.stockId || !body.personId || !body.number || !body.type) {
      return NextResponse.json(
        { error: "Dados obrigatórios ausentes" },
        { status: 400 },
      );
    }

    // Criar a saída (Order) com itens
    const order = await prisma.order.create({
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
          create:
            body.itens?.map((item: ItemInput) => ({
              productId: BigInt(item.productId),
              quantity: Number(item.quantity),
              unitValue: Number(item.unitValue),
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
        ...order,
        id: order.id.toString(),
        stockId: order.stockId.toString(),
        personId: order.personId.toString(),
        enterpriseId: order.enterpriseId.toString(),
        stock: {
          ...order.stock,
          id: order.stock.id.toString(),
          enterpriseId: order.stock.enterpriseId.toString(),
          tenantId: order.stock.tenantId?.toString() || null,
        },
        person: {
          ...order.person,
          id: order.person.id.toString(),
          enterpriseId: order.person.enterpriseId.toString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Erro ao criar saída" }, { status: 500 });
  }
}
