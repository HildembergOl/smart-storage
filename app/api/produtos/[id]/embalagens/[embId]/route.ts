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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; embId: string }> },
) {
  try {
    const { embId } = await params;
    const body = await request.json();
    const pkg = await prisma.package.update({
      where: { id: BigInt(embId) },
      data: {
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
    return NextResponse.json(serializePackage(pkg));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao atualizar embalagem" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; embId: string }> },
) {
  try {
    const { embId } = await params;
    await prisma.package.delete({ where: { id: BigInt(embId) } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao excluir embalagem" }, { status: 500 });
  }
}
