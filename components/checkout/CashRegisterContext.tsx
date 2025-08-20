"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  ReactNode
} from 'react';
import { getActiveCashRegisterByUser } from '@/lib/actions/cashRegisterActions';
import { useAuth } from '@/hooks/use-auth';

type CashRegisterContextType = {
  cashRegister: any;
  setCashRegister: Dispatch<SetStateAction<any>>;
  checkout?: any;
};

const CashRegisterContext = createContext<CashRegisterContextType>({
  cashRegister: null,
  setCashRegister: () => { },
  checkout: null,
});


export function CashRegisterProvider({ children }: { children: ReactNode }) {
  const [cashRegister, setCashRegister] = useState<any>(null);
  const { user } = useAuth();

  // Nuevo estado para checkout
  const [checkout, setCheckout] = useState<any>(null);

  useEffect(() => {
    const fetchActiveCash = async () => {
      if (!user?.id) return;
      try {
        const active = await getActiveCashRegisterByUser(user.id);
        const register = Array.isArray(active) && active.length > 0 ? active[0] : null;
        setCashRegister(register);
        setCheckout(register?.checkout || null);
      } catch {
        setCashRegister(null);
        setCheckout(null);
      }
    };
    fetchActiveCash();
  }, [user?.id]);

  return (
    <CashRegisterContext.Provider value={{ cashRegister, setCashRegister, checkout }}>
      {children}
    </CashRegisterContext.Provider>
  );
}

export function useCashRegister() {
  return useContext(CashRegisterContext);
}
