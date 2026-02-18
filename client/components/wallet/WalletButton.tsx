"use client";

import Button from "@/components/Button";
import { UserCircle2 } from "lucide-react";
import { useWallet } from "@/lib/wallet-context";

interface WalletButtonProps {
  connectText?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function WalletButton({
  connectText = "Connect Wallet",
  variant = "primary",
  size = "md",
  className,
}: WalletButtonProps) {
  const { address, isConnected, connectWallet, disconnectWallet } = useWallet();

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  const handleClick = async () => {
    if (isConnected) {
      await disconnectWallet();
    } else {
      await connectWallet();
    }
  };

  return (
    <Button
      name={shortAddress ?? connectText}
      icon={UserCircle2}
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
    />
  );
}
