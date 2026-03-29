"use client";

import { useState, useEffect } from "react";
import { CaratOptionType, TransactionTypeOption } from "@/types";
import { DEFAULT_CARAT_OPTIONS, DEFAULT_TRANSACTION_TYPES } from "@/lib/utils";

export function useCaratOptions() {
  const [caratOptions, setCaratOptions] = useState<CaratOptionType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings/carat-options")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCaratOptions(data);
        } else {
          setCaratOptions(
            DEFAULT_CARAT_OPTIONS.map((o, i) => ({
              id: o.value,
              value: o.value,
              label: o.label,
              sortOrder: i,
              isActive: true,
            }))
          );
        }
      })
      .catch(() => {
        setCaratOptions(
          DEFAULT_CARAT_OPTIONS.map((o, i) => ({
            id: o.value,
            value: o.value,
            label: o.label,
            sortOrder: i,
            isActive: true,
          }))
        );
      })
      .finally(() => setLoading(false));
  }, []);

  return { caratOptions, loading };
}

export function useTransactionTypes() {
  const [transactionTypes, setTransactionTypes] = useState<TransactionTypeOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings/transaction-types")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTransactionTypes(data);
        } else {
          setTransactionTypes(
            DEFAULT_TRANSACTION_TYPES.map((o, i) => ({
              id: o.value,
              value: o.value,
              label: o.label,
              color: "#6b7280",
              sortOrder: i,
              isActive: true,
            }))
          );
        }
      })
      .catch(() => {
        setTransactionTypes(
          DEFAULT_TRANSACTION_TYPES.map((o, i) => ({
            id: o.value,
            value: o.value,
            label: o.label,
            color: "#6b7280",
            sortOrder: i,
            isActive: true,
          }))
        );
      })
      .finally(() => setLoading(false));
  }, []);

  return { transactionTypes, loading };
}

export function useDynamicOptions() {
  const { caratOptions, loading: caratLoading } = useCaratOptions();
  const { transactionTypes, loading: typesLoading } = useTransactionTypes();

  return {
    caratOptions,
    transactionTypes,
    loading: caratLoading || typesLoading,
  };
}
