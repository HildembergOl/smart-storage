import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Identificar usuário e verificar alçada
    const { createServerSupabase } = await import("@/lib/supabase");
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const inventory = await prisma.inventory.findFirst({
      where: {
        OR: [
          { publicCode: id },
          ...(/^\d+$/.test(id) ? [{ id: BigInt(id) }] : []),
        ],
      },
      include: {
        stock: {
          select: {
            id: true,
            publicCode: true,
            description: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                publicCode: true,
                description: true,
                controlType: true,
              },
            },
            position: {
              select: {
                id: true,
                publicCode: true,
                aisle: true,
                block: true,
                floor: true,
                location: true,
              },
            },
          },
          orderBy: { id: "desc" },
        },
      },
    });

    if (!inventory) {
      return NextResponse.json({ error: "Inventário não encontrado" }, { status: 404 });
    }

    const userAccess = await prisma.userEnterprise.findFirst({
      where: { user: { publicKey: user.id }, enterpriseId: inventory.enterpriseId },
    });
    if (!userAccess) {
      return NextResponse.json({ error: "Sem acesso a esta empresa" }, { status: 403 });
    }

    return NextResponse.json({
      id: inventory.id.toString(),
      publicCode: inventory.publicCode,
      description: inventory.description,
      status: inventory.status,
      stockId: inventory.stockId.toString(),
      enterpriseId: inventory.enterpriseId.toString(),
      createdAt: inventory.createdAt.toISOString(),
      finishedAt: inventory.finishedAt?.toISOString() || null,
      stock: {
        ...inventory.stock,
        id: inventory.stock.id.toString(),
      },
      items: inventory.items.map((item) => ({
        id: item.id.toString(),
        inventoryId: item.inventoryId.toString(),
        productId: item.productId.toString(),
        positionId: item.positionId?.toString() || null,
        batch: item.batch,
        expiry: item.expiry?.toISOString() || null,
        manufacturingDate: item.manufacturingDate?.toISOString() || null,
        serialNumber: item.serialNumber,
        quantity: item.quantity,
        recordedQty: item.recordedQty,
        product: {
          ...item.product,
          id: item.product.id.toString(),
        },
        position: item.position
          ? {
              ...item.position,
              id: item.position.id.toString(),
            }
          : null,
      })),
    });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json({ error: "Erro ao buscar detalhes do inventário" }, { status: 500 });
  }
}

export async function PATCH(
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

    const inventory = await prisma.inventory.findFirst({
      where: {
        OR: [
          { publicCode: id },
          ...(/^\d+$/.test(id) ? [{ id: BigInt(id) }] : []),
        ],
      },
      select: { id: true, enterpriseId: true, status: true, stockId: true },
    });

    if (!inventory) {
      return NextResponse.json({ error: "Inventário não encontrado" }, { status: 404 });
    }

    // Validar alçada
    const userAccess = await prisma.userEnterprise.findFirst({
      where: { user: { publicKey: caller.id }, enterpriseId: inventory.enterpriseId },
    });
    if (!userAccess) {
      return NextResponse.json({ error: "Sem acesso a esta empresa" }, { status: 403 });
    }

    if (inventory.status === "Finalizado") {
      return NextResponse.json({ error: "Não é possível alterar um inventário finalizado" }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Se for finalização
      if (body.status === "Finalizado") {
        const items = await tx.inventoryItem.findMany({
          where: { inventoryId: inventory.id },
        });

        // Agrupar por produto para atualizar ProductStock
        const productTotals = new Map<bigint, number>();
        for (const item of items) {
          const current = productTotals.get(item.productId) || 0;
          productTotals.set(item.productId, current + item.quantity);
        }

        // Atualizar ProductStock
        for (const [productId, qty] of productTotals.entries()) {
          const existingStock = await tx.productStock.findFirst({
            where: { productId, stockId: inventory.stockId },
          });

          if (existingStock) {
            await tx.productStock.update({
              where: { id: existingStock.id },
              data: { quantity: qty },
            });
          } else {
            await tx.productStock.create({
              data: {
                productId,
                stockId: inventory.stockId,
                quantity: qty,
                costPrice: 0,
                active: true,
              },
            });
          }
        }

        // Atualizar ProductPosition
        for (const item of items) {
          if (item.positionId) {
            const existingPos = await tx.productPosition.findFirst({
              where: {
                productId: item.productId,
                positionId: item.positionId,
                batch: item.batch,
                expiry: item.expiry,
                manufacturingDate: item.manufacturingDate,
                serialNumber: item.serialNumber,
              },
            });

            if (existingPos) {
              await tx.productPosition.update({
                where: { id: existingPos.id },
                data: { quantity: item.quantity },
              });
            } else {
              await tx.productPosition.create({
                data: {
                  productId: item.productId,
                  positionId: item.positionId,
                  batch: item.batch,
                  expiry: item.expiry,
                  manufacturingDate: item.manufacturingDate,
                  serialNumber: item.serialNumber,
                  quantity: item.quantity,
                },
              });
            }
          }
        }

        return await tx.inventory.update({
          where: { id: inventory.id },
          data: {
            status: "Finalizado",
            finishedAt: new Date(),
          },
        });
      }

      // Senão, é apenas uma atualização normal de cabeçalho
      return await tx.inventory.update({
        where: { id: inventory.id },
        data: {
          description: body.description,
          stockId: body.stockId ? BigInt(body.stockId) : undefined,
        },
      });
    });

    return NextResponse.json({
      ...updated,
      id: updated.id.toString(),
      stockId: updated.stockId.toString(),
      enterpriseId: updated.enterpriseId.toString(),
      finishedAt: updated.finishedAt?.toISOString() || null,
    });
  } catch (error) {
    console.error("Error updating inventory:", error);
    return NextResponse.json({ error: "Erro ao atualizar inventário" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { createServerSupabase } = await import("@/lib/supabase");
    const supabase = await createServerSupabase();
    const { data: { user: caller } } = await supabase.auth.getUser();
    if (!caller) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const inventory = await prisma.inventory.findFirst({
      where: {
        OR: [
          { publicCode: id },
          ...(/^\d+$/.test(id) ? [{ id: BigInt(id) }] : []),
        ],
      },
      select: { id: true, enterpriseId: true, status: true },
    });

    if (!inventory) {
      return NextResponse.json({ error: "Inventário não encontrado" }, { status: 404 });
    }

    // Validar alçada
    const userAccess = await prisma.userEnterprise.findFirst({
      where: { user: { publicKey: caller.id }, enterpriseId: inventory.enterpriseId },
    });
    if (!userAccess) {
      return NextResponse.json({ error: "Sem acesso a esta empresa" }, { status: 403 });
    }

    if (inventory.status === "Finalizado") {
      return NextResponse.json({ error: "Não é possível excluir um inventário finalizado" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.inventoryItem.deleteMany({ where: { inventoryId: inventory.id } }),
      prisma.inventory.delete({ where: { id: inventory.id } }),
    ]);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting inventory:", error);
    return NextResponse.json({ error: "Erro ao excluir inventário" }, { status: 500 });
  }
}
