"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/lib/wallet-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Building2, Wallet, CheckCircle } from "lucide-react";
import { useCompany } from "@/lib/auth-context";

export default function SetupPage() {
  const { address, isConnected, connectWallet } = useWallet();
  const router = useRouter();
  const { refetch } = useCompany();

  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [tokenContract, setTokenContract] = useState("");
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!address) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminWalletAddress: address,
          name,
          tokenContractAddress: tokenContract || undefined,
        }),
      });

      if (res.status === 409) {
        // Already registered — just go to dashboard
        await refetch();
        router.push("/dashboard");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to register");
      }

      await refetch();
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="p-8 flex flex-col items-center gap-6">
            <Building2 className="h-12 w-12 text-purple-primary" />
            <h2 className="text-xl font-semibold">Set Up Your Company</h2>
            <p className="text-muted-foreground text-center text-sm">
              Connect your Starknet wallet to register as a company admin.
            </p>
            <Button
              onClick={connectWallet}
              className="w-full bg-purple-primary hover:bg-purple-primary/90 text-white"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="p-8 flex flex-col items-center gap-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <h2 className="text-xl font-semibold">Company Profile Saved!</h2>
            <p className="text-sm text-muted-foreground text-center">
              Your company is set up. You can now add employees and run private
              payroll periods via the shielded pool.
            </p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-purple-primary hover:bg-purple-primary/90 text-white"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardContent className="p-8">
          <div className="flex flex-col items-center gap-2 mb-6">
            <Building2 className="h-10 w-10 text-purple-primary" />
            <h2 className="text-xl font-semibold">Register Your Company</h2>
            <p className="text-sm text-muted-foreground">
              Connected as {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Corp"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="token">Payroll Token Contract Address *</Label>
              <Input
                id="token"
                value={tokenContract}
                onChange={(e) => setTokenContract(e.target.value)}
                placeholder="0x... ERC20 token your company pays salary in"
                required
              />
              <p className="text-xs text-muted-foreground">
                The ERC20 token your company uses to pay salaries (e.g. STRK,
                USDC). Employees will receive their salary in this token.
              </p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              disabled={loading || !name || !tokenContract}
              className="w-full bg-purple-primary hover:bg-purple-primary/90 text-white"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {loading ? "Saving..." : "Create Company"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
