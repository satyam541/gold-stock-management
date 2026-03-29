import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateBillNumber } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const personId = searchParams.get("personId");
    const type = searchParams.get("type");
    const carat = searchParams.get("carat");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {};
    if (personId) where.personId = personId;
    if (type) where.type = type;
    if (carat) where.carat = carat;
    if (from || to) {
      where.date = {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      };
    }

    const [transactions, total] = await Promise.all([
      prisma.goldTransaction.findMany({
        where,
        include: { person: true },
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.goldTransaction.count({ where }),
    ]);

    return NextResponse.json({ transactions, total, page, limit });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch gold transactions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { personId, type, carat, weight, ratePerGram, date, notes } = body;

    if (!personId || !type || !carat || !weight) {
      return NextResponse.json(
        { error: "personId, type, carat, and weight are required" },
        { status: 400 }
      );
    }

    const totalValue =
      ratePerGram ? parseFloat(ratePerGram) * parseFloat(weight) : null;
    const billNumber = generateBillNumber();

    const transaction = await prisma.$transaction(async (tx) => {
      const t = await tx.goldTransaction.create({
        data: {
          personId,
          type,
          carat,
          weight: parseFloat(weight),
          ratePerGram: ratePerGram ? parseFloat(ratePerGram) : null,
          totalValue,
          date: date ? new Date(date) : new Date(),
          notes,
          billNumber,
        },
        include: { person: true },
      });

      // Update gold inventory
      let inventory = await tx.goldInventory.findFirst({
        where: { carat },
      });

      let weightDelta = 0;
      if (type === "RECEIVED" || type === "DEPOSIT") {
        weightDelta = parseFloat(weight);
      } else if (type === "LENT" || type === "WITHDRAWAL") {
        weightDelta = -parseFloat(weight);
      }

      if (inventory) {
        await tx.goldInventory.update({
          where: { id: inventory.id },
          data: { weight: { increment: weightDelta } },
        });
      } else {
        await tx.goldInventory.create({
          data: { carat, weight: Math.max(0, weightDelta) },
        });
      }

      return t;
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Error creating gold transaction:", error);
    return NextResponse.json(
      { error: "Failed to create gold transaction" },
      { status: 500 }
    );
  }
}
