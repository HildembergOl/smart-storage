import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const position = await prisma.position.create({
      data: {
        stockId: BigInt(body.stockId),
        sectionId: BigInt(body.sectionId),
        aisle: body.aisle,
        block: body.block,
        floor: body.floor,
        location: body.location,
        enterpriseId: BigInt(body.enterpriseId),
      },
    });
    return NextResponse.json({
      ...position,
      id: position.id.toString(),
      stockId: position.stockId.toString(),
      sectionId: position.sectionId.toString(),
      enterpriseId: position.enterpriseId.toString(),
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating position:", error);
    return NextResponse.json({ error: "Erro ao criar posição" }, { status: 500 });
  }
}
