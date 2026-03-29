export type TransactionType = "LENT" | "RECEIVED" | "DEPOSIT" | "WITHDRAWAL";

export interface Person {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  cashTransactions?: CashTransaction[];
  goldTransactions?: GoldTransaction[];
}

export interface CashTransaction {
  id: string;
  personId: string;
  person?: Person;
  type: TransactionType;
  amount: number;
  date: string;
  notes?: string | null;
  billNumber?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GoldInventory {
  id: string;
  carat: string;
  weight: number;
  updatedAt: string;
}

export interface GoldTransaction {
  id: string;
  personId: string;
  person?: Person;
  type: TransactionType;
  carat: string;
  weight: number;
  ratePerGram?: number | null;
  totalValue?: number | null;
  date: string;
  notes?: string | null;
  billNumber?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CashLedger {
  id: string;
  balance: number;
  updatedAt: string;
}

export interface DashboardStats {
  cashBalance: number;
  totalLent: number;
  totalReceived: number;
  goldInventory: GoldInventory[];
  recentCashTransactions: CashTransaction[];
  recentGoldTransactions: GoldTransaction[];
  cashFlowData: ChartDataPoint[];
  monthlyStats: MonthlyStats[];
}

export interface ChartDataPoint {
  date: string;
  lent: number;
  received: number;
  balance: number;
}

export interface MonthlyStats {
  month: string;
  cashIn: number;
  cashOut: number;
  goldIn: number;
  goldOut: number;
}

export interface GoldCaratSummary {
  carat: string;
  totalWeight: number;
  lentWeight: number;
  receivedWeight: number;
}

export interface BillData {
  billNumber: string;
  date: string;
  person: Person;
  type: "CASH" | "GOLD";
  cashTransaction?: CashTransaction;
  goldTransaction?: GoldTransaction;
  companyName: string;
  companyPhone: string;
  companyAddress: string;
}
