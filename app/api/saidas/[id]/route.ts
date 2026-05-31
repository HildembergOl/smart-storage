import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const order = await prisma.order.findFirst({
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
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Saída não encontrada" },
        { status: 404 },
      );
    }

    const userAccess = await prisma.userEnterprise.findFirst({
      where: { user: { publicKey: user.id }, enterpriseId: order.enterpriseId },
    });
    if (!userAccess)
      return NextResponse.json(
        { error: "Sem acesso a esta empresa" },
        { status: 403 },
      );

    // Serializar dados BigInt
    return NextResponse.json({
      id: order.id.toString(),
      publicCode: order.publicCode,
      stockId: order.stockId.toString(),
      personId: order.personId.toString(),
      number: order.number,
      type: order.type,
      nfeKey: order.nfeKey,
      totalProduct: order.totalProduct,
      totalNfe: order.totalNfe,
      notes: order.notes,
      enterpriseId: order.enterpriseId.toString(),
      createdAt: order.createdAt.toISOString(),
      stock: {
        ...order.stock,
        id: order.stock.id.toString(),
        enterpriseId: order.stock.enterpriseId.toString(),
        tenantId: order.stock.tenantId?.toString() || null,
      },
      person: {
        ...order.person,
        id: order.person.id.toString(),
        enterpriseId: order.person.enterpriseId.toString(),
      },
      items: order.items.map((item) => ({
        id: item.id.toString(),
        orderId: item.orderId.toString(),
        productId: item.productId.toString(),
        quantity: item.quantity,
        unitValue: item.unitValue,
        total: item.quantity * item.unitValue,
        codigo: item.product.publicCode,
        descricao: item.product.description,
      })),
    });
  } catch (error) {
    console.error("Error fetching order detail:", error);
    return NextResponse.json(
      { error: "Erro ao buscar detalhes da saída" },
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
      "PATCH /api/saidas/[id] received body:",
      JSON.stringify(body, null, 2),
    );

    const { createServerSupabase } = await import("@/lib/supabase");
    const supabase = await createServerSupabase();
    const {
      data: { user: caller },
    } = await supabase.auth.getUser();
    if (!caller)
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { publicCode: id },
          ...(/^\d+$/.test(id) ? [{ id: BigInt(id) }] : []),
        ],
      },
      select: { id: true, enterpriseId: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Saída não encontrada" },
        { status: 404 },
      );
    }

    // Validar alçada do usuário
    const userAccess = await prisma.userEnterprise.findFirst({
      where: {
        user: { publicKey: caller.id },
        enterpriseId: order.enterpriseId,
      },
    });
    if (!userAccess)
      return NextResponse.json(
        { error: "Sem acesso a esta empresa" },
        { status: 403 },
      );

    const updated = await prisma.order.update({
      where: { id: order.id },
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

    return NextResponse.json({
      ...updated,
      id: updated.id.toString(),
      stockId: updated.stockId.toString(),
      personId: updated.personId.toString(),
      enterpriseId: updated.enterpriseId.toString(),
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar saída" },
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

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { publicCode: id },
          ...(/^\d+$/.test(id) ? [{ id: BigInt(id) }] : []),
        ],
      },
      select: { id: true, enterpriseId: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Saída não encontrada" },
        { status: 404 },
      );
    }

    // Validar alçada
    const userAccess = await prisma.userEnterprise.findFirst({
      where: {
        user: { publicKey: caller.id },
        enterpriseId: order.enterpriseId,
      },
    });
    if (!userAccess)
      return NextResponse.json(
        { error: "Sem acesso a esta empresa" },
        { status: 403 },
      );

    // Excluir de forma transacionada
    await prisma.$transaction([
      prisma.orderItem.deleteMany({ where: { orderId: order.id } }),
      prisma.order.delete({ where: { id: order.id } }),
    ]);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Erro ao excluir saída" },
      { status: 500 },
    );
  }
}
