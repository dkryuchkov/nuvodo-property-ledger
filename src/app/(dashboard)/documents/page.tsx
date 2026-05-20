"use client";

import { useEffect, useState } from "react";
import { SourceFile, Property } from "@/types";
import { useAuth } from "@/context/auth-context";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Eye, 
  Download, 
  CheckCircle2, 
  PlusCircle, 
  ExternalLink,
  AlertTriangle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

export default function DocumentsPage() {
  const { user } = useAuth();
  const [files, setFiles] = useState<SourceFile[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const [propsRes, filesRes] = await Promise.all([
          fetch("/api/properties"),
          // Mocking the files endpoint for now
          Promise.resolve({ ok: true, json: () => Promise.resolve([
            {
              id: "file1",
              propertyId: "prop1",
              fileName: "rent_statement_jan_2026.pdf",
              fileUrl: "#",
              category: "Rent Statement",
              status: "parsed",
              extractionConfidence: 0.95,
              extractedAmount: 2500,
              extractedDate: "2026-01-05",
              extractedCounterparty: "John Doe",
              driveLink: "#"
            },
            {
              id: "file2",
              propertyId: "prop1",
              fileName: "repair_invoice_123.jpg",
              fileUrl: "#",
              category: "Repairs",
              status: "needs_text_extraction",
              extractionConfidence: 0.4,
              driveLink: "#"
            }
          ])})
        ]);

        if (!propsRes.ok || !filesRes.ok) throw new Error("Failed to fetch documents");
        
        const propsData = await propsRes.json();
        const filesData = await filesRes.json() as SourceFile[];
        
        setProperties(propsData);
        setFiles(filesData);
      } catch (error) {
        console.error(error);
        toast.error("Error loading documents");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDocuments();
  }, [user]);

  const getStatusBadge = (status: SourceFile["status"]) => {
    switch (status) {
      case "imported": return <Badge className="bg-green-100 text-green-700 border-green-200">Imported</Badge>;
      case "parsed": return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Parsed</Badge>;
      case "needs_text_extraction": return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Needs OCR</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Source Documents</h1>
          <p className="text-slate-500">Review and import candidates from extracted source files</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">Upload New</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{files.filter(f => f.status !== 'imported').length}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Successfully Imported</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{files.filter(f => f.status === 'imported').length}</div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">Low Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{files.filter(f => f.extractionConfidence < 0.6).length}</div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <Skeleton className="h-[400px] w-full" />
      ) : (
        <div className="rounded-md border bg-white overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Extracted Info</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      {file.fileName}
                    </div>
                  </TableCell>
                  <TableCell>
                    {properties.find(p => p.id === file.propertyId)?.name || file.propertyId}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{file.category}</Badge>
                  </TableCell>
                  <TableCell>
                    {file.extractedAmount ? (
                      <div className="text-sm">
                        <p className="font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(file.extractedAmount)}</p>
                        <p className="text-xs text-slate-500">{file.extractedDate}</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-orange-600 text-xs italic">
                        <AlertTriangle className="w-3 h-3" />
                        Awaiting Extraction
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(file.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" title="Preview"><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" title="Import"><PlusCircle className="w-4 h-4 text-blue-600" /></Button>
                      <Button variant="ghost" size="icon" title="Ignore"><CheckCircle2 className="w-4 h-4 text-slate-400" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
