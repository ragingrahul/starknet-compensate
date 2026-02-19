"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
// Define network types
export type NetworkChain = "starknet";

// Define network information interface
export interface NetworkInfo {
  id: string;
  name: string;
  value: string;
  chain: NetworkChain;
  networkType: string;
  isTestnet: boolean;
}

// Define all supported networks
export const SUPPORTED_NETWORKS: NetworkInfo[] = [
  {
    id: "starknet-mainnet",
    name: "Starknet Mainnet",
    value: "starknet-mainnet",
    chain: "starknet",
    networkType: "mainnet",
    isTestnet: false,
  },
  {
    id: "starknet-sepolia",
    name: "Starknet Sepolia",
    value: "starknet-sepolia",
    chain: "starknet",
    networkType: "sepolia",
    isTestnet: true,
  },
];

// Define context value interface
interface NetworkContextValue {
  selectedNetwork: NetworkInfo;
  networkList: NetworkInfo[];
  changeSelectedNetwork: (networkId: string) => Promise<boolean>;
}

// Create the context
const NetworkContext = createContext<NetworkContextValue | undefined>(
  undefined
);

// NetworkProvider props
interface NetworkProviderProps {
  children: ReactNode;
  defaultNetwork?: NetworkInfo;
}

// Default network is Starknet Mainnet
const DEFAULT_NETWORK = SUPPORTED_NETWORKS[0];

export function NetworkProvider({
  children,
  defaultNetwork = DEFAULT_NETWORK,
}: NetworkProviderProps) {
  const [selectedNetwork, setSelectedNetwork] =
    useState<NetworkInfo>(defaultNetwork);

  // Function to change network
  const changeSelectedNetwork = useCallback(async (networkId: string) => {
    try {
      // Find the network object from our options
      const networkObj = SUPPORTED_NETWORKS.find((n) => n.id === networkId);

      if (!networkObj) {
        console.error("Network not found:", networkId);
        return false;
      }

      // Update selected network
      setSelectedNetwork(networkObj);

      // We'll handle actual network changes in the wallet hooks
      // This context just tracks which network is selected
      console.log("Network selection changed to:", networkObj.name);
      return true;
    } catch (error) {
      console.error("Failed to change network:", error);
      return false;
    }
  }, []);

  // Value to be provided by the context
  const value = {
    selectedNetwork,
    networkList: SUPPORTED_NETWORKS,
    changeSelectedNetwork,
  };

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
}

// Hook to use the network context
export function useNetwork() {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return context;
}
