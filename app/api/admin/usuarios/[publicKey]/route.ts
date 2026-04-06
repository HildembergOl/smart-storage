import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerSupabase } from "@/lib/supabase";

// GET /api/admin/usuarios/[publicKey] — get single user
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ publicKey: string }> },
) {
  try {
    const { publicKey } = await params;
    const user = await prisma.user.findUnique({
      where: { publicKey },
      include: {
        enterprises: { include: { enterprise: { select: { id: true, publicCode: true, legalName: true } } }, orderBy: { id: "asc" } },
        tenant: { include: { tenant: { select: { id: true, publicCode: true, legalName: true } } } },
      },
    });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    return NextResponse.json({
      id: user.id.toString(),
      email: user.email,
      publicKey: user.publicKey,
      enterprises: user.enterprises.map((ue) => ({
        userEnterpriseId: ue.id.toString(),
        enterpriseId: ue.enterpriseId.toString(),
        enterprisePublicCode: ue.enterprise.publicCode,
        enterpriseName: ue.enterprise.legalName,
      })),
      tenant: user.tenant
        ? {
            userTenantId: user.tenant.id.toString(),
            tenantId: user.tenant.tenantId.toString(),
            tenantPublicCode: user.tenant.tenant.publicCode,
            tenantName: user.tenant.tenant.legalName,
          }
        : null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// PATCH /api/admin/usuarios/[publicKey] — update tenant
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ publicKey: string }> },
) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user: caller } } = await supabase.auth.getUser();
    if (!caller) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { publicKey } = await params;
    const body = await request.json();

    const dbUser = await prisma.user.findUnique({ where: { publicKey } });
    if (!dbUser) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    // Update tenant association
    if ("tenantPublicCode" in body) {
      if (!body.tenantPublicCode) {
        // Remove tenant
        await prisma.userTenant.deleteMany({ where: { userId: dbUser.id } });
      } else {
        const person = await prisma.person.findFirst({ where: { publicCode: body.tenantPublicCode } });
        if (!person) return NextResponse.json({ error: "Pessoa não encontrada" }, { status: 404 });
        await prisma.userTenant.upsert({
          where: { userId: dbUser.id },
          create: { userId: dbUser.id, tenantId: person.id },
          update: { tenantId: person.id },
        });
      }
    }

    // Add enterprise association
    if (body.addEnterprisePublicCode) {
      const enterprise = await prisma.enterprise.findUnique({ where: { publicCode: body.addEnterprisePublicCode } });
      if (!enterprise) return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
      await prisma.userEnterprise.upsert({
        where: { userId_enterpriseId: { userId: dbUser.id, enterpriseId: enterprise.id } },
        create: { userId: dbUser.id, enterpriseId: enterprise.id },
        update: {},
      });
    }

    // Remove enterprise association
    if (body.removeUserEnterpriseId) {
      await prisma.userEnterprise.delete({ where: { id: BigInt(body.removeUserEnterpriseId) } });
    }

    const updated = await prisma.user.findUnique({
      where: { id: dbUser.id },
      include: {
        enterprises: { include: { enterprise: { select: { id: true, publicCode: true, legalName: true } } } },
        tenant: { include: { tenant: { select: { id: true, publicCode: true, legalName: true } } } },
      },
    });

    return NextResponse.json({
      id: updated!.id.toString(),
      email: updated!.email,
      publicKey: updated!.publicKey,
      enterprises: updated!.enterprises.map((ue) => ({
        userEnterpriseId: ue.id.toString(),
        enterpriseId: ue.enterpriseId.toString(),
        enterprisePublicCode: ue.enterprise.publicCode,
        enterpriseName: ue.enterprise.legalName,
      })),
      tenant: updated!.tenant
        ? {
            userTenantId: updated!.tenant.id.toString(),
            tenantId: updated!.tenant.tenantId.toString(),
            tenantPublicCode: updated!.tenant.tenant.publicCode,
            tenantName: updated!.tenant.tenant.legalName,
          }
        : null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 });
  }
}

// DELETE /api/admin/usuarios/[publicKey] — remove user from DB (keeps Supabase auth)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ publicKey: string }> },
) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user: caller } } = await supabase.auth.getUser();
    if (!caller) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { publicKey } = await params;
    const dbUser = await prisma.user.findUnique({ where: { publicKey } });
    if (!dbUser) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    await prisma.user.delete({ where: { id: dbUser.id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao excluir usuário" }, { status: 500 });
  }
}
