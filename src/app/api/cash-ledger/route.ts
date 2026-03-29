import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let ledger = await prisma.cashLedger.findFirst();
    if (!ledger) {
      ledger = await prisma.cashLedger.create({ data: { balance: 0 } });
    }
    return NextResponse.json(ledger);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch ledger" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { balance } = body;

    let ledger = await prisma.cashLedger.findFirst();
    if (!ledger) {
      ledger = await prisma.cashLedger.create({
        data: { balance: parseFloat(balance) },
      });
    } else {
      ledger = await prisma.cashLedger.update({
        where: { id: ledger.id },
        data: { balance: parseFloat(balance) },
      });
    }

    return NextResponse.json(ledger);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update ledger" },
      { status: 500 }
    );
  }
}
