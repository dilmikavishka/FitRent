import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import type { Product, ID } from "@/types";


export async function getAllProducts(): Promise<Record<ID, Product>> {
  const productsRef = collection(db, "catalog");
  const snapshot = await getDocs(productsRef);

  const products: Record<ID, Product> = {};
  snapshot.forEach((doc) => {
    products[doc.id as ID] = { id: doc.id as ID, ...(doc.data() as Omit<Product, "id">) };
  });

  return products;
}

export async function getProduct(id: ID): Promise<Product | null> {
  const docRef = doc(db, "catalog", id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;
  return { id: snapshot.id as ID, ...(snapshot.data() as Omit<Product, "id">) };
}
