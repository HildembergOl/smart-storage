import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const section = await prisma.section.update({
      where: { publicCode: id },
      data: {
        description: body.description,
      },
    });
    return NextResponse.json({
      ...section,
      id: section.id.toString(),
      enterpriseId: section.enterpriseId.toString(),
    });
  } catch (error) {
    console.error("Error updating section:", error);
    return NextResponse.json({ error: "Erro ao atualizar setor" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.section.delete({
      where: { publicCode: id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting section:", error);
    return NextResponse.json({ error: "Erro ao excluir setor" }, { status: 500 });
  }
}
