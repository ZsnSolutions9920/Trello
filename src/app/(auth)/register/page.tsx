"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

export default function RegisterPage() {
  const [name, setName] = useState("");
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
      const { token, user } = await authApi.register(email, password, name || undefined);
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
      <div className="mb-10">
        <span className="text-2xl font-black tracking-tight text-ink">
          Boards
        </span>
      </div>

      <div className="w-full max-w-sm animate-fade-in-up">
        {/* Back to login */}
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink transition-colors mb-6"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Back to login
        </Link>

        <h1 className="text-3xl font-bold text-ink mb-2">
          Create your account
        </h1>
        <p className="text-ink-secondary text-base mb-8">
          Start organizing your projects for free.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-ink mb-1.5">
              Name <span className="text-ink-tertiary font-normal">(optional)</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="focus-ring w-full border border-border rounded-xl px-4 py-3 text-[15px] text-ink placeholder:text-ink-tertiary transition-colors hover:border-ink-tertiary focus:border-ink"
              placeholder="Your name"
            />
          </div>
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
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="focus-ring w-full bg-black text-white rounded-xl py-3 text-[15px] font-semibold hover:bg-neutral-800 disabled:opacity-40 transition-all duration-150 active:scale-[0.98] mt-2"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-sm text-ink-secondary text-center mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-ink font-semibold hover:text-accent transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
