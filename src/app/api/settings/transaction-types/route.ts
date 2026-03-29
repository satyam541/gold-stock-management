import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const types = await prisma.transactionTypeOption.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(types);
  } catch (error) {
    console.error("Error fetching transaction types:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction types" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { value, label, color, sortOrder } = body;

    if (!value || !label) {
      return NextResponse.json(
        { error: "Value and label are required" },
        { status: 400 }
      );
    }

    const option = await prisma.transactionTypeOption.create({
      data: {
        value: value.trim().toUpperCase(),
        label: label.trim(),
        color: color || "#6b7280",
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json(option, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "A transaction type with this value already exists" },
        { status: 409 }
      );
    }
    console.error("Error creating transaction type:", error);
    return NextResponse.json(
      { error: "Failed to create transaction type" },
      { status: 500 }
    );
  }
}
