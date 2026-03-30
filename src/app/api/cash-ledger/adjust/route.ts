import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/cash-ledger/adjust
// Body: { delta: number, notes?: string }
// Adds (positive) or subtracts (negative) from the current balance.
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const delta = parseFloat(body.delta);

    if (isNaN(delta) || delta === 0) {
      return NextResponse.json(
        { error: "delta must be a non-zero number" },
        { status: 400 }
      );
    }

    let ledger = await prisma.cashLedger.findFirst();
    if (!ledger) {
      ledger = await prisma.cashLedger.create({ data: { balance: 0 } });
    }

    const updated = await prisma.cashLedger.update({
      where: { id: ledger.id },
      data: { balance: { increment: delta } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error adjusting cash balance:", error);
    return NextResponse.json(
      { error: "Failed to adjust balance" },
      { status: 500 }
    );
  }
}
