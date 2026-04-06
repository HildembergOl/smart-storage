import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const position = await prisma.position.update({
      where: { publicCode: id },
      data: {
        stockId: BigInt(body.stockId),
        sectionId: BigInt(body.sectionId),
        aisle: body.aisle,
        block: body.block,
        floor: body.floor,
        location: body.location,
      },
    });
    return NextResponse.json({
      ...position,
      id: position.id.toString(),
      stockId: position.stockId.toString(),
      sectionId: position.sectionId.toString(),
      enterpriseId: position.enterpriseId.toString(),
    });
  } catch (error) {
    console.error("Error updating position:", error);
    return NextResponse.json({ error: "Erro ao atualizar posição" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.position.delete({
      where: { publicCode: id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting position:", error);
    return NextResponse.json({ error: "Erro ao excluir posição" }, { status: 500 });
  }
}
