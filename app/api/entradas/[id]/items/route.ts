import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { createServerSupabase } = await import("@/lib/supabase");
    const supabase = await createServerSupabase();
    const { data: { user: caller } } = await supabase.auth.getUser();
    if (!caller) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const entry = await prisma.entry.findFirst({
      where: {
        OR: [
          { publicCode: id },
          ...( /^\d+$/.test(id) ? [{ id: BigInt(id) }] : [] )
        ]
      },
      select: { id: true, enterpriseId: true }
    });

    if (!entry) {
      return NextResponse.json({ error: "Entrada não encontrada" }, { status: 404 });
    }

    // Validar alçada
    const userAccess = await prisma.userEnterprise.findFirst({
      where: { user: { publicKey: caller.id }, enterpriseId: entry.enterpriseId },
    });
    if (!userAccess) return NextResponse.json({ error: "Sem acesso a esta empresa" }, { status: 403 });

    if (!body.productId || !body.quantity || !body.unitValue) {
      return NextResponse.json({ error: "Dados do item ausentes" }, { status: 400 });
    }

    const newItem = await prisma.entryItem.create({
      data: {
        entryId: entry.id,
        productId: BigInt(body.productId),
        quantity: Number(body.quantity),
        unitValue: Number(body.unitValue),
      },
      include: {
        product: {
          select: {
            id: true,
            publicCode: true,
            description: true,
          }
        }
      }
    });

    return NextResponse.json({
      id: newItem.id.toString(),
      entryId: newItem.entryId.toString(),
      productId: newItem.productId.toString(),
      quantity: newItem.quantity,
      unitValue: newItem.unitValue,
      total: newItem.quantity * newItem.unitValue,
      codigo: newItem.product.publicCode,
      descricao: newItem.product.description,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating entry item:", error);
    return NextResponse.json({ error: "Erro ao adicionar item à entrada" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const itemIdStr = searchParams.get("itemId");

    if (!itemIdStr) {
      return NextResponse.json({ error: "itemId é obrigatório" }, { status: 400 });
    }

    const { createServerSupabase } = await import("@/lib/supabase");
    const supabase = await createServerSupabase();
    const { data: { user: caller } } = await supabase.auth.getUser();
    if (!caller) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const entry = await prisma.entry.findFirst({
      where: {
        OR: [
          { publicCode: id },
          ...( /^\d+$/.test(id) ? [{ id: BigInt(id) }] : [] )
        ]
      },
      select: { id: true, enterpriseId: true }
    });

    if (!entry) {
      return NextResponse.json({ error: "Entrada não encontrada" }, { status: 404 });
    }

    // Validar alçada
    const userAccess = await prisma.userEnterprise.findFirst({
      where: { user: { publicKey: caller.id }, enterpriseId: entry.enterpriseId },
    });
    if (!userAccess) return NextResponse.json({ error: "Sem acesso a esta empresa" }, { status: 403 });

    // Excluir item
    await prisma.entryItem.delete({
      where: { id: BigInt(itemIdStr) },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting entry item:", error);
    return NextResponse.json({ error: "Erro ao excluir item da entrada" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const itemIdStr = searchParams.get("itemId");
    const body = await request.json();

    if (!itemIdStr) {
      return NextResponse.json({ error: "itemId é obrigatório" }, { status: 400 });
    }

    const { createServerSupabase } = await import("@/lib/supabase");
    const supabase = await createServerSupabase();
    const { data: { user: caller } } = await supabase.auth.getUser();
    if (!caller) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const entry = await prisma.entry.findFirst({
      where: {
        OR: [
          { publicCode: id },
          ...( /^\d+$/.test(id) ? [{ id: BigInt(id) }] : [] )
        ]
      },
      select: { id: true, enterpriseId: true }
    });

    if (!entry) {
      return NextResponse.json({ error: "Entrada não encontrada" }, { status: 404 });
    }

    // Validar alçada
    const userAccess = await prisma.userEnterprise.findFirst({
      where: { user: { publicKey: caller.id }, enterpriseId: entry.enterpriseId },
    });
    if (!userAccess) return NextResponse.json({ error: "Sem acesso a esta empresa" }, { status: 403 });

    if (!body.quantity || !body.unitValue) {
      return NextResponse.json({ error: "Quantidade e valor unitário são obrigatórios" }, { status: 400 });
    }

    const updatedItem = await prisma.entryItem.update({
      where: { id: BigInt(itemIdStr) },
      data: {
        productId: body.productId ? BigInt(body.productId) : undefined,
        quantity: Number(body.quantity),
        unitValue: Number(body.unitValue),
      },
      include: {
        product: {
          select: {
            id: true,
            publicCode: true,
            description: true,
          }
        }
      }
    });

    return NextResponse.json({
      id: updatedItem.id.toString(),
      entryId: updatedItem.entryId.toString(),
      productId: updatedItem.productId.toString(),
      quantity: updatedItem.quantity,
      unitValue: updatedItem.unitValue,
      total: updatedItem.quantity * updatedItem.unitValue,
      codigo: updatedItem.product.publicCode,
      descricao: updatedItem.product.description,
    });
  } catch (error) {
    console.error("Error updating entry item:", error);
    return NextResponse.json({ error: "Erro ao atualizar item da entrada" }, { status: 500 });
  }
}
