import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@/lib/wallet-context";

export type Period = {
  id: string;
  companyId: string;
  periodId: string;
  label: string | null;
  merkleRoot: string;
  totalGross: string;
  state: "draft" | "funded" | "frozen" | "closed";
  commitTxHash: string | null;
  fundTxHash: string | null;
  freezeTxHash: string | null;
  closeTxHash: string | null;
  committedAt: string | null;
  fundedAt: string | null;
  frozenAt: string | null;
  closedAt: string | null;
  createdAt: string;
};

export type PeriodLeaf = {
  id: string;
  leafIndex: number;
  amount: string;
  claimed: boolean;
  claimTxHash: string | null;
  claimedAt: string | null; // NEW
  employees: { name: string; starknet_wallet_address: string } | null;
};

export function usePayrollPeriods() {
  const { address } = useWallet();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPeriods = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/payroll-periods?wallet=${encodeURIComponent(address)}`,
      );
      if (!res.ok) throw new Error("Failed to fetch periods");
      const data = await res.json();

      setPeriods(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.periods.map((p: any) => ({
          id: p.id,
          companyId: p.company_id,
          periodId: p.period_id,
          label: p.label,
          merkleRoot: p.merkle_root,
          totalGross: p.total_gross,
          state: p.state,
          commitTxHash: p.commit_tx_hash,
          fundTxHash: p.fund_tx_hash,
          freezeTxHash: p.freeze_tx_hash,
          closeTxHash: p.close_tx_hash,
          committedAt: p.committed_at ?? null,
          fundedAt: p.funded_at ?? null,
          frozenAt: p.frozen_at ?? null,
          closedAt: p.closed_at ?? null,
          createdAt: p.created_at,
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [address]);

  const createPeriod = async (
    periodId: string,
    label: string,
    employeeIds: string[],
  ) => {
    if (!address) return { success: false, error: "Not connected" };

    try {
      const res = await fetch("/api/payroll-periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          periodId,
          label,
          employeeIds,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create period");
      }

      const data = await res.json();
      await fetchPeriods();
      return {
        success: true,
        period: data.period,
        merkleRoot: data.merkleRoot,
        totalGross: data.totalGross,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed",
      };
    }
  };

  const updatePeriodState = async (
    dbPeriodId: string,
    newState: "funded" | "frozen" | "closed",
    txHash: string,
  ) => {
    if (!address) return;

    const res = await fetch(`/api/payroll-periods/${dbPeriodId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: address, newState, txHash }),
    });

    if (!res.ok) throw new Error("Failed to update period state");
    await fetchPeriods();
  };

  const saveCommitTx = async (dbPeriodId: string, commitTxHash: string) => {
    if (!address) return;

    await fetch(`/api/payroll-periods/${dbPeriodId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: address, commitTxHash }),
    });

    await fetchPeriods();
  };

  const fetchLeaves = useCallback(
    async (dbPeriodId: string): Promise<PeriodLeaf[]> => {
      if (!address) return [];

      const res = await fetch(
        `/api/payroll-periods/${dbPeriodId}/leaves?wallet=${encodeURIComponent(address)}`,
      );
      if (!res.ok) return [];
      const data = await res.json();
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data.leaves ?? []).map((l: any) => ({
        id: l.id,
        leafIndex: l.leaf_index,
        amount: l.amount,
        claimed: l.claimed,
        claimTxHash: l.claim_tx_hash,
        claimedAt: l.claimed_at,
        employees: l.employees,
      }));
    },
    [address],
  );

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  return {
    periods,
    loading,
    error,
    fetchPeriods,
    createPeriod,
    updatePeriodState,
    saveCommitTx,
    fetchLeaves,
  };
}
