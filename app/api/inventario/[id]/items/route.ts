import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { createServerSupabase } = await import("@/lib/supabase");
    const supabase = await createServerSupabase();
    const {
      data: { user: caller },
    } = await supabase.auth.getUser();
    if (!caller)
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

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
      return NextResponse.json(
        { error: "Inventário não encontrado" },
        { status: 404 },
      );
    }

    // Validar alçada
    const userAccess = await prisma.userEnterprise.findFirst({
      where: {
        user: { publicKey: caller.id },
        enterpriseId: inventory.enterpriseId,
      },
    });
    if (!userAccess) {
      return NextResponse.json(
        { error: "Sem acesso a esta empresa" },
        { status: 403 },
      );
    }

    if (inventory.status === "Finalizado") {
      return NextResponse.json(
        { error: "Não é possível alterar um inventário finalizado" },
        { status: 400 },
      );
    }

    if (!body.productId || body.quantity === undefined) {
      return NextResponse.json(
        { error: "productId e quantity são obrigatórios" },
        { status: 400 },
      );
    }

    const productId = BigInt(body.productId);
    const batch = body.batch || null;
    const expiry = body.expiry ? new Date(body.expiry) : null;
    const manufacturingDate = body.manufacturingDate
      ? new Date(body.manufacturingDate)
      : null;
    const serialNumber = body.serialNumber || null;
    const grid = body.grid || null;
    const quantity = Number(body.quantity);

    let positionId: bigint | null = null;
    if (body.positionId && body.positionId !== "GERAL") {
      positionId = BigInt(body.positionId);
    } else if (body.positionCode) {
      const pos = await prisma.position.findFirst({
        where: {
          OR: [
            { publicCode: body.positionCode },
            ...(/^\d+$/.test(body.positionCode)
              ? [{ id: BigInt(body.positionCode) }]
              : []),
          ],
          enterpriseId: inventory.enterpriseId,
        },
        select: { id: true },
      });
      if (pos) {
        positionId = pos.id;
      } else {
        return NextResponse.json(
          {
            error: `Posição não encontrada com o código: ${body.positionCode}`,
          },
          { status: 400 },
        );
      }
    }

    // Tirar o snapshot de estoque do sistema (recordedQty)
    let recordedQty = 0;
    if (positionId) {
      const positionStock = await prisma.productPosition.findFirst({
        where: {
          productId,
          positionId,
          batch,
          expiry,
          manufacturingDate,
          serialNumber,
        },
      });
      recordedQty = positionStock?.quantity || 0;
    } else {
      const generalStock = await prisma.productStock.findFirst({
        where: {
          productId,
          stockId: inventory.stockId,
        },
      });
      recordedQty = generalStock?.quantity || 0;
    }

    // Check if an item with the same parameters already exists
    const existingItem = await prisma.inventoryItem.findFirst({
      where: {
        inventoryId: inventory.id,
        productId,
        positionId,
        batch,
        expiry,
        manufacturingDate,
        serialNumber,
        grid,
        userId: userAccess.userId,
      },
    });

    let savedItem;
    if (existingItem) {
      savedItem = await prisma.inventoryItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
        },
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
      });
    } else {
      savedItem = await prisma.inventoryItem.create({
        data: {
          inventoryId: inventory.id,
          productId,
          positionId,
          batch,
          expiry,
          manufacturingDate,
          serialNumber,
          grid,
          quantity,
          recordedQty,
          userId: userAccess.userId,
        },
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
      });
    }

    return NextResponse.json(
      {
        ...savedItem,
        id: savedItem.id.toString(),
        inventoryId: savedItem.inventoryId.toString(),
        productId: savedItem.productId.toString(),
        positionId: savedItem.positionId?.toString() || null,
        serialNumber: savedItem.serialNumber || null,
        grid: savedItem.grid || null,
        userId: savedItem.userId.toString(),
        createdAt: savedItem.createdAt.toISOString(),
        updatedAt: savedItem.updatedAt.toISOString(),
        product: {
          ...savedItem.product,
          id: savedItem.product.id.toString(),
        },
        position: savedItem.position
          ? {
              ...savedItem.position,
              id: savedItem.position.id.toString(),
            }
          : null,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating inventory item:", error);
    return NextResponse.json(
      { error: "Erro ao adicionar item ao inventário" },
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

    const { createServerSupabase } = await import("@/lib/supabase");
    const supabase = await createServerSupabase();
    const {
      data: { user: caller },
    } = await supabase.auth.getUser();
    if (!caller)
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

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
      return NextResponse.json(
        { error: "Inventário não encontrado" },
        { status: 404 },
      );
    }

    // Validar alçada
    const userAccess = await prisma.userEnterprise.findFirst({
      where: {
        user: { publicKey: caller.id },
        enterpriseId: inventory.enterpriseId,
      },
    });
    if (!userAccess) {
      return NextResponse.json(
        { error: "Sem acesso a esta empresa" },
        { status: 403 },
      );
    }

    if (inventory.status === "Finalizado") {
      return NextResponse.json(
        { error: "Não é possível alterar um inventário finalizado" },
        { status: 400 },
      );
    }

    const itemId = body.itemId || body.id;
    if (!itemId) {
      return NextResponse.json(
        { error: "id do item é obrigatório" },
        { status: 400 },
      );
    }

    const itemBigId = BigInt(itemId);
    const existingItem = await prisma.inventoryItem.findFirst({
      where: { id: itemBigId, inventoryId: inventory.id },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Item de inventário não encontrado" },
        { status: 404 },
      );
    }

    let positionId: bigint | null | undefined = undefined;
    if (body.positionId !== undefined) {
      if (body.positionId === "GERAL" || !body.positionId) {
        positionId = null;
      } else {
        positionId = BigInt(body.positionId);
      }
    } else if (body.positionCode !== undefined) {
      if (!body.positionCode) {
        positionId = null;
      } else {
        const pos = await prisma.position.findFirst({
          where: {
            OR: [
              { publicCode: body.positionCode },
              ...(/^\d+$/.test(body.positionCode)
                ? [{ id: BigInt(body.positionCode) }]
                : []),
            ],
            enterpriseId: inventory.enterpriseId,
          },
          select: { id: true },
        });
        if (pos) {
          positionId = pos.id;
        } else {
          return NextResponse.json(
            {
              error: `Posição não encontrada com o código: ${body.positionCode}`,
            },
            { status: 400 },
          );
        }
      }
    }

    const updatedItem = await prisma.inventoryItem.update({
      where: { id: itemBigId },
      data: {
        quantity:
          body.quantity !== undefined ? Number(body.quantity) : undefined,
        batch: body.batch !== undefined ? body.batch : undefined,
        expiry:
          body.expiry !== undefined
            ? body.expiry
              ? new Date(body.expiry)
              : null
            : undefined,
        manufacturingDate:
          body.manufacturingDate !== undefined
            ? body.manufacturingDate
              ? new Date(body.manufacturingDate)
              : null
            : undefined,
        serialNumber:
          body.serialNumber !== undefined
            ? body.serialNumber || null
            : undefined,
        grid:
          body.grid !== undefined
            ? body.grid || null
            : undefined,
        positionId,
      },
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
    });

    return NextResponse.json({
      ...updatedItem,
      id: updatedItem.id.toString(),
      inventoryId: updatedItem.inventoryId.toString(),
      productId: updatedItem.productId.toString(),
      positionId: updatedItem.positionId?.toString() || null,
      serialNumber: updatedItem.serialNumber || null,
      grid: updatedItem.grid || null,
      userId: updatedItem.userId.toString(),
      createdAt: updatedItem.createdAt.toISOString(),
      updatedAt: updatedItem.updatedAt.toISOString(),
      product: {
        ...updatedItem.product,
        id: updatedItem.product.id.toString(),
      },
      position: updatedItem.position
        ? {
            ...updatedItem.position,
            id: updatedItem.position.id.toString(),
          }
        : null,
    });
  } catch (error) {
    console.error("Error updating inventory item:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar item do inventário" },
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
    const { searchParams } = new URL(request.url);
    const body = await request.json().catch(() => ({}));
    const itemId = searchParams.get("itemId") || body.itemId || body.id;

    const { createServerSupabase } = await import("@/lib/supabase");
    const supabase = await createServerSupabase();
    const {
      data: { user: caller },
    } = await supabase.auth.getUser();
    if (!caller)
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

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
      return NextResponse.json(
        { error: "Inventário não encontrado" },
        { status: 404 },
      );
    }

    // Validar alçada
    const userAccess = await prisma.userEnterprise.findFirst({
      where: {
        user: { publicKey: caller.id },
        enterpriseId: inventory.enterpriseId,
      },
    });
    if (!userAccess) {
      return NextResponse.json(
        { error: "Sem acesso a esta empresa" },
        { status: 403 },
      );
    }

    if (inventory.status === "Finalizado") {
      return NextResponse.json(
        { error: "Não é possível alterar um inventário finalizado" },
        { status: 400 },
      );
    }

    if (!itemId) {
      return NextResponse.json(
        { error: "itemId é obrigatório" },
        { status: 400 },
      );
    }

    await prisma.inventoryItem.delete({
      where: { id: BigInt(itemId) },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    return NextResponse.json(
      { error: "Erro ao excluir item do inventário" },
      { status: 500 },
    );
  }
}
