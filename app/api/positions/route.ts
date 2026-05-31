import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { generateUlid } from "@/lib/ulid";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stockId = searchParams.get("stockId");
    const enterpriseIdStr = searchParams.get("enterpriseId");

    if (!enterpriseIdStr) {
      return NextResponse.json({ error: "enterpriseId é obrigatório" }, { status: 400 });
    }

    const enterprise = await prisma.enterprise.findUnique({
      where: enterpriseIdStr.startsWith("c") ? { publicCode: enterpriseIdStr } : { id: BigInt(enterpriseIdStr) },
      select: { id: true },
    });

    if (!enterprise) return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });

    const where: Prisma.PositionWhereInput = {
      enterpriseId: enterprise.id,
    };

    if (stockId) {
      where.stockId = BigInt(stockId);
    }

    // Populate null barcodes if any exist
    const nullPositions = await prisma.position.findMany({
      where: { barcode: null },
      select: { id: true },
    });
    if (nullPositions.length > 0) {
      for (const pos of nullPositions) {
        await prisma.position.update({
          where: { id: pos.id },
          data: { barcode: generateUlid() },
        });
      }
    }

    const positions = await prisma.position.findMany({
      where,
      orderBy: [
        { aisle: "asc" },
        { block: "asc" },
        { floor: "asc" },
        { location: "asc" },
      ],
    });

    return NextResponse.json(
      positions.map((pos) => ({
        ...pos,
        id: pos.id.toString(),
        stockId: pos.stockId.toString(),
        sectionId: pos.sectionId.toString(),
        enterpriseId: pos.enterpriseId.toString(),
      }))
    );
  } catch (error) {
    console.error("Error fetching positions:", error);
    return NextResponse.json({ error: "Erro ao buscar posições" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const barcode = generateUlid();
    const position = await prisma.position.create({
      data: {
        stockId: BigInt(body.stockId),
        sectionId: BigInt(body.sectionId),
        aisle: body.aisle,
        block: body.block,
        floor: body.floor,
        location: body.location,
        barcode,
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
