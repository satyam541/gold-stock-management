import { PrismaClient, TransactionType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create cash ledger
  await prisma.cashLedger.upsert({
    where: { id: "default" },
    create: { id: "default", balance: 500000 },
    update: { balance: 500000 },
  });

  // Create persons
  const persons = await Promise.all([
    prisma.person.create({
      data: {
        name: "Ahmed Khan",
        phone: "+92 300 1234567",
        email: "ahmed@example.com",
        address: "Gulberg, Lahore",
        notes: "Regular gold trader",
      },
    }),
    prisma.person.create({
      data: {
        name: "Fatima Malik",
        phone: "+92 321 9876543",
        address: "DHA Phase 5, Lahore",
      },
    }),
    prisma.person.create({
      data: {
        name: "Usman Ali",
        phone: "+92 333 5678901",
        email: "usman@business.pk",
        address: "Johar Town, Lahore",
        notes: "Bulk cash transactions",
      },
    }),
    prisma.person.create({
      data: {
        name: "Sara Hussain",
        phone: "+92 345 2345678",
        address: "Bahria Town, Lahore",
      },
    }),
  ]);

  // Seed cash transactions
  const cashTxData = [
    { personIdx: 0, type: "LENT" as TransactionType, amount: 50000, notes: "Short term loan" },
    { personIdx: 1, type: "RECEIVED" as TransactionType, amount: 75000, notes: "Repayment of previous loan" },
    { personIdx: 2, type: "DEPOSIT" as TransactionType, amount: 200000, notes: "Initial cash deposit" },
    { personIdx: 0, type: "RECEIVED" as TransactionType, amount: 25000, notes: "Partial repayment" },
    { personIdx: 3, type: "LENT" as TransactionType, amount: 30000, notes: "Business advance" },
    { personIdx: 2, type: "WITHDRAWAL" as TransactionType, amount: 40000, notes: "Operational expenses" },
  ];

  for (const tx of cashTxData) {
    const billNumber = `BILL-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
    await prisma.cashTransaction.create({
      data: {
        personId: persons[tx.personIdx].id,
        type: tx.type,
        amount: tx.amount,
        notes: tx.notes,
        billNumber,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    });
    await new Promise((r) => setTimeout(r, 10));
  }

  // Seed gold transactions & inventory
  const goldTxData = [
    { personIdx: 0, type: "RECEIVED" as TransactionType, carat: "22k", weight: 100.5, rate: 8500 },
    { personIdx: 1, type: "LENT" as TransactionType, carat: "24k", weight: 50.25, rate: 9200 },
    { personIdx: 2, type: "RECEIVED" as TransactionType, carat: "18k", weight: 75.0, rate: 7100 },
    { personIdx: 3, type: "LENT" as TransactionType, carat: "22k", weight: 30.75, rate: 8500 },
    { personIdx: 0, type: "RECEIVED" as TransactionType, carat: "24k", weight: 25.0, rate: 9200 },
  ];

  for (const tx of goldTxData) {
    const billNumber = `BILL-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
    await prisma.goldTransaction.create({
      data: {
        personId: persons[tx.personIdx].id,
        type: tx.type,
        carat: tx.carat,
        weight: tx.weight,
        ratePerGram: tx.rate,
        totalValue: tx.weight * tx.rate,
        billNumber,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    });
    await new Promise((r) => setTimeout(r, 10));
  }

  // Gold inventory
  const inventoryMap: Record<string, number> = {};
  for (const tx of goldTxData) {
    if (!inventoryMap[tx.carat]) inventoryMap[tx.carat] = 0;
    if (tx.type === "RECEIVED" || tx.type === "DEPOSIT") {
      inventoryMap[tx.carat] += tx.weight;
    } else {
      inventoryMap[tx.carat] -= tx.weight;
    }
  }

  for (const [carat, weight] of Object.entries(inventoryMap)) {
    await prisma.goldInventory.upsert({
      where: { carat },
      create: { carat, weight: Math.max(0, weight) },
      update: { weight: Math.max(0, weight) },
    });
  }

  console.log("✅ Seeding complete!");
  console.log(`   Created ${persons.length} persons`);
  console.log(`   Created ${cashTxData.length} cash transactions`);
  console.log(`   Created ${goldTxData.length} gold transactions`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
