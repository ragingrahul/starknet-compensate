"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  TrendingUp,
  Wallet,
  Banknote,
  CheckCircle,
} from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { formatTokenAmount } from "@/lib/utils";

const TransactionStats = () => {
  const { stats, loading } = useTransactions();

  const cards = [
    {
      title: "Total Transactions",
      value: String(stats.totalTxCount),
      description: `across ${stats.periodCount} payroll periods`,
      icon: <TrendingUp className="h-4 w-4 text-green-500" />,
    },
    {
      title: "Total Committed",
      value: `${formatTokenAmount(stats.totalCommitted.toString())} tokens`,
      description: "funded on-chain",
      icon: <Wallet className="h-4 w-4 text-purple-primary" />,
    },
    {
      title: "Total Claimed",
      value: `${formatTokenAmount(stats.totalClaimed.toString())} tokens`,
      description: "withdrawn by employees",
      icon: <Banknote className="h-4 w-4 text-blue-500" />,
    },
    {
      title: "Claims Processed",
      value: String(stats.claimCount),
      description: "employee claim transactions",
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((stat) => (
        <Card
          key={stat.title}
          className="overflow-hidden border border-purple-border-secondary bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-300"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-purple-bg-dark3">
                {stat.title}
              </p>
              <div className="rounded-full p-1 bg-purple-bg-light/60">
                {stat.icon}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-purple-bg-dark">
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  stat.value
                )}
              </h3>
              <span className="text-xs text-purple-bg-dark3 mt-1">
                {stat.description}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TransactionStats;
