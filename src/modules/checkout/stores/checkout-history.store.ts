import { persistentAtom } from "@nanostores/persistent";

type CheckoutHistoryItem = {
  tradeId: number;
  timestamp: string; // ISO timestamp
};

type CheckoutHistory = CheckoutHistoryItem[];

export const checkoutHistory = persistentAtom<CheckoutHistory>(
  "checkout-history",
  [],
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  },
);

export const addCheckoutHistory = (tradeId: number, timestamp: string) => {
  const history = checkoutHistory.get();
  history.push({ tradeId, timestamp });
  checkoutHistory.set([...history]);
};

export const getCheckoutHistory = (): CheckoutHistory => {
  return checkoutHistory.get();
};

export const getLatestCheckout = (): CheckoutHistoryItem | null => {
  const history = checkoutHistory.get();
  return history.length > 0 ? history[history.length - 1] : null;
};

export const clearCheckoutHistory = () => {
  checkoutHistory.set([]);
};
