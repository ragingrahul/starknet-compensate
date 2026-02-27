import { useMemo, useState, useCallback, useEffect } from "react";
import { usePayrollPeriods } from "./usePayrollPeriod";

export type Transaction = {
  id: string;
  txHash: string;
  type: "commit" | "fund" | "freeze" | "close" | "claim";
  periodLabel: string;
  periodId: string;
  amount: string;
  date: string;
  employeeName?: string;
  employeeWallet?: string;
};

export function useTransactions() {
  const { periods, loading, error, fetchLeaves } = usePayrollPeriods();
  const [claimTxs, setClaimTxs] = useState<Transaction[]>([]);
  const [claimsLoading, setClaimsLoading] = useState(false);

  const periodTxs = useMemo(() => {
    const txs: Transaction[] = [];

    for (const p of periods) {
      const label = p.label || `Period ${p.periodId}`;

      if (p.commitTxHash) {
        txs.push({
          id: `${p.id}-commit`,
          txHash: p.commitTxHash,
          type: "commit",
          periodLabel: label,
          periodId: p.periodId,
          amount: p.totalGross,
          date: p.committedAt ?? p.createdAt,
        });
      }
      if (p.fundTxHash) {
        txs.push({
          id: `${p.id}-fund`,
          txHash: p.fundTxHash,
          type: "fund",
          periodLabel: label,
          periodId: p.periodId,
          amount: p.totalGross,
          date: p.fundedAt ?? p.createdAt,
        });
      }
      if (p.freezeTxHash) {
        txs.push({
          id: `${p.id}-freeze`,
          txHash: p.freezeTxHash,
          type: "freeze",
          periodLabel: label,
          periodId: p.periodId,
          amount: p.totalGross,
          date: p.frozenAt ?? p.createdAt,
        });
      }
      if (p.closeTxHash) {
        txs.push({
          id: `${p.id}-close`,
          txHash: p.closeTxHash,
          type: "close",
          periodLabel: label,
          periodId: p.periodId,
          amount: p.totalGross,
          date: p.closedAt ?? p.createdAt,
        });
      }
    }

    return txs;
  }, [periods]);

  const loadClaimTxs = useCallback(async () => {
    const frozenOrClosed = periods.filter(
      (p) => p.state === "frozen" || p.state === "closed",
    );
    if (frozenOrClosed.length === 0) {
      setClaimTxs([]);
      return;
    }

    setClaimsLoading(true);
    const allClaims: Transaction[] = [];

    for (const p of frozenOrClosed) {
      const leaves = await fetchLeaves(p.id);
      const label = p.label || `Period ${p.periodId}`;

      for (const leaf of leaves) {
        if (leaf.claimed && leaf.claimTxHash) {
          allClaims.push({
            id: `${leaf.id}-claim`,
            txHash: leaf.claimTxHash,
            type: "claim",
            periodLabel: label,
            periodId: p.periodId,
            amount: leaf.amount,
            date: leaf.claimedAt ?? p.frozenAt ?? p.createdAt,
            employeeName: leaf.employees?.name,
            employeeWallet: leaf.employees?.starknet_wallet_address,
          });
        }
      }
    }

    setClaimTxs(allClaims);
    setClaimsLoading(false);
  }, [periods, fetchLeaves]);

  useEffect(() => {
    if (periods.length > 0) {
      loadClaimTxs();
    }
  }, [periods.length, loadClaimTxs]);

  const allTransactions = useMemo(() => {
    return [...periodTxs, ...claimTxs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [periodTxs, claimTxs]);

  const stats = useMemo(() => {
    const totalTxCount = allTransactions.length;
    const totalCommitted = periods
      .filter((p) => p.state !== "draft")
      .reduce((acc, p) => acc + BigInt(p.totalGross), 0n);
    const totalClaimed = claimTxs.reduce(
      (acc, tx) => acc + BigInt(tx.amount),
      0n,
    );
    const claimCount = claimTxs.length;
    const periodCount = periods.length;

    return {
      totalTxCount,
      totalCommitted,
      totalClaimed,
      claimCount,
      periodCount,
    };
  }, [allTransactions, periods, claimTxs]);

  return {
    transactions: allTransactions,
    stats,
    loading: loading || claimsLoading,
    error,
  };
}
