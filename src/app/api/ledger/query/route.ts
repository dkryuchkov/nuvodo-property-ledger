import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuth, apiError, apiSuccess } from "@/lib/api-utils";
import { Transaction } from "@/types";
import { z } from "zod";

const querySchema = z.object({
  propertyIds: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  statuses: z.array(z.string()).optional(),
  types: z.array(z.string()).optional(),
  categoryIds: z.array(z.string()).optional(),
  searchText: z.string().optional(),
  limit: z.number().optional().default(100),
});

export async function POST(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) return apiError("Unauthorized", 401);

  if (!adminDb) return apiError("Database not initialized", 500);

  try {
    const body = await req.json();
    const filters = querySchema.parse(body);

    let query: FirebaseFirestore.Query = adminDb.collection("ledger_transactions");

    if (filters.propertyIds && filters.propertyIds.length > 0) {
      query = query.where("propertyId", "in", filters.propertyIds);
    }

    if (filters.startDate) {
      query = query.where("date", ">=", filters.startDate);
    }

    if (filters.endDate) {
      query = query.where("date", "<=", filters.endDate);
    }

    if (filters.statuses && filters.statuses.length > 0) {
      query = query.where("status", "in", filters.statuses);
    }

    if (filters.types && filters.types.length > 0) {
      query = query.where("type", "in", filters.types);
    }

    // Firestore doesn't support multiple "in" queries easily. 
    // For categories, we might need to filter client-side or use a different indexing strategy if there are many.
    // For now, we'll keep it simple and limit to 10 property/status/type filters.

    const snapshot = await query.limit(filters.limit).get();

    let transactions: Transaction[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      } as Transaction;
    });

    // Client-side filtering for complex cases or Firestore limitations
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      transactions = transactions.filter(t => filters.categoryIds!.includes(t.categoryId));
    }

    if (filters.searchText) {
      const search = filters.searchText.toLowerCase();
      transactions = transactions.filter(t => 
        t.description.toLowerCase().includes(search) || 
        t.counterparty.toLowerCase().includes(search)
      );
    }

    return apiSuccess(transactions);
  } catch (error) {
    console.error("Error querying ledger:", error);
    if (error instanceof z.ZodError) {
      return apiError(error.message, 400);
    }
    return apiError("Internal Server Error", 500);
  }
}
