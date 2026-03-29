import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Seed Dynamic Module Configuration ───────────────

  // Carat options
  const caratData = [
    { value: "24k", label: "24 Karat (Pure Gold)", sortOrder: 0 },
    { value: "22k", label: "22 Karat", sortOrder: 1 },
    { value: "21k", label: "21 Karat", sortOrder: 2 },
    { value: "18k", label: "18 Karat", sortOrder: 3 },
    { value: "14k", label: "14 Karat", sortOrder: 4 },
  ];

  for (const c of caratData) {
    await prisma.caratOption.upsert({
      where: { value: c.value },
      create: c,
      update: { label: c.label, sortOrder: c.sortOrder },
    });
  }

  // Transaction types
  const typeData = [
    { value: "LENT", label: "Lent Out", color: "#ef4444", sortOrder: 0 },
    { value: "RECEIVED", label: "Received", color: "#22c55e", sortOrder: 1 },
    { value: "DEPOSIT", label: "Deposit", color: "#3b82f6", sortOrder: 2 },
    { value: "WITHDRAWAL", label: "Withdrawal", color: "#f59e0b", sortOrder: 3 },
  ];

  for (const t of typeData) {
    await prisma.transactionTypeOption.upsert({
      where: { value: t.value },
      create: t,
      update: { label: t.label, color: t.color, sortOrder: t.sortOrder },
    });
  }

  // App settings
  const settings = [
    { key: "company_name", value: "AssetFlow Management" },
    { key: "company_phone", value: "+92 300 0000000" },
    { key: "company_address", value: "Lahore, Pakistan" },
    { key: "company_email", value: "info@assetflow.pk" },
  ];

  for (const s of settings) {
    await prisma.appSetting.upsert({
      where: { key: s.key },
      create: s,
      update: { value: s.value },
    });
  }

  // ─── Seed Business Data ─────────────────────────────

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
    { personIdx: 0, type: "LENT", amount: 50000, notes: "Short term loan" },
    { personIdx: 1, type: "RECEIVED", amount: 75000, notes: "Repayment of previous loan" },
    { personIdx: 2, type: "DEPOSIT", amount: 200000, notes: "Initial cash deposit" },
    { personIdx: 0, type: "RECEIVED", amount: 25000, notes: "Partial repayment" },
    { personIdx: 3, type: "LENT", amount: 30000, notes: "Business advance" },
    { personIdx: 2, type: "WITHDRAWAL", amount: 40000, notes: "Operational expenses" },
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
    { personIdx: 0, type: "RECEIVED", carat: "22k", weight: 100.5, rate: 8500 },
    { personIdx: 1, type: "LENT", carat: "24k", weight: 50.25, rate: 9200 },
    { personIdx: 2, type: "RECEIVED", carat: "18k", weight: 75.0, rate: 7100 },
    { personIdx: 3, type: "LENT", carat: "22k", weight: 30.75, rate: 8500 },
    { personIdx: 0, type: "RECEIVED", carat: "24k", weight: 25.0, rate: 9200 },
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
  console.log(`   Created ${caratData.length} carat options`);
  console.log(`   Created ${typeData.length} transaction types`);
  console.log(`   Created ${settings.length} app settings`);
  console.log(`   Created ${persons.length} persons`);
  console.log(`   Created ${cashTxData.length} cash transactions`);
  console.log(`   Created ${goldTxData.length} gold transactions`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
