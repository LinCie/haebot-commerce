import { persistentAtom } from "@nanostores/persistent";

type OrderHistoryItem = {
  tradeId: number;
  timestamp: string; // ISO timestamp
};

type OrderHistory = OrderHistoryItem[];

export const orderHistory = persistentAtom<OrderHistory>("order-history", [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export const addOrderToHistory = (tradeId: number, timestamp: string) => {
  const history = orderHistory.get();
  // Avoid duplicates
  if (!history.find((item) => item.tradeId === tradeId)) {
    history.push({ tradeId, timestamp });
    orderHistory.set([...history]);
  }
};

export const addOrdersToHistory = (
  orders: { tradeId: number; timestamp: string }[],
) => {
  const history = orderHistory.get();
  const newOrders = orders.filter(
    (order) => !history.find((item) => item.tradeId === order.tradeId),
  );
  if (newOrders.length > 0) {
    orderHistory.set([...history, ...newOrders]);
  }
};

export const getOrderHistory = (): OrderHistory => {
  return orderHistory.get();
};

export const clearOrderHistory = () => {
  orderHistory.set([]);
};
