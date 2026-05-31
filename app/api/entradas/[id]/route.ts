import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EntryAttachment, EntryInvoice, Prisma } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Identificar usuário e verificar alçada
    const { createServerSupabase } = await import("@/lib/supabase");
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const entry = await prisma.entry.findFirst({
      where: {
        OR: [
          { publicCode: id },
          ...(/^\d+$/.test(id) ? [{ id: BigInt(id) }] : []),
        ],
      },
      include: {
        stock: true,
        person: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                publicCode: true,
                description: true,
              },
            },
          },
        },
        invoices: true,
        attachments: true,
      },
    });

    if (!entry) {
      return NextResponse.json(
        { error: "Entrada não encontrada" },
        { status: 404 },
      );
    }

    const userAccess = await prisma.userEnterprise.findFirst({
      where: { user: { publicKey: user.id }, enterpriseId: entry.enterpriseId },
    });
    if (!userAccess)
      return NextResponse.json(
        { error: "Sem acesso a esta empresa" },
        { status: 403 },
      );

    // Serializar dados BigInt
    return NextResponse.json({
      id: entry.id.toString(),
      publicCode: entry.publicCode,
      stockId: entry.stockId.toString(),
      personId: entry.personId.toString(),
      number: entry.number,
      type: entry.type,
      nfeKey: entry.nfeKey,
      totalProduct: entry.totalProduct,
      totalNfe: entry.totalNfe,
      notes: entry.notes,
      enterpriseId: entry.enterpriseId.toString(),
      createdAt: entry.createdAt.toISOString(),
      stock: {
        ...entry.stock,
        id: entry.stock.id.toString(),
        enterpriseId: entry.stock.enterpriseId.toString(),
        tenantId: entry.stock.tenantId?.toString() || null,
      },
      person: {
        ...entry.person,
        id: entry.person.id.toString(),
        enterpriseId: entry.person.enterpriseId.toString(),
      },
      items: entry.items.map((item) => ({
        id: item.id.toString(),
        entryId: item.entryId.toString(),
        productId: item.productId.toString(),
        quantity: item.quantity,
        unitValue: item.unitValue,
        total: item.quantity * item.unitValue,
        codigo: item.product.publicCode,
        descricao: item.product.description,
      })),
      invoices: entry.invoices.map((inv) => ({
        id: inv.id.toString(),
        entryId: inv.entryId.toString(),
        paymentMethod: inv.paymentMethod,
        number: inv.number,
        dueDate: inv.dueDate.toISOString().split("T")[0],
        value: inv.value,
      })),
      attachments: entry.attachments.map((anx) => ({
        id: anx.id.toString(),
        entryId: anx.entryId.toString(),
        url: anx.url,
        description: anx.description,
      })),
    });
  } catch (error) {
    console.error("Error fetching entry detail:", error);
    return NextResponse.json(
      { error: "Erro ao buscar detalhes da entrada" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log(
      "PATCH /api/entradas/[id] received body:",
      JSON.stringify(body, null, 2),
    );

    const { createServerSupabase } = await import("@/lib/supabase");
    const supabase = await createServerSupabase();
    const {
      data: { user: caller },
    } = await supabase.auth.getUser();
    if (!caller)
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const entry = await prisma.entry.findFirst({
      where: {
        OR: [
          { publicCode: id },
          ...(/^\d+$/.test(id) ? [{ id: BigInt(id) }] : []),
        ],
      },
      select: { id: true, enterpriseId: true },
    });

    if (!entry) {
      return NextResponse.json(
        { error: "Entrada não encontrada" },
        { status: 404 },
      );
    }

    // Validar alçada do usuário para a empresa da entrada
    const userAccess = await prisma.userEnterprise.findFirst({
      where: {
        user: { publicKey: caller.id },
        enterpriseId: entry.enterpriseId,
      },
    });
    if (!userAccess)
      return NextResponse.json(
        { error: "Sem acesso a esta empresa" },
        { status: 403 },
      );

    const updated = await prisma.$transaction(async (tx) => {
      const faturas = body?.faturas || [];
      const anexos = body?.anexos || [];
      const invoices = [];
      for await (const fat of faturas) {
        const inserted = await tx.entryInvoice.upsert({
          where: {
            id: fat?.id ? BigInt(fat.id) : undefined,
            number: fat.number,
            entryId: entry.id,
          },
          update: {
            paymentMethod: fat.paymentMethod,
            number: fat.number,
            dueDate: new Date(fat.dueDate),
            value: Number(fat.value),
          },
          create: {
            entryId: entry.id,
            paymentMethod: fat.paymentMethod,
            number: fat.number,
            dueDate: new Date(fat.dueDate),
            value: Number(fat.value),
          },
          select: {
            id: true,
          },
        });
        invoices.push({ ...fat, id: inserted.id });
      }

      const attachments = [];
      for await (const attach of anexos as Array<EntryAttachment>) {
        const inserted = await tx.entryAttachment.upsert({
          where: {
            id: attach?.id ? BigInt(attach.id) : undefined,
            entryId: entry.id,
          },
          update: {
            url: attach.url,
            description: attach.description,
          },
          create: {
            entryId: entry.id,
            url: attach.url,
            description: attach.description,
          },
          select: {
            id: true,
          },
        });
        attachments.push({ ...attach, id: inserted.id });
      }

      const inserted = await tx.entry.update({
        where: { id: entry.id },
        data: {
          stockId: body.stockId ? BigInt(body.stockId) : undefined,
          personId: body.personId ? BigInt(body.personId) : undefined,
          number: body.number,
          type: body.type,
          nfeKey: body.nfeKey || null,
          totalProduct:
            body.totalProduct !== undefined
              ? Number(body.totalProduct)
              : undefined,
          totalNfe:
            body.totalNfe !== undefined ? Number(body.totalNfe) : undefined,
          notes: body.notes || null,
        },
      });

      // Atualizar dados da entrada e recriar os filhos (exceto itens)
      return {
        ...inserted,
        invoices,
        attachments,
      };
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating entry:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar entrada" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const { createServerSupabase } = await import("@/lib/supabase");
    const supabase = await createServerSupabase();
    const {
      data: { user: caller },
    } = await supabase.auth.getUser();
    if (!caller)
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const entry = await prisma.entry.findFirst({
      where: {
        OR: [
          { publicCode: id },
          ...(/^\d+$/.test(id) ? [{ id: BigInt(id) }] : []),
        ],
      },
      select: { id: true, enterpriseId: true },
    });

    if (!entry) {
      return NextResponse.json(
        { error: "Entrada não encontrada" },
        { status: 404 },
      );
    }

    // Validar alçada
    const userAccess = await prisma.userEnterprise.findFirst({
      where: {
        user: { publicKey: caller.id },
        enterpriseId: entry.enterpriseId,
      },
    });
    if (!userAccess)
      return NextResponse.json(
        { error: "Sem acesso a esta empresa" },
        { status: 403 },
      );

    // Excluir de forma transacionada
    await prisma.$transaction([
      prisma.entryItem.deleteMany({ where: { entryId: entry.id } }),
      prisma.entryInvoice.deleteMany({ where: { entryId: entry.id } }),
      prisma.entryAttachment.deleteMany({ where: { entryId: entry.id } }),
      prisma.entry.delete({ where: { id: entry.id } }),
    ]);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting entry:", error);
    return NextResponse.json(
      { error: "Erro ao excluir entrada" },
      { status: 500 },
    );
  }
}
