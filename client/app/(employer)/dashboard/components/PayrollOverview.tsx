"use client";

import Link from "next/link";
import { usePayrollPeriods } from "@/hooks/usePayrollPeriod";
import { formatTokenAmount } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Clock,
  Banknote,
  Snowflake,
  XCircle,
  ArrowRight,
  Plus,
} from "lucide-react";

const STATE_BADGE: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  draft: {
    label: "Draft",
    color: "bg-yellow-100 text-yellow-800",
    icon: <Clock className="h-3 w-3" />,
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

export default function PayrollOverview() {
  const { periods, loading } = usePayrollPeriods();

  const counts = { draft: 0, funded: 0, frozen: 0, closed: 0 };
  let totalDisbursed = 0n;
  for (const p of periods) {
    counts[p.state] = (counts[p.state] ?? 0) + 1;
    if (p.state !== "draft") totalDisbursed += BigInt(p.totalGross);
  }

  const recent = periods.slice(0, 5);

  return (
    <div className="p-6 flex flex-col h-full">
      <div className="pb-4 mb-4 border-b border-purple-border-secondary flex items-center justify-between">
        <h2 className="text-lg font-semibold text-purple-bg-dark2">
          Payroll Overview
        </h2>
        <Link href="/payroll">
          <Button size="sm" variant="ghost" className="text-purple-primary">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-purple-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {(["draft", "funded", "frozen", "closed"] as const).map((state) => {
              const cfg = STATE_BADGE[state];
              return (
                <div
                  key={state}
                  className="rounded-lg border border-purple-border-secondary p-3 text-center"
                >
                  <div className="text-2xl font-bold text-purple-bg-dark">
                    {counts[state]}
                  </div>
                  <Badge
                    className={`${cfg.color} mt-1 flex items-center gap-1 justify-center`}
                  >
                    {cfg.icon}
                    {cfg.label}
                  </Badge>
                </div>
              );
            })}
          </div>

          <div className="text-sm text-muted-foreground mb-4">
            Total committed:{" "}
            <span className="font-semibold text-purple-bg-dark">
              {formatTokenAmount(totalDisbursed.toString())} tokens
            </span>{" "}
            across {periods.length} period{periods.length !== 1 ? "s" : ""}
          </div>

          {recent.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <Banknote className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                No payroll periods yet
              </p>
              <Link href="/payroll">
                <Button className="bg-purple-primary hover:bg-purple-primary/90 text-white">
                  <Plus className="mr-1 h-4 w-4" /> Create First Period
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2 flex-1">
              <h3 className="text-sm font-medium text-purple-bg-dark3 mb-2">
                Recent Periods
              </h3>
              {recent.map((period) => {
                const cfg = STATE_BADGE[period.state] ?? STATE_BADGE.draft;
                return (
                  <div
                    key={period.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-purple-border-secondary hover:bg-purple-bg-light/30 transition-colors"
                  >
                    <div>
                      <span className="font-medium text-sm">
                        {period.label || `Period ${period.periodId}`}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {formatTokenAmount(period.totalGross)} tokens
                      </span>
                    </div>
                    <Badge className={`${cfg.color} flex items-center gap-1`}>
                      {cfg.icon}
                      {cfg.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}

          <Link href="/payroll" className="mt-4">
            <Button className="w-full bg-gradient-to-r from-purple-bg-dark2 to-purple-primary hover:opacity-90 text-white font-semibold py-5">
              <Banknote className="mr-2 h-5 w-5" />
              Manage Payroll
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}
