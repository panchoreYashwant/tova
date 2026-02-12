"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleAuthAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    const endpoint = isSignUp ? "/api/auth/signup" : "/api/auth/signin";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const payload = await response.json();
    if (!response.ok) {
      setMessage(payload.error || "Authentication failed.");
      return;
    }

    if (isSignUp) {
      setMessage("Check your email for a confirmation link.");
      return;
    }

    router.push("/events");
    router.refresh();
  };

  return (
    <>
      <Navbar />
      <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto">
        <h1 className="text-2xl font-bold text-center">
          {isSignUp ? "Create an Account" : "Welcome Back"}
        </h1>
        {message && (
          <p className="text-center text-red-600 bg-gray-200 p-2 rounded-md">
            {message}
          </p>
        )}
        <form
          onSubmit={handleAuthAction}
          className="flex-1 flex flex-col w-full justify-center gap-2 text-foreground"
        >
          <label className="text-md" htmlFor="email">
            Email
          </label>
          <input
            className="rounded-md px-4 py-2 bg-inherit border mb-6"
            name="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="you@example.com"
            required
          />
          <label className="text-md" htmlFor="password">
            Password
          </label>
          <input
            className="rounded-md px-4 py-2 bg-inherit border mb-6"
            type="password"
            name="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="••••••••"
            required
          />
          <button
            type="submit"
            className="bg-indigo-600 rounded-md px-4 py-2 text-white mb-2"
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setMessage("");
          }}
          className="text-center text-sm text-gray-600 hover:underline"
        >
          {isSignUp
            ? "Already have an account? Sign In"
            : "Don't have an account? Sign Up"}
        </button>
      </div>
    </>
  );
}
