import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const enterpriseIdStr = searchParams.get("enterpriseId") || "";
    const search = searchParams.get("search") || "";
    const isClient = searchParams.get("isClient");
    const isSupplier = searchParams.get("isSupplier");
    const isEmployee = searchParams.get("isEmployee");
    const isTenant = searchParams.get("isTenant");
    const isVehicle = searchParams.get("isVehicle");

    if (!enterpriseIdStr) {
      return NextResponse.json({ error: "enterpriseId é obrigatório" }, { status: 400 });
    }

    // Identificar usuário e verificar alçada
    const { createServerSupabase } = await import("@/lib/supabase");
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    // Buscar empresa (ID interno e validar alçada)
    const enterprise = await prisma.enterprise.findUnique({
      where: enterpriseIdStr.startsWith("c") ? { publicCode: enterpriseIdStr } : { id: BigInt(enterpriseIdStr) },
      select: { id: true },
    });

    if (!enterprise) return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });

    const userAccess = await prisma.userEnterprise.findFirst({
      where: { user: { publicKey: user.id }, enterpriseId: enterprise.id },
    });
    if (!userAccess) return NextResponse.json({ error: "Sem acesso a esta empresa" }, { status: 403 });

    const where: Prisma.PersonWhereInput = {
      enterpriseId: enterprise.id,
    };

    if (search) {
      where.OR = [
        { legalName: { contains: search, mode: "insensitive" } },
        { tradeName: { contains: search, mode: "insensitive" } },
        { taxId: { contains: search, mode: "insensitive" } },
      ];
    }
    if (isClient === "true") where.isClient = true;
    if (isSupplier === "true") where.isSupplier = true;
    if (isEmployee === "true") where.isEmployee = true;
    if (isTenant === "true") where.isTenant = true;
    if (isVehicle === "true") where.isVehicle = true;

    const people = await prisma.person.findMany({
      where,
      orderBy: { legalName: "asc" },
      take: 100,
    });

    return NextResponse.json(
      people.map((p) => ({
        ...p,
        id: p.id.toString(),
        enterpriseId: p.enterpriseId.toString(),
      })),
    );
  } catch (error) {
    console.error("Error fetching people:", error);
    return NextResponse.json({ error: "Erro ao buscar pessoas" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { createServerSupabase } = await import("@/lib/supabase");
    const supabase = await createServerSupabase();
    const { data: { user: caller } } = await supabase.auth.getUser();
    if (!caller) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const body = await request.json();

    let enterpriseId: bigint;
    if (String(body.enterpriseId).startsWith("c")) {
      const ent = await prisma.enterprise.findUnique({
        where: { publicCode: body.enterpriseId },
        select: { id: true },
      });
      if (!ent) return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
      enterpriseId = ent.id;
    } else if (body.enterpriseId) {
      enterpriseId = BigInt(body.enterpriseId);
    } else {
      return NextResponse.json({ error: "enterpriseId é obrigatório" }, { status: 400 });
    }

    // Validar alçada do criador
    const userAccess = await prisma.userEnterprise.findFirst({
      where: { user: { publicKey: caller.id }, enterpriseId },
    });
    if (!userAccess) return NextResponse.json({ error: "Sem permissão para criar pessoas nesta empresa" }, { status: 403 });

    const person = await prisma.person.create({
      data: {
        personType: body.personType || "Juridica",
        legalName: body.legalName,
        tradeName: body.tradeName || null,
        taxId: body.taxId,
        stateRegistration: body.stateRegistration || null,
        email: body.email || null,
        address: body.address || null,
        number: body.number || null,
        complement: body.complement || null,
        neighborhood: body.neighborhood || null,
        city: body.city || null,
        state: body.state || null,
        notes: body.notes || null,
        isClient: !!body.isClient,
        isSupplier: !!body.isSupplier,
        isEmployee: !!body.isEmployee,
        isTenant: !!body.isTenant,
        isVehicle: !!body.isVehicle,
        enterpriseId,
      },
    });

    return NextResponse.json(
      { ...person, id: person.id.toString(), enterpriseId: person.enterpriseId.toString() },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "CNPJ/CPF já cadastrado." }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar pessoa" }, { status: 500 });
  }
}
