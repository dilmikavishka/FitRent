import { db } from "@/config/firebaseConfig";
import type { ID, UID } from "@/types";
import { collection, deleteDoc, doc, getDocs, onSnapshot, setDoc } from "firebase/firestore";

export type CartItem = {
  productId: ID;
  size?: string;
  qty: number;
  startDate: number;
  endDate: number;
  addedAt: number;
};


export async function addToCart(uid: UID, item: CartItem) {
  const ref = doc(db, `carts/${uid}/items/${item.productId}`);
  await setDoc(ref, item, { merge: true });
}


export async function getCart(uid: UID): Promise<Record<ID, CartItem>> {
  const snap = await getDocs(collection(db, `carts/${uid}/items`));
  const cart: Record<ID, CartItem> = {};
  snap.forEach((d) => {
    cart[d.id as ID] = d.data() as CartItem;
  });
  return cart;
}

export function listenToCart(uid: UID, callback: (cart: Record<ID, CartItem>) => void) {
  const ref = collection(db, `carts/${uid}/items`);
  return onSnapshot(ref, (snap) => {
    const cart: Record<ID, CartItem> = {};
    snap.forEach((d) => {
      cart[d.id as ID] = d.data() as CartItem;
    });
    callback(cart);
  });
}

export async function removeFromCart(uid: UID, productId: ID) {
  await deleteDoc(doc(db, `carts/${uid}/items/${productId}`));
}


export async function clearCart(uid: UID) {
  const snap = await getDocs(collection(db, `carts/${uid}/items`));
  const batchDeletes = snap.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(batchDeletes);
}
