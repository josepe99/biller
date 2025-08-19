"use client"

import { createContext, useContext, useState, useEffect, Dispatch, SetStateAction, ReactNode } from 'react';
import { getActiveCashRegisters } from '@/lib/actions/cashRegisterActions';

type CashRegisterContextType = {
  cashRegister: any;
  setCashRegister: Dispatch<SetStateAction<any>>;
};

const CashRegisterContext = createContext<CashRegisterContextType>({
  cashRegister: null,
  setCashRegister: () => {},
});

export function CashRegisterProvider({ children }: { children: ReactNode }) {
  const [cashRegister, setCashRegister] = useState<any>(null);

  useEffect(() => {
    const fetchActiveCash = async () => {
      try {
        const actives = await getActiveCashRegisters();
        setCashRegister(Array.isArray(actives) && actives.length > 0 ? actives[0] : null);
      } catch {
        setCashRegister(null);
      }
    };
    fetchActiveCash();
  }, []);

  return (
    <CashRegisterContext.Provider value={{ cashRegister, setCashRegister }}>
      {children}
    </CashRegisterContext.Provider>
  );
}

export function useCashRegister() {
  return useContext(CashRegisterContext);
}
