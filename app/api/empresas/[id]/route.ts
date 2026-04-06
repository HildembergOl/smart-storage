import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const enterprise = await prisma.enterprise.findUnique({
      where: { publicCode: id },
      include: {
        stocks: {
          include: {
            tenant: true,
          },
        },
        sections: true,
        positions: {
          include: {
            stock: true,
            section: true,
          },
        },
      },
    });

    if (!enterprise) {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 },
      );
    }

    return NextResponse.json(enterprise);
  } catch (error) {
    console.error("Error fetching enterprise:", error);
    return NextResponse.json(
      { error: "Internal error fetching enterprise" },
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

    const enterprise = await prisma.enterprise.update({
      where: { publicCode: id },
      data: {
        publicCode: body.publicCode,
        status: body.status,
        enterpriseType: body.enterpriseType,
        legalName: body.legalName,
        tradeName: body.tradeName,
        taxId: body.taxId,
        stateRegistration: body.stateRegistration,
        address: body.address,
        number: body.number,
        complement: body.complement,
        neighborhood: body.neighborhood,
        city: body.city,
        state: body.state,
        notes: body.notes,
        email: body.email,
      },
    });

    return NextResponse.json(enterprise);
  } catch (error) {
    console.error("Error updating enterprise:", error);
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Conflito: Código ou CNPJ/CPF já em uso." },
          { status: 409 },
        );
      }
    }
    return NextResponse.json(
      { error: "Internal error updating enterprise" },
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
    await prisma.enterprise.delete({
      where: { publicCode: id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting enterprise:", error);
    return NextResponse.json(
      {
        error:
          "Não foi possível excluir a empresa. Verifique se existem registros vinculados.",
      },
      { status: 500 },
    );
  }
}
