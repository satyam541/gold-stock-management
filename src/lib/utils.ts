import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "PKR"): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatWeight(weight: number): string {
  return `${weight.toFixed(3)}g`;
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), "dd MMM yyyy");
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "dd MMM yyyy, hh:mm a");
}

export function getTransactionBadgeClass(type: string): string {
  switch (type) {
    case "LENT":
      return "badge-lent";
    case "RECEIVED":
      return "badge-received";
    case "DEPOSIT":
      return "badge-deposit";
    case "WITHDRAWAL":
      return "badge-withdrawal";
    default:
      return "";
  }
}

export function getTransactionLabel(type: string): string {
  switch (type) {
    case "LENT":
      return "Lent Out";
    case "RECEIVED":
      return "Received";
    case "DEPOSIT":
      return "Deposit";
    case "WITHDRAWAL":
      return "Withdrawal";
    default:
      return type;
  }
}

export function generateBillNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `BILL-${year}${month}${day}-${random}`;
}

export const CARAT_OPTIONS = [
  { value: "24k", label: "24 Karat (Pure Gold)" },
  { value: "22k", label: "22 Karat" },
  { value: "21k", label: "21 Karat" },
  { value: "18k", label: "18 Karat" },
  { value: "14k", label: "14 Karat" },
];

export const TRANSACTION_TYPES = [
  { value: "LENT", label: "Lent Out" },
  { value: "RECEIVED", label: "Received" },
  { value: "DEPOSIT", label: "Deposit" },
  { value: "WITHDRAWAL", label: "Withdrawal" },
];
