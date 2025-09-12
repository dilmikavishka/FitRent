import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/config/firebaseConfig";
import { UserProfile } from "@/types";

export async function signUp(email: string, password: string, profile?: Partial<UserProfile>) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;
  const ts = Date.now();

  // Save profile in Firestore
  await setDoc(doc(db, "users", uid), {
    email,
    ...profile,
    createdAt: ts,
    updatedAt: ts,
  });

  // Initialize empty subcollections for wishlists, carts, orders
  // Option 1: create documents directly
  await Promise.all([
    setDoc(doc(db, "wishlists", uid), { items: [] }),
    setDoc(doc(db, "carts", uid), { items: [] }),
    setDoc(doc(db, "orders", uid), { list: [] }),
  ]);

  return cred;
}

export async function login(email: string, password: string) {
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  return await signOut(auth);
}
