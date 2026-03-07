"use client";

import React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import TransactionTable from "./components/TransactionTable";
import TransactionStats from "./components/TransactionStats";

export default function TransactionsPage() {
  return (
    <div className="flex flex-col space-y-8 px-4 py-6 md:px-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-purple-bg-dark">
          Transactions
        </h1>
        <p className="text-purple-bg-dark3">
          All on-chain payroll transactions for your company.
        </p>
      </div>

      <TransactionStats />

      <div className="rounded-xl shadow-md bg-white/80 backdrop-blur-sm border border-purple-border-secondary transition-all duration-300 hover:shadow-lg">
        <div className="flex items-center justify-between p-6 border-b border-purple-border-secondary">
          <h3 className="text-lg font-medium text-purple-bg-dark">
            Payroll Transactions
          </h3>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1 border-purple-border-secondary hover:bg-purple-bg-light/50 hover:text-purple-primary"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
        <TransactionTable />
      </div>
    </div>
  );
}
