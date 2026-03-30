import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const entries = await prisma.goldLedgerEntry.findMany({
      where: { personId: params.id },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(entries);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch gold ledger" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const { type, grossWeight, purity, wastagePercent, goldRate, date, notes } =
      body;

    if (!type || !grossWeight || !purity || !goldRate) {
      return NextResponse.json(
        { error: "type, grossWeight, purity, and goldRate are required" },
        { status: 400 },
      );
    }

    const gw = parseFloat(grossWeight);
    const p = parseFloat(purity);
    const wp = parseFloat(wastagePercent) || 0;

    const pureGoldWeight = gw * (p / 100);
    const wastageWeight = pureGoldWeight * (wp / 100);
    const finalWeight = pureGoldWeight - wastageWeight;
    const rate = parseFloat(goldRate);
    const totalAmount = finalWeight * rate;

    const entry = await prisma.goldLedgerEntry.create({
      data: {
        personId: params.id,
        type,
        grossWeight: gw,
        purity: p,
        wastagePercent: wp,
        pureGoldWeight,
        wastageWeight,
        finalWeight,
        goldRate: rate,
        totalAmount,
        notes: notes || null,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Gold ledger error:", error);
    return NextResponse.json(
      { error: "Failed to create entry" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get("entryId");

    if (!entryId) {
      return NextResponse.json(
        { error: "entryId query parameter is required" },
        { status: 400 },
      );
    }

    await prisma.goldLedgerEntry.delete({
      where: { id: entryId, personId: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Gold ledger delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete entry" },
      { status: 500 },
    );
  }
}
