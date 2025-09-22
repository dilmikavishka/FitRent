import { db } from "@/config/firebaseConfig";
import type { ID, Order, OrderItem, Product, UID } from "@/types";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { clearCart } from "./cartService";

function daysBetween(start: number, end: number) {
  return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
}

export async function createOrderFromCart(
  uid: UID,
  cart: Record<ID, { productId: ID; size?: string; qty: number; startDate: number; endDate: number; addedAt: number }>,
  products: Record<ID, Product>
) {
  const items: OrderItem[] = Object.values(cart).map((ci) => {
    const p = products[ci.productId];
    const days = daysBetween(ci.startDate, ci.endDate);
    const lineTotal = days * (p?.pricePerDay ?? 0) * ci.qty;

    return {
      productId: ci.productId,
      title: p?.title ?? "Product",
      image: p?.images?.[0],
      size: ci.size,
      qty: ci.qty,
      pricePerDay: p?.pricePerDay ?? 0,
      startDate: ci.startDate,
      endDate: ci.endDate,
      days,
      lineTotal,
    };
  });

  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  const deposit = Math.round(subtotal * 0.2); // 20% deposit
  const total = subtotal + deposit;

  // Generate order id
  const orderRef = doc(collection(db, `orders/${uid}/list`));
  const orderId = orderRef.id as ID;

  const order: Order = {
    id: orderId,
    userId: uid,
    items,
    subtotal,
    deposit,
    total,
    status: "pending",
    createdAt: Date.now(),
  };

  await setDoc(orderRef, order);
  await clearCart(uid);

  return order;
}

export async function getOrders(uid: UID): Promise<Record<ID, Order>> {
  const snap = await getDocs(collection(db, `orders/${uid}/list`));
  const orders: Record<ID, Order> = {};
  snap.forEach((d) => {
    orders[d.id as ID] = d.data() as Order;
  });
  return orders;
}
