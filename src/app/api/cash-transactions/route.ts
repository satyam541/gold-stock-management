import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateBillNumber } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const personId = searchParams.get("personId");
    const type = searchParams.get("type");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {};
    if (personId) where.personId = personId;
    if (type) where.type = type;
    if (from || to) {
      where.date = {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      };
    }

    const [transactions, total] = await Promise.all([
      prisma.cashTransaction.findMany({
        where,
        include: { person: true },
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.cashTransaction.count({ where }),
    ]);

    return NextResponse.json({ transactions, total, page, limit });
  } catch (error) {
    console.error("Error fetching cash transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { personId, type, amount, date, notes } = body;

    if (!personId || !type || !amount) {
      return NextResponse.json(
        { error: "personId, type, and amount are required" },
        { status: 400 }
      );
    }

    const billNumber = generateBillNumber();

    const transaction = await prisma.$transaction(async (tx) => {
      const t = await tx.cashTransaction.create({
        data: {
          personId,
          type,
          amount: parseFloat(amount),
          date: date ? new Date(date) : new Date(),
          notes,
          billNumber,
        },
        include: { person: true },
      });

      // Update cash ledger
      let ledger = await tx.cashLedger.findFirst();
      if (!ledger) {
        ledger = await tx.cashLedger.create({ data: { balance: 0 } });
      }

      let balanceDelta = 0;
      if (type === "RECEIVED" || type === "DEPOSIT") {
        balanceDelta = parseFloat(amount);
      } else if (type === "LENT" || type === "WITHDRAWAL") {
        balanceDelta = -parseFloat(amount);
      }

      await tx.cashLedger.update({
        where: { id: ledger.id },
        data: { balance: { increment: balanceDelta } },
      });

      return t;
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Error creating cash transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
