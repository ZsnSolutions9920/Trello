"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

export default function TeamSetupPage() {
  const [mode, setMode] = useState<"choice" | "create" | "join">("choice");
  const [teamName, setTeamName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user, setAuth } = useAuthStore();

  const handleRestoreExistingTeam = async () => {
    setRestoring(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Session expired. Please log in again.");

      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const me = await res.json();
      if (!res.ok) throw new Error(me.error || "Could not verify account");

      if (!me.teamId) {
        throw new Error("No existing team is linked to this account.");
      }

      const updatedUser = {
        id: me.id,
        email: me.email,
        name: me.name,
        role: me.role,
        teamId: me.teamId,
      };

      setAuth(token, updatedUser);
      router.replace("/");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setRestoring(false);
    }
  };

  const handleCreate = async () => {
    if (!teamName.trim()) return;
    setLoading(true);
    setError("");
    try {
      const team = await api.team.create(teamName.trim());
      // Refresh user data with new role + teamId
      const token = localStorage.getItem("token");
      if (token && user) {
        const updatedUser = { ...user, role: "admin", teamId: team.id };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setAuth(token, updatedUser);
      }
      router.replace("/");
    } catch (err) {
      const message = (err as Error).message;
      setError(
        message.includes("already belong to a team")
          ? "This account is already in a team. Use \"Restore my team access\" below."
          : message,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;
    setLoading(true);
    setError("");
    try {
      const team = await api.team.join(inviteCode.trim());
      const token = localStorage.getItem("token");
      if (token && user) {
        const updatedUser = { ...user, role: "employee", teamId: team.id };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setAuth(token, updatedUser);
      }
      router.replace("/");
    } catch (err) {
      const message = (err as Error).message;
      setError(
        message.includes("already belong to a team")
          ? "This account is already in a team. Use \"Restore my team access\" below."
          : message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="mb-10">
          <span className="text-2xl font-black tracking-tight text-ink">Emma</span>
        </div>

        {mode === "choice" ? (
          <>
            <h1 className="text-3xl font-bold text-ink mb-2">Get started</h1>
            <p className="text-ink-secondary text-base mb-8">
              Create a new team or join an existing one.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => setMode("create")}
                className="w-full bg-black text-white rounded-xl py-3.5 text-[15px] font-semibold hover:bg-neutral-800 transition-all duration-150 active:scale-[0.98]"
              >
                Create a team
              </button>
              <button
                onClick={() => setMode("join")}
                className="w-full border-2 border-border text-ink rounded-xl py-3.5 text-[15px] font-semibold hover:border-ink-tertiary hover:bg-surface transition-all duration-150 active:scale-[0.98]"
              >
                Join with invite code
              </button>
              <button
                onClick={handleRestoreExistingTeam}
                disabled={restoring}
                className="w-full border border-border text-ink-secondary rounded-xl py-3 text-[14px] font-medium hover:text-ink hover:border-ink-tertiary hover:bg-surface transition-all duration-150 disabled:opacity-40"
              >
                {restoring ? "Restoring..." : "Restore my team access"}
              </button>
            </div>
          </>
        ) : mode === "create" ? (
          <>
            <button onClick={() => { setMode("choice"); setError(""); }} className="text-sm text-ink-secondary hover:text-ink mb-6 transition-colors">
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-ink mb-2">Create your team</h1>
            <p className="text-ink-secondary text-base mb-8">
              You will be the admin. Invite employees with a code.
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-6 border border-red-100">{error}</div>
            )}

            {error.includes("Restore my team access") && (
              <button
                onClick={handleRestoreExistingTeam}
                disabled={restoring}
                className="w-full mb-6 border border-border text-ink-secondary rounded-xl py-2.5 text-sm font-medium hover:text-ink hover:border-ink-tertiary hover:bg-surface transition-all duration-150 disabled:opacity-40"
              >
                {restoring ? "Restoring..." : "Restore my team access"}
              </button>
            )}

            <label className="block text-sm font-medium text-ink mb-1.5">Team name</label>
            <input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="focus-ring w-full border border-border rounded-xl px-4 py-3 text-[15px] text-ink placeholder:text-ink-tertiary transition-colors hover:border-ink-tertiary focus:border-ink mb-6"
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
            />
            <button
              onClick={handleCreate}
              disabled={loading || !teamName.trim()}
              className="w-full bg-black text-white rounded-xl py-3 text-[15px] font-semibold hover:bg-neutral-800 disabled:opacity-40 transition-all duration-150 active:scale-[0.98]"
            >
              {loading ? "Creating..." : "Create team"}
            </button>
          </>
        ) : (
          <>
            <button onClick={() => { setMode("choice"); setError(""); }} className="text-sm text-ink-secondary hover:text-ink mb-6 transition-colors">
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-ink mb-2">Join a team</h1>
            <p className="text-ink-secondary text-base mb-8">
              Enter the invite code from your team admin.
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-6 border border-red-100">{error}</div>
            )}

            {error.includes("Restore my team access") && (
              <button
                onClick={handleRestoreExistingTeam}
                disabled={restoring}
                className="w-full mb-6 border border-border text-ink-secondary rounded-xl py-2.5 text-sm font-medium hover:text-ink hover:border-ink-tertiary hover:bg-surface transition-all duration-150 disabled:opacity-40"
              >
                {restoring ? "Restoring..." : "Restore my team access"}
              </button>
            )}

            <label className="block text-sm font-medium text-ink mb-1.5">Invite code</label>
            <input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="e.g. AB3KM7XP"
              className="focus-ring w-full border border-border rounded-xl px-4 py-3 text-[15px] text-ink placeholder:text-ink-tertiary tracking-widest font-mono text-center transition-colors hover:border-ink-tertiary focus:border-ink mb-6"
              autoFocus
              maxLength={8}
              onKeyDown={(e) => { if (e.key === "Enter") handleJoin(); }}
            />
            <button
              onClick={handleJoin}
              disabled={loading || !inviteCode.trim()}
              className="w-full bg-black text-white rounded-xl py-3 text-[15px] font-semibold hover:bg-neutral-800 disabled:opacity-40 transition-all duration-150 active:scale-[0.98]"
            >
              {loading ? "Joining..." : "Join team"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
