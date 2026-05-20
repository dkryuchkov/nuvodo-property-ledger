"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";
import { Transaction, Property } from "@/types";
import { useAuth } from "@/context/auth-context";
import { LedgerTable } from "@/components/ledger/ledger-table";
import { FilterPanel } from "@/components/ledger/filter-panel";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  ExternalLink, 
  History, 
  CheckCircle2, 
  XCircle, 
  Tag as TagIcon,
  Trash2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

function LedgerContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const fetchTransactions = useCallback(async (currentFilters: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/ledger/query", { 
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify(currentFilters),
      });
      if (!res.ok) throw new Error("Failed to fetch transactions");
      const data = await res.json();
      setTransactions(data);
    } catch (error) {
      console.error(error);
      toast.error("Error loading transactions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const res = await fetch("/api/properties");
        if (!res.ok) throw new Error("Failed to fetch properties");
        const propsData = await res.json();
        setProperties(propsData);

        // Get filters from URL
        const urlFilters: any = {};
        searchParams.forEach((value, key) => {
          if (key === "propertyIds" || key === "statuses" || key === "types") {
            urlFilters[key] = [value];
          } else {
            urlFilters[key] = value;
          }
        });

        await fetchTransactions(urlFilters);
      } catch (error) {
        console.error(error);
        toast.error("Error loading initial data");
      }
    };

    if (user) fetchInitialData();
  }, [user, searchParams, fetchTransactions]);

  const handleFilterChange = (newFilters: any) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.set(key, value as string);
        }
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ledger Browser</h1>
          <p className="text-slate-500">View and manage all financial transactions across your portfolio</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export CSV</Button>
          <Button className="bg-blue-600 hover:bg-blue-700">Add Transaction</Button>
        </div>
      </div>

      <FilterPanel properties={properties} onFilterChange={handleFilterChange} />

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : (
        <LedgerTable 
          transactions={transactions} 
          onRowClick={setSelectedTransaction} 
        />
      )}

      <Sheet open={!!selectedTransaction} onOpenChange={(open) => !open && setSelectedTransaction(null)}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          {selectedTransaction && (
            <div className="space-y-6 py-4">
              <SheetHeader>
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="mb-2 capitalize">
                    {selectedTransaction.status}
                  </Badge>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon"><History className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
                <SheetTitle className="text-2xl font-bold">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: selectedTransaction.currency }).format(selectedTransaction.amount)}
                </SheetTitle>
                <SheetDescription className="text-base font-medium text-slate-900">
                  {selectedTransaction.counterparty}
                </SheetDescription>
              </SheetHeader>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-slate-500 text-xs">Date</p>
                  <p className="font-medium">{selectedTransaction.date}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 text-xs">Property</p>
                  <p className="font-medium">{selectedTransaction.propertyName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 text-xs">Category</p>
                  <p className="font-medium">{selectedTransaction.categoryName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 text-xs">Type</p>
                  <Badge variant="secondary" className="capitalize">{selectedTransaction.type}</Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-slate-500 text-xs">Description</p>
                <p className="text-sm italic text-slate-700">
                  {selectedTransaction.description || "No description provided"}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-slate-500 text-xs uppercase tracking-wider font-bold">Tax Details</p>
                <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center text-sm">
                  <span>{selectedTransaction.taxCode || "No Tax Code"}</span>
                  <span className="font-mono">{new Intl.NumberFormat('en-US', { style: 'currency', currency: selectedTransaction.currency }).format(selectedTransaction.taxAmount)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-slate-500 text-xs uppercase tracking-wider font-bold">Source Document</p>
                {selectedTransaction.receiptUrl ? (
                  <div className="border rounded-lg p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer border-blue-100 bg-blue-50/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="text-sm">
                        <p className="font-medium truncate max-w-[200px]">Document Reference</p>
                        <p className="text-xs text-slate-500">Uploaded via OCR</p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-2">
                    <p className="text-sm text-slate-500">No source document linked</p>
                    <Button variant="outline" size="sm">Attach Document</Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-slate-500 text-xs uppercase tracking-wider font-bold">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTransaction.tags?.length > 0 ? (
                    selectedTransaction.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        <TagIcon className="w-3 h-3" />
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No tags</p>
                  )}
                  <Button variant="ghost" size="sm" className="h-6 text-[10px]">+ Add Tag</Button>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark Reviewed
                </Button>
                <Button variant="outline" className="flex-1 text-red-600 hover:bg-red-50 border-red-200">
                  <XCircle className="w-4 h-4 mr-2" />
                  Exclude
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function LedgerPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
      <LedgerContent />
    </Suspense>
  );
}
