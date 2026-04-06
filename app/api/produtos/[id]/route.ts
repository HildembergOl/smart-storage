import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Identificar usuário e verificar alçada
    const { createServerSupabase } = await import("@/lib/supabase");
    const supabase = await createServerSupabase();
    const { data: { user: caller } } = await supabase.auth.getUser();
    if (!caller) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const userEnterprises = await prisma.userEnterprise.findMany({
      where: { user: { publicKey: caller.id } },
      select: { enterpriseId: true },
    });
    const allowedIds = userEnterprises.map((ue) => ue.enterpriseId);

    const product = await prisma.product.findFirst({
      where: { 
        publicCode: id,
        enterpriseId: { in: allowedIds },
      },
      include: {
        unitOfMeasure: true,
        brand: true,
        category: true,
        group: true,
        subgroup: true,
        packages: { include: { unitOfMeasure: true } },
        productStocks: { include: { stock: true } },
        productPositions: { include: { position: { include: { stock: true, section: true } } } },
        marketplaceImages: true,
      },
    });

    if (!product)
      return NextResponse.json({ error: "Produto não encontrado ou sem permissão" }, { status: 404 });

    const serialized = {
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

      packages: product.packages.map((pkg) => ({ 
        ...pkg, 
        id: pkg.id.toString(), 
        productId: pkg.productId.toString(),
        unitOfMeasureId: pkg.unitOfMeasureId?.toString(),
        unitOfMeasureName: pkg.unitOfMeasure?.name
      })),
      productStocks: product.productStocks.map((ps) => ({
        ...ps,
        id: ps.id.toString(),
        productId: ps.productId.toString(),
        stockId: ps.stockId.toString(),
        stock: ps.stock ? { ...ps.stock, id: ps.stock.id.toString(), enterpriseId: ps.stock.enterpriseId.toString() } : null,
      })),
      productPositions: product.productPositions.map((pp) => ({
        ...pp,
        id: pp.id.toString(),
        productId: pp.productId.toString(),
        positionId: pp.positionId.toString(),
      })),
      marketplaceImages: product.marketplaceImages.map((img) => ({ ...img, id: img.id.toString(), productId: img.productId.toString() })),
    };

    return NextResponse.json(serialized);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Identificar usuário e verificar alçada
    const { createServerSupabase } = await import("@/lib/supabase");
    const supabase = await createServerSupabase();
    const { data: { user: caller } } = await supabase.auth.getUser();
    if (!caller) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const userEnterprises = await prisma.userEnterprise.findMany({
      where: { user: { publicKey: caller.id } },
      select: { enterpriseId: true },
    });
    const allowedIds = userEnterprises.map((ue) => ue.enterpriseId);

    const productExists = await prisma.product.findFirst({
      where: { publicCode: id, enterpriseId: { in: allowedIds } },
    });

    if (!productExists)
      return NextResponse.json({ error: "Produto não encontrado ou sem permissão" }, { status: 404 });

    const body = await request.json();
    const product = await prisma.product.update({
      where: { id: productExists.id },
      data: {
        description: body.description,
        unitOfMeasureId: body.unitOfMeasureId ? BigInt(body.unitOfMeasureId) : null,
        brandId: body.brandId ? BigInt(body.brandId) : null,
        categoryId: body.categoryId ? BigInt(body.categoryId) : null,
        groupId: body.groupId ? BigInt(body.groupId) : null,
        subgroupId: body.subgroupId ? BigInt(body.subgroupId) : null,
        productType: body.productType,
        controlType: body.controlType,
        status: body.status,
      },
    });
    
    return NextResponse.json({ 
      ...product, 
      id: product.id.toString(), 
      enterpriseId: product.enterpriseId.toString(),
      unitOfMeasureId: product.unitOfMeasureId?.toString(),
      brandId: product.brandId?.toString(),
      categoryId: product.categoryId?.toString(),
      groupId: product.groupId?.toString(),
      subgroupId: product.subgroupId?.toString(),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Identificar usuário e verificar alçada
    const { createServerSupabase } = await import("@/lib/supabase");
    const supabase = await createServerSupabase();
    const { data: { user: caller } } = await supabase.auth.getUser();
    if (!caller) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const userEnterprises = await prisma.userEnterprise.findMany({
      where: { user: { publicKey: caller.id } },
      select: { enterpriseId: true },
    });
    const allowedIds = userEnterprises.map((ue) => ue.enterpriseId);

    const productExists = await prisma.product.findFirst({
      where: { publicCode: id, enterpriseId: { in: allowedIds } },
    });

    if (!productExists)
      return NextResponse.json({ error: "Produto não encontrado ou sem permissão" }, { status: 404 });

    await prisma.product.delete({ where: { id: productExists.id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao excluir produto" }, { status: 500 });
  }
}
