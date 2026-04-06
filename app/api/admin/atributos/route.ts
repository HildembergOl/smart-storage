import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const search = searchParams.get("search") || "";

    const attributes = await prisma.productAttribute.findMany({
      where: {
        type: type || undefined,
        name: { contains: search, mode: "insensitive" },
        status: "Ativo",
      },
      orderBy: { name: "asc" },
      take: 50,
    });

    return NextResponse.json(
      attributes.map((attr) => ({
        ...attr,
        id: attr.id.toString(),
      }))
    );
  } catch (error) {
    console.error("Error fetching attributes:", error);
    return NextResponse.json({ error: "Erro ao buscar atributos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type } = body;

    if (!name || !type) {
      return NextResponse.json({ error: "Nome e tipo são obrigatórios" }, { status: 400 });
    }

    // Unicidade global (entre todos os tipos)
    const existing = await prisma.productAttribute.findUnique({
      where: { name },
    });

    if (existing) {
      if (existing.type !== type) {
        return NextResponse.json({ 
          error: `O valor "${name}" já está cadastrado como "${existing.type}" e não pode ser duplicado como "${type}".` 
        }, { status: 400 });
      }
      return NextResponse.json({ ...existing, id: existing.id.toString() });
    }

    const attribute = await prisma.productAttribute.create({
      data: {
        name,
        type,
        status: "Ativo",
      },
    });

    return NextResponse.json({ ...attribute, id: attribute.id.toString() }, { status: 201 });
  } catch (error) {
    console.error("Error creating attribute:", error);
    return NextResponse.json({ error: "Erro ao criar atributo" }, { status: 500 });
  }
}
