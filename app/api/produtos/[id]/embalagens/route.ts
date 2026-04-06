import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type PackageWithRelations = Prisma.PackageGetPayload<{
  include: { unitOfMeasure: true };
}>;

function serializePackage(p: PackageWithRelations) {
  return { 
    ...p, 
    id: p.id.toString(), 
    productId: p.productId.toString(),
    unitOfMeasureId: p.unitOfMeasureId?.toString(),
    unitOfMeasureName: p.unitOfMeasure?.name
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { publicCode: id }, select: { id: true } });
    if (!product) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    const packages = await prisma.package.findMany({ 
      where: { productId: product.id }, 
      include: { unitOfMeasure: true },
      orderBy: { id: "asc" } 
    });
    return NextResponse.json(packages.map(serializePackage));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const product = await prisma.product.findUnique({ where: { publicCode: id }, select: { id: true } });
    if (!product) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });

    const pkg = await prisma.package.create({
      data: {
        productId: product.id,
        unitOfMeasureId: body.unitOfMeasureId ? BigInt(body.unitOfMeasureId) : null,
        barcode: body.barcode || null,
        factor: Number(body.factor) || 1,
        height: body.height ? Number(body.height) : null,
        width: body.width ? Number(body.width) : null,
        length: body.length ? Number(body.length) : null,
        cubage: body.cubage ? Number(body.cubage) : null,
        grossWeight: body.grossWeight ? Number(body.grossWeight) : null,
        netWeight: body.netWeight ? Number(body.netWeight) : null,
        status: body.status || "Ativo",
      },
      include: { unitOfMeasure: true },
    });
    return NextResponse.json(serializePackage(pkg), { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar embalagem" }, { status: 500 });
  }
}
