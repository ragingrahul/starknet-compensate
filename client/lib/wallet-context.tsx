"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { connect, disconnect } from "starknetkit";
import type { StarknetWindowObject } from "@starknet-io/types-js";
import { normalizeAddress } from "@/lib/address";

interface WalletContextType {
  address: string | null;
  wallet: StarknetWindowObject | null;
  isConnected: boolean;
  connectWallet: () => Promise<boolean>;
  disconnectWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [wallet, setWallet] = useState<StarknetWindowObject | null>(null);

  useEffect(() => {
    connect({ modalMode: "neverAsk" }).then(({ wallet, connectorData }) => {
      if (connectorData?.account && wallet) {
        setAddress(normalizeAddress(connectorData.account));
        setWallet(wallet);
      }
    });
  }, []);

  const connectWallet = useCallback(async (): Promise<boolean> => {
    const { wallet, connectorData } = await connect({ modalMode: "alwaysAsk" });
    if (connectorData?.account && wallet) {
      setAddress(normalizeAddress(connectorData.account));
      setWallet(wallet);
      return true;
    }
    return false;
  }, []);

  const disconnectWallet = useCallback(async () => {
    await disconnect({ clearLastWallet: true });
    setAddress(null);
    setWallet(null);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        address,
        wallet,
        isConnected: !!address,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within a WalletProvider");
  return ctx;
}
