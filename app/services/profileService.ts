import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import type { UserProfile, ID } from "@/types";

// fetch user profile
export async function getUserProfile(uid: ID): Promise<UserProfile & { id: ID } | null> {
    const docRef = doc(db, "users", uid);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) return null;
    return { id: snapshot.id as ID, ...(snapshot.data() as UserProfile) };
}

// create or update user profile
export async function upsertUserProfile(uid: ID, profile: Partial<UserProfile>) {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, profile, { merge: true });
}

// update user profile
export async function updateUserProfile(uid: ID, profile: Partial<UserProfile>) {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, profile, { merge: true });
}