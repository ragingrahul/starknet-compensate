"use client";

import { useWallet } from "@/lib/wallet-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCircle2, Wallet, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function ProfilePage() {
  const { address, isConnected, connectWallet, disconnectWallet } = useWallet();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success("Address copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const shortAddress = address
    ? `${address.slice(0, 10)}...${address.slice(-8)}`
    : null;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle2 className="h-5 w-5 text-purple-primary" />
              Account
            </CardTitle>
            <CardDescription>Your connected Starknet identity</CardDescription>
          </CardHeader>
          <CardContent>
            {isConnected && address ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-md border border-purple-100">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-sm font-medium text-purple-800">
                    Wallet connected
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-500 mb-1">
                    Full Address
                  </p>
                  <p className="font-mono text-xs break-all text-neutral-700">
                    {address}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="w-full"
                >
                  {copied ? (
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="mr-2 h-4 w-4" />
                  )}
                  {copied ? "Copied!" : "Copy Address"}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-neutral-500">No wallet connected.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-purple-primary" />
              Wallet
            </CardTitle>
            <CardDescription>Manage your Starknet wallet connection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isConnected ? (
              <>
                <div className="p-3 bg-neutral-100 rounded-md">
                  <p className="font-mono text-xs break-all">{shortAddress}</p>
                </div>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={disconnectWallet}
                >
                  Disconnect Wallet
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-neutral-500">
                  Connect your Starknet wallet to use the platform.
                </p>
                <Button className="w-full" onClick={connectWallet}>
                  Connect Wallet
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
