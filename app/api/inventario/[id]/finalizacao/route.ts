import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { createServerSupabase } = await import("@/lib/supabase");
    const supabase = await createServerSupabase();
    const {
      data: { user: caller },
    } = await supabase.auth.getUser();
    if (!caller)
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const body = await request.json();
    let enterpriseId: bigint;
    if (String(body.enterpriseId).startsWith("c")) {
      const ent = await prisma.enterprise.findUnique({
        where: { publicCode: body.enterpriseId },
        select: { id: true },
      });
      if (!ent)
        return NextResponse.json(
          { error: "Empresa não encontrada" },
          { status: 404 },
        );
      enterpriseId = ent.id;
    } else if (body.enterpriseId) {
      enterpriseId = BigInt(body.enterpriseId);
    } else {
      return NextResponse.json(
        { error: "enterpriseId é obrigatório" },
        { status: 400 },
      );
    }

    // Validar alçada
    const userAccess = await prisma.userEnterprise.findFirst({
      where: { user: { publicKey: caller.id }, enterpriseId },
    });
    if (!userAccess) {
      return NextResponse.json(
        { error: "Sem permissão nesta empresa" },
        { status: 403 },
      );
    }

    const inventoryResult = await prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({
        where: { publicCode: body.publicCode },
      });

      if (!inventory) {
        return { inventory: false };
      }

      if (inventory.status === "Finalizado") {
        return { inventory: false };
      }

      const items = await tx.inventoryItem.findMany({
        where: { inventoryId: inventory.id },
      });

      // Agrupar por produto para atualizar ProductStock
      const productTotals = new Map<bigint, number>();
      const productCost = new Map<bigint, number>();
      for (const item of items) {
        const current = productTotals.get(item.productId) || 0;
        productTotals.set(item.productId, current + item.quantity);
      }

      // Atualizar ProductStock
      for (const [productId, qty] of productTotals.entries()) {
        const existingStock = await tx.productStock.findFirst({
          select: {
            id: true,
            quantity: true,
            costPrice: true,
          },
          where: { productId, stockId: inventory.stockId },
        });

        if (existingStock?.id) {
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
        productCost.set(productId, existingStock?.costPrice || 0);
        await tx.movementProduct.create({
          data: {
            productId,
            stockId: inventory.stockId,
            quantity: qty,
            lastQuantity: existingStock?.quantity || 0,
            costPrice: existingStock?.costPrice || 0,
            userId: userAccess.userId,
            enterpriseId: inventory.enterpriseId,
            typeOperationId: 3,
            typeMovementId: 4,
            date: new Date(),
            description: `Inventário de Estoque - ${inventory.id} - ${inventory.description}`,
          },
        });
      }

      // Atualizar ProductPosition
      for (const item of items) {
        if (item.positionId) {
          const existingPos = await tx.productPosition.findFirst({
            where: {
              productId: item.productId,
              positionId: item.positionId,
              stockId: inventory.stockId,
              batch: item.batch,
              expiry: item.expiry,
              manufacturingDate: item.manufacturingDate,
              serialNumber: item.serialNumber,
              grid: item.grid,
            },
          });

          if (existingPos?.id) {
            await tx.productPosition.update({
              where: { id: existingPos.id },
              data: { quantity: item.quantity },
            });
          } else {
            await tx.productPosition.create({
              data: {
                productId: item.productId,
                positionId: item.positionId,
                stockId: inventory.stockId,
                batch: item.batch,
                expiry: item.expiry,
                manufacturingDate: item.manufacturingDate,
                serialNumber: item.serialNumber,
                quantity: item.quantity,
              },
            });
          }

          await tx.movementProductPosition.create({
            data: {
              positionId: item.positionId,
              productId: item.productId,
              stockId: inventory.stockId,
              batch: item.batch,
              expiry: item.expiry,
              manufacturingDate: item.manufacturingDate,
              serialNumber: item.serialNumber,
              grid: item.grid,
              quantity: item.quantity,
              lastQuantity: existingPos?.quantity || 0,
              costPrice: productCost.get(item.productId) || 0,
              userId: userAccess.userId,
              enterpriseId: inventory.enterpriseId,
              typeOperationId: 3,
              typeMovementId: 4,
              date: new Date(),
              description: `Inventário de Estoque - ${inventory.id} - ${inventory.description}`,
            },
          });
        }
      }

      await tx.inventory.update({
        where: { id: inventory.id },
        data: {
          status: "Finalizado",
          finishedAt: new Date(),
        },
      });

      return { inventory: true };
    });

    return NextResponse.json(
      {
        ...inventoryResult,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error creating inventory:", error);
    return NextResponse.json(
      { error: "Erro ao criar inventário" },
      { status: 500 },
    );
  }
}
