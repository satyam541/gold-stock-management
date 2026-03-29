import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transaction = await prisma.cashTransaction.findUnique({
      where: { id: params.id },
      include: { person: true },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(transaction);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transaction = await prisma.cashTransaction.findUnique({
      where: { id: params.id },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.cashTransaction.delete({ where: { id: params.id } });

      // Reverse the ledger effect
      let ledger = await tx.cashLedger.findFirst();
      if (ledger) {
        let balanceDelta = 0;
        if (
          transaction.type === "RECEIVED" ||
          transaction.type === "DEPOSIT"
        ) {
          balanceDelta = -transaction.amount;
        } else if (
          transaction.type === "LENT" ||
          transaction.type === "WITHDRAWAL"
        ) {
          balanceDelta = transaction.amount;
        }
        await tx.cashLedger.update({
          where: { id: ledger.id },
          data: { balance: { increment: balanceDelta } },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}
