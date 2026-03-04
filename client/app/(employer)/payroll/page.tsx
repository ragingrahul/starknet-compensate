"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/lib/wallet-context";
import { useCompany } from "@/lib/auth-context";
import { formatTokenAmount } from "@/lib/utils";
import { useEmployees } from "@/hooks/useEmployees";
import {
  usePayrollPeriods,
  type Period,
  type PeriodLeaf,
} from "@/hooks/usePayrollPeriod";
import {
  commitPeriod,
  approveAndFund,
  freezePeriod,
  closePeriod,
  approveAndDepositToPool,
} from "@/lib/starknet/contract";
import {
  Loader2,
  Plus,
  CheckCircle,
  Clock,
  Banknote,
  Snowflake,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const STATE_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  draft: {
    label: "Draft",
    color: "bg-yellow-100 text-yellow-800",
    icon: <Clock className="h-3 w-3" />,
  },
  committed: {
    label: "Committed",
    color: "bg-orange-100 text-orange-800",
    icon: <CheckCircle className="h-3 w-3" />,
  },
  funded: {
    label: "Funded",
    color: "bg-blue-100 text-blue-800",
    icon: <Banknote className="h-3 w-3" />,
  },
  frozen: {
    label: "Frozen",
    color: "bg-purple-100 text-purple-800",
    icon: <Snowflake className="h-3 w-3" />,
  },
  closed: {
    label: "Closed",
    color: "bg-gray-100 text-gray-800",
    icon: <XCircle className="h-3 w-3" />,
  },
};

