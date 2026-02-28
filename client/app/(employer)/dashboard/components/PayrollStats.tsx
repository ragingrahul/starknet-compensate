"use client";

import { usePayrollPeriods } from "@/hooks/usePayrollPeriod";
import { useEmployees } from "@/hooks/useEmployees";
import { formatTokenAmount } from "@/lib/utils";
import { Users, Banknote, CheckCircle, Clock, Landmark } from "lucide-react";
import Link from "next/link";

export default function PayrollStats() {
  const { periods } = usePayrollPeriods();
  const { employees } = useEmployees();

  const activePeriods = periods.filter((p) => p.state === "frozen").length;
  const pendingPeriods = periods.filter(
    (p) => p.state === "draft" || p.state === "funded",
  ).length;
  const completedPeriods = periods.filter((p) => p.state === "closed").length;

  const latestPeriod = periods[0];

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex gap-3 items-center border-b border-purple-border-secondary pb-4 mb-4">
        <Landmark className="text-purple-primary" />
        <span className="font-semibold text-lg text-purple-bg-dark">
          Payroll Stats
        </span>
      </div>

      <div className="flex flex-col space-y-4 pb-6 border-b border-purple-border-secondary">
        <div className="flex justify-between items-center">
          <span className="font-medium text-purple-bg-dark3 flex items-center gap-1.5">
            <Users className="h-4 w-4 text-purple-primary" />
            Employees
          </span>
          <span className="font-semibold">{employees.length}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-purple-bg-dark3 flex items-center gap-1.5">
            <Banknote className="h-4 w-4 text-purple-primary" />
            Total Periods
          </span>
          <span className="font-semibold">{periods.length}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-purple-bg-dark3 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-yellow-600" />
            Pending
          </span>
          <span className="font-semibold">{pendingPeriods}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-purple-bg-dark3 flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Active (Claimable)
          </span>
          <span className="font-semibold">{activePeriods}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-purple-bg-dark3 flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-gray-500" />
            Completed
          </span>
          <span className="font-semibold">{completedPeriods}</span>
        </div>
      </div>

      {latestPeriod && (
        <div className="flex flex-col space-y-3 py-4 my-4 bg-gradient-to-r from-purple-bg-light to-purple-bg-light2 rounded-xl p-4 shadow-sm">
          <span className="font-medium text-purple-bg-dark text-sm">
            Latest Period
          </span>
          <div className="flex justify-between items-center">
            <span className="text-sm text-purple-bg-dark3">Name</span>
            <span className="text-sm font-medium">
              {latestPeriod.label || `Period ${latestPeriod.periodId}`}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-purple-bg-dark3">State</span>
            <span className="text-sm font-medium capitalize">
              {latestPeriod.state}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-purple-bg-dark3">Total</span>
            <span className="text-sm font-medium">
              {formatTokenAmount(latestPeriod.totalGross)} tokens
            </span>
          </div>
        </div>
      )}

      <Link href="/payroll" className="mt-auto">
        <button className="w-full flex flex-row justify-center gap-2 text-white bg-gradient-to-r from-purple-bg-dark2 to-purple-primary p-3 rounded-lg font-semibold text-base hover:opacity-90 transition-all duration-200 shadow-sm">
          <Landmark className="h-5 w-5" />
          Go to Payroll
        </button>
      </Link>
    </div>
  );
}
