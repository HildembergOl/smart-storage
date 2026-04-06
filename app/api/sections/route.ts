import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const section = await prisma.section.create({
      data: {
        description: body.description,
        enterpriseId: BigInt(body.enterpriseId),
      },
    });
    return NextResponse.json({
      ...section,
      id: section.id.toString(),
      enterpriseId: section.enterpriseId.toString(),
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating section:", error);
    return NextResponse.json({ error: "Erro ao criar setor" }, { status: 500 });
  }
}
