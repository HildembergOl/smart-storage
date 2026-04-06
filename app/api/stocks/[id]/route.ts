import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const stock = await prisma.stock.update({
      where: { publicCode: id },
      data: {
        description: body.description,
        status: body.status,
        tenantId: body.tenantId ? BigInt(body.tenantId) : null,
      },
    });
    return NextResponse.json({
      ...stock,
      id: stock.id.toString(),
      enterpriseId: stock.enterpriseId.toString(),
      tenantId: stock.tenantId?.toString(),
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    return NextResponse.json({ error: "Erro ao atualizar estoque" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.stock.delete({
      where: { publicCode: id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting stock:", error);
    return NextResponse.json({ error: "Erro ao excluir estoque" }, { status: 500 });
  }
}
