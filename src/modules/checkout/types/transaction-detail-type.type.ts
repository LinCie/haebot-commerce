/**
 * Transaction detail type enum values.
 */
export const TRANSACTION_DETAIL_TYPES = [
  "ITR",
  "SO",
  "BILL",
  "PAY",
  "PO",
  "DMG",
  "RTR",
  "TAX",
  "UNDF",
] as const;

export type TransactionDetailType = (typeof TRANSACTION_DETAIL_TYPES)[number];
