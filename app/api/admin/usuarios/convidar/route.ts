import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerSupabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    if (!supabaseUser) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { email, publicCode, role } = await request.json();

    if (!email || !publicCode) {
      return NextResponse.json(
        { error: "E-mail e código da empresa são obrigatórios." },
        { status: 400 }
      );
    }

    // Buscar empresa pelo publicCode
    const enterprise = await prisma.enterprise.findUnique({
      where: { publicCode },
      select: { id: true },
    });

    if (!enterprise) {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 }
      );
    }

    // 1. Chamar o Supabase Auth Admin para convidar o usuário
    const { createAdminClient } = await import("@/lib/supabase");
    const adminSupabase = createAdminClient();
    
    const { error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(email);

    if (inviteError) {
      console.error("Supabase Invite Error:", inviteError);
      // Se o usuário já existir, a gente pode continuar se for apenas para vincular a uma nova empresa
      // Mas o Supabase as vezes retorna erro se já estiver convidado.
      // Vamos assumir que se der erro crítico, a gente para.
      if (inviteError.status !== 422) { // 422 costuma ser "user already exists" ou similar
         return NextResponse.json(
           { error: `Erro no Supabase Auth: ${inviteError.message}` },
           { status: 500 }
         );
      }
    }

    // 2. Identificar o usuário que está convidando (nossa DB)
    const inviter = await prisma.user.findUnique({
      where: { publicKey: supabaseUser.id },
    });

    if (!inviter) {
      return NextResponse.json(
        { error: "Usuário convidante não encontrado" },
        { status: 404 }
      );
    }

    // 3. Criar o convite no nosso banco para controle de vínculo
    const invite = await prisma.userInvite.create({
      data: {
        email,
        enterpriseId: enterprise.id,
        role: role || "Usuario",
        invitedById: inviter.id,
        status: "Pendente",
      },
    });

    return NextResponse.json({
      id: invite.id.toString(),
      email: invite.email,
      enterpriseId: invite.enterpriseId.toString(),
      status: invite.status,
      createdAt: invite.createdAt,
    });
  } catch (error) {
    console.error("Error creating invite:", error);
    return NextResponse.json(
      { error: "Erro ao criar convite" },
      { status: 500 }
    );
  }
}
