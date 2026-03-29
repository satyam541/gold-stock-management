import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const options = await prisma.caratOption.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(options);
  } catch (error) {
    console.error("Error fetching carat options:", error);
    return NextResponse.json(
      { error: "Failed to fetch carat options" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { value, label, sortOrder } = body;

    if (!value || !label) {
      return NextResponse.json(
        { error: "Value and label are required" },
        { status: 400 }
      );
    }

    const option = await prisma.caratOption.create({
      data: {
        value: value.trim(),
        label: label.trim(),
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json(option, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "A carat option with this value already exists" },
        { status: 409 }
      );
    }
    console.error("Error creating carat option:", error);
    return NextResponse.json(
      { error: "Failed to create carat option" },
      { status: 500 }
    );
  }
}
