import { collection, doc, setDoc, getDoc, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import type { UID, Card, ID } from "@/types";


export async function saveCard(uid: UID, card: Card) {
  const cardRef = doc(collection(db, `users/${uid}/cards`));
  const cardId = cardRef.id as ID;
  await setDoc(cardRef, { ...card, id: cardId, createdAt: Date.now() });
  return { ...card, id: cardId };
}


export async function getSavedCards(uid: UID): Promise<Card[]> {
  const snap = await getDocs(collection(db, `users/${uid}/cards`));
  const cards: Card[] = [];
  snap.forEach((d) => {
    cards.push(d.data() as Card);
  });
  return cards;
}


export async function deleteCard(uid: UID, cardId: ID) {
  await deleteDoc(doc(db, `users/${uid}/cards`, cardId));
}
