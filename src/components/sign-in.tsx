'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { getUser, signIn } from "@/service/auth.service";
import Link from "next/link";
import { setCookie } from 'cookies-next';

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      await signIn(email, password);
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error("Failed to retrieve authentication token");
      }

      setCookie('firebase-token', token, {
        maxAge: 60 * 60 * 24, // Token expired in 1 day
        path: '/'
      });

      const user = await getUser(token);
      if (user) {
        router.replace("/dashboard");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow-md w-96"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <input
            type="email"
            placeholder="Email"
            className="border w-full p-2 mb-3 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="border w-full p-2 mb-3 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className={`w-full py-2 rounded cursor-pointer ${
              loading
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
          <div className="mt-4 text-center">
            <p className="text-gray-600">Don&apos;t have an account?</p>
            <Link href="/signup" className="text-blue-500 hover:underline">
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
