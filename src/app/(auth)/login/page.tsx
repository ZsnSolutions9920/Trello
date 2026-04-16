"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { token, user } = await authApi.login(email, password);
      setAuth(token, user);
      router.push("/");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-white px-4">
      {/* Minimal brand mark */}
      <div className="mb-10">
        <span className="text-2xl font-black tracking-tight text-ink">
          Emma
        </span>
      </div>

      <div className="w-full max-w-sm animate-fade-in-up">
        <h1 className="text-3xl font-bold text-ink mb-2">
          Welcome back
        </h1>
        <p className="text-ink-secondary text-base mb-8">
          Log in to your account to continue.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="focus-ring w-full border border-border rounded-xl px-4 py-3 text-[15px] text-ink placeholder:text-ink-tertiary transition-colors hover:border-ink-tertiary focus:border-ink"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus-ring w-full border border-border rounded-xl px-4 py-3 text-[15px] text-ink placeholder:text-ink-tertiary transition-colors hover:border-ink-tertiary focus:border-ink"
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Primary CTA — solid black, Gumroad-style */}
          <button
            type="submit"
            disabled={loading}
            className="focus-ring w-full bg-black text-white rounded-xl py-3 text-[15px] font-semibold hover:bg-neutral-800 disabled:opacity-40 transition-all duration-150 active:scale-[0.98] mt-2"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="text-sm text-ink-secondary text-center mt-8">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-ink font-semibold hover:text-accent transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
