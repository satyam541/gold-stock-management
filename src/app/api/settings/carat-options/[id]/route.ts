import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { value, label, sortOrder, isActive } = body;

    const option = await prisma.caratOption.update({
      where: { id: params.id },
      data: {
        ...(value !== undefined && { value: value.trim() }),
        ...(label !== undefined && { label: label.trim() }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(option);
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "A carat option with this value already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update carat option" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.caratOption.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete carat option" },
      { status: 500 }
    );
  }
}
