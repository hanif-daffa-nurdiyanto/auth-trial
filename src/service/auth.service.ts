import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export async function signIn(email: string, password: string) {
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function getUser(token: string) {
  const res = await fetch("/api/auth/me", {
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }

  return res.json();
}