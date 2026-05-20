"use client";

import { useEffect, useState } from "react";
import { Property } from "@/types";
import { useAuth } from "@/context/auth-context";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { 
  Building, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  AlertCircle 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function DashboardPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch("/api/properties");
        if (!res.ok) throw new Error("Failed to fetch properties");
        const data = await res.json();
        setProperties(data);
      } catch (error) {
        console.error(error);
        toast.error("Could not load properties");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProperties();
  }, [user]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedIds(properties.map(p => p.id));
  const selectNone = () => setSelectedIds([]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Property Portfolio</h1>
          <p className="text-slate-500">Overview of your managed properties and financial status</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={selectAll}>Select All</Button>
          <Button variant="outline" size="sm" onClick={selectNone}>Clear</Button>
          <Badge variant="secondary" className="px-3 py-1 text-sm">
            {selectedIds.length} Selected
          </Badge>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant="ghost" size="sm" className="bg-white border text-xs">All NZ</Button>
        <Button variant="ghost" size="sm" className="bg-white border text-xs">All AU</Button>
        <Button variant="ghost" size="sm" className="bg-white border text-xs">All UK</Button>
        <Button variant="ghost" size="sm" className="bg-white border text-xs text-orange-600 border-orange-200 hover:bg-orange-50">Has Review Items</Button>
        <Button variant="ghost" size="sm" className="bg-white border text-xs text-blue-600 border-blue-200 hover:bg-blue-50">Has Drafts</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <Card key={property.id} className={`transition-all border-2 ${selectedIds.includes(property.id) ? "border-blue-500 shadow-md" : "border-transparent"}`}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex items-start gap-4">
                <Checkbox 
                  checked={selectedIds.includes(property.id)} 
                  onCheckedChange={() => toggleSelect(property.id)}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold">{property.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Building className="w-3 h-3" />
                    {property.address}, {property.country}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="font-mono">{property.currency}</Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    Income
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: property.currency }).format(property.incomeTotal)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3 text-red-500" />
                    Expenses
                  </p>
                  <p className="text-lg font-bold text-red-600">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: property.currency }).format(property.expenseTotal)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <FileText className="w-3 h-3" />
                  <span>{property.transactionCount} Trans.</span>
                </div>
                {property.draftCount > 0 && (
                  <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                    <span>{property.draftCount} Drafts</span>
                  </div>
                )}
                {property.sourceCandidateCount > 0 && (
                  <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{property.sourceCandidateCount} Files</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
