import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const stock = await prisma.stock.create({
      data: {
        description: body.description,
        status: body.status || "Ativo",
        enterpriseId: BigInt(body.enterpriseId),
        tenantId: body.tenantId ? BigInt(body.tenantId) : null,
      },
    });
    return NextResponse.json({
      ...stock,
      id: stock.id.toString(),
      enterpriseId: stock.enterpriseId.toString(),
      tenantId: stock.tenantId?.toString(),
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating stock:", error);
    return NextResponse.json({ error: "Erro ao criar estoque" }, { status: 500 });
  }
}
