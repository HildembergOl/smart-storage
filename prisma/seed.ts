import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.enterprise.create({
    data: {
      publicCode: "PUB123",
      legalName: "Smart Storage Enterprise LTDA",
      tradeName: "Smart Storage",
      taxId: "12.345.678/0001-90",
      status: "Ativo",
      enterpriseType: "Juridica",
      city: "São Paulo",
      state: "SP",
    },
  });
  console.log("Seed complete: Enterprise created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
