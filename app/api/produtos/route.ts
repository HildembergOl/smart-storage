import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    unitOfMeasure: true;
    brand: true;
    category: true;
    group: true;
    subgroup: true;
  };
}>;

function serializeProduct(product: ProductWithRelations) {
  return { 
    ...product, 
    id: product.id.toString(), 
    enterpriseId: product.enterpriseId.toString(),
    unitOfMeasureId: product.unitOfMeasureId?.toString(),
    brandId: product.brandId?.toString(),
    categoryId: product.categoryId?.toString(),
    groupId: product.groupId?.toString(),
    subgroupId: product.subgroupId?.toString(),
    unitOfMeasureName: product.unitOfMeasure?.name,
    brandName: product.brand?.name,
    categoryName: product.category?.name,
    groupName: product.group?.name,
    subgroupName: product.subgroup?.name,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const enterpriseIdStr = searchParams.get("enterpriseId") || "";
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const controlType = searchParams.get("controlType") || "";

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

    const where: Prisma.ProductWhereInput = {
      enterpriseId: enterprise.id,
    };

    if (search) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { brand: { is: { name: { contains: search, mode: "insensitive" } } } },
        { category: { is: { name: { contains: search, mode: "insensitive" } } } },
      ];
    }
    if (status) where.status = status;
    if (controlType) where.controlType = controlType;

    const products = await prisma.product.findMany({
      where,
      include: {
        unitOfMeasure: true,
        brand: true,
        category: true,
        group: true,
        subgroup: true,
      },
      orderBy: { description: "asc" },
      take: 100,
    });

    return NextResponse.json(products.map(serializeProduct));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 });
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
      const ent = await prisma.enterprise.findUnique({ where: { publicCode: body.enterpriseId }, select: { id: true } });
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
    if (!userAccess) return NextResponse.json({ error: "Sem permissão para criar produtos nesta empresa" }, { status: 403 });

    const product = await prisma.product.create({
      data: {
        description: body.description,
        unitOfMeasureId: body.unitOfMeasureId ? BigInt(body.unitOfMeasureId) : null,
        brandId: body.brandId ? BigInt(body.brandId) : null,
        categoryId: body.categoryId ? BigInt(body.categoryId) : null,
        groupId: body.groupId ? BigInt(body.groupId) : null,
        subgroupId: body.subgroupId ? BigInt(body.subgroupId) : null,
        productType: body.productType || "Produto",
        controlType: body.controlType || "Padrao",
        status: body.status || "Ativo",
        enterpriseId,
      },
      include: {
        unitOfMeasure: true,
        brand: true,
        category: true,
        group: true,
        subgroup: true,
      },
    });

    return NextResponse.json(serializeProduct(product), { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 });
  }
}
