import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { prisma } from "./lib/prisma";

async function main() {
  try {
    const enterprise = await prisma.enterprise.findFirst({ select: { id: true } });
    if (!enterprise) {
      console.log("No enterprise found. Please run seed first.");
      return;
    }

    const stock = await prisma.stock.findFirst({
      where: { enterpriseId: enterprise.id },
      select: { id: true }
    });
    if (!stock) {
      console.log("No stock found.");
      return;
    }

    const person = await prisma.person.findFirst({
      where: { enterpriseId: enterprise.id },
      select: { id: true }
    });
    if (!person) {
      console.log("No person found.");
      return;
    }

    const product = await prisma.product.findFirst({
      where: { enterpriseId: enterprise.id },
      select: { id: true }
    });
    if (!product) {
      console.log("No product found.");
      return;
    }

    console.log("Found resources:", {
      enterpriseId: enterprise.id.toString(),
      stockId: stock.id.toString(),
      personId: person.id.toString(),
      productId: product.id.toString()
    });

    const entry = await prisma.entry.create({
      data: {
        stockId: stock.id,
        personId: person.id,
        number: "NF-TEST-" + Date.now(),
        type: "NF-e",
        totalProduct: 100,
        totalNfe: 100,
        enterpriseId: enterprise.id,
        items: {
          create: [
            {
              productId: product.id,
              quantity: 10,
              unitValue: 10
            }
          ]
        }
      },
      include: {
        items: true
      }
    });

    console.log("Success! Created entry:", {
      id: entry.id.toString(),
      itemsCount: entry.items.length,
      items: entry.items.map(i => ({ id: i.id.toString(), productId: i.productId.toString(), quantity: i.quantity, unitValue: i.unitValue }))
    });
  } catch (error) {
    console.error("Prisma error occurred:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
