"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Transaction } from "@/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { FileText, MoreHorizontal, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LedgerTableProps {
  transactions: Transaction[];
  onRowClick: (transaction: Transaction) => void;
}

export function LedgerTable({ transactions, onRowClick }: LedgerTableProps) {
  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "posted": return "bg-green-100 text-green-700 border-green-200";
      case "draft": return "bg-blue-100 text-blue-700 border-blue-200";
      case "reconciled": return "bg-purple-100 text-purple-700 border-purple-200";
      case "excluded": return "bg-slate-100 text-slate-700 border-slate-200";
      default: return "";
    }
  };

  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[100px]">Date</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Counterparty</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-slate-500">
                No transactions found.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow 
                key={transaction.id} 
                className="cursor-pointer hover:bg-muted/50 group"
                onClick={() => onRowClick(transaction)}
              >
                <TableCell className="font-medium text-xs">
                  {format(new Date(transaction.date), "dd MMM yyyy")}
                </TableCell>
                <TableCell className="text-xs">
                  {transaction.propertyName}
                </TableCell>
                <TableCell className="max-w-[150px] truncate font-medium">
                  {transaction.counterparty}
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-slate-500 text-xs">
                  {transaction.description}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] font-normal">
                    {transaction.categoryName}
                  </Badge>
                </TableCell>
                <TableCell className={cn(
                  "text-right font-bold",
                  transaction.type === "income" ? "text-green-600" : "text-slate-900"
                )}>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: transaction.currency }).format(transaction.amount)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn("capitalize text-[10px]", getStatusColor(transaction.status))}>
                      {transaction.status}
                    </Badge>
                    {transaction.needsReview && (
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                    )}
                    {transaction.receiptUrl && (
                      <FileText className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
