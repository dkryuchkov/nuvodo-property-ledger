import { NextRequest } from "next/server";
import { getFirestoreClient } from "@/lib/firestore";
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
  const session = await verifyAuth();
  if (!session) return apiError("Unauthorized", 401);

  try {
    const body = await req.json();
    const filters = querySchema.parse(body);

    const db = await getFirestoreClient(session.accessToken!);
    let query: FirebaseFirestore.Query = db.collection("ledger_transactions");

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

    const snapshot = await query.limit(filters.limit).get();

    let transactions: Transaction[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      } as Transaction;
    });

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
