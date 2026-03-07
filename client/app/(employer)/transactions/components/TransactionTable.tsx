"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  ExternalLink,
  Copy,
  CheckCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTransactions } from "@/hooks/useTransactions";
import { formatTokenAmount } from "@/lib/utils";

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  commit: { label: "Commit", color: "bg-yellow-100 text-yellow-800" },
  fund: { label: "Fund", color: "bg-blue-100 text-blue-800" },
  freeze: { label: "Freeze", color: "bg-purple-100 text-purple-800" },
  close: { label: "Close", color: "bg-gray-100 text-gray-800" },
  claim: { label: "Claim", color: "bg-green-100 text-green-800" },
};

const EXPLORER_BASE = "https://sepolia.starkscan.co/tx/";
// Change to "https://starkscan.co/tx/" for mainnet

const formatHash = (hash: string) => `${hash.slice(0, 6)}...${hash.slice(-4)}`;

const formatDate = (dateString: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));

const TransactionTable = () => {
  const { transactions, loading } = useTransactions();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const itemsPerPage = 10;

  const filteredData = useMemo(() => {
    if (!searchTerm) return transactions;
    const term = searchTerm.toLowerCase();
    return transactions.filter(
      (tx) =>
        tx.txHash.toLowerCase().includes(term) ||
        tx.type.includes(term) ||
        tx.periodLabel.toLowerCase().includes(term) ||
        (tx.employeeName?.toLowerCase().includes(term) ?? false),
    );
  }, [transactions, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-purple-primary" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-purple-bg-dark3" />
          <Input
            type="search"
            placeholder="Search by hash, type, period, employee..."
            className="w-full pl-8 border-purple-border-secondary focus-visible:ring-purple-primary/30"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="text-sm text-purple-bg-dark3">
          Showing <span className="font-medium">{paginatedData.length}</span> of{" "}
          <span className="font-medium">{filteredData.length}</span>{" "}
          transactions
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-purple-border-secondary bg-purple-bg-light/50">
              <th className="py-3 px-4 text-left text-xs font-medium text-purple-bg-dark2 uppercase tracking-wider">
                Transaction
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-purple-bg-dark2 uppercase tracking-wider">
                Type
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-purple-bg-dark2 uppercase tracking-wider">
                Period
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-purple-bg-dark2 uppercase tracking-wider">
                Amount
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-purple-bg-dark2 uppercase tracking-wider">
                Date
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-purple-bg-dark2 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-sm text-purple-bg-dark3"
                >
                  {transactions.length === 0
                    ? "No transactions yet. Create a payroll period and run on-chain actions."
                    : "No transactions match your search."}
                </td>
              </tr>
            ) : (
              paginatedData.map((tx) => {
                const cfg = TYPE_CONFIG[tx.type] ?? TYPE_CONFIG.commit;
                const isOutgoing = tx.type !== "claim";

                return (
                  <tr
                    key={tx.id}
                    className="border-b border-purple-border-secondary hover:bg-purple-bg-light/20 transition-colors"
                  >
                    {/* Tx Hash */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-full border border-purple-border-secondary bg-purple-bg-light/50">
                          {isOutgoing ? (
                            <ArrowUpRight className="h-4 w-4 text-purple-bg-dark" />
                          ) : (
                            <ArrowDownLeft className="h-4 w-4 text-purple-primary" />
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-sm text-purple-bg-dark flex items-center">
                            {formatHash(tx.txHash)}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => copyToClipboard(tx.txHash)}
                                    className="ml-1.5 text-purple-bg-dark3 hover:text-purple-primary transition-colors"
                                  >
                                    {copiedHash === tx.txHash ? (
                                      <CheckCircle className="h-3.5 w-3.5" />
                                    ) : (
                                      <Copy className="h-3.5 w-3.5" />
                                    )}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {copiedHash === tx.txHash
                                      ? "Copied!"
                                      : "Copy hash"}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          {tx.employeeName && (
                            <div className="text-purple-bg-dark3 text-xs">
                              {tx.employeeName}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-2.5 px-4">
                      <Badge className={cfg.color} variant="outline">
                        {cfg.label}
                      </Badge>
                    </td>

                    {/* Period */}
                    <td className="py-2.5 px-4 text-sm text-purple-bg-dark2">
                      {tx.periodLabel}
                    </td>

                    {/* Amount */}
                    <td className="py-2.5 px-4">
                      <div
                        className={`text-sm font-medium ${isOutgoing ? "text-purple-bg-dark" : "text-green-600"}`}
                      >
                        {formatTokenAmount(tx.amount)} tokens
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-2.5 px-4 text-sm text-purple-bg-dark2">
                      {formatDate(tx.date)}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-4">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-purple-bg-dark2 hover:text-purple-primary hover:bg-purple-bg-light/50"
                              onClick={() =>
                                window.open(
                                  `${EXPLORER_BASE}${tx.txHash}`,
                                  "_blank",
                                )
                              }
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View on Starkscan</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-purple-border-secondary">
          <Button
            variant="outline"
            size="sm"
            className="border-purple-border-secondary text-purple-bg-dark2 hover:bg-purple-bg-light/50"
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="text-sm text-purple-bg-dark3">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-purple-border-secondary text-purple-bg-dark2 hover:bg-purple-bg-light/50"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
