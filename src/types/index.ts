export type Property = {
  id: string;
  address: string;
  name: string;
  country: string;
  currency: string;
  transactionCount: number;
  draftCount: number;
  sourceCandidateCount: number;
  incomeTotal: number;
  expenseTotal: number;
};

export type TransactionStatus = "draft" | "posted" | "reconciled" | "excluded";
export type TransactionType = "income" | "expense" | "transfer" | "adjustment";

export type Transaction = {
  id: string;
  date: string;
  propertyId: string;
  propertyName: string;
  type: TransactionType;
  counterparty: string;
  description: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  currency: string;
  taxCode: string;
  taxAmount: number;
  status: TransactionStatus;
  sourceId?: string;
  sourceType: string;
  tags: string[];
  receiptUrl?: string;
  needsReview: boolean;
  confidence: "high" | "medium" | "low";
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
};

export type SourceFile = {
  id: string;
  propertyId: string;
  fileName: string;
  fileUrl: string;
  category: string;
  status: "metadata_only" | "needs_text_extraction" | "requires_ocr" | "amount_from_filename" | "parsed" | "imported";
  extractionConfidence: number;
  extractedAmount?: number;
  extractedDate?: string;
  extractedCounterparty?: string;
  driveLink?: string;
};

export type UserRole = "owner" | "admin" | "reviewer" | "readOnly" | "accountant";

export type UserProfile = {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  photoURL?: string;
};
