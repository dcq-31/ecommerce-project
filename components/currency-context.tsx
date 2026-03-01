"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_CURRENCY } from "lib/currency";
import type { Currency } from "lib/types";

type CurrencyContextType = {
  currency: string;
  setCurrency: (code: string) => void;
  rate: number;
  currencies: Currency[];
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: DEFAULT_CURRENCY,
  setCurrency: () => {},
  rate: 1,
  currencies: [],
});

export function CurrencyProvider({
  currencies,
  children,
}: {
  currencies: Currency[];
  children: React.ReactNode;
}) {
  const [currency, setCurrencyState] = useState<string>(DEFAULT_CURRENCY);

  useEffect(() => {
    const stored = localStorage.getItem("currency");
    if (stored && currencies.some((c) => c.name === stored)) {
      setCurrencyState(stored);
    }
  }, [currencies]);

  function setCurrency(code: string) {
    setCurrencyState(code);
    localStorage.setItem("currency", code);
  }

  const rate = currencies.find((c) => c.name === currency)?.rate ?? 1;

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rate, currencies }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
