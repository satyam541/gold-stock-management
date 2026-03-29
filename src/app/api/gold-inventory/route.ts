import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const inventory = await prisma.goldInventory.findMany({
      orderBy: { carat: "asc" },
    });

    // Also get totals by carat from transactions
    const caratSummary = await prisma.goldTransaction.groupBy({
      by: ["carat", "type"],
      _sum: { weight: true },
    });

    return NextResponse.json({ inventory, caratSummary });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch gold inventory" },
      { status: 500 }
    );
  }
}
