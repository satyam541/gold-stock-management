import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transaction = await prisma.goldTransaction.findUnique({
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
    const transaction = await prisma.goldTransaction.findUnique({
      where: { id: params.id },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.goldTransaction.delete({ where: { id: params.id } });

      const inventory = await tx.goldInventory.findFirst({
        where: { carat: transaction.carat },
      });

      if (inventory) {
        let weightDelta = 0;
        if (
          transaction.type === "RECEIVED" ||
          transaction.type === "DEPOSIT"
        ) {
          weightDelta = -transaction.weight;
        } else if (
          transaction.type === "LENT" ||
          transaction.type === "WITHDRAWAL"
        ) {
          weightDelta = transaction.weight;
        }

        await tx.goldInventory.update({
          where: { id: inventory.id },
          data: { weight: { increment: weightDelta } },
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