export default function PayrollPage() {
  const { address, wallet } = useWallet();
  const { company } = useCompany();
  const { employees } = useEmployees();
  const {
    periods,
    loading,
    createPeriod,
    updatePeriodState,
    saveCommitTx,
    fetchLeaves,
  } = usePayrollPeriods();

  const [showCreate, setShowCreate] = useState(false);
  const [periodId, setPeriodId] = useState("");
  const [periodLabel, setPeriodLabel] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedPeriod, setExpandedPeriod] = useState<string | null>(null);
  const [periodLeaves, setPeriodLeaves] = useState<PeriodLeaf[]>([]);
  const [leavesLoading, setLeavesLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingTx, setPendingTx] = useState<string | null>(null);

  const toggleEmployee = (id: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id],
    );
  };

  const selectAllEmployees = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map((e) => e.id));
    }
  };

  async function handleCreate() {
    if (!periodId || selectedEmployees.length === 0) return;
    setCreating(true);
    setError("");

    const result = await createPeriod(periodId, periodLabel, selectedEmployees);

    if (!result.success) {
      setError(result.error || "Failed to create period");
    } else {
      setShowCreate(false);
      setPeriodId("");
      setPeriodLabel("");
      setSelectedEmployees([]);
    }
    setCreating(false);
  }

  const sharedPayrollContract =
    process.env.NEXT_PUBLIC_SHARED_PAYROLL_CONTRACT ?? "";
  const shieldedPoolContract =
    process.env.NEXT_PUBLIC_SHIELDED_POOL_CONTRACT ?? "";

  async function handleCommit(period: Period) {
    if (!wallet || !sharedPayrollContract) return;
    setActionLoading(`commit-${period.id}`);
    setError("");
    setPendingTx(null);

    try {
      const txResult = await commitPeriod(
        wallet,
        sharedPayrollContract,
        period.periodId,
        period.merkleRoot,
        BigInt(period.totalGross),
      );

      const txHash = (txResult as { transaction_hash: string })
        .transaction_hash;
      await saveCommitTx(period.id, txHash);
      setPendingTx(txHash);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Commit failed");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleFund(period: Period) {
    if (!wallet || !sharedPayrollContract || !company?.tokenContractAddress)
      return;
    setActionLoading(`fund-${period.id}`);
    setError("");
    setPendingTx(null);

    try {
      const txResult = await approveAndFund(
        wallet,
        company.tokenContractAddress,
        sharedPayrollContract,
        company.adminWalletAddress,
        period.periodId,
        BigInt(period.totalGross),
      );

      const txHash = (txResult as { transaction_hash: string })
        .transaction_hash;
      await updatePeriodState(period.id, "funded", txHash);
      setPendingTx(txHash);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fund failed");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleFreeze(period: Period) {
    if (!wallet || !sharedPayrollContract) return;
    setActionLoading(`freeze-${period.id}`);
    setError("");
    setPendingTx(null);

    try {
      const txResult = await freezePeriod(
        wallet,
        sharedPayrollContract,
        period.periodId,
      );

      const txHash = (txResult as { transaction_hash: string })
        .transaction_hash;
      await updatePeriodState(period.id, "frozen", txHash);
      setPendingTx(txHash);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Freeze failed");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleClose(period: Period) {
    if (!wallet || !sharedPayrollContract) return;
    setActionLoading(`close-${period.id}`);
    setError("");
    setPendingTx(null);

    try {
      const txResult = await closePeriod(
        wallet,
        sharedPayrollContract,
        period.periodId,
      );

      const txHash = (txResult as { transaction_hash: string })
        .transaction_hash;
      await updatePeriodState(period.id, "closed", txHash);
      setPendingTx(txHash);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Close failed");
    } finally {
      setActionLoading(null);
    }
  }

  /**
   * Shielded pool flow: one-click deposit.
   * Approves + transfers tokens to ShieldedPool, then notifies the backend
   * so the coordinator can batch this period into the next global root update.
   */
  async function handleDepositToPool(period: Period) {
    if (!wallet || !shieldedPoolContract || !company?.tokenContractAddress)
      return;
    setActionLoading(`pool-${period.id}`);
    setError("");
    setPendingTx(null);

    try {
      const txResult = await approveAndDepositToPool(
        wallet,
        company.tokenContractAddress,
        shieldedPoolContract,
        BigInt(period.totalGross),
      );

      const txHash = (txResult as { transaction_hash: string })
        .transaction_hash;
      setPendingTx(txHash);

      // Notify backend so coordinator can include this root in the next global batch
      const submitRes = await fetch("/api/pool/submit-root", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          periodDbId: period.id,
          depositTxHash: txHash,
        }),
      });

      if (!submitRes.ok) {
        const e = await submitRes.json();
        throw new Error(e.error || "Failed to submit root to pool coordinator");
      }

      await updatePeriodState(period.id, "funded", txHash);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pool deposit failed");
    } finally {
      setActionLoading(null);
    }
  }

  async function toggleExpand(period: Period) {
    if (expandedPeriod === period.id) {
      setExpandedPeriod(null);
      setPeriodLeaves([]);
      return;
    }

    setExpandedPeriod(period.id);
    setLeavesLoading(true);
    const leaves = await fetchLeaves(period.id);
    setPeriodLeaves(leaves);
    setLeavesLoading(false);
  }

  function renderActions(period: Period) {
    const isLoading = (action: string) =>
      actionLoading === `${action}-${period.id}`;
    const noSharedContracts =
      !sharedPayrollContract || !company?.tokenContractAddress;
    const noPoolContracts =
      !shieldedPoolContract || !company?.tokenContractAddress;

    switch (period.state) {
      case "draft":
        return (
          <div className="flex gap-2 flex-wrap">
            {/* Shielded pool path (private) */}
            <Button
              size="sm"
              onClick={() => handleDepositToPool(period)}
              disabled={isLoading("pool") || noPoolContracts}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              title="Deposit to shielded pool — hides which company paid which employee"
            >
              {isLoading("pool") ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : null}
              Deposit to Pool (Private)
            </Button>

            {/* Legacy SharedPayroll path */}
            {!period.commitTxHash ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCommit(period)}
                disabled={isLoading("commit") || noSharedContracts}
                title="Commit Merkle root on-chain (non-private mode)"
              >
                {isLoading("commit") ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : null}
                Commit (Non-Private)
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFund(period)}
                disabled={isLoading("fund") || noSharedContracts}
              >
                {isLoading("fund") ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : null}
                Fund
              </Button>
            )}
          </div>
        );
      case "funded":
        return (
          <div className="flex gap-2">
            {/* If funded via pool, show "Awaiting Global Root" */}
            {shieldedPoolContract ? (
              <span className="text-sm text-emerald-700 font-medium px-3 py-1 bg-emerald-50 rounded border border-emerald-200">
                Awaiting global root update by coordinator
              </span>
            ) : (
              <Button
                size="sm"
                onClick={() => handleFreeze(period)}
                disabled={isLoading("freeze") || noSharedContracts}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isLoading("freeze") ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : null}
                Freeze (Open Claims)
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleClose(period)}
              disabled={isLoading("close")}
            >
              {isLoading("close") ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : null}
              Close
            </Button>
          </div>
        );
      case "frozen":
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm text-purple-700 font-medium px-3 py-1 bg-purple-50 rounded border border-purple-200">
              Open for claims
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleClose(period)}
              disabled={isLoading("close")}
            >
              {isLoading("close") ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : null}
              Close Period
            </Button>
          </div>
        );
      case "closed":
        return <span className="text-sm text-muted-foreground">Completed</span>;
      default:
        return null;
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 bg-gradient-to-br from-background to-purple-bg-light">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-purple-bg-dark">
          Payroll Periods
        </h1>
        <Button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-purple-primary hover:bg-purple-primary/90 text-white"
        >
          <Plus className="mr-1 h-4 w-4" />
          New Period
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {pendingTx && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-center justify-between">
          <span>
            Transaction submitted. Awaiting on-chain confirmation:{" "}
            <span className="font-mono">
              {pendingTx.slice(0, 10)}...{pendingTx.slice(-6)}
            </span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-700 hover:text-blue-900"
            onClick={() => setPendingTx(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      {!company?.tokenContractAddress && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          Token contract address not configured. Go to company setup to set your
          payroll token.
        </div>
      )}
      {!shieldedPoolContract && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          NEXT_PUBLIC_SHIELDED_POOL_CONTRACT is not set — deploy ShieldedPool
          and add it to .env.local to enable private payroll.
        </div>
      )}

      {showCreate && (
        <Card className="border-purple-border-secondary">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">Create Payroll Period</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Period ID (on-chain identifier)</Label>
                <Input
                  value={periodId}
                  onChange={(e) => setPeriodId(e.target.value)}
                  placeholder="e.g. 1, 2, 202602..."
                />
              </div>
              <div className="space-y-2">
                <Label>Label (human-readable)</Label>
                <Input
                  value={periodLabel}
                  onChange={(e) => setPeriodLabel(e.target.value)}
                  placeholder="e.g. February 2026"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>
                  Select Employees ({selectedEmployees.length}/
                  {employees.length})
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={selectAllEmployees}
                >
                  {selectedEmployees.length === employees.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>
              <div className="max-h-48 overflow-y-auto border rounded-lg divide-y">
                {employees.map((emp) => (
                  <label
                    key={emp.id}
                    className="flex items-center gap-3 p-3 hover:bg-purple-bg-light/30 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(emp.id)}
                      onChange={() => toggleEmployee(emp.id)}
                      className="rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <span className="font-medium">{emp.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {emp.role ?? ""}
                      </span>
                    </div>
                    <span className="text-sm font-mono">${emp.salary}</span>
                  </label>
                ))}
                {employees.length === 0 && (
                  <p className="p-3 text-sm text-muted-foreground">
                    No employees found
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={
                  creating || !periodId || selectedEmployees.length === 0
                }
                className="bg-purple-primary hover:bg-purple-primary/90 text-white"
              >
                {creating ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : null}
                Create Period & Build Merkle Tree
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-primary" />
        </div>
      ) : periods.length === 0 ? (
        <Card className="border-purple-border-secondary">
          <CardContent className="p-12 text-center">
            <Banknote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-1">No payroll periods yet</h3>
            <p className="text-sm text-muted-foreground">
              Create your first period to start processing payroll.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {periods.map((period) => {
            const displayState =
              period.state === "draft" && period.commitTxHash
                ? "committed"
                : period.state;
            const stateConf = STATE_CONFIG[displayState] ?? STATE_CONFIG.draft;
            const isExpanded = expandedPeriod === period.id;

            return (
              <Card
                key={period.id}
                className="border-purple-border-secondary overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleExpand(period)}
                        className="p-1 hover:bg-muted rounded"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {period.label || `Period ${period.periodId}`}
                          </span>
                          <Badge
                            className={`${stateConf.color} flex items-center gap-1`}
                          >
                            {stateConf.icon}
                            {stateConf.label}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1 flex gap-4">
                          <span>ID: {period.periodId}</span>
                          <span>Total: {formatTokenAmount(period.totalGross)} tokens</span>
                          <span>
                            {new Date(period.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {renderActions(period)}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t bg-muted/20 p-5">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Merkle Root
                          </span>
                          <p className="font-mono text-xs truncate">
                            {period.merkleRoot}
                          </p>
                        </div>
                        {period.commitTxHash && (
                          <div>
                            <span className="text-muted-foreground">
                              Commit Tx
                            </span>
                            <p className="font-mono text-xs truncate">
                              {period.commitTxHash}
                            </p>
                          </div>
                        )}
                        {period.fundTxHash && (
                          <div>
                            <span className="text-muted-foreground">
                              Fund Tx
                            </span>
                            <p className="font-mono text-xs truncate">
                              {period.fundTxHash}
                            </p>
                          </div>
                        )}
                        {period.freezeTxHash && (
                          <div>
                            <span className="text-muted-foreground">
                              Freeze Tx
                            </span>
                            <p className="font-mono text-xs truncate">
                              {period.freezeTxHash}
                            </p>
                          </div>
                        )}
                      </div>

                      <h4 className="font-medium mb-2">Employee Leaves</h4>
                      {leavesLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-purple-primary" />
                      ) : periodLeaves.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No leaves found
                        </p>
                      ) : (
                        <div className="border rounded-lg divide-y">
                          {periodLeaves.map((leaf) => (
                            <div
                              key={leaf.id}
                              className="flex items-center justify-between p-3 text-sm"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-muted-foreground">
                                  #{leaf.leafIndex}
                                </span>
                                <span className="font-medium">
                                  {leaf.employees?.name ?? "Unknown"}
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="font-mono">
                                  {formatTokenAmount(leaf.amount)} tokens
                                </span>
                                {leaf.claimed ? (
                                  <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Claimed
                                  </Badge>
                                ) : (
                                  <Badge className="bg-gray-100 text-gray-600">
                                    Unclaimed
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
