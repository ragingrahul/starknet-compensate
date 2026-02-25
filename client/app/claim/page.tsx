"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/lib/wallet-context";
import { generateShieldedClaimProof } from "@/lib/prover";
import { withdrawFromPool } from "@/lib/starknet/contract";
import {
  Loader2,
  ShieldCheck,
  KeyRound,
  CheckCircle,
  Wallet,
  Inbox,
  Lock,
} from "lucide-react";

type MerklePath = {
  leafId: string;
  leafIndex: number;
  amount: string;
  nonce: number;
  pathL1: string[];
  indicesL1: number[];
  pathL2: string[];
  indicesL2: number[];
  globalRoot: string;
  companyRoot: string;
  periodOnChainId: string;
  companyId: string;
  token: string;
};

export default function ClaimPage() {
  const { address, wallet, isConnected, connectWallet } = useWallet();
  const [secret, setSecret] = useState("");
  const [paths, setPaths] = useState<MerklePath[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [proving, setProving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const shieldedPoolContract =
    process.env.NEXT_PUBLIC_SHIELDED_POOL_CONTRACT ?? "";

  async function fetchPaths() {
    if (!address || !secret) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `/api/pool/merkle-path?wallet=${encodeURIComponent(address)}`,
      );
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "Failed to fetch paths");
      }
      const data = await res.json();
      // Filter out leaves whose L2 path is not ready yet
      const ready = (data.paths ?? []).filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (p: any) => !p.error,
      ) as MerklePath[];
      setPaths(ready);
      setHasLoaded(true);

      const pending = (data.paths ?? []).filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (p: any) => !!p.error,
      );
      if (pending.length > 0) {
        setError(
          `${pending.length} period(s) not yet available — coordinator has not updated the global root.`,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  async function handleClaim(path: MerklePath) {
    if (!wallet || !address || !secret) return;
    if (!shieldedPoolContract) {
      setError("NEXT_PUBLIC_SHIELDED_POOL_CONTRACT is not configured");
      return;
    }

    setProving(path.leafId);
    setError("");
    setSuccessMsg("");

    try {
      const secretBigInt = BigInt(secret);
      const amount = BigInt(path.amount);

      console.log("[claim] generating shielded proof...");
      console.log("[claim] globalRoot:", path.globalRoot);
      console.log("[claim] companyId:", path.companyId);
      console.log("[claim] periodOnChainId:", path.periodOnChainId);

      const { proof, publicSignals, nullifier } =
        await generateShieldedClaimProof({
          secret: secretBigInt,
          leafNonce: path.nonce,
          pathL1: path.pathL1,
          indicesL1: path.indicesL1,
          pathL2: path.pathL2,
          indicesL2: path.indicesL2,
          periodId: BigInt(path.periodOnChainId),
          companyId: BigInt(path.companyId),
          globalRoot: BigInt(path.globalRoot),
          amount,
          recipientAddress: address,
        });

      console.log("[claim] publicSignals:", publicSignals);
      console.log("[claim] nullifier:", "0x" + nullifier.toString(16));

      // Get Garaga calldata from service
      const calldataRes = await fetch("/api/garaga-calldata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proof, publicSignals }),
      });
      if (!calldataRes.ok) {
        const e = await calldataRes.json();
        throw new Error(e.error || "Failed to generate proof calldata");
      }
      const { calldata } = await calldataRes.json();

      console.log("[claim] calldata length:", calldata.length);

      // Submit withdrawal on-chain
      const txResult = await withdrawFromPool(
        wallet,
        shieldedPoolContract,
        BigInt(path.globalRoot),
        nullifier,
        amount,
        path.token,
        address,
        calldata,
      );

      const txHash = (txResult as { transaction_hash: string })
        .transaction_hash;

      // Mark leaf as claimed in DB
      await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          periodLeafId: path.leafId,
          claimTxHash: txHash,
          nullifierHash: "0x" + nullifier.toString(16),
        }),
      });

      setSuccessMsg(
        `Claim submitted! Tx: ${txHash.slice(0, 10)}...${txHash.slice(-6)}`,
      );
      await fetchPaths();
    } catch (err) {
      console.error("[claim] error:", err);
      setError(err instanceof Error ? err.message : "Claim failed");
    } finally {
      setProving(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-purple-primary" />
          <div>
            <h1 className="text-2xl font-bold">Claim Payroll</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Shielded — company identity hidden via ZK proof
            </p>
          </div>
        </div>

        {!isConnected ? (
          <Card>
            <CardContent className="p-8 flex flex-col items-center gap-4">
              <Wallet className="h-12 w-12 text-muted-foreground" />
              <div className="text-center space-y-1">
                <h2 className="text-lg font-semibold">Connect Your Wallet</h2>
                <p className="text-sm text-muted-foreground">
                  Connect your Starknet wallet to load your claimable payroll.
                </p>
              </div>
              <Button
                onClick={() => connectWallet()}
                className="bg-purple-primary hover:bg-purple-primary/90 text-white"
              >
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Connected:{" "}
                    <span className="font-mono text-foreground">
                      {address?.slice(0, 8)}...{address?.slice(-6)}
                    </span>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secret" className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4" />
                    Your Payroll Secret
                  </Label>
                  <Input
                    id="secret"
                    type="password"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="0x..."
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    The secret you received during onboarding. Never share this.
                  </p>
                </div>

                <Button
                  onClick={fetchPaths}
                  disabled={loading || !secret || !address}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Load Claimable Periods
                </Button>

                {error && <p className="text-sm text-destructive">{error}</p>}
                {successMsg && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    {successMsg}
                  </div>
                )}
              </CardContent>
            </Card>

            {hasLoaded && paths.length === 0 && (
              <Card>
                <CardContent className="p-8 flex flex-col items-center gap-3">
                  <Inbox className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground text-center">
                    No claimable payroll periods found. Your employer may not
                    have deposited to the pool yet, or the coordinator has not
                    updated the global root.
                  </p>
                </CardContent>
              </Card>
            )}

            {paths.map((path) => (
              <Card key={path.leafId}>
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        Period: {path.periodOnChainId}
                      </p>
                      <Badge className="bg-emerald-100 text-emerald-800 flex items-center gap-1 text-xs">
                        <Lock className="h-2.5 w-2.5" />
                        Shielded
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Amount: {path.amount} tokens
                    </p>
                    <p className="text-xs text-muted-foreground font-mono truncate max-w-xs">
                      Root: {path.globalRoot.slice(0, 12)}...
                    </p>
                  </div>
                  <Button
                    onClick={() => handleClaim(path)}
                    disabled={proving === path.leafId}
                    className="bg-purple-primary hover:bg-purple-primary/90 text-white"
                  >
                    {proving === path.leafId ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Proving...
                      </>
                    ) : (
                      "Claim"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
