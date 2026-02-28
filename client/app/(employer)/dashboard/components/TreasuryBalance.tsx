"use client";

import { Landmark } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { formatTokenAmount } from "@/lib/utils";

function TreasuryBalance() {
  const { stats } = useTransactions();

  return (
    <div className="flex flex-col sm:flex-row justify-between p-6 h-full gap-4 sm:gap-0">
      <div className="flex flex-col space-y-4 justify-between">
        <h1 className="text-base font-semibold text-purple-bg-dark2 flex items-center">
          <span className="mr-2">Treasury Balance</span>
          <span className="px-2 py-1 bg-purple-bg-light text-xs rounded-full text-purple-bg-dark2 font-medium">
            Token
          </span>
        </h1>
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-baseline">
            {formatTokenAmount(stats.totalCommitted.toString())} STARK
          </h2>{" "}
          <p className="text-purple-bg-dark3 text-sm font-medium flex items-center">
            Total amount deposited to shielded pool
          </p>
        </div>
      </div>
      <div className="bg-gradient-to-br from-purple-bg-light2 to-purple-primary/20 p-4 h-fit rounded-xl shadow-sm self-start sm:self-auto flex items-center justify-center">
        <Landmark className="h-10 w-10 text-purple-primary" />
      </div>
    </div>
  );
}

export default TreasuryBalance;
