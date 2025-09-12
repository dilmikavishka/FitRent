import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { auth } from "../config/firebaseConfig";
import LoadingScreen from "./loading";

export default function Index() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setTimeout(() => {
        if (user) {
          router.replace("/home"); 
        } else {
          router.replace("/login"); 
        }
        setChecking(false);
      }, 1200); 
    });

    return () => unsubscribe();
  }, [router]);

  if (checking) {
    return <LoadingScreen />;
  }

  return null;
}
