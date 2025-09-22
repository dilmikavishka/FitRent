import { db } from "@/config/firebaseConfig";
import type { ID, UID } from "@/types";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc
} from "firebase/firestore";


export async function toggleWishlist(uid: UID, productId: ID, liked: boolean) {
  const ref = doc(db, `wishlists/${uid}/items/${productId}`);
  if (liked) {
    await setDoc(ref, { createdAt: Date.now() });
  } else {
    await deleteDoc(ref);
  }
}


export async function getWishlist(uid: UID): Promise<Record<ID, true>> {
  const snap = await getDocs(collection(db, `wishlists/${uid}/items`));
  const wishlist: Record<ID, true> = {};
  snap.forEach((doc) => {
    wishlist[doc.id as ID] = true;
  });
  return wishlist;
}


export function listenToWishlist(
  uid: UID,
  callback: (wishlist: Record<ID, true>) => void
) {
  const ref = collection(db, `wishlists/${uid}/items`);
  return onSnapshot(ref, (snap) => {
    const wishlist: Record<ID, true> = {};
    snap.forEach((doc) => {
      wishlist[doc.id as ID] = true;
    });
    callback(wishlist);
  });
}


export async function isInWishlist(uid: UID, productId: ID): Promise<boolean> {
  const snap = await getDocs(collection(db, `wishlists/${uid}/items`));
  return snap.docs.some((d) => d.id === productId);
}


export async function clearWishlist(uid: UID) {
  const snap = await getDocs(collection(db, `wishlists/${uid}/items`));
  const batchDeletes = snap.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(batchDeletes);
}


export async function addToWishlist(uid: UID, productId: ID) {
  const ref = doc(db, `wishlists/${uid}/items/${productId}`);
  await setDoc(ref, { createdAt: Date.now() });
}


export async function removeFromWishlist(uid: UID, productId: ID) {
  await deleteDoc(doc(db, `wishlists/${uid}/items/${productId}`));
}
