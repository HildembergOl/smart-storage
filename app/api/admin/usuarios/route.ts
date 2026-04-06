import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerSupabase } from "@/lib/supabase";
import { createAdminClient } from "@/lib/supabase";

function serializeUser(u: {
  id: bigint;
  email: string;
  publicKey: string;
  enterprises: {
    id: bigint;
    enterpriseId: bigint;
    enterprise: { id: bigint; publicCode: string; legalName: string };
  }[];
  tenant: {
    id: bigint;
    tenantId: bigint;
    tenant: { id: bigint; publicCode: string | null; legalName: string };
  } | null;
}) {
  return {
    id: u.id.toString(),
    email: u.email,
    publicKey: u.publicKey,
    enterprises: u.enterprises.map((ue) => ({
      userEnterpriseId: ue.id.toString(),
      enterpriseId: ue.enterpriseId.toString(),
      enterprisePublicCode: ue.enterprise.publicCode,
      enterpriseName: ue.enterprise.legalName,
    })),
    tenant: u.tenant
      ? {
          userTenantId: u.tenant.id.toString(),
          tenantId: u.tenant.tenantId.toString(),
          tenantPublicCode: u.tenant.tenant.publicCode,
          tenantName: u.tenant.tenant.legalName,
        }
      : null,
  };
}

// GET /api/admin/usuarios — list all users
export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const users = await prisma.user.findMany({
      include: {
        enterprises: {
          include: {
            enterprise: { select: { id: true, publicCode: true, legalName: true } },
          },
          orderBy: { id: "asc" },
        },
        tenant: {
          include: {
            tenant: { select: { id: true, publicCode: true, legalName: true } },
          },
        },
      },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(users.map(serializeUser));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST /api/admin/usuarios — create user (Supabase invite + DB record)
export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user: caller } } = await supabase.auth.getUser();
    if (!caller) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const body = await request.json();
    const { email, password, enterprisePublicCode } = body;

    if (!email || !password || !enterprisePublicCode) {
      return NextResponse.json({ error: "E-mail, senha e empresa são obrigatórios" }, { status: 400 });
    }

    // Verify if caller has access to the provided enterprise
    const enterprise = await prisma.enterprise.findUnique({
      where: { publicCode: enterprisePublicCode },
      select: { id: true, legalName: true },
    });

    if (!enterprise) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 400 });
    }

    const callerAccess = await prisma.userEnterprise.findFirst({
      where: {
        user: { publicKey: caller.id },
        enterpriseId: enterprise.id,
      },
    });

    if (!callerAccess) {
      return NextResponse.json({ error: `Você não tem permissão para vincular usuários à empresa ${enterprise.legalName}` }, { status: 403 });
    }

    // Create Supabase user via admin client
    const adminAuth = createAdminClient();
    const { data: newAuth, error: authError } = await adminAuth.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (authError || !newAuth.user) {
      return NextResponse.json({ error: authError?.message || "Erro ao criar usuário no Supabase" }, { status: 400 });
    }

    // Create User in our DB
    const dbUser = await prisma.user.create({
      data: {
        email,
        publicKey: newAuth.user.id,
      },
    });

    // Link enterprise (mandatory)
    await prisma.userEnterprise.create({
      data: { userId: dbUser.id, enterpriseId: enterprise.id },
    });

    const fullUser = await prisma.user.findUnique({
      where: { id: dbUser.id },
      include: {
        enterprises: { include: { enterprise: { select: { id: true, publicCode: true, legalName: true } } } },
        tenant: { include: { tenant: { select: { id: true, publicCode: true, legalName: true } } } },
      },
    });

    return NextResponse.json(serializeUser(fullUser!), { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 });
  }
}
