import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();

    if (!supabaseUser) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Load User from our DB by publicKey (Supabase UUID)
    const user = await prisma.user.findUnique({
      where: { publicKey: supabaseUser.id },
      include: {
        enterprises: {
          include: {
            enterprise: {
              select: {
                id: true,
                publicCode: true,
                legalName: true,
                tradeName: true,
                status: true,
              },
            },
          },
          orderBy: { id: "asc" },
        },
        tenant: {
          include: {
            tenant: {
              select: {
                id: true,
                publicCode: true,
                legalName: true,
                tradeName: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado no sistema" },
        { status: 404 },
      );
    }

    const enterprises = user.enterprises.map((ue) => ({
      userEnterpriseId: ue.id.toString(),
      enterpriseId: ue.enterprise.id.toString(),
      publicCode: ue.enterprise.publicCode,
      legalName: ue.enterprise.legalName,
      tradeName: ue.enterprise.tradeName,
      status: ue.enterprise.status,
    }));

    const tenant = user.tenant
      ? {
          userTenantId: user.tenant.id.toString(),
          tenantId: user.tenant.tenant.id.toString(),
          publicCode: user.tenant.tenant.publicCode,
          legalName: user.tenant.tenant.legalName,
          tradeName: user.tenant.tenant.tradeName,
        }
      : null;

    return NextResponse.json({
      userId: user.id.toString(),
      email: user.email,
      name: user.name,
      phone: user.phone,
      jobTitle: user.jobTitle,
      avatarUrl: user.avatarUrl,
      enterprises,
      tenant,
    });
  } catch (error) {
    console.error("Error loading user context:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// PATCH: Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    if (!supabaseUser) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();

    const user = await prisma.user.update({
      where: { publicKey: supabaseUser.id },
      data: {
        name: body.name,
        phone: body.phone,
        jobTitle: body.jobTitle,
        avatarUrl: body.avatarUrl,
      },
    });

    return NextResponse.json({
      userId: user.id.toString(),
      email: user.email,
      name: user.name,
      phone: user.phone,
      jobTitle: user.jobTitle,
      avatarUrl: user.avatarUrl,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Erro ao atualizar perfil" }, { status: 500 });
  }
}

// POST: Create or update User record after Supabase registration
export async function POST() {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();

    if (!supabaseUser) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const existing = await prisma.user.findUnique({
      where: { publicKey: supabaseUser.id },
    });

    if (existing) {
      return NextResponse.json(
        { ...existing, id: existing.id.toString() },
        { status: 200 },
      );
    }

    const user = await prisma.user.create({
      data: {
        publicKey: supabaseUser.id,
        email: supabaseUser.email || "",
      },
    });

    return NextResponse.json(
      { ...user, id: user.id.toString() },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar usuário" },
      { status: 500 }
    );
  }
}
