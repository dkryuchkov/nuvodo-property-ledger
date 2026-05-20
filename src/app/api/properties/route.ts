import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuth, apiError, apiSuccess } from "@/lib/api-utils";
import { Property } from "@/types";

export async function GET(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) return apiError("Unauthorized", 401);

  if (!adminDb) return apiError("Database not initialized", 500);

  try {
    const propertiesSnapshot = await adminDb
      .collection("property_portfolio/portfolio/properties")
      .get();

    const properties: Property[] = propertiesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        address: data.address || "",
        name: data.name || doc.id,
        country: data.country || "",
        currency: data.currency || "USD",
        transactionCount: data.transactionCount || 0,
        draftCount: data.draftCount || 0,
        sourceCandidateCount: data.sourceCandidateCount || 0,
        incomeTotal: data.incomeTotal || 0,
        expenseTotal: data.expenseTotal || 0,
      };
    });

    return apiSuccess(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    return apiError("Internal Server Error", 500);
  }
}
