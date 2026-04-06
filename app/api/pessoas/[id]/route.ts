import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    
    // Identificar usuário
    const { createServerSupabase } = await import("@/lib/supabase");
    const supabase = await createServerSupabase();
    const { data: { user: caller } } = await supabase.auth.getUser();
    if (!caller) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    // Buscar empresas que o usuário tem acesso
    const userEnterprises = await prisma.userEnterprise.findMany({
      where: { user: { publicKey: caller.id } },
      select: { enterpriseId: true },
    });
    const allowedIds = userEnterprises.map((ue) => ue.enterpriseId);

    const person = await prisma.person.findFirst({
      where: {
        publicCode: id,
        enterpriseId: { in: allowedIds },
      },
    });

    if (!person)
      return NextResponse.json({ error: "Pessoa não encontrada ou sem permissão" }, { status: 404 });

    return NextResponse.json({ ...person, id: person.id.toString(), enterpriseId: person.enterpriseId.toString() });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Identificar usuário e verificar alçada
    const { createServerSupabase } = await import("@/lib/supabase");
    const supabase = await createServerSupabase();
    const { data: { user: caller } } = await supabase.auth.getUser();
    if (!caller) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const userEnterprises = await prisma.userEnterprise.findMany({
      where: { user: { publicKey: caller.id } },
      select: { enterpriseId: true },
    });
    const allowedIds = userEnterprises.map((ue) => ue.enterpriseId);

    const personExists = await prisma.person.findFirst({
      where: { publicCode: id, enterpriseId: { in: allowedIds } },
    });

    if (!personExists)
      return NextResponse.json({ error: "Pessoa não encontrada ou sem permissão" }, { status: 404 });

    const body = await request.json();
    const person = await prisma.person.update({
      where: { id: personExists.id },
      data: {
        personType: body.personType,
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
      },
    });
    return NextResponse.json({ ...person, id: person.id.toString(), enterpriseId: person.enterpriseId.toString() });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao atualizar pessoa" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Identificar usuário e verificar alçada
    const { createServerSupabase } = await import("@/lib/supabase");
    const supabase = await createServerSupabase();
    const { data: { user: caller } } = await supabase.auth.getUser();
    if (!caller) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const userEnterprises = await prisma.userEnterprise.findMany({
      where: { user: { publicKey: caller.id } },
      select: { enterpriseId: true },
    });
    const allowedIds = userEnterprises.map((ue) => ue.enterpriseId);

    const personExists = await prisma.person.findFirst({
      where: { publicCode: id, enterpriseId: { in: allowedIds } },
    });

    if (!personExists)
      return NextResponse.json({ error: "Pessoa não encontrada ou sem permissão" }, { status: 404 });

    await prisma.person.delete({ where: { id: personExists.id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao excluir pessoa" }, { status: 500 });
  }
}
