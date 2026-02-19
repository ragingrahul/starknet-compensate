// lib/auth-context.tsx

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useWallet } from "@/lib/wallet-context";

type CompanyData = {
  id: string;
  name: string;
  adminWalletAddress: string;
  /** ERC20 token this company uses for payroll. */
  tokenContractAddress: string | null;
};

type CompanyContextType = {
  company: CompanyData | null;
  isLoading: boolean;
  isAdmin: boolean;
  refetch: () => Promise<void>;
};

const CompanyContext = createContext<CompanyContextType>({
  company: null,
  isLoading: true,
  isAdmin: false,
  refetch: async () => {},
});

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { address } = useWallet();
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCompany = useCallback(async () => {
    if (!address) {
      setCompany(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/companies?wallet=${encodeURIComponent(address)}`,
      );
      const data = res.ok ? await res.json() : null;

      if (data?.company) {
        setCompany({
          id: data.company.id,
          name: data.company.name,
          adminWalletAddress: data.company.admin_wallet_address,
          tokenContractAddress: data.company.token_contract_address,
        });
      } else {
        setCompany(null);
      }
    } catch {
      setCompany(null);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  return (
    <CompanyContext.Provider
      value={{ company, isLoading, isAdmin: !!company, refetch: fetchCompany }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  return useContext(CompanyContext);
}
